// Extended content for Days 8-35

const EXTENDED2 = {
    8: // Message Queues
V.deepDive('Kafka Internals: Why It\'s So Fast', `
<p>Kafka achieves millions of messages/sec through clever disk I/O:</p>
<ul>
<li><strong>Sequential writes only</strong> — appends to end of log file. Sequential disk I/O is 100x faster than random.</li>
<li><strong>Zero-copy</strong> — data goes from disk → network buffer without passing through application memory.</li>
<li><strong>Batching</strong> — messages grouped into batches (less network overhead).</li>
<li><strong>Partitions</strong> — parallelism. 10 partitions = 10 consumers can read simultaneously.</li>
</ul>
${V.code('Kafka Offset Management', `Consumer A reads partition 0:
  Offset 0: msg1 ✓ (processed)
  Offset 1: msg2 ✓ (processed)
  Offset 2: msg3 ← current position
  Offset 3: msg4 (not yet read)

Consumer crashes at offset 2, restarts:
→ Resumes from offset 2. No data loss!
→ This is why Kafka can replay messages.`)}
${V.why('In interviews, if asked "Why Kafka over SQS?" — answer: replay capability (new consumers can read historical data), higher throughput (millions/sec), and ordering guarantees within a partition.')}
`) +
V.walkthrough('TEST: Queue Scenarios', [
    {
        question: 'Your order processing consumer crashes mid-way through processing an order (payment charged but shipping not triggered). The message was already deleted from SQS. What happens?',
        options: ['Order processes normally on retry', 'Order is LOST — payment charged but nothing ships', 'SQS automatically retries', 'The database rolls back'],
        correct: 1,
        explanation: 'If you delete the message before completing ALL processing steps, a crash means the message is gone forever. Fix: only delete/acknowledge AFTER full processing succeeds. Use "visibility timeout" — message stays invisible to other consumers while being processed, reappears if not deleted within timeout.'
    },
    {
        question: 'You process payments from a queue. Due to a retry, the same payment message gets processed twice. Customer charged twice. How to prevent?',
        options: ['Use FIFO queue', 'Make the consumer idempotent — check if payment_id already processed before charging', 'Increase visibility timeout', 'Use a dead letter queue'],
        correct: 1,
        explanation: 'Idempotent consumers are ESSENTIAL with at-least-once delivery. Before processing: check DB "was payment_id X already processed?" If yes, skip. Use a unique idempotency key per message.'
    }
]) +
V.interviewTip('Always mention: "Consumers must be idempotent because at-least-once delivery means duplicates are possible." This single sentence shows you understand distributed systems reality.'),

    9: // API Design
V.deepDive('API Versioning Strategies', `
${V.table(['Strategy', 'Example', 'Pros', 'Cons'], [
    ['URL Path', '/api/v1/users', 'Explicit, easy to route', 'URL pollution, hard to sunset'],
    ['Header', 'Accept: application/vnd.api.v2+json', 'Clean URLs', 'Hidden, easy to forget'],
    ['Query Param', '/users?version=2', 'Easy to add', 'Caching issues (different responses same URL)']
])}
<p><strong>Industry consensus:</strong> URL path versioning is most common and recommended. It's explicit, works with any HTTP client, and is easy to route at the API gateway level.</p>
${V.section('fa-exclamation-triangle', 'Breaking vs Non-Breaking Changes')}
<ul>
<li><strong>Non-breaking (no version bump):</strong> adding new optional field, adding new endpoint, adding new enum value</li>
<li><strong>Breaking (requires new version):</strong> removing a field, renaming a field, changing field type, changing URL structure</li>
</ul>
${V.why('Backwards compatibility is critical when you have mobile apps (can\'t force users to update). Always add, never remove or rename. If you must break, version the API and support old version for 6-12 months.')}
`) +
V.interviewTip('When designing APIs in an interview, always define: endpoint URL, HTTP method, request body, response body, status codes, and pagination strategy. This shows completeness.'),

    10: // Consistent Hashing
V.deepDive('Consistent Hashing — Full Walkthrough', `
${V.code('Step by Step', `Hash ring: 0 ──────────── 2^32

Servers hashed to positions:
  S1 → position 1000
  S2 → position 4000
  S3 → position 7000

Key "user:42" hashes to position 3500
→ Walk clockwise → first server = S2 (at 4000)
→ "user:42" lives on S2

ADD Server S4 at position 5000:
  Keys between 4000-5000 move from S3 to S4
  Everything else STAYS PUT!

Only ~25% of keys move (K/N = 1/4 of total)`)}
${V.section('fa-question-circle', 'How many virtual nodes?')}
<p>Rule of thumb: 100-200 virtual nodes per physical server. With 5 servers × 150 vnodes = 750 points on ring → very even distribution (standard deviation < 5%).</p>
${V.why('Without virtual nodes, 3 servers might own 60%, 30%, 10% of the ring (uneven due to hash randomness). Virtual nodes create 450 evenly-spaced points, making distribution nearly uniform.')}
`) +
V.realWorld('Discord', 'Uses consistent hashing to assign guilds (servers) to backend processes. When a process crashes, only that process\'s guilds need to be reassigned — all other guilds continue unaffected.'),

    11: // Sharding
V.walkthrough('TEST: Sharding Decisions', [
    {
        question: 'Your social app is sharded by user_id. A feature request asks: "Show all posts from Tokyo users." How would you implement this?',
        options: ['Query all shards (scatter-gather)', 'Reshard by city', 'Build a secondary index in Elasticsearch synced from all shards', 'Store city in every shard and filter'],
        correct: 2,
        explanation: 'Cross-shard queries are expensive (scatter-gather = slow). Better: maintain a search index (Elasticsearch) that syncs from all shards. Query ES for "city=Tokyo", get user_ids, then fetch from appropriate shards. This is the standard pattern for non-shard-key queries.'
    }
]) +
V.interviewTip('When you mention sharding, always follow with: "I\'d try these first: query optimization, indexing, read replicas, caching, vertical scaling. Sharding is a last resort because it\'s a one-way door that adds permanent operational complexity."'),

    12: // Replication
V.deepDive('Failover: What Really Happens', `
${V.steps([
    { title: 'Detection (10-30 sec)', text: 'Followers notice leader not responding. Use heartbeat timeout. Too short = false positives. Too long = slow recovery.' },
    { title: 'Election', text: 'Choose follower with highest replication log position (most up-to-date data). Consensus algorithm (Raft) ensures only one winner.' },
    { title: 'Reconfiguration', text: 'Promote winner to leader. Update all clients/proxies to point to new leader. Old leader becomes follower when it recovers.' },
    { title: 'Data reconciliation', text: 'Old leader may have writes that never replicated. These are typically LOST (or manual recovery). This is the cost of async replication.' }
])}
${V.infoBox('SPLIT BRAIN', 'The nightmare: both old leader and new leader accept writes simultaneously. Two sources of truth. Data diverges. Fix: use fencing tokens — only the node with the current valid token can write.', 'warning')}
`) +
V.realWorld('GitHub', 'In 2018, GitHub experienced a 24-hour outage caused by a network partition. Their MySQL cluster had split-brain where the old primary came back with writes that conflicted with the new primary. Recovery required manual data reconciliation.'),

    13: // CAP
V.deepDive('CAP in Practice: DynamoDB\'s Tunable Consistency', `
<p>DynamoDB lets you choose per-request:</p>
${V.code('DynamoDB Consistency', `// Eventually consistent read (AP mode):
// Fast, cheap, might return slightly stale data
aws dynamodb get-item --consistent-read false

// Strongly consistent read (CP mode):
// Slower, 2x cost, guaranteed latest data
aws dynamodb get-item --consistent-read true`)}
<p><strong>When to use which:</strong></p>
<ul>
<li><strong>Eventually consistent:</strong> User profile display, product catalog, social feed (stale by 1 sec is fine)</li>
<li><strong>Strongly consistent:</strong> After user updates their own data ("read-your-writes"), inventory check before purchase, account balance</li>
</ul>
${V.why('In interviews, don\'t say "this system is AP or CP." Say: "I\'d use eventual consistency for reads (fast, cheap) but strong consistency for the inventory check before purchase (can\'t sell what doesn\'t exist)." This shows nuance.')}
`) +
V.interviewTip('"Eventual consistency" doesn\'t mean "wrong forever." It means "will be correct within milliseconds to seconds." For 95% of features (social feed, notifications, analytics), this is perfectly fine. Reserve strong consistency for money and inventory.'),

    14: // Rate Limiter
V.deepDive('Sliding Window Counter — Best of Both Worlds', `
<p>Fixed window has the "boundary burst" problem. Sliding window log is memory-expensive. Sliding window counter is the sweet spot:</p>
${V.code('Sliding Window Counter', `Limit: 100 requests per minute

Previous window (1:00-1:01): 84 requests
Current window (1:01-1:02): 36 requests
Current position: 15 seconds into current window (25%)

Weighted count = prev × (1 - elapsed%) + current
             = 84 × 0.75 + 36
             = 63 + 36 = 99
             < 100 → ALLOWED

Next request:
             = 84 × 0.75 + 37 = 100 → REJECTED`)}
${V.why('This approximation is accurate within 0.003% error rate (proven by Cloudflare). It uses only 2 counters per user (previous window + current window) = 16 bytes total. Memory efficient AND accurate.')}
`) +
V.realWorld('Cloudflare', 'Processes 45 million HTTP requests per second. Their rate limiter uses sliding window counter in memory, synced across edge nodes via gossip protocol. Decision time: < 1ms.'),

    22: // Chat System
V.deepDive('End-to-End Encryption (WhatsApp Model)', `
${V.steps([
    { title: 'Key exchange', text: 'Alice and Bob exchange public keys (Signal Protocol). Server NEVER sees private keys.' },
    { title: 'Alice sends message', text: 'Encrypted with Bob\'s public key on Alice\'s device. Server stores encrypted blob.' },
    { title: 'Bob receives', text: 'Decrypts with his private key. Only Bob can read it.' },
    { title: 'Server\'s role', text: 'Just a relay — stores encrypted data it cannot read. Even if hacked, messages are safe.' }
])}
<p><strong>Group chat encryption:</strong> Each message encrypted separately for each group member (fan-out encryption). Expensive for large groups — WhatsApp limits groups to 1024 members partly for this reason.</p>
`) +
V.interviewTip('For chat systems, always discuss: message ordering (sequence numbers per conversation), delivery guarantees (at-least-once with dedup), and offline handling (queue messages, deliver on reconnect + push notification).'),

    25: // Microservices
V.deepDive('Saga vs 2PC — When to Use What', `
${V.table(['Factor', 'Saga', '2PC (Two-Phase Commit)'], [
    ['Consistency', 'Eventual (compensating actions)', 'Strong (atomic commit)'],
    ['Performance', 'Fast (no locking)', 'Slow (holds locks until all vote)'],
    ['Availability', 'High (partial failure OK)', 'Low (coordinator failure = stuck)'],
    ['Complexity', 'Complex compensation logic', 'Simple concept, hard to implement reliably'],
    ['Use when', 'Microservices, long-running flows', 'Single DB cluster, short transactions']
])}
${V.why('In microservices, 2PC is almost never used because: (1) holding locks across network calls is dangerous (timeout = locked forever), (2) coordinator is a single point of failure, (3) doesn\'t scale. Sagas with compensating transactions are the industry standard.')}
`) +
V.realWorld('Uber', 'Uses Cadence (now Temporal) for saga orchestration. Trip flow: match rider + driver → navigate → arrive → complete trip → charge payment. If payment fails, compensate: notify rider, credit driver differently, flag for manual review.'),

    28: // YouTube
V.deepDive('Video Transcoding Economics', `
<p>Transcoding is the most expensive operation in a video platform:</p>
${V.metrics([
    { value: '$0.015', label: 'PER MIN (1080p)' },
    { value: '3-5x', label: 'REALTIME RATIO' },
    { value: '6 formats', label: 'PER VIDEO' }
])}
<p>A 10-minute video transcoded to 6 resolutions × 3 codecs = 18 output files. Takes ~30-50 minutes on one machine.</p>
${V.section('fa-bolt', 'How YouTube makes it fast')}
<ul>
<li><strong>Segment parallelism:</strong> Split video into 10-sec chunks → transcode all chunks in parallel across hundreds of machines → reassemble. 10-min video done in 1-2 minutes!</li>
<li><strong>Prioritization:</strong> Popular creator uploads → transcode immediately. Unknown creator → queue (might never be watched).</li>
<li><strong>Adaptive codecs:</strong> Use AV1 (newer, better compression) for popular videos (saves CDN bandwidth). Use H.264 for long-tail (cheaper to encode).</li>
</ul>
`) +
V.interviewTip('For video platform designs, always mention the DAG (Directed Acyclic Graph) pipeline: upload → validate → split → transcode (parallel) → merge → thumbnail gen → CDN push → notify creator. Each step is a separate service connected by message queue.'),

    30: // Distributed Cache
V.walkthrough('TEST: Cache Architecture', [
    {
        question: 'Your Redis cluster has 3 primary nodes. Node 2 crashes. 5,462 hash slots (out of 16,384) are now unreachable. What happens?',
        options: ['Entire cluster goes down', 'Only keys in those slots fail — rest works. Replica of Node 2 gets promoted to primary.', 'All keys are redistributed to remaining nodes', 'Clients retry until node recovers'],
        correct: 1,
        explanation: 'Redis Cluster is partially available during node failure. Slots on that node are unavailable for a brief moment (seconds), then the replica gets promoted to primary and those slots are served again. Other slots continue working throughout.'
    }
]) +
V.realWorld('Twitter', 'Runs one of the largest Redis deployments: 10,000+ Redis instances serving 100M+ requests/sec. Uses Redis for timeline caching (sorted sets), rate limiting (counters), and session storage.'),

    31: // Ticket Booking
V.deepDive('Optimistic vs Pessimistic Locking — Full Comparison', `
${V.table(['Approach', 'How', 'When to Use', 'Problem'], [
    ['Pessimistic (SELECT FOR UPDATE)', 'Lock row in DB, hold until done', 'Low contention, short-lived locks', 'DB bottleneck under high concurrency'],
    ['Optimistic (version check)', 'Read version, UPDATE WHERE version=X', 'Medium contention, fast operations', 'High contention = many retries (thrashing)'],
    ['Redis SETNX (distributed lock)', 'Atomic set-if-not-exists with TTL', 'High contention, flash sales', 'Clock drift, need careful TTL tuning'],
    ['Queue-based (virtual waiting room)', 'Serialize all requests through queue', 'Extreme flash sales (10K+ concurrent)', 'Adds latency, complex UX (waiting page)']
])}
${V.why('For a 10K-user flash sale with 500 seats, Redis SETNX + virtual waiting room is the answer. Pessimistic DB locks would deadlock under that contention. Optimistic locking would thrash with 95% retry rate. Queue serialization ensures fairness.')}
`) +
V.interviewTip('For any booking system: mention the "seat hold timeout" pattern. User has 10 minutes to pay. No payment → lock auto-expires → seat available again. This handles abandoned carts without manual cleanup.'),

    35: // Final
V.deepDive('The Meta-Skill: How Interviewers Actually Score You', `
${V.section('fa-star', 'What gets HIGH scores')}
<ul>
<li><strong>Structured approach</strong> — follow the 5-step framework consistently</li>
<li><strong>Tradeoff discussion</strong> — "We could do X (pro, con) or Y (pro, con). I'd choose X because..."</li>
<li><strong>Numbers</strong> — "At 10K QPS, a single Redis handles this easily" (shows calibration)</li>
<li><strong>Production awareness</strong> — monitoring, failure modes, graceful degradation</li>
<li><strong>Adaptability</strong> — when interviewer says "what if scale is 100x?" you adjust the design</li>
</ul>
${V.section('fa-times-circle', 'What gets LOW scores')}
<ul>
<li>Jumping to solution without requirements</li>
<li>"Use Kafka" without explaining WHY Kafka vs alternatives</li>
<li>Drawing perfect architecture but can't explain failure scenarios</li>
<li>Not asking clarifying questions (shows you're guessing, not engineering)</li>
<li>Over-engineering for the scale (designing for 1B users when they said 10K)</li>
</ul>
${V.why('System design interviews test engineering JUDGMENT, not knowledge. They want to hear your reasoning process, not a memorized architecture. Two candidates with the same design — the one who explains WHY scores higher.')}
`)
};

// Inject extended2 content
function extendContent2() {
    WEEKS.forEach(week => {
        week.days.forEach(day => {
            if (EXTENDED2[day.day]) {
                day.content += EXTENDED2[day.day];
            }
        });
    });
}
