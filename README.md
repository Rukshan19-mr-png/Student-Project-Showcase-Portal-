# Student Project Showcase Portal

Welcome to the **Student Project Showcase Portal**, a premium web platform designed for university students to showcase their coding projects, and for recruiters to discover exceptional student talent. 

The project features user authentication (via Google OAuth2 & mock login for development), project portfolios with rich description editing and thumbnail uploads, like counters, user follow dynamics, and an decoupled event-driven notification layer.

---

## 🧭 Table of Contents
1. [System Architecture](#-system-architecture)
2. [Database Schema](#-database-schema)
3. [Local Development Setup](#%EF%B8%8F-local-development-setup)
4. [Environment Variables Reference](#-environment-variables-reference)
5. [Production Deployment Plan](#-production-deployment-plan)
6. [API Documentation (OpenAPI)](#-api-documentation-openapi)
7. [Suggested Features for Extra Marks](#-suggested-features-for-extra-marks)

---

## 🏗️ System Architecture

The portal is built using a decoupled client-server architecture with a monorepo structure. An event-driven notifications model is utilized to ensure the API controllers remain lean and decoupled from background tasks.

```mermaid
graph TD
    %% Styling
    classDef main fill:#3b82f6,stroke:#1d4ed8,stroke-width:2px,color:#fff;
    classDef helper fill:#10b981,stroke:#047857,stroke-width:2px,color:#fff;
    classDef database fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#fff;
    classDef queue fill:#8b5cf6,stroke:#6d28d9,stroke-width:2px,color:#fff;

    Client[Browser / React + Vite Frontend]:::main
    API[Express API Server]:::main
    DB[(PostgreSQL Database)]:::database
    EventEmitter[Node.js EventEmitter]:::queue
    EventListener[Notifications Event Listener]:::queue

    %% Flow
    Client <-->|HTTP REST / Cookies / Bearer Auth| API
    Client -.->|Static Fetch| Uploads[Uploads Directory /uploads]
    
    API <-->|Prisma Client ORM| DB
    API -.->|Emit Event: ProjectCreated, ProjectLiked, UserFollowed| EventEmitter
    
    EventEmitter -.->|Asynchronous Listener Trigger| EventListener
    EventListener ===>|Insert Notification Record| DB
    
    class API,Client main;
    class DB database;
    class EventEmitter,EventListener,Uploads queue;
```

### Key Components:
- **Frontend (React + Vite)**: A responsive single-page application built using pure, premium CSS styles, TanStack React Query for state caching, and Context API for global session management.
- **Backend (Express.js)**: A lightweight RESTful backend incorporating Passport.js for OAuth2, JSON Web Tokens (JWT) for session management, Multer for local thumbnail uploads, and express rate-limiters.
- **ORM & Database (Prisma + PostgreSQL)**: Strongly-typed Prisma client managing migrations, database schemas, and robust relational queries with Cascade Delete mechanisms.
- **Event Notification Layer**: Decoupled handlers listen for app-level actions (e.g. `ProjectLiked`) and write notifications asynchronously to the database, ensuring zero response-blocking overhead.

---

## 🗄️ Database Schema

Below is the entity-relationship layout (ERD) defining user interactions, project attributes, and relational associations.

```mermaid
erDiagram
    users {
        uuid id PK
        string google_id UK
        string email UK
        string name
        string avatar_url
        role role "STUDENT | RECRUITER | ADMIN"
        timestamp created_at
    }
    projects {
        uuid id PK
        uuid student_id FK
        string title
        text description
        string thumbnail_url
        string repository_url
        timestamp created_at
        timestamp updated_at
    }
    likes {
        uuid id PK
        uuid user_id FK
        uuid project_id FK
        timestamp created_at
    }
    followers {
        uuid follower_id PK, FK
        uuid followed_id PK, FK
        timestamp created_at
    }
    notifications {
        uuid id PK
        uuid user_id FK
        uuid actor_id FK
        notification_type type "PROJECT_CREATED | PROJECT_LIKED | NEW_FOLLOWER"
        uuid entity_id
        boolean is_read
        timestamp created_at
    }
    
    users ||--o{ projects : "creates (Cascade)"
    users ||--o{ likes : "gives (Cascade)"
    projects ||--o{ likes : "receives (Cascade)"
    users ||--o{ followers : "follows / followed (Cascade)"
    users ||--o{ notifications : "receives / triggers (Cascade)"
```

---

## 🛠️ Local Development Setup

To run both the frontend and backend applications on your local workstation, follow the steps below.

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.x or higher recommended)
- [PostgreSQL](https://www.postgresql.org/) (Running instance or Docker image)

### Step 1: Clone the Repository & Configure Databases
Make sure your PostgreSQL server is active, and create an empty database (e.g., named `student_showcase`).

### Step 2: Set Up Backend
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install package dependencies:
   ```bash
   npm install
   ```
3. Set up your backend environment file. Copy the template and fill in the values:
   ```bash
   cp .env.example .env
   ```
   *(See the [Environment Variables](#-environment-variables-reference) section below for specific key descriptions)*
4. Run Prisma database migrations to apply the database schema:
   ```bash
   npx prisma migrate dev
   ```
5. Start the backend developer server (runs on port `5000` by default):
   ```bash
   npm run dev
   ```

### Step 3: Set Up Frontend
1. Open a new terminal window and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install package dependencies:
   ```bash
   npm install
   ```
3. Set up the frontend environment file:
   ```bash
   cp .env.example .env
   ```
4. Start the Vite server (runs on `http://localhost:5173` by default):
   ```bash
   npm run dev
   ```

You can now register/login through the frontend interface using **Mock Login** in your local environment.

---

## 🔑 Environment Variables Reference

Ensure all keys are populated inside your local `.env` files.

### Backend Configurations (`backend/.env`)

| Variable Name | Type | Description | Local Example |
| :--- | :--- | :--- | :--- |
| `PORT` | Number | Port on which the API server listens. | `5000` |
| `DATABASE_URL` | String | Connection URI for the PostgreSQL instance. | `postgresql://postgres:secret@localhost:5432/student_showcase?schema=public` |
| `JWT_SECRET` | String | Key used for signing mock-login session tokens. | `your_local_jwt_secret_key` |
| `SESSION_SECRET`| String | Key used for Google OAuth HttpOnly cookie tokens. | `your_local_session_secret_key` |
| `GOOGLE_CLIENT_ID`| String | OAuth2 Client ID obtained from Google Developer Console. | `xxxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET`| String| OAuth2 Client Secret from Google Developer Console. | `GOCSPX-xxxx` |
| `FRONTEND_URL` | String | Origin URL of the frontend for CORS settings. | `http://localhost:5173` |

> [!NOTE]
> For local development, if `GOOGLE_CLIENT_ID` is omitted, Google login options are disabled, and you can authenticate seamlessly using the Dev **Mock Login** button.

### Frontend Configurations (`frontend/.env`)

| Variable Name | Type | Description | Local Example |
| :--- | :--- | :--- | :--- |
| `VITE_API_URL` | String | Backend API root URL (used for Axios requests). | `http://localhost:5000` |
| `VITE_BACKEND_URL` | String | Backend root path (used for direct redirections). | `http://localhost:5000` |

---

## 🚀 Production Deployment Plan

Deploying this portal to production requires configuring a cloud Database, hosting the Backend API with state support, and deploying the Frontend as a static SPA.

### 1. Database Deployment (Supabase or Neon)
We recommend **Supabase** or **Neon** for a zero-config, highly-performant PostgreSQL instance.

* **Setup Steps**:
  1. Register an account on [Supabase](https://supabase.com) or [Neon](https://neon.tech).
  2. Create a new project and select PostgreSQL.
  3. Navigate to **Database Settings** -> **Connection Strings** -> **URI**.
  4. Copy the connection string. Make sure to append the correct password.
  5. Save this URI to use as the `DATABASE_URL` in your backend deployment.

---

### 2. Backend Deployment (Render or Railway)
We recommend **Render** or **Railway** for fast Node.js Express server deployments.

* **Setup Steps (Render)**:
  1. Log into [Render](https://render.com) and click **New** -> **Web Service**.
  2. Connect your Git repository.
  3. Set the following settings:
     * **Root Directory**: `backend`
     * **Runtime**: `Node`
     * **Build Command**: `npm install && npx prisma generate`
     * **Start Command**: `npx prisma migrate deploy && npm start`
  4. Under **Advanced**, add the environment variables listed below.

* **Backend Environment Variables to set in Render/Railway Dashboard**:
  ```env
  NODE_ENV=production
  PORT=10000
  DATABASE_URL=your_supabase_or_neon_connection_string
  SESSION_SECRET=a_strong_random_key_64_chars_long
  JWT_SECRET=another_strong_random_key_64_chars_long
  FRONTEND_URL=https://your-frontend-domain.vercel.app
  GOOGLE_CLIENT_ID=your_production_google_oauth_client_id
  GOOGLE_CLIENT_SECRET=your_production_google_oauth_client_secret
  ```

---

### 3. Frontend Deployment (Vercel or Netlify)
We recommend **Vercel** for hosting React-Vite frontends due to its instant CDN loading and seamless routing fallback settings.

* **Setup Steps**:
  1. Log into [Vercel](https://vercel.com) and choose **Add New** -> **Project**.
  2. Select your repository.
  3. Set the following configurations:
     * **Framework Preset**: `Vite`
     * **Root Directory**: `frontend`
     * **Build Command**: `npm run build`
     * **Output Directory**: `dist`
  4. Under **Environment Variables**, add the variables listed below.
  5. Click **Deploy**.

* **Frontend Environment Variables to set in Vercel Dashboard**:
  ```env
  VITE_API_URL=https://your-backend-service.onrender.com
  VITE_BACKEND_URL=https://your-backend-service.onrender.com
  ```

> [!WARNING]
> Because Vite builds files statically, you must define environment variables **before** triggering the build. If you update variables in Vercel, trigger a redeployment to rebuild the application with the new values.

---

## 📖 API Documentation (OpenAPI)

We have provided a standard, fully-comprehensive **OpenAPI 3.0 (Swagger) Specification** file covering every single route, payload validation schema, response code, and authorization constraint.

* File Path: [openapi.json](file:///c:/Projects/project%2014/Student-Project-Showcase-Portal-/backend/openapi.json)

### How to View the API Documentation:
1. Open the [Swagger Editor](https://editor.swagger.io/).
2. Copy the contents of the `backend/openapi.json` file.
3. Paste it directly into the editor to instantly preview the interactive API reference.
4. Alternatively, you can install the `swagger-ui-express` npm package to host it natively on a `/api-docs` backend endpoint.

---

## 📈 Suggested Features for Extra Marks

To easily lock in the **10 additional marks** in the evaluation rubric, consider implementing these quick and impactful features that build on top of our existing code logic:

### Option 1: Live Notification Polling (Simulated Real-Time)
* **Effort**: 10 mins
* **Logic**: Instead of waiting for a page reload, make the notification bell dynamically update. In `frontend/src/components/NotificationBell.jsx`, add a React Query or standard `setInterval` polling interval:
  ```javascript
  // Fetch notifications status every 10 seconds automatically
  useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
    refetchInterval: 10000 // 10s polling
  });
  ```
* **Impact**: Creates a highly interactive, simulated real-time experience that mimics WebSockets without the deployment configuration hassle.

### Option 2: Search & Order Sorting for Showcase Catalog
* **Effort**: 15 mins
* **Logic**: Add standard text search and sorting ("Most Liked", "Most Recent") in `backend/src/controllers/projectController.js`:
  ```javascript
  const { page, limit, studentId, search, sortBy } = req.query;
  const where = {
    ...(studentId && { studentId }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    })
  };
  const orderBy = sortBy === 'likes' 
    ? { likes: { _count: 'desc' } } 
    : { createdAt: 'desc' };
  ```
  Add a simple search input and dropdown on the frontend `ProjectListPage` to bind these parameters.
* **Impact**: Drastically improves catalog navigation and recruiter search efficiency.

### Option 3: "Copy Share Link" Clipboard feature with Toast Alert
* **Effort**: 5 mins
* **Logic**: On the project details page (`ProjectDetailPage.jsx`), add a share button. When clicked, invoke the browser API to copy the URL:
  ```javascript
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Project link copied to clipboard!'); // or a beautiful custom toast
  };
  ```
* **Impact**: Enhances the project showcase sharing capability for recruiters to send portfolios to other hiring managers.