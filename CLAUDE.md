# CLAUDE.md

You are building a single-page services landing site in plain HTML, CSS, and JS.

**Source of truth: `./PLAN.md`.** Read it fully before writing any code. If this file and PLAN.md disagree, PLAN.md wins. If PLAN.md is silent, ask; do not guess.

## Hard rules
- Plain HTML/CSS/JS only. No frameworks, bundlers, or runtime dependencies. No GSAP or animation libraries.
- Use the taste-skill skills `design-taste-frontend` (dials: VARIANCE 7, MOTION 6, DENSITY 4) and `industrial-brutalist-ui`. Where a skill conflicts with PLAN.md, PLAN.md wins.
- Copy comes from PLAN.md Section 5. Tighten wording if needed, but never change meaning, add claims, add numbers, or invent testimonials, logos, or stats.
- No em dashes in any visible copy.
- Leave `{{TOKEN}}` placeholders in place. Never fill in names, emails, or prices yourself.
- Palette is the tokens in PLAN.md 4.3 only. Orange is never text on a light background.
- Everything must work with JS disabled and under `prefers-reduced-motion`.

## Ask before
- Adding a section, page, image, font family, or dependency.
- Changing the locked decisions in PLAN.md Section 3.
- Switching taste-skill versions.

## Workflow
- Work through PLAN.md Section 9 phases in order. Stop at each checkpoint and report.
- Record every design choice the plan left open (fonts, exact type scale, ticker yes/no, token tweaks) in PLAN.md Section 12, Decision log.
- Before calling a phase done, run the taste-skill pre-flight check and the relevant items in PLAN.md Sections 8 and 10.
