Awesome — here’s the **complete, end-to-end PRD** for **Luminar v1** (frontend, backend, database, payouts, deployment, UX, security). It’s written so you can drop it into Cursor and build against it immediately.

---

# LUMINAR — Product Requirements Document (PRD)

**Version:** v1 (Chapter One: “Hidden Glow”)
**Paradigm:** Web3.5 (off-chain gameplay + server payouts)
**Infra:** Frontend → **Vercel** · Backend → **Railway** · DB/Realtime/Storage → **Supabase** · Auth/Wallets → **Privy** · Bot Protection → **Cloudflare Turnstile**
**Chain:** Solana (MVP payout: backend multisend)

---

## 0) Summary

Players solve **three clues** to reveal **fragments** that combine into a **chapter code**. The **first 10** users to submit the correct code on **Claim** become winners and can **claim equal shares** of the chapter prize pool to any Solana address (default: embedded wallet via Privy).

* Chapter 1 game type: **Hidden Glow** — fragments are subtly embedded in images; players type what they see.

---

## 1) Scope & Non-Goals

### In Scope

* Auth via Privy (email / embedded wallet).
* Clue solving (3 clues) + server verification.
* Atomic “first-10” qualification + Claims.
* SOL payouts from a server-held **prize vault** keypair.
* Live “Slots remaining” ticker.
* Admin: End chapter + publish “chapter pack” JSON for transparency.

### Out of Scope (v1)

* No on-chain attestation.
* No Merkle distributor (self-claims) — can be v1.2.
* No complex game engines / 3D.
* No Upstash or external rate-limit service.

---

## 2) UX / Design

### Theme

* **Colors:**

  * Background: `#0B0B0F` (near-black)
  * Surfaces: `#111216`, `#15171A`
  * Text: `#FFFFFF` (primary), `#B7BCC3` (muted)
  * Accents/Sheen: subtle silver/white gradiations
* **Buttons:** White base with a **soft silver sheen** on hover (no bounce).
* **Animations:** Micro only (100–150ms). Subtle slide/fade; no elastic/bouncy.

### Components

