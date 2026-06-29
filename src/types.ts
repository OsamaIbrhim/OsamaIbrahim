export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  category: 'frontend' | 'backend' | 'web3' | 'fullstack';
  tags: string[];
  image: string;
  icon: string;
  liveUrl: string;
  githubUrl: string;
  highlights: string[];
  isUpcoming?: boolean;
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
