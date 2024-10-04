# Armada

Armada is a Node.js monolithic application, organized into modules, and deployed on an EC2 instance. The project uses Knex.js for database migrations and MySQL as the database.

## Technology Stack

- **Backend**: Node.js v18, Express.js
- **Database**: MySQL (using Knex.js as a query builder)
- **Deployment**: EC2 instance
- **Version Control**: GitHub
- **API Versioning**: Managed via Express routes
- **CI/CD**: Integrated with GitHub Actions for automated testing, building, and deployment.

## Folder Structure

```bash
├── src
│   ├── modules
│   │   └── (Each module with submodules: controllers, models, routes, services, validators)
│   ├── public
│   ├── migrations
│   ├── seeds
│   ├── services
│   └── utils
├── knex_migrate.js
├── knexfile.js
├── Dockerfile
├── .env
└── index.js
```

## API Versioning

Routes are versioned based on the module:

const salonRoutes = require('./src/modules/salon/routes');

app.use("/salon/v1", salonRoutes);

## Database Configuration

Query Builder: Knex.js
Database: MySQL
Migrations: Handled under the migrations/ directory.
Seeds: Handled under the seeds/ directory.

## Scaling

Horizontal Scaling: Add EC2 instances with a load balancer.
Process Management: Use PM2 to manage processes in production.

## Monitoring and Logging

Monitoring(Optional): Use AWS CloudWatch or Sentry.
Logging: Use Winston or Morgan for request and error logging.

## Environment Variables

Refer to the provided sample_env file for configuring environment variables. Copy the file and rename it to .env, then adjust the values as needed.

## Setup Instructions

Follow these steps to set up the project locally or in your production environment.

1. Install Dependencies
   Run the following command to install the required Node.js packages:
   npm install --force

2. Generate OpenAPI Documentation
   To generate the OpenAPI documentation for the API:
   npm run openapi

3. Run Database Migrations
   Migrate the database schema to the latest version:
   node knex_migrate.js

When prompted, enter: latest

4. Run Seed Files
   Populate the database with the seed data:
   node knex_migrate.js

When prompted, enter: run

5. Start the Application
   Finally, start the application using:
   npm start

## CI/CD Pipeline

The project uses GitHub Actions for continuous integration and deployment. The pipeline automates:
Building
Deploying to the EC2 instance
The CI/CD pipeline ensures code quality and smooth deployments by automating these processes.