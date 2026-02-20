const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// GET /api/ipcheck/:ip
router.get('/:ip', protect, async (req, res) => {
  try {
    const { ip } = req.params;

    const response = await fetch(`https://api.abuseipdb.com/api/v2/check?ipAddress=${ip}&maxAgeInDays=90&verbose`, {
      headers: {
        'Key': process.env.ABUSEIPDB_API_KEY,
        'Accept': 'application/json'
      }
    });

    const result = await response.json();

    if (result.errors) {
      return res.status(400).json({ success: false, message: result.errors[0]?.detail || 'Invalid IP' });
    }

    const d = result.data;
    res.json({
      success: true,
      ip: d.ipAddress,
      abuseScore: d.abuseConfidenceScore,
      country: d.countryCode,
      isp: d.isp,
      domain: d.domain,
      totalReports: d.totalReports,
      lastReported: d.lastReportedAt,
      isWhitelisted: d.isWhitelisted,
      usageType: d.usageType,
      riskLevel: d.abuseConfidenceScore >= 80 ? 'Critical' :
                 d.abuseConfidenceScore >= 50 ? 'High' :
                 d.abuseConfidenceScore >= 20 ? 'Medium' : 'Low'
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/ipcheck/bulk - check multiple IPs
router.post('/bulk', protect, async (req, res) => {
  try {
    const { ips } = req.body;
    if (!ips || !Array.isArray(ips)) return res.status(400).json({ success: false, message: 'IPs array required' });

    const results = await Promise.all(ips.slice(0, 10).map(async (ip) => {
      try {
        const response = await fetch(`https://api.abuseipdb.com/api/v2/check?ipAddress=${ip}&maxAgeInDays=90`, {
          headers: { 'Key': process.env.ABUSEIPDB_API_KEY, 'Accept': 'application/json' }
        });
        const result = await response.json();
        const d = result.data;
        return {
          ip: d.ipAddress,
          abuseScore: d.abuseConfidenceScore,
          country: d.countryCode,
          totalReports: d.totalReports,
          riskLevel: d.abuseConfidenceScore >= 80 ? 'Critical' :
                     d.abuseConfidenceScore >= 50 ? 'High' :
                     d.abuseConfidenceScore >= 20 ? 'Medium' : 'Low'
        };
      } catch { return { ip, error: 'Failed to check' }; }
    }));

    res.json({ success: true, results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;