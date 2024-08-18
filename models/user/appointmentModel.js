const db = require('../../config/db');

const Appointment = {
    getAllAppointments: (callback) => {
        db.query('SELECT * FROM appointments WHERE deleted_at IS NULL', callback);
    },
    getAppointmentById: (id, callback) => {
        db.query('SELECT * FROM appointments WHERE id = ? AND deleted_at IS NULL', [id], callback);
    },
    createAppointment: (appointmentData, callback) => {
        db.query('INSERT INTO appointments SET ?', appointmentData, callback);
    },
    updateAppointment: (id, appointmentData, callback) => {
        db.query('UPDATE appointments SET ? WHERE id = ?', [appointmentData, id], callback);
    },
    deleteAppointment: (id, callback) => {
        const deletedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
        db.query('UPDATE appointments SET deleted_at = ? WHERE id = ?', [deletedAt, id], callback);
    }
};

module.exports = Appointment;
