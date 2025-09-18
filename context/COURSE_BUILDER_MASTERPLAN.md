# 🎓 COURSE BUILDER & COMPANY ASSIGNMENT - MASTER IMPLEMENTATIE PLAN

## 📋 ULTRA-ANALYSE VAN REQUIREMENTS

### 🎯 **Super Admin Moet Kunnen:**
1. **Complete Course Authoring** - Van nul een cursus bouwen
2. **Module & Lesson Management** - Hiërarchische content structuur
3. **Multi-format Content** - Video, tekst, quiz, interactive, case studies
4. **Advanced Question Builder** - Multiple choice, open vragen, matching, etc.
5. **Company Assignment** - Per bedrijf bepalen welke cursussen beschikbaar zijn
6. **Content Upload System** - Video's, documenten, afbeeldingen uploaden
7. **Preview & Testing** - Cursus testen voordat live gaat

### 🏗️ **Huidige Database Schema (Analyse)**
```
✅ Course - Basis course info (title, description, category, difficulty)
✅ Module - Course modules (title, description, duration)  
✅ CourseModule - Junction table (course_id, module_id, order)
✅ Lesson - Lesson content (title, content_type, content_data JSON)
✅ Company - Bedrijf informatie
✅ User - Gebruikers per bedrijf
❌ CompanyCourseAccess - ONTBREEKT (welke bedrijven hebben toegang)
❌ QuestionBank - ONTBREEKT (quiz vragen database)
❌ ContentFiles - ONTBREEKT (uploaded media files)
```

---

# 🚀 FASE 1: DATABASE SCHEMA UITBREIDINGEN

## 1.1 Nieuwe Database Modellen

### **A. CompanyCourseAccess Model**
```javascript
// Voor company-specific course toegang
const CompanyCourseAccess = sequelize.define('CompanyCourseAccess', {
    company_id: { type: DataTypes.INTEGER, references: 'companies' },
    course_id: { type: DataTypes.INTEGER, references: 'courses' },
    access_type: { 
        type: DataTypes.ENUM('full', 'preview', 'restricted'),
        defaultValue: 'full'
    },
    assigned_at: { type: DataTypes.DATE },
    assigned_by: { type: DataTypes.INTEGER, references: 'users' },
    expires_at: { type: DataTypes.DATE, allowNull: true }
});
```

### **B. ContentFile Model**
```javascript
// Voor uploaded media/files
const ContentFile = sequelize.define('ContentFile', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    filename: { type: DataTypes.STRING(255) },
    original_name: { type: DataTypes.STRING(255) },
    file_type: { type: DataTypes.ENUM('video', 'audio', 'image', 'document', 'pdf') },
    file_size: { type: DataTypes.BIGINT },
    file_path: { type: DataTypes.STRING(500) },
    mime_type: { type: DataTypes.STRING(100) },
    uploaded_by: { type: DataTypes.INTEGER, references: 'users' },
    company_id: { type: DataTypes.INTEGER, references: 'companies', allowNull: true }
});
```

### **C. QuestionBank Model**
```javascript
// Voor quiz vragen hergebruik
const QuestionBank = sequelize.define('QuestionBank', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    question_text: { type: DataTypes.TEXT },
    question_type: {
        type: DataTypes.ENUM(
            'multiple_choice', 'true_false', 'open_text', 
            'matching', 'fill_blanks', 'ordering', 'hotspot'
        )
    },
    options: { type: DataTypes.JSON }, // Voor multiple choice opties
    correct_answers: { type: DataTypes.JSON },
    explanation: { type: DataTypes.TEXT },
    difficulty: { type: DataTypes.ENUM('easy', 'medium', 'hard') },
    category: { type: DataTypes.STRING(100) },
    created_by: { type: DataTypes.INTEGER, references: 'users' }
});
```

### **D. Lesson Uitbreidingen**
```javascript
// Lesson content_data JSON structure examples:
// Video lesson:
{
    "video_url": "path/to/video.mp4",
    "duration": 900, // seconds
    "transcript": "...",
    "checkpoints": [{"time": 300, "question": "..."}]
}

// Quiz lesson:
{
    "questions": [
        {
            "id": 1,
            "type": "multiple_choice",
            "question": "What is the EU AI Act?",
            "options": ["A", "B", "C", "D"],
            "correct": 0,
            "explanation": "..."
        }
    ],
    "passing_score": 80,
    "max_attempts": 3
}

// Interactive lesson:
{
    "content_blocks": [
        {"type": "text", "content": "..."},
        {"type": "image", "src": "...", "caption": "..."},
        {"type": "interaction", "data": "..."}
    ]
}
```

