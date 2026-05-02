# Frontend
This document provides an overview of the frontend structure, packages, and components used in the project.

# Index
- [Project Structure](#project-structure)
- [Packages](#packages)
- [Installation](#installation)
- [Running the app](#running-the-app)
- [Environment Variables](#environment-variables)
- [Testing](#testing)

## Project Structure

```
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── constants/
│   ├── context/
│   ├── hooks/
│   ├── services/
│   ├── test/
│   ├── utils/
│   ├── app.css
│   ├── app.tsx
│   ├── index.css
│   └── index.tsx
├── .env
├── .env.example
├── .gitignore
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json
├── README.es-LA.md
├── README.md
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── vitest.config.ts
```

## Packages
- `axios`: Promise-based HTTP client for making API requests to the backend.
- `eslint`: Linting utility for JavaScript and TypeScript, used to enforce code quality and consistency in the frontend codebase.
- `qrcode.react`: Library for generating QR codes, used to display gift card codes in a scannable format.
- `socket.io-client`: Library for real-time web applications, enabling bidirectional communication with the backend server for real-time updates on order status and gift card delivery.
- `react`: JavaScript library for building user interfaces, used to create the frontend components and manage state.
- `react-dom`: Package for working with the DOM in React applications.
- `react-router-dom`: Library for routing in React applications, used to manage navigation between different pages (e.g., home, order status).
- `typescript`: TypeScript language support for type checking and improved developer experience.
- `vite`: Build tool that provides a fast development server and optimized build process for React applications.
- `vitest`: Testing framework for Vite projects, used for writing and running unit tests.

> Full list of dependencies is available in  `package.json`.


## Installation
1. Clone the repository (if not already done).
2. Navigate to the `frontend` directory:

  ```bash
  cd frontend
  ```
3. Install the dependencies

  ```bash
  npm install
  ```

## Running the app
- Development mode: 

```bash
npm run dev
```

- Production build:

```bash
npm run build
```
The output will be in the `dist` folder, which can be served with any static file server.

## Environment Variables
Create a `.env` file in the root of the `frontend` directory based on the `.env.example` file, and set the following environment variables:

| Variable | Description | Example |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Base URL for API requests to the backend. | `http://localhost:3000/api` |
| `VITE_SOCKET_IO_URL` | URL for the Socket.io connection to the backend. | `http://localhost:3000` |


## Testing
- Run Tests:

```bash
npm run test
```

> Tests setup is located in the `src/test` directory, tests are located inside `__tests__`  folders next to the components or hooks they are testing. The testing framework used is Vitest, which is configured in `vitest.config.ts`.