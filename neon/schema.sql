-- Create Projects Table
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  name TEXT NOT NULL,
  status TEXT CHECK (status IN ('Idea', 'In Progress', 'Done', 'On Hold')) NOT NULL DEFAULT 'Idea',
  tech_stack TEXT[] NOT NULL,
  description TEXT,
  api_endpoint TEXT,
  github_repo TEXT,
  priority TEXT CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')) DEFAULT 'Medium',
  progress INTEGER CHECK (progress >= 0 AND progress <= 100) DEFAULT 0,
  related_issues TEXT[] DEFAULT ARRAY[]::TEXT[],
  related_tasks TEXT[] DEFAULT ARRAY[]::TEXT[],
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  timeline TIMESTAMP WITH TIME ZONE
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_priority ON projects(priority);

-- Create Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('Todo', 'In Progress', 'Done')) NOT NULL DEFAULT 'Todo',
  type TEXT CHECK (type IN ('Daily', 'Weekly')) NOT NULL DEFAULT 'Daily',
  priority TEXT CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')) DEFAULT 'Medium',
  due_date TIMESTAMP WITH TIME ZONE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  github_issue_number INTEGER
);

-- Create indexes for tasks
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_type ON tasks(type);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);

-- Create Settings Table
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
