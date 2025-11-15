import dataSource from '../../config/typeorm.config';
import { User } from '../../entities/user.entity';
import { Section } from '../../entities/section.entity';
import { Shift } from '../../entities/shift.entity';
import { Role } from '../../entities/role.entity';
import * as bcrypt from 'bcrypt';

async function seed() {
  try {
    await dataSource.initialize();
    console.log('Database connection initialized');

    // Run migrations or synchronize schema
    await dataSource.synchronize();
    console.log('Database schema synchronized');

    const roleRepo = dataSource.getRepository(Role);
    const sectionRepo = dataSource.getRepository(Section);
    const shiftRepo = dataSource.getRepository(Shift);
    const userRepo = dataSource.getRepository(User);

    // Seed Roles
    const roleNames = ['SuperAdmin', 'Admin', 'User'];
    const roles: Role[] = [];

    for (const name of roleNames) {
      let role = await roleRepo.findOne({ where: { name } });
      if (!role) {
        role = roleRepo.create({ name });
        await roleRepo.save(role);
        console.log(`Role created: ${name}`);
      }
      roles.push(role);
    }

    // Seed Sections
    const sectionNames = ['CCS', 'BAF', 'Slitter'];
    const sections: Section[] = [];

    for (const name of sectionNames) {
      let section = await sectionRepo.findOne({ where: { name } });
      if (!section) {
        section = sectionRepo.create({ name });
        await sectionRepo.save(section);
        console.log(`Section created: ${name}`);
      }
      sections.push(section);
    }

    // Seed Shifts
    const shiftData = [
      { name: '1st Shift', startTime: '07:00:00', endTime: '15:00:00' },
      { name: '2nd Shift', startTime: '15:00:00', endTime: '23:00:00' },
      { name: '3rd Shift', startTime: '23:00:00', endTime: '07:00:00' },
    ];

    for (const data of shiftData) {
      let shift = await shiftRepo.findOne({ where: { name: data.name } });
      if (!shift) {
        shift = shiftRepo.create(data);
        await shiftRepo.save(shift);
        console.log(`Shift created: ${data.name}`);
      }
    }

    // Seed Users
    const hashedPassword = await bcrypt.hash('password123', 10);

    const users = [
      {
        username: 'superadmin',
        password: hashedPassword,
        roleId: roles[0].id, // SuperAdmin
        sectionId: undefined,
      },
      {
        username: 'admin',
        password: hashedPassword,
        roleId: roles[1].id, // Admin
        sectionId: sections[0].id,
      },
      {
        username: 'worker1',
        password: hashedPassword,
        roleId: roles[2].id, // User
        sectionId: sections[0].id,
      },
      {
        username: 'worker2',
        password: hashedPassword,
        roleId: roles[2].id, // User
        sectionId: sections[1].id,
      },
    ];

    for (const userData of users) {
      const existingUser = await userRepo.findOne({ where: { username: userData.username } });
      if (!existingUser) {
        const newUser = userRepo.create(userData as any);
        await userRepo.save(newUser);
        console.log(`User created: ${userData.username} (password: password123)`);
      }
    }

    console.log('Seeding completed successfully!');
    await dataSource.destroy();
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
}

seed();
