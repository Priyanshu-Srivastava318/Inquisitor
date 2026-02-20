const express = require('express');
const router = express.Router();
const Threat = require('../models/Threat');
const { protect, adminOrAnalyst } = require('../middleware/auth');

// GET /api/threats
router.get('/', protect, async (req, res) => {
  try {
    const { severity, status, type, limit = 50, page = 1 } = req.query;
    const filter = {};
    if (severity) filter.severity = { $in: severity.split(',') };
    if (status) filter.status = { $in: status.split(',') };
    if (type) filter.type = type;

    const threats = await Threat.find(filter)
      .sort({ detectedAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('assignedTo', 'name email');

    const total = await Threat.countDocuments(filter);
    res.json({ success: true, threats, total, page: parseInt(page) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/threats/stats - Live dashboard stats
router.get('/stats', protect, async (req, res) => {
  try {
    const last7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      activeThreats,
      criticalCount,
      highCount,
      mediumCount,
      lowCount,
      totalThreats,
      resolvedThreats,
      recentByDay,
      categoryBreakdown,
      avgRiskScore
    ] = await Promise.all([
      Threat.countDocuments({ status: { $in: ['Active', 'Investigating'] } }),
      Threat.countDocuments({ severity: 'Critical', status: { $in: ['Active', 'Investigating'] } }),
      Threat.countDocuments({ severity: 'High', status: { $in: ['Active', 'Investigating'] } }),
      Threat.countDocuments({ severity: 'Medium', status: { $in: ['Active', 'Investigating'] } }),
      Threat.countDocuments({ severity: 'Low', status: { $in: ['Active', 'Investigating'] } }),
      Threat.countDocuments({}),
      Threat.countDocuments({ status: 'Resolved' }),
      Threat.aggregate([
        { $match: { detectedAt: { $gte: last7d } } },
        { $group: { _id: { $dayOfWeek: '$detectedAt' }, count: { $sum: 1 } } },
        { $sort: { '_id': 1 } }
      ]),
      Threat.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 6 }
      ]),
      Threat.aggregate([
        { $match: { status: { $in: ['Active', 'Investigating'] } } },
        { $group: { _id: null, avg: { $avg: '$riskScore' } } }
      ])
    ]);

    const avgRisk = avgRiskScore[0]?.avg || 13;
    const securityScore = Math.max(0, Math.round(100 - avgRisk));

    res.json({
      success: true,
      stats: {
        activeThreats,
        criticalCount,
        highCount,
        mediumCount,
        lowCount,
        totalThreats,
        resolvedThreats,
        securityScore,
        recentByDay,
        categoryBreakdown
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/threats/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const threat = await Threat.findById(req.params.id).populate('assignedTo', 'name email');
    if (!threat) return res.status(404).json({ success: false, message: 'Threat not found' });
    res.json({ success: true, threat });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/threats
router.post('/', protect, adminOrAnalyst, async (req, res) => {
  try {
    const threat = await Threat.create(req.body);
    res.status(201).json({ success: true, threat });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/threats/:id/status
router.patch('/:id/status', protect, adminOrAnalyst, async (req, res) => {
  try {
    const { status } = req.body;
    const threat = await Threat.findByIdAndUpdate(
      req.params.id,
      { status, ...(status === 'Resolved' ? { resolvedAt: new Date() } : {}) },
      { new: true }
    );
    if (!threat) return res.status(404).json({ success: false, message: 'Threat not found' });
    res.json({ success: true, threat });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;