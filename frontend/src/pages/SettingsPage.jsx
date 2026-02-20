import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const SettingsPage = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState({ email: true, browser: true, critical: true, high: true, medium: false });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="animate-fade-in">
      <header className="bg-dark/50 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40">
        <div className="px-8 py-4">
          <h1 className="text-2xl font-sora font-bold">Settings</h1>
          <p className="text-sm text-gray-400">Manage your account and notification preferences</p>
        </div>
      </header>

      <div className="p-8 space-y-8 max-w-2xl">
        {/* Profile */}
        <div className="bg-dark/50 border border-white/10 rounded-2xl p-6">
          <h3 className="text-xl font-sora font-bold mb-6">Profile Information</h3>
          <div className="flex items-center gap-5 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center text-2xl font-bold">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-lg">{user?.name}</p>
              <p className="text-gray-400 text-sm">{user?.email}</p>
              <span className="bg-primary/20 text-primary text-xs px-2 py-1 rounded-full capitalize mt-1 inline-block">{user?.role}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Full Name</label>
              <input defaultValue={user?.name} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Organization</label>
              <input defaultValue={user?.organization} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-dark/50 border border-white/10 rounded-2xl p-6">
          <h3 className="text-xl font-sora font-bold mb-6">Notification Preferences</h3>
          <div className="space-y-4">
            {[
              { key: 'email', label: 'Email Notifications', desc: 'Receive threat alerts via email' },
              { key: 'browser', label: 'Browser Notifications', desc: 'Real-time browser push notifications' },
              { key: 'critical', label: 'Critical Severity Alerts', desc: 'Immediate alerts for critical threats' },
              { key: 'high', label: 'High Severity Alerts', desc: 'Alerts for high severity threats' },
              { key: 'medium', label: 'Medium Severity Alerts', desc: 'Alerts for medium severity threats' },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                <div>
                  <p className="font-semibold">{item.label}</p>
                  <p className="text-sm text-gray-400">{item.desc}</p>
                </div>
                <button onClick={() => setNotifications(p => ({ ...p, [item.key]: !p[item.key] }))}
                  className={`relative w-12 h-6 rounded-full transition-all duration-200 ${notifications[item.key] ? 'bg-primary' : 'bg-white/10'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${notifications[item.key] ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* API Keys */}
        <div className="bg-dark/50 border border-white/10 rounded-2xl p-6">
          <h3 className="text-xl font-sora font-bold mb-6">SIEM Integrations</h3>
          <div className="space-y-3">
            {[
              { name: 'Elastic SIEM', status: 'connected', color: 'text-green-400' },
              { name: 'Splunk', status: 'not connected', color: 'text-gray-400' },
              { name: 'Wazuh', status: 'not connected', color: 'text-gray-400' },
            ].map(integration => (
              <div key={integration.name} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-xs font-bold">{integration.name[0]}</div>
                  <div>
                    <p className="font-semibold">{integration.name}</p>
                    <p className={`text-xs ${integration.color}`}>{integration.status}</p>
                  </div>
                </div>
                <button className={`text-sm font-semibold px-4 py-2 rounded-lg transition-all ${integration.status === 'connected' ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-primary/20 text-primary hover:bg-primary/30'}`}>
                  {integration.status === 'connected' ? 'Disconnect' : 'Connect'}
                </button>
              </div>
            ))}
          </div>
        </div>

        <button onClick={handleSave} className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${saved ? 'bg-green-500 text-white' : 'bg-gradient-to-r from-primary to-accent hover:shadow-2xl hover:shadow-primary/30'}`}>
          {saved ? '✓ Settings Saved!' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
