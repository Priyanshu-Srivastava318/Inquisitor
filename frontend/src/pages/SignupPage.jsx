import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SignupPage = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'analyst', organization: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await register(form);
      if (data.success) navigate('/dashboard');
      else setError(data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-darker flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />

      <div className="mb-8 text-center animate-fade-in">
        <Link to="/" className="flex items-center gap-3 justify-center mb-2">
          <svg className="w-10 h-10 text-primary" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
          </svg>
          <span className="text-3xl font-sora font-bold gradient-text">INQUISITOR</span>
        </Link>
        <p className="text-gray-400 text-sm">Create your security account</p>
      </div>

      <div className="w-full max-w-md bg-dark/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 animate-slide-up">
        <h1 className="text-2xl font-sora font-bold mb-2">Create Account</h1>
        <p className="text-gray-400 mb-8 text-sm">Join INQUISITOR security platform</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-2">Full Name</label>
            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="John Doe" required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Email Address</label>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@company.com" required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Organization</label>
            <input type="text" value={form.organization} onChange={e => setForm({ ...form, organization: e.target.value })} placeholder="Acme Corp"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Role</label>
            <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
              className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary transition-all">
              <option value="analyst">Security Analyst</option>
              <option value="admin">Administrator</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Password</label>
            <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Min. 6 characters" required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-gradient-to-r from-primary to-accent py-3.5 rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-primary/30 transition-all disabled:opacity-50">
            {loading ? <span className="flex items-center justify-center gap-2"><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating account...</span> : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:text-primary-dark font-semibold transition-colors">Sign in</Link>
        </p>
      </div>

      <Link to="/" className="mt-6 text-gray-400 hover:text-white text-sm transition-colors flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Home
      </Link>
    </div>
  );
};

export default SignupPage;