---

# 🚀 FASE 2: SUPER ADMIN COURSE BUILDER INTERFACE

## 2.1 Course Builder Dashboard (`/admin/course-builder`)

### **Layout Structure:**
```
┌─ Sidebar Navigation ─┐ ┌─── Main Content Area ───────────────────────┐
│ Dashboard            │ │ Course Builder Dashboard                    │
│ Platform Admin       │ │                                             │
│ Companies           │ │ ┌─ Course Library ──────────────────────┐   │
│ Global Courses ★    │ │ │ [Search] [Filter] [+ Create Course]   │   │
│ Course Builder ★    │ │ │                                       │   │
│                     │ │ │ ┌─ Course Card ──┐ ┌─ Course Card ──┐ │   │
│                     │ │ │ │ EU AI Act      │ │ Risk Assessment│ │   │
│                     │ │ │ │ 3 modules      │ │ 2 modules      │ │   │
│                     │ │ │ │ [Edit][Assign] │ │ [Edit][Assign] │ │   │
│                     │ │ │ └────────────────┘ └────────────────┘ │   │
│                     │ │ └───────────────────────────────────────┘   │
│                     │ │                                             │
│                     │ │ ┌─ Quick Actions ─────────────────────────┐ │
│                     │ │ │ [Import Course] [Question Bank] [Media] │ │
│                     │ │ └─────────────────────────────────────────┘ │
└─────────────────────┘ └─────────────────────────────────────────────┘
```

## 2.2 Course Creation Wizard (`/admin/course-builder/new`)

### **Step 1: Course Information**
```
┌── Course Details ──────────────────────────────────────┐
│ Title: [EU AI Act Fundamentals                    ]    │
│ Description: [Complete introduction to...]             │
│ Category: [Compliance ▼]                              │
│ Difficulty: [Intermediate ▼]                          │
│ Est. Duration: [4] hours                               │
│ Target Audience: [All Roles ▼]                        │
│                                                        │
│ ☑️ Global Course (available to all companies)          │
│ ☐ Template Course (reusable template)                 │
│                                                        │
│ [Cancel] [Save & Continue →]                          │
└────────────────────────────────────────────────────────┘
```

### **Step 2: Module Structure**
```
┌── Course Modules ──────────────────────────────────────┐
│ Course: EU AI Act Fundamentals                         │
│                                                        │
│ ┌─ Module 1 ──────────────────────┐ [+ Add Module]    │
│ │ ⋮⋮ Introduction to AI Act        │                   │
│ │    Estimated: 60 min            │ [Edit] [Delete]   │
│ │    ┌─ Lessons ─────────────────┐ │                   │
│ │    │ 📺 What is AI Act? (15m) │ │ [+ Add Lesson]   │
│ │    │ 📄 Legal Framework (20m)  │ │                   │
│ │    │ ❓ Knowledge Check (5m)   │ │                   │
│ │    └───────────────────────────┘ │                   │
│ └─────────────────────────────────┘                   │
│                                                        │
│ ┌─ Module 2 ──────────────────────┐                   │
│ │ ⋮⋮ Risk Assessment              │                   │
│ │    Estimated: 45 min            │ [Edit] [Delete]   │
│ │    ┌─ Lessons ─────────────────┐ │                   │
│ │    │ (No lessons yet)          │ │ [+ Add Lesson]   │
│ │    └───────────────────────────┘ │                   │
│ └─────────────────────────────────┘                   │
│                                                        │
│ [⬅ Back] [Save Draft] [Continue to Content →]         │
└────────────────────────────────────────────────────────┘
```

## 2.3 Lesson Content Builder (`/admin/lesson-builder/:lessonId`)

