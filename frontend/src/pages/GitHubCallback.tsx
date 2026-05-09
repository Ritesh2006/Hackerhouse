import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../lib/api';

export default function GitHubCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const code = searchParams.get('code');

  useEffect(() => {
    const linkGitHub = async () => {
      if (!code) {
        navigate('/dashboard');
        return;
      }

      try {
        // Exchange code for GitHub data via backend
        const res = await api.get(`/github/callback?code=${code}`);
        if (res.data && res.data.username) {
          await api.post(`/users/link-github?username=${res.data.username}`);
          alert("GitHub connected successfully!");
        }
      } catch (err) {
        console.error("Failed to link GitHub:", err);
        alert("Failed to connect GitHub. Please try again.");
      } finally {
        navigate('/dashboard');
      }
    };

    linkGitHub();
  }, [code, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#030712] text-white">
      <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4" />
      <p className="text-slate-400">Connecting your GitHub account...</p>
    </div>
  );
}
