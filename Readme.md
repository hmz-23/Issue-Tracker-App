# Issue Tracker App
This is a full-stack web application designed to help teams and individuals track issues, bugs, and tasks. It provides a simple, modern interface for creating, viewing, and managing issues.

## ✨ Features
User Authentication: Secure signup and login functionality.

Issue Creation: Authenticated users can create new issues with a title and description.

Issue Listing: View all issues in a clean, filterable list.

Full-Stack Architecture: A robust backend handles data persistence and API routes, while a fast and responsive frontend provides a great user experience.

## 💻 Technologies Used
This project is built using a modern JavaScript stack.

### Frontend:

Next.js: A React framework for building server-side rendered and static websites.

React: A JavaScript library for building user interfaces.

Tailwind CSS: A utility-first CSS framework for rapid UI development.

### Backend:

Express.js: A minimal and flexible Node.js web application framework.

Prisma: A modern database toolkit for ORMs (Object-Relational Mapping).

SQLite: A lightweight, file-based database for local development.

## 🚀 Getting Started
Follow these steps to get the project up and running on your local machine.

### Prerequisites:
Node.js (v18 or higher)\
npm (v8 or higher) or yarn\
Git\

### 1. Clone the Repository
Clone this repository to your local machine:
```
git clone https://github.com/YOUR_USERNAME/Issue-Tracker-App.git
cd Issue-Tracker-App
```

### 2. Install Dependencies
Install the necessary npm packages for both the frontend and backend.

###  Install backend dependencies (for the Express.js server)
`npm install`

###  Navigate to the Next.js frontend directory
`cd issue-tracker-nextjs`

###  Install frontend dependencies
`npm install`

###  Navigate back to the root
`cd ..`

### 3. Set Up the Database
Set up your database using Prisma. This will create the dev.db file and the necessary tables.

###  Generate Prisma client and migrate the database schema
`npx prisma migrate dev --name init`

###  Seed the database with some initial data
`npx prisma db seed`

### 4. Run the Servers
You will need to run the backend and frontend servers in two separate terminal windows.

## Terminal 1 (Backend):

###  Start the Express.js backend server
`node server.js`

## Terminal 2 (Frontend):

###  Start the Next.js frontend server
`npm run dev`

Your application should now be running at http://localhost:3000.

## 📂 Project Structure
issue-tracker-nextjs/: The Next.js frontend application.

pages/: The Next.js routes and pages.

components/: Reusable React components.

prisma/: Contains the Prisma schema, migrations, and seed file.

server.js: The entry point for the Express.js backend API.

package.json: Project dependencies and scripts.

👋 Contributing
Contributions are always welcome! If you find a bug or have an idea for a new feature, please open an issue or submit a pull request.









