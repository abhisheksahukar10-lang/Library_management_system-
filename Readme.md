Library Management System

A full-stack University Library Management System built using:

Frontend: React.js
Backend: Spring Boot
Database: PostgreSQL
Build Tool: Maven
Architecture: REST API + Layered Architecture
Features
Admin Features
Add/manage books
Add/manage students
Add/manage faculty
Borrow/return books
View overdue books
Fine management
Student Features
View available books
Borrowed books tracking
Fine tracking
Faculty Features
Borrow books with different limits
View borrow history
Chatbot
Book availability checking
Borrow/fine information
Basic library assistance
Tech Stack
Layer	Technology
Frontend	React.js
Backend	Spring Boot
Database	PostgreSQL
ORM	Spring Data JPA
Build Tool	Maven
Styling	CSS
API Calls	Axios


Project Structure
final-project/
│
├── backend/
│   ├── src/
│   ├── pom.xml
│   └── application.properties
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── database-setup.sql
└── README.md
Prerequisites

Install the following software before running the project.

1. Install Java 17 (IMPORTANT)
Download Java 17

Download:
https://adoptium.net/temurin/releases/

Choose:

Version: 17 LTS
OS: Windows
Architecture: x64

Install using .msi.

Verify Java Installation

Open terminal:

java -version

Expected:

openjdk version "17..."
2. Install Maven
Download Maven

https://maven.apache.org/download.cgi

Download:

Binary zip archive

Extract to:

C:\Program Files\apache-maven
Add Maven to PATH
Open:
Environment Variables
System Variables
Path
Add:
C:\Program Files\apache-maven\bin
Verify Maven
mvn -v

Expected:

Apache Maven 3.x
Java version: 17
3. Install Node.js

Download:
https://nodejs.org

Install LTS version.

Verify Node.js
node -v
npm -v
4. Install PostgreSQL

Download:
https://www.postgresql.org/download/

During installation:

remember PostgreSQL password
default port: 5432
5. Install VS Code

Download:
https://code.visualstudio.com/

VS Code Extensions

Install these extensions:

Extension Pack for Java
Spring Boot Extension Pack
Lombok Annotations Support for VS Code
ES7+ React/Redux Snippets
PostgreSQL
Clone Repository
git clone <YOUR_GITHUB_REPO_URL>

Open project in VS Code.

Database Setup
Step 1 — Create Database

Open:

pgAdmin
OR
SQL Shell

Run:

CREATE DATABASE library_db;
Step 2 — Configure Backend Database

Open:

backend/src/main/resources/application.properties

Update:

spring.datasource.url=jdbc:postgresql://localhost:5432/library_db
spring.datasource.username=postgres
spring.datasource.password=YOUR_PASSWORD

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

Replace:

YOUR_PASSWORD

with your PostgreSQL password.

IMPORTANT — Backend Port

Backend runs on:

server.port=8081

Frontend is already configured for this port.

Running Backend

Open terminal:

cd backend
Clean Build
mvn clean install

First build may take several minutes because Maven downloads dependencies.

Run Spring Boot Application
mvn spring-boot:run

Expected:

Started LibraryApplication
Tomcat started on port(s): 8081

Backend URL:

http://localhost:8081
Running Frontend

Open NEW terminal:

cd frontend
Install Dependencies
npm install
Start React App
npm start

Frontend URL:

http://localhost:3000
API Configuration

Frontend API base URL:

frontend/src/services/api.js

Configured as:

baseURL: 'http://localhost:8081/api'
Login Information
Admin
Role: ADMIN

(Use data from database or manually insert admin user.)

Common Issues & Fixes
1. Maven Not Recognized
Problem
mvn is not recognized
Fix

Install Maven and add Maven bin folder to PATH.

2. Lombok Errors
Problem
cannot find symbol getTitle()
Fix

Install:

Lombok Annotations Support for VS Code

Also:

Use Java 17
Restart VS Code
3. Port Already In Use
Problem
Port 8081 already in use
Fix

Change port in:

server.port=8082

Then also update frontend API URL.

4. CORS Errors
Problem
No 'Access-Control-Allow-Origin'
Fix

Ensure frontend API URL matches backend port.

5. PostgreSQL Connection Error
Problem
password authentication failed
Fix

Check:

PostgreSQL running
database exists
correct password in application.properties
Recommended Workflow for Team
Create Separate Branches

Example:

git checkout -b frontend-ui
Pull Latest Changes
git pull origin main
Push Changes
git add .
git commit -m "Improved frontend dashboard"
git push origin frontend-ui
Git Ignore

This readme is only for the team's reference will be updated later