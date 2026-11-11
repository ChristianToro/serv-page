# PLAN.md: Services Landing Page (Source of Truth)

> This document is the single source of truth for the build. If something is not in here, the agent asks before doing it. Decisions made during the build get recorded in **Section 12: Decision log**.

---

## 1. Purpose

A one-page "services offered" hub for **{{YOUR_NAME}}**, a developer who sets up simple AI and automation systems for small, owner-run local shops. The page explains what is offered in plain language, shows tiered packages, and invites visitors to email about contract work.

**The case it is built around (do not name it on the page):** a two-person bike repair shop. Customers book by texting the shop phone or messaging its social page. The owner replies between jobs, often hours late. The schedule lives on a paper calendar, and Saturdays have been double-booked. Her words: *"I just want to stop losing jobs because I didn't get back to someone."* She has been sold software before that she never managed to use, and she isn't sure she can afford help.

**What the page must make a visitor like her feel:** "This person understands my actual problem, it sounds simple, I can see what it costs, and emailing them is easy."

## 2. Audience

- **Primary:** owners of small local shops (repair shops, salons, studios, trades) with 1 to 5 people, who take bookings by text, phone, and social DMs.
- **Traits to design for:** busy, often reading on a phone between tasks, skeptical of software, unfamiliar with AI jargon, price-sensitive.
- **Not the audience:** tech companies, enterprise buyers, other developers.

## 3. Locked decisions (from the planning Q&A)

| Area | Decision |
|---|---|
| Audience | Small local shops (the bike shop is the archetype, not named on the page) |
| Visual direction | taste-skill `design-taste-frontend` + `industrial-brutalist-ui` |
| Dials | `DESIGN_VARIANCE = 7`, `MOTION_INTENSITY = 6`, `VISUAL_DENSITY = 4` |
| Stack | Plain HTML / CSS / JS. No framework, no build step |
| Motion | Vanilla only: CSS transitions/keyframes + `IntersectionObserver`. **No GSAP**, no animation libraries |
| Palette | Monochrome + one signal color: safety orange |
| Services | (1) One inbox + instant reply, (2) Online booking, (3) Setup, training, support |
| Pricing | Tiered packages (3), prices are placeholders until after the Day 4 client conversation |
| Contact | Email link only (`mailto:`), plus a visible, copyable email address |
| Proof | Before/after flow diagram (generic, no named business) |
| Branding | Personal brand under the user's own name: `{{YOUR_NAME}}`, `{{CONTACT_EMAIL}}` |

**Explicitly out of scope:** reminders / "your bike is ready" status texts (not offered), testimonials, client logos, invented stats or client counts, contact forms, booking widgets, analytics, cookie banners, a blog, multiple pages.

## 4. Design system

### 4.1 taste-skill setup

Install before any UI work:

```bash
npx skills add https://github.com/Leonxlnx/taste-skill --skill "design-taste-frontend"
npx skills add https://github.com/Leonxlnx/taste-skill --skill "industrial-brutalist-ui"
# Optional, only if output gets truncated or placeholder comments appear:
npx skills add https://github.com/Leonxlnx/taste-skill --skill "full-output-enforcement"
```

- After install, open the installed `design-taste-frontend` SKILL.md and set the dials at the top of the file to the values in Section 3. (The README says the numbers at the top of the file are the 1 to 10 dials but does not state defaults; set them explicitly and confirm.)
- `design-taste-frontend` v2 is marked experimental. If its behavior conflicts with this plan, **this plan wins**. If v2 is unusable, stop and ask before switching to `design-taste-frontend-v1`.
- v2 includes GSAP code skeletons. **Ignore them.** Translate any motion intent into vanilla CSS/JS (Section 4.5).
- v2 enforces a hard em-dash ban. It applies to all page copy. Use colons, commas, periods, or parentheses.
- Run the skill's pre-flight check before calling any phase done.

### 4.2 Dial interpretation

- **DESIGN_VARIANCE 7:** asymmetric 12-column grid. Section headings offset from body columns. Oversized section numbers (`01`, `02`, `03`). Avoid the centered-hero-plus-three-equal-cards template.
- **MOTION_INTENSITY 6:** scroll-driven reveals and one sequenced scroll animation (the before/after flow). No cursor-following, magnetic, or parallax effects.
- **VISUAL_DENSITY 4:** generous whitespace, one idea per block. Readable on a phone at arm's length.

