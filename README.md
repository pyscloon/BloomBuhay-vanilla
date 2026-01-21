🌸 BloomBuhay – Para sa buhay na bumubuhay.

A Maternal Wellness Web App for Every Stage of Motherhood

🩷 Overview

BloomBuhay is a maternal wellness web application designed to guide, support, and empower Filipino mothers through pregnancy, postpartum, and early motherhood.

The app combines health tracking, milestone visualization, emotional wellness, and educational content in one secure, user-friendly space.

It allows users to log health data, visualize baby growth, manage tasks and appointments, explore articles, and relax with baby sounds — all in one place.

💡 Problem Statement

Many Filipino mothers struggle to track their health and find reliable, centralized information throughout motherhood.
Most existing apps focus only on pregnancy and neglect postpartum care, mental health, and long-term engagement.

BloomBuhay solves this by providing a holistic, continuous digital companion for mothers — before, during, and after pregnancy.

## 🚀 Getting Started

### Prerequisites

- **Node.js** v16 or higher
- **PostgreSQL** database
- **Git**
- **npm** or **yarn**

### Quick Start (5 minutes)

#### 1. Clone the Repository

```bash
git clone https://github.com/auauron/BloomBuhay.git
cd BloomBuhay
```

#### 2. Setup Backend Server

```bash
cd server
cp .env.example .env
```

**Generate a JWT Secret:**

**Linux/Mac:**
```bash
openssl rand -base64 32
```

**Windows (PowerShell):**
```bash
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

Copy the generated secret and paste it into `server/.env` as `JWT_SECRET`.

**Install dependencies and setup database:**

```bash
npm install
npx prisma migrate dev
npx prisma generate
```

#### 3. Setup Frontend Client

```bash
cd ../client
npm install
```

#### 4. Start the Application

From the root directory:

```bash
npm run dev
```

**Access the app:**
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000

---

## 📁 Project Structure

- **`client/`** - React frontend application
- **`server/`** - Node.js/Express backend API
- **`docs/`** - Project documentation

For detailed structure breakdown, see [docs/ProjectStructure.md](docs/ProjectStructure.md).

---

## 🛠️ Available Scripts

### Frontend

```bash
cd client

# Start development server
npm start

# Build for production
npm run build

# Run Storybook (component development)
npm run storybook
```

### Backend

```bash
cd server

# Start development server with hot reload
npm run dev

# Build for production
npm run build

# View Prisma Studio (database GUI)
npx prisma studio
```

---

## 🗄️ Database Management

### View Database with Prisma Studio

```bash
cd server
npx prisma studio
```

This opens a GUI at `http://localhost:5555` where you can browse and edit database records.

### Run Migrations

```bash
cd server
npx prisma migrate dev
```

### Generate Prisma Client

```bash
cd server
npx prisma generate
```

---

## 📚 Documentation

- [Server Setup Guide](server/SETUP.md) - Detailed backend configuration
- [API Documentation](server/API_DOCS.md) - Complete API endpoint reference
- [Database Documentation](server/DATABASE_DOCS.MD) - Database setup and management
- [Project Structure](docs/ProjectStructure.md) - Codebase organization

---

## 🔒 Security Features

- Bcrypt password hashing
- JWT token authentication (24h expiry)
- Input validation
- CORS protection
- Environment variable management

---

## 🧪 Testing

### API Testing

Use Insomnia, Postman, or Thunder Client to test API endpoints. See [server/API_DOCS.md](server/API_DOCS.md) for example requests.

```bash
# Example with curl
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"mama@example.com","password":"password123"}'
```

---

### Prisma Migration Issues

```bash
# Reset database and run migrations
cd server
npx prisma migrate reset
npx prisma generate
```

---

## 🥷 Developed by Team Mixed Berries

---

## 📄 License

ISC

---

## 💬 Support & Feedback

For issues, feature requests, or questions, please open an issue on GitHub or contact the development team.

Happy blooming! 🌸