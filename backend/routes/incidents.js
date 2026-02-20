const express = require('express');
const router = express.Router();
const Incident = require('../models/Incident');
const { protect, adminOnly, adminOrAnalyst } = require('../middleware/auth');

// GET /api/incidents
router.get('/', protect, async (req, res) => {
  try {
    const { status, severity, category, limit = 20, page = 1 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (severity) filter.severity = severity;
    if (category) filter.category = category;
    
    const incidents = await Incident.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');
    
    const total = await Incident.countDocuments(filter);
    res.json({ success: true, incidents, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/incidents/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('timeline.performedBy', 'name email');
    if (!incident) return res.status(404).json({ success: false, message: 'Incident not found' });
    res.json({ success: true, incident });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/incidents - admin only
router.post('/', protect, adminOrAnalyst, async (req, res) => {
  try {
    const incident = await Incident.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, incident });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/incidents/:id
router.patch('/:id', protect, adminOrAnalyst, async (req, res) => {
  try {
    const { status, assignedTo, note } = req.body;
    const incident = await Incident.findById(req.params.id);
    if (!incident) return res.status(404).json({ success: false, message: 'Incident not found' });
    
    if (status) incident.status = status;
    if (assignedTo) incident.assignedTo = assignedTo;
    if (status === 'Resolved') incident.resolvedAt = new Date();
    
    if (note) {
      incident.timeline.push({ action: status || 'Updated', performedBy: req.user._id, note });
    }
    
    await incident.save();
    res.json({ success: true, incident });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/incidents/:id - admin only
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Incident.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Incident deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