### 4.3 Color tokens

Define as CSS custom properties at the top of `css/styles.css`. Values are a starting point; the agent may tune within the rules and must log changes.

```css
:root {
  --ink:        #0A0A0A; /* near-black: text, rules, borders */
  --paper:      #F5F5F0; /* off-white: main background */
  --white:      #FFFFFF;
  --signal:     #FF5F00; /* safety orange: the only accent */
  --gray-700:   #3A3A3A;
  --gray-300:   #BDBDB8; /* rules and dividers only, never text */
}
```

**Contrast rules (WCAG AA):**
- `--ink` on `--paper`: body text, default.
- `--paper` on `--ink`: inverted sections.
- `--signal` as a **fill** with `--ink` text on top (about 6.5:1, passes).
- `--signal` as **text or lines on `--ink`** (passes).
- **Never** `--signal` text on `--paper` or `--white` (about 2.8:1, fails). Never white text on `--signal`.
- Orange is rare: primary CTA fill, focus rings, the "after" path in the flow diagram, one or two emphasis marks. If more than about 10% of a screen is orange, pull back.

### 4.4 Typography and form

- Follow `industrial-brutalist-ui` for type choice (Swiss / grotesk direction). Constraints:
  - Max two families: one grotesk sans (display + body) and, optionally, one monospace for labels, numbers, and prices.
  - Self-host `.woff2` files in `assets/fonts/` with `font-display: swap`. No font CDNs.
  - Body text at least 18px on mobile, line length 60 to 75 characters.
  - Log the chosen fonts and license in the Decision log.
- Form language: thick rules (2 to 4px `--ink`), hard edges, **no border-radius**, no soft shadows, no gradients, no glassmorphism. Hard offset shadows (solid `--ink`, e.g. `6px 6px 0`) are allowed on buttons and cards.
- Brutalist structure, friendly voice: the layout can be loud, the words must stay plain and warm. The reader has been burned by software and should never feel talked down to.

### 4.5 Motion spec (vanilla)

- **Progressive enhancement:** all content is visible with JS off. `main.js` adds a `js` class to `<html>`; only then are pre-reveal styles applied.
- **Reduced motion:** under `@media (prefers-reduced-motion: reduce)`, disable all reveals and sequencing; content renders in its final state.
- **Section reveals:** `IntersectionObserver` (threshold about 0.2) adds `.is-visible`. Effect: short translate (16 to 24px) + `clip-path` wipe, 300 to 450ms, a hard `cubic-bezier(.2,.8,.2,1)`-style ease. Each element reveals once.
- **Before/after flow:** steps appear in sequence as the section scrolls into view (staggered 120 to 200ms). The "after" path draws in orange.
- **Buttons:** on hover/focus, the hard offset shadow collapses (button shifts by the shadow offset) in about 80ms; on active, fully pressed. Must also work on keyboard focus.
- **Allowed extra:** one slow horizontal ticker strip (CSS keyframes) with short phrases, paused under reduced motion and on hover. Optional; log if used.
- Animate only `transform`, `opacity`, `clip-path`. No layout-thrashing properties.

## 5. Page structure and copy

Copy below is the draft. The agent may tighten wording for fit but **must not change meaning, add claims, or add numbers**. All copy: plain words, short sentences, second person, no jargon ("omnichannel", "leverage", "AI-powered solutions", "streamline", "synergy" are banned), **no em dashes**.

### 5.0 Header (sticky on scroll, compact)
- Left: wordmark `{{YOUR_NAME}}`.
- Right (desktop): anchor links `Services`, `How it works`, `Pricing`, `Contact`, plus a small `Email me` button.
- Mobile: wordmark + `Email me` button only. No hamburger menu (one page, the anchors are not essential).

### 5.1 Hero
- **Headline:** Stop losing jobs to messages you didn't answer.
- **Subhead:** I set up simple systems for small shops. Every text and message gets a reply right away, customers book their own time, and your calendar can't double-book. You keep doing the work. The system keeps up with the messages.
- **Primary CTA (orange fill):** `Email me about your shop` → mailto (Section 6).
- **Secondary CTA (outline):** `See pricing` → `#pricing`.
- Layout: asymmetric. Headline very large, spanning about 8 of 12 columns, offset left. A large `01` or a thick rule as a structural element. No stock photos, no illustrations of robots or brains.

