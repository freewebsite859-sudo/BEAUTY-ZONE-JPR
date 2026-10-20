# 00 — MASTER (BeautyZone: Beauty Parlour & Salon Platform)

> Single entry point. Read this first, then the file you need. Working name: **BeautyZone** (rename freely).

## 1. What we are building
A multi-tenant salon / beauty parlour platform for India.
- **Salon owners** sign up, set up their parlour, get a public website, take bookings, manage staff, clients, payments, stock and marketing.
- **Customers** discover parlours, book services, pay a **25% advance in INR**, review after the visit.
- **Super admin** approves websites, manages users, subscriptions and platform settings.

Existing repo already has: owner onboarding, approval workflow (Draft → Pending → Approved → Published), super admin console, public salon site, guest booking requests, AI assist with fallbacks, strong security baseline (scrypt, hashed sessions, CSRF, CSP, tenant isolation, 52 tests).

## 2. Locked requirements (do not change without asking the owner)
| # | Requirement | Source |
|---|---|---|
| R1 | Whole website uses everyday **Indian English** words (see glossary below) | Vijay |
| R2 | All money in **INR (₹)**, stored as integer **paise** | Vijay |
| R3 | Booking needs **25% advance**; balance paid at salon. Percentage is a platform setting (`advance_percent`, default 25) | Vijay |
| R4 | **Customer registration must capture Date of Birth + WhatsApp number** | Vijay |
| R5 | Database is **Supabase (Postgres)**. Replaces `node:sqlite` | Vijay |
| R6 | **Design prompt is separate** → see `Design.md` | Vijay |
| R7 | Changes are **additive / patch-style**. Do not rebuild the existing homepage, images, approval workflow or tests. Every prompt must state what will change before changing it | Working rule |
| R8 | Platform charges **commission on bookings: 10% default** (`commission_bps`=1000). Vijay also mentioned 15%: kept as a per-salon override until clarified (see `10_memory.md` Q11) | Vijay, 20/10/2026 |
| R9 | **Daily auto payout to salon owners at 10:00 PM IST**, no withdrawal request needed. Payout = advance collected − refunds − commission (− GST on commission, if applicable) | Vijay, 20/10/2026 |
| R10 | Minimum customer age is **16** (confirmed) | Vijay, 20/10/2026 |

## 3. File map
| File | Purpose |
|---|---|
| `00_MASTER.md` | This file: vision, locked decisions, gap summary |
| `PRD.md` | Product requirements, personas, modules, success metrics |
| `02_Architecture.md` | System architecture, Supabase usage, integrations |
| `03_APPFLOW.md` | User flows, state machines, **wiring matrix** |
| `04_TECHSPEC.md` | API contracts, payment/WhatsApp/AI specs, env vars |
| `05_SCHEMA.md` | Postgres schema, indexes, RLS plan, SQLite → Supabase migration |
| `06_RULES.md` | Business rules + coding rules (non-negotiables) |
| `07_IMPLEMENTATIONPLAN.md` | Ordered build plan with dependencies |
| `08_TRACKER.md` | Checkbox tracker for every feature |
| `09_Phases.md` | Phase definitions, entry/exit criteria |
| `10_memory.md` | Project memory for AI agents (state, decisions, gotchas) |
| `11_SCREENS.md` | Every screen: route, role, data, wiring |
| `12_PHASE_PROMPTS.md` | Ready-to-paste, patch-style prompts per phase |
| `Design.md` | **Vijay's visual/UI spec (Aura reference clone)**: tokens, shell + PromotionalBanner, home page, staff pages, auth screens, motion. Authority for LOOK and UI behaviour only. Do not edit without asking |
| `prompts/` | `00_START_HERE.md` + 13 step prompts (one per build step) |
| `Engineering-Practices.md` | Git, testing, review, security, performance |

(No `01_` file was in your list; numbering is kept as you gave it.)

## 4. Gap summary (full table in `PRD.md` §7)
**Missing entirely:** customer accounts, DOB/WhatsApp capture, online payments (Razorpay/UPI), advance + refunds, reviews, discovery filters, calendar view, staff attendance, payroll & commission, POS & invoices (GST), inventory, memberships & packages, gift cards, offers, consultation forms, automated reminders (WhatsApp/SMS), marketing campaigns, Google reviews link, reports & CSV export, multi-location, franchise portal, client mobile app/PWA, TV booking display, 1-tap rebooking, **commission ledger, salon bank/payout setup and daily 10 PM auto payouts**.
**Partially there:** staff CRUD (no attendance/commission), bookings inbox (no calendar, no payment), AI assist (taglines/description/review-reply only), billing (plan display only).
**To migrate:** SQLite → Supabase Postgres; custom sessions → Supabase Auth (see `02_Architecture.md`).
**To polish:** framer-motion scroll reveals, GSAP search filter, 44px touch targets, parallax hero.