### **Content Type Selection:**
```
┌── Lesson Content Builder ──────────────────────────────┐
│ Module: Introduction to AI Act                          │
│ Lesson: What is AI Act?                                 │
│                                                        │
│ Choose Content Type:                                   │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐      │
│ │   📺    │ │   📄    │ │   ❓    │ │   🎯    │      │
│ │  Video  │ │  Text   │ │  Quiz   │ │Interactive│     │
│ │ Lesson  │ │ Content │ │Builder  │ │ Content  │      │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘      │
│                                                        │
│ Selected: Video Lesson                                 │
│ ┌─ Video Settings ────────────────────────────────────┐ │
│ │ Upload Video: [Choose File] [Browse Media Library]  │ │
│ │ Duration: [Auto-detected: 15:30]                    │ │
│ │ Transcript: [Auto-generate] [Upload .srt]           │ │
│ │                                                      │ │
│ │ Interactive Features:                                │ │
│ │ ☑️ Progress checkpoints every 5 minutes              │ │
│ │ ☑️ Knowledge check at 7:30                          │ │
│ │ ☐ Allow speed control                               │ │
│ │ ☐ Download for offline                              │ │
│ │                                                      │ │
│ │ ┌─ Knowledge Check at 7:30 ──────────────────────┐  │ │
│ │ │ Question: "What year was the AI Act proposed?" │  │ │
│ │ │ ○ 2021  ○ 2022  ● 2021  ○ 2024                │  │ │
│ │ │ Explanation: "The EU AI Act was first..."      │  │ │
│ │ └─────────────────────────────────────────────────┘  │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                        │
│ [⬅ Back] [Preview] [Save] [Save & Next Lesson →]       │
└────────────────────────────────────────────────────────┘
```

---

# 🚀 FASE 3: ADVANCED QUIZ BUILDER

## 3.1 Quiz Question Types

### **A. Multiple Choice**
```
┌── Multiple Choice Question ────────────────────────────┐
│ Question: [What is the primary goal of the EU AI Act?]│
│                                                        │
│ Options:                                               │
│ A. [Increase AI adoption              ] ☐ Correct     │
│ B. [Regulate high-risk AI systems     ] ☑️ Correct     │
│ C. [Ban all AI technology            ] ☐ Correct     │
│ D. [Promote European AI companies     ] ☐ Correct     │
│                                                        │
│ Explanation: [The EU AI Act aims to regulate...]       │
│ Points: [10] Difficulty: [Medium ▼]                   │
│ [Delete] [Duplicate] [Move Up] [Move Down]            │
└────────────────────────────────────────────────────────┘
```

### **B. True/False**
```
┌── True/False Question ─────────────────────────────────┐
│ Statement: [AI systems are classified into risk levels]│
│                                                        │
│ Answer: ● True  ○ False                               │
│                                                        │
│ Explanation: [Yes, the AI Act defines four risk...]    │
│ Points: [5] Difficulty: [Easy ▼]                      │
│ [Delete] [Duplicate] [Move Up] [Move Down]            │
└────────────────────────────────────────────────────────┘
```

### **C. Fill in the Blanks**
```
┌── Fill in the Blanks ──────────────────────────────────┐
│ Text: The EU AI Act classifies AI systems into        │
│ [____] risk categories: [____], limited, [____], and  │
│ [____] risk.                                          │
│                                                        │
│ Blanks:                                                │
│ 1. [four    ] 2. [minimal  ] 3. [high    ] 4. [unacceptable]│
│                                                        │
│ Alternative Answers:                                   │
│ 1. [4, four] 2. [low, minimal] 3. [high] 4. [prohibited, banned]│
│                                                        │
│ Points: [15] Difficulty: [Hard ▼]                     │
│ [Delete] [Duplicate] [Move Up] [Move Down]            │
└────────────────────────────────────────────────────────┘
```

### **D. Matching Exercise**
```
┌── Matching Exercise ───────────────────────────────────┐
│ Instructions: Match the AI system to its risk category │
│                                                        │
│ Left Column:              Right Column:               │
│ ┌─ AI Systems ─────────┐  ┌─ Risk Categories ─────────┐│
│ │ • Chatbot           │  │ • Unacceptable Risk       ││
│ │ • Facial Recognition│  │ • High Risk               ││
│ │ • Spam Filter       │  │ • Limited Risk            ││
│ │ • Social Scoring    │  │ • Minimal Risk            ││
│ └─────────────────────┘  └───────────────────────────┘│
│                                                        │
│ Correct Matches:                                       │
│ Chatbot ↔ Limited Risk                               │
│ Facial Recognition ↔ High Risk                       │
│ Spam Filter ↔ Minimal Risk                           │
│ Social Scoring ↔ Unacceptable Risk                   │
│                                                        │
│ Points: [20] Difficulty: [Hard ▼]                     │
│ [Delete] [Duplicate] [Move Up] [Move Down]            │
└────────────────────────────────────────────────────────┘
```

