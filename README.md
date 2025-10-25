# Here are your Instructions

A comprehensive digital platform for managing club activities, events, finances, and student engagement. Built for Pimpri Chinchwad College of Engineering (PCCOE), Pune.

![Smart Club Connect](https://img.shields.io/badge/Status-Production%20Ready-success)
![Tech Stack](https://img.shields.io/badge/Stack-FastAPI%20%2B%20React%20%2B%20MongoDB-blue)

## 🌟 Overview

Smart Club Connect transforms campus club management from scattered chaos to streamlined excellence by providing a unified platform for coordination, participation, and reporting.

### The Problem We Solve

1. **Invisibility Crisis** - Events scattered across WhatsApp groups, 70% of students miss relevant activities
2. **Zero Accountability** - Paper attendance sheets, spreadsheet finances, no proof of participation
3. **Leader Burnout** - 15+ hours/week on manual coordination with disconnected tools

### The Solution - Three Core Pillars

#### 🎯 PILLAR 1: COORDINATION (For Club Leaders)
- Project management dashboards
- Task tracking with deadlines
- Real-time balance and spending trends
- Budget adherence alerts
- One-click financial reports

#### 🎉 PILLAR 2: PARTICIPATION (For Students)
- AI-powered event recommendations (Gemini 2.0 Flash)
- Personalized event feed
- One-click RSVP with calendar sync
- QR code attendance (5-second check-in)
- Automatic digital portfolio building
- Achievement badges and certificates

#### 📊 PILLAR 3: REPORTING (For Institution/Faculty)
- Real-time analytics dashboards
- Financial compliance monitoring
- Multi-club comparison view
- Participation verification
- Complete audit trails

## 🚀 Features

### For Students
- ✨ AI-powered event recommendations based on interests
- 📅 Personalized event discovery with tag filtering
- ⚡ One-click RSVP and QR code check-in
- 🏆 Gamification with bronze, silver, and gold badges
- 📱 Digital portfolio with exportable credentials
- 🎯 Achievement tracking and progress visualization

### For Club Coordinators
- 📋 Event creation and management
- ✅ Task assignment and tracking
- 👥 Team coordination tools
- 📊 Real-time event analytics
- 📈 Participation metrics and insights

### For Club Treasurers
- 💰 Income and expense tracking
- 📊 Real-time financial dashboards
- 📉 Budget monitoring with alerts
- 📄 One-click financial reports
- 📈 Spending trend visualization
- 🧾 Receipt upload support

### For Faculty Mentors
- 🔍 Multi-club oversight dashboard
- 💼 Financial health monitoring
- ✅ Compliance status tracking
- 📊 Aggregate activity data
- 🔒 Complete audit trail access

### For Admins
- 🏛️ Club creation and management
- 👥 User role management
- 🌐 System-wide analytics
- 📋 Institutional reporting

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: MongoDB with Motor (async driver)
- **Authentication**: JWT with bcrypt password hashing
- **AI Integration**: Gemini 2.0 Flash via emergentintegrations
- **QR Codes**: qrcode + Pillow
- **Validation**: Pydantic v2

### Frontend
- **Framework**: React 19
- **Routing**: React Router v7
- **Styling**: Tailwind CSS v3.4
- **UI Components**: Shadcn UI (Radix UI primitives)
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod
- **Notifications**: Sonner
- **QR Code Display**: qrcode.react
- **HTTP Client**: Axios

### Fonts
- **Headings**: Space Grotesk
- **Body**: Inter

## 📁 Project Structure

```
/app
├── backend/
│   ├── server.py           # Main FastAPI application
│   ├── requirements.txt    # Python dependencies
│   └── .env               # Environment variables
│
├── frontend/
│   ├── src/
│   │   ├── App.js         # Main React component
│   │   ├── App.css        # Global styles
│   │   ├── pages/         # All application pages
│   │   │   ├── Landing.js
│   │   │   ├── Auth.js
│   │   │   ├── StudentDashboard.js
│   │   │   ├── EventDiscovery.js
│   │   │   ├── EventDetails.js
│   │   │   ├── Portfolio.js
│   │   │   ├── CoordinatorDashboard.js
│   │   │   ├── TreasurerDashboard.js
│   │   │   └── FacultyDashboard.js
│   │   └── components/
│   │       └── ui/        # Shadcn UI components
│   ├── package.json       # Node dependencies
│   └── .env              # Frontend environment variables
│
└── README.md             # This file
```

## 🔧 Installation & Setup

### Prerequisites
- Python 3.11+
- Node.js 18+ and Yarn
- MongoDB 5.0+

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Configure environment variables in `.env`:
```env
MONGO_URL=\"mongodb://localhost:27017\"
DB_NAME=\"smart_club_connect\"
CORS_ORIGINS=\"*\"
JWT_SECRET=\"your-secret-key-change-this-in-production\"
GEMINI_API_KEY=\"your-gemini-api-key\"
```

5. Start the backend server:
```bash
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
yarn install
```

3. Configure environment variables in `.env`:
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

4. Start the development server:
```bash
yarn start
```

The application will be available at `http://localhost:3000`

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Users
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/interests` - Update user interests

### Clubs
- `GET /api/clubs` - Get all clubs
- `POST /api/clubs` - Create new club (admin only)
- `GET /api/clubs/{id}` - Get club details

### Events
- `GET /api/events` - Get all events (with optional tag filter)
- `POST /api/events` - Create event (coordinators only)
- `GET /api/events/{id}` - Get event details
- `POST /api/events/{id}/rsvp` - RSVP to event
- `DELETE /api/events/{id}/rsvp` - Cancel RSVP
- `POST /api/events/{id}/checkin` - Check-in to event (QR code)

### Tasks
- `GET /api/tasks` - Get tasks (with optional club filter)
- `POST /api/tasks` - Create task (coordinators only)
- `PUT /api/tasks/{id}` - Update task status

### Finances
- `GET /api/finances?club_id={id}` - Get club finances
- `POST /api/finances` - Add transaction (treasurers only)

### Analytics
- `GET /api/analytics/student/{id}` - Get student analytics
- `GET /api/analytics/club/{id}` - Get club analytics

### AI Recommendations
- `GET /api/recommendations` - Get AI-powered event recommendations

## 👥 User Roles

1. **Student** - Event discovery, RSVP, check-in, portfolio
2. **Coordinator** - Event management, task creation, team coordination
3. **Treasurer** - Financial tracking, budget monitoring, reports
4. **Faculty** - Club oversight, compliance monitoring
5. **Admin** - System management, club creation

## 🎨 Design Philosophy

- **Modern & Clean**: Gradient backgrounds (blue-green), rounded corners, subtle shadows
- **Accessible**: Proper color contrast, keyboard navigation, screen reader support
- **Responsive**: Mobile-first design with Tailwind breakpoints
- **Performance**: Lazy loading, optimized images, code splitting
- **User-Centric**: Role-based interfaces, intuitive navigation

## 🔒 Security Features

- JWT-based authentication with secure token storage
- Password hashing with bcrypt
- Role-based access control (RBAC)
- CORS configuration
- Input validation with Pydantic
- SQL injection prevention (MongoDB)

## 📊 Database Schema

### Collections

**users**
- id, email, name, role, club_id, interests[], created_at

**clubs**
- id, name, description, category, coordinator_ids[], treasurer_ids[], faculty_mentor_ids[], member_count, created_at

**events**
- id, club_id, title, description, date, location, tags[], qr_code, max_attendees, rsvp_count, attendance_count, created_at

**rsvps**
- id, event_id, user_id, status, created_at

**attendance**
- id, event_id, user_id, checked_in_at

**tasks**
- id, club_id, title, description, assigned_to, deadline, status, created_by, created_at

**transactions**
- id, club_id, type, amount, category, description, receipt_url, created_by, created_at

**achievements**
- id, user_id, title, description, badge_type, earned_at

## 🎯 Gamification System

### Achievement Badges

- **First Event** (Bronze) - Attend your first event
- **Active Participant** (Silver) - Attend 10 events
- **Campus Legend** (Gold) - Attend 50 events

Auto-awarded upon reaching milestones.

## 🤖 AI Integration

Smart Club Connect uses **Gemini 2.0 Flash** for intelligent event recommendations:

1. Analyzes user interests and past participation
2. Evaluates upcoming events with natural language understanding
3. Generates personalized recommendations
4. Fallback to tag-based matching if AI unavailable

## 🚀 Deployment

The application is deployed on Emergent platform with:
- Automatic SSL/TLS certificates
- Continuous deployment from git
- Health monitoring
- Auto-scaling

## 📝 Environment Variables

### Backend (`/app/backend/.env`)
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=smart_club_connect
CORS_ORIGINS=*
JWT_SECRET=your-secret-key
GEMINI_API_KEY=your-gemini-api-key
```

### Frontend (`/app/frontend/.env`)
```env
REACT_APP_BACKEND_URL=https://your-backend-url.com
```

## 🧪 Testing

To test the application:

1. Create test users for each role (student, coordinator, treasurer, faculty, admin)
2. Create sample clubs and events
3. Test RSVP and check-in flows
4. Verify AI recommendations are working
5. Test financial tracking features
6. Check role-based access controls

## 📈 Future Enhancements

- [ ] Mobile app (React Native)
- [ ] Email notifications
- [ ] Push notifications
- [ ] Calendar integrations (Google Calendar, Outlook)
- [ ] Advanced analytics dashboards
- [ ] Export reports in PDF format
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Real-time messaging between club members
- [ ] Event photo galleries
- [ ] Social sharing features

## 🤝 Contributing

This is a proprietary project built for PCCOE, Pune. For feature requests or bug reports, please contact the development team.

## 📄 License

Copyright © 2025 PCCOE, Pune. All rights reserved.

## 👨‍💻 Built With

- FastAPI - Modern Python web framework
- React - UI library
- MongoDB - NoSQL database
- Gemini AI - Event recommendations
- Shadcn UI - Component library
- Tailwind CSS - Utility-first CSS

---


*Transforming clubs from scattered chaos to streamlined efficiency*
"
