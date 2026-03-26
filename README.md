# Problem Log CRUD

This project is a simple CRUD app for saving problem-solving notes into `db.json`.

## Fields stored

Each entry stores:

- `questionNumber`
- `questionName`
- `approach`
- `createdAt`
- `updatedAt`

The backend automatically adds the date and time whenever an entry is created or updated.

## Start the app

Install dependencies if needed:

```bash
npm install
```

Run the server:

```bash
node index.js
```

You should see:

```text
Server started on port 8081
Storage mode: db.json
```

Open in the browser:

```text
http://localhost:8081
```

## Frontend flow

1. Enter `questionNumber`
2. Enter `questionName`
3. Enter `approach`
4. Press `Enter` in the form or click `Save entry`
5. The backend writes the entry to `db.json`

To edit an entry:

1. Click a saved entry in the list
2. Update the values in the form
3. Click `Update entry`

To delete an entry:

1. Click a saved entry
2. Click `Delete`

## API

### Health

```http
GET /health
```

### Create

```http
POST /api/problems
```

```json
{
  "questionNumber": 1,
  "questionName": "Two Sum",
  "approach": "Used a hash map."
}
```

### Read all

```http
GET /api/problems
```

### Read one

```http
GET /api/problems/:id
```

### Update

```http
PUT /api/problems/:id
```

### Delete

```http
DELETE /api/problems/:id
```
