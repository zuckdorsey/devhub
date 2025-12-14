import { Project, Stats, User } from '../types';

export const currentUser: User = {
  name: 'Alex Developer',
  avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
};

export const projects: Project[] = [
  {
    id: '1',
    name: 'Personal Portfolio',
    status: 'In Progress',
    tech_stack: ['Next.js', 'TypeScript', 'Tailwind'],
    description: 'My personal portfolio website showcasing my work.',
  },
  {
    id: '2',
    name: 'E-commerce API',
    status: 'Done',
    tech_stack: ['Node.js', 'Express', 'PostgreSQL'],
    description: 'RESTful API for an online store.',
  },
  {
    id: '3',
    name: 'AI Chatbot',
    status: 'Idea',
    tech_stack: ['Python', 'OpenAI', 'React'],
    description: 'A chatbot that helps with coding questions.',
  },
  {
    id: '4',
    name: 'Task Manager CLI',
    status: 'In Progress',
    tech_stack: ['Go', 'Cobra'],
    description: 'Command line tool for managing daily tasks.',
  },
  {
    id: '5',
    name: 'Weather App',
    status: 'Done',
    tech_stack: ['Vue.js', 'OpenWeatherMap'],
    description: 'Simple weather application.',
  },
];

export const stats: Stats = {
  totalProjects: projects.length,
  activeProjects: projects.filter((p) => p.status === 'In Progress').length,
  completedProjects: projects.filter((p) => p.status === 'Done').length,
  ideaProjects: projects.filter((p) => p.status === 'Idea').length,
};
