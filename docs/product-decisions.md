# Daystep | Product decisions

**Audience.** An early-career Indian job seeker on a phone who has found a specific opening and is unsure whether to spend an evening applying. A working retail associate who can only work day shifts is our starting persona. We have not validated demand with interviews.

**Where it belongs.** In a marketplace pilot, offer “Check this job against my priorities” on a saved opening. The posting and location are already there. Today the standalone prototype accepts a pasted description or one of three fictional openings. The user supplies their own priorities without creating an account.

| Decision | What the user gets | Why now |
| --- | --- | --- |
| Check fit before practising | One relevant line from the posting, a practical interpretation, and room for follow-up | A night-shift conflict can make an otherwise attractive opening unusable. We allow an immediate decision or recruiter question. |
| Rehearse a job task | A short workplace scenario, a draft, feedback quoting the candidate, and a retry | One specific action reveals more than a generic assessment. A rehearsal is a learning aid. No aptitude score or chance of hire is inferred. |
| Save a decision | An editable note to apply, clarify, practise or pass, plus optional calendar export | Even passing on an unsuitable opening is a useful decision. A saved unfinished action creates a reason to return. |

**What the model contributes.** The live model interprets free-text constraints, responds to follow-ups, and reviews drafts. The server checks that evidence quotes occur in the supplied source. Verbatim evidence can still support a poor inference, so we evaluate interpretation separately. Guided mode is labeled whenever the service is unavailable. Its supported scenarios are narrower. Candidates can edit the evidence they supply. Notes live in this browser. Live AI sends the supplied context to the active provider (Sarvam when configured, otherwise Vercel AI Gateway on Vercel).

**Trade-offs.** Text runs on a phone without microphone access, keeps quotes inspectable, and lets applicants practise privately. We limited the prototype to one opening at a time. A phone call, course catalog and automated applications would each add work without testing whether this decision aid helps.

**Business hypothesis.** Better-informed applicants might follow through more often and ask recruiters more specific questions. A downstream referral becomes relevant when a candidate requests help with an actual skill gap. This prototype earns no referral fees and sends no leads.

**Pilot.** Randomly offer the entry point to a subset of eligible saved-job users. Compare seven-day meaningful action rates per eligible user, counting each user once. Capture follow-through by action type, verify in-product actions where possible, and distinguish self-reports. Interview people who passed or abandoned to understand why. Guard against more unsuitable applications and unsupported claims in feedback. Review a blinded sample for correct handling of hard constraints, truthful interpretation and a usable next step. Stop rollout on repeated false evidence.

**Illustrative economics.** Assume ₹2 per started AI session, 30% uptake among eligible users and ₹100 contribution per incremental qualified application. Cost per eligible user is ₹0.60. Break-even is 0.6 percentage points of incremental qualified applications versus control, before fixed costs. These are assumptions. Measure actual inference spend, recruiter acceptance and margin before expansion.
