// Week 8: THE APPROACH — How to think when given any problem

const WEEK_APPROACH = {
    id: 8,
    title: "THE APPROACH",
    subtitle: "How to think, not what to memorize",
    color: "#00ff41",
    days: [
        {
            day: 51,
            title: "Decoding the Problem",
            subtitle: "What is this problem REALLY asking?",
            xp: 60,
            content: V.banner('fa-magnifying-glass', 'DECODE THE PROBLEM', 'Every problem statement hides its real question', 'green') +
V.section('fa-fingerprint', 'Step 0: Classify the Problem Type') +
`<p>Before anything else, identify WHICH KIND of problem you're facing. Each type has a different attack path:</p>` +
V.table(['If they say...', 'Problem Type', 'Your Focus'], [
    ['"Design Twitter/Instagram/feed"', 'Read-heavy social', 'Caching, fan-out, feed generation'],
    ['"Design WhatsApp/chat/messaging"', 'Real-time communication', 'WebSockets, delivery guarantees, ordering'],
    ['"Design Uber/food delivery/tracking"', 'Location + matching', 'Geo-indexing, real-time updates, dispatch'],
    ['"Design payment/booking/inventory"', 'Consistency-critical', 'Transactions, locking, idempotency'],
    ['"Design URL shortener/pastebin"', 'Simple CRUD at scale', 'ID generation, caching, read optimization'],
    ['"Design YouTube/Netflix/storage"', 'Large binary data', 'Blob storage, CDN, processing pipeline'],
    ['"Design search/autocomplete"', 'Text retrieval', 'Indexes, tries, ranking'],
    ['"Design rate limiter/scheduler/cache"', 'Infrastructure component', 'Algorithms, data structures, precision'],
    ['"Design parking lot/elevator/chess"', 'LLD / object modeling', 'Classes, patterns, state machines']
]) +
V.why('Classification instantly gives you a mental checklist. Hear "chat app" → your brain should already be queuing: WebSocket, message ordering, presence, offline delivery. This is pattern recognition, and it comes from the classification step, not raw memory.') +
V.section('fa-search-plus', 'Step 1: Find the Hidden Hard Part') +
`<p>Every problem has ONE core difficulty the interviewer wants to see you find. Everything else is scaffolding.</p>` +
V.concept('fa-star', 'Twitter feed', 'Hidden hard part: the celebrity fan-out problem. 50M followers can\'t be pushed to.', 'cyan') +
V.concept('fa-star', 'Ticket booking', 'Hidden hard part: double-booking under concurrency. Everything else is CRUD.', 'purple') +
V.concept('fa-star', 'URL shortener', 'Hidden hard part: unique ID generation at scale without collisions.', 'orange') +
V.concept('fa-star', 'Chat system', 'Hidden hard part: routing messages between servers when users connect to different machines.', 'pink') +
V.concept('fa-star', 'Web crawler', 'Hidden hard part: politeness + dedup at billions-of-pages scale.', 'yellow') +
V.interviewTip('Say it out loud early: "The interesting challenge here is X — I\'ll make sure my design addresses that in the deep dive." Interviewers relax when they see you\'ve found the point of the question.') +
V.section('fa-filter', 'Step 2: Extract the Signals from the Statement') +
V.code('Reading Between the Lines', `"Design a system for millions of users to share photos"
         │                │                    │
         │                │                    └→ Large binary data
         │                │                       → S3 + CDN needed
         │                └→ "millions" → estimate scale,
         │                   horizontal scaling from day 1
         └→ "share" → social graph? feed? permissions?
            → ASK: is there a feed? followers?

Every noun hints at an entity. Every verb hints at an API.
Every adjective (fast, reliable, global) hints at a non-functional requirement.`) +
V.walkthrough('TEST: Problem Decoding', [
    {
        question: '"Design a system where drivers see ride requests near them in real-time." What is the hidden hard part?',
        options: ['Storing driver profiles', 'Efficient geo-queries ("near them") + real-time push — location indexing and live updates', 'Payment processing', 'The mobile app UI'],
        correct: 1,
        explanation: '"Near them" = geospatial indexing (geohash/quadtree — you can\'t SQL-scan all drivers). "Real-time" = push mechanism (WebSocket). The two keywords in the sentence ARE the two hard problems. Everything else is standard CRUD.'
    },
    {
        question: '"Design a flash sale system for 1M users buying 1000 items." Which problem type is this, and what does that immediately tell you?',
        options: ['Read-heavy social — focus on caching', 'Consistency-critical + extreme write contention — locking, queues, no overselling', 'Large binary data — use S3', 'Text retrieval — use Elasticsearch'],
        correct: 1,
        explanation: '1M buyers, 1000 items = 1000:1 contention. Classification: consistency-critical (never oversell) + spike handling (queue/waiting room). Your mental checklist should instantly load: distributed locks, atomic decrements, virtual queues, idempotent payments.'
    }
]),
        },
        {
            day: 52,
            title: "The Question Framework",
            subtitle: "What to ask and WHY you ask it",
            xp: 60,
            content: V.banner('fa-circle-question', 'ASK LIKE AN ENGINEER', 'Questions are design decisions in disguise', 'cyan') +
`<p>Don't ask questions to fill time — each question should CHANGE your design depending on the answer. Here's the framework:</p>` +
V.section('fa-list-check', 'The 5 Question Categories') +
V.steps([
    { title: 'SCOPE — "Which features are in/out?"', text: '"For this chat app — 1:1 only, or groups too? Media messages? Read receipts?" WHY: each feature can double the design. Cut ruthlessly to 3-4 core features.' },
    { title: 'SCALE — "How many users/requests/data?"', text: '"How many DAU? Peak traffic?" WHY: 10K users = single server + Postgres. 100M users = sharding, caching, CDN. The NUMBER decides the architecture.' },
    { title: 'READ/WRITE RATIO — "Who reads, who writes, how often?"', text: '"Is this read-heavy like a feed, or write-heavy like logging?" WHY: read-heavy → caching + replicas. Write-heavy → queues + LSM stores + partitioning.' },
    { title: 'CONSISTENCY — "How fresh must data be?"', text: '"If a user sees data 2 seconds stale, is that OK?" WHY: eventual consistency unlocks caching and async everywhere. Strong consistency forces synchronous paths and locks.' },
    { title: 'CONSTRAINTS — "Latency? Availability? Budget? Region?"', text: '"Is this global or one region? What latency target?" WHY: global → multi-region + CDN. p99 < 100ms → in-memory paths, no cross-region calls.' }
]) +
V.section('fa-comments', 'Worked Example: "Design a Notification System"') +
V.code('The Dialogue (with reasoning)', `YOU: "Which channels — push, email, SMS, in-app?"
     [WHY: each channel = separate worker + provider integration]
THEM: "Push and email."

YOU: "Are any notifications time-critical, like OTPs?"
     [WHY: if yes → priority queues; if no → single queue is fine]
THEM: "Yes, OTPs must arrive in seconds."

YOU: "Scale? How many notifications per day?"
     [WHY: 1M/day = simple. 1B/day = partitioned Kafka + worker fleets]
THEM: "About 100M/day."

YOU: "Can we ever send a duplicate? Can we ever drop one?"
     [WHY: this decides at-least-once + dedup vs best-effort]
THEM: "OTPs never dropped. Marketing can be best-effort."

→ After 4 questions you ALREADY have the architecture:
  priority queues (OTP fast lane), Kafka at 100M/day scale,
  dedup keys for at-least-once, retry + DLQ for critical only.`) +
V.why('Notice: the architecture emerged FROM the answers. You didn\'t memorize "notification system design" — you derived it. That\'s the skill interviews actually test, and it\'s why question-asking IS designing.') +
V.walkthrough('TEST: Ask the Right Question', [
    {
        question: 'Interviewer: "Design a document editor like Google Docs." What is the SINGLE most design-changing question you can ask?',
        options: ['"What color should the UI be?"', '"Do multiple users edit the same document simultaneously?" — real-time collaboration (OT/CRDT) vs single-editor is a completely different system', '"How many fonts do we support?"', '"Should documents auto-save?"'],
        correct: 1,
        explanation: 'Concurrent editing is THE fork in the road: yes → operational transforms/CRDTs, WebSockets, conflict resolution (very hard). No → simple CRUD with autosave (easy). One question, two entirely different architectures. Always hunt for the fork-in-the-road question first.'
    },
    {
        question: 'You ask "What\'s the read/write ratio?" and they say "1000:1 read-heavy." What should this IMMEDIATELY trigger in your design thinking?',
        options: ['Nothing, keep designing', 'Cache aggressively + read replicas + CDN; optimize the read path above all — writes can be slower', 'Add more write capacity', 'Use a write-optimized LSM database'],
        correct: 1,
        explanation: '1000:1 means one write serves 1000 reads. Every layer of read optimization (cache, replica, CDN, denormalization) pays off 1000x. The write path can even be slow/async. If you don\'t change direction on hearing this number, you weren\'t listening to your own question.'
    }
]),
        },
        {
            day: 53,
            title: "Requirements → Architecture",
            subtitle: "Deriving components, not memorizing them",
            xp: 70,
            content: V.banner('fa-diagram-project', 'DERIVE, DON\'T RECALL', 'Every component must be JUSTIFIED by a requirement', 'purple') +
V.section('fa-arrow-right', 'The Derivation Chain') +
`<p>Never place a box because "systems have Redis." Place it because a requirement forces it:</p>` +
V.code('Requirement → Component Mapping', `"Feed loads in <300ms"        → CACHE (DB alone can't do it at scale)
"100K QPS"                    → LOAD BALANCER + horizontal servers
"Users upload videos"         → OBJECT STORAGE (blobs don't go in DB)
"Global users, low latency"   → CDN + multi-region
"Never lose an order"         → MESSAGE QUEUE (durable) + retries
"Search products by text"     → SEARCH INDEX (DB LIKE% doesn't scale)
"Notify 3 services on order"  → PUB/SUB (decouple producers/consumers)
"Exactly one seat per buyer"  → DISTRIBUTED LOCK / atomic ops
"Analytics on user behavior"  → EVENT STREAM (Kafka) + warehouse
"Handle traffic spikes"       → QUEUE as buffer + autoscaling`) +
V.why('This table is reversible! In the interview, cite the requirement as you draw each box: "Because we need <300ms feed loads, I\'m adding a cache here." Every box gets a justification sentence. Unjustified boxes are where interviewers attack.') +
V.section('fa-route', 'The Data-Flow Walking Method') +
`<p>Stuck on where to start the diagram? Walk ONE piece of data through its whole life:</p>` +
V.steps([
    { title: 'Pick the core action', text: '"User posts a photo." Walk it: phone → ? → where does the image go? → who needs to know? → what gets stored where?' },
    { title: 'Draw what the data touches', text: 'Image → API server → S3 (blob) + DB row (metadata) + queue event (for feed fan-out) + CDN (for serving). Four components derived from ONE walk.' },
    { title: 'Walk the read path next', text: '"Follower opens feed." Feed cache → post metadata → CDN URL for image. Now the read path is derived too.' },
    { title: 'The diagram draws itself', text: 'Union of everything the walks touched = your high-level design. Nothing memorized; everything justified.' }
]) +
V.section('fa-scale-balanced', 'The Tradeoff Reflex') +
`<p>For every component choice, train this 3-part reflex:</p>` +
V.code('The Reflex Template', `"For X, I see two options: A and B.
 A gives us [benefit] but costs [drawback].
 B gives us [benefit] but costs [drawback].
 Given our requirement of [R], I'd pick A."

Example:
"For the feed, push (fan-out on write) gives instant reads
 but is expensive for celebrities. Pull is cheap to write
 but slow to read. Given we're read-heavy with some huge
 accounts, I'd do hybrid: push for normal users, pull for
 celebrities."`) +
V.walkthrough('TEST: Derive the Component', [
    {
        question: 'Requirement: "When a user places an order, update inventory, send email, and log analytics — but checkout must respond in under 500ms." Which component does this requirement FORCE, and why?',
        options: ['A faster database', 'A message queue — checkout writes the order + publishes an event, responds immediately; inventory/email/analytics consume async', 'More API servers', 'A CDN'],
        correct: 1,
        explanation: 'Three downstream actions can\'t fit in 500ms synchronously (and shouldn\'t block checkout if email is down!). The latency requirement + multiple consumers DERIVES the queue. Say exactly this chain: "500ms + 3 consumers → async → queue."'
    },
    {
        question: 'You drew a Redis cache in your design. The interviewer asks "why?" Which is the STRONG answer?',
        options: ['"Most systems use Redis"', '"Our read QPS is 50K against a DB that handles ~5K; caching the hot 20% of keys absorbs ~80% of reads, bringing DB load into safe range"', '"Redis is fast"', '"For performance"'],
        correct: 1,
        explanation: 'The strong answer connects NUMBERS to the decision: stated read QPS, DB capacity, hit-rate assumption, resulting load. "Redis is fast" is true but justifies nothing. Every box defended with arithmetic = senior signal.'
    }
]),
        },
        {
            day: 54,
            title: "Thinking Aloud: HLD Walkthrough",
            subtitle: "The internal monologue, exposed",
            xp: 70,
            content: V.banner('fa-brain', 'THE MONOLOGUE', 'Design "Instagram Stories" — full thinking process', 'pink') +
`<p>This is a real-time transcript of HOW to think through a fresh problem — the reasoning, not just the result.</p>` +
V.section('fa-1', 'Minute 0-2: Classify + Find the Hard Part') +
V.code('Internal Monologue', `"Stories... photos/videos that EXPIRE after 24h.
 Classify: read-heavy social + large binary data. Two checklists load.
 What's different from a normal feed? EXPIRY.
 Hidden hard part candidates:
   1. Auto-deletion of billions of objects daily
   2. Story ring ordering (whose story shows first?)
   3. View tracking ("seen by") at massive write volume
 The expiry + view-tracking are the novel parts. Feed itself
 is standard. I'll flag these for deep dive."`) +
V.section('fa-2', 'Minute 2-6: Scope with Questions') +
V.code('Questions I Ask', `"Photos and videos, or photos only?" → both, videos ≤ 60s
"Do we need view tracking (who saw my story)?" → yes
"Replies/reactions in scope?" → no, cut
"Scale?" → 500M DAU, avg 20 stories viewed/day

Quick math while they answer:
Views: 500M × 20 / 86400 ≈ 115K views/sec (!)
View WRITES (tracking) ≈ same 115K/sec ← write-heavy component
inside a read-heavy system. Interesting. Noted for deep dive.`) +
V.section('fa-3', 'Minute 6-20: Walk the Data') +
V.code('Walking a Story Through Its Life', `POST: phone → API → S3 (media) + DB row {user, url, expires_at}
      → fan-out event → followers' story-ring cache (Redis, TTL=24h!)

KEY INSIGHT while walking: Redis TTL handles expiry FOR FREE
in the cache layer. For S3: lifecycle rule deletes after 24h.
For DB rows: partition by day, DROP whole partition daily —
deleting billions of rows one-by-one would melt the DB.
→ The "hard" expiry problem dissolves via 3 built-in mechanisms.

VIEW: viewer opens story → CDN serves media → view event
      → 115K/sec writes... can't hit DB directly
      → buffer in Redis (HyperLogLog if approximate count OK,
        set per story if exact "seen by" list needed)
      → flush to DB in batches`) +
V.section('fa-4', 'Minute 20-35: Deep Dive Where It Hurts') +
V.code('Deep Dive Choice', `"I flagged view-tracking as the hard part. Let me design it.
 Option A: write every view to DB → 115K writes/sec → needs
           heavy sharding, expensive
 Option B: Redis set per story, flush periodically → fast,
           but memory: 500M stories/day × avg 100 viewers
           × 8 bytes ≈ 400GB/day... too much for exact sets
 Option C: split the requirement!
           - View COUNT: Redis counter (cheap)
           - 'Seen by' list: only stored for accounts with
             <10K followers (99.9% of users), celebrities get
             count-only
 C is the move — the requirement itself had a hidden split."`) +
V.why('The pattern to copy: WALK the data → NOTICE where numbers break something → SPLIT or restructure the requirement itself. Option C wasn\'t a known pattern — it came from questioning whether everyone needs the same guarantee. That\'s real design.') +
V.walkthrough('TEST: Think It Through', [
    {
        question: 'In the Stories design, why is "partition DB rows by day, drop whole partitions" better than "DELETE FROM stories WHERE expires_at < now()"?',
        options: ['SQL doesn\'t support DELETE at scale', 'Dropping a partition is a metadata operation (instant); deleting billions of rows generates massive I/O, locks, and replication traffic for hours', 'Partitions are cheaper to store', 'It isn\'t better'],
        correct: 1,
        explanation: 'Row-by-row deletion of billions of rows = hours of write load, bloated indexes, replication lag. Dropping yesterday\'s partition = one instant metadata operation. Aligning the PARTITION SCHEME with the DELETION PATTERN is the insight — data that dies together should live together.'
    },
    {
        question: 'The monologue "split the requirement" move (exact seen-by for normal users, count-only for celebrities) mirrors which pattern you already know?',
        options: ['Circuit breaker', 'The hybrid fan-out solution for the Twitter celebrity problem — different guarantees for different user classes', 'Saga pattern', 'Consistent hashing'],
        correct: 1,
        explanation: 'Same meta-pattern: when one user class breaks your design (celebrities), give them a DIFFERENT mechanism instead of over-engineering for everyone. Twitter feeds: push vs pull. Stories views: exact list vs count. Learn the meta-pattern, and you\'ll re-derive solutions for problems you\'ve never seen.'
    }
]),
        },
        {
            day: 55,
            title: "Thinking Aloud: LLD Walkthrough",
            subtitle: "From problem statement to classes",
            xp: 70,
            content: V.banner('fa-cubes', 'LLD MONOLOGUE', 'Design "a food delivery order system" — live thinking', 'orange') +
V.section('fa-1', 'Minute 0-5: Nouns, Verbs, Lifecycles') +
V.code('The Extraction Pass', `"Customers order food from restaurants, a driver picks
 up and delivers, everyone tracks status."

NOUNS → candidate classes:
  Customer, Restaurant, MenuItem, Order, OrderItem,
  Driver, Delivery, Payment

VERBS → candidate methods:
  placeOrder(), acceptOrder(), assignDriver(),
  pickUp(), deliver(), track(), pay()

LIFECYCLE WORDS → state machine alert!
  "placed... accepted... picked up... delivered"
  → Order has states → State pattern candidate

ONE-TO-MANY scan:
  Order ◆── OrderItems (composition — items die with order)
  Restaurant ◇── MenuItems (aggregation)
  Driver ── Delivery (association)`) +
V.section('fa-2', 'Minute 5-10: Find the Variation Points') +
V.code('Where Will This System Change?', `Ask: "what will product managers change next quarter?"

- Pricing: discounts, surge, coupons     → PricingStrategy
- Driver assignment: nearest? rating?    → AssignmentStrategy
- Order states: might add REFUNDED       → State pattern
- Notifications on status change         → Observer
- Payment methods: card/UPI/wallet       → Strategy (again)

RULE: interfaces go at the points of PREDICTED CHANGE.
Everything else stays a plain class. Don't interface-ify
Customer — nobody's swapping customer implementations.`) +
V.why('This is the LLD equivalent of "derive, don\'t recall." You don\'t sprinkle patterns because you know them — you ask "where will change come from?" and place interfaces exactly there. Concrete where stable, abstract where volatile.') +
V.section('fa-3', 'Minute 10-25: Code the Spine First') +
V.code('Priority Order for Writing Code', `1. Enums first (30 seconds, zero risk):
   enum OrderStatus { PLACED, ACCEPTED, PREPARING,
                      PICKED_UP, DELIVERED, CANCELLED }

2. The state machine (the CORE logic):
   Order.transitionTo(newStatus) — validate legal moves:
   PLACED→ACCEPTED ✓   DELIVERED→CANCELLED ✗

3. One Strategy end-to-end (proves the pattern):
   interface DriverAssignmentStrategy {
       Driver assign(Order o, List<Driver> available);
   }
   class NearestDriverStrategy implements ... { }

4. Observer hookup (5 lines, big impression):
   order.addListener(customerNotifier);
   order.addListener(restaurantDashboard);

SKIP: getters/setters, constructors, toString —
say "standard boilerplate" and move on.`) +
V.section('fa-4', 'Minute 25-35: Attack Your Own Design') +
V.code('Self-Attack Checklist', `"Let me stress-test this before you do:
 - Two drivers accept the same order simultaneously?
   → assignDriver uses atomic compareAndSet on order.driver
 - Order cancelled WHILE driver is en route?
   → state machine allows PICKED_UP→CANCELLED? Business
     decision — I'd allow with compensation (driver fee)
 - Restaurant goes offline mid-order?
   → orders in PLACED auto-cancel after timeout; ACCEPTED
     orders must complete
 - Payment succeeds but order fails to save?
   → saga-lite: payment last, or compensating refund"`) +
V.interviewTip('Attacking your own design BEFORE the interviewer does flips the dynamic — you\'re no longer defending, you\'re demonstrating. Two self-attacks minimum in every LLD interview: a concurrency race and an invalid state transition.') +
V.walkthrough('TEST: LLD Thinking', [
    {
        question: 'In the extraction pass, the phrase "placed... accepted... picked up... delivered" in a problem statement should immediately trigger what?',
        options: ['Create four separate Order classes', 'State machine recognition → State pattern for Order lifecycle with validated transitions', 'Four database tables', 'Observer pattern'],
        correct: 1,
        explanation: 'A sequence of lifecycle words = state machine. Model it explicitly: each state knows its legal next states, invalid transitions throw. If you find yourself writing if(status==X && newStatus==Y) chains later, you missed the trigger.'
    },
    {
        question: 'Why does the monologue put interfaces on pricing and driver-assignment but NOT on Customer?',
        options: ['Customers are less important', 'Interfaces belong at predicted points of change (pricing rules change constantly); stable concepts stay concrete — abstraction has a cost', 'Java limits interface count', 'Customer is a database entity'],
        correct: 1,
        explanation: 'Every abstraction costs readability and indirection. Spend that cost ONLY where change is predicted: business rules (pricing, assignment, notification) churn; core entities (Customer, Order) are stable. Over-abstraction is as much a smell as under-abstraction.'
    }
]),
        },
        {
            day: 56,
            title: "The Universal Playbook",
            subtitle: "One page to rule them all",
            xp: 100,
            content: V.banner('fa-map', 'THE PLAYBOOK', 'The complete approach, compressed', 'yellow') +
V.section('fa-list-ol', 'The Full Sequence (Any Problem)') +
V.steps([
    { title: 'CLASSIFY (30 sec)', text: 'Which problem type? Load that type\'s checklist. Find the hidden hard part and SAY it out loud.' },
    { title: 'ASK (3-5 min)', text: 'Scope, scale, read/write ratio, consistency, constraints. Each answer must change your design — if it wouldn\'t, don\'t ask it.' },
    { title: 'ESTIMATE (2-3 min)', text: 'QPS, storage, bandwidth. The numbers PICK the architecture: 1K QPS = simple, 100K = distributed. Write them in a corner — you\'ll cite them all interview.' },
    { title: 'WALK THE DATA (10-15 min)', text: 'Trace the core action end-to-end. Draw only what the data touches. Justify every box with a requirement. Do the write path, then the read path.' },
    { title: 'DEEP DIVE THE HARD PART (10-15 min)', text: 'Go where you flagged the difficulty. Present 2-3 options with tradeoffs, pick one, justify with YOUR estimates from step 3.' },
    { title: 'ATTACK YOURSELF (5 min)', text: 'Failure modes: what breaks at 10x? What if this component dies? Race conditions? Then: monitoring, bottlenecks, next steps.' }
]) +
V.section('fa-bolt', 'Emergency Heuristics (When Stuck)') +
V.concept('fa-shoe-prints', 'Stuck starting?', 'Walk one piece of data through its life. The diagram draws itself.', 'green') +
V.concept('fa-calculator', 'Stuck choosing between options?', 'Run the numbers on both. Arithmetic breaks ties: "B needs 400GB of RAM — not happening."', 'cyan') +
V.concept('fa-users', 'Design breaks for some users?', 'Split the user classes (celebrity pattern). Different guarantees for different scales.', 'purple') +
V.concept('fa-clock', 'Requirement seems impossible?', 'Question whether everyone needs it: exact vs approximate, real-time vs 5-sec-stale, all users vs 99%.', 'orange') +
V.concept('fa-scissors', 'Too much to design?', 'Say "I\'ll simplify X for now and revisit if time allows." Controlled scope-cutting is a skill, not a weakness.', 'pink') +
V.section('fa-comment-dots', 'Phrases That Signal Senior Thinking') +
V.code('Say These', `"The interesting challenge here is ___"        (found the point)
"Given our 30K QPS estimate, this means ___"    (numbers drive design)
"Option A trades ___ for ___; given ___, I pick A" (tradeoff reflex)
"Before you ask — what happens if this dies?"   (self-attack)
"This is the same pattern as ___, so ___"       (transfer learning)
"I'll cut ___ from scope to go deeper on ___"   (deliberate scoping)
"At 10x scale, the first thing to break is ___" (growth thinking)`) +
V.deepDive('Why This Works: The Meta-Principle', `
<p>Every technique this week reduces to ONE idea:</p>
<p style="font-size:1rem; color:var(--neon-green); text-align:center; padding:1rem;"><strong>Never produce an artifact you can't justify backwards.</strong></p>
<p>Every box → cite the requirement that forced it. Every pattern → cite the change it protects against. Every number → cite the estimate it came from. Every cut → cite the priority that justified it.</p>
<p>Memorized designs collapse under one "why?" — derived designs survive twenty. Interviewers probe with "why" repeatedly precisely to distinguish the two. If your chain is REQUIREMENT → REASONING → DECISION at every step, there is nothing to collapse.</p>
${V.why('This is also why this app made you learn tradeoffs before templates. Templates expire; derivation generalizes to problems that don\'t exist yet — which is exactly what your real job will hand you.')}
`) +
V.walkthrough('FINAL TEST: The Approach', [
    {
        question: 'You get a problem you\'ve NEVER seen: "Design a system for hospitals to share patient records securely." You have no memorized template. What\'s your first move?',
        options: ['Panic and describe Twitter\'s architecture', 'Classify: consistency-critical + strict access control + audit requirements. Then ask the fork questions: real-time sharing or batch? Cross-hospital consent model?', 'Start drawing microservices', 'Ask to change the question'],
        correct: 1,
        explanation: 'Unseen problems are the whole point of the playbook. Classify (this smells consistency-critical + compliance-heavy → strong consistency, audit logs, encryption, access control lists). Ask the design-changing questions. Walk one record through its life. The approach IS the answer — templates were never going to save you.'
    },
    {
        question: 'The single most important habit from this entire week?',
        options: ['Memorize more architectures', 'Justify every decision backwards to a requirement or a number — derive, don\'t recall', 'Always use Redis', 'Draw diagrams faster'],
        correct: 1,
        explanation: 'Derivation over recall. Requirements → reasoning → decisions, with numbers as tiebreakers. This survives any problem, any follow-up, any "why?" — and it\'s the difference between sounding prepared and being good.'
    }
]) +
V.interviewTip('Print this day\'s playbook mentally before every interview. Classify → Ask → Estimate → Walk → Deep dive → Self-attack. Six moves. Every problem, HLD or LLD, every company. You\'re ready.')
        }
    ]
};

WEEKS.push(WEEK_APPROACH);
