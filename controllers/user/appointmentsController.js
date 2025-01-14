const Appointment = require('../../models/user/appointmentModel');

exports.getAllAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.getAllAppointments();
        res.json({
            msg: 'success',
            code: 200,
            data: appointments,
        });
    } catch (err) {
        console.error('Error fetching appointments:', err.message);
        res.status(500).json({ error: 'Failed to fetch appointments' });
    }
};

exports.getAppointmentById = async (req, res) => {
    const { id } = req.params;

    try {
        const appointment = await Appointment.getAppointmentById(id);

        if (!appointment) {
            return res.status(404).json({ error: 'Appointment not found' });
        }

        res.json({
            msg: 'success',
            code: 200,
            data: appointment,
        });
    } catch (err) {
        console.error('Error fetching appointment:', err.message);
        res.status(500).json({ error: 'Failed to fetch appointment' });
    }
};

exports.upsertAppointment = async (req, res) => {
    const { id } = req.params;
    const { user_id, expert_id, appointment_time, status } = req.body;

    const appointmentData = { user_id, expert_id, appointment_time, status };

    try {
        if (id) {
            const existingAppointment = await Appointment.getAppointmentById(id);

            if (!existingAppointment) {
                return res.status(404).json({ error: 'Appointment not found' });
            }

            await Appointment.updateAppointment(id, appointmentData);

            res.json({
                msg: 'success',
                code: 200,
                message: 'Appointment updated successfully',
            });
        } else {
            const newAppointmentId = await Appointment.createAppointment(appointmentData);

            res.json({
                msg: 'success',
                code: 200,
                data: { id: newAppointmentId },
            });
        }
    } catch (err) {
        console.error('Error upserting appointment:', err.message);
        res.status(500).json({ error: 'Failed to upsert appointment' });
    }
};

exports.deleteAppointment = async (req, res) => {
    const { id } = req.params;

    try {
        await Appointment.deleteAppointment(id);
        res.json({
            msg: 'success',
            code: 200,
            message: 'Appointment marked as deleted',
        });
    } catch (err) {
        console.error('Error deleting appointment:', err.message);
        res.status(500).json({ error: 'Failed to delete appointment' });
    }
};
