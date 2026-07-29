# Backend integration status

This app was originally built entirely on mock data (`lib/mock-data.ts`), with
real backend calls written but commented out under `/* ORIGINAL BACKEND CALL:
... */` blocks in `app/actions/*.ts`. It's now wired to the real Express/MySQL
backend in `../backend`, and several endpoints that didn't exist on that
backend were built specifically to support asusu's UI. This file tracks
exactly what's real vs still mocked, so nobody has to reverse-engineer it from
the diff later.

## Setup

1. Start the backend (`../backend`, see its own README) — it must be running
   on `http://localhost:5000` (or update `BACKEND_BASE_URL` below to match).
   MySQL (XAMPP) must be running first.
2. `asusu/.env.local`:
   ```
   BACKEND_BASE_URL=http://localhost:5000/api
   ```
3. `npm install && npm run dev` — runs on `http://localhost:3000` by default.
   (If you ever see "Module not found" for a package that's clearly in
   `package.json`, or "not a valid Win32 application" for `@next/swc-*`, that's
   npm cache corruption from a flaky connection, not a real missing
   dependency — delete the specific `node_modules/<package>` folder and
   `npm install` it again.)

## Wired to the real backend

- **Login / Register** (`app/actions/auth.ts`) — real `POST /auth/login` and
  `POST /auth/register`. Note: the login form's "credential" field is always
  treated as an email; this backend has no phone-based login.
- **My Societies** (`getMyActiveSocieties`) — real `GET /groups`. Feeds
  `components/my-societies-view.tsx` — screenshot-verified showing a real
  society's real monthly amount and member count.
- **Society detail** (`getSociety`) — real `GET /groups/:id`. A member whose
  registration-fee payment is still pending gets a best-effort placeholder
  society object rather than a crash — this backend gates monthly
  contributions behind a one-time fee that asusu's UI has no dedicated screen
  for yet.
- **Create Society** (`createSociety`) — real `POST /groups`. The dialog
  (`components/quick-create-society.tsx`) now also collects the two fields
  this backend requires: monthly contribution amount and one-time
  registration fee.
- **Public/recommended society discovery** (`getPublicSocieties`,
  `getRecommendedSocieties`) — real `GET /groups/public` and
  `GET /groups/recommended`. Built specifically for this: `Group.isPublic`,
  and the two discovery endpoints (search + pagination on the public one,
  "not already joined" filtering on recommended). Screenshot-verified live on
  the dashboard's "Recommended for You" and "Explore Public Societies"
  sections.
- **Join a public society** (`joinPublicSociety`, new — asusu's own UI doesn't
  call this anywhere yet, `society-cards.tsx` only links to "View Society") —
  real `POST /groups/:id/join-public`. No invite code needed, same
  pending/active registration-fee gate as the invite-code join flow.
- **Society ledger** (`getSocietyLedger`) — real `GET /groups/:id/ledger`.
  Built specifically for this: a unified feed merging every member's
  successful contributions with matured treasury-investment payouts. Note:
  "payout" here means a treasury bill cycle matured and returned principal +
  interest to the group's pool — **not** a rotating per-member payout (this
  backend has no rotation mechanic; see below).
- **Next due date** (`getNextDueDate`) — real `GET /groups/:id/next-due`.
  Built specifically for this: "due" is defined as the end of the current
  calendar month once the group is active (this backend has no per-day due
  date configured anywhere).
