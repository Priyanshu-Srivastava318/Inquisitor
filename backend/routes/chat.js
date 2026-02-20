const express = require('express');
const router = express.Router();
const Threat = require('../models/Threat');
const Incident = require('../models/Incident');
const ChatLog = require('../models/ChatLog');
const { protect } = require('../middleware/auth');

// Check IP with AbuseIPDB
const checkIP = async (ip) => {
  try {
    const response = await fetch(`https://api.abuseipdb.com/api/v2/check?ipAddress=${ip}&maxAgeInDays=90&verbose`, {
      headers: { 'Key': process.env.ABUSEIPDB_API_KEY, 'Accept': 'application/json' }
    });
    const result = await response.json();
    return result.data;
  } catch { return null; }
};

// Extract IPs from message
const extractIPs = (message) => {
  const ipRegex = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
  return message.match(ipRegex) || [];
};

// Gemini AI call
const callGemini = async (prompt) => {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
        })
      }
    );
    const data = await response.json();
    if (data.error) {
      console.log('Gemini error:', data.error.message);
      return null;
    }
    return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (err) {
    console.log('Gemini fetch error:', err.message);
    return null;
  }
};

// Get live SIEM context
const getSIEMContext = async () => {
  const [activeThreats, openIncidents, severityStats] = await Promise.all([
    Threat.find({ status: { $in: ['Active', 'Investigating'] } }).sort({ riskScore: -1 }).limit(10),
    Incident.find({ status: { $in: ['Open', 'In Progress'] } }).limit(5),
    Threat.aggregate([{ $group: { _id: '$severity', count: { $sum: 1 } } }])
  ]);

  const counts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
  severityStats.forEach(s => { counts[s._id] = s.count; });

  return { activeThreats, openIncidents, counts };
};

// Build fallback response when Gemini unavailable
const buildFallbackResponse = async (message, ipData) => {
  const msg = message.toLowerCase();
  const siemData = await getSIEMContext();

  if (ipData && ipData.length > 0) {
    const ip = ipData[0];
    const risk = ip.abuseConfidenceScore >= 80 ? '🔴 CRITICAL' :
                 ip.abuseConfidenceScore >= 50 ? '🟠 HIGH' :
                 ip.abuseConfidenceScore >= 20 ? '🟡 MEDIUM' : '🟢 LOW';
    return `**IP Analysis: ${ip.ipAddress}**\n\n` +
      `Risk Level: **${risk}** (Score: ${ip.abuseConfidenceScore}/100)\n` +
      `Country: ${ip.countryCode || 'Unknown'}\n` +
      `ISP: ${ip.isp || 'Unknown'}\n` +
      `Total Reports: ${ip.totalReports}\n` +
      `Last Reported: ${ip.lastReportedAt ? new Date(ip.lastReportedAt).toLocaleDateString() : 'Never'}\n\n` +
      (ip.abuseConfidenceScore >= 50 ? '⚠️ **Recommendation:** Block this IP immediately and investigate all connections.' : '✅ This IP appears relatively safe based on community reports.');
  }

  if (msg.includes('active') || msg.includes('threat')) {
    const { activeThreats, counts } = siemData;
    return `**Active Threats Summary:**\n\n` +
      `🔴 Critical: ${counts.Critical} | 🟠 High: ${counts.High} | 🟡 Medium: ${counts.Medium} | 🟢 Low: ${counts.Low}\n\n` +
      `**Top Active Threats:**\n` +
      activeThreats.slice(0, 5).map(t => `• **${t.title}** — ${t.type} | Risk: ${t.riskScore}/100 | Source: ${t.sourceIP || 'Internal'}`).join('\n');
  }

  if (msg.includes('incident')) {
    const { openIncidents } = siemData;
    return `**Open Incidents (${openIncidents.length}):**\n\n` +
      openIncidents.map(i => `• **${i.incidentId}** — ${i.title} | ${i.severity} | ${i.status}`).join('\n');
  }

  const { activeThreats, counts, openIncidents } = siemData;
  return `**Current Security Status:**\n\n` +
    `Active Threats: **${activeThreats.length}** | Open Incidents: **${openIncidents.length}**\n` +
    `Critical: ${counts.Critical} | High: ${counts.High} | Medium: ${counts.Medium}\n\n` +
    `Try asking:\n• "Check IP 203.0.113.45"\n• "Show active threats"\n• "List open incidents"`;
};

// POST /api/chat
router.post('/', protect, async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    if (!message) return res.status(400).json({ success: false, message: 'Message required' });

    const sid = sessionId || `session_${Date.now()}`;

    // Extract and check IPs from message
    const ips = extractIPs(message);
    let ipResults = [];
    if (ips.length > 0) {
      ipResults = await Promise.all(ips.map(ip => checkIP(ip)));
      ipResults = ipResults.filter(Boolean);
    }

    // Get live SIEM data
    const siemData = await getSIEMContext();

    // Build Gemini prompt with real data + IP results
    const ipContext = ipResults.length > 0
      ? `\n=== REAL-TIME IP THREAT DATA (AbuseIPDB) ===\n${ipResults.map(ip =>
          `IP: ${ip.ipAddress} | Abuse Score: ${ip.abuseConfidenceScore}/100 | Country: ${ip.countryCode} | ISP: ${ip.isp} | Reports: ${ip.totalReports} | Last Reported: ${ip.lastReportedAt || 'Never'}`
        ).join('\n')}`
      : '';

    const prompt = `You are INQUISITOR, an expert AI-powered SIEM security assistant helping analysts investigate threats.

=== LIVE MONGODB THREAT DATA ===
Active Threats (${siemData.activeThreats.length}):
${siemData.activeThreats.map(t => `• [${t.severity}] ${t.title} | ${t.type} | IP: ${t.sourceIP || 'N/A'} | Risk: ${t.riskScore}/100 | ${t.location?.city}, ${t.location?.country}`).join('\n')}

Severity Counts: Critical=${siemData.counts.Critical}, High=${siemData.counts.High}, Medium=${siemData.counts.Medium}, Low=${siemData.counts.Low}

Open Incidents (${siemData.openIncidents.length}):
${siemData.openIncidents.map(i => `• ${i.incidentId}: ${i.title} | ${i.severity} | ${i.status}`).join('\n')}
${ipContext}

USER QUERY: "${message}"

Respond as a professional security analyst. Use the real data above. Be specific with threat names, IPs, scores. Give actionable recommendations. Use markdown formatting.`;

    // Try Gemini first, fallback to local response
    let aiResponse = await callGemini(prompt);
    if (!aiResponse) {
      aiResponse = await buildFallbackResponse(message, ipResults);
    }

    // Save chat log
    let chatLog = await ChatLog.findOne({ user: req.user._id, sessionId: sid });
    if (!chatLog) chatLog = new ChatLog({ user: req.user._id, sessionId: sid, messages: [] });
    chatLog.messages.push(
      { role: 'user', content: message },
      { role: 'assistant', content: aiResponse, queryType: ipResults.length > 0 ? 'ip_check' : 'ai_response' }
    );
    await chatLog.save();

    res.json({
      success: true,
      response: aiResponse,
      data: siemData.activeThreats,
      ipData: ipResults,
      sessionId: sid
    });

  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/chat/history
router.get('/history', protect, async (req, res) => {
  try {
    const logs = await ChatLog.find({ user: req.user._id }).sort({ updatedAt: -1 }).limit(10);
    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;