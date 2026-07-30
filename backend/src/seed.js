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
  Loan,
} = require('./models');

// Months with real monthly-contribution history seeded (most recent = current month)
const MONTHS = ['2026-04', '2026-05', '2026-06', '2026-07'];

async function seed() {
  console.log('🌱 Starting database seed for CoopShot...');

  try {
    // 1. Sync Database Schema
    await sequelize.sync({ force: false });

    const hashedPassword = await bcrypt.hash('12345678', 10);

    // Update all existing users in the database to use '12345678'
    await User.update({ password: hashedPassword }, { where: {} });

    // 2. Seed Users (10)
    const userDefs = [
      ['Alex Johnson', 'demo@coopshot.com', '+2348012345678'],
      ['Victoria Adams', 'victoria.adams@coopshot.com', '+2348023456789'],
      ['Emeka Nwosu', 'emeka.nwosu@coopshot.com', '+2348034567890'],
      ['Tunde Bakare', 'tunde.bakare@coopshot.com', '+2348045678901'],
      ['Fatima Zara', 'fatima.zara@coopshot.com', '+2348056789012'],
      ['Ibrahim Sule', 'ibrahim.sule@coopshot.com', '+2348067890123'],
      ['Chidinma Okeke', 'chidinma.okeke@coopshot.com', '+2348078901234'],
      ['Grace Adeyemi', 'grace.adeyemi@coopshot.com', '+2348089012345'],
      ['Yusuf Danladi', 'yusuf.danladi@coopshot.com', '+2348090123456'],
      ['Blessing Eze', 'blessing.eze@coopshot.com', '+2348001234567'],
    ];

    const users = {};
    for (const [name, email, phone] of userDefs) {
      const [user] = await User.findOrCreate({
        where: { email },
        defaults: { name, email, password: hashedPassword, phone },
      });
      users[email] = user;
    }

    const [
      demoUser, user2, user3, user4, user5,
      user6, user7, user8, user9, user10,
    ] = userDefs.map(([, email]) => users[email]);

    console.log('✅ 10 Users seeded');

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

    // 4. Seed Groups / Societies (7 total: 5 public, 2 private)
    const groupDefs = [
      {
        key: 'g1',
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
        loanMultiplier: 2,
        avatarUrl: 'https://images.unsplash.com/photo-1556742049-0a67daf4095a?w=400',
      },
      {
        key: 'g2',
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
        loanMultiplier: 3,
        avatarUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400',
      },
      {
        key: 'g3',
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
        loanMultiplier: 2,
        avatarUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400',
      },
      {
        key: 'g4',
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
        loanMultiplier: 1,
      },
      {
        key: 'g5',
        name: 'Kano Textile Traders Cooperative',
        description: 'Savings and credit cooperative for fabric and textile market traders across Kano state.',
        monthlyAmount: 60000.00,
        registrationFee: 3000.00,
        equityAmount: 30000.00,
        inviteCode: 'KANOTEX05',
        createdBy: user6.id,
        status: 'active',
        treasuryBillId: tbill182.id,
        treasuryPoolBalance: 18000.00,
        isPublic: true,
        lateFeeAmount: 1500.00,
        loanMultiplier: 2,
        avatarUrl: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400',
      },
      {
        key: 'g6',
        name: 'Port Harcourt Oil Workers Co-op',
        description: 'Savings circle for oil & gas sector workers and contractors in Port Harcourt, still onboarding founding members.',
        monthlyAmount: 150000.00,
        registrationFee: 7500.00,
        equityAmount: 60000.00,
        inviteCode: 'PHOIL006',
        createdBy: user7.id,
        status: 'forming',
        treasuryBillId: null,
        treasuryPoolBalance: 0.00,
        isPublic: true,
        lateFeeAmount: 3000.00,
        loanMultiplier: 1,
        avatarUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400',
      },
      {
        key: 'g7',
        name: 'Ibadan Artisans Trust Society',
        description: 'Private trust circle for carpenters, tailors and artisans in Ibadan pooling savings for tools and workshop financing.',
        monthlyAmount: 40000.00,
        registrationFee: 2000.00,
        equityAmount: 20000.00,
        inviteCode: 'IBDART007',
        createdBy: user8.id,
        status: 'active',
        treasuryBillId: tbill364.id,
        treasuryPoolBalance: 9000.00,
        isPublic: false,
        lateFeeAmount: 1000.00,
        loanMultiplier: 2,
      },
    ];

    const groups = {};
    for (const def of groupDefs) {
      const { key, ...defaults } = def;
      const [group] = await Group.findOrCreate({ where: { name: def.name }, defaults });
      groups[key] = group;
    }

    console.log('✅ 7 Societies seeded (5 public, 2 private)');

    // 5. Seed Memberships — every society has at least 5 members
    const membershipDefs = [
      // G1 — Victoria Island Savers Guild (public, active)
      { g: 'g1', u: demoUser, role: 'admin', status: 'active' },
      { g: 'g1', u: user2, role: 'member', status: 'active' },
      { g: 'g1', u: user3, role: 'member', status: 'active' },
      { g: 'g1', u: user4, role: 'member', status: 'active' },
      { g: 'g1', u: user5, role: 'member', status: 'active' },

      // G2 — Tech Founders Investment Circle (public, active)
      { g: 'g2', u: user2, role: 'admin', status: 'active' },
      { g: 'g2', u: demoUser, role: 'member', status: 'active' },
      { g: 'g2', u: user5, role: 'member', status: 'active' },
      { g: 'g2', u: user6, role: 'member', status: 'active' },
      { g: 'g2', u: user7, role: 'member', status: 'active' },

      // G3 — Lagos Agricultural Cooperative (public, active)
      { g: 'g3', u: user3, role: 'admin', status: 'active' },
      { g: 'g3', u: demoUser, role: 'member', status: 'active' },
      { g: 'g3', u: user4, role: 'member', status: 'active' },
      { g: 'g3', u: user8, role: 'member', status: 'active' },
      { g: 'g3', u: user9, role: 'member', status: 'active' },

      // G4 — Abuja Women Entrepreneurs Co-op (private, forming)
      { g: 'g4', u: user5, role: 'admin', status: 'active' },
      { g: 'g4', u: user6, role: 'member', status: 'active' },
      { g: 'g4', u: user9, role: 'member', status: 'active' },
      { g: 'g4', u: user10, role: 'member', status: 'active' },
      { g: 'g4', u: demoUser, role: 'member', status: 'pending' },

      // G5 — Kano Textile Traders Cooperative (public, active)
      { g: 'g5', u: user6, role: 'admin', status: 'active' },
      { g: 'g5', u: user7, role: 'member', status: 'active' },
      { g: 'g5', u: user8, role: 'member', status: 'active' },
      { g: 'g5', u: user9, role: 'member', status: 'active' },
      { g: 'g5', u: user10, role: 'member', status: 'active' },

      // G6 — Port Harcourt Oil Workers Co-op (public, forming)
      { g: 'g6', u: user7, role: 'admin', status: 'active' },
      { g: 'g6', u: user2, role: 'member', status: 'active' },
      { g: 'g6', u: user3, role: 'member', status: 'active' },
      { g: 'g6', u: user9, role: 'member', status: 'pending' },
      { g: 'g6', u: user10, role: 'member', status: 'pending' },

      // G7 — Ibadan Artisans Trust Society (private, active)
      { g: 'g7', u: user8, role: 'admin', status: 'active' },
      { g: 'g7', u: demoUser, role: 'member', status: 'active' },
      { g: 'g7', u: user4, role: 'member', status: 'active' },
      { g: 'g7', u: user6, role: 'member', status: 'active' },
      { g: 'g7', u: user10, role: 'member', status: 'active' },
    ];

    for (const mem of membershipDefs) {
      const groupId = groups[mem.g].id;
      const userId = mem.u.id;
      await GroupMember.findOrCreate({
        where: { groupId, userId },
        defaults: { groupId, userId, role: mem.role, status: mem.status },
      });
    }

    console.log('✅ Memberships seeded (>=5 members per society)');

    // 6. Seed Contributions & Treasury Allocations — real monthly history so
    // each active member's Financial Passport (consistency, discipline,
    // payment reliability, investment participation) has varied, realistic data.
    // Only groups with status 'active' get monthly contributions — forming
    // groups (g4, g6) haven't opened monthly contributions yet, matching the
    // real product's lifecycle rules.
    const activeGroupKeys = ['g1', 'g2', 'g3', 'g5', 'g7'];

    for (const gk of activeGroupKeys) {
      const group = groups[gk];
      const activeMembers = membershipDefs.filter((m) => m.g === gk && m.status === 'active');

      for (const mem of activeMembers) {
        const user = mem.u;

        // One-time registration fee
        if (Number(group.registrationFee) > 0) {
          await Contribution.findOrCreate({
            where: { reference: `REG-${group.id}-${user.id}` },
            defaults: {
              groupId: group.id,
              userId: user.id,
              amount: group.registrationFee,
              type: 'registration',
              month: null,
              status: 'success',
              reference: `REG-${group.id}-${user.id}`,
              paidAt: new Date('2026-04-01T10:00:00Z'),
              channel: 'paystack',
            },
          });
        }

        // One-time equity / share-capital contribution
        if (Number(group.equityAmount) > 0) {
          await Contribution.findOrCreate({
            where: { reference: `EQ-${group.id}-${user.id}` },
            defaults: {
              groupId: group.id,
              userId: user.id,
              amount: group.equityAmount,
              type: 'equity',
              month: null,
              status: 'success',
              reference: `EQ-${group.id}-${user.id}`,
              paidAt: new Date('2026-04-01T10:05:00Z'),
              channel: 'paystack',
            },
          });
        }

        // Monthly contributions with deterministic-but-varied outcomes:
        // - occasionally skipped entirely (imperfect consistency score)
        // - occasionally fails (imperfect payment reliability score)
        // - paid early (day 5) or late (day 20) in the month (discipline score)
        for (let idx = 0; idx < MONTHS.length; idx += 1) {
          const month = MONTHS[idx];
          const signature = user.id + idx;

          const skipped = signature % 7 === 0;
          if (skipped) continue;

          const failed = signature % 11 === 0;
          const paidDay = signature % 2 === 0 ? '05' : '20';
          const reference = `MTH-${group.id}-${user.id}-${month}`;

          const [contribution] = await Contribution.findOrCreate({
            where: { reference },
            defaults: {
              groupId: group.id,
              userId: user.id,
              amount: group.monthlyAmount,
              type: 'monthly',
              month,
              status: failed ? 'failed' : 'success',
              reference,
              paidAt: failed ? null : new Date(`${month}-${paidDay}T14:30:00Z`),
              channel: 'paystack',
            },
          });

          // 5% treasury allocation for successful contributions in groups
          // connected to a treasury bill product
          if (!failed && group.treasuryBillId) {
            const treasuryBill = [tbill91, tbill182, tbill364].find((t) => t.id === group.treasuryBillId);
            await TreasuryAllocation.findOrCreate({
              where: { contributionId: contribution.id },
              defaults: {
                groupId: group.id,
                contributionId: contribution.id,
                amount: Number(group.monthlyAmount) * 0.05,
                interestRate: treasuryBill.interestRate,
              },
            });
          }
        }
      }
    }

    console.log('✅ Contributions & Treasury Allocations seeded (Financial Passport data)');

    // 7. Seed Treasury Investment cycles — community wealth across the network:
    // matured cycles (realized returns) and an active in-flight cycle
    await TreasuryInvestment.findOrCreate({
      where: { groupId: groups.g1.id, status: 'matured' },
      defaults: {
        groupId: groups.g1.id,
        treasuryBillId: tbill91.id,
        principal: 50000.00,
        interestRate: 18.50,
        tenorDays: 91,
        purchasedAt: new Date('2026-01-01T00:00:00Z'),
        maturityDate: new Date('2026-04-02T00:00:00Z'),
        status: 'matured',
        returnAmount: 52312.50,
        distributedAt: new Date('2026-04-02T12:00:00Z'),
      },
    });

    await TreasuryInvestment.findOrCreate({
      where: { groupId: groups.g2.id, status: 'matured' },
      defaults: {
        groupId: groups.g2.id,
        treasuryBillId: tbill182.id,
        principal: 120000.00,
        interestRate: 19.25,
        tenorDays: 182,
        purchasedAt: new Date('2025-10-01T00:00:00Z'),
        maturityDate: new Date('2026-04-01T00:00:00Z'),
        status: 'matured',
        returnAmount: 131535.00,
        distributedAt: new Date('2026-04-01T12:00:00Z'),
      },
    });

    await TreasuryInvestment.findOrCreate({
      where: { groupId: groups.g1.id, status: 'active' },
      defaults: {
        groupId: groups.g1.id,
        treasuryBillId: tbill91.id,
        principal: 45000.00,
        interestRate: 18.50,
        tenorDays: 91,
        purchasedAt: new Date('2026-06-01T00:00:00Z'),
        maturityDate: new Date('2026-08-30T00:00:00Z'),
        status: 'active',
      },
    });

    await TreasuryInvestment.findOrCreate({
      where: { groupId: groups.g5.id, status: 'active' },
      defaults: {
        groupId: groups.g5.id,
        treasuryBillId: tbill182.id,
        principal: 18000.00,
        interestRate: 19.25,
        tenorDays: 182,
        purchasedAt: new Date('2026-06-15T00:00:00Z'),
        maturityDate: new Date('2026-12-14T00:00:00Z'),
        status: 'active',
      },
    });

    await TreasuryInvestment.findOrCreate({
      where: { groupId: groups.g7.id, status: 'matured' },
      defaults: {
        groupId: groups.g7.id,
        treasuryBillId: tbill364.id,
        principal: 15000.00,
        interestRate: 20.50,
        tenorDays: 364,
        purchasedAt: new Date('2025-07-01T00:00:00Z'),
        maturityDate: new Date('2026-06-30T00:00:00Z'),
        status: 'matured',
        returnAmount: 18075.00,
        distributedAt: new Date('2026-06-30T12:00:00Z'),
      },
    });

    console.log('✅ Treasury Investments seeded (Community Wealth data)');

    // 8. Seed Loan History — pending, approved and rejected requests across
    // several societies, eligibility computed from each borrower's real
    // contributions so far (mirrors backend/src/utils/loanEligibility.js)
    async function eligibleAmountFor(group, userId) {
      const contributions = await Contribution.findAll({
        where: { groupId: group.id, userId, status: 'success' },
      });
      const total = contributions
        .filter((c) => c.type === 'equity' || c.type === 'monthly')
        .reduce((sum, c) => sum + Number(c.amount), 0);
      return total * Number(group.loanMultiplier);
    }

    const loanRequests = [
      { g: 'g1', u: user2, admin: demoUser, fraction: 0.5, status: 'approved', note: 'Approved for shop inventory restock.' },
      { g: 'g1', u: user3, admin: demoUser, fraction: 0.3, status: 'pending', note: null },
      { g: 'g2', u: user5, admin: user2, fraction: 0.4, status: 'approved', note: 'Approved for business expansion.' },
      { g: 'g2', u: user6, admin: user2, fraction: 0.6, status: 'rejected', note: 'Requested amount exceeds current repayment capacity.' },
      { g: 'g3', u: user4, admin: user3, fraction: 0.5, status: 'approved', note: 'Approved for farm input purchase.' },
      { g: 'g3', u: user8, admin: user3, fraction: 0.35, status: 'pending', note: null },
      { g: 'g5', u: user9, admin: user6, fraction: 0.4, status: 'rejected', note: 'Insufficient contribution history at this time.' },
      { g: 'g7', u: user6, admin: user8, fraction: 0.5, status: 'approved', note: 'Approved for workshop tool financing.' },
    ];

    for (const req of loanRequests) {
      const group = groups[req.g];
      const eligibleAmount = await eligibleAmountFor(group, req.u.id);
      if (eligibleAmount <= 0) continue;

      const amount = Math.round((eligibleAmount * req.fraction) / 1000) * 1000;
      const isDecided = req.status !== 'pending';

      await Loan.findOrCreate({
        where: { groupId: group.id, userId: req.u.id, status: req.status },
        defaults: {
          groupId: group.id,
          userId: req.u.id,
          amount,
          eligibleAmount,
          status: req.status,
          decidedByUserId: isDecided ? req.admin.id : null,
          decidedAt: isDecided ? new Date('2026-07-15T09:00:00Z') : null,
          decisionNote: req.note,
        },
      });
    }

    console.log('✅ Loan history seeded (pending, approved, rejected)');

    // 9. Seed Documents
    await GroupDocument.findOrCreate({
      where: { groupId: groups.g1.id, description: 'Victoria Island Savers Guild Constitution 2026.pdf' },
      defaults: {
        groupId: groups.g1.id,
        type: 'constitution',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        description: 'Victoria Island Savers Guild Constitution 2026.pdf',
        uploadedByUserId: demoUser.id,
        approved: true,
      },
    });

    await GroupDocument.findOrCreate({
      where: { groupId: groups.g5.id, description: 'Kano Textile Traders Cooperative Registration.pdf' },
      defaults: {
        groupId: groups.g5.id,
        type: 'registration',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        description: 'Kano Textile Traders Cooperative Registration.pdf',
        uploadedByUserId: user6.id,
        approved: true,
      },
    });

    console.log('✅ Group Documents seeded');

    // 10. Seed Group Invites — 2 new targeted invites, one to a public society
    // and one to a private society. Both target groups are still 'forming' so
    // the invites are actually accept-able end to end, not just visible.
    await GroupInvite.findOrCreate({
      where: { invitedEmail: 'tunde.bakare@coopshot.com', groupId: groups.g6.id },
      defaults: {
        groupId: groups.g6.id,
        invitedEmail: 'tunde.bakare@coopshot.com',
        invitedByUserId: user7.id,
        role: 'member',
        status: 'pending',
      },
    });

    await GroupInvite.findOrCreate({
      where: { invitedEmail: 'grace.adeyemi@coopshot.com', groupId: groups.g4.id },
      defaults: {
        groupId: groups.g4.id,
        invitedEmail: 'grace.adeyemi@coopshot.com',
        invitedByUserId: user5.id,
        role: 'member',
        status: 'pending',
      },
    });

    // Kept from the original demo seed
    await GroupInvite.findOrCreate({
      where: { invitedEmail: 'demo@coopshot.com', groupId: groups.g4.id },
      defaults: {
        groupId: groups.g4.id,
        invitedEmail: 'demo@coopshot.com',
        invitedByUserId: user5.id,
        role: 'member',
        status: 'pending',
      },
    });

    console.log('✅ Group Invites seeded (1 public, 1 private new invite)');

    console.log('🎉 Seed script completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    process.exit(0);
  }
}

seed();
