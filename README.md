# ShiftTrackPro

A full-stack monorepo application for shift management and tracking, built with NestJS (backend) and React + Vite (frontend), managed with npm workspaces.

## Features

- **Authentication**: JWT-based login system with role-based access control
- **User Roles**: Worker, Admin, and Super Admin with different permissions
- **Shift Management**: Create and manage shifts with time slots
- **Section Management**: Organize workers into different sections
- **Record Tracking**: Workers can add records during their shifts
- **Admin Dashboard**: View and manage all users, sections, shifts, and records
- **Dark Mode**: System-wide dark mode toggle
- **API Documentation**: Auto-generated Swagger docs at `/api/docs`
- **Database Seeding**: Automatic seed data on first startup

## Tech Stack

### Backend
- NestJS
- TypeScript
- MySQL + TypeORM
- JWT Authentication
- Passport.js
- Swagger/OpenAPI
- Docker

### Frontend
- React 18
- TypeScript
- Vite
- TailwindCSS
- React Router v6
- Axios

## Project Structure

```
shifttrackpro/
├── backend/              # NestJS backend
│   ├── src/
│   │   ├── auth/        # Authentication module
│   │   ├── users/       # Users module
│   │   ├── sections/    # Sections module
│   │   ├── shifts/      # Shifts module
│   │   ├── records/     # Records module
│   │   ├── entities/    # TypeORM entities
│   │   ├── config/      # Configuration files
│   │   └── database/    # Migrations and seeds
│   ├── Dockerfile
│   └── package.json
├── frontend/            # React frontend
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── context/     # React context providers
│   │   ├── pages/       # Page components
│   │   └── main.tsx
│   └── package.json
├── docker-compose.yml   # Docker Compose setup
└── package.json         # Root workspace config
```

## Quick Start

### Prerequisites
- Node.js 20+
- MySQL 8.0 (or use Docker)
- npm

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd ShiftTrackPro
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   cd backend && cp ../.env.example .env
   cd ../frontend && cp ../.env.example .env
   ```

4. **Start with Docker Compose (Recommended):**
   ```bash
   docker-compose up -d
   ```

   This starts:
   - MySQL on port 3306
   - phpMyAdmin on port 8080
   - Backend on port 3000

5. **OR start manually:**

   Start MySQL:
   ```bash
   docker run --name mysql -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=shifttrackpro -p 3306:3306 -d mysql:8.0
   ```

   Seed database:
   ```bash
   cd backend
   npm run seed
   ```

   Start dev servers:
   ```bash
   # From root directory
   npm run dev
   ```

6. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - API Docs: http://localhost:3000/api/docs
   - phpMyAdmin: http://localhost:8080 (if using Docker Compose)

## Default Login Credentials

- **Super Admin**: `superadmin` / `password123`
- **Admin**: `admin` / `password123`
- **Worker 1**: `worker1` / `password123`
- **Worker 2**: `worker2` / `password123`

## Available Scripts

### Root Directory
- `npm run dev` - Run both backend and frontend in development mode
- `npm run build` - Build all workspaces
- `npm run lint` - Lint all workspaces
- `npm run format` - Format code with Prettier

### Backend (`cd backend`)
- `npm run dev` - Start backend in watch mode
- `npm run build` - Build backend
- `npm run start:prod` - Start production server
- `npm run seed` - Seed database with default data
- `npm run migration:generate` - Generate new migration
- `npm run migration:run` - Run pending migrations

### Frontend (`cd frontend`)
- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## API Endpoints

### Authentication
- `POST /auth/login` - User login

### Users (Admin only)
- `GET /users` - Get all users
- `POST /users` - Create user
- `GET /users/:id` - Get user by ID
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user (Super Admin only)

### Sections
- `GET /sections` - Get all sections
- `POST /sections` - Create section (Admin only)
- `PATCH /sections/:id` - Update section (Admin only)
- `DELETE /sections/:id` - Delete section (Super Admin only)

### Shifts
- `GET /shifts` - Get all shifts
- `POST /shifts` - Create shift (Admin only)
- `PATCH /shifts/:id` - Update shift (Admin only)
- `DELETE /shifts/:id` - Delete shift (Super Admin only)

### Records
- `GET /records` - Get all records (Admin only)
- `GET /records/my-records` - Get current user's records
- `POST /records` - Create record
- `PATCH /records/:id` - Update record
- `DELETE /records/:id` - Delete record (Admin only)

## Database Schema

### Users
- id, username, password, role (worker|admin|super_admin), section_id

### Sections
- id, name

### Shifts
- id, name, start_time, end_time

### Records
- id, user_id, section_id, shift_id, crm_out, crm_in, created_at

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions for Cloudflare and other platforms.

## Development

### Code Style
- ESLint + Prettier configured
- Run `npm run format` to format all code
- Run `npm run lint` to check for issues

### Database Migrations
```bash
cd backend
npm run migration:generate -- src/database/migrations/MigrationName
npm run migration:run
```

## License

MIT
