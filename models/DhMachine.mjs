import mongoose from 'mongoose';

const dhMachineSchema = new mongoose.Schema(
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
        dhMachines: [{
            location: {
                type: String,
                required: true,
            },
            status: {
                type: Boolean,
                required: true,
            }
        }]
    }
);

const DhMachine = mongoose.model('DhMachine', dhMachineSchema);
export default DhMachine;