const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

// Load environment variables
dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/student_management', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Clear existing admin and club coordinator data
    await User.deleteMany({ role: { $in: ['admin', 'club_coordinator'] } });

    // Admin users
    const adminUsers = [
      {
        name: 'System Administrator',
        email: 'admin@college.edu',
        password: 'admin123',
        role: 'admin',
        department: 'Computer Science',
        phone: '+1234567890'
      },
      {
        name: 'John Smith',
        email: 'john.admin@college.edu',
        password: 'admin123',
        role: 'admin',
        department: 'Administration',
        phone: '+1234567891'
      }
    ];

    // Club coordinator users
    const clubCoordinators = [
      {
        name: 'Alice Johnson',
        email: 'alice.coord@college.edu',
        password: 'coord123',
        role: 'club_coordinator',
        clubName: 'Computer Science Club',
        department: 'Computer Science',
        phone: '+1234567892'
      },
      {
        name: 'Bob Wilson',
        email: 'bob.coord@college.edu',
        password: 'coord123',
        role: 'club_coordinator',
        clubName: 'Electronics Club',
        department: 'Electronics Engineering',
        phone: '+1234567893'
      },
      {
        name: 'Carol Davis',
        email: 'carol.coord@college.edu',
        password: 'coord123',
        role: 'club_coordinator',
        clubName: 'Drama Club',
        department: 'Arts & Literature',
        phone: '+1234567894'
      },
      {
        name: 'David Brown',
        email: 'david.coord@college.edu',
        password: 'coord123',
        role: 'club_coordinator',
        clubName: 'Sports Club',
        department: 'Physical Education',
        phone: '+1234567895'
      },
      {
        name: 'Emma Taylor',
        email: 'emma.coord@college.edu',
        password: 'coord123',
        role: 'club_coordinator',
        clubName: 'Music Club',
        department: 'Music & Arts',
        phone: '+1234567896'
      },
      {
        name: 'Frank Miller',
        email: 'frank.coord@college.edu',
        password: 'coord123',
        role: 'club_coordinator',
        clubName: 'Debate Club',
        department: 'Liberal Arts',
        phone: '+1234567897'
      }
    ];

    // Create admin users
    for (const adminData of adminUsers) {
      const admin = new User(adminData);
      await admin.save();
      console.log(`Created admin: ${admin.name} (${admin.email})`);
    }

    // Create club coordinators
    for (const coordData of clubCoordinators) {
      const coordinator = new User(coordData);
      await coordinator.save();
      console.log(`Created club coordinator: ${coordinator.name} (${coordinator.email}) - ${coordinator.clubName}`);
    }

    console.log('\n=== SEEDING COMPLETED ===');
    console.log('\nLogin Credentials:');
    console.log('\n--- ADMIN ACCOUNTS ---');
    adminUsers.forEach(admin => {
      console.log(`Email: ${admin.email} | Password: ${admin.password}`);
    });
    
    console.log('\n--- CLUB COORDINATOR ACCOUNTS ---');
    clubCoordinators.forEach(coord => {
      console.log(`Email: ${coord.email} | Password: ${coord.password} | Club: ${coord.clubName}`);
    });

    console.log('\n--- STUDENTS ---');
    console.log('Students can register through the signup page');

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    mongoose.disconnect();
  }
};

const runSeed = async () => {
  await connectDB();
  await seedData();
};

runSeed();