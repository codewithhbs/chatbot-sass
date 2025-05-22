const ComplaintSchema = require("../models/ComplaintSchema");


exports.getComplaintsViaChatBotId = async (req, res) => {
    try {

        const { metacode, page = 1, limit = 10, search = "" } = req.query;

        if (!metacode) {
            return res.status(400).json({ message: "Meta code is required" });
        }

        const filter = {
            metaCode: metacode,
            $or: [
                { name: { $regex: search, $options: 'i' } },
                { selectedCategory: { $regex: search, $options: 'i' } },
                { selectedService: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
            ]
        };

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const total = await ComplaintSchema.countDocuments(filter);
        const bookings = await ComplaintSchema.find(filter)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Complaints fetched successfully",
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / limit),
            bookings
        });


    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: error
        });

    }
}



exports.changeStatusOfComplaints = async (req, res) => {
    try {
        const { id, status } = req.body;
        if (!id || !status) {
            return res.status(400).json({ message: "Complaint ID and status are required" });
        }
        const allowedStatuses = ['pending', 'in-progress', 'resolved', 'rejected']
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }
        const complaint = await ComplaintSchema.findById(id);
        if (!complaint) {
            return res.status(404).json({ message: "Complaint not found" });
        }
        complaint.status = status;
        await complaint.save();
        return res.status(200).json({
            message: "Complaint status updated successfully",
            complaint
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: error
        });

    }
}