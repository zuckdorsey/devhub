export interface Project {
  id: string;
  name: string;
  status: 'Idea' | 'In Progress' | 'Done' | 'On Hold';
  tech_stack: string[];
  description?: string;
  created_at?: string;
  api_endpoint?: string;
  github_repo?: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  progress?: number;
  related_issues?: string[];
  related_tasks?: string[];
  tags?: string[];
  timeline?: string;
}

export interface Stats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  ideaProjects: number;
}

export interface User {
  name: string;
  avatarUrl: string;
}
