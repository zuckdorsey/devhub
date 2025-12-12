This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Neon Database Setup

This project uses [Neon](https://neon.tech) as the serverless PostgreSQL database.

### Setup Instructions

1. Create a new project on [Neon](https://neon.tech).
2. Copy your **Connection String** from the Neon Dashboard.
3. Add it to your `.env` file:

```env
DATABASE_URL="postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"
```

4. Run the seed script to create the table and insert mock data:

```bash
npx tsx src/scripts/seed.ts
```

This script will:

1. Connect to your Neon database using `DATABASE_URL`.
2. Execute `neon/schema.sql` to create the `projects` table and indexes (if they don't exist).
3. Insert the mock data from `src/data/mockData.ts`.
4. Verify the insertion by counting the total projects.

### Why Neon?

- **Serverless**: Automatically scales to zero when not in use, saving costs.
- **Instant branching**: Create database branches for development and testing.
- **Fast**: Built on PostgreSQL with modern cloud architecture.
- **Developer-friendly**: Works seamlessly with Next.js and serverless environments.
