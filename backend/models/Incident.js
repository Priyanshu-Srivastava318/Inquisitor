const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
  incidentId: { type: String, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  severity: { type: String, enum: ['Critical', 'High', 'Medium', 'Low'], required: true },
  status: { type: String, enum: ['Open', 'In Progress', 'Resolved', 'Closed'], default: 'Open' },
  category: { type: String, enum: ['Security Breach', 'Data Loss', 'Service Disruption', 'Policy Violation', 'Malware', 'Unauthorized Access', 'Other'], required: true },
  affectedAssets: [String],
  sourceIP: String,
  attackVector: String,
  timeline: [{
    action: String,
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    note: String,
    timestamp: { type: Date, default: Date.now }
  }],
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  resolvedAt: Date,
  iocs: [{ // Indicators of Compromise
    type: { type: String, enum: ['IP', 'Domain', 'Hash', 'Email', 'URL'] },
    value: String
  }]
}, { timestamps: true });

// Auto-generate incident ID
incidentSchema.pre('save', async function(next) {
  if (!this.incidentId) {
    const count = await mongoose.model('Incident').countDocuments();
    this.incidentId = `INC-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Incident', incidentSchema);