### 5.2 The problem (three blocks)
Section label: `THE PROBLEM`
1. **Messages come in from everywhere.** Texts, social DMs, calls. Each one is a job, and each one is easy to miss.
2. **Replies wait until your hands are free.** By the time you write back, the customer may have gone somewhere else.
3. **A paper calendar can't say no.** It will let you book the same Saturday twice.

### 5.3 What "AI" means here
Section label: `PLAIN ENGLISH`
- **Heading:** People keep telling you to "get AI." Here's what that actually means.
- **Body:** It means a helper that answers the easy questions for you, instantly, at any hour: "Are you open Saturday?", "How do I book?", "How much is a tune-up?" It replies in your shop's words and hands anything tricky back to you. No robots, no new gadgets. It works with the phone and social page you already use.
- Agent note: the line "works with the phone and social page you already use" is a product claim. Keep it, but list it in Open decisions so the user confirms it is deliverable.

### 5.4 Services (three, numbered)
Section id: `services`. Label: `SERVICES`

**01. One inbox, instant reply**
Texts and social messages land in one place. Every customer gets an immediate reply that says you got their message and how to book. Common questions get answered on the spot. Anything unusual comes to you.

**02. Online booking**
Customers pick an open time themselves, from their phone. Once a slot is taken, it disappears, so the same Saturday can't be sold twice. You see the whole schedule on your phone.

**03. Setup, training, support**
I set everything up for you. Then I show you and anyone who works the counter how to use it, at your shop, until it feels easy. If it isn't getting used, it isn't finished, and I keep helping.

Layout: not three equal cards. Use a staggered/asymmetric arrangement with oversized numbers and thick rules.

### 5.5 How it works: before/after flow
Section id: `how-it-works`. Label: `BEFORE / AFTER`
- **Heading:** Same message. Different ending.
- Two parallel tracks, built in HTML/CSS (not an image), stacked on mobile, side by side on desktop.

**Before** (ink / gray, ends in a struck-through or broken state)
1. 10:12 AM: A customer texts: "Can you look at my brakes this week?"
2. You're mid-repair. The phone stays in your pocket.
3. 4:40 PM: You reply.
4. They already booked somewhere else.

**After** (path drawn in orange, ends in a confirmed state)
1. 10:12 AM: Same text arrives.
2. 10:12 AM: Instant reply with a link to book.
3. 10:15 AM: They pick Saturday, 9:00 AM. The slot locks.
4. You see it on your phone when you finish the repair.

Accessibility: each track is an ordered list (`<ol>`) with a visible heading; timestamps in `<time>` elements. The visual connectors are decorative (`aria-hidden="true"`).

### 5.6 Pricing (three tiers)
Section id: `pricing`. Label: `PRICING`
- **Heading:** Pick what you need. Nothing hidden.
- **Intro line:** Every package includes setup and hands-on training.

| | Tier 1 | Tier 2 | Tier 3 |
|---|---|---|---|
| Working name | {{TIER_1_NAME}} (suggested: "Answer") | {{TIER_2_NAME}} (suggested: "Answer + Book") | {{TIER_3_NAME}} (suggested: "Hands-off") |
| Includes | One inbox + instant reply; setup; training | Everything in Tier 1 + online booking | Everything in Tier 2 + ongoing support: {{TIER_3_SUPPORT_DETAIL}} |
| Price | {{TIER_1_PRICE}} | {{TIER_2_PRICE}} | {{TIER_3_PRICE}} |
| CTA | `Ask about this` (mailto, subject names the tier) | same | same |

- Tier 2 is visually marked as the likely fit (orange fill label, e.g. `MOST SHOPS START HERE`). This label is a claim; confirm in Open decisions or use the neutral `POPULAR PICK` only after confirming. Until confirmed, use no label and just a heavier border.
- **Placeholder rendering:** while tokens are unfilled, prices render as the literal text `PRICE TBD` in monospace so nothing can ship looking real.
- Price format (one-time vs. monthly vs. both) is unknown. Do not invent `/mo` or "setup fee" lines.
- Below the tiers: Not sure which fits? Email me and describe your shop. I'll tell you honestly, even if the answer is "you don't need this yet."

