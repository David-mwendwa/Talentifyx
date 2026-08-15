import { SENIORITY } from './constants.js';

// Canonical stack name -> patterns that identify it in job text.
// Patterns are matched case-insensitively against word boundaries.
const STACK_PATTERNS = {
  JavaScript: ['javascript'],
  TypeScript: ['typescript'],
  React: ['react', 'reactjs', 'react\\.js'],
  'Next.js': ['next\\.js', 'nextjs'],
  Vue: ['vue', 'vuejs', 'vue\\.js', 'nuxt'],
  Angular: ['angular', 'angularjs'],
  'Node.js': ['node\\.js', 'nodejs', 'express\\.js'],
  Python: ['python', 'django', 'flask', 'fastapi'],
  Java: ['java', 'spring boot'],
  'C#': ['c#', 'csharp', '\\.net', 'dotnet', 'asp\\.net'],
  Go: ['golang'],
  Rust: ['rust'],
  PHP: ['php', 'laravel', 'symfony'],
  Ruby: ['ruby', 'rails'],
  Kotlin: ['kotlin'],
  Swift: ['swift', 'ios'],
  Flutter: ['flutter', 'dart'],
  'React Native': ['react native'],
  Android: ['android'],
  SQL: ['sql', 'postgres', 'postgresql', 'mysql', 'mariadb'],
  MongoDB: ['mongodb', 'mongo'],
  Redis: ['redis'],
  GraphQL: ['graphql', 'apollo'],
  AWS: ['aws', 'amazon web services'],
  Azure: ['azure'],
  GCP: ['gcp', 'google cloud'],
  Docker: ['docker'],
  Kubernetes: ['kubernetes', 'k8s'],
  Terraform: ['terraform'],
  DevOps: ['devops', 'sre', 'ci/cd'],
  Linux: ['linux', 'unix'],
  'Machine Learning': [
    'machine learning',
    'deep learning',
    'pytorch',
    'tensorflow',
    'llm',
  ],
  'Data Engineering': ['data engineer', 'spark', 'airflow', 'etl', 'databricks'],
  'Data Science': ['data scien', 'pandas', 'numpy', 'jupyter'],
  Security: ['cyber security', 'cybersecurity', 'penetration test', 'infosec'],
  QA: ['qa engineer', 'test automation', 'selenium', 'cypress', 'playwright'],
  'UI/UX': ['ui/ux', 'ux design', 'figma', 'product design'],
  Salesforce: ['salesforce'],
  SAP: ['sap'],
};

const STACK_REGEX = Object.entries(STACK_PATTERNS).map(([name, patterns]) => [
  name,
  new RegExp(`(^|[^a-z0-9+#.])(${patterns.join('|')})([^a-z0-9+#.]|$)`, 'i'),
]);

export const ALL_STACKS = Object.keys(STACK_PATTERNS).sort();

export const extractStack = (...sources) => {
  const text = sources.flat().filter(Boolean).join(' ').toLowerCase();
  return STACK_REGEX.filter(([, regex]) => regex.test(text)).map(
    ([name]) => name
  );
};

const SENIORITY_PATTERNS = [
  [SENIORITY.INTERNSHIP, /intern|praktikum|working student|werkstudent|trainee/i],
  [SENIORITY.LEAD, /\b(lead|principal|head of|staff|architect|manager)\b/i],
  [SENIORITY.SENIOR, /\b(senior|sr\.?|expert|experienced)\b/i],
  [SENIORITY.JUNIOR, /\b(junior|jr\.?|entry.level|graduate|einsteiger)\b/i],
];

export const extractSeniority = (title = '') => {
  const match = SENIORITY_PATTERNS.find(([, regex]) => regex.test(title));
  return match ? match[0] : SENIORITY.MID;
};

export const stripHtml = (html = '') =>
  html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[a-z]+;|&#x?[0-9a-f]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
