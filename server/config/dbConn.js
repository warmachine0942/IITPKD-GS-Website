require('dotenv').config()
const mongoose = require('mongoose')

const connectDB = async () => {
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI is missing. Set it in server/.env before starting the API.');
    }

    await mongoose.connect(process.env.MONGO_URI, {
        dbName: process.env.DB_NAME || 'Members',
        serverSelectionTimeoutMS: 10000,
    });
}

module.exports = connectDB
