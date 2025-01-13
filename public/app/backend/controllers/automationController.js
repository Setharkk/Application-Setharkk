const Automation = require('../models/automationModel');

const getAutomations = async (req, res) => {
  try {
    const automations = await Automation.findByUser(req.user.id);
    res.json({ success: true, data: automations });
  } catch (error) {
    console.error('Erreur lors de la récupération des automations:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des automations'
    });
  }
};

const createAutomation = async (req, res) => {
  try {
    const automation = new Automation({
      ...req.body,
      createdBy: req.user.id
    });
    await automation.save();
    res.status(201).json({ success: true, data: automation });
  } catch (error) {
    console.error('Erreur lors de la création de l\'automation:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création de l\'automation'
    });
  }
};

const updateAutomation = async (req, res) => {
  try {
    const automation = await Automation.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.id },
      req.body,
      { new: true }
    );
    if (!automation) {
      return res.status(404).json({
        success: false,
        error: 'Automation non trouvée'
      });
    }
    res.json({ success: true, data: automation });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'automation:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise à jour de l\'automation'
    });
  }
};

const deleteAutomation = async (req, res) => {
  try {
    const automation = await Automation.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.id
    });
    if (!automation) {
      return res.status(404).json({
        success: false,
        error: 'Automation non trouvée'
      });
    }
    res.json({ success: true, data: {} });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'automation:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la suppression de l\'automation'
    });
  }
};

const toggleAutomation = async (req, res) => {
  try {
    const automation = await Automation.findOne({
      _id: req.params.id,
      createdBy: req.user.id
    });
    if (!automation) {
      return res.status(404).json({
        success: false,
        error: 'Automation non trouvée'
      });
    }
    if (automation.status === 'active') {
      await automation.pause();
    } else {
      await automation.activate();
    }
    res.json({ success: true, data: automation });
  } catch (error) {
    console.error('Erreur lors du basculement de l\'automation:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors du basculement de l\'automation'
    });
  }
};

module.exports = {
  getAutomations,
  createAutomation,
  updateAutomation,
  deleteAutomation,
  toggleAutomation
}; 