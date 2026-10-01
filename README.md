# 🇩🇪 German Learning Platform — Backend

## ⚠️ License

This project is **not open source**.

The source code is publicly available for viewing and educational/reference purposes only. Unauthorized copying, modification, redistribution, or commercial use is not permitted without prior written permission.

See the [LICENSE](./LICENSE) file for details.

A scalable and production-oriented backend for a **German Language Learning Platform** built with **Node.js, TypeScript, Express.js, PostgreSQL, Prisma, AI, Cloudinary, and Python-based Text-to-Speech**.

The platform is designed to provide structured German learning from **A1/A2/B1/B2 levels**, interactive exercises, progress tracking, AI-powered writing evaluation, speaking practice, premium content, and complete admin content management.

---
## 📸 Project Preview

<img src="./images/diagram (3).png" alt="German Learning Platform" width="900"/>
---

## 🚀 Features

### 🔐 Authentication & Authorization

* User registration and login
* JWT-based authentication
* Protected routes
* Role-based authorization
* `USER` and `ADMIN` roles
* Admin-only routes
* Email verification support
* Password reset support
* Google authentication support
* Secure authentication middleware
* Token validation and expiration handling

---

## 📚 Learning Management System

The learning structure follows:

```text
Learning Level
   ↓
Book
   ↓
Chapter
   ↓
Learning Activities
```

### Learning Levels

* Level management
* Book management
* Chapter management
* Admin CRUD operations
* Public learning content APIs

### Chapter Structure

Each chapter can contain:

* 📖 Vocabulary
* 📘 Grammar
* 🎧 Listening
* ✍️ Schreiben
* 🧩 Sentence Building
* 🗣️ Sprechen

Chapter sections are also supported, for example:

```text
Kapitel 1
Kapitel 1.1
Kapitel 1.2
```

---

# 📖 Vocabulary System

The vocabulary module supports:

* German words
* English meanings
* Articles
* Plural forms
* Audio pronunciation
* Vocabulary exercises
* Multiple exercise types

### Exercise Types

```text
GERMAN_TO_ENGLISH
ENGLISH_TO_GERMAN
MULTIPLE_CHOICE
```

### 🔊 Text-to-Speech

German vocabulary pronunciation is generated using:

* Python
* gTTS
* German language speech generation
* Cloudinary audio storage

Generated audio files are automatically uploaded and managed through Cloudinary.

---

# 📘 Grammar System

The grammar module supports:

* Grammar topics
* Grammar explanations
* Rules
* Examples
* Common mistakes
* Video resources
* Grammar questions
* User submissions
* Automatic score calculation

### Question Types

```text
MULTIPLE_CHOICE
FILL_IN_THE_GAP
```

Each submission stores:

* User answer
* Correctness
* Score
* Submission time

---

# 🎧 Listening System

Listening exercises support:

* Audio files
* Optional transcripts
* Multiple tasks per exercise
* Different question types
* User submissions
* Automatic scoring

### Task Types

```text
MULTIPLE_CHOICE
FILL_IN_THE_GAP
LISTEN_AND_WRITE
```

Audio files are stored using Cloudinary.

---

# ✍️ Schreiben / Writing System

The writing module supports:

* Fill-in-the-gap
* Email writing
* Short message writing
* Minimum/maximum word limits
* User submissions
* Automatic evaluation
* Feedback
* Score calculation

## 🤖 AI Writing Evaluation

Writing tasks such as emails and short messages are evaluated using **Google Gemini AI**.

The evaluation considers:

```text
Task Fulfillment       40%
Grammar                30%
Vocabulary             20%
Spelling/Punctuation   10%
```

The AI can provide:

* Score
* Feedback
* Corrected German text
* Grammar feedback
* Vocabulary feedback
* Explanation in English

The evaluation prompt is designed to avoid unnecessarily changing correct vocabulary, meaning, or tense.

---

# 🧩 Sentence Building

The Sentence Building module allows users to construct German sentences from provided words.

Features:

