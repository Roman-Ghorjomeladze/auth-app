# Simple Auth Service

A simple authentication and user profile system — local development and quick start instructions.

This project was implemented as a technical assignment and focuses on correctness, clean architecture, and separation of concerns rather than UI design.

---

## Overview

The application demonstrates a small microservice-based system consisting of:

-   A **Next.js frontend** for user authentication and profile management
-   A **NestJS API Gateway** that acts as the single entry point for the UI
-   A **NestJS User Service** responsible for user data and profile business logic
-   **Google OAuth** for authentication
-   **JWT-based authorization** for protected endpoints
-   **RabbitMQ** as a message broker for inter-service communication
-   **PostgreSQL** as the database

The API Gateway handles authentication, OAuth callbacks, and HTTP APIs, while internal services communicate via RabbitMQ using message patterns.  
Request-scoped logging with trace IDs is used to make debugging across services easier.

---

## Prerequisites

-   Git
-   Node.js >= 20 and npm (or Yarn)
-   Docker

---

## Install

Running the following script will install all dependencies in the root directory, frontend, and backend.

```bash
# from project root
git clone <repo-url> .
npm run install:all
```

## Environment

You need to create environment files before running the project.

There are three example environment files:

frontend/.env.example
backend/api-gateway/.env.example
backend/user-service/.env.example

Copy each example file and create a corresponding .env file next to it:

```bash
cp frontend/.env.example frontend/.env
cp backend/api-gateway/.env.example backend/api-gateway/.env
cp backend/user-service/.env.example backend/user-service/.env

```

## Google OAuth configuration

In backend/api-gateway/.env, you must define the following variables using your Google Cloud project credentials:

```bash
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET

```

Additionally, configure the following OAuth redirect URL in your Google Cloud Console:

```bash
http://localhost:3001/auth/validate/google

```

## Docker setup

Docker is required to run the infrastructure dependencies.

Start RabbitMQ and PostgreSQL using Docker Compose:

```bash
docker compose up
# or
docker-compose up
```

Default server: http://localhost:3000 (change PORT in .env)

## Run the API and UI

From the project root, start both the backend and frontend with a single command:

```bash
# Make sure you are in the root dir and run
npm run start:both

```

## Database

I didn't create migrations as this is an assignment, I just enabled synchroization in TypeORM module for simplicity.

## Tests & Lint

A minimal but meaningful backend test suite was added to demonstrate testing approach and service-level logic.

```bash
cd backend && npm run test

# Or run lint in both frontend or backend directories
cd frontend && npm run lint
cd backend && npm run lint

```

Tests use NestJS TestingModule and focus on core business logic rather than infrastructure or transport layers.

## Notes

-   The API Gateway is responsible for translating microservice errors into HTTP responses.
-   The User Service is transport-agnostic and communicates via RabbitMQ.
-   Shared DTOs and constants are placed in a common library to avoid tight coupling.
-   Logging is request-scoped and supports trace ID propagation across services.
