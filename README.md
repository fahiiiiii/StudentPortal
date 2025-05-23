# StudentPortal

A RESTful API for managing users and students with role-based authentication.

## Features

- User authentication (signup/login)
- Role-based access control (admin/teacher)
- JWT-based authentication
- Student management (CRUD operations)
- Password hashing with bcrypt
- Input validation with express-validator

## Installation

1. Clone the repository
```bash
git clone https://github.com/fahiiiiii/StudentPortal
cd StudentPortal
```

2. Initialize and install dependencies
```bash
# Initialize package.json
npm init -y

# Install required dependencies
npm install express body-parser jsonwebtoken bcrypt dotenv express-validator
npm install sequelize pg pg-hstore

# Install development dependencies
npm i --save-dev nodemon
```

3. Set up environment variables
```bash
# Create .env file based on dev.env template
cp dev.env .env

# Edit the .env file with your specific configuration values
# Required environment variables:
PORT=3000
JWT_SECRET=your_jwt_secret_key
```

4. Start the database
```bash
# Start the database
docker-compose up --build

# Database will be available at:
# Host: localhost
# Port: 5432
# Username: postgres
# Password: fahimah123
# Database: myapp

# To stop the database
docker-compose down
```

5. Start the server
```bash
# Using Node.js
npm start

# Using Nodemon for development (auto-reload on changes)
nodemon server.js
# or
nodemon server
```

## Project Structure

```
student-management-system/
│
├── config/
│   └── db.js                 # Database connection configuration
│
├── middleware/
│   └── auth.js               # JWT authentication middleware
│
├── models/
│   ├── User.js               # User model definition
│   └── Student.js            # Student model definition
│
├── routes/
│   └── api/
│       └── users.js          # User and student route handlers
│
├── .env                      # Environment variables (create from dev.env)
├── docker-compose.yml        # Docker configuration for PostgreSQL
├── server.js                 # Main application entry point
└── README.md                 # This documentation
```

## API Endpoints

### Authentication

#### Sign Up
- **URL:** `/signup`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "username": "string",
    "password": "string (min 6 characters)",
    "role": "admin" or "teacher"
  }
  ```
- **Response:** 
  ```json
  {
    "message": "User created successfully",
    "user": {
      "username": "string",
      "role": "string",
      "id": "number"
    }
  }
  ```

#### Login
- **URL:** `/login`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Response:**
  ```json
  {
    "id": "number",
    "username": "string",
    "role": "string",
    "accessToken": "string"
  }
  ```

### Student Management

#### Create Student
- **URL:** `/students`
- **Method:** `POST`
- **Authentication:** Required (JWT token in Authorization header)
- **Body:**
  ```json
  {
    "name": "string",
    "age": "number",
    "grade": "string"
  }
  ```
- **Response:** Created student object

#### Get Students
- **URL:** `/students`
- **Method:** `GET`
- **Authentication:** Required (JWT token in Authorization header)
- **Response:** 
  - For teachers: List of students created by the teacher
  - For admins: List of all students

#### Update Student
- **URL:** `/students/:id`
- **Method:** `PUT`
- **Authentication:** Required (JWT token in Authorization header)
- **Authorization:** Admin can update any student, teachers can only update students they created
- **Body:** Fields to update
  ```json
  {
    "name": "string",
    "age": "number",
    "grade": "string"
  }
  ```
- **Response:** Updated student object

#### Delete Student
- **URL:** `/students/:id`
- **Method:** `DELETE`
- **Authentication:** Required (JWT token in Authorization header)
- **Authorization:** Admin can delete any student, teachers can only delete students they created
- **Response:** Deleted student object with success message

## Authentication

All student management routes require authentication using JWT.
Include the token in the Authorization header:

```
Authorization: Bearer <your_token>
```

## Database Models

### User
- **id**: INT, Primary Key, Auto Increment
- **username**: STRING(100), Not Null
- **password**: STRING(255), Not Null (Hashed)
- **role**: ENUM('admin', 'teacher'), Not Null
- **createdAt**: DATETIME
- **updatedAt**: DATETIME

### Student
- **id**: INT, Primary Key, Auto Increment
- **name**: STRING(100), Not Null
- **age**: INT, Not Null
- **grade**: STRING(10), Not Null
- **createdBy**: INT, Foreign Key (references User.id)
- **createdAt**: DATETIME
- **updatedAt**: DATETIME

## Error Handling

The API returns appropriate status codes and error messages:
- 201: Resource created successfully
- 200: Request successful
- 400: Bad request (validation errors)
- 404: Resource not found
- 403: Forbidden (unauthorized access)
- 500: Server error

