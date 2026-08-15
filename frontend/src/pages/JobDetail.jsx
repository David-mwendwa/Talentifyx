import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import api from '../utils/api';
import JobCard from '../components/JobCard';
import JobDetailPanel from '../components/JobDetailPanel';
import Loading from '../components/Loading';
import { useSavedJobs } from '../utils/useSavedJobs';
import { lastJobsPath } from '../utils/lastJobsQuery';

const JobDetail = () => {
  const { slug } = useParams();
  const { savedIds, save } = useSavedJobs();
  const [data, setData] = useState(null);

  useEffect(() => {
    setData(null);
    api.get(`/jobs/${slug}`).then(({ data }) => setData(data));
  }, [slug]);

  if (!data) return <Loading label="Loading role" />;

  const { job, related } = data;

  return (
    <div className="container py-10">
      <Link
        to={lastJobsPath()}
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-dark-500 hover:text-primary-600 dark:text-dark-400">
        <FiArrowLeft /> Back to all roles
      </Link>

      <article className="card mx-auto max-w-4xl">
        <JobDetailPanel
          job={job}
          saved={savedIds.has(job._id)}
          onSave={save}
          onApply={() => save(job, 'applied')}
        />
      </article>

      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="section-title mb-6">Similar roles in this stack</h2>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {related.map((item) => (
              <JobCard key={item._id} job={item} saved={savedIds.has(item._id)} onSave={save} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default JobDetail;
