const Company = require('./Company');
const Department = require('./Department');
const User = require('./User');
const Course = require('./Course');
const Module = require('./Module');
const CourseModule = require('./CourseModule');
const Lesson = require('./Lesson');
const CourseAssignment = require('./CourseAssignment');
const UserProgress = require('./UserProgress');
const Certificate = require('./Certificate');
const Notification = require('./Notification');
const CalendarEvent = require('./CalendarEvent');
const ReportSchedule = require('./ReportSchedule');
const ContentUpload = require('./ContentUpload');

// Define associations

// Company associations
Company.hasMany(Department, { foreignKey: 'company_id', as: 'departments' });
Company.hasMany(User, { foreignKey: 'company_id', as: 'users' });
Company.hasMany(CourseAssignment, { foreignKey: 'company_id', as: 'courseAssignments' });

// Department associations
Department.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });
Department.hasMany(User, { foreignKey: 'department_id', as: 'users' });
Department.hasMany(CourseAssignment, { foreignKey: 'department_id', as: 'courseAssignments' });

// User associations
User.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });
User.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });
User.hasMany(UserProgress, { foreignKey: 'user_id', as: 'progress' });
User.hasMany(Certificate, { foreignKey: 'user_id', as: 'certificates' });

// Course associations
Course.belongsToMany(Module, { 
    through: CourseModule, 
    foreignKey: 'course_id',
    otherKey: 'module_id',
    as: 'modules' 
});
Course.hasMany(CourseAssignment, { foreignKey: 'course_id', as: 'assignments' });
Course.hasMany(Certificate, { foreignKey: 'course_id', as: 'certificates' });

// Module associations
Module.belongsToMany(Course, { 
    through: CourseModule, 
    foreignKey: 'module_id',
    otherKey: 'course_id',
    as: 'courses' 
});
Module.hasMany(Lesson, { foreignKey: 'module_id', as: 'lessons' });

// Lesson associations
Lesson.belongsTo(Module, { foreignKey: 'module_id', as: 'module' });
Lesson.hasMany(UserProgress, { foreignKey: 'lesson_id', as: 'progress' });

// CourseAssignment associations
CourseAssignment.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });
CourseAssignment.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });
CourseAssignment.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });

// UserProgress associations
UserProgress.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
UserProgress.belongsTo(Lesson, { foreignKey: 'lesson_id', as: 'lesson' });

// Certificate associations
Certificate.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Certificate.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });

// Notification associations
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });

// CalendarEvent associations
CalendarEvent.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
CalendarEvent.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });
CalendarEvent.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });
CalendarEvent.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });
CalendarEvent.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
User.hasMany(CalendarEvent, { foreignKey: 'user_id', as: 'events' });
User.hasMany(CalendarEvent, { foreignKey: 'created_by', as: 'createdEvents' });
Course.hasMany(CalendarEvent, { foreignKey: 'course_id', as: 'events' });
Company.hasMany(CalendarEvent, { foreignKey: 'company_id', as: 'events' });
Department.hasMany(CalendarEvent, { foreignKey: 'department_id', as: 'events' });

// ReportSchedule associations
ReportSchedule.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
ReportSchedule.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });
ReportSchedule.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });
User.hasMany(ReportSchedule, { foreignKey: 'user_id', as: 'reportSchedules' });
Company.hasMany(ReportSchedule, { foreignKey: 'company_id', as: 'reportSchedules' });
Department.hasMany(ReportSchedule, { foreignKey: 'department_id', as: 'reportSchedules' });

// ContentUpload associations
ContentUpload.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });
ContentUpload.belongsTo(Module, { foreignKey: 'module_id', as: 'module' });
ContentUpload.belongsTo(Lesson, { foreignKey: 'lesson_id', as: 'lesson' });
ContentUpload.belongsTo(User, { foreignKey: 'uploaded_by', as: 'uploader' });
Course.hasMany(ContentUpload, { foreignKey: 'course_id', as: 'uploads' });
Module.hasMany(ContentUpload, { foreignKey: 'module_id', as: 'uploads' });
Lesson.hasMany(ContentUpload, { foreignKey: 'lesson_id', as: 'uploads' });
User.hasMany(ContentUpload, { foreignKey: 'uploaded_by', as: 'uploads' });

module.exports = {
    Company,
    Department,
    User,
    Course,
    Module,
    CourseModule,
    Lesson,
    CourseAssignment,
    UserProgress,
    Certificate,
    Notification,
    CalendarEvent,
    ReportSchedule,
    ContentUpload
};