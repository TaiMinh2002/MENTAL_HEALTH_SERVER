const Exercise = require('../../models/user/exerciseModel');

// Map type to string
const typeToString = (type) => {
    switch (type) {
        case 1:
            return 'Thiền';
        case 2:
            return 'Thở sâu';
        case 3:
            return 'Yoga';
        default:
            return 'Unknown';
    }
};

exports.getAllExercises = (req, res) => {
    const { page = 1, limit = 10, keyword = '' } = req.query;
    Exercise.getAllExercises(page, limit, keyword, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        Exercise.countAllExercises(keyword, (err, countResults) => {
            if (err) {
                return res.status(500).json({ error: err });
            }
            res.json({
                total: countResults[0].total,
                page: parseInt(page),
                limit: parseInt(limit),
                exercises: results.map(exercise => ({
                    ...exercise,
                    type_string: typeToString(exercise.type),
                    media_url: exercise.media_url
                }))
            });
        });
    });
};