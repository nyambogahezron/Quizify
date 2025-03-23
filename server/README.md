# Quizify App Server

## Quiz Application Backend

Quizify is a real-time quiz application backend built with Node.js, Express, TypeScript, MongoDB, and Socket.IO. The application includes features for quizzes, achievements, leaderboards, and daily tasks.

## Setup and Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file based on the `env-example.txt` provided
4. Start the development server: `npm run dev`

## Data Import

To import the quiz data and set up an admin user:

```bash
# Make sure MongoDB is running
npm run build
node dist/scripts/importQuizzes.js
```

This will:

- Create an admin user (if not already exists)
  - Email: admin@quizify.com
  - Password: admin123
- Import quizzes from the data/quizzes.json file

## Features

- **Authentication**: User registration, login, and profile management
- **Quizzes**: Create, read, update, and delete quizzes
- **Real-time**: Socket.IO integration for real-time quiz updates
- **Leaderboards**: Global and quiz-specific leaderboards
- **Achievements**: Unlock achievements based on user activities
- **Daily Tasks**: Complete daily tasks for rewards
- **Admin Panel**: Special routes for admin to manage quizzes and users

## API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/auth/logout` - Logout

### Quiz Management

- `GET /api/v1/quizzes` - Get all public quizzes
- `GET /api/v1/quizzes/:id` - Get a specific quiz
- `POST /api/v1/quizzes` - Create a new quiz (authenticated)
- `PUT /api/v1/quizzes/:id` - Update a quiz (owner only)
- `DELETE /api/v1/quizzes/:id` - Delete a quiz (owner only)

### Admin Routes (Admin only)

- `GET /api/v1/admin/dashboard` - Get dashboard statistics
- `GET /api/v1/admin/quizzes` - Get all quizzes (with admin privileges)
- `POST /api/v1/admin/quizzes` - Create a quiz as admin
- `PUT /api/v1/admin/quizzes/:id` - Update any quiz
- `DELETE /api/v1/admin/quizzes/:id` - Delete any quiz
- `GET /api/v1/admin/users` - Get all users

## Tech Stack

- Node.js
- Express
- TypeScript
- MongoDB (Mongoose)
- Socket.IO
- JWT Authentication
