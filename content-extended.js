// Extended content: deep dives, walkthroughs, interview tips, why-boxes
// These are appended to each day's content for depth

const EXTENDED = {
    1: // Day 1: Scaling
V.deepDive('When to Scale Vertically vs Horizontally', `
<p>This isn't a simple "horizontal is always better" — it depends on your stage:</p>
${V.table(['Stage', 'Users', 'Strategy', 'Why'], [
    ['MVP/Startup', '< 10K', 'Single server, vertical', 'Simplicity wins. Don\'t over-engineer.'],
    ['Growing', '10K-100K', 'Vertical + Read replicas', 'Still simple. Upgrade machine, add DB replicas.'],
    ['Scale', '100K-1M', 'Horizontal + LB + Cache', 'You need fault tolerance and capacity.'],
    ['Massive', '1M+', 'Fully distributed', 'Sharding, microservices, CDN, multi-region.']
])}
<p><strong>The mistake:</strong> Engineers often shard too early. A single PostgreSQL instance on good hardware handles 10,000+ queries/sec. That's plenty for most startups.</p>
${V.why('Start vertical because it\'s simpler to debug, deploy, and reason about. Distributed systems add latency, consistency headaches, and operational complexity. Only pay that cost when you must.')}
`) +
V.walkthrough('TEST YOURSELF: Scaling Decisions', [
    {
        question: 'Your app has 500 DAU and the server CPU is at 40%. The CEO wants you to "prepare for scale." What do you do?',
        options: ['Immediately shard the database', 'Add Kubernetes cluster with auto-scaling', 'Do nothing yet — optimize code if needed, monitor', 'Add 5 more servers behind a load balancer'],
        correct: 2,
        explanation: 'At 500 DAU with 40% CPU, you have massive headroom. Premature optimization is the root of all evil. Monitor, optimize queries if needed, but don\'t add distributed complexity for imaginary scale.'
    },
    {
        question: 'Your stateful server stores user sessions in memory. You add a second server behind a load balancer. Users complain about being randomly logged out. Why?',
        options: ['The load balancer is broken', 'Sessions are in server memory — request hits Server B but session is on Server A', 'The database is slow', 'DNS is misconfigured'],
        correct: 1,
        explanation: 'Stateful trap! Session on Server A, next request routed to Server B → "Who are you?" Fix: externalize sessions to Redis. THEN any server handles any request.'
    }
]) +
V.realWorld('Netflix', 'Started as a single monolithic Java app. Moved to microservices + horizontal scaling only after reaching millions of users. Their rule: "Optimize for developer productivity first, scale second."') +
V.interviewTip('When asked "How would you scale this?", always start with: "What\'s the current bottleneck — CPU, memory, disk I/O, or network?" Don\'t prescribe a solution without diagnosing first.'),

    2: // Day 2: Load Balancing
V.deepDive('Load Balancer Internals', `
<p><strong>How does the LB itself not become a bottleneck?</strong></p>
<ul>
<li><strong>L4 LBs</strong> operate at kernel level — just rewriting IP headers. Can handle millions of connections/sec on a single machine.</li>
<li><strong>L7 LBs</strong> inspect HTTP — more expensive. But modern ones (Envoy, NGINX) handle 100K+ concurrent connections.</li>
<li><strong>DNS-based LB</strong> distributes at DNS level — no single LB machine. Used for global distribution (GeoDNS).</li>
</ul>
${V.why('In interviews, you might be asked: "Isn\'t the LB a single point of failure?" Answer: use active-passive pair with heartbeat (virtual IP failover). Or use DNS-based load balancing which has no single LB at all.')}
${V.table(['LB Type', 'Operates At', 'Can See', 'Use When'], [
    ['DNS LB', 'DNS layer', 'Nothing (just IP rotation)', 'Global distribution across regions'],
    ['L4 (NLB)', 'TCP/UDP', 'IP + Port only', 'Maximum throughput, TCP passthrough'],
    ['L7 (ALB)', 'HTTP', 'URL, Headers, Cookies, Body', 'Path-based routing, A/B testing, canary deploys']
])}
`) +
V.walkthrough('TEST: Load Balancer Scenarios', [
    {
        question: 'You have 3 servers: Server A (8 CPU), Server B (4 CPU), Server C (2 CPU). Which algorithm distributes load proportionally?',
        options: ['Round Robin', 'Least Connections', 'Weighted Round Robin', 'IP Hash'],
        correct: 2,
        explanation: 'Weighted Round Robin assigns weights proportional to capacity: A=4, B=2, C=1. Server A gets 4x more requests than C. Simple Round Robin would overload Server C.'
    },
    {
        question: 'Your e-commerce site uses sticky sessions (IP Hash). A corporate office with 10,000 employees shares one public IP. What happens?',
        options: ['Traffic is evenly distributed', 'ALL 10,000 users hit the same server (hotspot!)', 'The LB crashes', 'Users get 503 errors'],
        correct: 1,
        explanation: 'IP Hash puts all same-IP traffic on one server. A corporate NAT = one IP = hotspot. This is why IP Hash is risky for session affinity. Better: use cookie-based sticky sessions at L7.'
    }
]) +
V.realWorld('AWS ALB', 'Application Load Balancer does path-based routing (/api/* → backend, /static/* → CDN origin), host-based routing (api.site.com vs www.site.com), and weighted target groups for canary deployments (5% to new version, 95% to old).'),

    3: // Day 3: Caching
V.deepDive('Cache Invalidation — The Hardest Problem', `
<p>"There are only two hard things in CS: cache invalidation and naming things." — Phil Karlton</p>
${V.section('fa-question-circle', 'When does cache become stale?')}
<ul>
<li><strong>Write to DB but forget to invalidate cache</strong> — Code bug, most common issue</li>
<li><strong>Race condition:</strong> Thread A reads DB (old), Thread B updates DB + invalidates cache, Thread A writes old value to cache → STALE!</li>
<li><strong>Distributed cache across regions:</strong> US cache updated, EU cache still stale until TTL expires</li>
</ul>
${V.section('fa-shield-alt', 'Solutions')}
${V.table(['Strategy', 'How', 'Trade-off'], [
    ['Short TTL', 'Expire cache every 30s', 'Simple but still stale for 30s. High cache miss rate.'],
    ['Event-driven invalidation', 'DB write → publish event → cache deletes key', 'Consistent but complex. Need message queue.'],
    ['Write-through', 'Write cache + DB atomically', 'Never stale, but slower writes.'],
    ['Version tags', 'Cache key includes version: "user:123:v5"', 'Update version on write → old cache never read.']
])}
${V.why('In most systems, "slightly stale for 5 seconds" is acceptable. Only banking/inventory needs real-time consistency. Ask in the interview: "How stale is acceptable?" — this shows maturity.')}
`) +
V.walkthrough('TEST: Cache Scenarios', [
    {
        question: 'Your cache hit ratio is 60% (should be 95%). What\'s the most likely cause?',
        options: ['Cache is too small (keys getting evicted too fast)', 'Network latency to cache server', 'Database is too fast so cache isn\'t needed', 'The application has a bug'],
        correct: 0,
        explanation: '60% hit ratio usually means cache is too small — keys are evicted before they get re-requested. Increase cache memory, or check if you\'re caching too many unique keys (long tail). Also check TTL — if too short, keys expire before reuse.'
    },
    {
        question: 'Black Friday sale: your most popular product page\'s cache entry expires. 50,000 requests simultaneously hit your database. What pattern solves this?',
        options: ['Increase database connections', 'Cache stampede prevention: lock + single-flight fetch', 'Add more cache servers', 'Set TTL to infinity'],
        correct: 1,
        explanation: 'Cache stampede/thundering herd. Fix: first request acquires a lock, fetches from DB, updates cache. All other requests wait for the lock (or get slightly stale data). Only ONE request hits DB.'
    }
]) +
V.realWorld('Facebook', 'Uses Memcached with "lease" tokens. On cache miss, server gets a lease (permission to fetch from DB). If another server requests same key, it gets told "someone is fetching, wait." Eliminates stampede at Facebook scale (billions of requests/day).') +
V.interviewTip('Always mention cache warming in your design. "On deploy or cold start, I\'d pre-populate the cache with hot keys to avoid a thundering herd on the first requests."'),

    4: // Day 4: SQL
V.deepDive('Index Internals — B-Tree vs LSM', `
${V.section('fa-tree', 'B-Tree (Default in PostgreSQL, MySQL)')}
<p>Balanced tree structure. Every leaf node is at the same depth. O(log n) for reads AND writes.</p>
<ul>
<li>Great for: reads, range queries (BETWEEN, ORDER BY)</li>
<li>Writes: must update tree in-place (slower)</li>
<li>Storage: data stored sorted on disk</li>
</ul>
${V.section('fa-layer-group', 'LSM Tree (Used by Cassandra, RocksDB, LevelDB)')}
<p>Log-Structured Merge Tree. Writes go to in-memory buffer, periodically flushed to sorted files on disk.</p>
<ul>
<li>Great for: write-heavy workloads (100x faster writes than B-Tree)</li>
<li>Reads: must check multiple levels (slower)</li>
<li>Compaction: background process merges files</li>
</ul>
${V.table(['Feature', 'B-Tree', 'LSM Tree'], [
    ['Read speed', 'Fast O(log n)', 'Slower (check multiple levels)'],
    ['Write speed', 'Moderate', 'Very fast (sequential writes)'],
    ['Use case', 'OLTP (transactions)', 'Write-heavy (logs, time-series)'],
    ['Space', 'More (fragmentation)', 'Less (compacted)'],
    ['DB examples', 'PostgreSQL, MySQL', 'Cassandra, RocksDB, LevelDB']
])}
${V.why('This matters because when an interviewer asks "Why Cassandra for write-heavy?" the answer is LSM trees — optimized for sequential disk writes, which are 100x faster than random writes.')}
`) +
V.walkthrough('TEST: Database Decisions', [
    {
        question: 'You add an index on a column that gets updated 10,000 times/sec. Write performance drops 40%. Why?',
        options: ['Index is corrupted', 'Every UPDATE must also update the index — double the write work', 'Index uses too much RAM', 'The database needs more CPUs'],
        correct: 1,
        explanation: 'Indexes have a write cost! Every INSERT/UPDATE must maintain the index (rebalance the B-tree). For write-heavy columns, this overhead is significant. Don\'t index everything — only columns you frequently query with WHERE/JOIN/ORDER BY.'
    },
    {
        question: 'Your DB leader handles 5,000 writes/sec. You need 50,000 reads/sec. Adding read replicas solves this. But what if you need 50,000 WRITES/sec?',
        options: ['Add more read replicas', 'Read replicas solve write scaling too', 'You need sharding — split data across multiple leaders', 'Upgrade the leader server'],
        correct: 2,
        explanation: 'Read replicas only scale READS. All writes still go to one leader. To scale writes, you must shard: split data across multiple independent databases, each handling a portion of writes. This is why sharding is the "last resort" for SQL.'
    }
]),

    5: // Day 5: NoSQL
V.deepDive('DynamoDB Single-Table Design', `
<p>Advanced DynamoDB pattern: store ALL entity types in ONE table using clever key design.</p>
${V.code('Single Table Example', `PK              | SK                | Data
USER#123        | PROFILE           | {name, email}
USER#123        | ORDER#2024-001    | {total, status}
USER#123        | ORDER#2024-002    | {total, status}
ORDER#2024-001  | ITEM#SKU-A        | {qty, price}
ORDER#2024-001  | ITEM#SKU-B        | {qty, price}

Query: "All orders for user 123"
→ PK=USER#123, SK begins_with "ORDER#"

Query: "All items in order 2024-001"
→ PK=ORDER#2024-001, SK begins_with "ITEM#"`)}
${V.why('Single-table design eliminates JOINs (DynamoDB can\'t JOIN). By overloading PK/SK with type prefixes, you serve multiple access patterns from one table with one query each. This is how DynamoDB experts design.')}
`) +
V.walkthrough('TEST: NoSQL Decisions', [
    {
        question: 'You\'re building a social media app. Users post content, follow others, and see a feed. Which database type for the "followers" relationship graph?',
        options: ['Key-Value (Redis)', 'Document (MongoDB)', 'Graph (Neo4j)', 'Relational (PostgreSQL)'],
        correct: 2,
        explanation: 'Graph databases excel at relationship traversal: "friends of friends", "who follows who", "recommended connections." These queries in SQL require expensive recursive JOINs. In a graph DB, they\'re O(edges) — direct traversal.'
    },
    {
        question: 'DynamoDB partition key is "country". Your app has 80% users in USA. What happens?',
        options: ['Even distribution across partitions', 'USA partition becomes a hotspot — throttled, slow', 'DynamoDB auto-rebalances', 'No impact on performance'],
        correct: 1,
        explanation: 'Bad partition key! Low cardinality + skewed distribution = hot partition. The USA partition gets 80% of traffic while others sit idle. Fix: use user_id (high cardinality, even distribution) as partition key.'
    }
]) +
V.interviewTip('When discussing NoSQL, always state your ACCESS PATTERNS first: "My queries are: get user by ID, get orders by user+date range, search by product name." Then choose the DB that fits those patterns. This shows you design data models around queries, not the other way around.'),

    6: // Day 6: CDN + DNS
V.deepDive('CDN Cache Hierarchy & Invalidation', `
${V.section('fa-sitemap', 'Multi-Layer Cache')}
${V.code('Cache Hierarchy', `L1: Browser cache (user's device)     → 0ms
L2: CDN Edge (city-level PoP)          → 5-20ms
L3: CDN Regional (country-level)       → 20-50ms
L4: CDN Shield (single origin proxy)   → 50-100ms
L5: Origin server                       → 100-500ms`)}
<p>Each layer reduces load on the layer behind it. L1 handles 60% of requests, L2 handles 30%, only 10% reach origin.</p>
${V.section('fa-sync', 'Invalidation Strategies')}
${V.table(['Strategy', 'How', 'Latency', 'Complexity'], [
    ['Versioned URL', '/app.abc123.js', 'Instant (new URL)', 'Low — build tool generates hash'],
    ['Purge API', 'Call CDN API to delete', '1-5 min global', 'Medium — need to track what to purge'],
    ['Short TTL', 'TTL: 60s', '< 60s staleness', 'Low — but reduces cache hit ratio'],
    ['Stale-while-revalidate', 'Serve stale, fetch fresh async', 'Instant (stale)', 'Low — best user experience']
])}
${V.why('Versioned URLs (content-hash in filename) are the gold standard. Set TTL to 1 year (immutable). Every deploy produces new filenames. Zero staleness, maximum caching.')}
`) +
V.realWorld('Cloudflare', 'Serves 20% of all web traffic. Has 300+ PoPs globally. Average response time: 5ms. Uses Anycast routing — all PoPs share the same IP, network routes to nearest one automatically.'),

    7: // Day 7: URL Shortener
V.walkthrough('DESIGN CHALLENGE: URL Shortener', [
    {
        question: 'Your URL shortener generates short URLs using MD5 hash (take first 7 chars). Two different long URLs produce the same 7-char prefix. What\'s this called and how do you fix it?',
        options: ['Race condition — add locks', 'Hash collision — check DB, if exists rehash with counter appended', 'Overflow — use longer hash', 'Impossible with MD5'],
        correct: 1,
        explanation: 'Hash collision: MD5 produces 128 bits but you only use 7 chars (42 bits). Collisions are inevitable at scale. Fix: check if short URL exists in DB, if yes → append counter to original URL and rehash. Or better: use KGS (pre-generated keys, zero collisions).'
    },
    {
        question: 'You chose 301 (permanent redirect). Product team says "we can\'t track click analytics anymore." Why?',
        options: ['301 is cached by browser — subsequent visits never hit your server', 'Analytics service is down', '301 doesn\'t support headers', 'The database lost click data'],
        correct: 0,
        explanation: '301 = browser caches the redirect. Second click → browser goes directly to destination, YOUR server never sees it. For analytics, use 302 (temporary) — browser always hits your server first, you log the click, THEN redirect.'
    },
    {
        question: 'Your KGS (Key Generation Service) generates keys in advance. What happens if KGS crashes after generating keys but before marking them "used"?',
        options: ['Keys are lost forever', 'Same keys might be assigned to two different URLs (collision!)', 'Nothing — keys are in the unused pool and get used normally', 'The system stops working'],
        correct: 1,
        explanation: 'If KGS assigns a key, crashes before marking it used, then restarts and assigns it again → two URLs share one short key! Fix: KGS marks keys as "assigned" BEFORE giving them out. On crash, those keys are simply lost (wasted, but no collision). Small waste is fine given trillions of possible keys.'
    }
]) +
V.interviewTip('For URL shortener, always mention: "I\'d add rate limiting (prevent abuse), expiration (cleanup old URLs), and custom alias validation (reserved words, profanity filter)." These details show production thinking.')
};

// Inject extended content into each day
function extendContent() {
    WEEKS.forEach(week => {
        week.days.forEach(day => {
            if (EXTENDED[day.day]) {
                day.content += EXTENDED[day.day];
            }
        });
    });
}
