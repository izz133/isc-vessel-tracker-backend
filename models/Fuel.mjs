import mongoose from 'mongoose';

const fuelSchema = new mongoose.Schema(
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
        fuels: [{
            refill: {
                type: Number,
                required: true,
            },
            initial: {
                type: Number,
                required: true,
            },
            final: {
                type: Number,
                required: true,
            },
            running: {
                type: Number,
                required: true,
            },
            consumption: {
                type: Number,
                required: true,
            }
        }]
    }
);

const Fuel = mongoose.model('Fuel', fuelSchema);
export default Fuel;
