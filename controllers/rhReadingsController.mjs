import RhReading from '../models/RhReading.mjs';

// @desc Get all RH readings
// @route GET /rhReadings
// @access Private
const getAllRhReadings = async (req, res) => {
    const { date } = req.query; // Get date from query parameters

    let rhReadings;

    if (date) {
        // If a date is provided, filter rhReadings by that date
        rhReadings = await RhReading.find({ date }).populate({
            path: 'vessel',
            populate: { path: 'user', select: 'username' }
        }).lean();
    } else {
        // If no date is specified, fetch all rhReadings
        rhReadings = await RhReading.find()
            .populate({
                path: 'vessel',
                populate: { path: 'user', select: 'username' }
            })
            .lean();
    }

    // If no rhReadings found
    if (!rhReadings?.length) {
        return res.status(400).json({ message: 'No RH readings found' });
    }

    // Add vessel name to each rhReading before sending the response
    const rhReadingsWithVessel = rhReadings.map(rhReading => ({
        ...rhReading,
        name: rhReading.vessel.name, // Directly access the populated vessel's name
    }));

    res.json(rhReadingsWithVessel);
}

// @desc Create new RH reading entry
// @route POST /rhReadings
// @access Private
const createNewRhReading = async (req, res) => {
    const { vessel, date, rhReadings } = req.body;

    // Confirm data
    if (!vessel || !date || !rhReadings || rhReadings.length === 0) {
        return res.status(400).json({ message: 'All fields are required and must include RH reading entries' });
    }

    // Check for duplicate date
    const duplicate = await RhReading.findOne({ vessel, date }).collation({ locale: 'en', strength: 2 }).lean().exec();

    if (duplicate) {
        return res.status(409).json({ message: 'This vessel already has an RH reading entry for this date' });
    }

    // Create and store the new RH reading entry
    const rhReading = await RhReading.create({ vessel, date, rhReadings });

    if (rhReading) { // Created
        return res.status(201).json({ message: 'New RH reading entry has been entered' });
    } else {
        return res.status(400).json({ message: 'Invalid RH reading data received' });
    }
}

// @desc Update an RH reading entry
// @route PATCH /rhReadings
// @access Private
const updateRhReading = async (req, res) => {
    const { id, vessel, date, rhReadings } = req.body;

    // Confirm data
    if (!id || !vessel || !date || !rhReadings || rhReadings.length === 0) {
        return res.status(400).json({ message: 'All fields are required and must include RH reading entries' });
    }

    // Confirm RH reading entry exists to update
    const rhReading = await RhReading.findById(id).exec();

    if (!rhReading) {
        return res.status(400).json({ message: 'RH reading entry not found' });
    }

    // Check for duplicate vessel and date
    const duplicate = await RhReading.findOne({ vessel, date }).collation({ locale: 'en', strength: 2 }).lean().exec();

    // Allow update only if no other entry exists for the same vessel and date
    if (duplicate && duplicate._id.toString() !== id) {
        return res.status(409).json({ message: 'Another RH reading entry for this vessel already exists on this date' });
    }

    rhReading.vessel = vessel;
    rhReading.date = date;
    rhReading.rhReadings = rhReadings;

    const updatedRhReading = await rhReading.save();

    res.json({ message: `RH reading entry for vessel '${updatedRhReading.vessel}' on date '${updatedRhReading.date}' has been updated` });
}

// @desc Delete an RH reading entry
// @route DELETE /rhReadings
// @access Private
const deleteRhReading = async (req, res) => {
    const { id } = req.body;

    // Confirm data
    if (!id) {
        return res.status(400).json({ message: 'RH reading ID required' });
    }

    // Confirm RH reading entry exists to delete
    const rhReading = await RhReading.findById(id).exec();

    if (!rhReading) {
        return res.status(400).json({ message: 'RH reading entry not found' });
    }

    const result = await rhReading.deleteOne();

    const reply = `RH reading entry with date '${result.date}' and ID ${result._id} deleted`;

    res.json({ message: reply });
}

export default { 
    getAllRhReadings,
    createNewRhReading,
    updateRhReading,
    deleteRhReading
};
