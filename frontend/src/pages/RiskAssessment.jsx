import { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import api from '../utils/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const RiskAssessment = () => {
  const [stats, setStats] = useState(null);
  const [threats, setThreats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [s, t] = await Promise.all([api.get('/threats/stats'), api.get('/threats?limit=50')]);
        setStats(s.data.stats);
        setThreats(t.data.threats);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const riskByType = {};
  threats.forEach(t => {
    if (!riskByType[t.type]) riskByType[t.type] = { total: 0, count: 0 };
    riskByType[t.type].total += t.riskScore || 0;
    riskByType[t.type].count++;
  });
  const typeLabels = Object.keys(riskByType);
  const typeAvgRisk = typeLabels.map(k => Math.round(riskByType[k].total / riskByType[k].count));

  const barData = {
    labels: typeLabels,
    datasets: [{
      label: 'Avg Risk Score',
      data: typeAvgRisk,
      backgroundColor: typeAvgRisk.map(v => v >= 80 ? 'rgba(239,68,68,0.6)' : v >= 50 ? 'rgba(245,158,11,0.6)' : 'rgba(14,165,233,0.6)'),
      borderRadius: 8,
    }]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, max: 100, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9CA3AF' } },
      x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9CA3AF', maxRotation: 30 } }
    }
  };

  const overallRisk = threats.length > 0
    ? Math.round(threats.reduce((sum, t) => sum + (t.riskScore || 0), 0) / threats.length)
    : 0;

  const riskLevel = overallRisk >= 80 ? { label: 'Critical', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30' } :
    overallRisk >= 60 ? { label: 'High', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30' } :
    overallRisk >= 40 ? { label: 'Medium', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30' } :
    { label: 'Low', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30' };

  const predictedThreats = [
    { type: 'Ransomware Campaign', probability: 78, trend: 'up', recommendation: 'Update backup systems and patch vulnerable endpoints' },
    { type: 'Supply Chain Attack', probability: 64, trend: 'up', recommendation: 'Audit third-party dependencies and vendor access' },
    { type: 'Credential Stuffing', probability: 82, trend: 'stable', recommendation: 'Enforce MFA and monitor for anomalous login patterns' },
    { type: 'Zero-Day Exploit', probability: 45, trend: 'down', recommendation: 'Keep systems updated, deploy IPS signatures' },
    { type: 'Insider Threat', probability: 35, trend: 'stable', recommendation: 'Implement DLP and user behavior analytics' },
  ];

  if (loading) return <div className="flex items-center justify-center h-full"><div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="animate-fade-in">
      <header className="bg-dark/50 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40">
        <div className="px-8 py-4">
          <h1 className="text-2xl font-sora font-bold">Risk Assessment</h1>
          <p className="text-sm text-gray-400">Predictive threat analysis and security posture evaluation</p>
        </div>
      </header>

      <div className="p-8 space-y-8">
        {/* Overall Risk Score */}
        <div className={`${riskLevel.bg} border rounded-2xl p-8`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-sora font-bold mb-2">Overall Risk Score</h2>
              <p className="text-gray-400">Based on {threats.length} active threat indicators</p>
            </div>
            <div className="text-right">
              <p className={`text-6xl font-sora font-bold ${riskLevel.color}`}>{overallRisk}</p>
              <p className={`${riskLevel.color} font-semibold`}>{riskLevel.label} Risk</p>
            </div>
          </div>
          <div className="mt-6">
            <div className="w-full bg-white/10 rounded-full h-3">
              <div className={`h-3 rounded-full transition-all duration-1000 ${overallRisk >= 80 ? 'bg-red-500' : overallRisk >= 60 ? 'bg-orange-500' : overallRisk >= 40 ? 'bg-yellow-500' : 'bg-green-500'}`}
                style={{ width: `${overallRisk}%` }} />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Low</span><span>Medium</span><span>High</span><span>Critical</span>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Critical Threats', value: stats?.criticalCount || 0, color: 'text-red-400' },
            { label: 'High Severity', value: stats?.highCount || 0, color: 'text-orange-400' },
            { label: 'Medium Severity', value: stats?.mediumCount || 0, color: 'text-yellow-400' },
            { label: 'Low Severity', value: stats?.lowCount || 0, color: 'text-blue-400' },
          ].map((s, i) => (
            <div key={i} className="bg-dark/50 border border-white/10 rounded-xl p-5 text-center">
              <p className={`text-3xl font-sora font-bold ${s.color}`}>{s.value}</p>
              <p className="text-gray-400 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Risk by Attack Type Chart */}
        <div className="bg-dark/50 border border-white/10 rounded-2xl p-6">
          <h3 className="text-xl font-sora font-bold mb-6">Risk Score by Attack Type</h3>
          <div style={{ height: 280 }}>
            <Bar data={barData} options={barOptions} />
          </div>
        </div>

        {/* Predictive Threats */}
        <div className="bg-dark/50 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-xl font-sora font-bold">Predicted Threat Vectors (Next 30 Days)</h3>
          </div>
          <div className="space-y-4">
            {predictedThreats.map((threat, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h4 className="font-semibold">{threat.type}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      threat.trend === 'up' ? 'bg-red-500/20 text-red-400' :
                      threat.trend === 'down' ? 'bg-green-500/20 text-green-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {threat.trend === 'up' ? '↑ Rising' : threat.trend === 'down' ? '↓ Declining' : '→ Stable'}
                    </span>
                  </div>
                  <span className={`font-sora font-bold text-lg ${threat.probability >= 70 ? 'text-red-400' : threat.probability >= 50 ? 'text-yellow-400' : 'text-green-400'}`}>
                    {threat.probability}%
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5 mb-3">
                  <div className={`h-1.5 rounded-full ${threat.probability >= 70 ? 'bg-red-500' : threat.probability >= 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                    style={{ width: `${threat.probability}%` }} />
                </div>
                <p className="text-xs text-gray-400">💡 {threat.recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskAssessment;
