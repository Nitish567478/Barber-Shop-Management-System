import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: './server/.env' });

import { Barber } from '../models/Barber.js';
import { Service } from '../models/Service.js';
import { User } from '../models/User.js';

const AFFORDABLE_SERVICES_TEMPLATE = [
  {
    name: 'Classic Haircut',
    description: 'Professional scissor and clipper cut tailored to your style with neck cleanup and styling.',
    price: 150,
    duration: 30,
    category: 'haircut',
    image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=800&q=80',
    points: ['Custom style consultation', 'Precision clipper & scissor cut', 'Neck hairline taper', 'Quick dry & tonic styling'],
    isActive: true,
  },
  {
    name: 'Modern Fade & Taper',
    description: 'Clean skin fade, low taper, or crop haircut with sharp temple lines.',
    price: 180,
    duration: 35,
    category: 'haircut',
    image: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=800&q=80',
    points: ['Zero/skin gradient blend', 'Razor sharp edge lineup', 'Textured crown finish', 'Cooling after-cut splash'],
    isActive: true,
  },
  {
    name: 'Clean Shave',
    description: 'Smooth straight razor or foil shave with warm foam and soothing post-shave balm.',
    price: 80,
    duration: 20,
    category: 'beard',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
    points: ['Warm lather preparation', 'Smooth razor glide', 'Cold towel refresh', 'Anti-irritation balm'],
    isActive: true,
  },
  {
    name: 'Beard Trim & Shape',
    description: 'Precision beard grooming, cheekline alignment, mustache trim, and conditioning oil.',
    price: 100,
    duration: 20,
    category: 'beard',
    image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=800&q=80',
    points: ['Length tapering', 'Cheek & neckline razor definition', 'Mustache grooming', 'Organic beard oil application'],
    isActive: true,
  },
  {
    name: 'Herbal Head Massage',
    description: 'Relaxing 20-minute scalp massage with soothing herbal oil to relieve tension and stress.',
    price: 120,
    duration: 20,
    category: 'hair care',
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80',
    points: ['Cooling herbal/almond oil', 'Pressure point scalp release', 'Neck relaxation', 'Warm towel wipe'],
    isActive: true,
  },
  {
    name: 'Refreshing Face Wash & Scrub',
    description: 'Deep pore facial cleansing to remove pollution, dead skin, and excess oil.',
    price: 150,
    duration: 25,
    category: 'face care',
    image: 'https://images.unsplash.com/photo-1570554520913-ce2192a74574?auto=format&fit=crop&w=800&q=80',
    points: ['Gentle exfoliating scrub', 'Warm steam cleansing', 'Charcoal/aloe wash', 'Moisturizing hydration cream'],
    isActive: true,
  },
  {
    name: 'Haircut + Beard Styling Combo',
    description: 'Complete grooming bundle: Classic haircut and beard shaping for a sharp gentleman look.',
    price: 220,
    duration: 45,
    category: 'combo',
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80',
    points: ['Full personalized haircut', 'Beard trim & razor lineup', 'Face rinse & blow dry', 'Pomade/clay styling'],
    isActive: true,
  },
  {
    name: 'Royal Grooming Combo',
    description: 'The complete salon experience: Haircut, Beard Trim/Shave, Face Wash, and Head Massage.',
    price: 350,
    duration: 60,
    category: 'combo',
    image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=800&q=80',
    points: ['Haircut with modern styling', 'Straight razor shave or beard sculpt', 'Deep cleansing face wash', 'Aromatic oil head massage'],
    isActive: true,
  },
];

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // 1. Delete all unassigned services (where barberId is null or missing)
  const delUnassigned = await Service.deleteMany({
    $or: [{ barberId: null }, { barberId: { $exists: false } }]
  });
  console.log(`Deleted ${delUnassigned.deletedCount} unassigned / mock services.`);

  // 2. Delete any remaining expensive services (> 500)
  const delExpensive = await Service.deleteMany({ price: { $gt: 500 } });
  console.log(`Deleted ${delExpensive.deletedCount} expensive services (> Rs. 500).`);

  // 3. For each registered barber, ensure they have the affordable services
  const barbers = await Barber.find().populate('userId', 'name');
  console.log(`Found ${barbers.length} barbers in database.`);

  for (const barber of barbers) {
    const existingCount = await Service.countDocuments({ barberId: barber._id });
    console.log(`Barber "${barber.shopName || barber.userId?.name}" (ID: ${barber._id}) has ${existingCount} services.`);

    if (existingCount < 5) {
      console.log(`  -> Seeding affordable services for "${barber.shopName || barber.userId?.name}"...`);
      for (const item of AFFORDABLE_SERVICES_TEMPLATE) {
        const alreadyHas = await Service.findOne({ barberId: barber._id, name: item.name });
        if (!alreadyHas) {
          await Service.create({
            ...item,
            barberId: barber._id,
          });
        }
      }
      const newCount = await Service.countDocuments({ barberId: barber._id });
      console.log(`  -> Now has ${newCount} services.`);
    }
  }

  // Print final summary
  const totalServices = await Service.find().populate({
    path: 'barberId',
    populate: { path: 'userId', select: 'name' }
  });
  console.log('\n--- FINAL SERVICES IN DATABASE ---');
  console.log(`Total Services: ${totalServices.length}`);
  for (const s of totalServices) {
    const bName = s.barberId?.shopName || s.barberId?.userId?.name || 'UNKNOWN';
    console.log(`[${bName}] ${s.name} - Rs. ${s.price} (${s.duration}m) - ID: ${s._id}`);
  }

  await mongoose.disconnect();
  console.log('\nDone!');
}

run().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