---

# 🚀 FASE 4: COMPANY-COURSE ASSIGNMENT SYSTEEM

## 4.1 Course Assignment Interface (`/admin/course-assignments`)

### **Assignment Dashboard:**
```
┌── Course Assignment Management ────────────────────────┐
│ Manage which companies have access to which courses    │
│                                                        │
│ ┌─ Filter Options ─────────────────────────────────────┐│
│ │ Company: [All Companies ▼] Course: [All Courses ▼]  ││
│ │ Access Type: [All Types ▼] Status: [All ▼]          ││
│ └──────────────────────────────────────────────────────┘│
│                                                        │
│ ┌─ Assignment Matrix ──────────────────────────────────┐│
│ │                 │EU AI Act│Risk Mgmt│Data Privacy│  ││
│ │─────────────────┼─────────┼─────────┼────────────┤  ││
│ │TechCorp Solutions│   ✅    │    ✅   │     ❌     │  ││
│ │FinanceFirst     │   ✅    │    ❌   │     ✅     │  ││
│ │HealthTech       │   ❌    │    ✅   │     ✅     │  ││
│ └──────────────────────────────────────────────────────┘│
│                                                        │
│ [Bulk Assign] [Export Matrix] [Import Assignments]    │
│                                                        │
│ Recent Assignment Activity:                            │
│ • TechCorp assigned to "EU AI Act" - 2 hours ago     │
│ • HealthTech removed from "Risk Mgmt" - 1 day ago    │
└────────────────────────────────────────────────────────┘
```

## 4.2 Individual Course Assignment (`/admin/courses/:id/assignments`)

### **Detailed Assignment:**
```
┌── EU AI Act Fundamentals - Company Access ────────────┐
│ Course Details: 4 hours, 3 modules, 12 lessons        │
│                                                        │
│ ┌─ Assigned Companies (2) ─────────────────────────────┐│
│ │ ┌─ TechCorp Solutions ──────────────┐                ││
│ │ │ Access: Full  │ Since: Jan 15     │ [Settings] │  ││
│ │ │ Users: 25     │ Progress: 67%     │ [Remove]   │  ││
│ │ │ Certificates: 8 │ Last Activity: Today │        │  ││
│ │ └───────────────────────────────────┘                ││
│ │                                                      ││
│ │ ┌─ FinanceFirst Groep ──────────────┐                ││
│ │ │ Access: Full  │ Since: Jan 20     │ [Settings] │  ││
│ │ │ Users: 12     │ Progress: 45%     │ [Remove]   │  ││
│ │ │ Certificates: 3 │ Last Activity: Yesterday │   │  ││
│ │ └───────────────────────────────────┘                ││
│ └──────────────────────────────────────────────────────┘│
│                                                        │
│ ┌─ Available Companies (1) ────────────────────────────┐│
│ │ ┌─ HealthTech Innovations ──────────┐ [Assign] │    ││
│ │ │ Industry: Healthcare              │         │    ││
│ │ │ Users: 8 │ Relevant: High         │         │    ││
│ │ └───────────────────────────────────┘         │    ││
│ └──────────────────────────────────────────────────────┘│
│                                                        │
│ Assignment Settings:                                   │
│ Access Type: [Full ▼] Expires: [Never ▼]             │
│ Auto-assign to new users: ☑️                          │
│ Send notification: ☑️                                  │
│                                                        │
│ [⬅ Back to Courses] [Bulk Assign] [Save Changes]      │
└────────────────────────────────────────────────────────┘
```

---

# 🚀 FASE 5: CONTENT UPLOAD & MEDIA MANAGEMENT

## 5.1 Media Library (`/admin/media-library`)

