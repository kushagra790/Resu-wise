const mongoose = require('mongoose');

/**
 * MongoDB Connection Configuration
 */
const connectDB = async () => {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/resuwise';
  const maxRetries = 5;
  let retries = 0;

  const attemptConnection = async () => {
    try {
      const conn = await mongoose.connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 10000,
        maxPoolSize: 10,
        retryWrites: true
      });

      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      retries++;
      console.error(`❌ MongoDB Connection Error (Attempt ${retries}/${maxRetries}): ${error.message}`);
      
      if (retries < maxRetries) {
        console.log(`⏳ Retrying in 5 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
        return attemptConnection();
      } else {
        console.error(`❌ Failed to connect to MongoDB after ${maxRetries} attempts`);
        console.error(`📋 Connection string: ${MONGODB_URI.replace(/:[^:]*@/, ':****@')}`);
        console.error(`\n🔧 Troubleshooting steps:`);
        console.error(`1. Verify MongoDB Atlas cluster is running`);
        console.error(`2. Check your IP is whitelisted in MongoDB Atlas Network Access`);
        console.error(`3. Verify credentials in MONGODB_URI are correct`);
        console.error(`4. Check your internet connection`);
        process.exit(1);
      }
    }
  };

  return attemptConnection();
};

module.exports = connectDB;
