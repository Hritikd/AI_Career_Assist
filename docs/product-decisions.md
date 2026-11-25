# Daystep | Product decisions

**Starting user.** An early-career worker who has an immediate decision about a job or training. Consider a Bengaluru shop associate who wants fewer customer calls, needs day shifts and cannot pay for a course. These are user-supplied constraints, never default assumptions about a city or worker.

**Platform hypothesis.** A marketplace already knows what someone saved or opened. At that moment a short conversation can resolve the uncertainty blocking their next action. A generic chat would require the person to restate the listing and invent a prompt. We give the assistant the relevant listing only when the user chooses a coaching action.

| Platform touchpoint | User uncertainty | What actually happens in the demo | Success signal |
| --- | --- | --- | --- |
| Save two job openings | Which fits my schedule and preferences? | A dismissible comparison appears. Mira receives both postings, can ask about a constraint, and considers corrections on the next turn. | A saved decision to pursue, clarify or pass |
| View a job | Can I do the work and explain my experience? | Start a mock interview from the listing. Speak or type an answer, get a specific follow-up and retry. | A completed rehearsal with a concrete revision |
| Compare free and paid training | Do I need to spend money to test this skill? | Mira can discuss budget, compare the displayed fee and workload, and the user can start a free dispatch exercise from Learning. | A relevant exercise completed or informed next step saved |

**Observed Apna Advantage touchpoints.** The public flow includes exploring programs, comparing colleges and contacting a counsellor. Daystep models the comparison and pre-counsellor decision with fictional listings. The candidate can prepare, edit, save and copy a question before spending money. The shortlist-to-coach entry on the jobs side is a proposed experiment. Current call timing, internal lead routing and counsellor cost were unavailable. [Apna Advantage](https://apnaadvantage.com/) · [College comparison](https://apnaadvantage.com/compare)

**One journey.** Save dispatch coordinator and customer support associate. Compare with Mira. Say “I can only work days.” Correct it to “Actually evenings are fine, but I cannot work overnight.” Mira should preserve the overnight constraint. Practise a realistic dispatch question or try the free Excel task. Choose and edit a next action. Refresh to resume the conversation and action.

**AI and interaction.** Sarvam transcribes a short voice turn, interprets the current listing and conversation, and speaks the reply. English, Hindi and Kannada are selectable. Text supports noisy rooms, accents the recognizer struggles with and phones without microphone permission. The optional sample voice note exercises the same production speech endpoints. Suggested actions require an explicit save. Quotes shown as listing evidence must occur in the supplied listing.

**Scope and assumptions.** Listings and the ₹4,800 course are fictional. The prototype is independent of Apna. Saved listings and conversations persist on the same device. No enrollment, application, payment or external reminder is sent. A short outbound phone rehearsal is a separate experiment. A counsellor handoff would be appropriate for questions the listing cannot answer. Demand, conversion uplift and model quality across accents require a pilot.

**Business test.** Randomly offer eligible saved-job users the contextual prompt and compare seven-day completed actions per eligible user against the existing flow. Break out pursue, clarify, practice and intentional pass. Audit whether responses honour revised constraints and correctly distinguish the listings. For learning, compare qualified counsellor requests, eventual enrollment and cancellation while monitoring free-path completion and budget violations.

**Illustrative unit economics.** Suppose 30% of eligible visitors start, a voice session costs ₹2 including recognition, generation and synthesis, and one incremental qualified application contributes ₹100. Break-even is a 0.6 percentage-point lift per eligible visitor before fixed costs. Track speech minutes, tokens, redos and paid conversions against a holdout. These figures are assumptions, not Apna economics.

## Iteration evidence and field test
Prototype walkthroughs exposed a three-click path to comparison, a Kannada transcription error, a coaching reply that overlooked a promised noon update, and a useful recruiter question without a save affordance. The submission now opens a prefilled shortlist, microphone transcripts are editable, the rehearsal prompt asks one grounded follow-up, and any reply can become an editable action. These observations came from prototype tests. Candidate interviews are pending.

Recruit five early-career workers with two actual openings. Capture their intended next action before the session, observe whether they correct the coach and explain their decision afterward, and ask one week later which action they took. Use a randomized pilot to estimate incremental impact.
