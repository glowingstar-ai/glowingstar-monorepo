# Development log

## 2026-09-12: Readable landing page typography

- Task: User-requested review and enlargement of small landing-page text. No Linear ticket was supplied.
- Status: Implementation and production validation complete for PR #72.
- Introduced rem-based 18px body, 16px control, and 14px metadata sizes; removed 7px to 13px labels and mobile font shrinking. Increased manifesto body and label sizes and label contrast.
- Reflowed mobile research descriptions, card headings, and narrow concept/learning controls; moved the hero footnote into normal flow and raised the navigation/layout breakpoint to 1000px. Preserved the page's visual hierarchy and 3D interactions.
- Validation: production build, TypeScript, formatting, and whitespace checks pass; all 24 pages generated with only existing Saint Paul hook warnings. Browser text audits at 320, 390, 768, 1000, 1001, and 1260px found a 14px minimum with no text outside the viewport or horizontal overflow. Verified expanded research text, narrow concept controls, learning-step keyboard selection, navigation breakpoint changes, and manifesto at 320px. Final production WebGL rendering and concept selection work without new console warnings or errors.

## 2026-09-12: Smiling gold star mascot

- Task: User-requested brand icon update based on a rounded, smiling five-point gold star reference. No Linear ticket was supplied.
- Status: Implementation and production validation complete for PR #72.
- Generated a transparent gold mascot with the built-in imagegen tool and resized it to a 256px, approximately 59 KB PNG. Replaced homepage star instances, the manifesto brand mark, favicon, and Organization logo metadata. Preserved the existing glass containers, hover motion, and reduced-motion handling.
- Documented the final asset and generation prompt in `docs/frontier-human-learning-landing.md`.
- Validation: production build and TypeScript pass with all 24 pages generated; scoped ESLint, Prettier, and whitespace checks pass. Verified all five homepage images load, the 40px manifesto mark, 23px to 68px sizes, ivory and dark backgrounds, favicon reference, and 390px mobile layout without overflow. No new browser console warnings or errors. Existing Saint Paul hook warnings remain unchanged.

## 2026-09-12: Connected 3D learning interface

- Task: User-requested clarification of the moving sculpture's labels and expansion of suitable 3D visuals throughout the landing page, including the GlowingStar icon. No Linear ticket was supplied.
- Status: Implementation and validation complete for PR #72.
- Replaced fixed leader labels with keyboard-accessible concept tabs, selected-ring highlighting, a numbered marker attached to the physical ring, and matching explanations. Selection also works while paused.
- Added beveled gold brand stars and sculpted SVG icons across conviction, research, team, collaboration, and footer. Replaced the learning example with three visible CSS 3D paper layers and meaningful step controls. Kept one WebGL canvas.
- Validation: production build, TypeScript, scoped ESLint, Prettier, and whitespace checks pass; all 24 static pages generated. Existing Saint Paul hook warnings remain unchanged.
- Browser checks verified moving and paused markers, ring selection and explanations, arrow/End keyboard focus, raised learning cards, mobile menu Escape/focus return, unique SVG IDs, and responsive widths of 320, 390, 768, 1024, and 1260px without overflow. Corrected tablet icon spacing and a legacy footer icon size override.
- Repeated browser testing encountered a temporary browser WebGL context block; the SVG fallback remained usable. Removed deliberate context loss during ordinary cleanup while retaining explicit GPU resource disposal. The original context-loss cause was not established. After recovery, three production manifesto/home roundtrips each restored WebGL rendering and animation with one canvas and no new console warnings or errors.
- Geometry review verified anchors across all three bands, 121 poses, and four aspect ratios, including seamless endpoints and paused selection.

## 2026-09-12: 3D learning sculpture

