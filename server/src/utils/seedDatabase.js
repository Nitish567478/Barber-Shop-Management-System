import { User } from '../models/User.js';
import { Service } from '../models/Service.js';
import { Barber } from '../models/Barber.js';
import { Appointment } from '../models/Appointment.js';
import { Invoice } from '../models/Invoice.js';
import { generateInvoiceNumber, hashPassword } from '../utils/helpers.js';

export const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Service.deleteMany({});
    await Barber.deleteMany({});
    await Appointment.deleteMany({});
    await Invoice.deleteMany({});

    // Create Services
    const services = await Service.insertMany([
      {
        name: 'Classic Haircut',
        description: 'Traditional haircut with professional styling',
        price: 500,
        duration: 30,
        category: 'haircut',
        isActive: true,
      },
      {
        name: 'Modern Style Haircut',
        description: 'Trendy modern haircut with fade or undercut',
        price: 700,
        duration: 45,
        category: 'haircut',
        isActive: true,
      },
      {
        name: 'Clean Shave',
        description: 'Professional shaving with hot towel service',
        price: 300,
        duration: 30,
        category: 'shaving',
        isActive: true,
      },
      {
        name: 'Beard Trim & Shape',
        description: 'Expert beard trimming and shaping',
        price: 400,
        duration: 25,
        category: 'grooming',
        isActive: true,
      },
      {
        name: 'Hair Coloring',
        description: 'Professional hair coloring service',
        price: 1500,
        duration: 60,
        category: 'coloring',
        isActive: true,
      },
      {
        name: 'Haircut + Shave Combo',
        description: 'Complete grooming package - haircut and shave',
        price: 750,
        duration: 60,
        category: 'grooming',
        isActive: true,
      },
      {
        name: 'Head Massage',
        description: 'Relaxing head and neck massage',
        price: 300,
        duration: 20,
        category: 'treatment',
        isActive: true,
      },
    ]);

    console.log(`✓ Created ${services.length} services`);

    // Create Users (Admin, Barbers, and Customers)
    const hashedPassword = await hashPassword('password123');

    // Admin User (Hard-coded credentials)
    const adminUser = await User.create({
      name: 'Nitish Admin',
      email: 'admin.nitish@gmail.com',
      password: await hashPassword('nitishAdmin@123'),
      phone: '+92-300-0000001',
      role: 'admin',
      isActive: true,
    });

    // Barber Users
    const barber1 = await User.create({
      name: 'Barber Ali',
      email: 'ali@barbershop.com',
      password: hashedPassword,
      phone: '+92-300-1111111',
      role: 'barber',
      isActive: true,
    });

    const barber2 = await User.create({
      name: 'Barber Hassan',
      email: 'hassan@barbershop.com',
      password: hashedPassword,
      phone: '+92-300-2222222',
      role: 'barber',
      isActive: true,
    });

    const barber3 = await User.create({
      name: 'Barber Bilal',
      email: 'bilal@barbershop.com',
      password: hashedPassword,
      phone: '+92-300-3333333',
      role: 'barber',
      isActive: true,
    });

    const barber4 = await User.create({
      name: 'Barber Usman',
      email: 'usman@barbershop.com',
      password: hashedPassword,
      phone: '+92-300-4444444',
      role: 'barber',
      isActive: true,
    });

    const barber5 = await User.create({
      name: 'Barber Fahad',
      email: 'fahad@barbershop.com',
      password: hashedPassword,
      phone: '+92-300-5555555',
      role: 'barber',
      isActive: true,
    });

    const barber6 = await User.create({
      name: 'Barber Saad',
      email: 'saad@barbershop.com',
      password: hashedPassword,
      phone: '+92-300-6666666',
      role: 'barber',
      isActive: true,
    });

    const barber7 = await User.create({
      name: 'Barber Hamza',
      email: 'hamza@barbershop.com',
      password: hashedPassword,
      phone: '+92-300-7777777',
      role: 'barber',
      isActive: true,
    });

    // Customer Users
    const customer1 = await User.create({
      name: 'Ahmed Khan',
      email: 'ahmed@email.com',
      password: hashedPassword,
      phone: '+92-300-4444444',
      role: 'customer',
      isActive: true,
    });

    const customer2 = await User.create({
      name: 'Ali Raza',
      email: 'ali@email.com',
      password: hashedPassword,
      phone: '+92-300-5555555',
      role: 'customer',
      isActive: true,
    });

    const customer3 = await User.create({
      name: 'Fatima Ahmed',
      email: 'fatima@email.com',
      password: hashedPassword,
      phone: '+92-300-6666666',
      role: 'customer',
      isActive: true,
    });

    console.log('✓ Created 1 Admin, 7 Barbers, and 3 Customers');

    // Create Barber Profiles
    const barberProfiles = await Barber.insertMany([
      {
        userId: barber1._id,
        specialization: ['haircut', 'shaving', 'coloring'],
        experience: 8,
        rating: 4.8,
        isActive: true,
      },
      {
        userId: barber2._id,
        specialization: ['haircut', 'grooming', 'beard'],
        experience: 6,
        rating: 4.6,
        isActive: true,
      },
      {
        userId: barber3._id,
        specialization: ['haircut', 'treatment', 'shaving'],
        experience: 5,
        rating: 4.5,
        isActive: true,
      },
      {
        userId: barber4._id,
        specialization: ['haircut', 'coloring', 'styling'],
        experience: 7,
        rating: 4.7,
        isActive: true,
      },
      {
        userId: barber5._id,
        specialization: ['shaving', 'grooming', 'beard'],
        experience: 9,
        rating: 4.9,
        isActive: true,
      },
      {
        userId: barber6._id,
        specialization: ['haircut', 'fade', 'modern style'],
        experience: 4,
        rating: 4.4,
        isActive: true,
      },
      {
        userId: barber7._id,
        specialization: ['coloring', 'treatment', 'styling'],
        experience: 6,
        rating: 4.6,
        isActive: true,
      },
    ]);

    console.log(`✓ Created ${barberProfiles.length} barber profiles`);

    // Create Appointments
    const now = new Date();
    const appointments = await Appointment.insertMany([
      {
        customerId: customer1._id,
        barberId: barberProfiles[0]._id,
        serviceId: services[0]._id,
        appointmentDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
        appointmentTime: '10:00',
        duration: 30,
        status: 'scheduled',
        price: 500,
        notes: 'Regular haircut',
      },
      {
        customerId: customer1._id,
        barberId: barberProfiles[1]._id,
        serviceId: services[3]._id,
        appointmentDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        appointmentTime: '14:30',
        duration: 25,
        status: 'scheduled',
        price: 400,
        notes: 'Beard trim',
      },
      {
        customerId: customer1._id,
        barberId: barberProfiles[0]._id,
        serviceId: services[0]._id,
        appointmentDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        appointmentTime: '11:00',
        duration: 30,
        status: 'completed',
        price: 500,
      },
      {
        customerId: customer2._id,
        barberId: barberProfiles[2]._id,
        serviceId: services[1]._id,
        appointmentDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
        appointmentTime: '09:00',
        duration: 45,
        status: 'scheduled',
        price: 700,
        notes: 'Modern fade haircut',
      },
      {
        customerId: customer3._id,
        barberId: barberProfiles[4]._id,
        serviceId: services[6]._id,
        appointmentDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        appointmentTime: '16:00',
        duration: 20,
        status: 'scheduled',
        price: 300,
      },
      {
        customerId: customer2._id,
        barberId: barberProfiles[5]._id,
        serviceId: services[2]._id,
        appointmentDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        appointmentTime: '10:30',
        duration: 30,
        status: 'completed',
        price: 300,
      },
      {
        customerId: customer1._id,
        barberId: barberProfiles[6]._id,
        serviceId: services[4]._id,
        appointmentDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        appointmentTime: '13:00',
        duration: 60,
        status: 'scheduled',
        price: 1500,
        notes: 'Hair coloring session',
      },
    ]);

    console.log(`✓ Created ${appointments.length} appointments`);

    // Create Invoices
    const invoices = await Invoice.insertMany([
      {
        customerId: customer1._id,
        barberId: barberProfiles[0]._id,
        appointmentId: appointments[2]._id,
        invoiceNumber: generateInvoiceNumber(),
        amount: 500,
        paymentStatus: 'completed',
        paymentMethod: 'cash',
      },
      {
        customerId: customer1._id,
        barberId: barberProfiles[1]._id,
        appointmentId: appointments[0]._id,
        invoiceNumber: generateInvoiceNumber(),
        amount: 500,
        paymentStatus: 'pending',
      },
      {
        customerId: customer2._id,
        barberId: barberProfiles[2]._id,
        appointmentId: appointments[5]._id,
        invoiceNumber: generateInvoiceNumber(),
        amount: 300,
        paymentStatus: 'completed',
        paymentMethod: 'card',
      },
      {
        customerId: customer2._id,
        barberId: barberProfiles[2]._id,
        appointmentId: appointments[3]._id,
        invoiceNumber: generateInvoiceNumber(),
        amount: 700,
        paymentStatus: 'pending',
      },
      {
        customerId: customer3._id,
        barberId: barberProfiles[4]._id,
        appointmentId: appointments[4]._id,
        invoiceNumber: generateInvoiceNumber(),
        amount: 300,
        paymentStatus: 'pending',
      },
      {
        customerId: customer1._id,
        barberId: barberProfiles[6]._id,
        appointmentId: appointments[6]._id,
        invoiceNumber: generateInvoiceNumber(),
        amount: 1500,
        paymentStatus: 'pending',
      },
    ]);

    console.log(`✓ Created ${invoices.length} invoices`);

    console.log('\n✅ Database seeding completed successfully!\n');
    console.log('Test Credentials:');
    console.log('Admin: admin.nitish@gmail.com / nitishAdmin@123');
    console.log('Barber: ali@barbershop.com / password123');
    console.log('Customer: ahmed@email.com / password123');
    return true;
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    throw error;
  }
};
