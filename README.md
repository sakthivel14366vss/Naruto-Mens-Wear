# Naruto Mens Wear - Project Documentation

## Overview

**Naruto Mens Wear** is an application designed to manage bills, stocks, and accounts for the client. It is built with a modern tech stack for efficient development and scalability.

## 1. Tech Stack

### Frontend

- **Svelte**: A modern JavaScript framework for building fast, reactive user interfaces.

### Backend

- **SvelteKit**: A framework for building server-side rendered applications with Svelte.

### Database

- **MongoDB**: A NoSQL database for managing data efficiently and flexibly.

## 2. NPM Libraries Used

- **MongoClient**: A MongoDB client for managing database connections and operations.
- **Tailwind CSS**: A utility-first CSS framework for rapid UI development.
- **ESLint**: A tool for identifying and fixing problems in JavaScript code.
- **Prettier**: A code formatter to ensure consistent code styling across the project.

## 3. Development Environment

We recommend using **Visual Studio Code (VSCode)** as the Integrated Development Environment (IDE) for this project. Below are the recommended extensions to improve your development workflow:

- **Svelte for VSCode**: Provides Svelte syntax highlighting, autocompletion, and other useful features.
- **Tailwind CSS IntelliSense**: Offers autocompletion and documentation for Tailwind CSS classes.
- **Prettier - Code formatter**: Formats code automatically according to predefined style rules.
- **ESLint**: Ensures your code follows best practices and avoids common errors.

## 4. Folder Structure

This project follows a **feature-based folder structure** to organize code by functionality, rather than the traditional layer-based structure. Below is an explanation of how the project is organized:

### `/src/routes`

- **auth**: Contains routes and logic related to authentication (e.g., login, signup).
- **protected**: Contains routes and logic for protected resources that require authentication.

### `/src/lib`

- **features**: This folder contains all the feature-related logic for the app. It has been organized into different modules for better maintainability and scalability.
- We have removed the default `index.js` file in favor of a more modular structure.

---

By following this structure, developers can easily navigate the project and work efficiently within their respective modules. This feature-based organization allows for better scalability as the project grows.

## 5. Getting Started

To get started with the project, follow these steps:

1. **Clone the repository**:

   ```bash
   git clone https://github.com/sakthivel14366vss/Naruto-Mens-Wear.git
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Run the development server**:

   ```bash
   npm run dev
   ```

Visit `http://localhost:5173` to see the app running locally.

## Recommanded VS Code Extensions

### 1. **Svelte for VS Code**

- Provides syntax highlighting, autocompletion, and error checking for `.svelte` files.

### 2. **Tailwind CSS IntelliSense**

- Offers autocompletion, linting, and inline documentation for Tailwind CSS classes.

### 3. **Prettier - Code Formatter**

- Automatically formats your code for consistent styling across JavaScript, CSS, HTML, and more.

### 4. **ESLint**

- Lints JavaScript and TypeScript code to ensure adherence to best practices and style guides.

### 5. **Toggle Bracket Guides**

- Colors matching brackets to make it easier to navigate and match pairs, especially in nested code.
