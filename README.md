# DevHub

DevHub is a comprehensive, feature-rich developer dashboard designed to centralize your workflow. It combines advanced project management with **AI-powered intelligence**, **deep GitHub integration**, and a **premium user experience**. 

Built for modern developers, DevHub goes beyond simple to-do lists by integrating your codebase, issues, and documentation into a single, cohesive interface.

![DevHub Banner](/public/banner.png)

## ✨ Key Features

### � Core Management
- **Smart Project Dashboard**: Track status, tech stacks, priorities, and version release history.
- **Kanban Task Board**: Drag-and-drop interface with priority labeling and "Instant Actions" for subtasks.
- **Detailed Issue Tracking**: Local issue management with 2-way GitHub synchronization, including labels and due dates.

### 🤖 AI-Powered Intelligence
- **Automated Task Generation**: Describe your feature, and let AI (Gemini or OpenRouter/DeepSeek) break it down into actionable tasks.
- **Subtask Breakdown**: One-click AI generation of subtasks for complex items.
- **Configurable Providers**: Switch between **Google Gemini** (default) or **OpenRouter** (access to Llama 3, Claude, etc.) directly from settings.

### 🐙 Deep GitHub Integration
- **Repository Connections**: Link projects to GitHub repositories.
- **Live File Explorer**: Browse your repository's file tree and read non-binary files directly in the dashboard.
- **Issue & PR Sync**: View and manage GitHub Issues and Pull Requests.
- **Commit & Branch Linking**: Automatically link tasks to specific commits or branches.

### ✍️ Developer Experience
- **Markdown Knowledge Base**: Rich-text editor with **slash commands**, **syntax highlighting**, and **live preview**.
- **Mermaid.js Support**: Render diagrams and charts directly in your notes and task descriptions.
- **Asset Management**: Organize environment files, diagrams, and links. Integrated with Google Drive.
- **Premium UI**: Deep dark mode, glassmorphism effects, and smooth micro-animations using Radix UI & Tailwind.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, Server Actions)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & [Radix UI](https://www.radix-ui.com/)
- **Database**: [Neon](https://neon.tech/) (Serverless PostgreSQL)
- **ORM**: Raw SQL (via `@neondatabase/serverless`) for performance
- **Editors**: [TipTap](https://tiptap.dev/) & `uiw/react-md-editor`
- **AI**: [Google Generative AI SDK](https://ai.google.dev/) & Custom OpenRouter Integration

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL Database (Neon recommended)
- Google & GitHub Accounts (for integrations)

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

3. **Environment Setup:**
   Create a `.env` file in the root directory:
   ```env
   # Database (Neon)
   DATABASE_URL="postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"

   # Authentication (NextAuth)
   AUTH_SECRET="your-random-secret-key"

   # Optional: Initial GitHub Token (can also be managed in app)
   GITHUB_TOKEN="your-github-token"
   ```

4. **Initialize Database:**
   ```bash
   npx tsx src/scripts/seed.ts
   ```

5. **Run Development Server:**
   ```bash
   npm run dev
   ```

---

## ⚙️ Configuration Guide

### Setting up AI
DevHub allows you to bring your own API keys for unlimited usage.
1. Navigate to **Settings** in the sidebar.
2. Choose your provider: **Gemini** or **OpenRouter**.
3. Enter your API Key.
   - [Get Gemini Key](https://aistudio.google.com/app/apikey)
   - [Get OpenRouter Key](https://openrouter.ai/keys)
4. (Optional) Select your preferred model (e.g., `gemini-1.5-flash`, `llama-3.3-70b`).

### Connecting GitHub
1. In any project, go to the **Repository** tab.
2. Enter the repository URL (e.g., `owner/repo`).
3. The dashboard will automatically fetch issues, branches, and the file tree.

---

## 🤝 Contributing

Contributions are welcome!
1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'feat: Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
