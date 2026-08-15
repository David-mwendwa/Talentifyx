import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiBell } from 'react-icons/fi';
import api, { errorMessage } from '../utils/api';
import { useAuth } from '../context/AuthContext';

// Suggests a name from the filters themselves so saving is one click in the
// common case.
const suggestName = (query) => {
  const bits = [
    query.workMode === 'remote' ? 'Remote' : '',
    query.seniority?.split(',')[0],
    query.stack?.split(',').slice(0, 2).join(' + '),
    query.search,
  ].filter(Boolean);
  const name = bits.join(' ').trim();
  return name ? `${name} roles`.replace(/\s+/g, ' ') : 'All roles';
};

const SaveSearchButton = ({ query }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const start = () => {
    if (!user) return navigate('/login');
    setName(suggestName(query));
    setOpen(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/saved-searches', { name, query });
      toast.success('Search saved — find it in your dashboard');
      setOpen(false);
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  if (!open) {
    return (
      <button onClick={start} className="btn-outline h-11 whitespace-nowrap">
        <FiBell /> Save search
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="flex gap-2">
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        aria-label="Name this search"
        className="form-input h-11 sm:w-56"
        placeholder="Name this search"
      />
      <button type="submit" disabled={saving} className="btn-primary h-11">
        {saving ? 'Saving…' : 'Save'}
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="btn-ghost h-11">
        Cancel
      </button>
    </form>
  );
};

export default SaveSearchButton;
