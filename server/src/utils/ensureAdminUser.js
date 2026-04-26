import { User } from '../models/User.js';
import { hashPassword } from './helpers.js';

const DEFAULT_ADMIN = {
  name: 'Nitish Admin',
  email: 'admin.nitish@gmail.com',
  password: 'nitishAdmin@123',
  phone: '+92-300-0000001',
  role: 'admin',
  isActive: true,
};

const repairUserEmailState = async () => {
  const invalidEmailFilter = {
    $or: [
      { email: null },
      { email: '' },
      { email: { $exists: false } },
    ],
  };

  const invalidUsers = await User.find(invalidEmailFilter).select('_id email name');
  if (invalidUsers.length > 0) {
    await User.deleteMany(invalidEmailFilter);
    console.log(`Removed ${invalidUsers.length} invalid user record(s) with missing email before syncing indexes`);
  }
};

export const ensureAdminUser = async () => {
  await repairUserEmailState();

  // Keep MongoDB indexes aligned with the current schema after cleanup.
  await User.syncIndexes();

  const email = DEFAULT_ADMIN.email.toLowerCase();
  const existingAdmin = await User.findOne({ email });

  if (existingAdmin) {
    return existingAdmin;
  }

  const adminUser = await User.create({
    ...DEFAULT_ADMIN,
    email,
    password: await hashPassword(DEFAULT_ADMIN.password),
  });

  console.log(`Admin account created for ${email}`);
  return adminUser;
};

export default ensureAdminUser;
