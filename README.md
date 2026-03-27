# MongoDB Problem Log API

This project is now a simple MongoDB-backed API for logging problems.

## What is implemented

- MongoDB connection with Mongoose
- `problems` collection
- CRUD endpoints for problem logging
- Simple smoke test for create, read, update, and delete

## Problem collection

Each problem stores:

- `questionNumber`
- `questionName`
- `approach`
- `createdAt`
- `updatedAt`

## Tech used

- Express
- Mongoose

## Run the app

```bash
npm install
npm start
```

Default port:

```text
8081
```

Health endpoint:

```http
GET /health
```

Sample response:

```json
{
  "status": "ok",
  "storage": "mongodb"
}
```

## MongoDB configuration

The app currently defaults to this connection string:

```text
mongodb+srv://user1:Bhagya%402004@cluster0.irqmqzi.mongodb.net/problem-log-app?retryWrites=true&w=majority&appName=Cluster0
```

You can override it with:

```bash
MONGODB_URI=your-own-uri
```

## API endpoints

### Health

```http
GET /health
```

### Create a problem

```http
POST /api/problems
Content-Type: application/json
```

```json
{
  "questionNumber": 1,
  "questionName": "Two Sum",
  "approach": "Use a hash map to track visited values."
}
```

### Get all problems

```http
GET /api/problems
```

### Get one problem

```http
GET /api/problems/:id
```

### Update one problem

```http
PUT /api/problems/:id
Content-Type: application/json
```

```json
{
  "questionNumber": 1,
  "questionName": "Two Sum",
  "approach": "Updated explanation."
}
```

### Delete one problem

```http
DELETE /api/problems/:id
```

## Smoke test

After starting the server, you can run:

```bash
npm run smoke
```

This test:

- creates a problem
- lists problems
- fetches one problem
- updates the problem
- deletes the problem

## Notes

- The browser UI is still present and can call the same problem endpoints.
- The code is intentionally straightforward for easier debugging.
