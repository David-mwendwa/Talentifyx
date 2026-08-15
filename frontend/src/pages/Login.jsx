import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { errorMessage } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(form);
      toast.success('Welcome back');
      navigate('/dashboard');
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemo = () =>
    setForm({ email: 'demo@talentifyx.dev', password: 'demopass123' });

  return (
    <div className="container grid place-items-center py-16">
      <div className="card w-full max-w-md space-y-6 p-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <Logo compact />
          <h1 className="font-heading text-2xl font-bold text-dark-900 dark:text-white">
            Sign in to Talentifyx
          </h1>
          <p className="text-sm text-dark-500 dark:text-dark-400">
            Pick up your match feed and application board.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
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
          <div>
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              className="form-input"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
          <button type="button" onClick={fillDemo} className="btn-outline w-full">
            Use demo account
          </button>
        </form>

        <p className="text-center text-sm text-dark-500 dark:text-dark-400">
          New here?{' '}
          <Link to="/register" className="font-medium text-primary-600 hover:underline">
            Create a profile
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
