import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api, { errorMessage } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import ResumeDropzone from '../components/ResumeDropzone';

const LINK_FIELDS = [
  { key: 'linkedinUrl', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/…' },
  { key: 'githubUrl', label: 'GitHub', placeholder: 'https://github.com/…' },
  { key: 'portfolioUrl', label: 'Portfolio', placeholder: 'https://…' },
];

const Profile = () => {
  const { user, setUser } = useAuth();
  const [allStacks, setAllStacks] = useState([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: user.name,
    lastName: user.lastName,
    headline: user.headline,
    location: user.location,
    desiredRole: user.desiredRole || '',
    salaryExpectation: user.salaryExpectation || '',
    yearsExperience: user.yearsExperience || 0,
    openToRemote: user.openToRemote,
    stack: user.stack,
    linkedinUrl: user.linkedinUrl || '',
    githubUrl: user.githubUrl || '',
    portfolioUrl: user.portfolioUrl || '',
  });

  useEffect(() => {
    api.get('/jobs/filters').then(({ data }) => setAllStacks(data.allStacks));
  }, []);

  const set = (patch) => setForm((current) => ({ ...current, ...patch }));

  const toggleStack = (tech) =>
    setForm((current) => ({
      ...current,
      stack: current.stack.includes(tech)
        ? current.stack.filter((t) => t !== tech)
        : [...current.stack, tech],
    }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.patch('/users/profile', form);
      setUser(data.user);
      toast.success('Profile updated — matches re-scored');
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_380px] lg:items-start">
        <div className="space-y-6">
          <section className="card space-y-4 p-6">
            <div>
              <h2 className="font-heading text-lg font-semibold text-dark-900 dark:text-white">
                Your stack
              </h2>
              <p className="text-sm text-dark-500 dark:text-dark-400">
                This drives every match score on the site. {form.stack.length}{' '}
                selected.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {allStacks.map((tech) => (
                <button
                  key={tech}
                  type="button"
                  onClick={() => toggleStack(tech)}
                  className={
                    form.stack.includes(tech)
                      ? 'chip-primary !px-3 !py-1.5'
                      : 'chip !px-3 !py-1.5 hover:border-primary-300'
                  }>
                  {tech}
                </button>
              ))}
            </div>
          </section>

          <section className="card space-y-4 p-6">
            <div>
              <h2 className="font-heading text-lg font-semibold text-dark-900 dark:text-white">
                Your CV
              </h2>
              <p className="text-sm text-dark-500 dark:text-dark-400">
                Keep the current version here so it is ready whenever an
                application asks for it.
              </p>
            </div>
            <ResumeDropzone user={user} onChange={setUser} />
          </section>

          <section className="card space-y-4 p-6">
            <div>
              <h2 className="font-heading text-lg font-semibold text-dark-900 dark:text-white">
                Links
              </h2>
              <p className="text-sm text-dark-500 dark:text-dark-400">
                Kept here so they are one copy-paste away when an application asks.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {LINK_FIELDS.map((field) => (
                <div key={field.key}>
                  <label className="form-label" htmlFor={field.key}>
                    {field.label}
                  </label>
                  <input
                    id={field.key}
                    type="url"
                    className="form-input"
                    placeholder={field.placeholder}
                    value={form[field.key]}
                    onChange={(e) => set({ [field.key]: e.target.value })}
                  />
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="card space-y-4 p-6">
          <h2 className="font-heading text-lg font-semibold text-dark-900 dark:text-white">
            Details
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div>
              <label className="form-label" htmlFor="name">
                First name
              </label>
              <input
                id="name"
                className="form-input"
                value={form.name}
                onChange={(e) => set({ name: e.target.value })}
              />
            </div>
            <div>
              <label className="form-label" htmlFor="lastName">
                Last name
              </label>
              <input
                id="lastName"
                className="form-input"
                value={form.lastName}
                onChange={(e) => set({ lastName: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="form-label" htmlFor="headline">
              Headline
            </label>
            <input
              id="headline"
              className="form-input"
              placeholder="Fullstack engineer — React & Node"
              value={form.headline}
              onChange={(e) => set({ headline: e.target.value })}
            />
          </div>

          <div>
            <label className="form-label" htmlFor="desiredRole">
              Role you want next
            </label>
            <input
              id="desiredRole"
              className="form-input"
              placeholder="Senior Frontend Engineer"
              value={form.desiredRole}
              onChange={(e) => set({ desiredRole: e.target.value })}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div>
              <label className="form-label" htmlFor="location">
                Location
              </label>
              <input
                id="location"
                className="form-input"
                placeholder="Nairobi, Kenya"
                value={form.location}
                onChange={(e) => set({ location: e.target.value })}
              />
            </div>
            <div>
              <label className="form-label" htmlFor="yearsExperience">
                Years of experience
              </label>
              <input
                id="yearsExperience"
                type="number"
                min={0}
                max={50}
                className="form-input"
                value={form.yearsExperience}
                onChange={(e) => set({ yearsExperience: Number(e.target.value) })}
              />
            </div>
          </div>

          <div>
            <label className="form-label" htmlFor="salaryExpectation">
              Salary expectation
            </label>
            <input
              id="salaryExpectation"
              className="form-input"
              placeholder="e.g. $85,000"
              value={form.salaryExpectation}
              onChange={(e) => set({ salaryExpectation: e.target.value })}
            />
          </div>

          <label className="flex items-center gap-3 text-sm text-dark-700 dark:text-dark-200">
            <input
              type="checkbox"
              className="rounded border-dark-300 text-primary-600 focus:ring-primary-500"
              checked={form.openToRemote}
              onChange={(e) => set({ openToRemote: e.target.checked })}
            />
            Open to remote roles
          </label>

          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? 'Saving…' : 'Save profile'}
          </button>
        </section>
      </div>
    </form>
  );
};

export default Profile;
