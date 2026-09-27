export const PROFILE = {
  name: 'Osama Ibrahim',
  nameAr: 'أسامة إبراهيم',
  role: 'Software Engineer',
  discipline: 'Full-Stack Developer',
  location: 'Tanta, Egypt',
  availability: 'Open to remote & relocation',
  email: 'osamaibrahim.dev@gmail.com',
  whatsapp: '201024276623',
  whatsappDisplay: '+20 102 4276 623',
  github: 'https://github.com/OsamaIbrhim',
  linkedin: 'https://www.linkedin.com/in/osamaibrhim',
  npm: 'https://www.npmjs.com/package/@osamaibrahim/rate-limiter',
  // Served from /public, so it always matches the deployed site.
  resume: `${import.meta.env.BASE_URL}Osama_Ibrahim_CV.pdf`,
};

export const EXPERIENCE = [
  {
    role: 'Full Stack Developer',
    kind: 'Internship',
    company: 'DigiCrafterz',
    product: 'Sendifier CRM',
    period: 'May 2024 – Dec 2024',
    duration: '8 months',
    note: 'A 6-month internship the company extended.',
    stack: ['MongoDB', 'Express', 'React', 'Node.js'],
    highlights: [
      'Built the Departments module from scratch, and the Tasks feature integrated with employee calendars, from database schema to React UI.',
      'Designed and optimized RESTful API endpoints in Node.js and Express for the Departments, Tasks and Calendar features.',
      'Built and refined reusable React components, improving usability, consistency and accessibility.',
      'Worked in a cross-functional Agile team: code reviews, Git branching workflows, iterative delivery.',
    ],
  },
];

export const DEGREE = {
  title: 'B.Sc. Computer Science & Pure Mathematics',
  school: 'Menoufia University',
  period: 'Sep 2020 – Jul 2025',
  focus: ['Data Structures', 'Algorithms', 'OOP', 'Operating Systems', 'Databases', 'Software Design', 'Pure Mathematics'],
};

// The Rosetta Stone carried one decree in three scripts. Hieroglyphic was the
// script of images; Demotic the working script of daily business; Greek the
// language of record and law.
export const REGISTERS = [
  {
    key: 'interface',
    script: 'Hieroglyphic',
    scriptNote: 'the script of images',
    layer: 'Interface',
    lang: 'React · TypeScript',
    skills: ['React', 'Next.js', 'TypeScript', 'Redux Toolkit', 'Tailwind CSS', 'Vite'],
    code: `async function onCheckout() {
  // the client sends intent, never prices
  const { url } = await api.post('/orders/checkout', {
    items: cart.map(({ id, qty }) => ({ id, qty })),
    shipping,
  });
  window.location.assign(url); // Stripe Checkout
}`,
  },
  {
    key: 'api',
    script: 'Demotic',
    scriptNote: 'the script of daily business',
    layer: 'API',
    lang: 'Node.js · Express',
    skills: ['Node.js', 'Express', 'REST APIs', 'JWT & refresh tokens', 'Stripe', 'Socket.io'],
    code: `router.post(
  '/orders/checkout',
  requireAuth,
  rateLimiter({ limit: 10, windowMs: 60_000 }),
  async (req, res) => {
    const order = await orders.createPriced(req.user.id, req.body.items);
    const session = await stripe.checkout.sessions.create(toStripe(order));
    res.status(201).json({ url: session.url });
  },
);`,
  },
  {
    key: 'database',
    script: 'Greek',
    scriptNote: 'the script of record and law',
    layer: 'Database',
    lang: 'MongoDB · Mongoose',
    skills: ['MongoDB', 'Mongoose', 'Transactions', 'Aggregation', 'Schema design'],
    code: `await mongoose.connection.transaction(async (session) => {
  for (const { id, qty } of order.items) {
    // reserve stock atomically, or fail the whole order
    const res = await Product.updateOne(
      { _id: id, stock: { $gte: qty } },
      { $inc: { stock: -qty } },
      { session },
    );
    if (res.modifiedCount === 0) throw new OutOfStockError(id);
  }
  await Order.create([order], { session });
});`,
  },
];

export const TOOLKIT = [
  'Git & GitHub',
  'GitHub Actions CI',
  'Vercel',
  'Postman',
  'Jest & Supertest',
  'Vitest',
  'C++, C#, Python',
  'Data Structures & Algorithms',
  'Solidity & Hardhat',
];
