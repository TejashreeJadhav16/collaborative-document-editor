# CollabDoc - Collaborative Document Editor

CollabDoc is a production-quality, full-stack collaborative rich-text document editor inspired by Google Docs. The application is built with a React + Vite frontend and a Node.js + Express backend. Data is persisted in a MySQL database with a built-in zero-configuration SQLite fallback for seamless local development.

---

# 🚀 Live Demo

### Frontend
https://collaborative-document-editor-k5az3wp6a.vercel.app

### Backend API
https://collaborative-document-editor-mff1.onrender.com

### GitHub Repository
https://github.com/TejashreeJadhav16/collaborative-document-editor

### Demo Video
https://drive.google.com/file/d/10Qxao1btW6JiQQlNRzd3KbjTH_bMLlzn/view?usp=sharing

---

# Features

### Authentication
- JWT-based login system
- Secure password hashing using bcrypt
- Protected routes
- Persistent login using localStorage

### Dashboard
- View owned documents
- View shared documents
- Search documents
- Create new documents
- Delete documents

### Rich Text Editor
- Built using TipTap
- Bold, Italic, Underline
- Headings
- Bullet & Ordered Lists
- Auto Save every 5 seconds
- Manual Save

### Document Access Control
- Owner permissions
- Viewer (Read Only)
- Editor (Read & Write)

### File Import
- Upload `.txt`
- Upload `.md`
- Automatically converts uploaded files into editable documents

### Sharing System
- Share documents by email
- Viewer & Editor permissions
- Secure access control

### Responsive Design
- Glassmorphism UI
- Tailwind CSS
- Mobile responsive

---

# Tech Stack

## Frontend
- React (Vite)
- React Router DOM
- Axios
- Tailwind CSS
- TipTap Rich Text Editor
- Lucide React Icons

## Backend
- Node.js
- Express.js
- Sequelize ORM
- MySQL (mysql2)
- SQLite (Fallback)
- JWT Authentication
- bcryptjs
- Multer

## Testing
- Jest
- Supertest

---

# Architecture

```
React (Vite)
      │
      ▼
 Express REST API
      │
      ▼
 JWT Authentication
      │
      ▼
 Sequelize ORM
      │
 ┌────┴────┐
 ▼         ▼
MySQL   SQLite
```

---

# Environment Variables

## Backend (`server/.env`)

```env
PORT=5000
DB_MODE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=collaborative_doc_editor
JWT_SECRET=super_secret_jwt_sign_key_987654321
NODE_ENV=development
```

If MySQL is unavailable, the application automatically switches to SQLite (`server/database.sqlite`) for local development.

---

## Frontend (`client/.env`)

### Local Development

```env
VITE_API_URL=http://localhost:5000/api
```

### Production

```env
VITE_API_URL=https://collaborative-document-editor-mff1.onrender.com/api
```

---

# Installation & Setup

## Prerequisites

- Node.js (v18+)
- MySQL (Optional)

### Backend

```bash
cd server
npm install
npm run dev
```

or

```bash
npm start
```

Backend runs on:

```
http://localhost:5000
```

---

### Frontend

```bash
cd client
npm install
npm run dev
```

Frontend runs on:

```
http://localhost:5173
```

---

# Running Tests

```bash
cd server
npm test
```

---

# Demo Credentials

### Alice

Email

```
alice@test.com
```

Password

```
123456
```

---

### Bob

Email

```
bob@test.com
```

Password

```
123456
```

---

### Tejashree

Email

```
tejashree@gmail.com
```

Password

```
123456
```

---

### Test User

Email

```
test@gmail.com
```

Password

```
Test123
```

---

# AI Assistance

AI tools were used during development for:

- Project planning
- Code generation
- UI improvements
- Debugging
- Documentation
- Deployment troubleshooting

All generated code was reviewed, tested, modified, and integrated manually.

---

# Future Improvements

- Real-time collaboration using Socket.io
- CRDT/Yjs integration
- Document Version History
- Comments & Mentions
- Real-time Notifications
- Export as PDF/DOCX
- Dark/Light Theme
- Activity Logs
- Email Notifications
- User Profile Management

---

# Author

**Tejashree Jadhav**

GitHub:
https://github.com/TejashreeJadhav16
