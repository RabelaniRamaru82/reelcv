import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { Card, Button } from '@reelapps/ui';

interface PublicLinkRow {
  candidate_id: string;
}

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const PublicCV: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [candidateId, setCandidateId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLink = async () => {
      if (!slug) return;
      const { data, error } = await supabase
        .from('public_cv_links')
        .select('candidate_id')
        .eq('slug', slug)
        .maybeSingle<PublicLinkRow>();

      if (error || !data) {
        setError('This public CV link is invalid or has expired.');
      } else {
        setCandidateId(data.candidate_id);
      }
      setLoading(false);
    };
    fetchLink();
  }, [slug]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  if (error || !candidateId) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center p-4">
        <Card className="max-w-md">
          <h1 className="text-xl font-bold mb-3">Public CV Link Error</h1>
          <p className="mb-6 text-slate-400">{error}</p>
          <Button as="a" href="https://reelapps.com" variant="primary">
            Go to ReelApps
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-3xl">
        <h1 className="text-3xl font-bold mb-4">Candidate Portfolio</h1>
        <p className="text-slate-400 mb-6">
          This is a read-only public preview of the candidate's ReelCV. (candidate id: {candidateId})
        </p>
        {/* TODO: render real public portfolio components using candidateId */}
      </Card>
    </div>
  );
};

export default PublicCV; 