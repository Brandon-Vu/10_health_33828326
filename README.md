## NutriLog 

NutriLog is a web-based meal logging application that allows users to record meals, automatically estimate calories using the Edamam Food Database API, and track daily and weekly calorie totals. The application includes user authentication, database persistence, and search functionality.

## Features
- User authentication (register, login, logout)
- Secure password hashing using bcrypt
- Log meals with automatic calorie estimation via Edamam API
- Daily and weekly calorie summaries
- Edit and delete logged meals
- Search logged meals stored in the database
- MySQL database persistence
- Server-side rendering using EJS templates

## Technologies Used

Application Tier
- Node.js
- Express.js
- EJS (Embedded JavaScript templates)
- bcrypt (password hashing)
- express-session (session management)

Data Tier
- MySQL
- mysql2 (promise-based driver)

External API
- Edamam Food Database API: Used to estimate calories from natural language food input (e.g. “2 bananas”).

## Project Structure
```text
NutriLog/
│
├── models/
│   └── db.js
│
├── routes/
│   ├── auth.js
│   ├── meals.js
│   └── api.js
│
├── views/
│   ├── layout.ejs
│   ├── login.ejs
│   ├── register.ejs
│   ├── meals.ejs
│   ├── edit_meal.ejs
│   ├── search.ejs
│   └── about.ejs
│
├── create_db.sql
├── insert_test_data.sql
├── index.js
├── package.json
└── .env
```
## Installation Instructions

1. Installation Instructions
- git clone https://github.com/Brandon-Vu/10_health_33828326
- cd NutriLog

2. Install Dependencies
- npm install

## Default Login Credentials
For marking and testing purposes:
- Username: gold
- Password: smiths

## API Notes (Edamam)
- The Edamam Food Database API is used to estimate calories.
- The free tier has rate limits, so some uncommon or rapid requests may fail.
- If a food item cannot be recognised, the application handles the error gracefully and allows manual continuation.

## User Journey

- User logs in or registers
- User is redirected to the meals dashboard
- Meals can be logged using natural language (e.g. “10 strawberries”)
- Calories are fetched via the API
- Meals are stored in the database
- Users can edit, delete, or search previous meals
- Daily and weekly summaries update automatically

## Advanced Techniques

- External REST API integration (Edamam)
- Password hashing and authentication
- Server-side rendering with EJS
- Error handling for failed API requests
- SQL scripts for reproducible setup
