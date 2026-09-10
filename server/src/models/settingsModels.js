import mongoose from 'mongoose'

const settingsSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['gender', 'category', 'location']
    },
    name: {
        type: String,
        required: true,
        trim: true
    }
}, {
    timestamps: true
})

const settingsModel = mongoose.models.settings || mongoose.model('settings', settingsSchema)
export default settingsModel