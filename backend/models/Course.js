const pool = require('../config/database');

class Course {
    static async getAll() {
        const [rows] = await pool.query(`
            SELECT c.*, e.nom as formateur_nom, e.prenom as formateur_prenom
            FROM cours c
            JOIN employe e ON c.formateur_id = e.id
        `);
        return rows;
    }

    static async getById(id) {
        const [rows] = await pool.query(`
            SELECT c.*, e.nom as formateur_nom, e.prenom as formateur_prenom
            FROM cours c
            JOIN employe e ON c.formateur_id = e.id
            WHERE c.id = ?
        `, [id]);
        return rows[0];
    }

    static async create(courseData) {
        const { nom, description, formateur_id, jour_semaine, heure_debut, heure_fin, capacite_max } = courseData;
        const [result] = await pool.query(
            'INSERT INTO cours (nom, description, formateur_id, jour_semaine, heure_debut, heure_fin, capacite_max) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [nom, description, formateur_id, jour_semaine, heure_debut, heure_fin, capacite_max]
        );
        return result.insertId;
    }

    static async update(id, courseData) {
        const { nom, description, formateur_id, jour_semaine, heure_debut, heure_fin, capacite_max } = courseData;
        await pool.query(
            'UPDATE cours SET nom = ?, description = ?, formateur_id = ?, jour_semaine = ?, heure_debut = ?, heure_fin = ?, capacite_max = ? WHERE id = ?',
            [nom, description, formateur_id, jour_semaine, heure_debut, heure_fin, capacite_max, id]
        );
    }

    static async delete(id) {
        await pool.query('DELETE FROM cours WHERE id = ?', [id]);
    }

    static async getTodayCourses() {
        const jours = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
        const today = new Date().getDay();
        const jour = jours[today];

        const [rows] = await pool.query(`
            SELECT c.*, e.nom as formateur_nom, e.prenom as formateur_prenom
            FROM cours c
            JOIN employe e ON c.formateur_id = e.id
            WHERE c.jour_semaine = ?
            ORDER BY c.heure_debut
        `, [jour]);
        return rows;
    }

    static async getWeeklySchedule() {
        const jours = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
        const schedule = {};

        for (const jour of jours) {
            const [rows] = await pool.query(`
                SELECT c.*, e.nom as formateur_nom, e.prenom as formateur_prenom
                FROM cours c
                JOIN employe e ON c.formateur_id = e.id
                WHERE c.jour_semaine = ?
                ORDER BY c.heure_debut
            `, [jour]);
            schedule[jour] = rows;
        }

        return schedule;
    }

    static async getCourseStats() {
        const [totalAccess] = await pool.query('SELECT SUM(capacite_max) as total FROM cours');
        const [totalParticipants] = await pool.query('SELECT COUNT(*) as total FROM participant_cours');
        const [todayCourses] = await pool.query(`
            SELECT COUNT(*) as count 
            FROM cours 
            WHERE jour_semaine = LOWER(DAYNAME(CURDATE()))
        `);

        const fillRate = totalAccess[0].total > 0 
            ? Math.round((totalParticipants[0].total / totalAccess[0].total) * 100) 
            : 0;

        return {
            totalAccess: totalAccess[0].total,
            totalParticipants: totalParticipants[0].total,
            fillRate: fillRate,
            todayCourses: todayCourses[0].count
        };
    }
}

module.exports = Course;