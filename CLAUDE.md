# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Kagi is a building management portal for Japanese mansions, towers, and condominiums. It features a Vue.js 3 frontend with Pinia state management and a Node.js/Fastify backend with Prisma ORM and PostgreSQL.

## Essential Commands

### Development

```bash
# Install all dependencies (root, frontend, backend)
pnpm install:all

# Start both frontend and backend in development mode
pnpm dev

# Or start individually:
pnpm dev:frontend  # Frontend on http://localhost:3000 (HTTPS)
pnpm dev:backend   # Backend on http://localhost:3333
```

### Frontend Commands

```bash
cd frontend
pnpm dev          # Start dev server with HTTPS on port 3000
pnpm build        # Build for production
pnpm preview      # Preview production build
pnpm lint         # Run ESLint with auto-fix
pnpm storybook    # Start Storybook on port 6006
pnpm build-storybook  # Build Storybook
```

### Backend Commands

```bash
cd backend
pnpm dev          # Start with nodemon auto-reload
pnpm start        # Start production server
pnpm test         # Run Jest tests
pnpm test:watch   # Run tests in watch mode
pnpm test:coverage  # Run tests with coverage
npx prisma migrate dev  # Run database migrations
npx prisma db seed      # Seed database with test data
npx prisma studio       # Open Prisma Studio GUI
```

### Testing

```bash
# Backend unit/integration tests
cd backend && pnpm test

# Frontend tests (when implemented)
cd frontend && pnpm test

# Run specific test file
cd backend && npx jest path/to/test.js
```

### Linting

```bash
# Frontend linting (ESLint)
cd frontend && pnpm lint

# No backend linting configured yet
```

## Architecture

### Frontend Structure (Vue.js 3 + Vite)

```
frontend/
├── src/
│   ├── views/              # Page components (routed views)
│   │   ├── Login.vue       # Multi-tab login (admin/resident)
│   │   ├── AdminDashboard.vue    # Building admin dashboard
│   │   ├── MansionAdminDashboard.vue  # Mansion admin dashboard
│   │   └── ResidentDashboard.vue      # Resident portal
│   ├── components/         # Reusable Vue components
│   │   ├── core/          # Core UI components
│   │   ├── dashboard/     # Dashboard-specific components
│   │   └── layout/        # Layout components
│   ├── stores/            # Pinia state management
│   │   └── auth.js        # Authentication store
│   ├── styles/            # Global styles and themes
│   ├── makio/             # Creative coding utilities (from boilerplate)
│   └── main.js            # App entry point
├── public/
│   └── translations/      # i18n JSON files (en, fr, ja)
└── .storybook/           # Storybook configuration
```

### Backend Structure (Node.js + Fastify + Prisma)

```
backend/
├── src/
│   ├── index.js          # Server entry point and Fastify setup
│   ├── routes/           # API endpoints
│   │   ├── auth.js       # Authentication (magic link, JWT)
│   │   ├── user.js       # User management
│   │   ├── bills.js      # Billing and payments
│   │   ├── booking.js    # Facility reservations
│   │   ├── documents.js  # Document management
│   │   ├── facilities.js # Facility definitions
│   │   ├── maintenance.js # Maintenance requests
│   │   ├── mansion.js    # Building/mansion management
│   │   ├── events.js     # Building events
│   │   └── messages.js   # Messaging system
│   └── utils/            # Utility functions
├── prisma/
│   └── schema.prisma     # Database schema definition
└── tests/
    ├── unit/            # Unit tests
    ├── integration/     # Integration tests
    └── helpers/         # Test utilities
```

### Database Schema (PostgreSQL via Prisma)

Key models:
- **User**: Multi-role system (admin, mansion_admin, landlord, resident, guest)
- **Mansion**: Building/property entity
- **Bill**: Management fees and charges
- **Booking**: Facility reservations with status tracking
- **MaintenanceRequest**: Repair/maintenance tickets
- **Document**: Building rules and regulations
- **Event**: Building events and announcements
- **Facility**: Bookable amenities (gym, party room, etc.)
- **Message**: Inter-user messaging

### State Management