### 5.7 Contact
Section id: `contact`. Inverted section (`--paper` on `--ink`).
- **Heading:** Tell me about your shop.
- **Body:** Two or three sentences is plenty. How do customers reach you now, and what keeps slipping through?
- **Big CTA (orange fill, ink text):** `Email {{YOUR_NAME}}` → mailto.
- **Visible email address** in large monospace, with a `Copy` button (Section 6.2). Many people tap mailto links on devices with no mail app set up; the visible address is the fallback.

### 5.8 Footer
- `{{YOUR_NAME}}`, `{{CONTACT_EMAIL}}`, current year (set statically in HTML, no JS needed).
- One line: AI and automation setup for small local shops.

## 6. Behavior

### 6.1 mailto links
Built from a single config object at the top of `js/main.js`, and also hard-coded in HTML `href`s so links work with JS off.

```js
const CONTACT = {
  email: "{{CONTACT_EMAIL}}",
  defaultSubject: "Question about help for my shop",
  bodyTemplate: "Shop name:\nHow customers reach us now (text, DMs, calls):\nWhat keeps going wrong:\n"
};
```

- General CTAs: `mailto:` + email + `?subject=` + `&body=`, both `encodeURIComponent`-encoded.
- Pricing CTAs: subject `Question about the {{TIER_N_NAME}} package`.

### 6.2 Copy email button
- `navigator.clipboard.writeText()`; on failure, select the address text so the user can copy manually.
- Feedback: button label swaps to `Copied` for about 2s, announced via an `aria-live="polite"` region.

### 6.3 Header
- Becomes compact (smaller padding, bottom rule) after scrolling past the hero. Use `IntersectionObserver` on a sentinel element, not scroll listeners.
- Anchor links use `scroll-behavior: smooth`, disabled under reduced motion.

## 7. Technical spec

### 7.1 File structure
```
/
├── CLAUDE.md
├── index.html
├── css/
│   └── styles.css        # tokens at top, then base, layout, sections, motion
├── js/
│   └── main.js           # config, reveals, flow sequence, header, copy button
├── assets/
│   ├── fonts/            # self-hosted .woff2
│   └── favicon.svg
└── docs/
    └── PLAN.md           # this file
```

### 7.2 Constraints
- No frameworks, no bundler, no npm runtime dependencies (installing the taste-skill skills is the only `npx` use).
- One CSS file, one JS file, `defer`-loaded. Mobile-first CSS.
- Semantic HTML: `<header>`, `<main>`, `<section aria-labelledby>`, `<footer>`. One `<h1>` (the hero headline).
- Breakpoints: design at 360px, 768px, 1200px; must not break between them or at 1920px.
- `<head>`: title (`{{YOUR_NAME}}: AI and automation for small shops`), meta description, Open Graph title/description, favicon, `lang="en"`, viewport meta.
- No images are required. If the agent wants one, ask first.

### 7.3 Budgets and targets
- Total transfer (excluding fonts) under 100 KB; fonts under 150 KB total.
- Lighthouse (mobile): Performance, Accessibility, Best Practices, SEO all 95 or higher.
- No console errors. No layout shift from font loading beyond what `font-display: swap` causes.

## 8. Accessibility requirements
- WCAG 2.2 AA contrast (see 4.3).
- Visible focus on every interactive element: 3px `--signal` outline with offset, never removed.
- Skip link to `<main>` as the first focusable element.
- Tap targets at least 44 by 44px.
- All motion respects `prefers-reduced-motion`.
- Page fully usable and readable with JS disabled.
- Decorative elements (ticker, connectors, big numbers if purely visual) get `aria-hidden="true"`.

## 9. Build phases (agent works in order; stop for review at each checkpoint)

**Phase 0: Setup**
- Create the file structure. Install taste-skill skills (4.1). Set dials. Read both SKILL.md files fully.
- Checkpoint: report installed skills, dial values, and font proposal.

**Phase 1: Structure and copy**
- Write `index.html` with all sections and final draft copy, tokens left as `{{...}}`. Unstyled is fine.
- Checkpoint: user reviews copy in the browser.

**Phase 2: Design system and layout**
- Tokens, type scale, grid, section layouts per Sections 4 and 5. Mobile first, then tablet, then desktop.
- Checkpoint: screenshots at 360, 768, 1200 widths.

