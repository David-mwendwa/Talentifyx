import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api, { errorMessage } from './api';
import { useAuth } from '../context/AuthContext';

export const useSavedJobs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [savedIds, setSavedIds] = useState(new Set());

  useEffect(() => {
    if (!user) return setSavedIds(new Set());
    api
      .get('/applications')
      .then(({ data }) =>
        setSavedIds(new Set(data.applications.map((a) => a.job._id)))
      )
      .catch(() => setSavedIds(new Set()));
  }, [user]);

  const save = useCallback(
    async (job, status = 'saved') => {
      if (!user) return navigate('/login');
      try {
        await api.post('/applications', { jobId: job._id, status });
        setSavedIds((current) => new Set(current).add(job._id));
        toast.success(
          status === 'applied' ? 'Marked as applied' : 'Saved to your board'
        );
      } catch (error) {
        toast.error(errorMessage(error));
      }
    },
    [user, navigate]
  );

  return { savedIds, save };
};
