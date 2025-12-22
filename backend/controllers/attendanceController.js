const Attendance = require('../models/Attendance');

exports.getDashboardData = async (req, res) => {
    try {
        const presentToday = await Attendance.getTodayPresence();
        const currentClasses = await Attendance.getCurrentClasses();
        const averageDuration = await Attendance.getAverageDuration();

        res.json({
            presentToday,
            currentClasses,
            averageDuration,
            absentToday: 0 // À implémenter selon votre logique
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.checkIn = async (req, res) => {
    try {
        await Attendance.checkIn(req.params.employeeId);
        res.json({ message: 'Check-in enregistré avec succès' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.checkOut = async (req, res) => {
    try {
        await Attendance.checkOut(req.params.employeeId);
        res.json({ message: 'Check-out enregistré avec succès' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getEmployeeAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.getEmployeeAttendance(req.params.employeeId);
        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};