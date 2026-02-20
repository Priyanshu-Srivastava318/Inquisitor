import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const severityBg = { Critical: 'bg-red-500/20 text-red-400', High: 'bg-orange-500/20 text-orange-400', Medium: 'bg-yellow-500/20 text-yellow-400', Low: 'bg-blue-500/20 text-blue-400' };
const statusBg = { Open: 'bg-red-500/20 text-red-400', 'In Progress': 'bg-yellow-500/20 text-yellow-400', Resolved: 'bg-green-500/20 text-green-400', Closed: 'bg-gray-500/20 text-gray-400' };

const IncidentsPage = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');
  const { user } = useAuth();
  const canCreate = user?.role === 'admin' || user?.role === 'analyst';

  const [form, setForm] = useState({ title: '', description: '', severity: 'High', category: 'Security Breach', affectedAssets: '', sourceIP: '' });

  const fetchIncidents = async () => {
    try {
      const { data } = await api.get('/incidents?limit=30');
      setIncidents(data.incidents);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchIncidents(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/incidents', {
        ...form,
        affectedAssets: form.affectedAssets.split(',').map(s => s.trim()).filter(Boolean)
      });
      setShowForm(false);
      setForm({ title: '', description: '', severity: 'High', category: 'Security Breach', affectedAssets: '', sourceIP: '' });
      fetchIncidents();
    } catch (err) { console.error(err); }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.patch(`/incidents/${id}`, { status, note: `Status updated to ${status}` });
      fetchIncidents();
    } catch (err) { console.error(err); }
  };

  const filtered = filter === 'all' ? incidents : incidents.filter(i => {
    if (filter === 'open') return i.status === 'Open';
    if (filter === 'progress') return i.status === 'In Progress';
    if (filter === 'resolved') return ['Resolved', 'Closed'].includes(i.status);
    return true;
  });

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const hrs = Math.floor(diff / 3600000);
    if (hrs < 1) return `${Math.floor(diff / 60000)}m ago`;
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  if (loading) return <div className="flex items-center justify-center h-full"><div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="animate-fade-in">
      <header className="bg-dark/50 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40">
        <div className="px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-sora font-bold">Incident Management</h1>
            <p className="text-sm text-gray-400">Track, manage, and resolve security incidents</p>
          </div>
          {canCreate && (
            <button onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-primary to-accent px-5 py-2.5 rounded-xl font-semibold text-sm hover:shadow-lg transition-all flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              New Incident
            </button>
          )}
        </div>
      </header>

      <div className="p-8 space-y-6">
        {/* Stats row */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total', value: incidents.length, color: 'text-white' },
            { label: 'Open', value: incidents.filter(i => i.status === 'Open').length, color: 'text-red-400' },
            { label: 'In Progress', value: incidents.filter(i => i.status === 'In Progress').length, color: 'text-yellow-400' },
            { label: 'Resolved', value: incidents.filter(i => ['Resolved', 'Closed'].includes(i.status)).length, color: 'text-green-400' },
          ].map(s => (
            <div key={s.label} className="bg-dark/50 border border-white/10 rounded-xl p-4 text-center">
              <p className={`text-2xl font-sora font-bold ${s.color}`}>{s.value}</p>
              <p className="text-gray-400 text-sm">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {[['all', 'All Incidents'], ['open', 'Open'], ['progress', 'In Progress'], ['resolved', 'Resolved']].map(([key, label]) => (
            <button key={key} onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${filter === key ? 'bg-primary text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* Incident List */}
        <div className="space-y-3">
          {filtered.map((incident) => (
            <div key={incident._id} className="bg-dark/50 border border-white/10 rounded-2xl p-6 hover:border-primary/20 transition-all cursor-pointer"
              onClick={() => setSelected(selected?._id === incident._id ? null : incident)}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className="text-gray-400 text-xs font-mono">{incident.incidentId}</span>
                    <span className={`${severityBg[incident.severity]} text-xs px-2 py-0.5 rounded-full font-bold`}>{incident.severity}</span>
                    <span className={`${statusBg[incident.status]} text-xs px-2 py-0.5 rounded-full font-bold`}>{incident.status}</span>
                    <span className="bg-white/10 text-gray-400 text-xs px-2 py-0.5 rounded-full">{incident.category}</span>
                  </div>
                  <h3 className="font-sora font-bold text-lg mb-1">{incident.title}</h3>
                  <p className="text-gray-400 text-sm line-clamp-2">{incident.description}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                    <span>Created by: {incident.createdBy?.name || 'System'}</span>
                    <span>{timeAgo(incident.createdAt)}</span>
                    {incident.affectedAssets?.length > 0 && <span>Assets: {incident.affectedAssets.join(', ')}</span>}
                  </div>
                </div>
                {canCreate && incident.status !== 'Resolved' && incident.status !== 'Closed' && (
                  <div className="flex gap-2 ml-4" onClick={e => e.stopPropagation()}>
                    {incident.status === 'Open' && (
                      <button onClick={() => handleStatusUpdate(incident._id, 'In Progress')}
                        className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all">
                        Start Investigation
                      </button>
                    )}
                    {incident.status === 'In Progress' && (
                      <button onClick={() => handleStatusUpdate(incident._id, 'Resolved')}
                        className="bg-green-500/20 hover:bg-green-500/30 text-green-400 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all">
                        Mark Resolved
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Expanded timeline */}
              {selected?._id === incident._id && incident.timeline?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Timeline</p>
                  <div className="space-y-3">
                    {incident.timeline.map((entry, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-semibold">{entry.action}</p>
                          <p className="text-xs text-gray-400">{entry.note}</p>
                          <p className="text-xs text-gray-500">{new Date(entry.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="bg-dark/50 border border-white/10 rounded-2xl p-12 text-center">
              <p className="text-gray-400">No incidents found</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Incident Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark border border-white/10 rounded-2xl p-8 w-full max-w-lg animate-slide-up">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-sora font-bold">Create New Incident</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Title *</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Description *</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Severity</label>
                  <select value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value })}
                    className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary">
                    {['Critical', 'High', 'Medium', 'Low'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Category</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary">
                    {['Security Breach', 'Data Loss', 'Service Disruption', 'Policy Violation', 'Malware', 'Unauthorized Access', 'Other'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Affected Assets (comma separated)</label>
                <input value={form.affectedAssets} onChange={e => setForm({ ...form, affectedAssets: e.target.value })} placeholder="DB Server, API Gateway"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Source IP</label>
                <input value={form.sourceIP} onChange={e => setForm({ ...form, sourceIP: e.target.value })} placeholder="192.168.1.100"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-gradient-to-r from-primary to-accent py-3 rounded-xl font-bold transition-all hover:shadow-lg">Create Incident</button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-white/5 hover:bg-white/10 py-3 rounded-xl font-bold transition-all">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncidentsPage;
