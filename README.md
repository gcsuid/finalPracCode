# LeetCode Problem Logger

This project is a simple no-auth prototype for logging LeetCode problems into MongoDB Atlas.

## Current flow

1. Start the Node backend.
2. Open the vanilla JS frontend in the browser.
3. Enter:
   - `questionNumber`
   - `questionName`
   - `approach`
4. Submit the form.
5. The backend validates the problem number/title against LeetCode and stores the log in MongoDB.

## Tech used

- Node.js
- Express
- MongoDB Atlas
- Mongoose
- Vanilla HTML/CSS/JS

## Project setup

The app reads configuration from `.env`.

Current required values:

```env
PORT=5000
MONGO_URI=your-mongodb-atlas-uri
JWT_SECRET=any-random-string
```

Note: `JWT_SECRET` is currently unused in the no-auth flow, but it still exists in `.env` from the earlier backend setup.

## How to start

Install dependencies if needed:

```bash
npm install
```

Start the app:

```bash
node index.js
```

You should see output similar to:

```text
MongoDB Connected
Server started on port 5000
```

Then open:

```text
http://localhost:5000
```

## How to use the frontend

On the page:

1. Enter a valid LeetCode problem number.
2. Enter the exact LeetCode problem name matching that number.
3. Enter your approach.
4. Click `Save to Mongo`.

If the number/title pair is valid, the entry is saved to MongoDB and appears in the logs panel.

## API endpoints

### Health

```http
GET /health
```

### Create problem log

```http
POST /api/problems
Content-Type: application/json
```

Body:

```json
{
  "questionNumber": 1,
  "questionName": "Two Sum",
  "approach": "Use a hash map to store complements."
}
```

### List all logs

```http
GET /api/problems
```

### Get one log

```http
GET /api/problems/:id
```

## Optional CLI flow

There is also a CLI logger:

```bash
node cli.js
```

It prompts for:

- question number
- question name
- approach

Then it inserts the log directly into MongoDB.

## Notes

- There is no authentication right now.
- Older MongoDB records from previous versions may still contain legacy fields like `description` or `user`.
- New records created through the current backend use the latest no-auth structure.
