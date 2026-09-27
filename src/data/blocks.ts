// Each section of the site is a block. `claim` is the one line a visitor can
// edit: it is part of the block's hashed payload, so changing it breaks the chain.
export interface BlockDef {
  index: number;
  id: string;
  nav: string;
  label: string;
  claim: string;
}

export const BLOCKS: BlockDef[] = [
  {
    index: 0,
    id: 'home',
    nav: 'Home',
    label: 'Genesis',
    claim: 'I build full-stack products that hold up in production: clear interfaces, careful APIs, data you can rely on.',
  },
  {
    index: 1,
    id: 'about',
    nav: 'About',
    label: 'Identity',
    claim: 'Clean interfaces on top, careful architecture underneath, correct data at the core.',
  },
  {
    index: 2,
    id: 'stack',
    nav: 'Stack',
    label: 'Three scripts',
    claim: 'One feature, written three times: for the interface, for the API, for the database.',
  },
  {
    index: 3,
    id: 'experience',
    nav: 'Experience',
    label: 'Record',
    claim: 'Eight months shipping production MERN features on a real CRM platform.',
  },
  {
    index: 4,
    id: 'projects',
    nav: 'Projects',
    label: 'Proof of work',
    claim: 'A portfolio is proof of work. Here is mine, from a package on npm to a live e-commerce platform.',
  },
  {
    index: 5,
    id: 'education',
    nav: 'Education',
    label: 'Education',
    claim: 'Computer Science & Pure Mathematics at Menoufia University, and a self-taught streak that never switches off.',
  },
];
