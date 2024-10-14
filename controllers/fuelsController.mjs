import Fuel from '../models/Fuel.mjs';

// @desc Get all fuel entries
// @route GET /fuels
// @access Private
const getAllFuels = async (req, res) => {
    const { date } = req.query; // Get date from query parameters

    let fuels;

    if (date) {
        // If a date is provided, filter fuel entries by that date
        fuels = await Fuel.find({ date }).populate({
            path: 'vessel',
            populate: { path: 'user', select: 'username' }
        }).lean();
    } else {
        // If no date is specified, fetch all fuel entries
        fuels = await Fuel.find()
            .populate({
                path: 'vessel',
                populate: { path: 'user', select: 'username' }
            })
            .lean();
    }

    // If no fuel entries found
    if (!fuels?.length) {
        return res.status(400).json({ message: 'No fuel entries found' });
    }

    // Add vessel name to each fuel entry before sending the response
    const fuelsWithVessel = fuels.map(fuel => ({
        ...fuel,
        name: fuel.vessel.name, // Directly access the populated vessel's name
    }));

    res.json(fuelsWithVessel);
}

// @desc Create new fuel entry
// @route POST /fuels
// @access Private
const createNewFuel = async (req, res) => {
    const { vessel, date, fuels } = req.body;

    // Confirm data
    if (!vessel || !date || !fuels || fuels.length === 0) {
        return res.status(400).json({ message: 'All fields are required and must include fuel entries' });
    }

    // Check for duplicate date for the same vessel
    const duplicate = await Fuel.findOne({ vessel, date }).collation({ locale: 'en', strength: 2 }).lean().exec();

    if (duplicate) {
        return res.status(409).json({ message: 'This vessel already has a fuel entry for this date' });
    }

    // Create and store the new fuel entry
    const fuel = await Fuel.create({ vessel, date, fuels });

    if (fuel) { // Created
        return res.status(201).json({ message: 'New fuel entry has been created', fuel });
    } else {
        return res.status(400).json({ message: 'Invalid fuel data received' });
    }
}

// @desc Update a fuel entry
// @route PATCH /fuels
// @access Private
const updateFuel = async (req, res) => {
    const { id, vessel, date, fuels } = req.body;

    // Confirm data
    if (!id || !vessel || !date || !fuels || fuels.length === 0) {
        return res.status(400).json({ message: 'All fields are required and must include fuel entries' });
    }

    // Confirm fuel entry exists to update
    const fuel = await Fuel.findById(id).exec();

    if (!fuel) {
        return res.status(400).json({ message: 'Fuel entry not found' });
    }

    // Check for duplicate vessel and date
    const duplicate = await Fuel.findOne({ vessel, date }).collation({ locale: 'en', strength: 2 }).lean().exec();

    // Allow update only if no other entry exists for the same vessel and date
    if (duplicate && duplicate._id.toString() !== id) {
        return res.status(409).json({ message: 'Another fuel entry for this vessel already exists on this date' });
    }

    fuel.vessel = vessel;
    fuel.date = date;
    fuel.fuels = fuels; // Update the fuels array

    const updatedFuel = await fuel.save();

    res.json({ message: `Fuel entry for vessel '${updatedFuel.vessel}' on date '${updatedFuel.date}' has been updated`, fuel: updatedFuel });
}

// @desc Delete a fuel entry
// @route DELETE /fuels
// @access Private
const deleteFuel = async (req, res) => {
    const { id } = req.body;

    // Confirm data
    if (!id) {
        return res.status(400).json({ message: 'Fuel ID required' });
    }

    // Confirm fuel entry exists to delete
    const fuel = await Fuel.findById(id).exec();

    if (!fuel) {
        return res.status(400).json({ message: 'Fuel entry not found' });
    }

    const result = await fuel.deleteOne();

    const reply = `Fuel entry with date '${result.date}' and ID ${result._id} deleted`;

    res.json({ message: reply });
}

export default { 
    getAllFuels,
    createNewFuel,
    updateFuel,
    deleteFuel
}; 
