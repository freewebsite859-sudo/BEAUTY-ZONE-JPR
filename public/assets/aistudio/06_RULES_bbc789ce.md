# 06 — Rules (non-negotiable)

## 1. Working rules for any AI agent / developer
1. **Patch, don't rebuild.** Keep the existing hero/homepage, current images, approval workflow, security middleware and tests. Add files or small edits.
2. **Say what will change before changing it.** Every task starts with: files to add, files to edit (with what), files untouched.
3. **One phase at a time.** Do not start Phase N+1 until Phase N exit criteria pass (`09_Phases.md`).
4. **Green gate:** `npm run verify` (lint + tests + build) must pass before a task is marked done.
5. **Never trust the client** for: salon id, role, price, amount, payment success, rating eligibility.
6. **No secrets in code or logs.** `.env.example` updated with every new variable.
7. **Language rule:** all UI strings use Indian English and ₹; keep strings in `src/lib/strings.ts` (i18n-ready).
8. If a requirement is unclear or a decision is open (see `10_memory.md` §Open questions), ask; do not guess on money, tax or privacy.

## 2. Business rules — booking, advance, refunds
| Rule | Value (platform setting unless noted) |
|---|---|
| Advance percentage | 25% of **payable total after discount**, rounded **up** to the next paisa. Setting `advance_percent`; salon may override only if allowed by admin |
| Minimum advance | ₹1 (never zero if total > 0). If total = ₹0 (free consult) no payment |
| Slot hold | 10 minutes (`hold_minutes`). Unpaid → `expired`, slot freed |
| Free cancellation | ≥ 24 hours before start → 100% advance refund |
| Late cancellation | 2–24 hours → 50% of advance refunded, rest retained |
| Very late / no-show | < 2 hours or no-show → advance retained |
| Salon cancels | Always 100% refund + notify customer + offer rebooking |
| Reschedule | Free once if ≥ 12h before; advance carries over; second time treated as cancellation |
| Refund timing | Initiated immediately; bank credit 5–7 working days (show this in UI) |
| Balance | Collected at salon via POS (cash/UPI/card/gift card/membership). Advance auto-applied |
| Bridal / long bookings (> 3h or `is_bridal`) | Salon may set advance up to 50% (admin cap) |
| Cancellation policy text | Shown before payment and in confirmation message; stored with booking |
| Double booking | Impossible: DB exclusion constraint on staff time range |
| Review eligibility | Only the customer of a `completed` booking, once, within 30 days |
| Review moderation | Owner can reply, cannot delete; admin can hide for abuse |

## 2b. Business rules — commission & payouts (NEW)
| Rule | Value |
|---|---|
| Commission | **10% default** of booking total after discount (`commission_bps`=1000). Per-salon override (e.g. 15%) by super admin only, audited, max 25% |
| Commission base for retained advances | No-show / late cancel: same % applied to the retained amount (assumption, Q13) |
| Gift cards / memberships / products | No commission until owner decides (Q14) |
| Payout schedule | Every day **22:00 IST**, automatic, IMPS/UPI to the verified account |
| Eligible for payout | Ledger rows whose booking is `completed`, or retained after no-show/late cancel, created before 22:00:00 IST |
| On hold | Advances of upcoming bookings; salons with `payout_hold`, suspended, or unverified bank account |
| Net ≤ 0 | No payout; carry forward |
| Minimum payout | ₹1 (`payout_min_paise`); smaller amounts carry forward |
| Refund after payout | Debit in next payout; if salon exits with negative balance, admin recovery process |
| Failed payout | Retry 08:00 IST next day; alert admin after 2 failures; owner notified |
| Disputes / chargebacks | Admin may place `payout_hold` with reason (audited) |
| Visibility | Customer never sees commission. Owner sees commission per booking in payout statement |
| Edits | Ledger is append-only; fix mistakes with `adjustment` entries, never UPDATE/DELETE |
| Bank details | Never store full account number/PAN in our DB or logs; RazorpayX fund account only |
| Tax | GST on commission and TDS (Sec 194-O) treatment decided with CA before launch; make both configurable |

## 3. Business rules — people & data
- Customer registration requires **name, email, password, DOB, WhatsApp number (+91)**. Min age 16; under 18 requires guardian-consent tick (stored).
- WhatsApp number unique per account; changing it requires OTP re-verification.
- DOB used only for: age check, birthday offers (opt-in), service eligibility notes. Never shown publicly; salons see only day+month unless the client shares full date.
- Marketing messages need explicit opt-in per channel; every campaign message includes opt-out ("Reply STOP"). Quiet hours 9 PM–9 AM IST for marketing.
- Delete my account: anonymise profile, keep financial records required by law (invoices) with name masked after retention period.
- Commission: computed at POS line level = `price × service_pct_bps / 10000` (or flat) credited to the performing staff; refunds reverse commission.
- Payroll month locks on close; edits afterwards need an adjustment entry.
- Stock: sale reduces stock atomically with POS order; negative stock blocked unless salon allows.
- Gift card balance never below 0; every change is a `gift_card_txns` row; expiry default 12 months (configurable).
- Plan limits (staff, locations, campaigns) enforced in API, not only UI.

## 4. Security rules (extends existing baseline)
- RLS **enabled on every table**; default deny. Policies use helper functions, tested per table.
- Service-role key only on server; never bundled in Vite (`VITE_` prefix forbidden for secrets).
- Razorpay webhook: verify signature on raw body, reject replays, idempotent by payment id, 400 on bad signature.
- Do not store card data. Store only Razorpay ids + last4 if provided.
- Payout run: per-salon lock, idempotency key, signature-verified RazorpayX webhooks, manual runs and commission changes are super-admin-only and audit-logged. Alert if payout total differs from ledger sum.
- Rate limits: OTP 3/10 min per number and 10/day; booking create 10/10 min per user; review create 5/day.
- Uploads: magic-byte check (existing), max 5 MB, strip EXIF GPS, per-salon path prefix.
- PII in logs masked (`+91XXXXXX1234`). Audit log all money, role, approval, export, delete actions.
- Public endpoints never return phone numbers/DOB of customers; reviews show first name + initial only.
- CSV export requires owner role and writes an audit entry.

## 5. Code rules
- TypeScript strict; no `any` without comment. Shared types in `src/types/`.
- Validation with `zod` at every API boundary; reject unknown keys.
- Money helpers only (`lib/money.ts`); no float arithmetic on money.
- Dates: UTC in DB, IST in UI via `date-fns-tz`; never `new Date('YYYY-MM-DD')` for local dates.
- Components: loading, empty, error, success states required. No silent failures.
- Accessibility: every interactive element ≥ 44×44px (min-h-11), visible focus ring, labels on inputs, `aria-live` for toasts, motion off for `prefers-reduced-motion`.
- Animation: only `transform` and `opacity`; `viewport={{ once: true }}`; no animation on first paint of above-the-fold LCP image.
- No inline secrets, no `console.log` in committed code (use logger).
- Every migration is forward-only, idempotent where possible, named `NNNN_description.sql`.
- Tests accompany every route and every calculation.

## 6. UX copy rules
Use glossary in `00_MASTER.md` §5. Prices always `₹` with Indian digit grouping. Show **Advance ₹X (25%)** and **Balance ₹Y at salon** before the Pay button. Errors say what to do next ("Slot just got booked. Please pick another time").

## 7. Definition of Done
Migration + RLS + API + typed client + UI states + notifications/audit + tests + tracker updated + `npm run verify` green + short note in `10_memory.md`.
