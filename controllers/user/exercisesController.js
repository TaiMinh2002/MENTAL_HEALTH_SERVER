const Exercise = require('../../models/user/exerciseModel');

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
    let { page = 1, limit, keyword = '', type } = req.query;
    limit = limit ? parseInt(limit) : 10;
    type = type ? parseInt(type) : null;

    Exercise.getAllExercises(page, limit, keyword, type, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        Exercise.countAllExercises(keyword, type, (err, countResults) => {
            if (err) {
                return res.status(500).json({ error: err });
            }

            const formattedResults = results.map(exercise => ({
                ...exercise,
                type_string: typeToString(exercise.type),
                media_url: exercise.media_url,
                thumbnail_url: exercise.thumbnail_url
            }));

            const response = {
                msg: "success",
                code: 200,
                data: {
                    forums: {
                        data: formattedResults,
                        total: countResults[0].total,
                        per_page: limit,
                        current_page: parseInt(page),
                        last_page: Math.ceil(countResults[0].total / limit),
                        has_more_pages: parseInt(page) < Math.ceil(countResults[0].total / limit)
                    }
                }
            };

            res.json(response);
        });
    });
};

exports.getExerciseById = (req, res) => {
    const { id } = req.params;

    Exercise.getExerciseById(id, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Exercise not found' });
        }

        const exercise = {
            ...results[0],
            type_string: typeToString(results[0].type),
            media_url: results[0].media_url,
            thumbnail_url: results[0].thumbnail_url
        };

        res.json({
            msg: "success",
            code: 200,
            data: {
                exercise
            }
        });
    });
};