- Task: User-requested replacement of the hero ribbon with a new animated 3D form. No Linear ticket was supplied.
- Status: Implementation and validation complete for PR #72.
- Replaced the ribbon with a Three.js orbital sculpture around a pearl core, with real lighting and depth, a seamless 24-second Motion loop, and glass playback controls.
- Compared Three.js, React Three Fiber/Drei, Spline, and OGL. Selected direct Three.js for this React 18 page; added a dynamically loaded renderer and server-rendered SVG fallback.
- Preserved saved-phase pause/resume, offscreen and hidden-tab stopping, and live reduced-motion support. Added capped pixel density, resize handling, context-loss fallback, and GPU resource cleanup.
- Validation: production build, TypeScript, scoped ESLint, Prettier, and whitespace checks pass. All 24 static pages generated. Existing Saint Paul hook warnings remain unchanged.
- Browser review confirmed actual WebGL rendering and rotation, stable paused frames, keyboard resume, offscreen stopping, 320px and 390px layouts without overflow, and manifesto navigation and return. Final renderer produced no browser warnings or errors. Reviewed the fallback and resource lifecycle; smoothed surface normals at the band seams.

## 2026-09-12: Continuous learning-field animation

- Task: User-requested infinite animation for the gold hero ribbon in PR #72. No Linear ticket was supplied.
- Status: Implementation and validation complete for PR #72.
- Added a seamless 16-second Motion loop for the ribbon contours and inner dashed path, preserving stationary labels and reference points.
- Added a liquid glass pause/play control. Playback stops offscreen, in hidden tabs, and when reduced motion is enabled, then resumes at the saved phase.
- Validation: production build, TypeScript, scoped lint, formatting, and whitespace checks passed. Existing Saint Paul hook warnings remain unchanged.
- Browser checks verified autonomous movement, stationary labels, pause/play by mouse and keyboard, offscreen stopping, 320px and 390px layouts, and navigation to the manifesto and back without runtime errors. Sampled the full geometry cycle for finite coordinates and seamless boundaries; verified Motion's saved-time resume and frame-driver cleanup.

## 2026-09-12: Motion and liquid glass follow-up

- Task: User-requested motion and icon refinement for PR #72. No Linear ticket was supplied.
- Status: Implementation and validation complete for PR #72.
- Added Motion entrances, scroll reveals, an input-driven learning illustration, research disclosure feedback, and mobile navigation animation.
- Added reusable liquid glass icon surfaces with light/dark treatments and browser blur fallbacks.
- Retained visible server-rendered content and subscribed to reduced-motion preference changes during the session.
- Validation: production build, TypeScript, scoped lint, formatting, and whitespace checks passed. The full build retains only the existing Saint Paul hook warnings.
- Browser checks covered responsive widths, pointer/scroll transforms, complete entrance opacity, rapid menu dismissal/reopening, keyboard research disclosure, and navigation to the manifesto and back. Final production navigation produced no browser errors. Verified all 20 animation targets remain visible in the initial HTML.

## 2026-09-12: Frontier human learning landing page

- Task: User-requested landing page redesign. No Linear ticket was supplied.
- Status: Implementation and validation complete on `codex/frontier-human-learning-landing`.
- Rebuilt the homepage around GlowingStar's frontier human learning mission, research directions, applied tutoring work, team, and collaboration.
- Aligned the manifesto, organization metadata, canonical URL, and social previews with the new identity.
- Added original learning-field artwork, a responsive navigation disclosure, native research disclosures, keyboard skip navigation, reduced-motion support, and accessible text contrast.
- Documented seven official reference websites in `docs/frontier-human-learning-landing.md`.
- Validation: production build and type checking passed; all 24 static pages generated. Lint passed with two existing hook-dependency warnings in `saint-paul-student-experience.tsx`. Changed frontend files pass Prettier checks.
- Browser review: 320, 390, 768, 1024, and 1280px widths; no horizontal overflow. Verified mobile menu dismissal and focus return, keyboard research disclosure, anchor offsets, skip link, manifesto navigation, and absence of console errors. Confirmed homepage, manifesto, privacy, and terms return HTTP 200.
- Research directions are framed as questions. The sample learning exchange is explicitly illustrative, and institutional names identify team backgrounds.
