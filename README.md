# 🚀 TaskSphere — Secure REST API with RBAC & Premium React Dashboard

A production-grade REST API featuring **JWT Authentication**, **Role-Based Access Control (RBAC)**, **CRUD operations**, **Swagger API documentation**, **rate limiting**, and a stunning **glassmorphism React frontend**.

Built as part of the Backend Developer Intern assignment.

---

## 📋 Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Quick Start (Local)](#quick-start-local)
- [API Documentation](#api-documentation)
- [API Endpoints Reference](#api-endpoints-reference)
- [Security Practices](#security-practices)
- [Scalability Notes](#scalability-notes)
- [Docker Deployment](#docker-deployment)

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Runtime** | Node.js (ES Modules) |
| **Framework** | Express.js |
| **ORM** | Prisma ORM |
| **Database** | SQLite (dev) → PostgreSQL/MySQL (prod, 1-line swap) |
| **Auth** | JSON Web Tokens (`jsonwebtoken`) |
| **Password Hashing** | `bcryptjs` (salt rounds: 12) |
| **Validation** | `express-validator` (sanitize + validate) |
| **Security** | `helmet`, `cors`, `express-rate-limit` |
| **Logging** | `winston` + `morgan` |
| **API Docs** | Swagger (OpenAPI 3.0) via `swagger-jsdoc` |
| **Frontend** | React 18 + Vite |
| **Containerization** | Docker + Docker Compose |

---

## ✅ Features

### Backend
- 🔐 **JWT Authentication** — register, login, refresh with 24h token expiry
- 👥 **Role-Based Access Control** — `USER` vs `ADMIN` roles enforced at middleware level
- ✅ **Tasks CRUD** — create, read, update, delete with search, status/priority filters, sorting
- 🛡 **Input Validation** — every field sanitized and validated with `express-validator`
- 🚦 **Rate Limiting** — 25 req/15min on auth routes, 100 req/15min globally
- 📄 **Swagger Docs** — interactive OpenAPI 3.0 UI at `/api/v1/api-docs`
- 📋 **Structured Logging** — colorized console + persistent log files
- 🔢 **API Versioning** — all routes under `/api/v1/`
- 🏥 **Health Check** — `/api/v1/health` endpoint
- 🐳 **Docker Ready** — multi-stage Dockerfile + docker-compose.yml

### Frontend
- 🎨 **Glassmorphism Dark UI** — premium HSL/CSS variable design system
- 🔑 **Auth Pages** — unified Login/Register with animated tab switching
- 📊 **Dashboard** — stats cards, search, multi-filter, sort, task cards grid
- 🧩 **Task Modal** — create/edit tasks with status, priority, and due date
- 👑 **Admin Panel** — user management table + all-tasks overview with role toggling
- 🔍 **JWT Inspector** — live floating widget decoding your JWT, showing claims and expiry countdown
- 🔔 **Toast Notifications** — animated success/warning/error toasts

---

## 📁 Project Structure

```
assignment/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema (User + Task)
│   │   └── dev.db            # SQLite database (auto-generated)
│   ├── src/
│   │   ├── config/
│   │   │   ├── logger.js     # Winston logger
│   │   │   └── prisma.js     # Prisma client singleton
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── taskController.js
│   │   │   └── userController.js
│   │   ├── middleware/
│   │   │   ├── auth.js         # JWT + RBAC middleware
│   │   │   ├── errorHandler.js # Global error handler
│   │   │   ├── rateLimiter.js  # Rate limiting
│   │   │   └── validator.js    # express-validator runner
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── tasks.js
│   │   │   └── users.js
│   │   ├── utils/
│   │   │   └── swagger.js    # Swagger config + setup
│   │   └── app.js            # Express entry point
│   ├── .env
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AuthForm.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── AdminPanel.jsx
│   │   │   ├── TaskModal.jsx
│   │   │   ├── TokenInspector.jsx
│   │   │   └── Toast.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── docker-compose.yml
```

---

## ⚡ Quick Start (Local)

### Prerequisites
- Node.js 18+ installed
- npm 9+

### 1. Setup Backend

```bash
cd assignment/backend

# Install dependencies
npm install

# Generate Prisma client and run database migration
npx prisma migrate dev --name init

# Start development server
npm run dev
```

Backend will start at: **http://localhost:5000**
Swagger docs at: **http://localhost:5000/api/v1/api-docs**

### 2. Setup Frontend

```bash
cd assignment/frontend

# Install dependencies
npm install

# Start dev server (proxies /api → localhost:5000)
npm run dev
```

Frontend will start at: **http://localhost:3000**

### 3. First Login Tip
> 💡 **The first registered user is automatically granted the ADMIN role** for easy evaluation!

---

## 📄 API Documentation

Interactive Swagger UI (OpenAPI 3.0):
**`http://localhost:5000/api/v1/api-docs`**

Raw JSON schema:
**`http://localhost:5000/api/v1/swagger.json`**

---

## 🔗 API Endpoints Reference

### Authentication `/api/v1/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | ❌ | Register new user |
| `POST` | `/auth/login` | ❌ | Login, returns JWT |
| `GET` | `/auth/me` | ✅ JWT | Get current user profile |

### Tasks `/api/v1/tasks`

| Method | Endpoint | Auth | RBAC | Description |
|---|---|---|---|---|
| `POST` | `/tasks` | ✅ | USER/ADMIN | Create new task |
| `GET` | `/tasks` | ✅ | USER (own) / ADMIN (all with `?all=true`) | List tasks with filters |
| `GET` | `/tasks/:id` | ✅ | Owner / ADMIN | Get task by ID |
| `PUT` | `/tasks/:id` | ✅ | Owner / ADMIN | Update task |
| `DELETE` | `/tasks/:id` | ✅ | Owner / ADMIN | Delete task |

**Query Parameters for GET /tasks:**
| Param | Type | Example |
|---|---|---|
| `status` | string | `PENDING`, `IN_PROGRESS`, `COMPLETED` |
| `priority` | string | `LOW`, `MEDIUM`, `HIGH` |
| `search` | string | `meeting notes` |
| `all` | boolean | `true` (Admin only) |
| `sortBy` | string | `createdAt:desc`, `dueDate:asc` |

### Users (Admin) `/api/v1/users`

| Method | Endpoint | Auth | RBAC | Description |
|---|---|---|---|---|
| `GET` | `/users` | ✅ | ADMIN only | List all users |
| `PATCH` | `/users/:id/role` | ✅ | ADMIN only | Update user role |

---

## 🔒 Security Practices

| Practice | Implementation |
|---|---|
| Password Hashing | `bcryptjs` with 12 salt rounds |
| Stateless Auth | JWT with 24h expiry signed with HS256 |
| Input Sanitization | `express-validator` `.escape()` and `.trim()` |
| Security Headers | `helmet` sets CSP, XSS protection, etc. |
| CORS | Restricted origins via `cors` middleware |
| Rate Limiting | Auth: 25 req/15min; Global API: 100 req/15min |
| Error Safety | Stack traces hidden in production responses |
| RBAC | Server-side role enforcement, not just frontend |

---

## 📈 Scalability Notes

### 1. Database Portability
Swapping from SQLite to PostgreSQL/MySQL requires a single line change in `.env`:
```env
DATABASE_URL="postgresql://user:password@host:5432/dbname"
```
No code changes needed — Prisma handles migration.

### 2. Horizontal Scaling & Load Balancing
- **Stateless JWT** means any server instance can validate any request — no sticky sessions needed.
- Deploy multiple backend instances behind **NGINX** or **AWS Application Load Balancer**.
- Use **PM2 cluster mode** for multi-core CPU utilization on a single machine.

### 3. Caching Layer (Redis)
- Cache frequent reads (e.g., task lists) with `ioredis` to reduce DB load.
- Cache user role lookups to avoid repeated DB queries per request.
- Use Redis for JWT token blocklist (logout invalidation) for enterprise-grade security.

### 4. Microservices Migration Path
The current structure is modular and ready for extraction:
- `auth` → Authentication Microservice
- `tasks` → Task Management Service
- `users` → User Management Service
- Introduce **API Gateway** (e.g., Kong, AWS API Gateway) for routing.
- Use **message queues** (e.g., BullMQ with Redis, RabbitMQ) for async operations.

### 5. Containerization & CI/CD
- Multi-stage Docker build minimizes production image size.
- `docker-compose.yml` provides single-command local orchestration.
- GitHub Actions CI/CD pipeline can be added to auto-deploy on push.

---

## 🐳 Docker Deployment

```bash
# From the assignment root directory
docker-compose up --build
```

This will:
1. Build the backend image
2. Start the server on port **5000**
3. Persist the SQLite database and logs via Docker volumes

> **Note:** Run `npx prisma migrate deploy` inside the container after first launch to apply migrations.

---

## 📝 Environment Variables

| Variable | Description | Default |
|---|---|---|
| `PORT` | Server port | `5000` |
| `DATABASE_URL` | Prisma database URL | `file:./dev.db` |
| `JWT_SECRET` | Secret key for signing JWTs | *(set a strong random string)* |
| `NODE_ENV` | Environment mode | `development` |
