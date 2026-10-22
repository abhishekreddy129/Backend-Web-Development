# Cookies, Sessions and Authentication

Express authentication using signed `sid` cookies and server-side sessions. The database uses the Prisma `User` model (`id`, `name`, `email`, and `passwordHash`).

## Setup

Requirements: Node.js and npm.

```bash
npm install
```

Copy `.env.example` to `.env`, then set `COOKIE_SECRET` to a private random value of at least 32 characters. For example:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

`DATABASE_URL` is configured for the starter's SQLite database. Keep `COOKIE_SECURE=false` for local HTTP. Production deployments must use HTTPS; cookies are marked `Secure` whenever `NODE_ENV=production`, and `COOKIE_SECURE=true` can enable it for other HTTPS environments.

| Variable | Purpose | Default/example |
| --- | --- | --- |
| `DATABASE_URL` | Prisma database connection | `file:./dev.db` |
| `COOKIE_SECRET` | Signs and verifies the session cookie | Replace the placeholder with a secret |
| `COOKIE_SECURE` | Enables the `Secure` cookie flag outside production | `false` locally |
| `SESSION_TTL_MS` | Session and cookie lifetime in milliseconds | `3600000` (one hour) |
| `PORT` | HTTP port | `3000` |

## Database and server

The starter declares Prisma `^6.8.2` and has no migration history yet (the current install resolved 6.19.3). `npm run setup` generates the Prisma client, applies the schema with `prisma db push`, and seeds the demo user:

```bash
npm run setup
npm run dev
```

The individual database commands are also available:

```bash
npx prisma generate
npm run db:push
npm run db:seed
```

The seeded account is `sam@example.com` with password `SessionDemo!48`. `npm start` runs the server without watch mode.

## Authentication endpoints

### `POST /auth/login`

Request:

```json
{
  "email": "sam@example.com",
  "password": "SessionDemo!48"
}
```

Success returns `200`, sets the signed, `HttpOnly`, `SameSite=Lax` `sid` cookie, and returns only the user's `id`, `name`, and `email`:

```json
{
  "user": {
    "id": 1,
    "name": "Sam",
    "email": "sam@example.com"
  }
}
```

Invalid input returns `400` with `INVALID_REQUEST`. An unknown email and an incorrect password both return the same `401` response with `INVALID_CREDENTIALS`.

### `GET /auth/me`

Requires a valid signed cookie and a live server-side session. Success returns `200` with the same safe identity fields. A missing, invalid, expired, unknown, or tampered session returns `401` with `AUTH_REQUIRED`.

### `POST /auth/logout`

Destroys the server-side session when present and clears the `sid` cookie. It returns `204` with no body, including on repeated logout requests. A replayed cookie cannot authenticate after logout.

## Verify with curl

Start the server after setup. `-c` stores cookies and `-b` sends them on later requests:

```bash
curl.exe -i -c cookies.txt -H "Content-Type: application/json" -d '{"email":"sam@example.com","password":"SessionDemo!48"}' http://localhost:3000/auth/login
curl.exe -i -b cookies.txt http://localhost:3000/auth/me
curl.exe -i -b cookies.txt -c cookies.txt -X POST http://localhost:3000/auth/logout
curl.exe -i -b cookies.txt http://localhost:3000/auth/me
```

The first response should include `Set-Cookie` with `HttpOnly` and `SameSite=Lax` (and `Secure` in production). The final identity request should return `401 AUTH_REQUIRED`. In Postman, use the cookie jar to retain the cookie between requests.

## Session storage limitation

Sessions are held in an in-memory `Map` for this learning assignment. They disappear when the process restarts and are not shared between application instances. Production deployments should use a shared store with expiry, such as Redis, and configure appropriate TLS and secret management.