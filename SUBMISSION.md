# CollabDoc - Project Submission Metadata

This document summarizes the deliverables completed for the **Collaborative Document Editor (CollabDoc)** take-home assignment.

---

# Project Links

### GitHub Repository
https://github.com/TejashreeJadhav16/collaborative-document-editor

### Live Frontend
https://collaborative-document-editor-k5az3wp6a.vercel.app

### Live Backend
https://collaborative-document-editor-mff1.onrender.com

### Demo Video
https://drive.google.com/file/d/10Qxao1btW6JiQQlNRzd3KbjTH_bMLlzn/view?usp=sharing

---

# 1. Completed Features

### Authentication
- JWT-based authentication
- Secure password hashing using bcryptjs
- Protected API endpoints
- Persistent login using localStorage

### User Registration
- Custom Sign-Up page (`/register`)
- Name validation
- Email format validation
- Duplicate email validation
- Password validation
- Automatic login after successful registration

### Dashboard
- View owned documents
- View shared documents
- Create documents
- Search documents
- Delete documents

### Rich Text Editor
- TipTap Editor
- Bold
- Italic
- Underline
- Headings
- Bullet Lists
- Ordered Lists
- Stable editor initialization
- Manual Save
- Auto Save every 5 seconds

### Document Sharing
- Share documents by email
- Viewer (Read Only)
- Editor (Read & Write)
- Permission-based access control

### File Upload
- Upload `.txt`
- Upload `.md`
- Automatic conversion into editable documents

### Responsive UI
- Tailwind CSS
- Glassmorphism design
- Responsive navigation
- Mobile drawer support

### Testing
- Backend API testing using Jest & Supertest
- Integration tests covering authentication and document APIs

### Database Support
- MySQL database support
- Automatic SQLite fallback for local development
- Separate SQLite database for testing

---

# 2. Demo Credentials

### User 1 (Alice)

Email

```
alice@test.com
```

Password

```
123456
```

---

### User 2 (Bob)

Email

```
bob@test.com
```

Password

```
123456
```

---

### User 3 (Tejashree)

Email

```
tejashree@gmail.com
```

Password

```
123456
```

---

### User 4 (Test)

Email

```
test@gmail.com
```

Password

```
Test1234
```

---

# 3. AI Usage

AI tools were used throughout development for:

- Project planning
- Architecture design
- React component generation
- Backend API implementation
- Authentication workflow
- UI refinement
- Debugging deployment issues
- Documentation preparation

All generated code was reviewed, modified, tested, and integrated manually before submission.

---

# 4. Known Limitations & Trade-offs

- Concurrent editing currently follows a **last-write-wins** strategy.
- Real-time collaborative editing (Operational Transformation / CRDT) is not implemented.
- Comments and version history are not yet available.
- SQLite is intended for local development; production deployments are better suited to MySQL or PostgreSQL.

---

# 5. Deployment

### Frontend

- Platform: **Vercel**
- Framework: React + Vite

### Backend

- Platform: **Render**
- Framework: Node.js + Express

### Database

- MySQL
- SQLite fallback for local development

---

# 6. Architecture

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

# 7. Future Enhancements

- Real-time collaboration using Socket.io
- CRDT (Yjs) integration
- Live cursor presence
- Document version history
- Comments & Mentions
- Activity logs
- Email notifications
- Export documents as PDF/DOCX
- User profile management
- Dark/Light theme
- Advanced search and filtering

---

# 8. Submission Checklist

- ✅ Source code uploaded to GitHub
- ✅ Frontend deployed on Vercel
- ✅ Backend deployed on Render
- ✅ README completed
- ✅ Project metadata included
- ✅ Demo video recorded
- ✅ Environment variables documented
- ✅ Installation instructions provided
- ✅ Demo credentials included
