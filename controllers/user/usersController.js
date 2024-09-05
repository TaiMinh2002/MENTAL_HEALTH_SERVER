const bcrypt = require('bcryptjs');
const validator = require('validator');
const User = require('../../models/user/userModel');
const bucket = require('../../firebase'); // Import Firebase Storage bucket
require('dotenv').config();

const getBaseUrl = (req) => {
    const serverIp = process.env.SERVER_IP || 'localhost';
    return req.protocol + '://' + serverIp + ':' + process.env.PORT;
};

const getStatusString = (status) => {
    switch (status) {
        case 1:
            return 'Đang sử dụng';
        case 2:
            return 'Tạm dừng';
        default:
            return 'Không xác định';
    }
};

const getSleepString = (sleep) => {
    switch (sleep) {
        case 1:
            return '7-9 hours';
        case 2:
            return '6-7 hours';
        case 3:
            return '5 hours';
        case 4:
            return '3-4 hours';
        case 5:
            return '<3 hours';
        default:
            return 'Unknown';
    }
};

const getStressString = (stress) => {
    switch (stress) {
        case 1:
            return 'Not Stressed';
        case 2:
            return 'Slightly Stressed';
        case 3:
            return 'Moderately Stressed';
        case 4:
            return 'Very Stressed';
        case 5:
            return 'Extremely Stressed';
        default:
            return 'Unknown';
    }
};

const getMoodString = (mood) => {
    switch (mood) {
        case 1:
            return 'I Feel Great';
        case 2:
            return 'I Feel Good';
        case 3:
            return 'I Feel Neutral';
        case 4:
            return 'I Feel Sad';
        case 5:
            return 'I Feel Tired';
        default:
            return 'Unknown';
    }
};

const getGenderString = (gender) => {
    switch (gender) {
        case 1:
            return 'Male';
        case 2:
            return 'Female';
        default:
            return 'Không xác định';
    }
};

const getProfessionalRequestString = (is_professional_request) => {
    switch (is_professional_request) {
        case 1:
            return 'Yes';
        case 2:
            return 'No';
        default:
            return 'Không xác định';
    }
};

// Tải ảnh lên Firebase Storage
const uploadToFirebase = (file) => {
    return new Promise((resolve, reject) => {
        const { originalname, buffer } = file;
        const blob = bucket.file(originalname);
        const blobStream = blob.createWriteStream({
            metadata: {
                contentType: file.mimetype
            }
        });

        blobStream.on('error', (err) => {
            reject(err);
        });

        blobStream.on('finish', async () => {
            try {
                await blob.makePublic(); // Làm cho ảnh công khai
                const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
                resolve(publicUrl);
            } catch (error) {
                reject(error);
            }
        });

        blobStream.end(buffer);
    });
};

// Lấy tất cả người dùng với phân trang và tìm kiếm
exports.getAllUsers = (req, res) => {
    const { page = 1, limit = 10, keyword = '' } = req.query;
    User.getAllUsers(page, limit, keyword, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        User.countAllUsers(keyword, (err, countResults) => {
            if (err) {
                return res.status(500).json({ error: err });
            }
            const total = countResults[0].total;

            const usersWithStrings = results.map(user => ({
                ...user,
                status_string: getStatusString(user.status),
                sleep_string: getSleepString(user.sleep),
                stress_string: getStressString(user.stress),
                mood_string: getMoodString(user.mood),
                gender_string: getGenderString(user.gender),
                is_professional_request_string: getProfessionalRequestString(user.is_professional_request),
            }));

            res.json({
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                total_page: Math.ceil(total / limit),
                users: usersWithStrings,
            });
        });
    });
};

// Lấy chi tiết người dùng theo ID
exports.getUserById = async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id; // ID của người đang đăng nhập

    // Kiểm tra xem user đang đăng nhập có đang cố lấy đúng thông tin của mình không
    if (id != user_id) {
        return res.status(403).json({ error: 'You do not have permission to access this user' });
    }

    try {
        const results = await User.getUserById(id);
        if (results.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = results[0];
        user.status_string = getStatusString(user.status);
        user.sleep_string = getSleepString(user.sleep);
        user.stress_string = getStressString(user.stress);
        user.mood_string = getMoodString(user.mood);
        user.gender_string = getGenderString(user.gender);
        user.is_professional_request_string = getProfessionalRequestString(user.is_professional_request);

        res.json(user);
    } catch (err) {
        res.status(500).json({ error: 'Failed to retrieve user' });
    }
};

// Cập nhật thông tin người dùng
exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id; // ID của người dùng đang đăng nhập

    if (id != user_id) {
        return res.status(403).json({ error: 'You do not have permission to update this user' });
    }

    const { username, password, sleep, stress, age, mood, gender, is_professional_request } = req.body;
    let avatar;

    // Kiểm tra nếu có file ảnh được gửi lên
    if (req.file) {
        try {
            avatar = await uploadToFirebase(req.file); // Tải ảnh lên Firebase
        } catch (error) {
            return res.status(500).json({ error: 'Error uploading file to Firebase' });
        }
    }

    const userData = {};
    if (username) {
        userData.username = username;
    }
    if (password) {
        if (!validator.isStrongPassword(password, { minLength: 8 })) {
            return res.status(400).json({ error: 'Password must be at least 8 characters long and meet other criteria' });
        }
        const hash = await bcrypt.hash(password, 10);
        userData.password = hash;
    }
    if (avatar) {
        userData.avatar = avatar; // Cập nhật avatar
    }
    if (age) {
        userData.age = age;
    }
    if (sleep) {
        userData.sleep = sleep;
    }
    if (stress) {
        userData.stress = stress;
    }
    if (mood) {
        userData.mood = mood;
    }
    if (gender) {
        userData.gender = gender;
    }
    if (is_professional_request) {
        userData.is_professional_request = is_professional_request;
    }

    try {
        const result = await User.updateUser(id, userData);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Sau khi cập nhật thành công, lấy lại thông tin người dùng để trả về output như yêu cầu
        const updatedUser = await User.getUserById(id);
        if (updatedUser.length === 0) {
            return res.status(404).json({ error: 'User not found after update' });
        }

        res.json({
            msg: "success",
            code: 200,
            data: {
                user: updatedUser[0] // Thông tin người dùng đã cập nhật
            }
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update user' });
    }
};

// Xóa người dùng theo ID
exports.deleteUser = (req, res) => {
    const { id } = req.params;
    User.checkIfUserExists(id, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        if (results.length === 0 || results[0].deleted_at) {
            return res.status(404).json({ error: 'User not found' });
        }
        User.deleteUser(id, (err, results) => {
            if (err) {
                return res.status(500).json({ error: err });
            }
            res.json({ message: 'User marked as deleted' });
        });
    });
};

// Tạm dừng tài khoản người dùng
exports.pauseUser = (req, res) => {
    const { id } = req.params;

    User.getUserById(id, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userData = { status: 2 };

        User.updateUser(id, userData, (err, updateResults) => {
            if (err) {
                return res.status(500).json({ error: err });
            }
            res.json({ message: 'User account paused successfully', status_string: 'Tạm dừng' });
        });
    });
};
