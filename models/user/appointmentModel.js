const db = require('../../config/db');

const Appointment = {
    getAllAppointments: async () => {
        return await db('appointments')
            .whereNull('deleted_at');
    },

    getAppointmentById: async (id) => {
        return await db('appointments')
            .where({ id })
            .whereNull('deleted_at')
            .first();
    },

    createAppointment: async (appointmentData) => {
        const [id] = await db('appointments').insert(appointmentData);
        return id;
    },

    updateAppointment: async (id, appointmentData) => {
        await db('appointments')
            .where({ id })
            .whereNull('deleted_at')
            .update(appointmentData);
    },

    deleteAppointment: async (id) => {
        const deletedAt = new Date();
        await db('appointments')
            .where({ id })
            .update({ deleted_at: deletedAt });
    },
};

module.exports = Appointment;
