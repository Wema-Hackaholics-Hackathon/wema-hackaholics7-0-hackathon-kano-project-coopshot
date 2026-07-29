// Sandbox simulation of a money-market / FGN treasury bill API.
// There is no real external provider wired up here — this mirrors what an
// admin would see from an actual money-market API so the "connect" flow and
// interest accrual can be demoed end to end.

const SANDBOX_CATALOG = [
  { name: '91-Day FGN Treasury Bill', tenorDays: 91, interestRate: 17.5 },
  { name: '182-Day FGN Treasury Bill', tenorDays: 182, interestRate: 19.0 },
  { name: '364-Day FGN Treasury Bill', tenorDays: 364, interestRate: 21.5 },
];

// Ensures the sandbox catalog exists in the DB (idempotent, safe to call on every boot)
async function seedSandboxCatalog(TreasuryBill) {
  for (const bill of SANDBOX_CATALOG) {
    await TreasuryBill.findOrCreate({
      where: { name: bill.name },
      defaults: bill,
    });
  }
}

// Simple interest accrual for one active investment cycle, capped at its tenor —
// money sitting in the pool (not yet invested) never accrues anything, only cash
// actually swept into a purchased treasury bill does.
// interest = principal * annualRate% * (daysElapsedCappedAtTenor / 365)
function calculateInvestmentAccrual(investment) {
  const now = Date.now();
  const daysElapsed = (now - new Date(investment.purchasedAt).getTime()) / (1000 * 60 * 60 * 24);
  const cappedDays = Math.max(0, Math.min(daysElapsed, investment.tenorDays));
  const rate = Number(investment.interestRate) / 100;
  return Number(investment.principal) * rate * (cappedDays / 365);
}

function isMatureEnoughToDistribute(investment) {
  return new Date() >= new Date(investment.maturityDate);
}

module.exports = { SANDBOX_CATALOG, seedSandboxCatalog, calculateInvestmentAccrual, isMatureEnoughToDistribute };