**Phase 3: Motion and behavior**
- Reveals, flow sequence, header, buttons, mailto, copy button (Sections 4.5 and 6).
- Checkpoint: demo with motion on, with reduced motion, and with JS off.

**Phase 4: QA**
- taste-skill pre-flight check.
- Accessibility checklist (Section 8), Lighthouse run, contrast check, keyboard-only pass.
- Copy check: search for em dashes (`—`) and banned words; none allowed.
- Checkpoint: QA report with any failures and fixes.

**Launch gate (user-owned, not the agent):**
- `grep -rn "{{" index.html css js` returns nothing.
- No `PRICE TBD` remains.
- All Open decisions resolved.

## 10. Acceptance criteria
- [x] Every section in Section 5 exists, in order, with the specified ids.
- [x] Only the three listed services appear; no reminders/status-text service.
- [x] No testimonials, logos, stats, or claims beyond the approved copy.
- [x] Palette limited to the tokens in 4.3; orange never used as text on light backgrounds.
- [x] Layout is visibly asymmetric at desktop width; not a centered three-card template.
- [x] Motion works, respects reduced motion, and content is complete with JS off.
- [x] All mailto links open with correct subject and body; copy button works with keyboard and announces success.
- [x] Lighthouse mobile 95+ in all four categories; no console errors.
- [x] No em dashes anywhere in visible copy.

## 11. Open decisions (the user resolves these; the agent does not guess)
1. `{{YOUR_NAME}}` and `{{CONTACT_EMAIL}}` values. **Resolved 2026-11-11:** Christian Toro, christian.toro620@gmail.com.
2. Tier names, prices, and price format (one-time, monthly, or both). Expected after the Day 4 client conversation. **Resolved 2026-11-11:** Answer $749, Answer + Book $1,399, Hands-off $2,250; one-time fees, shown as "$X ONE-TIME".
3. Tier 3 support detail (`{{TIER_3_SUPPORT_DETAIL}}`), and any contract terms worth stating. **Resolved 2026-11-11:** "priority support, $399/month". Contract terms: none stated on the page.
4. Whether "works with the phone and social page you already use" (5.3) is a promise you can keep for every client. **Resolved 2026-11-11:** yes, kept as written.
5. Whether to label Tier 2 as the recommended pick, and with what wording. **Resolved 2026-11-11:** no label; heavier border only.
6. Hosting and domain (the page is static and will deploy anywhere). **Resolved 2026-11-11:** GitHub Pages at https://christiantoro.github.io/serv-page/.
7. Open Graph image: none for now, or one designed later. **Resolved 2026-11-11:** type-only card approved, `assets/og-image.png` (1200x630).

## 12. Decision log (agent appends; newest at bottom)

