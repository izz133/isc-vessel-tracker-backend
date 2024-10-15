import mongoose from 'mongoose';

const dutySchema = new mongoose.Schema(
    {
        vessel: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Vessel', // Reference to the Vessel model
        },
        date: {
            type: Date,
            required: true,
        },
        duties: [{
                user: {
                    type: mongoose.Schema.Types.ObjectId, // Reference to User
                    required: true,
                    ref: 'User', // Reference to the User model
                },
                shift: {
                    type: String,
                    enum: ['day', 'night'], // Enum to restrict values to 'day' or 'night'
                    required: true,
                },
            },
        ],
    });

const Duty = mongoose.model('Duty', dutySchema);
export default Duty;
