import DhMachine from '../models/DhMachine.mjs'

// @desc Get all dhMachines
// @route GET /dhMachines
// @access Private
const getAllDhMachines = async (req, res) => {
    const { date } = req.query; // Get date from query parameters

    let dhMachines;

    if (date) {
        // If a date is provided, filter dhMachines by that date
        dhMachines = await DhMachine.find({ date }).populate({
            path: 'vessel',
            populate: { path: 'user', select: 'username' }
        }).lean();
    } else {
        // If no date is specified, fetch all dhMachines
        dhMachines = await DhMachine.find()
            .populate({
                path: 'vessel',
                populate: { path: 'user', select: 'username' }
            })
            .lean();
    }

    // If no dhMachines found
    if (!dhMachines?.length) {
        return res.status(400).json({ message: 'No DH Machines found' });
    }

    // Add vessel name to each dhMachine before sending the response
    const dhMachinesWithVessel = dhMachines.map(dhMachine => ({
        ...dhMachine,
        name: dhMachine.vessel.name, // Directly access the populated vessel's name
    }));

    res.json(dhMachinesWithVessel);
}

// @desc Create new dhMachine entry
// @route POST /dhMachines
// @access Private
const createNewDhMachine = async (req, res) => {
    const { vessel, date, dhMachines } = req.body

    // Confirm data
    if (!vessel || !date || !dhMachines || dhMachines.length === 0) {
        return res.status(400).json({ message: 'All fields are required and must include DH machine entries' });
    }

    // Check for duplicate date
    const duplicate = await DhMachine.findOne({ vessel, date }).collation({ locale: 'en', strength: 2 }).lean().exec();

    if (duplicate) {
        return res.status(409).json({ message: 'This vessel already has a DH machine entry for this date' });
    }

    // Create and store the new dhMachine entry
    const dhMachine = await DhMachine.create({ vessel, date, dhMachines });

    if (dhMachine) { // Created
        return res.status(201).json({ message: 'New DH machine entry has been entered' });
    } else {
        return res.status(400).json({ message: 'Invalid DH machine data received' });
    }
}

// @desc Update a dhMachine entry
// @route PATCH /dhMachines
// @access Private
const updateDhMachine = async (req, res) => {
    const { id, vessel, date, dhMachines } = req.body

    // Confirm data
    if (!id || !vessel || !date || !dhMachines || dhMachines.length === 0) {
        return res.status(400).json({ message: 'All fields are required and must include DH machine entries' });
    }

    // Confirm dhMachine entry exists to update
    const dhMachine = await DhMachine.findById(id).exec();

    if (!dhMachine) {
        return res.status(400).json({ message: 'DH machine entry not found' });
    }

    // Check for duplicate vessel and date
    const duplicate = await DhMachine.findOne({ vessel, date }).collation({ locale: 'en', strength: 2 }).lean().exec();

    // Allow update only if no other entry exists for the same vessel and date
    if (duplicate && duplicate._id.toString() !== id) {
        return res.status(409).json({ message: 'Another DH machine entry for this vessel already exists on this date' });
    }

    dhMachine.vessel = vessel;
    dhMachine.date = date;
    dhMachine.dhMachines = dhMachines;

    const updatedDhMachine = await dhMachine.save();

    res.json({ message: `DH machine entry for vessel '${updatedDhMachine.vessel}' on date '${updatedDhMachine.date}' has been updated` });
}

// @desc Delete a dhMachine entry
// @route DELETE /dhMachines
// @access Private
const deleteDhMachine = async (req, res) => {
    const { id } = req.body;

    // Confirm data
    if (!id) {
        return res.status(400).json({ message: 'DH machine ID required' });
    }

    // Confirm dhMachine entry exists to delete
    const dhMachine = await DhMachine.findById(id).exec();

    if (!dhMachine) {
        return res.status(400).json({ message: 'DH machine entry not found' });
    }

    const result = await dhMachine.deleteOne();

    const reply = `DH machine entry with date '${result.date}' and ID ${result._id} deleted`;

    res.json({ message: reply });
}

export default { 
    getAllDhMachines,
    createNewDhMachine,
    updateDhMachine,
    deleteDhMachine };
