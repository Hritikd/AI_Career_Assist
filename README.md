# Daystep

The homepage is a voice-first career conversation with Mira. Speak in English, Hindi or Kannada. Saaras transcribes short turns, the Sarvam chat model responds using recent conversation context, and Bulbul speaks the reply. The browser provides a sample voice note for mic-free demonstrations. Candidates can edit and save a suggested action on their device. The detailed application workshop remains at /workshop.html.

A mobile-friendly career workshop for someone with a real opening in mind. Paste a posting, share a constraint, rehearse one task, and save an action. Three clearly labeled fictional sample openings are included.

- [Product decisions](docs/product-decisions.md)
- [Communication and engagement plan](docs/engagement-plan.md)

## Run

Node 20 or later. Run `npm test`, then `npm run dev` and visit http://localhost:3000. No dependencies. Set SARVAM_API_KEY in the server environment for live coaching. Optionally set SARVAM_MODEL. Never place the key in public files. When neither provider is available or on provider failure the interface labels the guided fallback on each reply.

## Vercel

Import this repository as a new project using the Other preset. The public directory contains the client and api/coach.js is the server function. Add SARVAM_API_KEY in the project environment before deploying. The project is independent of RoleTry.

## Demo

Choose the customer support sample. Enter “I have handled complaints at a shop. Day shifts only.” Inspect the cited night-shift requirement. Save a recruiter question or practise a complaint scenario. Ask “Can I use my shop experience?” Revise the draft, save a next action, refresh, and mark it complete. Data is saved on this device. AI requests transmit the posting and candidate inputs to the active provider (Sarvam when configured, otherwise Vercel AI Gateway on Vercel). No outbound messaging or job application is sent.
