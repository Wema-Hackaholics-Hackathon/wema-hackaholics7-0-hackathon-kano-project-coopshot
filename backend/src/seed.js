const bcrypt = require('bcryptjs');
const sequelize = require('./config/db');
const {
  User,
  Group,
  GroupMember,
  Contribution,
  TreasuryBill,
  TreasuryAllocation,
  TreasuryInvestment,
  GroupInvite,
  GroupDocument,
} = require('./models');

async function seed() {
  console.log('🌱 Starting database seed for CoopShot...');

  try {
    // 1. Sync Database Schema
    await sequelize.sync({ force: false });

    const hashedPassword = await bcrypt.hash('12345678', 10);

    // Update all existing users in the database to use '12345678'
    await User.update({ password: hashedPassword }, { where: {} });

    // 2. Seed Users
    const [demoUser] = await User.findOrCreate({
      where: { email: 'demo@coopshot.com' },
      defaults: {
        name: 'Alex Johnson',
        email: 'demo@coopshot.com',
        password: hashedPassword,
        phone: '+2348012345678',
      },
    });

    const [user2] = await User.findOrCreate({
      where: { email: 'victoria.adams@coopshot.com' },
      defaults: {
        name: 'Victoria Adams',
        email: 'victoria.adams@coopshot.com',
        password: hashedPassword,
        phone: '+2348023456789',
      },
    });

    const [user3] = await User.findOrCreate({
      where: { email: 'emeka.nwosu@coopshot.com' },
      defaults: {
        name: 'Emeka Nwosu',
        email: 'emeka.nwosu@coopshot.com',
        password: hashedPassword,
        phone: '+2348034567890',
      },
    });

    const [user4] = await User.findOrCreate({
      where: { email: 'tunde.bakare@coopshot.com' },
      defaults: {
        name: 'Tunde Bakare',
        email: 'tunde.bakare@coopshot.com',
        password: hashedPassword,
        phone: '+2348045678901',
      },
    });

    const [user5] = await User.findOrCreate({
      where: { email: 'fatima.zara@coopshot.com' },
      defaults: {
        name: 'Fatima Zara',
        email: 'fatima.zara@coopshot.com',
        password: hashedPassword,
        phone: '+2348056789012',
      },
    });

    console.log('✅ Users seeded');

    // 3. Seed Treasury Bills Catalog
    const [tbill91] = await TreasuryBill.findOrCreate({
      where: { tenorDays: 91 },
      defaults: {
        name: 'FGN 91-Day Treasury Bill (Q3 2026)',
        tenorDays: 91,
        interestRate: 18.50,
        provider: 'Central Bank of Nigeria / Money Market API',
      },
    });

    const [tbill182] = await TreasuryBill.findOrCreate({
      where: { tenorDays: 182 },
      defaults: {
        name: 'FGN 182-Day Treasury Bill (H2 2026)',
        tenorDays: 182,
        interestRate: 19.25,
        provider: 'Central Bank of Nigeria / Money Market API',
      },
    });

    const [tbill364] = await TreasuryBill.findOrCreate({
      where: { tenorDays: 364 },
      defaults: {
        name: 'FGN 364-Day Annual Treasury Bill',
        tenorDays: 364,
        interestRate: 20.50,
        provider: 'Central Bank of Nigeria / Money Market API',
      },
    });

    console.log('✅ Treasury Bills seeded');

    // 4. Seed Groups / Societies
    const [group1] = await Group.findOrCreate({
      where: { name: 'Victoria Island Savers Guild' },
      defaults: {
        name: 'Victoria Island Savers Guild',
        description: 'Elite rotating monthly credit & savings cooperative for Victoria Island business owners and professionals.',
        monthlyAmount: 100000.00,
        registrationFee: 5000.00,
        equityAmount: 50000.00,
        inviteCode: 'VISAVER01',
        createdBy: demoUser.id,
        status: 'active',
        treasuryBillId: tbill91.id,
        treasuryPoolBalance: 45000.00,
        isPublic: true,
        lateFeeAmount: 2500.00,
        avatarUrl: 'https://images.unsplash.com/photo-1556742049-0a67daf4095a?w=400',
      },
    });

    const [group2] = await Group.findOrCreate({
      where: { name: 'Tech Founders Investment Circle' },
      defaults: {
        name: 'Tech Founders Investment Circle',
        description: 'High-yield quarterly savings pooling group targeting institutional FGN Treasury Bills and money market funds.',
        monthlyAmount: 250000.00,
        registrationFee: 10000.00,
        equityAmount: 100000.00,
        inviteCode: 'TECHFC002',
        createdBy: user2.id,
        status: 'active',
        treasuryBillId: tbill182.id,
        treasuryPoolBalance: 125000.00,
        isPublic: true,
        lateFeeAmount: 5000.00,
        avatarUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400',
      },
    });

    const [group3] = await Group.findOrCreate({
      where: { name: 'Lagos Agricultural Cooperative' },
      defaults: {
        name: 'Lagos Agricultural Cooperative',
        description: 'Empowering local farmers and food producers with affordable group credit and harvest savings pools.',
        monthlyAmount: 50000.00,
        registrationFee: 2500.00,
        equityAmount: 25000.00,
        inviteCode: 'LAGAGRI03',
        createdBy: user3.id,
        status: 'active',
        treasuryBillId: tbill91.id,
        treasuryPoolBalance: 15000.00,
        isPublic: true,
        lateFeeAmount: 1000.00,
        avatarUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400',
      },
    });

    const [group4] = await Group.findOrCreate({
      where: { name: 'Abuja Women Entrepreneurs Co-op' },
      defaults: {
        name: 'Abuja Women Entrepreneurs Co-op',
        description: 'Mutual support and business development savings circle for female business owners in FCT Abuja.',
        monthlyAmount: 75000.00,
        registrationFee: 3000.00,
        equityAmount: 30000.00,
        inviteCode: 'ABJWOMEN4',
        createdBy: user5.id,
        status: 'forming',
        treasuryBillId: null,
        treasuryPoolBalance: 0.00,
        isPublic: false,
        lateFeeAmount: 1500.00,
      },
    });

    console.log('✅ Societies seeded');

    // 5. Seed Memberships
    const membershipsData = [
      { groupId: group1.id, userId: demoUser.id, role: 'admin', status: 'active' },
      { groupId: group1.id, userId: user2.id, role: 'member', status: 'active' },
      { groupId: group1.id, userId: user3.id, role: 'member', status: 'active' },
      { groupId: group1.id, userId: user4.id, role: 'member', status: 'active' },

      { groupId: group2.id, userId: user2.id, role: 'admin', status: 'active' },
      { groupId: group2.id, userId: demoUser.id, role: 'member', status: 'active' },
      { groupId: group2.id, userId: user5.id, role: 'member', status: 'active' },

      { groupId: group3.id, userId: user3.id, role: 'admin', status: 'active' },
      { groupId: group3.id, userId: demoUser.id, role: 'member', status: 'active' },

      { groupId: group4.id, userId: user5.id, role: 'admin', status: 'active' },
      { groupId: group4.id, userId: demoUser.id, role: 'member', status: 'pending' },
    ];

    for (const mem of membershipsData) {
      await GroupMember.findOrCreate({
        where: { groupId: mem.groupId, userId: mem.userId },
        defaults: mem,
      });
    }

    console.log('✅ Memberships seeded');

    // 6. Seed Contributions & Treasury Allocations for Demo User & Members
    const months = ['2026-05', '2026-06', '2026-07'];

    for (const m of months) {
      // Demo User registration fee & monthly contributions for Group 1
      const [regContrib] = await Contribution.findOrCreate({
        where: { reference: `REG-${group1.id}-${demoUser.id}` },
        defaults: {
          groupId: group1.id,
          userId: demoUser.id,
          amount: 5000.00,
          type: 'registration',
          month: null,
          status: 'success',
          reference: `REG-${group1.id}-${demoUser.id}`,
          paidAt: new Date('2026-05-01T10:00:00Z'),
          channel: 'paystack',
        },
      });

      const [monthlyContrib] = await Contribution.findOrCreate({
        where: { reference: `MTH-${group1.id}-${demoUser.id}-${m}` },
        defaults: {
          groupId: group1.id,
          userId: demoUser.id,
          amount: 100000.00,
          type: 'monthly',
          month: m,
          status: 'success',
          reference: `MTH-${group1.id}-${demoUser.id}-${m}`,
          paidAt: new Date(`${m}-05T14:30:00Z`), // paid in early half of month -> 100% discipline score!
          channel: 'paystack',
        },
      });

      // 5% Treasury Allocation
      if (monthlyContrib) {
        await TreasuryAllocation.findOrCreate({
          where: { contributionId: monthlyContrib.id },
          defaults: {
            groupId: group1.id,
            contributionId: monthlyContrib.id,
            amount: 5000.00,
            interestRate: 18.50,
          },
        });
      }

      // Group 2 contributions for Demo User
      const [g2Contrib] = await Contribution.findOrCreate({
        where: { reference: `MTH-${group2.id}-${demoUser.id}-${m}` },
        defaults: {
          groupId: group2.id,
          userId: demoUser.id,
          amount: 250000.00,
          type: 'monthly',
          month: m,
          status: 'success',
          reference: `MTH-${group2.id}-${demoUser.id}-${m}`,
          paidAt: new Date(`${m}-10T09:15:00Z`),
          channel: 'paystack',
        },
      });

      if (g2Contrib) {
        await TreasuryAllocation.findOrCreate({
          where: { contributionId: g2Contrib.id },
          defaults: {
            groupId: group2.id,
            contributionId: g2Contrib.id,
            amount: 12500.00,
            interestRate: 19.25,
          },
        });
      }
    }

    console.log('✅ Contributions & Treasury Allocations seeded');

    // 7. Seed Matured Treasury Investment Cycle
    await TreasuryInvestment.findOrCreate({
      where: { groupId: group1.id, status: 'matured' },
      defaults: {
        groupId: group1.id,
        treasuryBillId: tbill91.id,
        principal: 50000.00,
        interestRate: 18.50,
        tenorDays: 91,
        purchasedAt: new Date('2026-05-01T00:00:00Z'),
        maturityDate: new Date('2026-07-31T00:00:00Z'),
        status: 'matured',
        returnAmount: 52312.50,
        distributedAt: new Date('2026-07-31T12:00:00Z'),
      },
    });

    console.log('✅ Treasury Investments seeded');

    // 8. Seed Documents
    await GroupDocument.findOrCreate({
      where: { groupId: group1.id, description: 'Victoria Island Savers Guild Constitution 2026.pdf' },
      defaults: {
        groupId: group1.id,
        type: 'constitution',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        description: 'Victoria Island Savers Guild Constitution 2026.pdf',
        uploadedByUserId: demoUser.id,
        approved: true,
      },
    });

    console.log('✅ Group Documents seeded');

    // 9. Seed Group Invites
    await GroupInvite.findOrCreate({
      where: { invitedEmail: 'demo@coopshot.com', groupId: group4.id },
      defaults: {
        groupId: group4.id,
        invitedEmail: 'demo@coopshot.com',
        invitedByUserId: user5.id,
        role: 'member',
        status: 'pending',
      },
    });

    console.log('🎉 Seed script completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    process.exit(0);
  }
}

seed();
