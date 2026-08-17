# Portfolio multi-page restructure

Date: 2026-08-17
Status: Approved by user, ready for implementation plan

## Problem

`index.html` is a single ~1300-line page: hero, a live crypto demo, 4 full
case studies (screenshots, flow chips, numbered steps), and 7 more project
cards across two category grids, then contact. It reads as one long scroll.
Visitors aren't staying long enough to reach the content further down —
the depth that should be a strength (detailed case studies) is instead
crowding out the identity that should hook a visitor in the first screen.

## Goal

Split into two pages so the homepage is a fast, scannable identity page,
and all project depth lives on a dedicated Work page a visitor opts into.

## Site map

- **`index.html`** — identity only:
  - Header: name (`Karan.`), tagline, about paragraphs — unchanged content.
  - Hero demo: the live AES-256-GCM panel — unchanged content, moves as-is.
  - **Selected Work** (new, replaces `#featured`): condensed teaser cards for
    the 4 featured builds (title + one-line description + tags, no case-study
    body) linking to `work.html#<project-id>`.
  - Connect: unchanged, stays on the homepage since it's short link rows.
  - Footer: unchanged.
- **`work.html`** — everything project-related, in this order:
  1. Featured Builds — the 4 existing full case studies, verbatim, each
     wrapped with an `id` (`whisperdrop`, `noctua`, `recall`, `gradsphere`)
     for deep-linking from the homepage teasers and Cmd+K.
  2. Security & Privacy grid — unchanged (DropZone, linux-forensics-collector,
     Checker, PortScout).
  3. Product & Tooling grid — unchanged (fitcheck, lingolift, Renamer).

No content is deleted or rewritten — this is section relocation, not a
copy rewrite, except for the new condensed teaser card copy on the
homepage (one-line descriptions, reusing existing case-study desc text
where it fits).

## Shared infrastructure

- **`assets/style.css`** — the full `<style>` block currently inlined in
  `index.html` (design tokens, layout, components, responsive rules),
  extracted verbatim and linked from both pages. Add nav styles here too
  (see below).
- **`assets/site.js`** — the page-agnostic behavior currently inlined:
  footer clock, scroll-reveal `IntersectionObserver`, decrypt-on-reveal
  text, and the Cmd+K palette. Linked from both pages via `<script src>`.
- **Hero-demo script** (AES-GCM encrypt panel) stays inline on `index.html`
  only — it's specific to that page's markup and not worth generalizing.
- **Nav bar** — new, small, added to both pages: `Home` / `Work` / `Connect`.
  Connect links to `index.html#connect` from the Work page; Home/Work are
  simple cross-page links. This is the only new UI surface in this change.

## Cmd+K behavior

Stays page-scoped: it already builds its item list by scanning the DOM of
whatever page is loaded (`section[id] > h2`, `.project-card`,
`.contact-link`). No cross-page index, no build step, no fetch — each
page's palette just reflects that page's content. On `work.html`, add the
4 case-study anchors as extra jump targets so Cmd+K can jump straight to a
featured build, not just scroll grids.

## Out of scope

- No visual redesign — colors, type, motion, the crypto demo's behavior,
  and case-study copy are unchanged.
- No per-case-study pages (explicitly decided against — one Work page for
  a portfolio this size).
- No static-site generator / build step — plain HTML/CSS/JS, GitHub Pages
  as-is.

## Testing / verification

- Every internal link (nav, homepage teaser cards, footer, Cmd+K items)
  resolves to a real anchor on the right page.
- Both pages pass the same manual checks as before: reduced-motion respected,
  keyboard focus visible, mobile layout (header stacks, nav collapses
  sensibly), Cmd+K opens/closes/filters on both pages independently.
- CSP meta tag (currently only on `index.html`) is duplicated correctly on
  `work.html` too — it's a per-document header, not something `link`/`script`
  extraction carries over automatically.
