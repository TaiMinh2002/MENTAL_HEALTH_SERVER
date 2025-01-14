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

exports.getAllExercises = async (req, res) => {
    let { page = 1, limit = 10, keyword = '', type } = req.query;
    page = parseInt(page, 10);
    limit = parseInt(limit, 10);
    type = type ? parseInt(type, 10) : null;

    try {
        const exercises = await Exercise.getAllExercises(page, limit, keyword, type);

        const total = await Exercise.countAllExercises(keyword, type);

        const formattedResults = exercises.map((exercise) => ({
            ...exercise,
            type_string: typeToString(exercise.type),
            media_url: exercise.media_url,
            thumbnail_url: exercise.thumbnail_url,
        }));

        const response = {
            msg: "success",
            code: 200,
            data: {
                exercises: {
                    data: formattedResults,
                    total,
                    per_page: limit,
                    current_page: page,
                    last_page: Math.ceil(total / limit),
                    has_more_pages: page < Math.ceil(total / limit),
                },
            },
        };

        res.json(response);
    } catch (err) {
        console.error('Error fetching exercises:', err);
        res.status(500).json({ msg: 'Internal server error', code: 500 });
    }
};

exports.getExerciseById = async (req, res) => {
    const { id } = req.params;

    try {
        const exercise = await Exercise.getExerciseById(id);

        if (!exercise) {
            return res.status(404).json({ error: 'Exercise not found' });
        }

        const formattedExercise = {
            ...exercise,
            type_string: typeToString(exercise.type),
            media_url: exercise.media_url,
            thumbnail_url: exercise.thumbnail_url,
        };

        res.json({
            msg: "success",
            code: 200,
            data: { exercise: formattedExercise },
        });
    } catch (err) {
        console.error('Error fetching exercise:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
