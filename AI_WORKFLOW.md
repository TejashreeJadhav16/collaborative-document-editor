# AI Workflow Documentation

This document describes how Artificial Intelligence accelerated the design and development of the **Collaborative Document Editor**, details code modifications made during refinement, and describes verification steps.

---

## 1. AI Tools Used
* **Antigravity AI Coding Assistant**: Executed file creations, modifications, shell diagnostics, and test verifications.
* **Sequelize, TipTap, Tailwind CSS Documentation Models**: Informed the syntax configuration of rich-text toolbar operations and relational mappings.

---

## 2. Where AI Accelerated Development
* **Environment Diagnostics**: Proactively inspected active system services to identify the MySQL service name (`MySQL82`) and status.
* **SQLite Fallback Design**: Devised the Sequelize fallback architecture dynamically to guarantee immediate local running without breaking MySQL requirements.
* **Component Boilerplate**: Automatically wired Tailwind CSS responsive utilities (collapsible drawers and sidebar menu triggers) for mobile layout compatibility.
* **Test Suite Generation**: Drafted Jest + Supertest integration assertions testing JWT generation and document permission rules.

---

## 3. Code Modifications and Refinement
* **Empty Title Creation Validation**:
  * *Initial Code*: Allowed document creation with blank titles, defaulting them to `'Untitled Document'` under all circumstances.
  * *Refined Code*: Added strict input validation rejecting explicit blank strings or whitespace-only submissions with a 400 Bad Request status. This fixed failing Jest test cases and aligned with database integrity standards.
* **Bcrypt Native Module Compilation**:
  * *Decision*: Used `bcryptjs` instead of native `bcrypt`.
  * *Reason*: Native `bcrypt` requires node-gyp and C++ compiler tools on Windows, which frequently causes installation failures. Using `bcryptjs` guarantees successful out-of-the-box dependencies compilation on any platform.

---

## 4. Correctness, UX, and Reliability Verification
* **Automated Correctness**:
  * All 11 integration tests in `api.test.js` pass with 100% success.
  * Tests are run on an isolated SQLite DB in standard in-memory configurations.
* **UX & Permission Checks**:
  * Verified that read-only access (Viewer) successfully sets `editor.setEditable(false)` and disables Save/Rename elements.
  * Verified that file imports successfully parse `.txt` and `.md` formats, convert contents to document text, rename the document to the file name, and discard temporary local files.
