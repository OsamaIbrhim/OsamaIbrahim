import type { Project, ProjectStatus } from '../types';
import notImage from '../assets/images/Not.webp';
import bdpImage from '../assets/images/bdp.webp';
import disneyImage from '../assets/images/disney.webp';
import youtubeImage from '../assets/images/youtube.webp';
import doctorImage from '../assets/images/doctorAPI.webp';
import nookImage from '../assets/images/nook.webp';
import jobCatcherImage from '../assets/images/jobcatcher.webp';

export const STATUS_LABEL: Record<ProjectStatus, string> = {
  live: 'Live',
  published: 'Published on npm',
  'in-development': 'In development',
  'demo-soon': 'Demo coming soon',
};

export const projects: Project[] = [
  {
    id: 'nook',
    title: 'Nook',
    description:
      'A full-stack e-commerce platform covering the whole customer and store-admin workflow, from product discovery and Stripe checkout to inventory and order fulfilment.',
    longDescription:
      'A production-style store with a React 19 + TypeScript storefront and an Express 5 + MongoDB REST API. Customers search, filter, check out with Stripe and manage their orders; admins manage products, categories, images, inventory, orders and users. The frontend is deployed on GitHub Pages and the API on Vercel serverless, with CI running tests, lint and builds before every deploy.',
    category: 'fullstack',
    status: 'live',
    visual: 'image',
    featured: true,
    tags: ['React 19', 'TypeScript', 'Redux Toolkit', 'Express 5', 'MongoDB', 'Stripe', 'Cloudinary', 'GitHub Actions'],
    image: nookImage,
    liveUrl: 'https://osamaibrhim.github.io/Nook/',
    githubUrl: 'https://github.com/OsamaIbrhim/Nook',
    highlights: [
      'Short-lived JWT access tokens with rotating refresh tokens in httpOnly cookies, plus customer/admin role authorization.',
      'Server-priced orders with transactional stock reservation, so the client never decides what anything costs.',
      'Stripe Checkout with signature verification and idempotent webhook processing.',
      'Admin dashboard for products, inventory, orders and users, with controlled order-status transitions.',
      'Helmet, CORS allow-listing, rate limiting, request-size limits, centralized error handling and graceful shutdown.',
      'Route-level SEO metadata, JSON-LD and a generated sitemap; lazy route bundles for a fast first load.',
    ],
  },
  {
    id: 'athr',
    title: 'ATHR Operations',
    description:
      'One operations product with Cashier, Warehouse and Supervisor workspaces: a NestJS + PostgreSQL API, an Arabic RTL Next.js admin, and an offline-first Electron point of sale.',
    longDescription:
      'A modular monolith for retail operations. The NestJS API over PostgreSQL is the system of record for users, branches, catalog, pricing, invoices, returns and stock. Cashiers sell from an Electron POS that keeps working offline: each sale, its outbox command and its local stock change are committed in one SQLite transaction, then synced when the connection returns.',
    category: 'fullstack',
    status: 'in-development',
    note: 'In development, not complete yet.',
    visual: 'architecture',
    featured: true,
    tags: ['NestJS', 'PostgreSQL', 'Prisma', 'Next.js', 'Electron', 'SQLite', 'TypeScript', 'Arabic RTL'],
    liveUrl: '#',
    githubUrl: 'https://github.com/OsamaIbrhim/ATHR',
    highlights: [
      'Default-deny JWT auth; short-lived access tokens with hashed, rotating, revocable refresh tokens; roles and branch ownership checked server-side.',
      'Sales, returns, purchases, transfers and shift closure run in database transactions; prices, costs and refunds are derived by the server.',
      'Idempotent sales by sync_id, atomic stock deductions that respect reserved stock, and returns that cannot exceed what is returnable.',
      'Offline-first POS: a local SQLite outbox, a full branch snapshot, then incremental sync over a durable PostgreSQL change cursor.',
      'Device enrollment with one-use codes, credentials kept in Electron safeStorage, heartbeats, and remote revocation from Admin.',
      'Stable error codes with Arabic/English guidance and request IDs; CI validates the schema, runs tests and builds every app.',
    ],
  },
  {
    id: 'job-catcher',
    title: 'Job Catcher',
    description:
      'Reads job posts from the Telegram channels I follow, filters them against my profile, and forwards the relevant ones to a private channel, with a public dashboard of everything it catches.',
    longDescription:
      'A scheduled Node.js pipeline. It reads channels through my own Telegram account over MTProto (GramJS), since a bot cannot read channels it does not administer, and sends only through a separate bot that can post nowhere else. A keyword filter runs first; an optional Gemini pass then extracts structured fields and can veto a match, falling back to the keyword result on any AI failure. It runs on GitHub Actions every five minutes, and a read-only Next.js dashboard shows the catch.',
    category: 'automation',
    status: 'live',
    note: 'Tracks MERN-stack roles only for now. More stacks are coming soon.',
    visual: 'image',
    featured: true,
    tags: ['Node.js', 'Telegram MTProto', 'MongoDB', 'Gemini', 'GitHub Actions', 'Next.js'],
    image: jobCatcherImage,
    liveUrl: 'https://job-catcher-sigma.vercel.app',
    githubUrl: 'https://github.com/OsamaIbrhim/Job-Catcher',
    highlights: [
      'My account reads, a send-only bot posts: the personal account never sends anything.',
      'MongoDB state: the last message read per channel, a hash per job so nothing is sent twice, and a cache of AI results keyed by that hash.',
      'The AI pass can only reject what the keyword filter approved, never the reverse, and any failure falls back automatically.',
      'Scheduled on GitHub Actions every five minutes, so nothing has to stay running.',
      'Operational tooling: a doctor command for config and connections, a full dry-run mode, a monthly cleanup, and unit tests.',
    ],
  },
  {
    id: 'rate-limiter',
    title: 'rate-limiter',
    description:
      'A zero-dependency, framework-agnostic rate limiter for Node.js, published on npm as @osamaibrahim/rate-limiter.',
    longDescription:
      'A TypeScript library with two algorithms, sliding window and token bucket, behind one API. It ships Express-style middleware with standard RateLimit-* headers, a standalone limiter for any runtime code, and a pluggable Store interface so several app instances can share state through a backend such as Redis. Dual ESM/CommonJS builds, full type definitions.',
    category: 'library',
    status: 'published',
    visual: 'limiter',
    featured: true,
    tags: ['TypeScript', 'Node.js', 'Express', 'tsup', 'Vitest', 'npm'],
    liveUrl: '#',
    githubUrl: 'https://github.com/OsamaIbrhim/rate-limiter',
    npmUrl: 'https://www.npmjs.com/package/@osamaibrahim/rate-limiter',
    install: 'npm install @osamaibrahim/rate-limiter',
    highlights: [
      'Sliding window prevents the boundary-burst problem; token bucket allows controlled bursts after idle periods.',
      'Pluggable Store interface: an in-memory store is included, and shared backends plug in for multi-instance apps.',
      'Middleware options for custom client keys (per user instead of per IP), status codes and limit callbacks.',
      'Zero runtime dependencies, full type definitions, dual ESM/CJS output built with tsup and tested with Vitest.',
    ],
  },
  {
    id: 'blood-donation-platform',
    title: 'Blood Donation Platform',
    description:
      'A MERN platform connecting blood donors with hospitals, featuring role-based dashboards, real-time updates, and secure authentication.',
    longDescription:
      'A full-stack blood donation system with separate donor and hospital dashboards. Built on a React 19 + Vite + Tailwind frontend and an Express 5 + MongoDB backend, it provides JWT-based authentication with role-based redirection, real-time notifications via Socket.io, image uploads through Cloudinary, and email notifications with Nodemailer.',
    category: 'fullstack',
    status: 'demo-soon',
    visual: 'image',
    tags: ['React', 'Express', 'MongoDB', 'Mongoose', 'Socket.io', 'JWT', 'Tailwind CSS'],
    image: bdpImage,
    liveUrl: '#',
    githubUrl: 'https://github.com/OsamaIbrhim/Blood-Donation-Platform',
    highlights: [
      'Designed donor and hospital dashboards with user-specific stats and actions.',
      'Implemented JWT authentication with role-based redirection and bcrypt password hashing.',
      'Added real-time updates using Socket.io and toast notifications for instant feedback.',
      'Integrated Cloudinary for image uploads and Nodemailer for email notifications.',
      'Secured the API with Helmet, CORS, and express-validator input validation.',
    ],
  },
  {
    id: 'youtube-clone',
    title: 'YouTube Clone',
    description:
      'Video sharing application featuring video playback, searching, category filtering, and channel pages powered by the RapidAPI YouTube V3 service.',
    longDescription:
      'A fast, responsive streaming clone focused on video search and rich content navigation. Built with React and Material UI, it consumes the RapidAPI YouTube V3 endpoint to render HD video playback, related suggestions, channel statistics, and categorized video feeds across dedicated routed pages.',
    category: 'frontend',
    status: 'live',
    visual: 'image',
    tags: ['React', 'Material UI', 'RapidAPI', 'React Router', 'Axios'],
    image: youtubeImage,
    liveUrl: 'https://youtube-clone-blue-delta.vercel.app/',
    githubUrl: 'https://github.com/OsamaIbrhim/Youtube-clone',
    highlights: [
      'Built a fully responsive video grid layout using Material UI (MUI v5) components and the sx styling system.',
      'Implemented HD video playback with React Player, supporting native play, pause, and seek controls.',
      'Integrated the RapidAPI YouTube V3 API via Axios to fetch videos, channels, and search results.',
      'Structured multi-page navigation (feed, video detail, channel, and search pages) with React Router v6.',
      'Designed a clean YouTube-inspired dark UI with a categorized sidebar and live search bar.',
    ],
  },
  {
    id: 'doctor-api',
    title: 'Doctor Booking REST API',
    description: 'A secure, tested REST API backend for a medical booking system, built with Express and MongoDB.',
    longDescription:
      'A backend-focused REST API for managing doctors, patients, and appointments. Built with Express and MongoDB/Mongoose, it features JWT authentication, bcrypt password hashing, email integration via Nodemailer, input validation, and an automated test suite using Jest and Supertest.',
    category: 'backend',
    status: 'demo-soon',
    visual: 'image',
    tags: ['Node.js', 'Express', 'MongoDB', 'Mongoose', 'JWT', 'Jest'],
    image: doctorImage,
    liveUrl: '#',
    githubUrl: 'https://github.com/OsamaIbrhim/Doctor-Api',
    highlights: [
      'Designed RESTful endpoints for doctors, patients, and appointment booking.',
      'Implemented JWT authentication with bcrypt password hashing and Helmet security headers.',
      'Added email workflows with Nodemailer and validation with the validator library.',
      'Wrote integration tests using Jest and Supertest for reliable API behavior.',
    ],
  },
  {
    id: 'not',
    title: 'Network of Trust',
    description:
      'A full-stack platform for issuing tamper-proof academic credentials, where only verified institutions can issue certificates to registered students on Ethereum.',
    longDescription:
      'A decentralized "Network of Trust" built on Ethereum. Smart contracts (Identity, CourseManagement, Certificates) handle role-based verification, institution-scoped course management, and reentrancy-protected certificate issuance, with certificate metadata linked to IPFS. A read-only Express API proxies on-chain view functions, while a React + Vite admin dashboard performs on-chain writes through MetaMask.',
    category: 'web3',
    status: 'demo-soon',
    note: 'My graduation project.',
    visual: 'image',
    tags: ['Solidity', 'Hardhat', 'Ethers.js', 'React', 'TypeScript', 'Express', 'MetaMask'],
    image: notImage,
    liveUrl: '#',
    githubUrl: 'https://github.com/OsamaIbrhim/Network-Of-Trust',
    highlights: [
      'Authored Solidity contracts for identity, course management, and certificate issuance with reentrancy protection.',
      'Implemented role-based access so only verified institutions can issue credentials to registered students.',
      'Linked certificate metadata to IPFS hashes for tamper-proof off-chain document storage.',
      'Built a read-only Express API that proxies on-chain view functions for fast frontend reads.',
      'Developed a React + Vite + TypeScript admin dashboard with MetaMask for on-chain writes.',
    ],
  },
  {
    id: 'disney-clone',
    title: 'Disney+ Clone',
    description:
      'Streaming platform clone with user authentication, dynamic content fetching from TMDB, and responsive UI.',
    longDescription:
      'An interactive, frontend-heavy streaming clone replicating the Disney+ user experience. Features movie sliders, dynamic row categories pulling directly from live TMDB endpoints, search, and user auth state managed through Redux and Firebase.',
    category: 'frontend',
    status: 'demo-soon',
    visual: 'image',
    tags: ['React', 'Firebase', 'Redux', 'TMDB API', 'Styled Components'],
    image: disneyImage,
    liveUrl: '#',
    githubUrl: '#',
    highlights: [
      'Built slider animations and transitions with CSS.',
      'Configured multi-page routing and nested dynamic routes using React Router.',
      'Managed global state and user profiles with Redux.',
      'Enabled Google Sign-In and profile persistence through Firebase Auth.',
    ],
  },
];
