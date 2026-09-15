You are a read-only design director. Do not modify files. Write a DESIGN BRIEF (not code) for a bold redesign of `home/index.html`, the entrance page of "Bankers’ Toolkit" — a private web suite where a PE/IB banker and invited friends order work from AI "interns": Newsrun Tracker (news curation) and Financials (DART) (Excel back-data from Korean filings). Current page = attached screenshot (dark ledger plate 2/3 + sign-in form 1/3). The owner's verdict: too static and too corporate. He wants it "marketing-y", dynamic and fun, like a product landing page, and says big changes are welcome. Everything can change: layout, palette, type, motion, structure.

Hard constraints (must appear verbatim, nothing else in the copy is fixed):
- Wordmark "Bankers’ Toolkit" on ONE line (no line break).
- Tagline: "A bunch of interns working below minimum wage. Legally."
- Modules: "Newsrun Tracker" — "Real-time, well-curated news run. Nothing missed." and "Financials (DART)" — "Neatly organized, errorless Excel back data."
- The sign-in / create-account / forgot-password form stays on this page (email + password; invite-only). The signed-in state (two module tiles with live request counts, owner-only Access list) stays functional and adopts the new identity.
- Single HTML file, vanilla CSS/JS, Google Fonts allowed, no frameworks. Must work at 400px. Respect prefers-reduced-motion. No fake numbers, no fake testimonials, no fake logos.

Deliver, in at most 450 words, as numbered sections:
1. Concept in two sentences (the joke in the tagline is the brand voice — lean into it tastefully).
2. Page structure top-to-bottom for the signed-out state: sections, what each contains, where the form sits (e.g. sticky panel vs. section), approximate heights.
3. Palette: 5–6 hex tokens with roles (bg, ink, accent, secondary, surface), plus a dark-mode note.
4. Type: display + body families from Google Fonts, sizes for wordmark/hero/h2/body/label, weights.
5. Motion spec: the hero moment (what animates on load, durations), 2–3 hover/scroll micro-interactions, one ambient element that feels alive without being random noise. Give ms and easing.
6. The two module blocks: how to make them feel like "interns you can put to work" (visual device, not extra copy).
7. Signed-in state: how the identity carries over in one paragraph.
8. Two one-line alternative directions in case the owner dislikes #1.
Be specific and opinionated; no hedging, no praise of the current page.
