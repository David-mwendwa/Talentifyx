import { Link } from 'react-router-dom';
import {
  FiArrowRight,
  FiBriefcase,
  FiDatabase,
  FiFilter,
  FiShield,
  FiTarget,
  FiTrendingUp,
} from 'react-icons/fi';

const FEATURES = [
  {
    icon: FiDatabase,
    title: 'Real listings, not seed data',
    body: 'Every role on the board is pulled from the open Arbeitnow job board API and refreshed on demand. Nothing here is invented to fill a screen.',
  },
  {
    icon: FiTarget,
    title: 'Stack-based matching',
    body: 'Each listing is scanned for the technologies it actually asks for. Declare your stack once and every role gets a match score — the share of your stack it covers.',
  },
  {
    icon: FiFilter,
    title: 'Filters that mean something',
    body: 'Filter by technology, seniority, remote or on-site, and location. Save any combination as a search and Talentifyx tells you when new roles match it.',
  },
  {
    icon: FiBriefcase,
    title: 'A pipeline, not a spreadsheet',
    body: 'Move roles through saved, applied, interview, offer and rejected. Each card holds your notes, the person you spoke to, salary discussed, and a follow-up date.',
  },
  {
    icon: FiTrendingUp,
    title: 'Know your numbers',
    body: 'See your interview and offer conversion rates, what the market is hiring for, and which single technology would unlock the most additional roles for you.',
  },
  {
    icon: FiShield,
    title: 'Built carefully',
    body: 'Listings arrive as third-party HTML, so they are sanitized through an allow-list before they are ever stored — scripts, iframes and attributes stripped.',
  },
];

const STEPS = [
  'Create a profile and pick the technologies you actually ship with.',
  'Browse the board — roles are scored against your stack, highest fit first.',
  'Save what looks right, apply, and move it through your pipeline.',
  'Set follow-up dates so no conversation goes quiet by accident.',
];

const About = () => (
  <div className="container max-w-5xl space-y-16 py-14">
    <header className="space-y-5 text-center">
      <span className="chip-primary mx-auto">About Talentifyx</span>
      <h1 className="font-heading text-4xl font-extrabold tracking-tight text-dark-900 dark:text-white sm:text-5xl">
        Where top talent meets{' '}
        <span className="bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">
          precision matching
        </span>
      </h1>
      <p className="mx-auto max-w-2xl text-lg text-dark-600 dark:text-dark-300">
        Talentifyx is a job board for engineers who are tired of scrolling listings
        written for everyone. It reads what each role actually requires, scores it
        against the stack you work in, and gives you somewhere to run the whole
        search from first save to signed offer.
      </p>
    </header>

    <section className="card space-y-4 p-8">
      <h2 className="section-title">Why it exists</h2>
      <div className="space-y-4 text-dark-600 dark:text-dark-300">
        <p>
          General job boards match on job titles and keywords. That is why a React
          developer ends up wading through roles that mention React once in a list
          of nice-to-haves, and misses the ones that call the same job something
          else entirely.
        </p>
        <p>
          Talentifyx works from the technologies instead. Every listing is scanned
          against a canonical list of languages, frameworks and platforms, so a role
          is findable by what you would actually be working in. Your match score is
          simply the share of your declared stack that a role covers — no black box,
          no ranking you cannot explain.
        </p>
        <p>
          The other half of a job hunt is the admin, and that usually leaks into a
          spreadsheet nobody keeps up to date. So the pipeline lives here too,
          attached to the real listing: your notes, your contact, the salary
          discussed, and the date you promised to follow up.
        </p>
      </div>
    </section>

    <section className="space-y-8">
      <h2 className="section-title text-center">What you get</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, body }) => (
          <div key={title} className="card space-y-3 p-6">
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-primary-50 text-lg text-primary-600 dark:bg-primary-950 dark:text-primary-400">
              <Icon />
            </span>
            <h3 className="font-heading text-lg font-semibold text-dark-900 dark:text-white">
              {title}
            </h3>
            <p className="text-sm leading-relaxed text-dark-600 dark:text-dark-400">
              {body}
            </p>
          </div>
        ))}
      </div>
    </section>

    <section className="card space-y-6 p-8">
      <h2 className="section-title">How to use it</h2>
      <ol className="space-y-4">
        {STEPS.map((step, index) => (
          <li key={step} className="flex gap-4">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary-600 text-sm font-bold text-white">
              {index + 1}
            </span>
            <p className="pt-1 text-dark-600 dark:text-dark-300">{step}</p>
          </li>
        ))}
      </ol>
    </section>

    <section className="card space-y-4 p-8">
      <h2 className="section-title">Under the hood</h2>
      <p className="text-dark-600 dark:text-dark-300">
        Talentifyx is a MERN application — React and Tailwind on the front, Express
        and MongoDB behind it, with JWT auth in httpOnly cookies. Listings are
        ingested from the{' '}
        <a
          href="https://www.arbeitnow.com/job-board-api"
          target="_blank"
          rel="noreferrer"
          className="text-primary-600 hover:underline dark:text-primary-400">
          Arbeitnow job board API
        </a>
        , normalised, tagged and sanitized on the way in, so the browser only ever
        renders vetted markup.
      </p>
    </section>

    <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 to-secondary-600 px-8 py-14 text-center text-white">
      <h2 className="font-heading text-3xl font-extrabold">
        Ready to see your matches?
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-primary-50">
        Create a profile, declare your stack, and let Talentifyx rank the market for
        you.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link to="/register" className="btn bg-white px-6 text-primary-700 hover:bg-primary-50">
          Create your profile <FiArrowRight />
        </Link>
        <Link
          to="/jobs"
          className="btn border border-white/40 px-6 text-white hover:bg-white/10">
          Browse roles first
        </Link>
      </div>
    </section>
  </div>
);

export default About;
