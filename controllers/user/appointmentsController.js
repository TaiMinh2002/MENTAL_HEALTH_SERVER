const Appointment = require('../../models/user/appointmentModel');

// Lấy tất cả các cuộc hẹn
exports.getAllAppointments = (req, res) => {
    Appointment.getAllAppointments((err, results) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        res.json(results);
    });
};

// Lấy chi tiết cuộc hẹn theo ID
exports.getAppointmentById = (req, res) => {
    const { id } = req.params;
    Appointment.getAppointmentById(id, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Appointment not found' });
        }
        res.json(results[0]);
    });
};

// Tạo mới hoặc cập nhật thông tin cuộc hẹn (upsert)
exports.upsertAppointment = (req, res) => {
    const { id } = req.params;
    const { user_id, expert_id, appointment_time, status } = req.body;
    const appointmentData = { user_id, expert_id, appointment_time, status };

    if (id) {
        Appointment.getAppointmentById(id, (err, results) => {
            if (err) {
                return res.status(500).json({ error: err });
            }
            if (results.length === 0) {
                return res.status(404).json({ error: 'Appointment not found' });
            }
            Appointment.updateAppointment(id, appointmentData, (err, updateResults) => {
                if (err) {
                    return res.status(500).json({ error: err });
                }
                res.json({ message: 'Appointment updated successfully' });
            });
        });
    } else {
        Appointment.createAppointment(appointmentData, (err, insertResults) => {
            if (err) {
                return res.status(500).json({ error: err });
            }
            res.json({ id: insertResults.insertId });
        });
    }
};

// Xóa cuộc hẹn theo ID
exports.deleteAppointment = (req, res) => {
    const { id } = req.params;
    Appointment.deleteAppointment(id, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        res.json({ message: 'Appointment marked as deleted' });
    });
};
