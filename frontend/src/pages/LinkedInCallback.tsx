import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../lib/api';

export default function LinkedInCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const code = searchParams.get('code');

  useEffect(() => {
    const linkLinkedIn = async () => {
      if (!code) {
        navigate('/dashboard');
        return;
      }

      try {
        const redirect_uri = `${window.location.origin}/linkedin-callback`;
        const res = await api.get(`/linkedin/callback?code=${code}&redirect_uri=${encodeURIComponent(redirect_uri)}`);
        
        if (res.data && res.data.profile) {
          const profile = res.data.profile;
          await api.post(`/users/link-linkedin?linkedin_id=${profile.linkedin_id}`);
          alert("LinkedIn connected successfully!");
        }
      } catch (err) {
        console.error("Failed to link LinkedIn:", err);
        alert("Failed to connect LinkedIn. Please try again.");
      } finally {
        navigate('/dashboard');
      }
    };

    linkLinkedIn();
  }, [code, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#030712] text-white">
      <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4" />
      <p className="text-slate-400">Connecting your LinkedIn account...</p>
    </div>
  );
}