* Sentence exercises
* Ordered task numbers
* Word collections
* Correct answers
* Explanations
* User submissions
* Automatic correctness checking
* Score tracking

---

# 🗣️ Sprechen / Speaking System

The speaking module supports:

### Speaking Practice Types

```text
TOPIC
QUESTION
AI_CONVERSATION
```

Features include:

* Speaking topics
* Questions
* User audio submissions
* Transcripts
* Scores
* Grammar feedback
* Vocabulary feedback
* AI conversation structure
* Conversation messages
* Speaking history

The architecture is prepared for AI-powered German conversation practice.

---

# 📊 Progress Tracking

The platform includes a complete learning progress system.

### User Progress

Tracks:

* Chapter progress
* Overall progress
* Completed tasks
* Scores
* Skill progress

### Supported Skills

```text
GRAMMAR
SCHREIBEN
LISTENING
VOCABULARY
SENTENCE_BUILDING
SPRECHEN
```

---

# 📅 Daily Activity & Streak System

The platform tracks daily learning activity.

Statistics include:

* Completed tasks
* Study minutes
* Grammar activity
* Schreiben activity
* Listening activity
* Vocabulary activity
* Sentence Building activity
* Speaking activity

### Streak System

Tracks:

* Current streak
* Longest streak
* Last active date

---

# 🏆 Achievement System

Users can unlock achievements based on their learning activity.

Available achievements include:

```text
FIRST_LESSON
FIRST_GRAMMAR
FIRST_VOCABULARY
FIRST_LISTENING
FIRST_WRITING
FIRST_SENTENCE
FIRST_SPEAKING
10_TASKS
50_TASKS
7_DAY_STREAK
```

Duplicate task submissions are prevented from incorrectly increasing achievement progress.

---

# ⏱️ Study Session Tracking

Study sessions track:

* Start time
* End time
* Duration
* Learning skill

Activity records are stored for historical progress and statistics.

---

# 🔓 Chapter Access & Learning Progression

The platform includes chapter access control.

### Access Types

```text
FREE
PREMIUM
```

Chapter progression requires users to complete the previous required chapter with at least:

```text
80% overall progress
```

Premium chapters additionally require an active premium subscription.

Administrators can access learning content regardless of normal user progression restrictions.

---

# 💳 Subscription System

The backend includes subscription logic for premium learning content.

Supported subscription states:

```text
ACTIVE
EXPIRED
CANCELLED
```

Payment states:

```text
PENDING
COMPLETED
FAILED
REFUNDED
```

The system checks whether a user currently has an active premium subscription before allowing access to premium content.

> Payment gateway integration is planned separately after the main platform deployment.

---

# 📝 Blog System

The platform includes a complete blog management system.

Features:

* Blog creation
* Blog update
* Blog deletion
* Draft/published status
* Slug-based URLs
* Categories
* Tags
* Cover images
* Publication date
* Author relationship
* Blog likes
* Like status checking

### Blog API Structure

```text
GET     /api/blogs
GET     /api/blogs/slug/:slug
GET     /api/blogs/admin/all
POST    /api/blogs
PATCH   /api/blogs/:id
DELETE  /api/blogs/:id
POST    /api/blogs/:id/like
DELETE  /api/blogs/:id/like
GET     /api/blogs/:id/like-status
```

---

# 🇩🇪 Ausbildung Information System

The platform includes an Ausbildung information module.

Each Ausbildung can contain:

* Name
* Description
* Image
* Application documents
* Visa documents
* Required/optional document status
* Ordering

The module supports complete admin CRUD operations.

---

# 🛂 Visa Checklist

The Visa Checklist module provides structured visa information.

Structure:

```text
Visa Checklist
   ↓
Category
   ↓
Checklist Items
```

Supports:

* Categories
* Checklist items
* Required/optional documents
* Admin management
* Cascade deletion

---

# 🛠️ Our Services

The platform contains a dedicated services module.

Services can include:

* General services
* Exam-related services
* Exam names/options
* Descriptions
* Images
* Ordering
* Active/inactive status

Admin users can manage services through CRUD APIs.

