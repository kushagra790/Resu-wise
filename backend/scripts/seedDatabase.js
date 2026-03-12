require('dotenv').config();
const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');

const connectDB = require('../config/database');
const User = require('../models/User');

/**
 * Seed database with demo users
 */
const seedDatabase = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await connectDB();

    console.log('🗑️  Clearing existing demo users...');
    await User.deleteMany({ email: { $in: ['demo@example.com', 'test@example.com'] } });

    console.log('✍️  Creating demo users...');

    // Demo user 1
    const demoUser1 = await User.create({
      name: 'Demo User',
      email: 'demo@example.com',
      password: 'Demo@123456' // Will be hashed by the schema
    });

    console.log('✅ Demo User 1 created:');
    console.log(`   Email: demo@example.com`);
    console.log(`   Password: Demo@123456`);

    // Demo user 2
    const demoUser2 = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'Test@123456' // Will be hashed by the schema
    });

    console.log('\n✅ Demo User 2 created:');
    console.log(`   Email: test@example.com`);
    console.log(`   Password: Test@123456`);

    console.log('\n📊 Database seeding completed!');
    console.log(`✅ Total users in database: ${await User.countDocuments()}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();
