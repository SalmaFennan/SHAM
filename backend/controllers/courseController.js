const Course = require('../models/Course');

exports.getAll = async (req, res) => {
    try {
        const courses = await Course.getAll();
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const course = await Course.getById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Cours non trouvé' });
        }
        res.json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const newId = await Course.create(req.body);
        res.status(201).json({ id: newId, ...req.body });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        await Course.update(req.params.id, req.body);
        res.json({ message: 'Cours mis à jour avec succès' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        await Course.delete(req.params.id);
        res.json({ message: 'Cours supprimé avec succès' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getTodayCourses = async (req, res) => {
    try {
        const courses = await Course.getTodayCourses();
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getWeeklySchedule = async (req, res) => {
    try {
        const schedule = await Course.getWeeklySchedule();
        res.json(schedule);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getCourseStats = async (req, res) => {
    try {
        const stats = await Course.getCourseStats();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};