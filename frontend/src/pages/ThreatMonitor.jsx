import { useState, useEffect } from 'react';
import api from '../utils/api';

const severityConfig = {
  Critical: { bg: 'bg-red-500/10', border: 'border-red-500/30', badge: 'bg-red-500/20 text-red-400', dot: 'bg-red-500' },
  High: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', badge: 'bg-orange-500/20 text-orange-400', dot: 'bg-orange-500' },
  Medium: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', badge: 'bg-yellow-500/20 text-yellow-400', dot: 'bg-yellow-500' },
  Low: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', badge: 'bg-blue-500/20 text-blue-400', dot: 'bg-blue-500' },
};

const statusConfig = {
  Active: 'bg-red-500/20 text-red-400',
  Investigating: 'bg-yellow-500/20 text-yellow-400',
  Monitoring: 'bg-blue-500/20 text-blue-400',
  Resolved: 'bg-green-500/20 text-green-400',
};

const ThreatMonitor = () => {
  const [threats, setThreats] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [updating, setUpdating] = useState(null);

  const fetchThreats = async () => {
    try {
      const [threatsRes, statsRes] = await Promise.all([
        api.get('/threats?limit=20'),
        api.get('/threats/stats')
      ]);
      setThreats(threatsRes.data.threats);
      setStats(statsRes.data.stats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThreats();
    const interval = setInterval(fetchThreats, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusUpdate = async (id, newStatus) => {
    setUpdating(id);
    try {
      await api.patch(`/threats/${id}/status`, { status: newStatus });
      await fetchThreats();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(null);
    }
  };

  const filtered = filter === 'all' ? threats : threats.filter(t =>
    filter === 'active' ? ['Active', 'Investigating'].includes(t.status) :
    filter === 'critical' ? t.severity === 'Critical' :
    t.status === 'Resolved'
  );

  const activeCount = threats.filter(t => ['Active', 'Investigating'].includes(t.status)).length;

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} min${mins > 1 ? 's' : ''} ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
    return `${Math.floor(hrs / 24)} day(s) ago`;
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center"><div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" /><p className="text-gray-400">Loading threat data...</p></div>
    </div>
  );

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <header className="bg-dark/50 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40">
        <div className="px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-sora font-bold">Real-Time Threat Monitor</h1>
            <p className="text-sm text-gray-400">Live security threat detection and tracking</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-4 py-2 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse-dot" />
              <span className="text-green-400 text-sm font-semibold">Live Monitoring</span>
            </div>
            <button className="bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export Report
            </button>
          </div>
        </div>
      </header>

      <div className="p-8 space-y-6">
        {/* Active Threats Banner */}
        <div className={`${activeCount > 0 ? 'bg-red-500/10 border-red-500/30' : 'bg-green-500/10 border-green-500/30'} border rounded-2xl p-6 flex justify-between items-center`}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 ${activeCount > 0 ? 'bg-red-500/20' : 'bg-green-500/20'} rounded-xl flex items-center justify-center`}>
              <svg className={`w-6 h-6 ${activeCount > 0 ? 'text-red-400' : 'text-green-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="font-sora font-bold text-lg">{activeCount > 0 ? 'Active Threats' : 'All Clear'}</h3>
              <p className="text-gray-400 text-sm">{activeCount > 0 ? 'Requires immediate attention' : 'No active threats detected'}</p>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-4xl font-sora font-bold ${activeCount > 0 ? 'text-red-400' : 'text-green-400'}`}>{activeCount}</p>
            <p className="text-gray-400 text-sm">{activeCount > 0 ? 'Critical level' : 'Secure'}</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          {[
            { key: 'all', label: `All Threats (${threats.length})` },
            { key: 'active', label: `Active (${activeCount})` },
            { key: 'critical', label: `Critical (${stats?.criticalCount || 0})` },
            { key: 'resolved', label: 'Resolved' },
          ].map(tab => (
            <button key={tab.key} onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${filter === tab.key ? 'bg-primary text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Threat Cards */}
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="bg-dark/50 border border-white/10 rounded-2xl p-12 text-center">
              <p className="text-gray-400 text-lg">No threats found for this filter</p>
            </div>
          ) : filtered.map((threat) => {
            const cfg = severityConfig[threat.severity] || severityConfig.Low;
            return (
              <div key={threat._id} className={`${cfg.bg} border ${cfg.border} rounded-2xl p-6 transition-all hover:scale-[1.01]`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 ${cfg.bg} border ${cfg.border} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-sora font-bold text-lg">{threat.title}</h3>
                        <span className={`${cfg.badge} text-xs px-2 py-1 rounded-full font-bold`}>{threat.severity}</span>
                        <span className={`${statusConfig[threat.status]} text-xs px-2 py-1 rounded-full font-bold`}>{threat.status}</span>
                      </div>
                      <p className="text-gray-400 text-sm">{threat.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {threat.status !== 'Resolved' && (
                      <>
                        {threat.sourceIP && threat.sourceIP !== 'Multiple' && (
                          <button onClick={() => handleStatusUpdate(threat._id, 'Resolved')} disabled={updating === threat._id}
                            className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-50">
                            Block IP
                          </button>
                        )}
                        <button onClick={() => handleStatusUpdate(threat._id, 'Investigating')} disabled={updating === threat._id}
                          className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-50">
                          {updating === threat._id ? '...' : 'Investigate'}
                        </button>
                      </>
                    )}
                    {threat.status === 'Resolved' && (
                      <span className="bg-green-500/20 text-green-400 px-4 py-2 rounded-lg text-sm font-semibold">✓ Resolved</span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Source IP</p>
                    <p className="text-sm font-semibold text-orange-400">{threat.sourceIP || 'Internal'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Location</p>
                    <p className="text-sm font-semibold">{threat.location?.city && threat.location?.country ? `${threat.location.city}, ${threat.location.country}` : 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Detected</p>
                    <p className="text-sm font-semibold">{timeAgo(threat.detectedAt)}</p>
                  </div>
                </div>
                {threat.riskScore !== undefined && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Risk Score</span>
                      <span>{threat.riskScore}/100</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full ${threat.riskScore >= 80 ? 'bg-red-500' : threat.riskScore >= 50 ? 'bg-orange-500' : 'bg-yellow-500'}`}
                        style={{ width: `${threat.riskScore}%` }} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ThreatMonitor;
