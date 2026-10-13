# Database Integration Assignment Starter

Replace the in-memory repository implementation with PostgreSQL through Prisma. The starter already uses an asynchronous repository contract so services and controllers can remain stable during the swap.

## Run

```bash
npm install
npm run prisma:generate
npm start
```

## Database setup

Copy `.env.example` to `.env` and set `DATABASE_URL` to a PostgreSQL database you own. `.env` is local-only and must not be committed.

```bash
npm run prisma:migrate:dev -- --name init_database_integration
npm run prisma:seed
npm run prisma:validate
npm run prisma:generate
```

The migration creates the users, posts, comments, votes, follows, tags, and post-tag join tables. Use `npm run prisma:migrate:deploy` to apply committed migrations in a deployed environment. Migrations preserve existing data; do not reset or drop a database as part of setup.

The API starts with an empty database. Run `npm run prisma:seed` to create a demo user and the starter posts; the seed is idempotent and does not reset or overwrite existing records. Never commit `.env` or real credentials.
