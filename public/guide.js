export const samples = [
 {role:'Operations associate', employer:'Warehouse operations', copy:'Operations associate · Bengaluru\nFixed day shifts, on-site in Peenya. Freshers welcome. Reconcile dispatch records, update Excel trackers and flag delayed shipments to the floor lead.'},
 {role:'Customer support associate', employer:'Customer experience',copy:'Customer support associate · Pune\nRotating night shifts are required. Handle customer calls in Hindi and English, log tickets, and follow up on unresolved complaints. Training provided.'},
 {role:'Retail team lead',employer:'Store operations',copy:'Retail team lead · Jaipur\nWeekend shifts required. At least one year of retail experience. Coach new staff, reconcile end-of-day stock, and resolve customer escalations.'}
];
export function lines(s){return s.split(/\n|(?<=[.!?;])\s+/).map(x=>x.trim()).filter(Boolean)}
export function assess(job, context){
 const pieces=lines(job);
 const limits=[
 [/day shift(s)? only|only day shifts?|can[’']?t (?:do|work) nights?|cannot (?:do|work) nights?|no night shifts?/i,/night shifts?/i,'Night shifts'],
 [/remote only|only remote|cannot commute|can[’']?t commute/i,/on.site|in.office|work from office/i,'Work location'],
 [/no weekends|cannot work weekends|weekdays only/i,/weekend/i,'Weekend work'],
 [/no calls|no calling|avoid calls/i,/customer calls|phone calls|cold call/i,'Phone work']
 ];
 for(const [pref,req,name] of limits){
 const match=pieces.find(x=>req.test(x)&&!/(no |without |never |optional ).{0,12}(night|weekend|calls)|(?:night shifts?|weekend shifts?|calls) (?:are )?(?:optional|not required)/i.test(x));
 if(pref.test(context)&&match)return {title:'Clarify before applying',quote:match,body:name+' could conflict with what you shared. Ask the recruiter whether this requirement is flexible before spending time on the application.'}
 }
 const quote=pieces.find(x=>/handle|update|coach|resolve|reconcile|manage|build|maintain|prepare|coordinate/i.test(x))||pieces.at(-1);
 return {title:'Find one example from your experience',quote,body:'Pick one responsibility in this line. Have you done something similar at work, in college, or while helping someone? An example will help you decide whether to apply.'};
}
export function task(job){const text=job.toLowerCase();
 if(/shipment|dispatch|warehouse/.test(text))return 'A shipment is marked dispatched, but the receiving team cannot find it. What would you check first, and what would you tell the floor lead?';
 if(/ticket|customer support|complaint/.test(text))return 'A customer calls back about an unresolved complaint. What would you check first, and what would you tell the customer?';
 if(/retail|stock/.test(text))return 'Your closing stock count is short by three items. How would you investigate and hand over to the next shift?';
 return 'Choose one responsibility from the posting. Describe a time you did something similar. What did you personally do, and how did you check the outcome?';
}
export function review(draft){
 const quote=lines(draft)[0]||draft;
 if(/^(?:i don.t know|idk|not sure|no idea)[.! ]*$/i.test(draft.trim()))return {title:'Start with a smaller step',quote,body:'Choose one record, person, or tool you would check first. Write one sentence explaining what you hope to learn.'};
 if(/look at (?:the )?logs|check (?:the )?(?:logs|ticket|records|tracker)/i.test(draft)){
 const hasTime=/by (?:noon|midnight|end of day|[0-9])|in \d+ (?:minutes|hours)/i.test(draft);
 return {title:'Specify what you would check',quote,body:(hasTime?'You gave a time for the update. ':'')+'Which field or entry would you inspect first, and what finding would change your next step?'};
 }
 return {title:'Make your answer easier to verify',quote,body:'Read this sentence back. Which detail could a teammate verify? Add a specific check, the person you would update, or how you would know the issue was resolved. Keep only details that are true.'}
}
export function localReply(q,s){
 if(/no money|can.t pay|cannot pay|free|budget/i.test(q))return 'The practice here is free. Use the rehearsal below to build one example from your own experience.';
 if(/shift|weekend|work from home|remote|salary|pay|location/i.test(q))return 'Use the exact wording in the posting to check this condition. If the posting leaves it open, save this question for the recruiter: “Could you confirm the schedule, work location and pay range for this opening?”';
 if(/experience|fresher|beginner/i.test(q))return 'You can use a college project, volunteer shift, or family-business example. Which task in this posting have you already tried, even once?';
 return 'Guided mode can help with the saved posting and rehearsal. '+(s.draft?'Reopen your rehearsal and add one detail someone could verify.':'Try the practice question for this posting, or ask about shift requirements or experience.');
}
