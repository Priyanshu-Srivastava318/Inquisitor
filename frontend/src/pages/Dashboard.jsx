import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import api from '../utils/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler);

const severityBg = {
  Critical: 'bg-red-500/20 text-red-400',
  High: 'bg-orange-500/20 text-orange-400',
  Medium: 'bg-yellow-500/20 text-yellow-400',
  Low: 'bg-blue-500/20 text-blue-400'
};

const statusColors = {
  Active: 'text-red-400',
  Investigating: 'text-yellow-400',
  Resolved: 'text-green-400',
  Monitoring: 'text-blue-400'
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [threats, setThreats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = async () => {
    try {
      const [dashRes, threatsRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/threats?limit=5')
      ]);
      setStats(dashRes.data.stats);
      setThreats(threatsRes.data.threats);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dayMap = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 7: 6 };
  const threatByDay = Array(7).fill(0);
  stats?.recentByDay?.forEach(d => { if (dayMap[d._id] !== undefined) threatByDay[dayMap[d._id]] = d.count; });

  const lineData = {
    labels: days,
    datasets: [{
      label: 'Threats Detected',
      data: threatByDay,
      borderColor: '#0EA5E9',
      backgroundColor: 'rgba(14, 165, 233, 0.1)',
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#0EA5E9',
      pointRadius: 4,
    }]
  };

  const categoryLabels = stats?.categoryBreakdown?.map(c => c._id) || [];
  const categoryData = stats?.categoryBreakdown?.map(c => c.count) || [];

  const doughnutData = {
    labels: categoryLabels,
    datasets: [{
      data: categoryData,
      backgroundColor: ['#0EA5E9', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'],
      borderWidth: 0
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9CA3AF' } },
      x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9CA3AF' } }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom', labels: { color: '#9CA3AF', padding: 15 } } }
  };

  const timeAgo = (date) => {
    if (!date) return 'N/A';
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400">Loading live data...</p>
      </div>
    </div>
  );

  const statCards = [
    {
      label: 'Active Threats',
      value: stats?.activeThreats ?? 0,
      badge: stats?.criticalCount > 0 ? `${stats.criticalCount} Critical` : 'Monitoring',
      badgeColor: stats?.criticalCount > 0 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400',
      icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
      cardGradient: 'from-primary/10 to-primary/5 border-primary/20',
      iconBg: 'bg-primary/20 text-primary'
    },
    {
      label: 'Security Score',
      value: `${stats?.securityScore ?? 0}/100`,
      badge: stats?.securityScore >= 70 ? 'Good' : stats?.securityScore >= 50 ? 'Fair' : 'At Risk',
      badgeColor: stats?.securityScore >= 70 ? 'bg-green-500/20 text-green-400' : stats?.securityScore >= 50 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400',
      icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
      cardGradient: 'from-accent/10 to-accent/5 border-accent/20',
      iconBg: 'bg-accent/20 text-accent'
    },
    {
      label: 'Total Incidents',
      value: stats?.totalIncidents ?? 0,
      badge: `${stats?.openIncidents ?? 0} Open`,
      badgeColor: stats?.openIncidents > 0 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      cardGradient: 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/20',
      iconBg: 'bg-emerald-500/20 text-emerald-500'
    },
    {
      label: 'Avg Response Time',
      value: stats?.avgResponseTime ?? '12m',
      badge: 'Live',
      badgeColor: 'bg-green-500/20 text-green-400',
      icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      cardGradient: 'from-orange-500/10 to-orange-500/5 border-orange-500/20',
      iconBg: 'bg-orange-500/20 text-orange-500'
    },
  ];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <header className="bg-dark/50 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40">
        <div className="px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-sora font-bold">Security Dashboard</h1>
            <p className="text-sm text-gray-400">
              Real-time threat monitoring
              {lastUpdated && <span className="ml-2 text-green-400">• Updated {timeAgo(lastUpdated)}</span>}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-green-400 text-xs font-semibold">Live Data</span>
            </div>
            <button onClick={fetchData} className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-all" title="Refresh">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button className="relative p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-all">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {stats?.activeThreats > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />}
            </button>
          </div>
        </div>
      </header>

      <div className="p-8 space-y-8">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card, i) => (
            <div key={i} className={`stat-card bg-gradient-to-br ${card.cardGradient} border rounded-2xl p-6`}>
              <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 ${card.iconBg} rounded-xl flex items-center justify-center`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} />
                  </svg>
                </div>
                <span className={`${card.badgeColor} text-xs px-2 py-1 rounded-full font-bold`}>{card.badge}</span>
              </div>
              <p className="text-gray-400 text-sm mb-2">{card.label}</p>
              <p className="text-3xl font-sora font-bold text-white">{card.value}</p>
            </div>
          ))}
        </div>

        {/* Live IP Threat Intelligence */}
        {stats?.liveIPThreats?.length > 0 && (
          <div className="bg-dark/50 border border-primary/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <h3 className="text-xl font-sora font-bold">Live IP Threat Intelligence</h3>
              <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full font-bold">AbuseIPDB Real-Time</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stats.liveIPThreats.map((ip, i) => (
                <div key={i} className={`p-4 rounded-xl border ${ip.abuseScore >= 80 ? 'bg-red-500/10 border-red-500/20' : ip.abuseScore >= 50 ? 'bg-orange-500/10 border-orange-500/20' : 'bg-yellow-500/10 border-yellow-500/20'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-mono text-sm font-bold text-orange-400">{ip.ip}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${ip.abuseScore >= 80 ? 'bg-red-500/20 text-red-400' : ip.abuseScore >= 50 ? 'bg-orange-500/20 text-orange-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                      {ip.abuseScore}/100
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-1">{ip.threatTitle}</p>
                  <p className="text-xs text-gray-500">{ip.country} • {ip.isp?.slice(0, 20) || 'Unknown ISP'}</p>
                  <p className="text-xs text-gray-500">{ip.totalReports} reports</p>
                  {ip.isRealTime && <p className="text-xs text-green-400 mt-1">✓ Live verified</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-dark/50 border border-white/10 rounded-2xl p-6">
            <h3 className="text-xl font-sora font-bold mb-6">Threat Activity (Last 7 Days)</h3>
            <div style={{ height: 280 }}>
              <Line data={lineData} options={chartOptions} />
            </div>
          </div>
          <div className="bg-dark/50 border border-white/10 rounded-2xl p-6">
            <h3 className="text-xl font-sora font-bold mb-6">Threat Categories</h3>
            {categoryData.length > 0 ? (
              <div style={{ height: 280 }}>
                <Doughnut data={doughnutData} options={doughnutOptions} />
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">No threat data yet</div>
            )}
          </div>
        </div>

        {/* Recent Threats Table */}
        <div className="bg-dark/50 border border-white/10 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-sora font-bold">Recent Threats</h3>
            <Link to="/threats" className="text-primary hover:text-primary-dark text-sm font-semibold">View All →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  {['Severity', 'Type', 'Source IP', 'Detected', 'Status'].map(h => (
                    <th key={h} className="pb-3 text-gray-400 font-semibold text-sm">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-sm">
                {threats.map((threat, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4">
                      <span className={`${severityBg[threat.severity]} px-3 py-1 rounded-full font-bold text-xs`}>{threat.severity}</span>
                    </td>
                    <td className="py-4">{threat.type}</td>
                    <td className="py-4 text-orange-400 font-mono text-xs">{threat.sourceIP || 'Internal'}</td>
                    <td className="py-4 text-gray-400">{timeAgo(threat.detectedAt)}</td>
                    <td className="py-4"><span className={statusColors[threat.status]}>{threat.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Data Source Footer */}
        <div className="text-center text-xs text-gray-600">
          Data sources: MongoDB Atlas + AbuseIPDB Real-Time API • Auto-refreshes every 30s
        </div>
      </div>
    </div>
  );
};

export default Dashboard;