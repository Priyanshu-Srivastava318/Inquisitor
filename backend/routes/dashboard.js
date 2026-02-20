const express = require('express');
const router = express.Router();
const Threat = require('../models/Threat');
const Incident = require('../models/Incident');
const { protect } = require('../middleware/auth');

// Check IP with AbuseIPDB
const checkIP = async (ip) => {
  try {
    const response = await fetch(`https://api.abuseipdb.com/api/v2/check?ipAddress=${ip}&maxAgeInDays=90`, {
      headers: { 'Key': process.env.ABUSEIPDB_API_KEY, 'Accept': 'application/json' }
    });
    const result = await response.json();
    return result.data;
  } catch { return null; }
};

// GET /api/dashboard/stats - Full live dashboard data
router.get('/stats', protect, async (req, res) => {
  try {
    const last7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // MongoDB live queries
    const [
      activeThreats,
      totalThreats,
      openIncidents,
      totalIncidents,
      resolvedThreats,
      severityStats,
      recentByDay,
      categoryBreakdown
    ] = await Promise.all([
      Threat.countDocuments({ status: { $in: ['Active', 'Investigating'] } }),
      Threat.countDocuments({}),
      Incident.countDocuments({ status: { $in: ['Open', 'In Progress'] } }),
      Incident.countDocuments({}),
      Threat.countDocuments({ status: 'Resolved' }),
      Threat.aggregate([{ $group: { _id: '$severity', count: { $sum: 1 } } }]),
      Threat.aggregate([
        { $match: { detectedAt: { $gte: last7d } } },
        { $group: { _id: { $dayOfWeek: '$detectedAt' }, count: { $sum: 1 } } },
        { $sort: { '_id': 1 } }
      ]),
      Threat.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 6 }
      ])
    ]);

    const counts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    severityStats.forEach(s => { if (counts[s._id] !== undefined) counts[s._id] = s.count; });

    // Get top threat IPs and check them live with AbuseIPDB
    const topThreats = await Threat.find({
      status: { $in: ['Active', 'Investigating'] },
      sourceIP: { $exists: true, $nin: ['Multiple', 'Internal', null] }
    }).sort({ riskScore: -1 }).limit(3);

    const liveIPData = await Promise.all(
      topThreats.map(async (threat) => {
        const ipInfo = await checkIP(threat.sourceIP);
        return {
          ip: threat.sourceIP,
          threatTitle: threat.title,
          severity: threat.severity,
          abuseScore: ipInfo?.abuseConfidenceScore ?? threat.riskScore,
          country: ipInfo?.countryCode || threat.location?.country || 'Unknown',
          isp: ipInfo?.isp || 'Unknown',
          totalReports: ipInfo?.totalReports || 0,
          isRealTime: !!ipInfo
        };
      })
    );

    // Calculate live security score based on real abuse scores
    const avgAbuseScore = liveIPData.length > 0
      ? liveIPData.reduce((sum, ip) => sum + ip.abuseScore, 0) / liveIPData.length
      : counts.Critical * 5 + counts.High * 3;

    const securityScore = Math.max(10, Math.min(100, Math.round(100 - avgAbuseScore * 0.5 - counts.Critical * 3)));

    // Response time simulation based on active threats
    const avgResponseTime = activeThreats === 0 ? 5 :
      activeThreats <= 3 ? 8 :
      activeThreats <= 6 ? 12 : 18;

    res.json({
      success: true,
      stats: {
        // Core counts from MongoDB
        activeThreats,
        totalThreats,
        openIncidents,
        totalIncidents,
        resolvedThreats,

        // Severity breakdown
        criticalCount: counts.Critical,
        highCount: counts.High,
        mediumCount: counts.Medium,
        lowCount: counts.Low,

        // Live calculated metrics
        securityScore,
        avgResponseTime: `${avgResponseTime}m`,

        // Chart data
        recentByDay,
        categoryBreakdown,

        // Live IP threat intelligence from AbuseIPDB
        liveIPThreats: liveIPData,

        // Metadata
        lastUpdated: new Date(),
        dataSource: 'MongoDB + AbuseIPDB Real-Time'
      }
    });

  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/dashboard/live-threats - Real-time threat feed
router.get('/live-threats', protect, async (req, res) => {
  try {
    const threats = await Threat.find({ status: { $in: ['Active', 'Investigating'] } })
      .sort({ riskScore: -1 })
      .limit(5);

    // Enrich with live AbuseIPDB data
    const enriched = await Promise.all(threats.map(async (threat) => {
      const t = threat.toObject();
      if (t.sourceIP && !['Multiple', 'Internal'].includes(t.sourceIP)) {
        const ipData = await checkIP(t.sourceIP);
        if (ipData) {
          t.liveAbuseScore = ipData.abuseConfidenceScore;
          t.liveCountry = ipData.countryCode;
          t.liveISP = ipData.isp;
          t.liveTotalReports = ipData.totalReports;
          t.isEnriched = true;
        }
      }
      return t;
    }));

    res.json({ success: true, threats: enriched });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;