import Duty from '../models/Duty.mjs';

// @desc Get all duties
// @route GET /duties
// @access Private
const getAllDuties = async (req, res) => {
    const { date } = req.query; // Get date from query parameters

    let duties;

    try {
        if (date) {
            duties = await Duty.find({ date })
                .populate({
                    path: 'vessel',
                    populate: { path: 'user', select: 'username' } // Populate user to get owner username
                })
                .populate('duties.user', 'username roles') // Populate user reference to show username and roles
                .lean();
        } else {
            duties = await Duty.find()
                .populate({
                    path: 'vessel',
                    populate: { path: 'user', select: 'username' } // Populate user to get owner username
                })
                .populate('duties.user', 'username roles') // Populate user reference to show username and roles
                .lean();
        }

        // Check if duties were found
        if (!duties?.length) {
            return res.status(400).json({ message: 'No duties found' });
        }

        // Log duties for debugging
        duties.forEach(duty => {
            const vesselOwner = duty.vessel.user; // Access the vessel owner
            console.log('Vessel Owner:', vesselOwner); // Log the vessel owner
        });

        res.json(duties);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while fetching duties' });
    }
};



// @desc Create a new duty
// @route POST /duties
// @access Private
const createNewDuty = async (req, res) => {
    const { vessel, date, duties } = req.body;

    // Confirm data
    if (!vessel || !date || !duties || !Array.isArray(duties)) {
        return res.status(400).json({ message: 'All fields are required, and duties must be an array' });
    }

    try {
        // Check for duplicate date for the same vessel
        const duplicate = await Duty.findOne({ vessel, date }).collation({ locale: 'en', strength: 2 }).lean().exec();

        if (duplicate) {
            return res.status(409).json({ message: 'This vessel already has a duty entry for this date' });
        }

        // Create and store the new duty
        const duty = await Duty.create({ vessel, date, duties });

        if (duty) { // Created
            return res.status(201).json({ message: 'New duty entry has been entered' });
        } else {
            return res.status(400).json({ message: 'Invalid duty data received' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while creating duty' });
    }
};

// @desc Update a duty
// @route PATCH /duties
// @access Private
const updateDuty = async (req, res) => {
    const { id, vessel, date, duties } = req.body;

    // Confirm data
    if (!id || !vessel || !date || !duties || !Array.isArray(duties)) {
        return res.status(400).json({ message: 'All fields are required, and duties must be an array' });
    }

    try {
        // Confirm duty exists to update
        const duty = await Duty.findById(id).exec();

        if (!duty) {
            return res.status(400).json({ message: 'Duty not found' });
        }

        // Check for duplicate vessel and date
        const duplicate = await Duty.findOne({ vessel, date }).collation({ locale: 'en', strength: 2 }).lean().exec();

        // Allow update only if no other entry exists for the same vessel and date
        if (duplicate && duplicate._id.toString() !== id) {
            return res.status(409).json({ message: 'Another duty for this vessel already exists on this date' });
        }

        duty.vessel = vessel;
        duty.date = date;
        duty.duties = duties;

        const updatedDuty = await duty.save();

        res.json({ message: `Duty for vessel '${updatedDuty.vessel}' on date '${updatedDuty.date}' has been updated` });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while updating duty' });
    }
};

// @desc Delete a duty
// @route DELETE /duties
// @access Private
const deleteDuty = async (req, res) => {
    const { id } = req.body;

    // Confirm data
    if (!id) {
        return res.status(400).json({ message: 'Duty ID required' });
    }

    try {
        // Confirm duty exists to delete
        const duty = await Duty.findById(id).exec();

        if (!duty) {
            return res.status(400).json({ message: 'Duty not found' });
        }

        const result = await duty.deleteOne();

        const reply = `Duty for vessel '${result.vessel}' on date '${result.date}' with ID ${result._id} deleted`;

        res.json({ message: reply });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while deleting duty' });
    }
};

export default { getAllDuties, createNewDuty, updateDuty, deleteDuty };
