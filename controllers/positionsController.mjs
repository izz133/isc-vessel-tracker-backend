import Position from '../models/Position.mjs'

// @desc Get all positions
// @route GET /positions
// @access Private
const getAllPositions = async (req, res) => {
    const { date } = req.query; // Get date from query parameters

    let positions;

    if (date) {
        // If a date is provided, filter positions by that date
        positions = await Position.find({ date }).populate({
            path: 'vessel',
            populate: { path: 'user', select: 'username' }
        }).lean();
    } else {
        // If no date is specified, fetch all positions
        positions = await Position.find()
            .populate({
                path: 'vessel',
                populate: { path: 'user', select: 'username' }
            })
            .lean();
    }

    // If no positions found
    if (!positions?.length) {
        return res.status(400).json({ message: 'No positions found' });
    }

    // Add vessel name to each position before sending the response
    const positionsWithVessel = positions.map(position => ({
        ...position,
        name: position.vessel.name, // Directly access the populated vessel's name
    }));

    res.json(positionsWithVessel);
}

// @desc Create new position
// @route POST /positions
// @access Private
const createNewPosition = async (req, res) => {
    const { vessel, date, positions } = req.body

    // Confirm data
    if (!vessel || !date || !positions || positions.length !== 4) {
        return res.status(400).json({ message: 'All fields are required and must include 4 position entries' })
    }

    // Check for duplicate date
    const duplicate = await Position.findOne({ vessel, date }).collation({ locale: 'en', strength: 2 }).lean().exec();

    if (duplicate) {
        return res.status(409).json({ message: 'This vessel already has a position entry for this date' });
    }

    // Create and store the new position
    const position = await Position.create({ vessel, date, positions })

    if (position) { // Created
        return res.status(201).json({ message: 'New position entry has been entered' })
    } else {
        return res.status(400).json({ message: 'Invalid positions data received' })
    }
}

// @desc Update a position
// @route PATCH /positions
// @access Private
const updatePosition = async (req, res) => {
    const { id, vessel, date, positions } = req.body

    // Confirm data
    if (!id || !vessel || !date || !positions || positions.length !== 4) {
        return res.status(400).json({ message: 'All fields are required and must include 4 position entries' })
    }

    // Confirm position exists to update
    const position = await Position.findById(id).exec()

    if (!position) {
        return res.status(400).json({ message: 'Position not found' })
    }

    // Check for duplicate vessel and date
    const duplicate = await Position.findOne({ vessel, date }).collation({ locale: 'en', strength: 2 }).lean().exec();

    // Allow update only if no other entry exists for the same vessel and date
    if (duplicate && duplicate._id.toString() !== id) {
        return res.status(409).json({ message: 'Another position for this vessel already exists on this date' });
    }

    position.vessel = vessel
    position.date = date
    position.positions = positions

    const updatedPosition = await position.save()

    res.json({ message: `Position for vessel '${updatedPosition.vessel}' on date '${updatedPosition.date}' has been updated` });
}

// @desc Delete a position
// @route DELETE /positions
// @access Private
const deletePosition = async (req, res) => {
    const { id } = req.body

    // Confirm data
    if (!id) {
        return res.status(400).json({ message: 'Position ID required' })
    }

    // Confirm position exists to delete
    const position = await Position.findById(id).exec()

    if (!position) {
        return res.status(400).json({ message: 'Position not found' })
    }

    const result = await position.deleteOne()

    const reply = `Position with date '${result.date}' and ID ${result._id} deleted`

    res.json({ message: reply })
}

export default { getAllPositions, createNewPosition, updatePosition, deletePosition }
