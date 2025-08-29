# Kagi - Building Management Portal 🏢

[![Security Status](https://img.shields.io/badge/Security-Verified-green.svg)](https://github.com/yourusername/kagi)
[![Test Status](https://img.shields.io/badge/Tests-Passing-green.svg)](https://github.com/yourusername/kagi)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Vue.js](https://img.shields.io/badge/Vue.js-3.x-4fc08d.svg)](https://vuejs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933.svg)](https://nodejs.org/)

> A modern building management portal for Japanese mansions, towers, and condominiums. Simplifying property management and resident communication.

## 🔐 Security

This repository follows security best practices:
- ✅ Environment variables for sensitive configuration
- ✅ JWT authentication with secure token handling
- ✅ Input validation and sanitization
- ✅ CORS protection configured
- ✅ Rate limiting implemented
- ✅ SQL injection prevention via Prisma ORM
- ✅ XSS protection through Vue.js template escaping
- ✅ Secure password hashing with bcrypt
- ✅ HTTPS enforcement in production
- ✅ No secrets committed to repository

## ✨ Features

### For Residents
- 🔑 **Magic Link Authentication** - Passwordless secure login
- 💬 **AI Assistant** - 24/7 support via intelligent chatbot
- 📄 **Digital Documents** - Access building rules and regulations
- 📅 **Facility Booking** - Reserve gym, party rooms, guest rooms
- 🔧 **Maintenance Requests** - Submit and track repair requests
- 💳 **Bill Management** - View and pay management fees
- 📢 **Event Updates** - Stay informed about building events

### For Management
- 👥 **Multi-role Support** - Admin, Manager, Landlord, Resident roles
- 📊 **Dashboard Analytics** - Overview of building operations
- 📨 **Communication Hub** - Direct messaging with residents
- 🗂️ **Document Management** - Upload and organize building documents
- 🔔 **Notification System** - Send announcements to all residents
- 📈 **Reporting Tools** - Generate maintenance and financial reports

## 🌍 Internationalization

Full support for:
- 🇬🇧 English
- 🇫🇷 Français
- 🇯🇵 日本語

## 🚀 Quick Start

### Prerequisites
- Node.js 18.x or higher
- PostgreSQL database
- pnpm package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/kagi.git
cd kagi
```

2. Install dependencies:
```bash
# Frontend
cd frontend
pnpm install

# Backend
cd ../backend
pnpm install
```

3. Set up environment variables:
```bash
# Copy example env files
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env

# Edit the .env files with your configuration
```

4. Set up the database:
```bash
cd backend
npx prisma migrate dev
npx prisma db seed
```

5. Start development servers:
```bash
# Terminal 1 - Backend
cd backend
pnpm dev

# Terminal 2 - Frontend
cd frontend
pnpm dev
```

Visit `http://localhost:3001` to see the application.

## 🧪 Testing

### Test Mode
The application includes a test mode for development without SMTP configuration:
- Magic links are shown in a popup instead of being emailed
- Admin login accepts any password
- Set `VITE_TEST_MODE=true` in frontend/.env

### Test Login Credentials

#### 🏠 As a Resident
1. Navigate to `/login`
2. Select the **"Resident"** tab
3. Enter any email (e.g., `resident@example.com`)
4. Click **"Send Magic Link"**
5. A popup will display the magic link - click it to login

#### 🏢 As Building Admin (Full Access)
1. Navigate to `/login`
2. Select the **"Admin"** tab
3. Enter any email (e.g., `admin@example.com`)
4. Enter any password (e.g., `password`)
5. Click **"Login"**

#### 🏘️ As Mansion Admin
1. Navigate to `/login`
2. Select the **"Admin"** tab
3. Enter any email (e.g., `mansion.admin@example.com`)
4. Enter any password
5. System will assign mansion admin role

### Test User Roles
- **admin**: Full system access, can edit all documents and settings
- **mansion_admin**: Manage specific mansion/building
- **resident**: Regular user access to all resident services
- **landlord**: Property owner with special permissions

### Pre-populated Test Data
- **Mansion ID**: `mansion_001` (auto-assigned)
- **Documents**: Management Rules, Facility Rules, Parking Rules (with markdown content)
- **Events**: Christmas Party (12/25), Fire Drill (01/10)
- **Bills**: Management Fee (¥25,000), Repair Fund (¥10,000)
- **Facilities**: Party Room, Guest Room, Gym (bookable)
- **Emergency Contacts**: Fire (119), Police (110), Building Manager

### Running Tests
```bash
# Frontend tests
cd frontend
pnpm test

# Backend tests
cd backend
pnpm test

# E2E tests
pnpm test:e2e
```

## 📁 Project Structure

```
kagi/
├── frontend/              # Vue.js frontend application
│   ├── src/
│   │   ├── components/    # Reusable Vue components
│   │   ├── views/         # Page components
│   │   ├── stores/        # Pinia state management
│   │   └── makio/         # Utility functions
│   └── public/            # Static assets
│       └── translations/  # i18n JSON files
├── backend/               # Node.js backend API
│   ├── src/
│   │   ├── routes/        # API endpoints
│   │   ├── middleware/    # Express middleware
│   │   └── services/      # Business logic
│   └── prisma/            # Database schema
└── docs/                  # Documentation
```

## 🛠️ Technology Stack

### Frontend
- **Vue.js 3** - Progressive JavaScript framework
- **Vite** - Fast build tool
- **Pinia** - State management
- **Stylus** - CSS preprocessor
- **vue-tiny-router** - Lightweight routing
- **vue-tiny-translation** - i18n support

### Backend
- **Node.js** - JavaScript runtime
- **Fastify** - Fast web framework
- **Prisma** - Type-safe ORM
- **PostgreSQL** - Relational database
- **JWT** - Authentication
- **Nodemailer** - Email service

## 📱 Mobile Responsive

The application is fully responsive with:
- Touch-optimized interface
- Gesture support
- Progressive Web App capabilities
- Offline mode support

## 🔧 Configuration

### Environment Variables

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:3333
VITE_TEST_MODE=true
VITE_APP_NAME=Kagi
```

#### Backend (.env)
```env
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
```

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with Vue.js and Node.js
- Icons by Emoji
- Inspired by modern Japanese property management needs

## 📞 Support

For support, email support@kagi.jp or open an issue on GitHub.

---

**Kagi** - Building Management Made Simple | 建物管理をシンプルに | Gestion immobilière simplifiée