* **App Shell:** Logo (Luminar), user avatar (Privy), “Slots Left” pill.
* **Chapter Card:** Title, window, “Enter Chapter”.
* **Clue View:** 16:9 image pane, input, submit, helper text.
* **Code Bar:** 3 chips → `?? - ?? - ??`, then reveal fragments → final code (monospace, faint outer glow).
* **Claim Page:** Rank banner (“You’re #X of 10”), address field (pre-filled with embedded wallet), confirm modal, success with tx link.
* **Toast/Status:** success (soft green), error (soft red), neutral (slate).

### Accessibility

* Min contrast 7:1 for all text.
* “Increase glow contrast” toggle for images.
* Tap to zoom (mobile) on images.

---

## 3) Frontend (Next.js on Vercel)

### Routes & Pages

* `/` — Landing (CTA: “Start Chapter”).
* `/chapter/:id` — Chapter hub (shows 3 clues + Code Bar + Slots ticker).
* `/chapter/:id/clue/:n` — Clue detail (image + input).
* `/claim/:id` — Claim (if qualified).
* `/admin` — Minimal admin portal (auth-guarded by env-list email/ids).

### State & Data

* **Auth:** Privy React SDK → user + access token.
* **Chapter Data:** `GET /api/chapters/:id` (SSR/CSR).
* **Clue Submit:** `POST /api/clues/:id/submit` → reveal fragment.
* **Qualify:** `POST /api/chapters/:id/qualify` (once all 3 solved).
* **Slots:** Subscribe to Supabase Realtime channel to update “remaining”.
* **Claim:** `POST /api/chapters/:id/claim`.

### Component Structure (suggested)

```
/components
  /ui
    Button.tsx
    Card.tsx
    Input.tsx
    Pill.tsx
    Toast.tsx
  CodeBar.tsx
  ClueCard.tsx
  SlotsTicker.tsx
  ClaimForm.tsx
```

### Design Tokens (CSS variables)

```css
:root {
  --bg: #0B0B0F; --surface: #111216; --surface-2: #15171A;
  --text: #FFFFFF; --muted: #B7BCC3; --glow: rgba(255,255,255,0.18);
  --success: #B1F3C1; --error: #F4B1B1;
  --btn-bg: #FFFFFF; --btn-fg: #0B0B0F;
  --btn-sheen: linear-gradient(180deg,#FFFFFF 0%,#EDEFF2 40%,#DCE1E6 100%);
  --radius: 14px; --shadow: 0 6px 22px rgba(0,0,0,.35);
}
```

---

## 4) Backend (Express on Railway)

### Responsibilities

* Verify **Privy access tokens**.
* Verify **Turnstile** tokens (server-side) for `/submit`, `/qualify`, `/claim`.
* Manage **Supabase** reads/writes.
* Enforce **atomic “first-10”** qualification in a single DB transaction.
* Execute **SOL payouts**; return `tx_sig`.
* Publish **chapter pack** JSON to Supabase Storage (admin action).

### REST API (prefix `/v1`)

**Auth headers**

* `Authorization: Bearer <privy-access-token>`
* `x-turnstile-token: <cf-turnstile-response>` (mutating routes)

#### 4.1 Clue Submit

`POST /v1/clues/:clueId/submit`
Body: `{ "answer": "042" }`
200:

```json
{ "fragment": "042", "proof_id": "uuid" }
```

Errors: `400 invalid_answer`, `403 bot_check_failed`, `401 unauthorized`, `429 cooldown`, `500`.

#### 4.2 Qualify

`POST /v1/chapters/:id/qualify`

* Preconditions: user has **3 verified proofs** for this chapter.
* DB transaction: insert/update qualification, compute **rank** deterministically (by `completed_at`, then `user_id`).
  200:

```json
{ "qualified": true, "rank": 6 }
```

Else: `{ "qualified": false, "reason": "not_enough_proofs" }`

#### 4.3 Slots

`GET /v1/chapters/:id/slots`
200: `{ "remaining": 3 }`

#### 4.4 Claim

`POST /v1/chapters/:id/claim`
Body: `{ "code": "LUMI042NAR", "to": "SoL...Address" }`

* Validate: user is a **winner (rank ≤ 10)**, not claimed; `code` matches chapter `code_hash`.
* Execute SOL transfer (pot/10) → `tx_sig`
  200:

```json
{ "status": "paid", "tx_sig": "5mx...aK" }
```

Errors: `400 bad_code`, `409 already_claimed`, `404 not_winner`, `500 payout_failed`.

#### 4.5 Admin End Chapter

`POST /v1/admin/chapters/:id/end` (admin-guarded)

* Lock chapter (`status = ended`).
* Compute winners list + amounts.
* Write **chapter pack** JSON to Supabase Storage; return URL.
  200:

```json
{ "chapter_pack_url": "https://storage/.../chapters/1-pack.json" }
```

### Validation & Cooldowns (lightweight)

* Per-user in-DB cooldown column for `/submit` wrong answers (e.g., next attempt allowed after `now() + 10s`).
* No external ratelimit service.
* Turnstile **must pass** for all mutating routes.

### Errors (standardized)

* `error`: machine code (snake\_case)
* `message`: brief, user-safe text
* `retry_after`: optional seconds for cooldowns

---

## 5) Database (Supabase Postgres)

### Schema

```sql
-- USERS
create table users(
  id uuid primary key default gen_random_uuid(),
  privy_user_id text unique not null,
  email text,
  created_at timestamptz default now()
);

-- CHAPTERS
create table chapters(
  id serial primary key,
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text check (status in ('scheduled','active','ended')) not null,
  code_hash text not null,          -- sha256(normalized final code)
  pot_lamports bigint not null default 0
);

-- CLUES
create table clues(
  id serial primary key,
  chapter_id int references chapters(id) on delete cascade,
  order_index int not null,
  prompt text not null,             -- descriptive caption (no answers)
  answer_hash text not null         -- sha256(normalized answer)
);

-- PROOFS (one per user per clue)
create table proofs(
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  chapter_id int references chapters(id) on delete cascade,
  clue_id int references clues(id) on delete cascade,
  proof_hash text not null,         -- hash of normalized answer
  verified_at timestamptz not null
);
create unique index proofs_user_clue_uniq on proofs(user_id, clue_id);

-- QUALIFICATIONS (one per user per chapter)
create table qualifications(
  id serial primary key,
  user_id uuid references users(id) on delete cascade,
  chapter_id int references chapters(id) on delete cascade,
  completed_at timestamptz not null,
  rank int
);
create unique index qual_user_chapter_uniq on qualifications(user_id, chapter_id);
create index qual_chapter_rank_idx on qualifications(chapter_id, rank);

-- WINNERS (top 10)
create table winners(
  id serial primary key,
  chapter_id int references chapters(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  rank int not null check (rank between 1 and 10),
  claim_address text,
  claim_tx text,
  claimed_at timestamptz
);
create unique index winners_chapter_user_uniq on winners(chapter_id, user_id);
create unique index winners_chapter_rank_uniq on winners(chapter_id, rank);

-- OPTIONAL: COOLDOWNS
create table throttles(
  user_id uuid references users(id) on delete cascade,
  clue_id int references clues(id) on delete cascade,
  next_allowed_at timestamptz not null,
  primary key(user_id, clue_id)
);
```

### RLS (high level)

* Enable RLS; app server uses **service key** for privileged writes.
* Client (frontend) reads via backend only (no direct Supabase reads needed for protected data).

### Realtime

* Broadcast on `winners` table; backend derives `remaining = 10 - count(distinct rank where claimed_at is null or rank assigned)` and emits via a channel the frontend subscribes to.

### Storage

* Buckets: `chapters/` (images), `packs/` (chapter pack JSON).
* Public read; admin uploads via signed service key.

---

## 6) Game Content (Chapter 1: Hidden Glow)

### Assets

* `chapters/1/clue-1.png` → fragment e.g., “LU”
* `chapters/1/clue-2.png` → fragment e.g., “MI”
* `chapters/1/clue-3.png` → fragment e.g., “042”
* Final code (example): `LUMI042NAR` → store `sha256(normalized)` in `chapters.code_hash`.

### Image Guidance

* Size: 1280×720 (desktop) responsive to 16:9.
* Fragment opacity \~0.2–0.3; mild glow; legible at 125% zoom.
* Optional alt text hint: “A faint code glows near the lower edge.”

### Answer Normalization

* Lowercase, trim, collapse multiple spaces to single, remove leading/trailing punctuation if any.

---

## 7) Security & Fairness

* **Privy token verification** on every request.
* **Turnstile server verification** on `/submit`, `/qualify`, `/claim`.
* **Atomic Qualify:** use DB locks / sequence to guarantee **deterministic rank** (order by `completed_at asc, user_id asc`).
* **Per-clue cooldown:** write `throttles.next_allowed_at = now()+10s` on wrong answer; block until time passes.
* **Logging:** Only event logs (user\_id, clue\_id, result, timestamps); never log raw answers or private keys.
* **Payout safety:** Pre-check `to` address (base58 format, length 32–44). Add a confirmation modal: “Payouts are final”.

---

## 8) Payouts (Solana)

### Vault

* A dedicated **vault keypair** on the backend (Railway secret).
* Funded with the chapter pot.
* **Per-tx amount:** `floor(pot_lamports / 10)`.

### Flow

1. Verify claim preconditions (winner, not claimed, valid code).
2. Create `SystemProgram.transfer({ from: vault, to, lamports: share })`.
3. Send & confirm; get `tx_sig`.
4. Update `winners.claim_tx` + `claimed_at`.
5. Return `{ status: 'paid', tx_sig }`.

### Reliability

* Retry send on transient RPC failures (exponential backoff; max 3).
* If send returns `already processed`, proceed to confirm.
* Idempotency: set a `claim_id` and recheck DB state before re-issuing the transfer.

---

## 9) Admin & Chapter Pack

### Admin Portal (simple)

* Create/Edit chapter (title, time window, code hash).
* Upload clues (image + answer hash).
* **End Chapter** button → runs backend:

  * Locks chapter (status = ended)
  * Gathers winners + amounts
  * Writes JSON to `packs/chapter-<id>.json` and returns URL
  * Displays final winners list + copyable tx links (once claimed)

### Chapter Pack JSON (transparency)

```json
{
  "chapter_id": 1,
  "cutoff_iso": "2025-09-14T21:00:00Z",
  "winners": [
    { "rank": 1, "address": "SoL...", "amount_lamports": 750000000, "tx": "5mx...aK" },
    ...
  ]
}
```

---

## 10) Dev & Repo Structure (Cursor-friendly)

```
/apps
  /web  (Next.js on Vercel)
    /components
    /pages
      index.tsx
      chapter/[id]/index.tsx
      chapter/[id]/clue/[n].tsx
      claim/[id].tsx
      admin/index.tsx
    /lib (supabase client for realtime only)
    /styles
  /api  (Express on Railway)
    /src
      index.ts
      middleware/auth.ts
      middleware/turnstile.ts
      routes/clues.ts
      routes/chapters.ts
      routes/admin.ts
      services/supabase.ts
      services/solana.ts
      services/qualify.ts
      utils/normalize.ts
    package.json
```

### Env Vars

**Frontend (Vercel):**

* `NEXT_PUBLIC_PRIVY_APP_ID`
* `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
* `NEXT_PUBLIC_SUPABASE_URL`
* `NEXT_PUBLIC_SUPABASE_ANON_KEY` (for realtime read only)

**Backend (Railway):**

* `PRIVY_APP_ID`, `PRIVY_SECRET`
* `TURNSTILE_SECRET`
* `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
* `RPC_URL` (mainnet or your provider)
* `VAULT_SECRET_KEY` (base58 secret for prize vault)
* `ADMIN_EMAIL_ALLOWLIST` (CSV)

---

## 11) Implementation Notes (backend skeleton behavior)

### Normalize Answers

```ts
export const normalize = (s: string) =>
  s.toLowerCase().trim().replace(/\s+/g, ' ');
```

### Qualify (SQL sketch, single tx)

* Verify 3 proofs exist.
* Insert/update `qualifications` with `completed_at = now()` if earlier.
* Compute `rank` by:

```sql
WITH ordered AS (
  SELECT user_id,
         ROW_NUMBER() OVER (ORDER BY completed_at ASC, user_id ASC) AS r
  FROM qualifications WHERE chapter_id = $1
)
INSERT INTO winners(chapter_id,user_id,rank)
SELECT $1, user_id, r FROM ordered WHERE r <= 10
ON CONFLICT DO NOTHING;
```

* Return your user’s `rank` if any.

### Turnstile Verify (server)

* `POST https://challenges.cloudflare.com/turnstile/v0/siteverify`
* Form: `secret`, `response`, optionally `remoteip`
* Require `{ success: true }` else 403.

### Privy Verify

* Parse/verify access token per Privy docs; map to `privy_user_id` → `users.id`.

---

## 12) QA / Test Plan

**Functional**

* Clue submit: correct → fragment; wrong → error + 10s cooldown.
* Qualify: only after 3 proofs; multiple retries return same rank; 11th user never promoted.
* Slots ticker: decrements on each new winner assignment.
* Claim: correct code + winner → payout succeeds & returns tx; duplicate claim blocked.

**Edge Cases**

* Simultaneous qualifies: ensure deterministic ranks (no duplicates).
* Wrong claim address format → 400.
* RPC outage → `payout_failed`, user can retry.

**Perf**

* First contentful paint quick; images lazy-loaded; no blocking scripts.
* DB queries indexed; API ttfb < 300ms typical.

---

## 13) Risks & Mitigations

* **Bots / Scripts:** Turnstile + cooldowns + minimal obfuscation on images.
* **Rank race conditions:** Single-tx qualify with deterministic ordering.
* **Payout key exposure:** Keep vault secret in Railway env; never log; rotate if suspected.
* **Support load for wrong addresses:** Two-step confirm with “I understand payouts are final”.

---

## 14) Roadmap (post-v1)

* **v1.1:** Add chapter theme variations (cipher, order puzzle), admin metrics page.
* **v1.2:** Merkle distributor for self-claims (trust-minimized payouts).
* **v1.3:** Optional connect external wallet via Privy, export embedded wallet.

---

## 15) Content Checklist (ship list)

* [ ] 3 images with hidden fragments (PNG/SVG), 16:9.
* [ ] Final code chosen; `code_hash` set in DB.
* [ ] Copy strings (errors, help text, confirm modal).
* [ ] Logo/SVG + favicon.
* [ ] Chapter pack JSON template.

---