## 5. Indian English glossary (use in all UI copy)
| Use | Avoid |
|---|---|
| Parlour / Salon, Beautician, Stylist | Aesthetician, Barber-only wording on women's pages |
| Mobile number, WhatsApp number | Cell, Phone # |
| Date of birth | DOB (spell out in UI) |
| Pincode, City, State | Zip code |
| ₹1,499 (Indian grouping: ₹1,25,000) | $, USD |
| Advance, Balance, Pay at salon | Deposit, Remaining |
| Facial, Waxing, Threading, Bridal makeup, Hair spa, Mehendi, Manicure, Pedicure | Western-only terms |
| Appointment, Booking confirmed | Reservation |
| Date format `DD/MM/YYYY`, time `10:30 AM` | `MM/DD/YYYY` |
| Timezone `Asia/Kolkata` (IST) | UTC in UI |

## 6. Decision log (short)
- D1: Keep Express API as backend-for-frontend; Supabase is DB + Auth + Storage + RLS. (`02_Architecture.md`)
- D2: Money = `bigint` paise everywhere. Advance = `ceil(total × advance_percent / 100)`.
- D3: Razorpay for UPI/cards. Webhook is source of truth, never the browser redirect.
- D4: WhatsApp Business Cloud API for reminders, SMS as fallback.
- D5 (changed 20/10/2026): Revenue = **commission on bookings (10% default)** + optional subscription plans. The reference product's "0% commission" claim must NOT be copied into our copy.
- D6 (resolved by R9): **Platform collects** all advances in its own Razorpay account, keeps a per-salon ledger, and pays salons out daily at 22:00 IST (RazorpayX payouts). Razorpay Route is no longer the default. Still needs Razorpay approval for marketplace payouts + CA advice on GST/TDS.
- D7: Payout eligibility (assumption, confirm in `10_memory.md` Q12): only advances of bookings that are `completed` (or retained after no-show/late cancel) are paid out. Advances for future bookings stay held until the service day, so refunds never need clawback.

## 7. Design.md reconciliation rules (added 20/10/2026, apply in every step)
`Design.md` is Vijay's file and is kept unchanged. Where it differs from other documents, use this table:
| # | Topic | Design.md says | We do |
|---|---|---|---|
| 1 | Routes | `/signup`, `/signin`, `/forgot-password`, `/splash` | Existing app routes win: `/register`, `/login`, `/forgot-password`; `/splash` is new. Design.md's own rule: "preserve existing routes" |
| 2 | Sign-up fields | Name, Email, Mobile Number, Password, Confirm | **00_MASTER R4 wins**: Full name, Email, **Date of birth**, **WhatsApp number (+91)** (this replaces "Mobile Number"), Password, Confirm, consents. Tabs "I'm a customer / I own a parlour" (11_SCREENS §B); owner tab keeps the existing owner flow |
| 3 | Brand name on public site | "Aura" | Use the brand name written in Design.md for the public showcase. "BeautyZone" is only the working name of the platform in docs/admin (Q17) |
| 4 | Service search | Immediate, no debounce | Immediate. (Earlier "150ms debounce" in other docs is removed) |
| 5 | Motion values | Design.md §9 | Design.md §9 wins over numbers in 04_TECHSPEC §11 |
| 6 | Team route | `/team/:slug` | Showcase home uses `/team/:slug`; tenant salon sites use `/salon/:slug/team/:staffId` (11_SCREENS). Same template component (Q18) |
| 7 | Scope | Last paragraph says "implement the complete website" | **Ignored.** Each step prompt gives the scope. Design.md §11 and §12 also describe the whole project; use them only for items inside the step's scope |
| 8 | Money / language | no prices shown | If a price is ever shown: ₹, Indian grouping. Copy stays Indian English |
| 9 | Priority | — | 06_RULES > 00_MASTER > Design.md (LOOK only) > 11_SCREENS (which screens/sections) > PRD > rest |
