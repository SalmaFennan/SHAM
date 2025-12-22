const pool = require('../config/database');

class Attendance {
    static async getTodayPresence() {
        const [rows] = await pool.query(`
            SELECT COUNT(*) as count 
            FROM presence 
            WHERE date = CURDATE()
        `);
        return rows[0].count;
    }

    static async getCurrentClasses() {
        const [rows] = await pool.query(`
            SELECT COUNT(*) as count 
            FROM cours 
            WHERE heure_debut <= CURTIME() 
            AND heure_fin >= CURTIME()
        `);
        return rows[0].count;
    }

    static async getAverageDuration() {
        const [rows] = await pool.query(`
            SELECT SEC_TO_TIME(AVG(TIME_TO_SEC(TIMEDIFF(heure_depart, heure_arrivee)))) as avg_duration
            FROM presence 
            WHERE date = CURDATE()
        `);
        return rows[0].avg_duration;
    }

    static async checkIn(employeeId) {
        await pool.query(`
            INSERT INTO presence (employe_id, date, heure_arrivee)
            VALUES (?, CURDATE(), CURTIME())
        `, [employeeId]);
    }

    static async checkOut(employeeId) {
        await pool.query(`
            UPDATE presence 
            SET heure_depart = CURTIME() 
            WHERE employe_id = ? 
            AND date = CURDATE()
        `, [employeeId]);
    }

    static async getEmployeeAttendance(employeeId) {
        const [rows] = await pool.query(`
            SELECT * FROM presence 
            WHERE employe_id = ? 
            ORDER BY date DESC
        `, [employeeId]);
        return rows;
    }
}

module.exports = Attendance;