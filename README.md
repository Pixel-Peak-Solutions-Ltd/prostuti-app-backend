# Prostuti App Backend

## Overview

This project is the robust backend for the Prostuti application, built using TypeScript, Express, and MongoDB. It provides a solid foundation with built-in Zod validations, comprehensive error handling, and follows best practices for Node.js backend development.

## Features

-   **TypeScript**: Strongly typed language for enhanced developer experience and code quality.
-   **Express.js**: Fast, unopinionated, minimalist web framework for Node.js.
-   **MongoDB with Mongoose**: Powerful ODM for MongoDB integration.
-   **Zod Validation**: Runtime type checking and validation for request data.
-   **Error Handling**: Comprehensive error handling middleware for consistent error responses.
-   **CORS**: Cross-Origin Resource Sharing enabled.
-   **Cookie Parser**: Middleware for parsing cookies.
-   **Environment Variables**: Dotenv for managing environment variables.
-   **ESLint & Prettier**: Code linting and formatting for consistent code style.

## Getting Started

1. Clone the repository:

    ```
    git clone https://github.com/Pixel-Peak-Solutions-Ltd/prostuti-app-backend.git
    ```

2. Install dependencies:

    ```
    npm install
    ```

3. Set up environment variables:

    - Copy `.env.example` to `.env`
    - Fill in the required environment variables

4. Start the development server:
    ```
    npm run dev
    ```

## Scripts

-   `npm run build`: Compile TypeScript to JavaScript
-   `npm start`: Start the production server
-   `npm run dev`: Start the development server with hot-reloading
-   `npm run lint`: Run ESLint
-   `npm run lint:fix`: Run ESLint and fix issues
-   `npm run prettier`: Run Prettier
-   `npm run prettier:fix`: Run Prettier and fix issues

## Project Structure
