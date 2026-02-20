const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Threat = require('./models/Threat');
const Incident = require('./models/Incident');

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB...');

  // Clear everything
  await User.deleteMany({});
  await Threat.deleteMany({});
  await Incident.deleteMany({});
  try { await mongoose.connection.collection('incidents').drop(); } catch(e) { console.log('incidents collection dropped or did not exist'); }

  // Create users
  const admin = await User.create({ name: 'Admin User', email: 'admin@inquisitor.io', password: 'admin123', role: 'admin', organization: 'INQUISITOR Corp' });
  const analyst = await User.create({ name: 'Priyanshu Srivastava', email: 'analyst@inquisitor.io', password: 'analyst123', role: 'analyst', organization: 'INQUISITOR Corp' });
  console.log('✅ Users created');

  // Create threats
  await Threat.insertMany([
    { title: 'SQL Injection on /api/users', type: 'SQL Injection', severity: 'Critical', status: 'Active', sourceIP: '203.0.113.45', location: { city: 'Moscow', country: 'Russia' }, description: 'Multiple SQL injection attempts detected. Attacker attempting database extraction.', riskScore: 95 },
    { title: 'Brute Force Login Attack', type: 'Brute Force', severity: 'High', status: 'Active', sourceIP: '198.51.100.23', location: { city: 'Beijing', country: 'China' }, description: '156 failed login attempts in 5 minutes from single IP.', riskScore: 82 },
    { title: 'Port Scanning Activity', type: 'Port Scan', severity: 'Medium', status: 'Monitoring', sourceIP: '192.0.2.67', location: { city: 'Lagos', country: 'Nigeria' }, description: 'Systematic port scanning across multiple servers.', riskScore: 45 },
    { title: 'Unusual Data Exfiltration', type: 'Data Exfiltration', severity: 'Critical', status: 'Investigating', sourceIP: '10.0.0.45', location: { city: 'Internal', country: 'Internal' }, description: 'Large data transfer to external endpoint detected.', riskScore: 92 },
    { title: 'Phishing Campaign Detected', type: 'Phishing', severity: 'High', status: 'Active', sourceIP: '185.220.101.34', location: { city: 'Bucharest', country: 'Romania' }, description: 'Spear-phishing emails targeting executives.', riskScore: 78 },
    { title: 'DDoS Attack on Web Server', type: 'DDoS', severity: 'High', status: 'Resolved', sourceIP: 'Multiple', location: { city: 'Multiple', country: 'Multiple' }, description: 'DDoS from botnet. Mitigated with rate limiting.', riskScore: 70 },
    { title: 'Malware Detected on Endpoint', type: 'Malware', severity: 'Critical', status: 'Investigating', sourceIP: '10.1.2.34', location: { city: 'Internal', country: 'Internal' }, description: 'Trojan on HR workstation. Quarantined.', riskScore: 90 },
    { title: 'Ransomware Signature Detected', type: 'Ransomware', severity: 'Critical', status: 'Active', sourceIP: '192.168.1.78', location: { city: 'Internal', country: 'Internal' }, description: 'Ransomware signature in network traffic.', riskScore: 98 },
  ]);
  console.log('✅ Threats created');

  // Create incidents ONE BY ONE with manual IDs
  await Incident.create({ incidentId: 'INC-0001', title: 'Critical SQL Injection Campaign', description: 'Coordinated SQL injection attack targeting user authentication database.', severity: 'Critical', status: 'In Progress', category: 'Security Breach', affectedAssets: ['User DB', 'API Gateway'], sourceIP: '203.0.113.45', createdBy: admin._id, assignedTo: analyst._id });

  await Incident.create({ incidentId: 'INC-0002', title: 'Malware Infection - HR Workstation', description: 'Employee workstation infected with Trojan. Potential HR data access.', severity: 'Critical', status: 'Open', category: 'Malware', affectedAssets: ['WS-HR-047'], createdBy: admin._id });

  await Incident.create({ incidentId: 'INC-0003', title: 'Unauthorized Admin Access', description: 'Unauthorized access to admin panel from unrecognized device.', severity: 'High', status: 'In Progress', category: 'Unauthorized Access', affectedAssets: ['Admin Panel'], sourceIP: '79.110.197.43', createdBy: analyst._id });

  await Incident.create({ incidentId: 'INC-0004', title: 'Phishing Email Cascade', description: '12 employees clicked phishing links. Passwords reset.', severity: 'High', status: 'Resolved', category: 'Security Breach', affectedAssets: ['Email System'], createdBy: admin._id });

  await Incident.create({ incidentId: 'INC-0005', title: 'DDoS Attack - External Website', description: '47-minute downtime from volumetric DDoS attack.', severity: 'High', status: 'Closed', category: 'Service Disruption', affectedAssets: ['Web Server'], createdBy: analyst._id });

  console.log('✅ Incidents created');
  console.log('');
  console.log('🎉 Seed data inserted successfully!');
  console.log('👤 Admin:   admin@inquisitor.io   / admin123');
  console.log('👤 Analyst: analyst@inquisitor.io / analyst123');
  process.exit(0);
};

seed().catch(err => { console.error('❌ Seed failed:', err.message); process.exit(1); });