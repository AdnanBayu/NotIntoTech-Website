const mongoose = require('mongoose');
require('dotenv').config();

const url = process.env.MONGODB_URI

const connectDB = async () => {
    try {
        if (!url) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }

        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(url, {
                dbName: 'notintotech-website'
            });
            // console.log('Database is connected to: mongo notintotech-website');
        }
    } catch (err) {
        console.error('Error connecting to the mongo database:', err.message);
    }
};

module.exports = connectDB;