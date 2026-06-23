# Event Registration System

A two-portal system for an event management company:

- **Admin portal** (employees): create events, view registration reports and trends.
- **Public portal** (general public): browse open events and register.

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [pnpm](https://pnpm.io/) (`npm install -g pnpm`)
- [Docker](https://www.docker.com/) with Compose — via [Docker Desktop](https://www.docker.com/products/docker-desktop/) or [Colima](https://github.com/abiosoft/colima)
- A free [OneMap API account](https://www.onemap.gov.sg/apidocs/register)

---

## 1. Install Dependencies

From the **root** of the repo:

```bash
pnpm install
```

---

## 2. Environment Variables

Copy both env files in one command from the root:

```bash
pnpm run setup
```

Then edit `backend/.env` and fill in your OneMap credentials (DB values already match the Docker Compose defaults — no change needed unless you use a different DB):

| Variable          | Description                             | Default / Example       |
| ----------------- | --------------------------------------- | ----------------------- |
| `DB_HOST`         | MySQL host                              | `localhost`             |
| `DB_PORT`         | MySQL port                              | `3306`                  |
| `DB_NAME`         | Database name                           | `event_registration`    |
| `DB_USER`         | MySQL username                          | `appuser`               |
| `DB_PASSWORD`     | MySQL password                          | `apppassword`           |
| `ONEMAP_EMAIL`    | Email used to register at onemap.gov.sg | `you@example.com`       |
| `ONEMAP_PASSWORD` | Password for OneMap account             | `yourpassword`          |
| `PORT`            | Backend API port (must be 8000)         | `8000`                  |
| `FRONTEND_ORIGIN` | Frontend origin for CORS                | `http://localhost:8001` |

`frontend/.env` requires no changes — the default `VITE_API_BASE_URL=http://localhost:8000` is correct.

> **OneMap credentials** (`ONEMAP_EMAIL` / `ONEMAP_PASSWORD`): the backend fetches a short-lived JWT from OneMap on first use and caches it in memory until 60 seconds before expiry, at which point it refreshes automatically. No manual token management is needed — just provide valid credentials in `.env`.

---

## 3. Database Setup

Start the MySQL container:

```bash
# If using Colima (starts daemon + container in one step):
pnpm run db:up

# If Docker daemon is already running:
pnpm run db:start
```

This starts a MySQL 8 container named `event_registration_db` on port **3306** with:

- Database: `event_registration`
- User: `appuser` / Password: `apppassword`
- Root password: `password`
- Data persisted in a named Docker volume (`mysql_data`)

To stop the database:

```bash
pnpm run db:stop
```

To stop and **delete all data**:

```bash
pnpm run db:reset
```

---

## 4. Seeding Initial Data

Create the tables and insert seed employees:

```bash
pnpm run migrate   # creates/syncs tables
pnpm run seed      # inserts sample employees
```

This inserts 5 sample employees into the `employees` table. The seed is idempotent — running it again will not create duplicates.

---

## 5. Running the System Locally

All commands run from the **root** — no `cd` needed.

**Start both servers:**

```bash
pnpm run dev
# equivalent to: pnpm nx run-many -t serve
```

**Or start individually:**

```bash
pnpm nx serve backend    # API on http://localhost:8000
pnpm nx serve frontend   # UI  on http://localhost:8001
```

Then open:

- **Public portal**: http://localhost:8001
- **Admin portal**: http://localhost:8001/admin

---

## API Overview

| Method | Path                            | Description                                         |
| ------ | ------------------------------- | --------------------------------------------------- |
| GET    | `/api/admin/events`             | List all events (paginated, searchable, filterable) |
| POST   | `/api/admin/events`             | Create a new event                                  |
| POST   | `/api/admin/events/:uuid/trend` | Get daily registration trend for an event           |
| GET    | `/api/admin/employees`          | List all employees (for handler dropdown)           |
| GET    | `/api/public/events`            | List all currently open events                      |
| POST   | `/api/public/register`          | Register for an event                               |

> **Note**: `POST /api/admin/events/:uuid/trend` uses POST (not GET) as specified in the tech assignment. Automated tests will call this endpoint as POST.

---

## 6. API Testing with Bruno

The project includes a [Bruno](https://www.usebruno.com/) collection for manual API testing.

### Setup

1. Install Bruno (desktop app) from https://www.usebruno.com/downloads
2. Open Bruno → **Open Collection** → select the `bruno/` folder in this repo
3. Select the **local** environment (top-right dropdown)

### Collection Structure

```
bruno/
├── environments/
│   └── local.bru            ← baseUrl: http://localhost:8000
├── admin/
│   ├── list-events.bru      ← GET  /api/admin/events?page=1
│   ├── create-event.bru     ← POST /api/admin/events
│   ├── get-trend.bru        ← POST /api/admin/events/:uuid/trend
│   └── list-employees.bru   ← GET  /api/admin/employees
└── public/
    ├── list-open-events.bru ← GET  /api/public/events
    └── register.bru         ← POST /api/public/register
```

### Usage

1. Start the backend (`pnpm nx serve backend`)
2. Run **List Employees** to get employee UUIDs
3. Use an employee UUID as `handlerUuid` in **Create Event**
4. Run **List Events** to get event UUIDs
5. Use an event UUID in **Get Trend** and **Register**

---

## 7. Running Unit Tests

```bash
pnpm test
# or explicitly:
pnpm nx test backend
```

This runs Jest with coverage reporting. A summary is printed to the terminal and a detailed HTML report is generated in `backend/coverage/`.

Coverage threshold: **≥ 50% line coverage** (enforced — tests will fail below this threshold).

---

## Project Structure

```
event-registration-system/
├── apps/
│   ├── backend/                  # Express.js API (TypeScript)
│   │   ├── src/
│   │   │   ├── config/           # Database and logger config
│   │   │   ├── constants/        # App constants
│   │   │   ├── models/           # Sequelize models
│   │   │   ├── middleware/       # Error handler, validation
│   │   │   ├── modules/          # Feature modules
│   │   │   │   ├── events/       # Events (route, controller, service, validator, typing)
│   │   │   │   ├── registration/ # Registration module
│   │   │   │   ├── trend/        # Trend module
│   │   │   │   ├── employees/    # Employees module
│   │   │   │   └── onemap/       # OneMap API integration
│   │   │   └── database/         # Migrate and seed scripts
│   │   └── project.json
│   └── frontend/                 # React + Vite + Material UI (TypeScript)
│       ├── src/
│       │   ├── api/              # Axios API clients
│       │   └── pages/
│       │       ├── admin/        # Admin portal pages
│       │       └── public/       # Public portal pages
│       └── project.json
├── bruno/                        # Bruno API collection
├── libs/
│   └── common/                   # Shared TypeScript DTOs
│       └── src/index.ts
└── docker-compose.yml
```

---

## HTTP Status Codes

| Code | Meaning          |
| ---- | ---------------- |
| 200  | Success          |
| 400  | Client error     |
| 421  | Validation error |
| 500  | Server error     |
