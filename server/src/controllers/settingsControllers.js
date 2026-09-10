import settingsModel from '../models/settingsModels.js'
import fs from 'fs';
import path from 'path';

const getSettings = async (req, res) => {
    try {
        const settings = await settingsModel.find({})
            .sort({ createdAt: -1 })
        const gender = settings.filter(
            item => item.type === 'gender'
        )
        const category = settings.filter(
            item => item.type === 'category'
        )
        const location = settings.filter(
            item => item.type === 'location'
        )
        res.json({success:true,gender,category,location})
    } catch (error) {
        console.log(error)
        res.status(500).json({success: false,message: 'Error fetching settings'})
    }
}

// add setting
const addSetting = async (req, res) => {
    try {
        const { type, name } = req.body
        // Check type
        if (!type) {
            return res.status(400).json({success: false,message: 'Setting type is required'})
        }
        // Check name
        if (!name || !name.trim()) {
            return res.status(400).json({success: false,message: 'Setting name is required'})
        }
        // Check valid type
        if (!['gender', 'category', 'location'].includes(type)) {
            return res.status(400).json({success: false,message: 'Invalid setting type'})
        }
        // Check if image is required
        if (type === 'category' && !req.file) {
            return res.status(400).json({success: false,message: 'Category image is required'});
        }
        // Check duplicate
        const exists = await settingsModel.findOne({
            type: type,
            name: {
                $regex: `^${name.trim()}$`,
                $options: 'i'
            }
        })
        if (exists) {
            return res.status(400).json({success: false,message: `${name.trim()} already exists`})
        }
        // Create setting
        const newSetting = new settingsModel({
            type: type,
            name: name.trim(),
            image: type === 'category' && req.file
                ? req.file.filename
                : ''
        })
        const setting = await newSetting.save()
        res.json({success: true,message: 'Setting added successfully',setting})
    } catch (error) {
        console.log(error)
        res.status(500).json({success: false,message: 'Error adding setting'})
    }
}

// update setting
const updateSetting = async (req, res) => {
    try {
        const { settingId } = req.params
        const { name } = req.body
        // Check name
        if (!name || !name.trim()) {
            return res.status(400).json({success: false,message: 'Setting name is required'})
        }
        const setting = await settingsModel.findById(settingId)
        if (!setting) {
            return res.status(404).json({success: false,message: 'Setting not found'})
        }
        // Check duplicate inside same type
        const exists = await settingsModel.findOne({
            type: setting.type,
            name: {
                $regex: `^${name.trim()}$`,
                $options: 'i'
            },
            _id: {
                $ne: settingId
            }
        })
        if (exists) {
            return res.status(400).json({success: false,message: `${name.trim()} already exists`})
        }
        setting.name = name.trim();
        if (setting.type === 'category' && req.file) {
            // Delete old image
            if (setting.image) {
                const oldImagePath = path.join(
                    'uploads',
                    setting.image
                );
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            setting.image = req.file.filename;
        }
        const updatedSetting = await setting.save()
        res.json({success: true,message: 'Setting updated successfully',setting: updatedSetting})
    } catch (error) {
        console.log(error)
        res.status(500).json({success: false,message: 'Error updating setting'})
    }
}

// delete setting
const deleteSetting = async (req, res) => {
    try {
        const { settingId } = req.params
        const setting = await settingsModel.findById(settingId)
        if (!setting) {
            return res.status(404).json({success: false,message: 'Setting not found'})
        }
        // Delete category image
        if (setting.type === 'category' && setting.image) {
            const imagePath = path.join(
                'uploads',
                setting.image
            );
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }
        await settingsModel.findByIdAndDelete(settingId)
        res.json({success: true,message: 'Setting deleted successfully'})
    } catch (error) {
        console.log(error)
        res.status(500).json({success: false,message: 'Error deleting setting'})
    }
}

export {getSettings,addSetting,updateSetting,deleteSetting}