- **Penalties / late fees** (`getMyPenalties`) — real `GET /groups/:id/penalties`.
  Built specifically for this: derives one penalty entry per past month
  (since the member's registration was activated) with no successful monthly
  contribution. Only produces anything once the admin sets a non-zero late
  fee via settings — defaults to an honest empty list otherwise. Verified with
  a backdated membership: correctly derived 3 missed months at the configured
  fee amount, correctly excluding the current month.
- **Society documents** (`getSocietyDocuments`, `uploadSocietyDocument`, new
  action) — real `GET/POST /groups/:id/documents`, backed by an actual
  `GroupDocument` model and multer file storage under `backend/uploads/documents`,
  served statically. Upload requires `type` + a `file` field, admin only.
  Verified: uploaded a file, listed it, fetched it back byte-for-byte.
- **Avatar upload** (`updateSocietyAvatar`) — real `POST /groups/:id/avatar`.
  Backed by `Group.avatarUrl` + multer image storage under
  `backend/uploads/avatars`, admin only, rejects non-image files. Verified
  live with a real PNG.
- **Society settings** (`updateSocietySettings`) — real
  `PATCH /groups/:id/settings`. Only `contribution_amount` (→ `monthlyAmount`)
  and `late_fee` (→ `lateFeeAmount`) map to anything real; `frequency` and
  `payout_cycle` are silently ignored since this backend has neither concept.
  Monthly amount can only change while the group is still "forming" — this
  backend rejects the change once contributions have started, to avoid
  changing terms on members who already joined under the old deal.
- **Society visibility** (`toggleSocietyVisibility`) — real
  `PATCH /groups/:id/visibility`.
- **Member / co-founder invites** (`inviteMember`, `inviteCoFounder`,
  `getPendingInvites`, `acceptInvite`, `declineInvite`) — real
  `POST /groups/:id/invites`, `GET /invites`, `POST /invites/:id/accept`,
  `POST /invites/:id/decline`. Backed by a new `GroupInvite` model (targeted
  invite to a specific email address, distinct from the open invite-code join
  flow). "Co-founder" reuses this backend's existing admin/member role split
  — an accepted co-founder invite makes that person a second admin, rather
  than adding a third role tier. `invite.id` in asusu's UI (see
  `invite-cards-list.tsx`) maps 1:1 onto `GroupInvite.id`, so no ID
  translation was needed in that component. Verified the full lifecycle live:
  send → duplicate-send correctly blocked → recipient registers → sees it in
  their pending list → accepts → correct role granted; separately verified
  decline blocks a second response.
- **Financial Passport** (`app/actions/passport.ts`) — real `GET /passport`.
  This is the one place where asusu previously had **no equivalent feature at
  all**; the backend's trust-score computation (real consistency / payment
  reliability / investment participation, computed from actual contribution
  history) is now what powers this page and the dashboard widget.
  Screenshot-verified every field against a real account, including the
  4-bar trust profile and milestone tabs in `financial-passport-card.tsx`.
