# Dees Language Lounge — Marketing Website

Production marketing site for **Dees Language Lounge**, a live online language school (French · Spanish · German · IELTS) whose highest-value funnel is TEF/TCF Canada exam prep for Canada-PR aspirants.

- **Homepage (`/`)** — Variant B, the multi-language school. **Zero** Canada-PR messaging.
- **`/french-canada`** — Variant A, the TEF/TCF Canada · CLB 7 · PR landing page. All paid Canada-PR traffic lands here.
- One brand, **one CTA everywhere** ("Book a free level assessment"), one booking flow underneath.

## Tech stack

- **Next.js 14** (App Router, TypeScript)
- **Tailwind CSS** (compiled; tokens in `tailwind.config.ts` from `DESIGN.md`)
- Fonts via `next/font/google`: Hanken Grotesk (body/UI + headlines), Libre Caslon Text (italic accent words), Anton (display headings used in the exports)
- **Supabase** for lead capture (`leads` table) via `/api/leads`
- **Embla** for the goals carousel
- Deploy target: **Vercel**

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in values (see below)
npm run dev                  # http://localhost:3000
```

Scripts: `npm run dev` · `npm run build` · `npm run start` · `npm run lint` · `npm run typecheck`.

## Environment variables (`.env.example`)

| Var | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (present for completeness) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server-only** — used by `/api/leads` to insert (bypasses RLS) |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Digits only, incl. country code, no `+` (e.g. `919876543210`) |
| `NEXT_PUBLIC_GA4_ID` | GA4 measurement ID (blank = disabled) |
| `NEXT_PUBLIC_META_PIXEL_ID` | Meta Pixel ID (blank = disabled) |
| `NEXT_PUBLIC_SITE_URL` | Absolute site URL for metadata/sitemap/canonical |

## Supabase setup

Run [`supabase/leads.sql`](supabase/leads.sql) in the Supabase SQL editor. It creates `public.leads` with RLS **on** and **no public policies** — writes happen only server-side with the service role key. Columns: `id, created_at, type, name, email, phone, language, goal, preferred_time, message, source_page, utm_source, utm_medium, utm_campaign`.

> Without Supabase configured, `/api/leads` degrades gracefully: it logs the lead and returns `ok` so the form success state (and WhatsApp fallback) still works in local dev.

## The single conversion switch

Every CTA resolves its destination through `lib/cta.ts`, driven by one value in `content/site.ts`:

```ts
ctaMode: "form" | "whatsapp"   // 'form' (default) → /book-assessment ; 'whatsapp' → wa.me deep-link
```

Both paths are fully built. Switching is this one-line change.

## Architecture

- **`/content`** — every string, stat, teacher, batch, testimonial and FAQ lives here as typed TS. The future real-content swap is **data-only**; components never change.
- **`/components/sections`** — each section is isolated and props-driven, so any one can be swapped without touching its neighbors. To redesign a section, add a `…V2.tsx` sibling and diff before deleting the old one.
- **`/components/layout`** — shared PromoBar, Navbar (+ mobile drawer), Footer, WhatsApp widget. `lib/chrome.ts` resolves the route-specific promo + footer (so `/french-canada` gets its compliance-line footer).
- **`/components/ui`** — atoms (CTAButton, SectionHeading, Card, form fields, PillBadge, GlowContainer, Icon).

## Routes

| Route | Notes |
|---|---|
| `/` | Home (Variant B) |
| `/french-canada` | Canada-PR landing (Variant A) + compliance line |
| `/about` | About |
| `/book-assessment` | Lead form → `/api/leads`; reads `?lang=`, `?goal=`, `?batch=` |
| `/courses/french` | **301 → `/french-canada`** (canonical) |
| `/courses/spanish\|german\|ielts` | "Coming soon" stubs |
| `/free-resources` | Stub |
| `/contact` | Form + WhatsApp |
| `/privacy` · `/terms` · `/cookies` | Legal (placeholder copy) |
| `/api/leads` | Lead insert (assessment / newsletter / contact) |
| `sitemap.xml` · `robots.txt` | Generated |

## Deploy (Vercel)

1. Push to a Git repo and import into Vercel.
2. Add all env vars from the table above in **Project → Settings → Environment Variables**.
3. Run `supabase/leads.sql` against your Supabase project.
4. Deploy. Set `NEXT_PUBLIC_SITE_URL` to the production domain.

---

## ⚠️ Replace-before-launch checklist

All current content is **DRAFT / PLACEHOLDER**, approved for layout only. Files with placeholder data carry a top-of-file comment.

- [ ] **Stats** — `content/home.ts`, `content/frenchCanada.ts`: 500+/92%/50+/4.9. Every stat must be real & verifiable.
- [ ] **Teachers** — real names, **permissioned photos**, real credentials (`homeTeachers`, `fcTeachers`, `aboutFaculty`). Do not publish invented trainer profiles.
- [ ] **Batches** — real dates and real seat counts only (fake scarcity gets screenshotted).
- [ ] **Testimonials** — real, permissioned students only.
- [ ] **Promo bar CRS numbers** (`fcPromo`) — update after every draw (every 2–3 weeks) from IRCC's rounds page.
- [ ] **Images** — download the Stitch-hosted images (currently `lh3.googleusercontent.com`; the `aida/…` session URLs won't resolve outside Stitch) into `/public` and update the `src` values, then tighten `next.config.mjs` `remotePatterns`.
- [ ] **Contact details** (`content/contact.ts`) — real email, phone, address.
- [ ] **Legal pages** (`content/legal.ts`) — replace with finalised, lawyer-reviewed Privacy / Terms / Cookie copy.
- [ ] **WhatsApp number**, **GA4 ID**, **Meta Pixel ID** — set real env values.
- [ ] **Socials** (`content/site.ts`) — real profile URLs.

### Content guardrails (keep these true)

- One CTA everywhere: "Book a free level assessment." No competing buttons.
- Homepage `/` stays **PR-free**. `/french-canada` keeps PR/TEF/TCF **and** its compliance line.
- Never promise PR, an ITA, or a timeline guarantee.

---

## Out of scope (future phases)

This build is the **public marketing website** (feature-list Section 1). The Student / Tutor / Admin portals and platform auth/payments (feature-list Sections 2–5, including their Phase-0 items) are a separate authenticated application, not part of this repo.
