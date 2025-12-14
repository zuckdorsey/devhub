# DevHub

DevHub is a comprehensive developer dashboard designed to streamline your workflow. It integrates project management, issue tracking, note-taking, and asset management into a single, cohesive interface. Built with modern web technologies, DevHub provides a premium user experience with a focus on productivity and aesthetics.

![DevHub Banner](/public/banner.png)

## Features

- **📂 Project Management**: Organize your projects with ease. Track status, tech stack, and priority.
- **✅ Task Management**: Kanban-style task boards to manage your daily to-dos and project-specific tasks.
- **octocat: GitHub Integration**: Seamlessly import projects from GitHub, view issues, and track pull requests directly from the dashboard.
- **📝 Knowledge Base**: A rich-text note-taking system with Markdown support to document your ideas and snippets.
- **📦 Asset Management**: Store and organize project assets. Includes Google Drive integration for file storage.
- **🔐 Secure Authentication**: PIN-based authentication system to keep your dashboard private.
- **🎨 Modern UI/UX**: A beautiful, dark-themed interface built with Tailwind CSS and Radix UI.

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database**: [Neon](https://neon.tech/) (Serverless PostgreSQL)
- **Authentication**: [NextAuth.js](https://authjs.dev/) (v5)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)

## Getting Started

Follow these steps to set up DevHub locally on your machine.

### Prerequisites

- Node.js 18+ installed
- A [Neon](https://neon.tech) account for the database
- A GitHub account (for GitHub integration features)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/devhub.git
   cd devhub
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up Environment Variables:**

   Create a `.env` file in the root directory and add the following variables:

   ```env
   # Database (Neon)
   DATABASE_URL="postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"

   # Authentication (NextAuth)
   AUTH_SECRET="your-random-secret-key" # Generate one with `openssl rand -base64 32`

   # GitHub Integration (Optional but recommended)
   GITHUB_TOKEN="your-github-personal-access-token"
   ```

4. **Initialize the Database:**

   Run the seed script to create the necessary tables and insert initial data:

   ```bash
   npx tsx src/scripts/seed.ts
   ```

5. **Run the Development Server:**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the application for production.
- `npm start`: Starts the production server.
- `npm run lint`: Runs ESLint to check for code quality issues.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
