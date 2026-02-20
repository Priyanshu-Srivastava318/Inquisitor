const mongoose = require('mongoose');

const threatSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['SQL Injection', 'Brute Force', 'DDoS', 'Phishing', 'Malware', 'Port Scan', 'XSS', 'CSRF', 'Data Exfiltration', 'Ransomware'],
    required: true 
  },
  severity: { type: String, enum: ['Critical', 'High', 'Medium', 'Low'], required: true },
  status: { type: String, enum: ['Active', 'Investigating', 'Resolved', 'Monitoring'], default: 'Active' },
  sourceIP: { type: String },
  targetEndpoint: { type: String },
  location: {
    city: String,
    country: String,
    lat: Number,
    lng: Number
  },
  description: { type: String },
  affectedSystems: [String],
  mitreTactic: { type: String },
  detectedAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  riskScore: { type: Number, min: 0, max: 100 }
}, { timestamps: true });

module.exports = mongoose.model('Threat', threatSchema);