### **Media Management Interface:**
```
┌── Media Library ───────────────────────────────────────┐
│ Upload and manage course content files                 │
│                                                        │
│ ┌─ Upload Area ────────────────────┐ [+ Upload Files] │
│ │     Drag & Drop Files Here       │                  │
│ │      or click to browse          │                  │
│ │                                  │                  │
│ │ Supported: MP4, PDF, DOCX, PPTX │                  │
│ │ Max size: 500MB per file        │                  │
│ └──────────────────────────────────┘                  │
│                                                        │
│ ┌─ File Library ──────────────────────────────────────┐│
│ │ [Search] [Filter by Type ▼] [Sort by Date ▼]       ││
│ │                                                      ││
│ │ ┌─ Video Files ──────────────────────────────────────┐│
│ │ │ 📹 ai_act_intro.mp4 (45MB) - Jan 15              │││
│ │ │    Duration: 15:30 │ Used in: EU AI Act Module 1  │││
│ │ │    [Preview] [Edit] [Delete] [Copy URL]          │││
│ │ │                                                   │││
│ │ │ 📹 risk_assessment.mp4 (67MB) - Jan 20           │││
│ │ │    Duration: 22:15 │ Used in: Risk Mgmt Module 2  │││
│ │ │    [Preview] [Edit] [Delete] [Copy URL]          │││
│ │ └───────────────────────────────────────────────────┘││
│ │                                                      ││
│ │ ┌─ Document Files ───────────────────────────────────┐│
│ │ │ 📄 compliance_checklist.pdf (2.1MB) - Jan 18     │││
│ │ │    Pages: 12 │ Used in: 3 courses                │││
│ │ │    [Download] [Edit] [Delete] [Copy URL]         │││
│ │ └───────────────────────────────────────────────────┘││
│ └──────────────────────────────────────────────────────┘│
│                                                        │
│ Storage Used: 245MB / 10GB                            │
│ [Bulk Actions] [Export List] [Settings]               │
└────────────────────────────────────────────────────────┘
```

---

# 🚀 FASE 6: STAP-VOOR-STAP IMPLEMENTATIE PLAN

## 📅 **Week 1: Database & Backend Foundation**

### **Dag 1-2: Database Schema**
```bash
# 1. Extend database models
server/src/models/CompanyCourseAccess.js ✨ NIEUW
server/src/models/ContentFile.js ✨ NIEUW  
server/src/models/QuestionBank.js ✨ NIEUW

# 2. Update existing models
server/src/models/Lesson.js - Extend content_data JSON schema
server/src/models/Course.js - Add assignment methods

# 3. Database migration script
server/src/scripts/migrate-course-system.js ✨ NIEUW
```

### **Dag 3-4: API Endpoints**
```bash
# Course Builder APIs
server/src/api/controllers/course-builder.controller.js ✨ NIEUW
server/src/api/routes/course-builder.routes.js ✨ NIEUW

# Endpoints to implement:
POST   /api/course-builder/courses              # Create course
GET    /api/course-builder/courses/:id          # Get course details
PUT    /api/course-builder/courses/:id          # Update course
POST   /api/course-builder/courses/:id/modules  # Add module
POST   /api/course-builder/modules/:id/lessons  # Add lesson
PUT    /api/course-builder/lessons/:id/content  # Update lesson content

# Assignment APIs
POST   /api/course-assignments/assign           # Assign course to company
DELETE /api/course-assignments/:assignmentId   # Remove assignment
GET    /api/course-assignments/matrix          # Get assignment matrix
POST   /api/course-assignments/bulk-assign     # Bulk assign

# Media APIs
POST   /api/media/upload                       # Upload media file
GET    /api/media/library                      # Get media library
DELETE /api/media/files/:id                    # Delete media file
```

### **Dag 5: Quiz Builder Backend**
```bash
# Quiz Engine
server/src/api/controllers/quiz-builder.controller.js ✨ NIEUW
server/src/services/quiz-engine.service.js ✨ NIEUW

# Question Bank APIs
GET    /api/quiz-builder/questions              # Get question bank
POST   /api/quiz-builder/questions              # Create question
PUT    /api/quiz-builder/questions/:id          # Update question
GET    /api/quiz-builder/question-types         # Get supported types
```

## 📅 **Week 2: Frontend Course Builder**

