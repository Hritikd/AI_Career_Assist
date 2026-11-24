export const catalog=[
 {id:'dispatch',kind:'jobs',title:'Dispatch coordinator',org:'Greenline Logistics',meta:'Peenya, Bengaluru',terms:'Day shift · On-site',detail:'Day shift, 9 am to 6 pm. Match delivery records in Excel, track late shipments and update the floor lead. Occasional calls to drivers. Freshers may apply.'},
 {id:'support',kind:'jobs',title:'Customer support associate',org:'Orbit Customer Care',meta:'Whitefield, Bengaluru',terms:'Rotating shifts · On-site',detail:'Rotating shifts include nights. Take inbound customer calls, log complaints and follow up on open tickets. Training provided. English and Hindi required.'},
 {id:'excel',kind:'learn',title:'Excel for dispatch work',org:'Practice lab',meta:'Free · 15 minutes',terms:'Self-paced · Practice exercise',detail:'Free self-paced exercise. Practise identifying mismatched shipment IDs in a small dispatch tracker. No certificate. Start the exercise in this demo.'},
 {id:'ops',kind:'learn',title:'Operations foundations',org:'Learning partner',meta:'₹4,800 · 4 weeks',terms:'Live weekends · Sample program',detail:'Fictional paid program. Four weeks of weekend classes on Excel trackers and operations handovers. Fee ₹4,800. No placement guarantee. No enrollment or payment is offered in this demo.'}
];
export function listingText(id){const i=catalog.find(x=>x.id===id);return i?i.title+' · '+i.org+' · '+i.meta+'. '+i.detail:''}
export function compareText(ids){return ids.map(listingText).filter(Boolean).join('\n\n')}
export const drill='The dispatch tracker says parcel D17 was delivered at 10:00. The receiver log has D71 at 10:00 and no D17. In one sentence, what would you check before changing the tracker?';
