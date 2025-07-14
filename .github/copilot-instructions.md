# Custom Instructions for Infertility Treatment Management and Monitoring System

**Overview:** This repository contains the source code for the "Infertility Treatment Management and Monitoring System." The system is built with a Node.js backend using MongoDB for data persistence and a React.js 19 frontend developed with Vite and TypeScript.

**General Guidelines:**

- Always adhere strictly to the guidelines and specifications outlined in the project's detailed design document. Prioritize clarity, maintainability, and security in all code suggestions.
- When providing code examples or explanations, ensure they are relevant to a healthcare management system context, specifically for infertility treatment.
- Focus on scalable and robust solutions suitable for a production environment.
- **Always respond in Vietnamese.**

**Node.js Backend (with MongoDB) Instructions:**

- When generating Node.js code, prioritize asynchronous programming patterns (e.g., async/await).
- For database interactions, assume MongoDB as the primary database. Provide Mongoose-based solutions for schema definition, querying, and data manipulation.
- Ensure API responses follow RESTful principles and handle common HTTP status codes appropriately (e.g., 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Internal Server Error).
- Emphasize secure coding practices, including input validation, sanitization, and proper authentication/authorization mechanisms (e.g., JWT for authentication).
- Suggest best practices for error handling and logging within Node.js applications.

**React.js 19 Frontend (with Vite and TypeScript) Instructions:**

- When generating React components or hooks, ensure they are written in TypeScript, leveraging its type-checking capabilities for robust code.
- Utilize functional components and React Hooks for state management and side effects. Avoid class components unless specifically requested for legacy compatibility.
- Assume Vite as the build tool for the React application. Provide instructions or code snippets compatible with a Vite development environment.
- Focus on creating reusable, modular, and performant UI components.
- Emphasize accessibility (A11y) and responsive design principles for the user interface.
- For state management, consider suggesting solutions aligned with React's context API or popular libraries like Zustand/Jotai for larger applications.
- When interacting with the backend, provide examples using `fetch` or `axios` for making API calls.
