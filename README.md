# CollabDoc - Collaborative Document Editor

CollabDoc is a production-quality, full-stack collaborative rich-text document editor inspired by Google Docs. The application is built with a React + Vite frontend and a Node.js + Express backend. Data is persisted in a MySQL database with a built-in zero-configuration local SQLite fallback for seamless out-of-the-box operation.

## Features

1. **Authentication**: JWT-based login system with seeded users (`alice@test.com` and `bob@test.com`). Tokens are stored in localStorage, and all editing routes are secure.
2. **Dashboard**: Sleek panel listing owned documents and documents shared with you, search capabilities, delete options, and dynamic file creation.
3. **Rich Text Editor**: Powered by TipTap, supporting standard formatting (bold, italic, underline, headers, bullet/ordered lists) and automated background auto-saving (every 5 seconds) alongside explicit saves.
4. **Document Access Control**: Real-time permission evaluation. If a user is shared with read-only access (Viewer), editing and renaming features are disabled.
5. **File Import**: Converts local `.txt` and `.md` files into editable online documents automatically upon upload.
6. **Sharing System**: Owners can share documents with other users by email and configure Viewer (read-only) or Editor (read-write) status.
7. **Responsive Design**: Designed with glassmorphism aesthetics using Tailwind CSS, featuring collapsible drawers and overlays for mobile viewports.

---

## Tech Stack

* **Frontend**: React (Vite), React Router DOM, Axios, Tailwind CSS, TipTap Rich Text Editor (StarterKit, Underline), Lucide Icons.
* **Backend**: Node.js, Express.js, Sequelize ORM, MySQL (mysql2), SQLite (sqlite3) fallback, JWT, bcryptjs, Multer.
* **Testing**: Jest, Supertest.

---

## Environment Variables

### Backend (`server/.env`)
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
*Note: If `DB_MODE` is set to `mysql` but the database is unreachable or credentials fail, the server automatically initializes and connects to a fallback SQLite file (`server/database.sqlite`) to ensure instant local runtime.*

### Frontend (`client/.env`)
*(Optional)* Create a `.env` in the `client` directory to configure the backend API endpoint.
```env
VITE_API_URL=http://localhost:5000/api
```

---

## Installation & Setup

### Prerequisites
* [Node.js](https://nodejs.org/) (v18+)
* *Optional*: MySQL server running locally on port 3306. If no MySQL database exists, the app will run transparently on SQLite out-of-the-box.

### 1. Configure and Run Backend
1. Navigate to the backend directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up the `.env` configuration file. If using MySQL, make sure to create the database matching your `DB_NAME` (e.g. `CREATE DATABASE collaborative_doc_editor;`). If using SQLite, no database creation is needed.
4. Start the backend server:
   * Production mode: `npm start`
   * Developer hot-reload: `npm run dev`

The server will run on `http://localhost:5000` and automatically seed the database with the test users.

### 2. Configure and Run Frontend
1. Navigate to the frontend directory:
   ```bash
   cd ../client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

Open your browser and navigate to `http://localhost:5173`.

---

## Running Integration Tests

Our backend is tested using Jest and Supertest. The test environment automatically switches to an in-memory SQLite database configuration to protect development databases.

To execute the tests:
```bash
cd server
npm test
```

---

## Demo Credentials

You can log in instantly using the quick connect buttons on the login screen or enter the following seeded users manually:

* **User 1 (Alice)**
  * **Email**: `alice@test.com`
  * **Password**: `123456`
* **User 2 (Bob)**
  * **Email**: `bob@test.com`
  * **Password**: `123456`

---

## Future Improvements

* **Websockets (Socket.io)**: Support multi-user collaborative cursor editing (OT or CRDTs like Yjs) so editors see active updates character-by-character.
* **Document History**: Track document revision history, allowing users to restore previous versions.
* **Comments & Mentions**: Enable adding comment threads to selected text inside the editor.
