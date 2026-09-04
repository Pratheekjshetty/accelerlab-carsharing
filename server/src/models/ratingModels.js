import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    carId: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comments: { type: String, required: true },
    date: { type: Date, default: Date.now() },
    adminResponse: { type: String, default: '' },
})

const ratingModel = mongoose.models.rating || mongoose.model('rating', ratingSchema);
export default ratingModel;
