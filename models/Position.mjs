import mongoose from 'mongoose';

const positionSchema = new mongoose.Schema(
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
        positions: [{
            time: {
                type: String,
                enum: ["0000", "0600", "1200", "1800"],
                required: true
            },
            lat: {
                type: Number,
                required: true
            },
            long: {
                type: Number,
                required: true
            }
        }]
    }
);

const Position = mongoose.model('Position', positionSchema);
export default Position;
