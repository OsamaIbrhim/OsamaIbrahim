import { SkillCategory } from '../types';

export const skillCategories: SkillCategory[] = [
  {
    title: 'Frontend Development',
    icon: 'web',
    color: 'brand-primary',
    skills: [
      { name: 'React.js', description: 'Expert in hook-driven architectures, custom state hooks, and virtual DOM performance tuning.' },
      { name: 'Next.js', description: 'Experienced with Server-Side Rendering (SSR), Static Site Generation (SSG), and App Router schemas.' },
      { name: 'Tailwind CSS', description: 'Mastery of utility-first styling, custom theme configurations, and fluid responsive design.' },
      { name: 'Redux Toolkit', description: 'Proficient in slicing, thunks, state normalization, and global state sync.' },
      { name: 'TypeScript', description: 'Strong focus on strict type safety, generic interfaces, and self-documenting codebases.' },
      { name: 'JavaScript (ES6+)', description: 'Deep knowledge of closures, async/await, event loops, and functional paradigms.' }
    ]
  },
  {
    title: 'Backend API',
    icon: 'dns',
    color: 'brand-secondary',
    skills: [
      { name: 'Node.js', description: 'Experienced with server-side scripting, clustering, file system manipulation, and stream APIs.' },
      { name: 'Express.js', description: 'Expert in building robust middlewares, custom routing, and unified error handling models.' },
      { name: 'RESTful APIs', description: 'Dedicated to designing clean, scalable API endpoints with structured JSON responses and status codes.' }
    ]
  },
  {
    title: 'Database',
    icon: 'database',
    color: 'brand-primary',
    skills: [
      { name: 'MongoDB', description: 'Proficient in designing robust NoSQL schemas, index optimization, and aggregation queries.' },
      { name: 'Mongoose', description: 'Skilled in writing type-safe document models, pre/post hooks, and schema validations.' },
    ]
  },
  {
    title: 'Web3 & Smart Contracts',
    icon: 'currency_bitcoin',
    color: 'brand-tertiary',
    skills: [
      { name: 'Solidity', description: 'Written gas-optimized ERC-20, ERC-721, and custom proxy smart contracts with security in mind.' },
      { name: 'Web3.js', description: 'Experienced in connecting browser providers, parsing ABIs, and dispatching blockchain transactions.' },
      { name: 'Ethers.js', description: 'Comfortable utilizing providers, signers, BigNumber calculations, and contract events.' },
      { name: 'Hardhat', description: 'Built local testing node scripts, contract deployment processes, and automated unit tests.' }
    ]
  },
  {
    title: 'DevOps & Tools',
    icon: 'build',
    color: 'on-surface-variant',
    skills: [
      { name: 'Git/GitHub', description: 'Fluent in branching workflows, rebases, pull request reviews, and GitHub Actions CI/CD pipelines.' },
      { name: 'Postman', description: 'Advanced usage of pre-request scripts, automated test suites, and mock environments.' },
      { name: 'C++', description: 'Strong foundation in systems programming, object-oriented concepts, and memory management.' }
    ]
  },
  {
    title: 'Computer Science Core',
    icon: 'architecture',
    color: 'brand-tertiary',
    skills: [
      { name: 'Data Structures', description: 'Deep conceptual grasp of arrays, linked lists, trees, hash tables, and graphs.' },
      { name: 'Algorithms', description: 'Proficient in sorting, searching, greedy approaches, dynamic programming, and recursion.' },
      { name: 'OOP', description: 'Expert in encapsulation, inheritance, polymorphism, abstraction, and design pattern execution.' },
      { name: 'System Design basics', description: 'Understanding of load balancers, database scaling, caching, microservices, and high availability.' }
    ]
  }
];
