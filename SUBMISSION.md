# CollabDoc - Project Submission Metadata

This file outlines the deliverables completed for the **Collaborative Document Editor (CollabDoc)** submission.

---

## 1. Completed Features

* **JWT Authentication**: Password-protected login flow featuring bcryptjs hashing. Secure endpoints restrict access.
* **User Registration**: Custom Sign-Up page (`/register`) with field validation (name lengths, email format, duplicate email checks, and password match confirmations) that automatically registers new users and signs them in.
* **Modern Dashboard**: Segmented sections for owned and shared documents, instant search filter, and document creation hooks.
* **TipTap Rich Text Editor**: Toolbar integrations supporting Heading levels, Bold, Italic, Underline, and lists. Uses decoupled mounting logic to guarantee typing stability.
* **Auto-Save Heartbeat**: Background sync saves changes every 5 seconds, reducing user friction.
* **Robust File Uploads**: Multer-driven `.txt` and `.md` file parsing that automatically converts imports into editable documents.
* **Document Sharing**: Granular Viewer/Editor options allowing owners to share files with other seeded accounts via email.
* **Responsive Layout**: Tailwind glassmorphic theme containing drawer toggles for responsive mobile interfaces.
* **Automated Integration Tests**: 11 API endpoints fully tested with Jest and Supertest.
* **Database Isolation**: Isolated integration test transactions to a dedicated `database.test.sqlite` file, protecting active local development states from being cleared.

---

## 2. Seed Demo Credentials

* **User 1 (Alice)**
  * **Email**: `alice@test.com`
  * **Password**: `123456`
* **User 2 (Bob)**
  * **Email**: `bob@test.com`
  * **Password**: `123456`
* **User 3 (Tejashree)**
  * **Email**: `tejashree@gmail.com`
  * **Password**: `123456`
* **User 4 (Test)**
  * **Email**:'test@gmail.com'
  * **Password**: 'Test1234'

---

## 3. Known Limitations & Trade-offs
* **Concurrent Editing Conflicts**: The application operates on a single-write-lock principle (the last update request sent overwrites the database content). If two users edit a document simultaneously, their changes do not auto-merge in real-time (like Operational Transformation).
* **Local SQLite Database Creation**: In local development, the app defaults to SQLite mode if local MySQL credentials are not specified, generating a `database.sqlite` file in the server directory.

---

## 4. Deployment Targets
* **Frontend**: Vercel (React + Vite SPA routing)
* **Backend**: Render (Express Node server)
* **Database**: Railway MySQL (remote SQL host)

---

## 5. Future Enhancements
* Implement WebSockets to display online editors and cursor positions.
* Integrate Diff-match-patch algorithms to allow file version rollbacks.
* Add inline commenting panels.
