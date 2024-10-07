import User from '../models/User.mjs'
import Vessel from '../models/Vessel.mjs'


// @desc Get all vessels 
// @route GET /vessels
// @access Private
const getAllVessels = async (req, res) => {
    // Get all vessels from MongoDB
    const vessels = await Vessel.find().lean()

    // If no vessels 
    if (!vessels?.length) {
        return res.status(400).json({ message: 'No vessels found' })
    }

    // Add username to each vessel before sending the response 
    // See Promise.all with map() here: https://youtu.be/4lqJBBEpjRE 
    // You could also do this with a for...of loop
    const vesselsWithUser = await Promise.all(vessels.map(async (vessel) => {
        const user = await User.findById(vessel.user).lean().exec()
        return { ...vessel, username: user.username }
    }))

    res.json(vesselsWithUser)
}

// @desc Create new vessel
// @route POST /vessels
// @access Private
const createNewVessel = async (req, res) => {
    const { user, name, type } = req.body

    // Confirm data
    if (!user || !name || !type) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    // Check for duplicate name
    const duplicate = await Vessel.findOne({ name }).collation({ locale: 'en', strength: 2 }).lean().exec()

    if (duplicate) {
        return res.status(409).json({ message: 'Duplicate vessel name' })
    }

    // Create and store the new user 
    const vessel = await Vessel.create({ user, name, type })

    if (vessel) { // Created 
        return res.status(201).json({ message: 'New vessel created' })
    } else {
        return res.status(400).json({ message: 'Invalid vessel data received' })
    }

}

// @desc Update a vessel
// @route PATCH /vessels
// @access Private
const updateVessel = async (req, res) => {
    const { id, user, name, type, active } = req.body

    // Confirm data
    if (!id || !user || !name || !type || typeof active !== 'boolean') {
        return res.status(400).json({ message: 'All fields are required' })
    }

    // Confirm vessel exists to update
    const vessel = await Vessel.findById(id).exec()

    if (!vessel) {
        return res.status(400).json({ message: 'Vessel not found' })
    }

    // Check for duplicate name
    const duplicate = await Vessel.findOne({ name }).collation({ locale: 'en', strength: 2 }).lean().exec()

    // Allow renaming of the original vessel 
    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: 'Duplicate vessel name' })
    }

    vessel.user = user
    vessel.name = name
    vessel.type = type
    vessel.active = active

    const updatedVessel = await vessel.save()

    res.json(`'${updatedVessel.name}' updated`)
}

// @desc Delete a vessel
// @route DELETE /vessels
// @access Private
const deleteVessel = async (req, res) => {
    const { id } = req.body

    // Confirm data
    if (!id) {
        return res.status(400).json({ message: 'Vessel ID required' })
    }

    // Confirm vessel exists to delete 
    const vessel = await Vessel.findById(id).exec()

    if (!vessel) {
        return res.status(400).json({ message: 'Vessel not found' })
    }

    const result = await vessel.deleteOne()

    const reply = `Vessel '${result.name}' with ID ${result._id} deleted`

    res.json(reply)
}

export default { getAllVessels, createNewVessel, updateVessel, deleteVessel }