- **Frontend**: Pinia store for authentication (`/frontend/src/stores/auth.js`)
- **Backend**: Stateless JWT authentication with Fastify decorators

## Key Technical Details

### Frontend Configuration

- **Vite**: HTTPS dev server (port 3000), auto-imports, CSS injection
- **Vue 3**: Options API (IMPORTANT: Use Options API, NOT Composition API or setup syntax)
- **Routing**: vue-tiny-router (lightweight)
- **i18n**: vue-tiny-translation with JSON files in `/public/translations/`
- **Styling**: Stylus preprocessor, global styles in `/src/css/global.styl`
- **Build**: Aggressive minification, terser for JS, cssnano for CSS

### Backend Configuration

- **Fastify**: Fast web framework with plugins for CORS, JWT, multipart, rate limiting
- **Prisma ORM**: Type-safe database access with migrations
- **Authentication**: JWT tokens + magic link email authentication
- **Security**: bcrypt password hashing, rate limiting, CORS protection

### ESLint Rules (Frontend)

- No semicolons (enforced)
- Tabs for indentation
- Auto-import sorting
- Unused imports removal
- Vue 3 recommended rules

### Environment Variables

Frontend (`.env`):
- `VITE_API_URL`: Backend API URL (default: http://localhost:3333)
- `VITE_TEST_MODE`: Enable test mode for development

Backend (`.env`):
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: JWT signing secret
- `SMTP_*`: Email configuration
- `FRONTEND_URL`: Frontend URL for CORS
- `PORT`: Server port (default: 3333)

## Test Mode

When `VITE_TEST_MODE=true`:
- Magic links shown in popup (no email required)
- Admin login accepts any password
- Test users auto-created with predefined data

## API Authentication Flow

1. **Resident Login**: Email → Magic link → JWT token
2. **Admin Login**: Email + password → JWT token
3. **Protected Routes**: Bearer token in Authorization header
4. **Token Refresh**: Not implemented (tokens expire after configured time)

## Common Development Tasks

### Adding a New API Endpoint

1. Create route file in `/backend/src/routes/`
2. Register route in `/backend/src/index.js`
3. Add Prisma model if needed in `schema.prisma`
4. Run `npx prisma migrate dev` to update database
5. Add corresponding frontend API calls
6. Update frontend store if state management needed

### Adding a New Vue Component

1. Create component in `/frontend/src/components/` (auto-imported)
2. Use Composition API pattern
3. Follow existing component structure
4. Add Storybook story if UI component

### Database Changes

1. Modify `/backend/prisma/schema.prisma`
2. Run `npx prisma migrate dev --name descriptive-name`
3. Update seed data if needed in `/backend/prisma/seed.js`

### Adding Translations

1. Update JSON files in `/frontend/public/translations/`
2. Support for: English (en), French (fr), Japanese (ja)
3. Use `$t('key.path')` in Vue components

## Vue Component Development Guidelines

### IMPORTANT: Use Options API Only

All Vue components MUST use the Options API pattern. Do NOT use:
- `<script setup>` syntax
- Composition API with `setup()` function
- Composables

### Correct Vue Component Structure

```vue
<template>
  <!-- Template content -->
</template>

<script>
export default {
  name: 'ComponentName',
  components: {
    // Component imports
  },
  props: {
    // Component props
  },
  data() {
    return {
      // Reactive data
    }
  },
  computed: {
    // Computed properties
  },
  watch: {
    // Watchers
  },
  methods: {
    // Methods
  },
  mounted() {
    // Lifecycle hook
  }
}
</script>

<style lang="stylus" scoped>
// Styles
</style>
```

### Translation Pattern

- Use `this.$t('key')` in methods
- Use `$t('key')` in templates
- Never use fallback text: ~~`$t('key') || 'fallback'`~~

## Security Best Practices Applied

- JWT authentication with secure tokens
- Password hashing with bcrypt
- Input validation via Prisma
- CORS protection configured
- Rate limiting on API endpoints
- XSS protection via Vue template escaping
- SQL injection prevention via Prisma ORM
- Environment variables for secrets
- HTTPS enforcement in production