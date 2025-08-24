```
---
```markdown
# README.md

A minimal, full-stack issue tracker built with Next.js, Prisma, and SQLite.

## Features

- **Authentication:** User signup and login with JWT stored in an HTTP-only cookie.
- **RBAC:** Differentiates between 'USER' and 'ADMIN' roles.
  - **ADMIN:** Can create, read, update, and delete any issue or comment.
  - **USER:** Can create, read, update, and delete only their own issues.
- **API Routes:**
  - `GET /api/issues`: List issues with optional pagination and filtering by status.
  - `POST /api/issues`: Create a new issue.
  - `GET /api/issues/[id]`: Get a single issue.
  - `PUT /api/issues/[id]`: Update an issue.
  - `DELETE /api/issues/[id]`: Delete an issue.
  - `POST /api/issues/[id]/comments`: Add a comment to an issue.
- **Frontend:**
  - List issues on the homepage.
  - Filter issues by "open" or "closed" status.
  - Create and edit issues.
  - Add comments to issues.
  - Optimistic UI for creating and closing issues for a fast user experience.

## Setup

1.  **Clone the repository and install dependencies:**
    ```bash
    # Create the directory structure from the top of the code block.
    # Then, navigate into the project folder.
    npm install
    ```

2.  **Set up the database:**
    This project uses **Prisma** with a **SQLite** database, which is a file-based database. This means you don't need to install a separate database server.

    ```bash
    # This command creates the database file and applies the schema.
    npx prisma migrate dev --name init
    ```

3.  **Seed the database:**
    This will create a sample admin and user, plus some issues for testing.

    ```bash
    npx prisma db seed
    ```
    - **Admin account:** email: `admin@example.com`, password: `password123`
    - **Regular user account:** email: `user@example.com`, password: `password123`

4.  **Run the application:**
    ```bash
    npm run dev
    ```
    The app will be accessible at `http://localhost:3000`.

## Database Schema (Prisma)

This is the schema that defines our data models and relationships.

```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        String    @id @default(uuid())
  email     String    @unique
  password  String
  role      Role      @default(USER)
  issues    Issue[]
  comments  Comment[]
}

model Issue {
  id        String    @id @default(uuid())
  title     String
  body      String
  status    Status    @default(OPEN)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  author    User      @relation(fields: [authorId], references: [id])
  authorId  String
  comments  Comment[]
}

model Comment {
  id        String   @id @default(uuid())
  text      String
  createdAt DateTime @default(now())
  author    User     @relation(fields: [authorId], references: [id])
  authorId  String
  issue     Issue    @relation(fields: [issueId], references: [id], onDelete: Cascade)
  issueId   String
}

enum Role {
  USER
  ADMIN
}

enum Status {
  OPEN
  CLOSED
}
```

## Example cURL Commands

Replace `[JWT_TOKEN]` with the token you receive after a successful login.

1.  **Login as admin:**
    ```bash
    curl -X POST -H "Content-Type: application/json" \
      -d '{"email":"admin@example.com", "password":"password123"}' \
      http://localhost:3000/api/auth/login
    ```

2.  **Create a new issue (as logged-in user):**
    ```bash
    curl -X POST -H "Content-Type: application/json" \
      -H "Cookie: token=[JWT_TOKEN]" \
      -d '{"title":"New Issue Title", "body":"The issue description."}' \
      http://localhost:3000/api/issues
    ```

3.  **List all issues with filtering:**
    ```bash
    # List all issues
    curl http://localhost:3000/api/issues

    # List only open issues
    curl http://localhost:3000/api/issues?status=open&page=1&page_size=10
    ```
---