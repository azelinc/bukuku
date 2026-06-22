# Bukuku Smart Tutor — Project Context

## What This Is
Educational KSSR quiz PWA for Azly's kids (Alya, Afeef, Ayza).  
Single-page app, vanilla HTML/CSS/JS (no framework).  
Deployed on GitHub Pages behind Cloudflare CDN.  
Firebase Firestore + Auth for persistence.

## Key URLs
- **Live:** https://bukuku.my (CNAME → azelinc.github.io/bukuku)
- **GitHub:** https://github.com/azelinc/bukuku
- **Local:** /opt/data/bukuku/
- **Firebase console:** af-adventure-hub

## Tech Stack
| Layer | Choice |
|-------|--------|
| UI | Vanilla HTML/CSS/JS (no framework) |
| Auth | Firebase Auth (Email/Password only) |
| DB | Firebase Firestore |
| Storage | GitHub Pages (static, no build step) |
| CDN | Cloudflare (proxied, 10min cache) |
| PWA | manifest.json + sw.js (cache-first for static) |

## File Layout
- `index.html` — main app: auth, profile selection, subject/topic selection, quiz
- `login.html` — dedicated login/sign-up page
- `admin.html` — admin panel (owner only, see below)
- `school.html` — textbook practice (years 4-6)
- `schoolhigh.html` — textbook practice (secondary / higher years)
- `tuition-tb.html` — textbook-based tuition interface
- `tuition-quiz.html` — quiz interface
- `mobile.css` / `pc.css` — responsive stylesheets
- `manifest.json` — PWA manifest
- `sw.js` — service worker (current version in filename/label)
- `CNAME` — bukuku.my

### Content Files
**Question banks (older format):** `math.json`, `sci.json`, `eng.json`, `rbt.json`

**Textbook content (newer format):**
- `math4-tb.json` through `math6-tb.json` — DLP Maths Years 4-6
- `sci4-tb.json` through `sci6-tb.json` — DLP Science Years 4-6
- `eng4-tb.json` through `eng6-tb.json` — English (common subject)
- `bm4-tb.json` through `bm6-tb.json` — Bahasa Melayu (common subject)
- `math4-bm.json`, `sci4-bm.json` — BM (Bahasa Melayu) versions of Math/Science
- `topic-counts.json` — metadata for all topics

**Activities (archived — not linked in UI):** `book-dragon.html`, `book-space.html`, `book-squirrel.html`, `book-solar.html`, `buku-tenaga-air.html` (buku cerita / storybooks); `game-dragon-dash.html`, `game-memory-match.html`, `games.html`, `sifir.html`, `storybook.html`, `train-engine.html`, `tuition-quiz.html`, `mathhigh.html`, `school.html`, `schoolhigh.html`

## Firestore Schema

### `admins/{uid}` — Account & Plan
| Field | Type | Notes |
|-------|------|-------|
| email | string | From Firebase Auth |
| subscription.plan | string | `"free"` or `"premium"` |
| createdAt | timestamp | Server-generated |
| updatedAt | timestamp | On plan change |

### `profiles/{uid}/children/{childName}` — Kid Profile
| Field | Type | Notes |
|-------|------|-------|
| name | string | Document ID == child name |
| tahun | number | 4, 5, or 6 (school year) |
| dlp | boolean | DLP (English) mode. Default `true`. |
| createdAt | timestamp | |
| lastLogin | timestamp | On profile select |
| scores | map | Legacy quiz scores |
| tb_scores | map | Textbook topic scores (current) |
| progress | map | Progress tracking |

### `profiles/{uid}` — Metadata
| Field | Type |
|-------|------|
| children | array of strings (e.g. `["Alya", "Afeef", "Ayza"]`) |

## Auth & Access
- **Owner:** `azel.inc@gmail.com` only — has admin panel access
- **Everyone else:** "Parent" role, no admin panel
- **LocalStorage bridge:** Both `index.html` and `login.html` save `{ email, uid }` to `localStorage.setItem('bukuku_auth', ...)` for instant auth recognition before Firebase resolves
- **onAuthStateChanged:** Real auth listener corrects stale state after localStorage bridge

## Deploy
- **No build step** — static files served directly
- **Trigger:** `git push origin main` → GitHub Actions auto-deploys (~30-60s)
- **NO staging environment** — changes go directly to prod
- **Git:** origin is `https://azelinc:{token}@github.com/azelinc/bukuku.git`
- **Token:** Stored in `~/.config/gh/hosts.yml`
- **Push script:** `/opt/data/scripts/push_bukuku.py`
- **Git config:** user.name=azelinc, user.email=azel.inc@gmail.com

### Verification
```bash
# Check deploy status
curl -s "https://api.github.com/repos/azelinc/bukuku/deployments?per_page=1" | grep -E '"id"|"ref"|"environment"'

# Bypass CDN cache to verify
curl -s "https://bukuku.my?v=$(date +%s)" | head -5

# Check local diff before push
cd /opt/data/bukuku && git diff --stat
```

## CDN & Caching
- Cloudflare CDN: `max-age=600` (10 minutes)
- After deploy, CDN edge may serve stale HTML for up to 10 min
- **Always verify with a cache-busting query param:** `?v=timestamp` or `?cb=<date>`
- **Service worker:** Never caches HTML. Cache-first for static assets. Pre-caches BM JSONs.

## Key Gotchas & Past Fixes
- **Firestore paths:** `doc()` needs EVEN segments, `collection()` needs ODD.  
  Correct: `profiles/{uid}/children/{name}`
- **Non-DLP profiles** see DLP subjects but with BM labels. Progress key prefix: `bm_` for BM.
- **New sign-ups** start with ZERO profiles (migration only runs for owner)
- **Admin label:** Non-owners see "Parent" not "Admin"
- **SW version:** Bump cache version in sw.js when deploying asset changes
- **Archived content:** Old features (storybooks, games, sifir, school.html, tuition-quiz.html, etc.) exist on filesystem but have zero navigation links in index.html. Only KSSR textbook practice (tuition-tb.html) is active. Don't relink dead content without confirmation.
- **Admin: Delete Account** — admin.html: Delete button removes all Firestore data (admin doc + profiles + children), but cannot delete the Firebase Auth user itself from client-side JS. Auth account becomes orphan. Owner account (azel.inc@gmail.com) is protected from deletion.

## AGENTS.md conventions for this repo
- Keep this file focused on project structure and conventions.
- Soul/vibe instructions for Hermes belong in SOUL.md.
- Operational procedures (deploy, backup) belong in skills if they're reusable patterns.