### **Dag 1-2: Course Builder Interface**
```bash
# Main Course Builder Pages
frontend/src/pages/admin/CourseBuilderDashboard.jsx ✨ NIEUW
frontend/src/pages/admin/CourseCreationWizard.jsx ✨ NIEUW
frontend/src/pages/admin/ModuleEditor.jsx ✨ NIEUW

# Core Components  
frontend/src/components/course-builder/CourseCard.jsx ✨ NIEUW
frontend/src/components/course-builder/ModuleBuilder.jsx ✨ NIEUW
frontend/src/components/course-builder/LessonBuilder.jsx ✨ NIEUW
frontend/src/components/course-builder/ContentEditor.jsx ✨ NIEUW
```

### **Dag 3: Content Type Builders**
```bash
# Content Type Components
frontend/src/components/content-builders/VideoLessonBuilder.jsx ✨ NIEUW
frontend/src/components/content-builders/TextContentBuilder.jsx ✨ NIEUW
frontend/src/components/content-builders/InteractiveBuilder.jsx ✨ NIEUW
frontend/src/components/content-builders/CaseStudyBuilder.jsx ✨ NIEUW

# Rich Text Editor Integration
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-image
```

### **Dag 4-5: Quiz Builder Interface**
```bash
# Quiz Components
frontend/src/components/quiz-builder/QuizBuilder.jsx ✨ NIEUW
frontend/src/components/quiz-builder/QuestionEditor.jsx ✨ NIEUW
frontend/src/components/quiz-builder/QuestionTypes/ ✨ NIEUW FOLDER
  ├── MultipleChoiceBuilder.jsx
  ├── TrueFalseBuilder.jsx  
  ├── FillBlanksBuilder.jsx
  ├── MatchingBuilder.jsx
  └── OpenTextBuilder.jsx

# Question Bank Interface
frontend/src/components/quiz-builder/QuestionBank.jsx ✨ NIEUW
frontend/src/components/quiz-builder/QuestionSearch.jsx ✨ NIEUW
```

## 📅 **Week 3: Company Assignment System**

### **Dag 1-2: Assignment Interface**
```bash
# Assignment Management
frontend/src/pages/admin/CourseAssignments.jsx ✨ NIEUW
frontend/src/components/assignments/AssignmentMatrix.jsx ✨ NIEUW
frontend/src/components/assignments/CompanySelector.jsx ✨ NIEUW
frontend/src/components/assignments/BulkAssignment.jsx ✨ NIEUW
```

### **Dag 3: Media Library Frontend**
```bash
# Media Management
frontend/src/pages/admin/MediaLibrary.jsx ✨ NIEUW
frontend/src/components/media/FileUploader.jsx ✨ NIEUW
frontend/src/components/media/MediaBrowser.jsx ✨ NIEUW
frontend/src/components/media/MediaPreview.jsx ✨ NIEUW

# File Upload with Progress
npm install react-dropzone
```

### **Dag 4-5: Integration & Testing**
```bash
# Integration Components
frontend/src/hooks/useCourseBuilder.js ✨ NIEUW
frontend/src/hooks/useMediaLibrary.js ✨ NIEUW
frontend/src/contexts/CourseBuilderContext.jsx ✨ NIEUW
```

---

# 🎯 FASE 7: COMPLETE SUPER ADMIN WORKFLOW

## 7.1 End-to-End Course Creation Process

### **Step 1: Super Admin Course Creation**
```
1. Login als Super Admin
2. Ga naar "Global Courses" → "Course Builder"
3. Klik "Create New Course"
4. Vul course details in:
   ✓ Title: "EU AI Act voor Nederlandse Bedrijven"
   ✓ Category: "Compliance" 
   ✓ Difficulty: "Intermediate"
   ✓ Target: "All Roles"
   ✓ Global Course: ☑️
```

### **Step 2: Module Structure Building**
```
1. Add Module 1: "Inleiding EU AI Act"
   - Est. Duration: 45 min
   
2. Add Module 2: "Risicoanalyse in de Praktijk"  
   - Est. Duration: 60 min
   
3. Add Module 3: "Compliance Implementation"
   - Est. Duration: 75 min

4. Drag & drop to reorder if needed
```