---

# 👥 Our Members

A separate Our Members module is available for the website.

Member information can contain:

* Name
* Language
* Role
* Short description
* Profile image
* Display order

This module is intentionally separate from the Services module.

---

# 🏠 Home API

A dedicated Home API aggregates the main website content.

The home response can include:

```text
Learning Levels
Blogs
Ausbildung
Our Services
Our Members
```

The home structure is designed for the frontend to consume major homepage sections through a single API.

---

# 👤 User Dashboard

Authenticated users have access to:

```text
GET /api/user/dashboard
```

Dashboard information includes:

* User information
* Profile
* Overall learning progress
* Skill progress
* Subscription status
* Premium status
* Subscription end date
* Recent activities
* Daily activity statistics
* Achievements
* Recent learning data

---

# 🛠️ Admin Dashboard

Administrators have access to:

```text
GET /api/admin/dashboard
```

The dashboard provides platform statistics including:

### Users

* Total users
* Recent users

### Learning Content

* Levels
* Books
* Chapters

### Website Content

* Blogs
* Published blogs
* Ausbildung
* Services
* Members

### Subscription

* Subscription statistics
* Active subscriptions

### Payments

* Payment statistics
* Recent payments

### Management

Individual modules provide admin CRUD APIs for managing platform content.

---

# ☁️ Cloudinary Integration

Cloudinary is used for media storage.

Managed media includes:

* Vocabulary audio
* Listening audio
* Speaking audio
* Ausbildung images
* Blog cover images
* Profile/avatar images

Upload validation includes:

* File size limits
* Allowed MIME types
* Separate image/audio handling

---

# 🤖 AI Integration

Google Gemini is integrated using the Google GenAI SDK.

Used for:

* AI-powered writing evaluation
* Writing feedback
* Corrected German text
* Grammar analysis
* Vocabulary feedback
* Speaking/AI conversation architecture

Current AI model:

```text
gemini-2.5-flash
```

---

# 🔊 Speech Technology

German pronunciation generation uses:

```text
Python
   ↓
gTTS
   ↓
German Audio
   ↓
Cloudinary
```

This provides pronunciation audio for vocabulary learning.

---

# 🛡️ Error Handling

A centralized global error-handling system has been implemented.

### Supported Errors

* Application errors
* 404 route errors
* Prisma validation errors
* Prisma known request errors
* Multer errors
* JavaScript errors

### Prisma Error Handling

Handled Prisma cases include:

```text
P2002 → Duplicate record → 409
P2025 → Record not found → 404
P2003 → Foreign key error → 400
P2014 → Relation violation → 400
P2023 → Invalid ID/data → 400
```

Development environments can expose stack traces for debugging, while production responses hide internal error details.

---

# 🔐 Security

Implemented security measures include:

* JWT authentication
* Role-based authorization
* Admin route protection
* Helmet security headers
* CORS configuration
* JSON request size limits
* URL-encoded request size limits
* Rate limiting
* File upload validation
* Environment variable protection
* Password exclusion from API responses
* Production error detail protection

---

# 💥 Crash Protection

The backend handles process-level failures including:

```text
uncaughtException
unhandledRejection
```

Fatal errors trigger controlled shutdown instead of leaving the application in an uncertain state.

---

# 🔄 Graceful Shutdown

The server supports graceful shutdown through:

```text
SIGINT
SIGTERM
```

Shutdown process:

```text
Stop accepting new requests
        ↓
Close HTTP server
        ↓
Disconnect Prisma
        ↓
Exit process
```

This helps prevent unfinished connections and database resources from being left open during shutdown or deployment.

---

# 🗄️ Database

Database:

```text
PostgreSQL
```

Database hosting:

```text
Neon PostgreSQL
```

ORM:

```text
Prisma 7.9.1
```

Adapter:

```text
@prisma/adapter-pg
```

The project uses a custom generated Prisma client.

---

# 🏗️ Technology Stack

### Backend

* Node.js
* TypeScript
* Express.js 5
* PostgreSQL
* Prisma ORM
* Neon PostgreSQL

