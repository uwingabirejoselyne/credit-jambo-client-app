import bcrypt from 'bcryptjs';
import { databaseConnection } from '../config/database.config';
import { Admin, AdminRole } from '../models/admin.model';
import { Customer } from '../models/customer.model';
import { hashData } from '../utils/crypto.util';

const seedDatabase = async () => {
  try {
    console.log('Connecting to database...');
    await databaseConnection.connect();
    console.log('Connected to database');

    // Create Super Admin
    console.log('\nCreating Super Admin...');
    const existingSuperAdmin = await Admin.findOne({ email: 'superadmin@creditjambo.com' });

    if (!existingSuperAdmin) {
      const hashedPassword = await bcrypt.hash('SuperAdmin123!', 12);
      const superAdmin = await Admin.create({
        firstName: 'Super',
        lastName: 'Admin',
        email: 'superadmin@creditjambo.com',
        phone: '+1000000000',
        password: hashedPassword,
        role: AdminRole.SUPER_ADMIN,
      });
      console.log('✓ Super Admin created');
      console.log(`  Email: ${superAdmin.email}`);
      console.log(`  Password: SuperAdmin123!`);
    } else {
      console.log('✓ Super Admin already exists');
    }

    // Create Regular Admin
    console.log('\nCreating Regular Admin...');
    const existingAdmin = await Admin.findOne({ email: 'admin@creditjambo.com' });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('Admin123!', 12);
      const admin = await Admin.create({
        firstName: 'Regular',
        lastName: 'Admin',
        email: 'admin@creditjambo.com',
        phone: '+1000000001',
        password: hashedPassword,
        role: AdminRole.ADMIN,
      });
      console.log('✓ Regular Admin created');
      console.log(`  Email: ${admin.email}`);
      console.log(`  Password: Admin123!`);
    } else {
      console.log('✓ Regular Admin already exists');
    }

    // Create Test Customer with Verified Device
    console.log('\nCreating Test Customer...');
    const existingCustomer = await Customer.findOne({ email: 'customer@test.com' });

    if (!existingCustomer) {
      const hashedPassword = await bcrypt.hash('Customer123!', 12);
      const deviceId = 'test-device-12345';
      const deviceIdHash = hashData(deviceId);

      const customer = await Customer.create({
        firstName: 'Test',
        lastName: 'Customer',
        email: 'customer@test.com',
        phone: '+1111111111',
        password: hashedPassword,
        balance: 1000, // Starting balance
        devices: [{
          deviceId,
          deviceIdHash,
          isVerified: true, // Pre-verified for testing
          verifiedAt: new Date(),
          createdAt: new Date(),
        }],
      });
      console.log('✓ Test Customer created');
      console.log(`  Email: ${customer.email}`);
      console.log(`  Password: Customer123!`);
      console.log(`  Device ID: ${deviceId}`);
      console.log(`  Balance: $${customer.balance}`);
    } else {
      console.log('✓ Test Customer already exists');
    }

    console.log('\n✅ Database seeding completed successfully!\n');
    console.log('📝 Test Credentials:');
    console.log('-------------------');
    console.log('Super Admin:');
    console.log('  Email: superadmin@creditjambo.com');
    console.log('  Password: SuperAdmin123!');
    console.log('\nRegular Admin:');
    console.log('  Email: admin@creditjambo.com');
    console.log('  Password: Admin123!');
    console.log('\nTest Customer:');
    console.log('  Email: customer@test.com');
    console.log('  Password: Customer123!');
    console.log('  Device ID: test-device-12345');
    console.log('-------------------\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
