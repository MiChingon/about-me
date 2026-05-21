export type Experience = {
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  highlights: string[];
};

export type SkillGroup = {
  category: string;
  items: string[];
};

export type Education = {
  school: string;
  degree: string;
  field: string;
};

export type Language = {
  name: string;
  level: string;
  notes: string[];
};

export type Profile = {
  name: string;
  shortName: string;
  role: string;
  location: string;
  email: string;
  tagline: string;
  intro: string;
  about: string[];
  status: { label: string; tone: 'green' | 'amber' | 'cyan' }[];
  skillGroups: SkillGroup[];
  highlights: string[];
  experiences: Experience[];
  education: Education;
  languages: Language[];
  socials: { label: string; href: string; handle: string; icon: 'github' | 'linkedin' | 'mail' }[];
};

export const profile: Profile = {
  name: 'Fabian Almaraz',
  shortName: 'Fabian',
  role: 'Senior Software Engineer',
  location: 'Mexico',
  email: 'fabian.almaraz@radixiot.com',
  tagline: 'Building quality software with React, TypeScript and modern tooling.',
  intro:
    'Senior Software Engineer with almost a decade of experience shipping production software — from Android apps to modern React SPAs.',
  about: [
    'I am an experienced React Front-End developer with almost 5 years of experience, and an Android (Mobile) developer with 4 years of prior experience building native apps.',
    "I've helped clients build quality software with React and SPAs, with hands-on experience in unit testing, integration testing, TDD, state management, and design patterns.",
    "I've contributed to website analytics using the GA console to improve UX and gather data on how users interact with the product, assisted with deployments, and handled basic backend tasks in MySQL Workbench and IntelliJ.",
    'I enjoy requirements gathering, technical planning, grooming sessions, and coaching teammates — making sure the team aligns on the right approach before code is written.',
  ],
  status: [
    { label: 'Open to opportunities', tone: 'green' },
    { label: 'Remote · Mexico', tone: 'cyan' },
    { label: 'English · Advanced', tone: 'amber' },
  ],
  skillGroups: [
    {
      category: 'Frontend',
      items: ['React 18', 'TypeScript', 'JavaScript', 'HTML', 'Vite', 'Material UI', 'React Query'],
    },
    {
      category: 'Patterns & Practices',
      items: [
        'Custom Hooks',
        'Context API',
        'Routing',
        'Error Handling',
        'Memoization',
        'UI / UX',
        'Unit Testing',
        'TDD',
        'State Management',
      ],
    },
    {
      category: 'Mobile',
      items: ['Android', 'Java', 'Android Studio'],
    },
    {
      category: 'Backend & Data',
      items: ['REST APIs', 'IntelliJ CE', 'MySQL Workbench', 'Basic BE tasks'],
    },
    {
      category: 'Tooling & DevOps',
      items: ['Git', 'GitHub', 'GitHub Desktop', 'TeamCity (CI/CD)', 'Claude Code', 'Google Analytics'],
    },
  ],
  highlights: [
    '~5 years of React experience, most recently on React 18 + Vite SPAs.',
    '4 years of native Android development with Java and Android Studio.',
    'Hands-on with TDD, unit & integration testing, and design patterns.',
    'Contributed to GA-powered funnel analysis and UX improvements.',
    'Comfortable with merge & rebase workflows on remote GitHub repos.',
    'Started using Claude Code to review branches for risks and recommendations.',
  ],
  experiences: [
    {
      company: '3Pillar Global',
      role: 'Senior Software Engineer',
      location: 'United States · Remote',
      startDate: 'Apr 2023',
      endDate: 'Present',
      highlights: [
        'Deliver quality software and assist during App releases with code deployment.',
        'Teamwork, coaching, and knowledge sharing across the team.',
        'Cover for the Technical Leader in his absence, addressing his responsibilities with the team.',
        'Take part in requirements gathering and technical planning — guiding which technologies to use and which are deprecated.',
        'Develop basic backend tasks for REST endpoints when needed.',
        'Research new technologies and produce good-quality documentation.',
        'Use Google Analytics to collect data on how users interact with the site, providing funnel explorations and data analysis.',
      ],
    },
    {
      company: 'Tiempo Development',
      role: 'Junior / Mid Software Engineer',
      location: 'Mexico',
      startDate: 'Mar 2017',
      endDate: 'Apr 2021',
      highlights: [
        'Software development across multiple client projects.',
        'Understanding business requirements and translating them into shipped features.',
        'Worked with Scrum and Kanban methodologies.',
        'Coached, helped, and supported coworkers across the team.',
        'Managed remote repositories and exercised solid English communication skills.',
      ],
    },
    {
      company: 'JaguarLabs',
      role: 'Android Developer',
      location: 'Mexico',
      startDate: 'Jul 2015',
      endDate: 'Mar 2017',
      highlights: [
        'Native mobile apps development with Java and Android Studio.',
        'Worked with agile methodologies (Scrum) inside a small product team.',
        'Delivered features requested by clients on schedule.',
      ],
    },
  ],
  education: {
    school: 'Universidad Tecnológica de Jalisco',
    degree: 'Engineering',
    field: 'Tecnologías de la Información y la Comunicación (TIC)',
  },
  languages: [
    {
      name: 'English',
      level: 'Advanced',
      notes: [
        'Able to communicate fluently and understand clearly.',
        'Able to produce documentation in English.',
      ],
    },
    {
      name: 'Spanish',
      level: 'Native',
      notes: [],
    },
  ],
  socials: [
    { label: 'Email', href: 'mailto:fabian.almaraz@radixiot.com', handle: 'fabian.almaraz@radixiot.com', icon: 'mail' },
    { label: 'GitHub', href: 'https://github.com/', handle: '@fabian-almaraz', icon: 'github' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/', handle: 'in/fabian-almaraz', icon: 'linkedin' },
  ],
};
