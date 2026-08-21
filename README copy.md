# E-Commerce & Logistics Backend REST API

This project implements a Node.js/TypeScript backend API using Express and the node-postgres (pg) driver to interact with a PostgreSQL database It provides RESTful CRUD endpoints for an E-Commerce system without utilizing ORMs or multi-table JOINs

## Prerequisites
* PostgreSQL installed and running locally.
* Node.js and npm installed.

## Setup Instructions

1. **Database Setup**: Execute the provided SQL setup script inside your local PostgreSQL instance to build and populate the `customer`, `orders`, `product`, `order_item`, `vendor`, and `supplies` tables
2. **Install Dependencies**: Run `npm install` to download all necessary packages.
3. **Environment Variables**: Create a `.env` file in the root directory based on the `.env` snippet provided in this guide to define your database credentials. 
4. **Run the Server**: 
   * Development mode: `npm run dev`
   * Production mode: `npm start`

## Technical Details
* **Parameterization**: All database queries utilize parameterized values (`$1, $2`) to prevent SQL injection vulnerabilities
* **Error Handling**: Route handlers leverage try/catch blocks for database errors, returning the appropriate HTTP status codes (`400`, `404`, `500`)
* **Submission**: Push this repository to GitHub and submit the link by the deadline of August 21, 11:59 pm