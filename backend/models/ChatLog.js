const mongoose = require('mongoose');

const chatLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  messages: [{
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    queryType: String, // 'threat_query', 'incident_query', 'general', etc.
    dataReturned: mongoose.Schema.Types.Mixed
  }],
  sessionId: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('ChatLog', chatLogSchema);