| Date | Decision | Reason | Approved by |
|---|---|---|---|
| 2026-11-10 | Plan created with decisions in Section 3 | Planning Q&A | User |
| 2026-11-10 | Planning docs (`PLAN.md`, `CLAUDE.md`) live at the repo root, not `docs/`; Section 7.1 `docs/` folder dropped | Matches CLAUDE.md's `./PLAN.md` reference | User |
| 2026-11-10 | Skills: `design-taste-frontend` **2.5.1** (current main, `skills-lock.json`) + `industrial-brutalist-ui` pinned to branch `taste-skill-v2` (commit 9da1763; the `archive/taste-skill-v2` tag form fails in the skills CLI) | The Section 4.1 install now yields 2.5.1, a different skill with no dials; `industrial-brutalist-ui` and `-v1` were removed from main. User chose 2.5.1 over the archived dial-driven `design-taste-frontend-v2-experimental` | User |
| 2026-11-10 | Dials 7/6/4 live in PLAN.md Sections 3 and 4.2 only; not written into the skill file | 2.5.1 has no dial block and forbids editing its own files | Agent |
| 2026-11-10 | Brutalist archetype: Swiss Industrial Print (light). The inverted Contact section (5.7) and orange signal (4.3) override the skill's "one substrate" and red accent rules | Skill requires one archetype; PLAN.md wins on palette and sections | Agent |
| 2026-11-10 | Kind for 2.5.1 purposes: `service` (people are hired). Where 2.5.1 conflicts with PLAN.md, PLAN.md wins: no photographs or icons (7.2), section labels and `01/02/03` numbers (4.2, 5.x), scroll reveals (4.5), self-hosted fonts (4.4), no radius (4.4), Tier 2 label rules (5.6) | CLAUDE.md: PLAN.md wins over skills | Agent |
| 2026-11-10 | No brutalist textures (noise, scanlines, halftone) and no randomized strings (`REV 2.6`, `UNIT / D-01`) | Textures need gradients/blend effects (4.4 bans gradients); fake codes read as invented data (Section 3 out of scope) | Agent |
| 2026-11-10 | Fonts: **Archivo** (variable, wght 400-800, wdth 100-125; display at 800 / wdth 125, sentence case) + **IBM Plex Mono** 400 and 500. Latin subset `.woff2` from Google Fonts, self-hosted in `assets/fonts/` with OFL 1.1 license files. Total 119.7 KB (budget 150 KB) | Chosen from a rendered preview; sentence case is gentler for a software-wary audience | User |
| 2026-11-10 | mailto `href`s keep `{{CONTACT_EMAIL}}` / `{{TIER_N_NAME}}` literal (not percent-encoded); everything else matches `encodeURIComponent` | Encoded braces would hide tokens from the launch-gate `grep "{{"` | Agent |
| 2026-11-10 | Pricing CTAs carry the same `bodyTemplate` as general CTAs (6.1 specifies only the subject) | Same config, same useful prompt for the visitor | Agent |
| 2026-11-10 | Price placeholders written as `<!-- {{TIER_N_PRICE}} -->PRICE TBD` | Shows `PRICE TBD` (5.6) while keeping the token greppable | Agent |
| 2026-11-10 | Tier includes read "Everything in {{TIER_1_NAME}}" / "{{TIER_2_NAME}}" instead of "Tier 1" / "Tier 2" | Same meaning; reads naturally once names are filled | Agent |
| 2026-11-10 | "Email me" in the line under the tiers is a mailto link | Usability; no copy change | Agent |
| 2026-11-10 | Copy button ships with `hidden`; `main.js` reveals it | It needs the clipboard API; with JS off the visible address is the fallback (5.7, 8) | Agent |
| 2026-11-10 | Typographic quotes and apostrophes (’ “ ”) in copy | Typesetting only | Agent |
| 2026-11-10 | Favicon: ink square with an orange bar (`assets/favicon.svg`) | Placeholder mark until a name exists | Agent |
| 2026-11-10 | 2.5.1 `copy-lint` on Phase 1: FAIL copy-residue ({{TOKENS}}), WARN two-fragment headings, WARN eyebrow labels. All are plan-mandated; to be waived with reasons in Phase 4 | CLAUDE.md (tokens), PLAN.md 5.5/5.6 (copy), 5.x (labels) | Agent |
| 2026-11-10 | `.gitignore` excludes `.agents/`, `.claude/skills/`, `.taste-skill/`, `shots/`; skills reinstall from `skills-lock.json` | 2.5.1 kit is 1,631 files / 40 MB | User |
| 2026-11-10 | Type scale (fluid `clamp()`, 360 -> 1200, capped for 1920): body 18 / 19 / 20px at 360 / 768 / 1200; lead 18-22; h1 40-104 (Archivo 800, wdth 125, lh 0.98); h2 32-68 (800, wdth 125); h3 22-30 (800, wdth 112); service numbers 80-176; labels 14px Plex Mono 500 uppercase +0.1em; prices 24-32 Plex Mono 500. Measure 65ch | Body >= 18px (4.4); each heading level >= 1.2x the next | Agent |
| 2026-11-10 | Grid: 12 columns from 768px; gutters 16 / 32 / 48px, gaps 16 / 24 / 32px; content max 1280px. Header nav links appear from 1024px (below that: wordmark + Email me, per 5.0) | 4.2, 5.0, 7.2 breakpoints | Agent |
| 2026-11-10 | Hero structural element is a thick 12px ink rule, not a large `01` | Keeps `01-03` for services only; avoids two `01`s on one page | Agent |
| 2026-11-10 | Oversized numbers only on services (`aria-hidden` spans; the `<ol>` carries order for screen readers) | 4.2, 8 | Agent |
| 2026-11-10 | Focus: 3px `--signal` outline, 3px offset, plus a 3px `--ink` halo between element and ring | Orange alone on paper is 2.79:1, under the 3:1 non-text minimum; halo keeps 8's orange ring and passes | Agent |
| 2026-11-10 | Two button styles: orange fill + ink border (primary), transparent + ink border (outline); all with hard ink offset shadow (paper shadow on the ink Contact ground) | One system; 4.4 | Agent |
| 2026-11-10 | All three tier CTAs are outline buttons; Tier 2 marked only by a 6px border and larger shadow | 5.6: no recommendation until Open decision 5 is resolved; an orange Tier 2 button implied one | Agent |
| 2026-11-10 | Before track: paper panel, gray text, dashed connector, struck-through last step. After track: inverted ink panel, orange nodes/connector/timestamps, last step on an orange fill with ink text | 5.5; orange as lines/text only on ink (4.3) | Agent |
| 2026-11-10 | Hero fills the first screen at every width (min-height 100svh minus header) | 2.5.1 hero-fill / fold-action checks; primary CTA visible on load at 1440x900 | Agent |
| 2026-11-10 | 2.5.1 `consistency.mjs --quick` (1440, 390): 48 FAIL left, all to be waived in Phase 4 as plan-mandated: placeholder (CLAUDE.md tokens); no-visual / text-only / card-visual (7.2 no images); copy-headline / copy-fact / copy-headings (5.x copy and labels); heading-scale (label-only h2 for The Problem and Services, 5.2/5.4); stagger / top-stagger / row-gap (4.2 asymmetry, 5.4 stagger); section-air (4.4 thick rules); button-styles 52 vs 64px (5.7 "Big CTA"); container-edges (skill-specific markup names); section-height / one-section / one-heading (2.5.1 "one section per screen" rule; plan sizes sections to content, see open question) | CLAUDE.md: PLAN.md wins | Agent |
| 2026-11-10 | Sections stay sized to their content; 2.5.1's one-section-per-screen rule (section-height / one-section / one-heading) is waived, not adopted | Avoids padding short sections with empty screen height; user approved Phase 2 as shown | User |
| 2026-11-10 | No ticker strip | Optional in 4.5; its phrases would be new copy not in Section 5 | Agent |
| 2026-11-10 | Reveals: translateY 20px + top-down `clip-path` wipe, 420ms, `cubic-bezier(.2,.8,.2,1)`, once per element; applied to section labels, h2s, problem items, plain-English body, service rows, pricing intro/tiers/help line, contact body/CTA/address. Hero never animates. Elements on screen at load start in their final state | 4.5; no flash of hidden content | Agent |
| 2026-11-10 | Reveal trigger uses `threshold: 0` + `rootMargin: 0 0 -20% 0` instead of `threshold: 0.2` | Chrome counts the target's own clip-path in `intersectionRatio`, so a fully clipped element never reaches 0.2 (verified in a test page); the margin keeps the "about 20% into view" intent | Agent |
| 2026-11-10 | Before/after sequence: both tracks play in parallel, 180ms stagger per step; step fades/rises 300ms; connector draws (scaleY) 150ms after its step; After path is orange on ink | 4.5 (120-200ms stagger); side-by-side comparison reads as one story | Agent |
| 2026-11-10 | Header compact state uses transforms only (bar shifts up 12px, contents down 6px, a 2px ink rule wipes in with scaleX) triggered by an IntersectionObserver on a 1px sentinel at the hero's bottom | 6.3; changing padding would shift layout (CLS) and animate a non-allowed property | Agent |
| 2026-11-10 | Buttons rebuilt as two pseudo-element layers (shadow, face) so the press animates `transform` only. Hover (pointer devices) and keyboard focus: face slides onto its shadow, 80ms; active: same, instant (touch feedback) | 4.5 "animate only transform, opacity, clip-path"; box-shadow animation avoided | Agent |
| 2026-11-10 | Any reveal block that receives keyboard focus shows instantly; smooth scrolling switches to instant while navigating with Tab (`html.is-keyboard`) | Focus must never land on hidden or off-screen content (2.5.1 focus-visible check, WCAG 2.4.11) | Agent |
| 2026-11-10 | Copy button: clipboard success swaps label to "Copied" for 2s and announces "Copied"; on failure it selects the address and announces "Email address selected" | 6.2; the failure announcement is new UI text, not marketing copy | Agent |
| 2026-11-10 | mailto hrefs are rebuilt from `CONTACT` in `main.js` (tier subjects from `data-tier`); HTML keeps hard-coded equivalents for JS-off | 6.1 | Agent |
| 2026-11-10 | 2.5.1 `scroll-reveal` FAIL (x50 at 1440/390) added to the Phase 4 waiver list | 4.5 requires scroll reveals | Agent |
| 2026-11-10 | Phase 4 fix: reveal and flow pre-states are set inside the IntersectionObserver's first callback, never before | 2.5.1 hidden-content: with a dead observer the flow steps stayed hidden; now nothing hides unless the observer runs (8: usable without working JS) | Agent |
| 2026-11-10 | Phase 4 fix: flow tracks stretch to equal height at 768-1199px; the deliberate 4rem offset stays from 1200px | 2.5.1 row-lines at 820/768 | Agent |
| 2026-11-10 | Phase 4 fix: `html { scroll-padding-block: header + 8px, 24px }` replaces per-section `scroll-margin-top` | Keyboard pass: focus scrolling left Tier 2's button 2px below the viewport at 360px; padding also keeps focus clear of the sticky header (WCAG 2.4.11) | Agent |
| 2026-11-10 | Font preload kept | A/B Lighthouse: removing it gave CLS 0.025 and unstable scores; with it CLS 0 and Performance 99 on repeat runs (7.3) | Agent |
| 2026-11-10 | 2.5.1 finish gate (`gate.mjs`) not armed; its checks run by hand at full depth instead (`consistency.mjs` 5 widths, `copy-lint`, `perf.mjs`) | The gate caps waivers at 5 and counts one waiver per finding, so a page with ~280 plan-mandated findings can never pass; arming leaves a stateful build that would block later sessions | Agent |
| 2026-11-10 | **Waiver ledger** (2.5.1 FAILs kept on purpose; each overruled by PLAN.md): placeholder + copy-residue (CLAUDE.md: tokens stay); no-visual, text-only, card-visual (7.2: no images); copy-headline, copy-fact, copy-headings, copy-two-fragment, copy-eyebrows (5.x approved copy and labels); heading-scale (label-only h2 for The Problem and Services, 5.2/5.4); stagger, top-stagger, row-gap (4.2 asymmetry, 5.4 stagger); scroll-reveal (4.5); section-air (4.4 thick rules); section-height, one-section, one-heading (user decision above); empty-area + section-gaps at 820x1180 (the same checker's hero-fill rule requires the full-screen hero on tall portrait screens); button-styles (checker reads the shadow layer as the fill; the Copy button is a deliberate utility style; 5.7 "Big CTA" is 64px); hover-move (tiers are not links; their CTA answers hover); container-edges (2.5.1's own markup names). WARNs left as is: hero-enter, moment-none (2.5.1 motion not in 4.5), nav-current, share-meta (Open decision 7) | Phase 4 QA | Agent |
| 2026-11-11 | Launch values filled: name, email, tier names (the 5.6 suggestions), prices $749 / $1,399 / $2,250, Tier 3 detail "priority support, $399/month" | User-supplied (Open decisions 1-3) | User |
| 2026-11-11 | Prices display as amount + small mono "ONE-TIME" (`.tier__price-note`) | User chose to label one-time fees so visitors don't assume a subscription | User |
| 2026-11-11 | Tier 3 detail written "priority support, $399/month" (comma added) | Tightened punctuation only; meaning unchanged | Agent |
| 2026-11-11 | "Answer + Book" encoded as `%2B` in mailto subjects | A bare `+` can be read as a space by some mail clients | Agent |
| 2026-11-11 | Added `assets/og-image.png` (type-only card: headline, name, orange tag; 1200x630, 52 KB) with `og:url`, `og:image` (+ width, height, alt), `twitter:card`, and a canonical link, all on https://christiantoro.github.io/serv-page/ | Open decisions 6 and 7; image approved by user | User |
| 2026-11-11 | Added pricing line: "You pay the software subscriptions (usually $20 to $100 a month) directly to each provider." | User: make clients' monthly fee responsibilities explicit so "Nothing hidden" holds. The range is an estimate from typical inbox/chat ($19-$120) and booking (free-$50) plans; confirm against the tools actually used | User |
