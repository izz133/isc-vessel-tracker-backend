import mongoose from 'mongoose';

const rhReadingSchema = new mongoose.Schema(
    {
        vessel: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Vessel'
        },
        date: {
            type: Date,
            required: true
        },
        rhReadings: [{
            location: {
                type: String,
                required: true,
            },
            rh: {
                type: Number,
                required: true,
            }
        }]
    }
);

const RhReading = mongoose.model('RhReading', rhReadingSchema);
export default RhReading;
