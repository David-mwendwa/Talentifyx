import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api, { errorMessage } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [allStacks, setAllStacks] = useState([]);
  const [stack, setStack] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  useEffect(() => {
    api.get('/jobs/filters').then(({ data }) => setAllStacks(data.allStacks));
  }, []);

  const toggleStack = (tech) =>
    setStack((current) =>
      current.includes(tech)
        ? current.filter((t) => t !== tech)
        : [...current, tech]
    );

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await register(form);
      if (stack.length) await api.patch('/users/profile', { stack });
      toast.success('Profile created — here are your matches');
      navigate('/dashboard');
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container grid place-items-center py-16">
      <div className="card w-full max-w-xl space-y-6 p-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <Logo compact />
          <h1 className="font-heading text-2xl font-bold text-dark-900 dark:text-white">
            Create your profile
          </h1>
          <p className="text-sm text-dark-500 dark:text-dark-400">
            Declare your stack now — it is what your match scores are built from.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="form-label" htmlFor="name">
                First name
              </label>
              <input
                id="name"
                required
                className="form-input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="form-label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                className="form-input"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              className="form-input"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <p className="mt-1 text-xs text-dark-500 dark:text-dark-400">
              At least 8 characters.
            </p>
          </div>

          <div>
            <label className="form-label">
              Your stack {stack.length > 0 && `(${stack.length} selected)`}
            </label>
            <div className="flex max-h-52 flex-wrap gap-2 overflow-y-auto rounded-lg border border-dark-200 p-3 dark:border-dark-800">
              {allStacks.map((tech) => (
                <button
                  key={tech}
                  type="button"
                  onClick={() => toggleStack(tech)}
                  className={
                    stack.includes(tech)
                      ? 'chip-primary !px-3 !py-1.5'
                      : 'chip !px-3 !py-1.5 hover:border-primary-300'
                  }>
                  {tech}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Creating profile…' : 'Create profile'}
          </button>
        </form>

        <p className="text-center text-sm text-dark-500 dark:text-dark-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