- **Community Wealth / Treasury Bill investment cycle**
  (`app/actions/investment.ts` → `getSocietyInvestmentCycle`,
  `startInvestmentCycle`) — real `GET /groups/:id/treasury`,
  `POST /groups/:id/treasury/invest` (auto-connects the sandbox 91-day
  product first if none is connected yet, matching the UI's hardcoded 91-day/
  17.5% assumption). **Important model mismatch**: asusu's UI assumes an
  admin picks a variable allocation percentage (5-50%) of total historical
  assets *at cycle-start time*. This backend instead auto-skims a fixed 5% off
  every monthly contribution *as it's paid*, into a running pool balance —
  "starting a cycle" just sweeps whatever's already accumulated. The
  percentage input in the dialog is therefore cosmetic here (kept for the "min
  5%" validation) and doesn't change what gets invested.
  `updateTBillAllocationPercentage` stays mocked — there's no per-cycle
  configurable rate to PATCH. Verified live: a fresh society's wealth page
  correctly shows an "allocated but not yet invested" empty state with
  ₦0 invested and no completed timeline stages.
- **Multi-channel contribution recording** (`app/actions/contribution.ts` →
  `submitContribution`) — real `POST /contributions/manual`. **New backend
  capability, not just wiring**: self-reported contributions (bank transfer,
  USSD, agent/POS, cash to an officer) can't be verified by a gateway the way
  Paystack payments can, so they're recorded as `pending` and require the
  group admin to confirm them via the new `getPendingContributions` /
  `confirmContribution` / `rejectContribution` actions (not called from any
  UI yet — no admin review screen exists for this — but the backend and
  actions are ready) before they count toward the treasury pool, registration
  activation, or the financial passport. Without that gate, any member could
  fabricate their own contribution history. Verified live: recorded a cash
  contribution → showed up in the admin's pending queue → confirmed →
  treasury pool correctly credited 5% → confirming twice correctly rejected.
- **Financial Opportunities** (`app/actions/opportunities.ts`) — the catalog
  itself (`MOCK_FINANCIAL_OPPORTUNITIES`) stays as illustrative/aspirational
  content, since this backend only actually fulfills the treasury bill
  product — but each opportunity's `status` (locked/unlocked/active) is now
  computed for real against the member's actual `/api/passport` trust score,
  instead of being a fixed mock value.

## Intentionally still mock

- **Forgot password / OTP / reset password** (`app/actions/auth.ts`) — this
  backend has no email-sending infrastructure (no SMTP/mail service
  configured). Building this without real email delivery would mean either
  faking it or returning the reset code directly in the API response, which
  defeats the point of a password reset (anyone could request a reset for any
  email and read the code back) — left mocked rather than shipping something
  insecure.
- **Society rotation queue** (`getSocietyRotationQueue`) — this backend has no
  rotating-payout concept at all. Contributions fund a pooled treasury bill
  investment (5% of each monthly contribution), not a rotating "whose turn is
  it" payout. Building this for real would mean inventing a different product
  mechanic, not wiring an endpoint — left mocked.
- **Configurable treasury allocation percentage**
  (`updateTBillAllocationPercentage`) — see the Community Wealth note above.

## Type changes

- `FinancialPassport` (`types/index.d.ts`): `discipline_score`,
  `total_investment_returns`, and `completed_cycles` were dropped once, then
  **restored as real computed fields** once the backend gained a way to
  honestly derive them:
  - `discipline_score` — of every successful monthly contribution, the % paid
    in the first half of its target month (days 1-15) vs the back half. A
    genuinely distinct signal from consistency (which only checks whether a
    month was paid at all, not when).
  - `completed_cycles` / `total_investment_returns` — treasury investments
    pool every member's allocations together with no per-allocation lineage,
    so a member's cycle count and return share are approximated: cycles are
    counted if they matured after the member's own activation date in that
    group, and their return share is their proportion of that group's
    total-ever allocations applied to the group's total matured returns.
    Verified live with seeded data across two payment timings and a matured
    investment — discipline computed exactly 50% (1 early + 1 late payment),
    investment return share computed correctly proportional to contribution
    share.
- The "Repayment Discipline" bar in `financial-passport-card.tsx` had
  misleading upstream copy ("100% on-time repayment record across internal
  cooperative credit rotations") describing a loan-repayment concept this
  backend doesn't have. Relabeled "Payment Reliability" with accurate copy —
  this backend's `repayment_score` is the share of payment attempts
  (registration + monthly) that succeeded, not a loan repayment record.

## New backend models/endpoints added specifically for this integration

- `Group.isPublic`, `Group.lateFeeAmount`, `Group.avatarUrl` columns
- `GroupInvite` model + `POST /groups/:id/invites`, `GET /invites`,
  `POST /invites/:id/accept`, `POST /invites/:id/decline`
- `GroupDocument` model + multer upload + `GET/POST /groups/:id/documents`
- `GET /groups/public`, `GET /groups/recommended`, `POST /groups/:id/join-public`
- `PATCH /groups/:id/settings`, `PATCH /groups/:id/visibility`,
  `POST /groups/:id/avatar`
- `GET /groups/:id/ledger`, `GET /groups/:id/next-due`, `GET /groups/:id/penalties`
- `Contribution.channel` (`paystack`/`bank_transfer`/`ussd`/`agent`/`cash`),
  `channelNote`, `confirmedByUserId` columns
- `POST /contributions/manual`, `GET /contributions/manual/group/:groupId/pending`,
  `POST /contributions/manual/:contributionId/confirm`,
  `POST /contributions/manual/:contributionId/reject`
- `passportController.js` gained real `discipline`, `completedCycles`, and
  `totalInvestmentReturns` computation (see Type changes above)

## Bugs found and fixed along the way (not backend-wiring related)

- `declineInvite` in `app/actions/societies.ts` had an unterminated `/* */`
  comment that silently swallowed its own `return` statement — it always
  returned `undefined`.
- `AuthProvider` (`lib/auth-context.tsx`) only checked login state once on
  initial app mount. After a successful login/register it never refetched,
  so `Protected` still saw `user: null` and bounced back to `/login`
  regardless of the (correctly-set) cookies. Fixed by calling `refetch()` in
  `login-form.tsx` and `signup-form.tsx` before navigating.
- Repeated backend restarts during development (`sequelize.sync({alter:
  true})`) repeatedly piled up duplicate unique-key indexes on
  `groups.inviteCode`, `users.email`, and `contributions.reference` — enough
  to hit MySQL's 64-key-per-table limit and refuse to start, more than once.
  Cleaned up each time (kept one index per column, dropped the rest);
  unrelated to this integration but blocked testing it repeatedly.
- The `updated` commit added `framer-motion` to `package.json` but it wasn't
  actually installed until `npm install` was rerun post-pull — showed up as
  "Module not found: Can't resolve 'framer-motion'" across several components.