### Authentication

* JWT
* Role-based access control

### AI

* Google Gemini
* Google GenAI SDK

### Audio

* Python
* gTTS

### Storage

* Cloudinary
* Multer

### Development & Testing

* Postman
* Git
* GitHub
* tsx

---

# 📁 Project Architecture

The backend follows a modular architecture:

```text
src/
│
├── config/
│
├── generated/
│
├── lib/
│
├── middleware/
├── middlewares/
│
├── modules/
│   │
│   ├── auth/
│   ├── user/
│   ├── learning/
│   │   ├── grammar/
│   │   ├── vocabulary/
│   │   ├── listening/
│   │   ├── writing/
│   │   ├── sentence/
│   │   ├── speaking/
│   │   └── achievement/
│   │
│   ├── ausbildung/
│   ├── blog/
│   ├── visa-checklist/
│   ├── our-services/
│   ├── subscription/
│   └── home/
│
├── app.ts
└── server.ts
```

---

# 🔌 API Structure

Main API groups:

```text
/api/auth
/api/user
/api/user/dashboard
/api/user/achievements

/api/learning/levels
/api/learning/books
/api/learning/chapters
/api/learning/grammar
/api/learning/vocabulary
/api/learning/listening
/api/learning/writing
/api/learning/sentence
/api/learning/speaking

/api/ausbildung
/api/blogs
/api/visa-checklist
/api/our-services
/api/our-members

/api/subscriptions

/api/home

/api/admin/dashboard
```

---

# 🧪 API Testing

The backend APIs have been extensively tested using **Postman**.

Testing covered:

* Authentication
* Authorization
* CRUD operations
* Learning modules
* User progress
* Dashboard APIs
* Blog
* Ausbildung
* Visa Checklist
* Services
* Members
* Subscription logic
* File uploads
* AI writing evaluation
* Audio functionality
* Error handling
* Prisma errors
* Protected routes
* Admin routes

# 🗺️ Development Roadmap

### Completed

* [x] Authentication & Authorization
* [x] User Profile
* [x] Learning Levels
* [x] Books
* [x] Chapters
* [x] Chapter Access Control
* [x] Grammar
* [x] Vocabulary
* [x] Vocabulary TTS
* [x] Listening
* [x] Writing
* [x] Gemini AI Evaluation
* [x] Sentence Building
* [x] Speaking
* [x] Progress Tracking
* [x] Daily Activity
* [x] Streak System
* [x] Achievements
* [x] Study Sessions
* [x] Activity Records
* [x] Subscription Logic
* [x] Ausbildung
* [x] Visa Checklist
* [x] Blog
* [x] Blog Likes
* [x] Our Services
* [x] Our Members
* [x] Home API
* [x] User Dashboard
* [x] Admin Dashboard
* [x] Cloudinary Integration
* [x] Global Error Handling
* [x] Prisma Error Handling
* [x] Helmet Security
* [x] CORS
* [x] Request Body Limits
* [x] Rate Limiting
* [x] Environment Validation
* [x] Crash Protection
* [x] Graceful Shutdown
* [x] Postman API Testing

### Planned

* [ ] Frontend Application
* [ ] Production Deployment
* [ ] Production Monitoring
* [ ] Payment Gateway Integration
* [ ] Further Performance Optimization
* [ ] Load Testing
* [ ] AI Speaking Evaluation Improvements

---

# 👨‍💻 Developer

**Mehedi Hasan Raju**

Full-Stack Developer focused on building scalable web applications with modern backend and frontend technologies.

### Technologies

```text
JavaScript
TypeScript
Node.js
Express.js
React
Next.js
MongoDB
PostgreSQL
Prisma
Docker
AWS
Python
Git
REST APIs
AI Integration
```

---

## 📌 Project Status

The backend core is feature-complete and has been tested through Postman.

Current development focus is moving from backend implementation toward **production deployment and frontend integration**.

---

⭐ If you find this project interesting, feel free to explore the code and follow the development journey.
