const User = require("../models/User");
const Website = require("../models/Website.Schema");
const Service = require("../models/Services.Schema");


exports.create = async (req, res) => {
    try {
        const { name, description, subCategories, metaCode } = req.body;
        console.log(req.body)
        const userId = req.user.id;

        if (!name || !metaCode) {
            return res.status(400).json({ success: false, message: "Name and metaCode are required" });
        }

        const userExists = await User.findById(userId);
        if (!userExists) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const websiteExists = await Website.findOne({metaCode});
        if (!websiteExists) {
            return res.status(404).json({ success: false, message: "Website not found" });
        }

       

        const newService = await Service.create({
            name,
            description,
            metaCode,
            userid: userId,
            subCategories: subCategories || [],
        });

        return res.status(201).json({
            success: true,
            message: "Service created successfully",
            data: newService,
        });
    } catch (error) {
        console.error("Create Service Error:", error);
        return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};


exports.getAll = async (req, res) => {
    try {
        const { metaCode } = req.query;

        if (!metaCode) {
            return res.status(400).json({ success: false, message: "metaCode is required" });
        }

        const services = await Service.find({ metaCode });

        return res.status(200).json({
            success: true,
            count: services.length,
            data: services,
        });
    } catch (error) {
        console.error("Get Services Error:", error);
        return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};


exports.getById = async (req, res) => {
    try {
        const { metaCode } = req.params;

        const service = await Service.findOne({ metaCode });
        if (!service) {
            return res.status(404).json({ success: false, message: "Service not found" });
        }

        return res.status(200).json({ success: true, data: service });
    } catch (error) {
        console.error("Get Service Error:", error);
        return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};


exports.update = async (req, res) => {
    try {
        const { id } = req.params;

        const updatedService = await Service.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedService) {
            return res.status(404).json({ success: false, message: "Service not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Service updated successfully",
            data: updatedService,
        });
    } catch (error) {
        console.error("Update Service Error:", error);
        return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

exports.remove = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await Service.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ success: false, message: "Service not found" });
        }

        return res.status(200).json({ success: true, message: "Service deleted successfully" });
    } catch (error) {
        console.error("Delete Service Error:", error);
        return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

exports.addSubCategory = async (req, res) => {
    try {
        const { id } = req.params; // service ID
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: "Subcategory name is required" });
        }

        const service = await Service.findById(id);
        if (!service) {
            return res.status(404).json({ success: false, message: "Service not found" });
        }

        service.subCategories.push({ name });
        await service.save();

        return res.status(200).json({
            success: true,
            message: "Subcategory added",
            data: service,
        });
    } catch (error) {
        console.error("Add Subcategory Error:", error);
        return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

exports.deleteSubCategory = async (req, res) => {
    try {
        const { serviceId, subCategoryIndex } = req.params;

        const service = await Service.findById(serviceId);
        if (!service) {
            return res.status(404).json({ success: false, message: "Service not found" });
        }

        if (subCategoryIndex < 0 || subCategoryIndex >= service.subCategories.length) {
            return res.status(400).json({ success: false, message: "Invalid subcategory index" });
        }

        service.subCategories.splice(subCategoryIndex, 1);
        await service.save();

        return res.status(200).json({
            success: true,
            message: "Subcategory deleted",
            data: service,
        });
    } catch (error) {
        console.error("Delete Subcategory Error:", error);
        return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};
