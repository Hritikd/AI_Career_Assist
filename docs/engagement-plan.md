# Daystep | Communication and engagement plan

**Purpose.** Help a job seeker finish a decision they chose. Prototype delivery covers in-app prompts, device-local resume and user-initiated calendar export. Push and WhatsApp below are pilot designs requiring opt-in and delivery infrastructure.

| Segment and stage | Trigger and channel | Timing and frequency | Exact copy | Suppression and success |
| --- | --- | --- | --- | --- |
| Saved an opening, first visit | Saved-job detail page, inline | At next view, once per opening after dismissal | “Still considering this opening? Check its shifts and responsibilities against what matters to you.” | Suppress after starting, applying or archiving. Measure fit checks per eligible viewer. |
| Hard constraint identified | Fit result, inline | Immediately, once per assessment | “This posting mentions rotating night shifts. Want to save a question about day shifts before you apply?” | Only for explicit conflict supported by posting and stated preference. Measure relevant clarification or intentional pass. |
| Fit checked, draft unfinished | In-app resume on this device | Next visit while draft remains open | “Your dispatch example is saved. Pick up from your last sentence.” | Show only with a draft and matching role. Measure rehearsal completion. |
| Committed to an action | Calendar event, chosen by user | On the date they select, one event per export | “Daystep — Ask the recruiter a question” | User controls their calendar. No automatic external message. Measure exports separately from completion. |
| Opted in, unfinished after leaving | Pilot push OR WhatsApp in chosen language | Once after 24 hours, 10 am–7 pm local time | “Still want to practise for the operations opening? Your answer is saved. Continue when you have five minutes.” | Cancel on completion, pass, deletion, opt-out or stale opening. One channel per action, at most one reminder in seven days. Track opt-outs and incremental completions versus holdout. |
| Completed or passed | In-app acknowledgement | Immediately, then stop | “Decision saved. Bring another opening whenever you need a second look.” | No win-back for this opening. Track voluntary return with a different opening within 30 days. |

**Personalization.** Use the candidate's selected action, posting title and chosen language. Keep lock-screen copy generic unless the user chooses detailed previews. Never infer unemployment or enrollment intent from inactivity.

**Measurement.** Proposed events are fit_started, fit_viewed, rehearsal_submitted, feedback_revised, action_saved and action_completed. Record action type, source mode and session identifier without storing the draft in analytics. Primary outcome is a completed chosen action within seven days per eligible user. Separate deliberate passes, self-reports, calendar exports and verified application steps. Segment by first-time versus returning, job family and guided versus live AI. Guardrails include opt-outs, irrelevant reminders and unsupported coaching claims. A holdout estimates incremental impact. Analytics and external messaging are not deployed in the prototype.
