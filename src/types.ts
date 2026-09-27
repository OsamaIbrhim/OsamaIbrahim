export type ProjectStatus = 'live' | 'published' | 'in-development' | 'demo-soon';

export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  category: 'frontend' | 'backend' | 'web3' | 'fullstack' | 'library' | 'automation';
  status: ProjectStatus;
  /** Short, honest caveat shown next to the project (scope, completeness). */
  note?: string;
  /** What to show beside the details: a screenshot, the live limiter demo, or an architecture diagram. */
  visual: 'image' | 'limiter' | 'architecture';
  featured?: boolean;
  tags: string[];
  image?: string;
  liveUrl: string;
  githubUrl: string;
  npmUrl?: string;
  install?: string;
  highlights: string[];
}

export interface SkillItem {
  name: string;
  level?: string;
  description: string;
  icon?: string;
}

export interface SkillCategory {
  title: string;
  icon: string;
  color: string;
  skills: SkillItem[];
}

export interface Certification {
  title: string;
  issuer: string;
  year?: string;
  verified: boolean;
}

export interface ExperienceItem {
  role: string;
  company: string;
  period: string;
  project?: string;
  highlights: string[];
}