### **Step 3: Lesson Content Creation**
```
Module 1: Inleiding EU AI Act
├── Lesson 1.1: "Wat is de EU AI Act?" (Video - 15 min)
│   ├── Upload video: ai_act_overview.mp4
│   ├── Add transcript (auto-generated)
│   ├── Knowledge checkpoint at 8:30
│   └── Multiple choice question at end
│
├── Lesson 1.2: "Waarom Compliance?" (Text + Interactive - 20 min)
│   ├── Rich text content with images
│   ├── Interactive decision tree
│   └── Case study exercise
│
└── Lesson 1.3: "Knowledge Check" (Quiz - 10 min)
    ├── 5 Multiple choice questions
    ├── 3 True/False questions  
    ├── 1 Matching exercise
    └── Passing score: 80%
```

### **Step 4: Company Assignment**
```
1. Go to Course Assignments
2. Select "EU AI Act voor Nederlandse Bedrijven"
3. Assign to companies:
   ✓ TechCorp Solutions (Full Access)
   ✓ FinanceFirst (Full Access) 
   ✓ HealthTech (Preview Only - Trial)
4. Set auto-assignment for new users: ☑️
5. Schedule launch notification
```

---

# 🔧 IMPLEMENTATIE VOLGORDE (PRIORITEIT)

## **🔥 KRITIEKE PRIORITEIT (Week 1)**
1. **Database Schema Extensions**
   - CompanyCourseAccess model
   - ContentFile model  
   - Lesson content_data schema definitie

2. **Basic Course Builder API**
   - Course CRUD endpoints
   - Module management endpoints
   - Basic lesson management

3. **Super Admin Course Builder UI**
   - Course creation form
   - Module management interface
   - Basic lesson editor

## **📈 HOGE PRIORITEIT (Week 2)**
4. **Content Type Builders**
   - Video lesson builder
   - Text/Rich content editor
   - Basic quiz builder (MC + True/False)

5. **Company Assignment System**
   - Assignment interface
   - Company-course linking
   - Assignment matrix view

## **🎯 MEDIUM PRIORITEIT (Week 3)**
6. **Advanced Quiz Builder**
   - Fill in blanks
   - Matching exercises
   - Question bank system

7. **Media Management**
   - File upload system
   - Media library
   - File organization

## **✨ NICE-TO-HAVE (Week 4+)**
8. **Advanced Features**
   - Interactive content builder
   - Content templates
   - Bulk operations
   - Advanced analytics per course/company

---

# 📊 VERWACHTE EINDRESULTAAT

### **Super Admin Dashboard Flow:**
```
Super Admin Login
    ↓
Dashboard (Platform Overview)
    ├── Platform Admin (System Stats)
    ├── Companies (Company Management)  
    ├── Global Courses ★ (Course Library)
    │   ├── Course Builder (Create/Edit Courses)
    │   ├── Content Library (Media Management)
    │   ├── Question Bank (Quiz Questions)
    │   └── Course Assignments (Company Linking)
    │
    └── Analytics (Platform-wide Reporting)
```

### **Complete Feature Set:**
✅ **Course Authoring** - Complete course builder met alle content types
✅ **Multi-Company Support** - Per bedrijf course toegang beheren  
✅ **Rich Content** - Video, text, interactive, quizzes, case studies
✅ **Advanced Quizzes** - 7+ vraagtypen met uitgebreide opties
✅ **Media Management** - Upload en organiseer alle course content
✅ **Assignment Control** - Flexibele company-course koppelingen
✅ **Preview System** - Test courses voordat ze live gaan
✅ **Analytics Integration** - Track usage per company/course

---

# ⚡ QUICK START IMPLEMENTATION

### **Immediate Next Steps:**
1. **Database Models** - Implementeer 3 nieuwe models (30 min)
2. **Basic API Endpoints** - Course builder controller (1 uur)
3. **Course Builder UI** - Basis interface (2 uur)
4. **Module Management** - Drag & drop modules (1 uur)
5. **Company Assignment** - Assignment matrix (1.5 uur)

**Total Estimated Time: 6 uur voor MVP course builder**

### **Commands to Execute:**
```bash
# 1. Database setup
cd server && npm run create-course-models

# 2. Start building
# Backend: Implement controllers
# Frontend: Build course builder UI
# Integration: Connect everything
```

**Dit plan geeft je een complete course authoring platform waar je als Super Admin alles kunt bouwen en per bedrijf kunt toewijzen!**