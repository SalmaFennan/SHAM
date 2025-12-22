const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');

router.get('/', courseController.getAll);
router.get('/:id', courseController.getById);
router.post('/', courseController.create);
router.put('/:id', courseController.update);
router.delete('/:id', courseController.delete);
router.get('/today', courseController.getTodayCourses);
router.get('/schedule/weekly', courseController.getWeeklySchedule);
router.get('/stats', courseController.getCourseStats);

module.exports = router;