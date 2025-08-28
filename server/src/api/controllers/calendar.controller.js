const { CalendarEvent, User, Course } = require('../../models');
const { Op, Sequelize } = require('sequelize');

// Get calendar events for the authenticated user
const getEvents = async (req, res) => {
  try {
    const userId = req.user.id;
    const { start, end, type } = req.query;

    const where = {
      [Op.or]: [
        { userId },
        { userId: null } // Include global events
      ]
    };

    // Add date range filter if provided
    if (start || end) {
      where.eventDate = {};
      if (start) where.eventDate[Op.gte] = new Date(start);
      if (end) where.eventDate[Op.lte] = new Date(end);
    }

    // Add type filter if provided
    if (type) {
      where.eventType = type;
    }

    const events = await CalendarEvent.findAll({
      where,
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title']
        }
      ],
      order: [['eventDate', 'ASC']]
    });

    // Transform events for calendar display
    const transformedEvents = events.map(event => ({
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.eventDate,
      time: event.eventTime,
      type: event.eventType,
      isRecurring: event.isRecurring,
      recurringPattern: event.recurringPattern,
      reminder: event.reminderEnabled,
      reminderTime: event.reminderTime,
      location: event.location,
      course: event.course,
      metadata: event.metadata,
      createdAt: event.createdAt
    }));

    res.json({
      success: true,
      data: transformedEvents
    });
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch calendar events'
    });
  }
};

// Get upcoming events (next 7 days)
const getUpcomingEvents = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const events = await CalendarEvent.findAll({
      where: {
        [Op.or]: [
          { userId },
          { userId: null } // Include global events
        ],
        eventDate: {
          [Op.between]: [today, nextWeek]
        }
      },
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title']
        }
      ],
      order: [['eventDate', 'ASC'], ['eventTime', 'ASC']],
      limit: 10
    });

    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch upcoming events'
    });
  }
};

// Create a new calendar event
const createEvent = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      title,
      description,
      eventDate,
      eventTime,
      eventType,
      courseId,
      isRecurring,
      recurringPattern,
      reminderEnabled,
      reminderTime,
      location,
      metadata
    } = req.body;

    // Validate required fields
    if (!title || !eventDate || !eventType) {
      return res.status(400).json({
        success: false,
        message: 'Title, event date, and event type are required'
      });
    }

    const event = await CalendarEvent.create({
      userId,
      courseId,
      title,
      description,
      eventDate: new Date(eventDate),
      eventTime,
      eventType,
      isRecurring: isRecurring || false,
      recurringPattern,
      reminderEnabled: reminderEnabled || false,
      reminderTime,
      location,
      metadata
    });

    // Fetch the created event with associations
    const createdEvent = await CalendarEvent.findByPk(event.id, {
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title']
        }
      ]
    });

    res.status(201).json({
      success: true,
      data: createdEvent
    });
  } catch (error) {
    console.error('Error creating calendar event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create calendar event'
    });
  }
};

// Update a calendar event
const updateEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;
    const updates = req.body;

    // Find the event
    const event = await CalendarEvent.findOne({
      where: { id: eventId, userId }
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Update the event
    await event.update(updates);

    // Fetch updated event with associations
    const updatedEvent = await CalendarEvent.findByPk(event.id, {
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title']
        }
      ]
    });

    res.json({
      success: true,
      data: updatedEvent
    });
  } catch (error) {
    console.error('Error updating calendar event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update calendar event'
    });
  }
};

// Delete a calendar event
const deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    const event = await CalendarEvent.findOne({
      where: { id: eventId, userId }
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    await event.destroy();

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete calendar event'
    });
  }
};

// Get calendar statistics
const getCalendarStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    // Count events by type for this month
    const eventStats = await CalendarEvent.findAll({
      attributes: [
        'eventType',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      where: {
        [Op.or]: [
          { userId },
          { userId: null }
        ],
        eventDate: {
          [Op.between]: [thisMonth, nextMonth]
        }
      },
      group: ['eventType']
    });

    // Count upcoming events
    const upcomingCount = await CalendarEvent.count({
      where: {
        [Op.or]: [
          { userId },
          { userId: null }
        ],
        eventDate: {
          [Op.gte]: today
        }
      }
    });

    // Count overdue deadlines
    const overdueCount = await CalendarEvent.count({
      where: {
        [Op.or]: [
          { userId },
          { userId: null }
        ],
        eventDate: {
          [Op.lt]: today
        },
        eventType: 'deadline'
      }
    });

    res.json({
      success: true,
      data: {
        monthlyStats: eventStats,
        upcomingEvents: upcomingCount,
        overdueDeadlines: overdueCount,
        currentMonth: thisMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      }
    });
  } catch (error) {
    console.error('Error fetching calendar statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch calendar statistics'
    });
  }
};

// Create events for course assignments (Admin/Manager only)
const createCourseEvents = async (req, res) => {
  try {
    const { courseId, companyId, departmentId, dueDate } = req.body;

    // Validate required fields
    if (!courseId || !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Course ID and due date are required'
      });
    }

    // Get the course
    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Get users to create events for
    const whereClause = {};
    if (companyId) whereClause.companyId = companyId;
    if (departmentId) whereClause.departmentId = departmentId;

    const users = await User.findAll({
      where: whereClause,
      attributes: ['id']
    });

    // Create events for each user
    const events = await Promise.all(
      users.map(user =>
        CalendarEvent.create({
          userId: user.id,
          courseId,
          title: `${course.title} - Due Date`,
          description: `Complete the course "${course.title}" by this date`,
          eventDate: new Date(dueDate),
          eventType: 'deadline',
          reminderEnabled: true,
          reminderTime: 24, // 24 hours before
          metadata: {
            courseId,
            companyId,
            departmentId
          }
        })
      )
    );

    res.status(201).json({
      success: true,
      message: `Created ${events.length} calendar events for course assignment`,
      data: {
        eventsCreated: events.length,
        courseTitle: course.title,
        dueDate
      }
    });
  } catch (error) {
    console.error('Error creating course events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create course events'
    });
  }
};

module.exports = {
  getEvents,
  getUpcomingEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getCalendarStats,
  createCourseEvents
};