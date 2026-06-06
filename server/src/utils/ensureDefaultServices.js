import { Service } from '../models/Service.js';

const DEFAULT_SERVICES = [
  {
    name: 'Classic Haircut',
    description: 'Traditional haircut with professional styling.',
    price: 550,
    duration: 30,
    category: 'haircut',
    isActive: true,
  },
  {
    name: 'Modern Style Haircut',
    description: 'Modern cut with fade or undercut styling.',
    price: 250,
    duration: 45,
    category: 'haircut',
    isActive: true,
  },
  {
    name: 'Clean Shave',
    description: 'Professional shaving service with clean finishing.',
    price: 100,
    duration: 30,
    category: 'shaving',
    isActive: true,
  },
  {
    name: 'Beard Trim & Shape',
    description: 'Defined beard trimming and shape-up service.',
    price: 200,
    duration: 25,
    category: 'grooming',
    isActive: true,
  },
];

export const ensureDefaultServices = async () => {
  const existingServices = await Service.countDocuments({ isActive: true });

  if (existingServices > 0) {
    return;
  }

  await Service.insertMany(DEFAULT_SERVICES);
  console.log(`Inserted ${DEFAULT_SERVICES.length} default service(s) for customer booking`);
};

export default ensureDefaultServices;
