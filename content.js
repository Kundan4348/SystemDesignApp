// Content uses V.* helpers from visuals.js for rich rendering
// Each day's content is a function that returns HTML string

function buildContent() {

const WEEKS = [
{
    id: 1,
    title: "CORE FUNDAMENTALS",
    subtitle: "Initialize base protocols",
    color: "#00ff41",
    days: [
        {
            day: 1,
            title: "Scaling Basics",
            subtitle: "Vertical vs Horizontal",
            xp: 50,
            content: V.banner('fa-expand-arrows-alt', 'SCALING PROTOCOLS', 'Making systems handle more load', 'green') +
V.section('fa-arrow-up', 'Two Types of Scaling') +
V.vs(
    { title: 'VERTICAL (Scale Up)', text: 'Add more power to ONE machine. More RAM, better CPU, bigger disk. Simple but has a ceiling.', icon: 'fa-arrow-up', type: 'good' },
    { title: 'HORIZONTAL (Scale Out)', text: 'Add MORE machines to share the load. No ceiling, fault tolerant, but more complex.', icon: 'fa-arrows-alt-h', type: 'good' }
) +
V.metrics([
    { value: '1→64GB', label: 'VERTICAL' },
    { value: '1→100', label: 'HORIZONTAL' },
    { value: '∞', label: 'CEILING (H)' }
]) +
V.section('fa-server', 'Scaling Progression') +
V.archFlow([
    { icon: 'fa-users', label: 'Users', type: 'client' },
    { icon: 'fa-server', label: 'Single Server', type: 'server' },
    { icon: 'fa-database', label: 'Database', type: 'database' }
]) +
`<p style="text-align:center; font-size:0.7rem; color:var(--text-dim);">↓ Scale to 10K users ↓</p>` +
V.archFlow([
    { icon: 'fa-users', label: 'Users', type: 'client' },
    { icon: 'fa-balance-scale', label: 'Load Balancer', type: 'queue' },
    { icon: 'fa-server', label: 'Server 1..N', type: 'server' },
    { icon: 'fa-bolt', label: 'Cache', type: 'cache' },
    { icon: 'fa-database', label: 'DB', type: 'database' }
]) +
V.section('fa-lock-open', 'Stateless vs Stateful') +
V.vs(
    { title: 'STATELESS ✓', text: 'Session in Redis/DB. Any server handles any request. Easy to scale horizontally.', icon: 'fa-check', type: 'good' },
    { title: 'STATEFUL ✗', text: 'Session in server memory. Request must hit SAME server. Breaks with load balancer.', icon: 'fa-times', type: 'bad' }
) +
V.infoBox('KEY RULE', 'Store state OUTSIDE your application servers (Redis, DB, S3). Then any server can handle any request.', 'key') +
V.section('fa-brain', 'Key Takeaways') +
V.concept('fa-arrow-up', 'Start Vertical', 'Simple first. Go horizontal when you hit machine limits.', 'green') +
V.concept('fa-unlock', 'Go Stateless', 'External session store enables horizontal scaling.', 'cyan') +
V.concept('fa-layer-group', 'Scale Everything', 'Servers, databases, caches — each layer scales independently.', 'purple')
        },
        {
            day: 2,
            title: "Load Balancing",
            subtitle: "Traffic distribution",
            xp: 50,
            content: V.banner('fa-balance-scale', 'LOAD BALANCING', 'Distributing traffic across servers', 'cyan') +
V.section('fa-question-circle', 'What is a Load Balancer?') +
`<p>Sits between clients and servers. Distributes requests so no single server gets overwhelmed.</p>` +
V.vs(
    { title: 'WITH LB', text: 'Traffic split evenly. No server overloaded. If one dies, others continue.', icon: 'fa-check', type: 'good' },
    { title: 'WITHOUT LB', text: 'All traffic hits one server. Overloads, crashes. Single point of failure.', icon: 'fa-times', type: 'bad' }
) +
V.archFlow([
    { icon: 'fa-users', label: 'All Users', type: 'client' },
    { icon: 'fa-balance-scale', label: 'Load Balancer', type: 'queue' },
    { icon: 'fa-server', label: 'Server 1 (33%)', type: 'server' }
]) +
V.section('fa-cogs', 'Algorithms') +
V.concept('fa-redo', 'Round Robin', 'Send in order: 1, 2, 3, 1, 2, 3... Simple, assumes equal servers.', 'green') +
V.concept('fa-weight-hanging', 'Weighted Round Robin', 'Powerful servers get more requests. Server A (3x) vs Server B (1x).', 'cyan') +
V.concept('fa-plug', 'Least Connections', 'Send to server with fewest active connections. Best for variable request times.', 'purple') +
V.concept('fa-fingerprint', 'IP Hash', 'Same client IP always hits same server. Good for session affinity.', 'orange') +
V.section('fa-layer-group', 'L4 vs L7') +
V.table(['Layer', 'Routes By', 'Speed', 'Example'], [
    ['L4 (Transport)', 'IP + Port', 'Very Fast', 'AWS NLB'],
    ['L7 (Application)', 'URL, Headers, Cookies', 'Smart routing', 'AWS ALB']
]) +
V.section('fa-heartbeat', 'Health Checks') +
V.code('Health Check Flow', `LB → GET /health → Server1: 200 OK  ✓ (keep)
LB → GET /health → Server2: TIMEOUT ✗ (remove!)
LB → GET /health → Server3: 200 OK  ✓ (keep)`) +
V.infoBox('REDUNDANCY', 'Use active-passive LB pair. If active dies, passive takes over. LB itself must not be a single point of failure.', 'tip')
        },
        {
            day: 3,
            title: "Caching",
            subtitle: "Speed amplification",
            xp: 50,
            content: V.banner('fa-bolt', 'CACHING', 'Store hot data in faster layer', 'yellow') +
V.metrics([
    { value: '50ms', label: 'DB READ' },
    { value: '2ms', label: 'CACHE READ' },
    { value: '25x', label: 'FASTER' }
]) +
V.section('fa-sitemap', 'Cache Placement') +
V.archFlow([
    { icon: 'fa-mobile-alt', label: 'Client', type: 'client' },
    { icon: 'fa-globe', label: 'CDN', type: 'storage' },
    { icon: 'fa-server', label: 'App Server', type: 'server' },
    { icon: 'fa-bolt', label: 'Redis', type: 'cache' },
    { icon: 'fa-database', label: 'Database', type: 'database' }
]) +
V.section('fa-exchange-alt', 'Strategies') +
V.concept('fa-hand-point-right', 'Cache-Aside (Most Common)', 'Read: check cache → miss? read DB → write to cache. Write: write DB → delete cache entry.', 'green') +
V.concept('fa-sync', 'Write-Through', 'Write to cache AND DB at same time. Never stale, but slower writes.', 'cyan') +
V.concept('fa-fast-forward', 'Write-Back', 'Write cache ONLY, flush to DB later. Super fast but risk data loss on crash.', 'purple') +
V.section('fa-trash-alt', 'Eviction Policies') +
V.table(['Policy', 'Removes', 'Best For'], [
    ['LRU', 'Least Recently Used', 'General purpose (default choice)'],
    ['LFU', 'Least Frequently Used', 'When popularity matters'],
    ['TTL', 'After N seconds', 'Data with known freshness']
]) +
V.section('fa-exclamation-triangle', 'Common Problems') +
V.concept('fa-bolt', 'Stampede', 'Hot key expires → 1000 requests hit DB. Fix: locking or early refresh.', 'orange') +
V.concept('fa-ghost', 'Penetration', 'Requests for non-existent data bypass cache forever. Fix: cache null values or Bloom filter.', 'pink') +
V.concept('fa-snowflake', 'Avalanche', 'Many keys expire at once → DB flood. Fix: random TTL jitter.', 'cyan') +
V.infoBox('REDIS vs MEMCACHED', 'Redis: data structures, persistence, replication. Memcached: simple key-value, maximum speed. Use Redis for most cases.', 'info')
        },
        {
            day: 4,
            title: "SQL Databases",
            subtitle: "Structured data systems",
            xp: 50,
            content: V.banner('fa-database', 'SQL DATABASES', 'Relational data with ACID guarantees', 'purple') +
V.section('fa-shield-alt', 'ACID Properties') +
V.concept('fa-atom', 'Atomicity', 'All or nothing. Transfer $100: BOTH debit and credit succeed, or BOTH fail.', 'green') +
V.concept('fa-check-circle', 'Consistency', 'Data always follows rules. Balance never goes negative (if constrained).', 'cyan') +
V.concept('fa-user-shield', 'Isolation', 'Concurrent transactions don\'t interfere. Two buyers, one item — only one wins.', 'purple') +
V.concept('fa-hdd', 'Durability', 'Once committed, data survives crashes. Power loss after commit → data safe.', 'orange') +
V.section('fa-search', 'Indexing') +
V.vs(
    { title: 'WITH INDEX', text: 'O(log n) lookup. Like a book\'s table of contents — jump directly to the page.', icon: 'fa-bolt', type: 'good' },
    { title: 'WITHOUT INDEX', text: 'O(n) full scan. Reading every page to find one sentence. 10M rows = slow!', icon: 'fa-snail', type: 'bad' }
) +
V.infoBox('TRADE-OFF', 'Indexes speed up READS but slow down WRITES (must update index on every insert). Index columns you frequently WHERE, JOIN, or ORDER BY on.', 'warning') +
V.section('fa-clone', 'Replication') +
V.archLayers([
    [{ icon: 'fa-pen', label: 'Writes', type: 'client' }, { icon: 'fa-database', label: 'Leader', type: 'database' }],
    [{ icon: 'fa-eye', label: 'Reads', type: 'client' }, { icon: 'fa-database', label: 'Follower 1', type: 'server' }, { icon: 'fa-database', label: 'Follower 2', type: 'server' }]
]) +
V.section('fa-th', 'Sharding') +
V.code('Range Sharding', `Users 1-1M     → Shard 1
Users 1M-2M    → Shard 2
Users 2M-3M   → Shard 3`) +
V.tags([
    { text: 'JOINs across shards = hard', type: 'con' },
    { text: 'Resharding = painful', type: 'con' },
    { text: 'Hotspots possible', type: 'con' },
    { text: 'Enables massive scale', type: 'pro' }
]) +
V.infoBox('WHEN TO USE SQL', 'ACID transactions needed (banking), complex relationships (JOINs), stable well-defined schema, complex queries (GROUP BY).', 'key')
        },
        {
            day: 5,
            title: "NoSQL Databases",
            subtitle: "Flexible data stores",
            xp: 50,
            content: V.banner('fa-cubes', 'NoSQL DATABASES', 'Flexible schemas for specific access patterns', 'pink') +
V.section('fa-th-large', 'Four Types') +
V.concept('fa-key', 'Key-Value (Redis, DynamoDB)', 'Simplest: GET/PUT/DELETE by key. O(1) lookups. Use for: sessions, caching, carts.', 'green') +
V.concept('fa-file-alt', 'Document (MongoDB)', 'Store JSON documents. Flexible schema. Use for: profiles, catalogs, CMS.', 'cyan') +
V.concept('fa-columns', 'Column-Family (Cassandra)', 'Data stored by column. Use for: time-series, analytics, IoT sensor data.', 'purple') +
V.concept('fa-project-diagram', 'Graph (Neo4j)', 'Nodes + Edges. Fast relationship traversal. Use for: social networks, recommendations.', 'pink') +
V.section('fa-balance-scale', 'SQL vs NoSQL') +
V.table(['Factor', 'Choose SQL', 'Choose NoSQL'], [
    ['Schema', 'Fixed, well-defined', 'Flexible, evolving'],
    ['Relationships', 'Complex JOINs', 'Simple/denormalized'],
    ['Transactions', 'ACID required', 'Eventual consistency OK'],
    ['Scale', 'Moderate', 'Massive horizontal'],
    ['Query', 'Ad-hoc complex', 'Known access patterns']
]) +
V.section('fa-key', 'DynamoDB Keys') +
V.concept('fa-columns', 'Partition Key', 'Determines physical partition. Must distribute evenly (avoid hotspots!).', 'orange') +
V.concept('fa-sort-amount-down', 'Sort Key', 'Orders items within partition. Enables range queries (e.g., last 30 days).', 'cyan') +
V.concept('fa-clone', 'GSI', 'Global Secondary Index — query by different attributes without scanning.', 'purple') +
V.infoBox('DENORMALIZATION', 'NoSQL duplicates data to avoid JOINs. Trade-off: faster reads, harder writes (update name in many places). Works for read-heavy data.', 'tip')
        },
        {
            day: 6,
            title: "CDN + DNS",
            subtitle: "Global delivery network",
            xp: 50,
            content: V.banner('fa-globe-americas', 'CDN + DNS', 'Global content delivery', 'cyan') +
V.section('fa-phone-alt', 'DNS — Internet\'s Phone Book') +
`<p>Translates human-readable names to IP addresses: <code>www.amazon.com → 52.94.236.248</code></p>` +
V.steps([
    { title: 'Browser asks', text: '"What\'s the IP for www.amazon.com?"' },
    { title: 'Recursive Resolver (ISP)', text: '"Let me find out for you..."' },
    { title: 'Root Server', text: '"For .com, ask this TLD server"' },
    { title: 'TLD Server (.com)', text: '"For amazon.com, ask this authoritative server"' },
    { title: 'Authoritative Server', text: '"www.amazon.com = 52.94.236.248" — cached at every level!' }
]) +
V.section('fa-rocket', 'CDN — Content Delivery Network') +
V.metrics([
    { value: '200ms', label: 'WITHOUT CDN' },
    { value: '20ms', label: 'WITH CDN' },
    { value: '10x', label: 'FASTER' }
]) +
V.archFlow([
    { icon: 'fa-user', label: 'User (Tokyo)', type: 'client' },
    { icon: 'fa-satellite-dish', label: 'CDN Edge (Tokyo)', type: 'cache' },
    { icon: 'fa-server', label: 'Origin (Virginia)', type: 'server' }
]) +
V.section('fa-sync', 'Pull vs Push CDN') +
V.vs(
    { title: 'PULL CDN', text: 'CDN fetches from origin on first request (lazy). Best for most cases.', icon: 'fa-download', type: 'good' },
    { title: 'PUSH CDN', text: 'You upload to CDN proactively. For large files you know will be needed.', icon: 'fa-upload', type: 'good' }
) +
V.infoBox('CACHE INVALIDATION', 'Version your URLs: /app.v2.js instead of purging cache manually. New deploy = new URL = old cache never requested again.', 'tip')
        },
        {
            day: 7,
            title: "Design: URL Shortener",
            subtitle: "First system breach",
            xp: 100,
            content: V.banner('fa-link', 'URL SHORTENER', 'Your first full system design', 'green') +
V.section('fa-clipboard-list', 'Requirements') +
V.tags([
    { text: 'Generate short URL', type: 'info' },
    { text: 'Redirect to original', type: 'info' },
    { text: 'Highly available', type: 'pro' },
    { text: '< 50ms redirect', type: 'pro' }
]) +
V.section('fa-calculator', 'Scale Estimation') +
V.metrics([
    { value: '1.2K/s', label: 'WRITES' },
    { value: '12K/s', label: 'READS' },
    { value: '90 TB', label: '5YR STORAGE' }
]) +
V.section('fa-sitemap', 'Architecture') +
V.archLayers([
    [{ icon: 'fa-users', label: 'Clients', type: 'client' }, { icon: 'fa-balance-scale', label: 'Load Balancer', type: 'queue' }],
    [{ icon: 'fa-server', label: 'API Servers', type: 'server' }, { icon: 'fa-bolt', label: 'Redis Cache', type: 'cache' }],
    [{ icon: 'fa-key', label: 'Key Gen Service', type: 'server' }, { icon: 'fa-database', label: 'DB (NoSQL)', type: 'database' }]
]) +
V.section('fa-key', 'URL Generation — KGS') +
V.concept('fa-random', 'Key Generation Service', 'Pre-generate millions of unique 7-char Base62 keys. On request: take next unused key. No collision, no hash computation.', 'green') +
V.code('Base62', `Characters: [a-z, A-Z, 0-9] = 62 chars
7 chars → 62^7 = 3.5 TRILLION possible URLs`) +
V.section('fa-directions', '301 vs 302 Redirect') +
V.table(['Code', 'Type', 'Use When'], [
    ['301', 'Permanent — browser caches', 'Reducing server load'],
    ['302', 'Temporary — always hits server', 'Need click analytics']
]) +
V.infoBox('MONITORING', 'Track: redirect latency (p99), cache hit ratio (>95%), DB read latency. Alert if redirect p99 > 100ms.', 'tip')
        }
    ]
},
{
    id: 2,
    title: "BUILDING BLOCKS",
    subtitle: "Advanced subsystems",
    color: "#00f0ff",
    days: [
        {
            day: 8,
            title: "Message Queues",
            subtitle: "Async communication",
            xp: 50,
            content: V.banner('fa-envelope', 'MESSAGE QUEUES', 'Asynchronous communication between services', 'orange') +
V.section('fa-question-circle', 'Why Queues?') +
V.vs(
    { title: 'WITH QUEUE (Async)', text: 'Server drops message in queue → responds instantly. Worker processes later. User doesn\'t wait!', icon: 'fa-bolt', type: 'good' },
    { title: 'WITHOUT (Sync)', text: 'Server sends email synchronously → user waits 3 seconds for response. Terrible UX.', icon: 'fa-hourglass', type: 'bad' }
) +
V.concept('fa-shield-alt', 'Decoupling', 'Producer doesn\'t know about consumer. They evolve independently.', 'green') +
V.concept('fa-water', 'Buffering', 'Consumer slow? Messages wait in queue. No data loss.', 'cyan') +
V.concept('fa-mountain', 'Spike Handling', '10K requests at once → queue absorbs spike, consumers process at steady rate.', 'purple') +
V.section('fa-code-branch', 'Two Models') +
V.vs(
    { title: 'QUEUE (Point-to-Point)', text: 'Each message → ONE consumer only. Like SQS. Use for: task processing.', icon: 'fa-user', type: 'good' },
    { title: 'PUB/SUB (Topic)', text: 'Each message → ALL subscribers. Like SNS/Kafka. Use for: event broadcasting.', icon: 'fa-users', type: 'good' }
) +
V.section('fa-balance-scale', 'SQS vs Kafka') +
V.table(['Feature', 'SQS', 'Kafka'], [
    ['Model', 'Queue', 'Pub/Sub + Log'],
    ['Replay', 'No (deleted after read)', 'Yes (offset-based)'],
    ['Throughput', 'Moderate', 'Millions/sec'],
    ['Use case', 'Task queues, decoupling', 'Event streaming, logs']
]) +
V.infoBox('KAFKA KEY CONCEPTS', 'Topic = category. Partition = parallelism unit. Offset = position. Consumer Group = shared work. Messages retained even after consumption (replay!).', 'key')
        },
        {
            day: 9,
            title: "API Design",
            subtitle: "Interface protocols",
            xp: 50,
            content: V.banner('fa-plug', 'API DESIGN', 'Building clean interfaces', 'green') +
V.section('fa-globe', 'REST') +
V.code('REST Endpoints', `GET    /users          → List users
GET    /users/123      → Get user 123
POST   /users          → Create user
PUT    /users/123      → Full update
PATCH  /users/123      → Partial update
DELETE /users/123      → Delete`) +
V.section('fa-exchange-alt', 'REST vs gRPC') +
V.table(['Factor', 'REST', 'gRPC'], [
    ['Format', 'JSON (text, readable)', 'Protobuf (binary, fast)'],
    ['Streaming', 'No', 'Bidirectional'],
    ['Use', 'Public/external APIs', 'Internal microservices']
]) +
V.section('fa-book-open', 'Pagination') +
V.vs(
    { title: 'CURSOR-BASED ✓', text: '/users?cursor=abc&limit=20 — Fast at any position. Used by Twitter, DynamoDB.', icon: 'fa-check', type: 'good' },
    { title: 'OFFSET-BASED', text: '/users?offset=10000&limit=20 — Slow for large offsets (DB skips rows).', icon: 'fa-times', type: 'bad' }
) +
V.section('fa-tachometer-alt', 'Rate Limiting — Token Bucket') +
V.steps([
    { title: 'Bucket starts with N tokens', text: 'e.g., 10 tokens' },
    { title: 'Each request takes 1 token', text: 'Bucket decreases' },
    { title: 'Tokens refill at rate R/sec', text: 'Steady replenishment' },
    { title: 'Bucket empty?', text: 'Return 429 Too Many Requests' }
]) +
V.section('fa-redo', 'Idempotency') +
V.concept('fa-check', 'Idempotent', 'GET, PUT, DELETE — same result if called twice. Safe to retry.', 'green') +
V.concept('fa-exclamation', 'NOT Idempotent', 'POST — creates duplicate on retry! Fix: Idempotency-Key header.', 'orange')
        },
        {
            day: 10,
            title: "Consistent Hashing",
            subtitle: "Distributed key routing",
            xp: 60,
            content: V.banner('fa-circle-notch', 'CONSISTENT HASHING', 'Minimizing key movement when servers change', 'purple') +
V.section('fa-exclamation-triangle', 'The Problem') +
V.code('Mod Hashing Breaks', `server = hash(key) % 4  →  Key goes to Server 2
ADD 1 server:
server = hash(key) % 5  →  Key goes to Server 3 ← MOVED!

Result: ~80% of ALL keys must move! Massive cache miss storm.`) +
V.section('fa-ring', 'The Ring Solution') +
V.steps([
    { title: 'Imagine a circle (ring) 0 to 2³²', text: 'Hash space forms a ring' },
    { title: 'Hash each server onto the ring', text: 'Servers get positions on the circle' },
    { title: 'Hash each key onto the ring', text: 'Keys also get positions' },
    { title: 'Walk clockwise from key', text: 'First server you hit = where key lives' }
]) +
V.infoBox('KEY INSIGHT', 'Adding a server: only keys between new server and its predecessor move. With K keys and N servers: only K/N keys move (not 80%!)', 'key') +
V.section('fa-clone', 'Virtual Nodes') +
`<p>Few servers → uneven distribution. Fix: each server gets <strong>100-200 virtual positions</strong> on the ring.</p>` +
V.section('fa-industry', 'Used By') +
V.tags([
    { text: 'DynamoDB', type: 'info' },
    { text: 'Cassandra', type: 'info' },
    { text: 'Redis Cluster', type: 'info' },
    { text: 'CDNs', type: 'info' },
    { text: 'Discord', type: 'info' }
])
        },
        {
            day: 11,
            title: "Database Sharding",
            subtitle: "Data partitioning",
            xp: 50,
            content: V.banner('fa-th', 'DATABASE SHARDING', 'Splitting data across multiple databases', 'cyan') +
V.section('fa-cut', 'What is Sharding?') +
`<p>Split database into smaller pieces (shards), each holding a subset of data.</p>` +
V.archFlow([
    { icon: 'fa-database', label: 'Shard 1 (A-F)', type: 'database' },
    { icon: 'fa-database', label: 'Shard 2 (G-M)', type: 'server' },
    { icon: 'fa-database', label: 'Shard 3 (N-Z)', type: 'storage' }
]) +
V.section('fa-cogs', 'Strategies') +
V.concept('fa-arrows-alt-h', 'Range-Based', 'Users A-F → Shard 1. Simple but uneven distribution.', 'green') +
V.concept('fa-hashtag', 'Hash-Based', 'hash(user_id) % N. Even distribution. Use with consistent hashing!', 'cyan') +
V.concept('fa-book', 'Directory-Based', 'Lookup table maps key → shard. Most flexible but extra hop.', 'purple') +
V.section('fa-key', 'Choosing a Shard Key') +
V.table(['Data', 'Good Key', 'Bad Key'], [
    ['User data', 'user_id (hash)', 'country (uneven)'],
    ['Orders', 'order_id', 'status (3 values only!)'],
    ['Messages', 'conversation_id', 'created_date (recent hot)']
]) +
V.section('fa-exclamation-triangle', 'Problems') +
V.tags([
    { text: 'Cross-shard JOINs impossible', type: 'con' },
    { text: 'Transactions span shards = hard', type: 'con' },
    { text: 'Hotspots possible', type: 'con' },
    { text: 'Resharding is painful', type: 'con' }
]) +
V.infoBox('TRY FIRST', 'Before sharding: optimize queries → add indexes → read replicas → vertical scaling → caching. Sharding is a last resort (one-way door).', 'warning')
        },
        {
            day: 12,
            title: "Replication",
            subtitle: "Data redundancy",
            xp: 50,
            content: V.banner('fa-clone', 'REPLICATION', 'Keeping copies for availability and speed', 'green') +
V.section('fa-sitemap', 'Leader-Follower') +
V.archLayers([
    [{ icon: 'fa-pen', label: 'Writes', type: 'client' }, { icon: 'fa-database', label: 'Leader', type: 'database' }],
    [{ icon: 'fa-eye', label: 'Reads', type: 'client' }, { icon: 'fa-database', label: 'Follower 1', type: 'server' }, { icon: 'fa-database', label: 'Follower 2', type: 'server' }]
]) +
V.section('fa-sync', 'Sync vs Async') +
V.vs(
    { title: 'SYNCHRONOUS', text: 'Wait for follower confirm. Guaranteed data, but slower writes.', icon: 'fa-lock', type: 'good' },
    { title: 'ASYNCHRONOUS', text: 'Respond immediately. Fast writes, but risk data loss if leader dies.', icon: 'fa-bolt', type: 'good' }
) +
V.section('fa-users', 'Leaderless (Quorum)') +
V.code('Quorum Formula', `N=3 nodes, W=2 writes, R=2 reads
W + R > N  →  2 + 2 = 4 > 3  →  STRONG CONSISTENCY
At least one node has latest write in every read!`) +
V.section('fa-exclamation-triangle', 'Replication Lag') +
V.concept('fa-eye', 'Read-Your-Writes', 'User writes then reads stale follower. Fix: route user\'s own reads to leader.', 'orange') +
V.concept('fa-exclamation', 'Split Brain', 'Two nodes think they\'re leader → both accept writes → conflicts! Fix: consensus (Raft).', 'pink')
        },
        {
            day: 13,
            title: "CAP Theorem",
            subtitle: "Distributed tradeoffs",
            xp: 50,
            content: V.banner('fa-project-diagram', 'CAP THEOREM', 'The fundamental distributed systems tradeoff', 'pink') +
V.section('fa-info-circle', 'The Three Properties') +
V.concept('fa-check-double', 'Consistency (C)', 'Every read gets the most recent write. All nodes see same data.', 'green') +
V.concept('fa-signal', 'Availability (A)', 'Every request gets a response (even if not the latest data).', 'cyan') +
V.concept('fa-unlink', 'Partition Tolerance (P)', 'System works even when network between nodes fails.', 'purple') +
V.infoBox('THE REAL CHOICE', 'Partitions WILL happen (P is mandatory). So when a partition occurs: choose Consistency (reject requests) or Availability (serve stale data).', 'key') +
V.section('fa-industry', 'Real Examples') +
V.table(['System', 'Type', 'Why'], [
    ['PostgreSQL', 'CP', 'Rejects writes if can\'t reach replica'],
    ['DynamoDB', 'AP', 'Always accepts, resolves conflicts later'],
    ['Cassandra', 'AP (tunable)', 'Can set quorum for CP behavior'],
    ['ZooKeeper', 'CP', 'Config/coordination must be consistent']
]) +
V.section('fa-balance-scale', 'When to Choose') +
V.vs(
    { title: 'CP — Consistency', text: 'Banking (wrong balance = disaster), Inventory (don\'t sell twice), Leader election.', icon: 'fa-lock', type: 'good' },
    { title: 'AP — Availability', text: 'Social feed (2 sec delay OK), Shopping cart (stale is fine), DNS (cached records).', icon: 'fa-signal', type: 'good' }
)
        },
        {
            day: 14,
            title: "Design: Rate Limiter",
            subtitle: "Access control breach",
            xp: 100,
            content: V.banner('fa-shield-alt', 'RATE LIMITER', 'Controlling request flow', 'orange') +
V.metrics([
    { value: '1.7M/s', label: 'CHECKS/SEC' },
    { value: '<1ms', label: 'DECISION TIME' },
    { value: '200MB', label: 'TOTAL MEMORY' }
]) +
V.section('fa-sitemap', 'Architecture') +
V.archFlow([
    { icon: 'fa-users', label: 'Clients', type: 'client' },
    { icon: 'fa-shield-alt', label: 'Rate Limiter', type: 'queue' },
    { icon: 'fa-bolt', label: 'Redis', type: 'cache' },
    { icon: 'fa-server', label: 'App Servers', type: 'server' }
]) +
V.section('fa-coins', 'Token Bucket Algorithm') +
V.steps([
    { title: 'Bucket has 10 tokens', text: 'Bucket size = burst capacity' },
    { title: 'Request arrives → take 1 token', text: 'bucket: 10 → 9 → 8...' },
    { title: 'Tokens refill at 1/sec', text: 'Steady-state rate' },
    { title: 'Bucket empty → REJECT 429', text: 'User exceeded limit' }
]) +
V.section('fa-server', 'Distributed Solution') +
V.code('Redis Atomic Counter', `Request arrives → INCR "user:123:minute:X"
Redis returns count → compare to limit
Count > 100 → REJECT
Atomic = no race condition`) +
V.vs(
    { title: 'FAIL OPEN', text: 'Redis down → allow all requests. Choose for general rate limits.', icon: 'fa-unlock', type: 'good' },
    { title: 'FAIL CLOSED', text: 'Redis down → reject all requests. Choose for DDoS protection.', icon: 'fa-lock', type: 'good' }
)
        }
    ]
},
{
    id: 3,
    title: "INTERMEDIATE OPS",
    subtitle: "Complex system patterns",
    color: "#bf00ff",
    days: [
        {
            day: 15, title: "Estimation Math", subtitle: "QPS/Storage calculations", xp: 50,
            content: V.banner('fa-calculator', 'ESTIMATION', 'Back-of-envelope calculations', 'cyan') +
V.section('fa-memory', 'Key Numbers to Memorize') +
V.metrics([ {value:'2¹⁰', label:'1 THOUSAND'}, {value:'2²⁰', label:'1 MILLION'}, {value:'2³⁰', label:'1 BILLION'}, {value:'2⁴⁰', label:'1 TRILLION'} ]) +
V.table(['Operation', 'Latency'], [ ['L1 cache', '1 ns'], ['RAM access', '100 ns'], ['SSD read', '100 μs'], ['Network (same DC)', '0.5 ms'], ['Network (cross-continent)', '150 ms'] ]) +
V.section('fa-divide', 'QPS Formula') +
V.code('Formula', `QPS = DAU × actions_per_user / 86,400
Peak QPS = QPS × 3
1 day ≈ 100,000 seconds (for quick math)`) +
V.section('fa-tasks', 'Practice: Twitter') +
V.metrics([ {value:'8,700', label:'READ QPS'}, {value:'870', label:'WRITE QPS'}, {value:'37.5 GB', label:'DAILY STORAGE'} ]) +
V.infoBox('TIP', 'Round aggressively — order of magnitude matters, not precision. State assumptions out loud in interviews.', 'tip')
        },
        {
            day: 16, title: "Blob Storage", subtitle: "Object storage patterns", xp: 50,
            content: V.banner('fa-photo-video', 'BLOB STORAGE', 'Storing large binary data', 'pink') +
V.infoBox('THE RULE', 'Store metadata in DB, store files in object storage (S3). Never put large blobs in your database.', 'key') +
V.archFlow([ {icon:'fa-mobile-alt', label:'Client', type:'client'}, {icon:'fa-server', label:'Server (metadata)', type:'server'}, {icon:'fa-cloud', label:'S3 (files)', type:'storage'} ]) +
V.section('fa-link', 'Pre-signed URLs') +
V.concept('fa-upload', 'Upload', 'Client → Server gets pre-signed URL → Client uploads directly to S3. No server bottleneck.', 'green') +
V.concept('fa-download', 'Download', 'Client → Server gets pre-signed URL → Client downloads from S3/CDN directly.', 'cyan') +
V.section('fa-puzzle-piece', 'Chunked Upload') +
`<p>Files > 100MB: upload in parts. Resume on failure, parallel upload, progress tracking.</p>` +
V.table(['Storage Class', 'Access', 'Cost'], [ ['Standard', 'Milliseconds', '$$$'], ['Infrequent Access', 'Milliseconds', '$$'], ['Glacier', 'Minutes-Hours', '$'], ['Deep Archive', '12-48 Hours', '¢'] ])
        },
        {
            day: 17, title: "Search Systems", subtitle: "Inverted index", xp: 50,
            content: V.banner('fa-search', 'SEARCH SYSTEMS', 'Full-text search with inverted indexes', 'cyan') +
V.section('fa-book-open', 'Inverted Index') +
V.code('How It Works', `Documents:
  Doc1: "The cat sat on the mat"
  Doc2: "The dog sat on the log"

Inverted Index:
  "cat" → [Doc1]     "dog" → [Doc2]
  "sat" → [Doc1, Doc2]   "mat" → [Doc1]

Search "cat sat" → intersect [Doc1] ∩ [Doc1,Doc2] = Doc1 ✓`) +
V.section('fa-sort-amount-down', 'TF-IDF Scoring') +
V.concept('fa-file', 'TF (Term Frequency)', 'How often word appears in THIS document. More = more relevant to this doc.', 'green') +
V.concept('fa-globe', 'IDF (Inverse Doc Frequency)', 'How rare across ALL docs. Rare words = more distinguishing power. "the" = useless.', 'cyan') +
V.section('fa-server', 'Elasticsearch') +
`<p>Distributed search engine. Index split into shards, replicated. Query hits all shards, coordinator merges top results.</p>` +
V.infoBox('RULE', 'Don\'t use your primary DB for search. Build search as a separate service (Elasticsearch) that syncs from your DB.', 'warning')
        },
        {
            day: 18, title: "Notifications", subtitle: "Push/Pull systems", xp: 50,
            content: V.banner('fa-bell', 'NOTIFICATIONS', 'Real-time communication protocols', 'orange') +
V.section('fa-exchange-alt', 'Communication Types') +
V.table(['Type', 'Direction', 'Real-time?', 'Use'], [ ['Short Poll', 'Client→Server (repeat)', 'No', 'Simple checks'], ['Long Poll', 'Server holds connection', 'Near', 'Fallback chat'], ['WebSocket', 'Bidirectional', 'Yes', 'Chat, gaming'], ['SSE', 'Server→Client', 'Yes', 'Feeds, notifications'] ]) +
V.section('fa-sitemap', 'Notification Architecture') +
V.archLayers([
    [{icon:'fa-calendar-check', label:'Events', type:'client'}, {icon:'fa-bell', label:'Notification Service', type:'server'}],
    [{icon:'fa-sort-amount-down', label:'Priority Queue', type:'queue'}],
    [{icon:'fa-mobile-alt', label:'Push', type:'cache'}, {icon:'fa-sms', label:'SMS', type:'storage'}, {icon:'fa-envelope', label:'Email', type:'database'}]
]) +
V.section('fa-check-double', 'Must Handle') +
V.tags([ {text:'User preferences', type:'info'}, {text:'Quiet hours', type:'info'}, {text:'Deduplication', type:'info'}, {text:'Rate limiting', type:'info'}, {text:'Retry + backoff', type:'info'}, {text:'Priority queues', type:'info'} ])
        },
        {
            day: 19, title: "Unique ID Generation", subtitle: "Distributed identifiers", xp: 50,
            content: V.banner('fa-fingerprint', 'UNIQUE IDs', 'Generating IDs without coordination', 'purple') +
V.infoBox('PROBLEM', 'Multiple DB shards each generate ID 1, 2, 3... → COLLISION! Need globally unique IDs.', 'warning') +
V.section('fa-th-large', 'Options') +
V.table(['Method', 'Bits', 'Sortable', 'Coordination'], [ ['UUID v4', '128', 'No', 'None needed'], ['Snowflake', '64', 'Yes ✓', 'Machine ID only'], ['ULID', '128', 'Yes ✓', 'None needed'] ]) +
V.section('fa-snowflake', 'Snowflake (Industry Standard)') +
V.code('64-bit Structure', `| 41 bits timestamp | 10 bits machine | 12 bits sequence |

41 bits → 69 years of IDs
10 bits → 1024 machines
12 bits → 4096 IDs per millisecond per machine`) +
V.tags([ {text:'Compact (64-bit)', type:'pro'}, {text:'Time-sortable', type:'pro'}, {text:'Decentralized', type:'pro'}, {text:'4M IDs/sec/machine', type:'pro'}, {text:'Needs clock sync', type:'con'} ]) +
V.infoBox('INTERVIEW ANSWER', 'Use Snowflake for most cases. Compact, sorted by time, fast, no central coordinator.', 'key')
        },
        {
            day: 20, title: "Design Framework", subtitle: "The 5-step method", xp: 50,
            content: V.banner('fa-map', 'THE FRAMEWORK', 'Your 5-step interview structure', 'green') +
V.steps([
    { title: 'REQUIREMENTS (5 min)', text: 'Functional + Non-functional. Ask: features? users? latency? consistency? read/write ratio?' },
    { title: 'ESTIMATION (3 min)', text: 'QPS = DAU × actions / 86,400. Storage = records × size × retention. Peak = 3x average.' },
    { title: 'HIGH-LEVEL DESIGN (10 min)', text: 'Draw: Client → LB → App → Cache → DB. Add Queue, CDN, Search as needed. Define APIs.' },
    { title: 'DEEP DIVE (15 min)', text: 'Pick hardest component. Discuss 2-3 approaches with tradeoffs. Pick one, justify why.' },
    { title: 'WRAP UP (5 min)', text: 'Bottlenecks, monitoring/alerting, what changes at 10x scale. Shows engineering maturity.' }
]) +
V.infoBox('GOLDEN RULE', 'Never skip Step 1. Wrong assumptions waste the entire interview. Always ask before you design.', 'key')
        },
        {
            day: 21, title: "Design: News Feed", subtitle: "Social system breach", xp: 100,
            content: V.banner('fa-stream', 'NEWS FEED', 'Social media timeline system', 'cyan') +
V.metrics([ {value:'300M', label:'DAU'}, {value:'35K/s', label:'READ QPS'}, {value:'1.7K/s', label:'WRITE QPS'} ]) +
V.section('fa-broadcast-tower', 'Fan-Out Strategies') +
V.concept('fa-paper-plane', 'Fan-out on Write (Push)', 'User posts → push to ALL followers\' caches. Fast reads, slow writes. BAD for celebrities (50M writes!).', 'green') +
V.concept('fa-download', 'Fan-out on Read (Pull)', 'Open feed → pull from everyone you follow. Slow reads, fast writes.', 'cyan') +
V.concept('fa-star', 'Hybrid (Best)', 'Regular users: push. Celebrities (>10K followers): pull at read time. Solves the celebrity problem!', 'purple') +
V.section('fa-database', 'Feed Cache (Redis)') +
V.code('Structure', `Key: "feed:user_123"
Value: sorted set of (tweet_id, timestamp)
Op: ZREVRANGE feed:user_123 0 19 → top 20 tweets`) +
V.infoBox('MONITOR', 'Feed generation latency (p50, p99), fan-out completion time, cache hit ratio (should be >95%).', 'tip')
        }
    ]
},
{
    id: 4,
    title: "ADVANCED SYSTEMS",
    subtitle: "Complex architecture",
    color: "#ff006e",
    days: [
        {
            day: 22, title: "Design: Chat System", subtitle: "Real-time messaging", xp: 100,
            content: V.banner('fa-comments', 'CHAT SYSTEM', 'Real-time messaging architecture', 'cyan') +
V.metrics([ {value:'50M', label:'DAU'}, {value:'23K/s', label:'MESSAGES'}, {value:'200GB', label:'DAILY STORAGE'} ]) +
V.section('fa-sitemap', 'Architecture') +
V.archLayers([
    [{icon:'fa-mobile-alt', label:'Client A', type:'client'}, {icon:'fa-exchange-alt', label:'WebSocket', type:'queue'}, {icon:'fa-server', label:'Chat Server 1', type:'server'}],
    [{icon:'fa-database', label:'Cassandra', type:'database'}, {icon:'fa-bolt', label:'Redis (routing)', type:'cache'}, {icon:'fa-bell', label:'Push Service', type:'storage'}]
]) +
V.section('fa-route', 'Message Flow') +
V.steps([
    { title: 'Alice sends message', text: 'Via WebSocket to her Chat Server' },
    { title: 'Store in DB', text: 'Cassandra: partition=conversation_id, sort=timestamp' },
    { title: 'Look up Bob\'s server', text: 'Redis: user_id → chat_server mapping' },
    { title: 'Route to Bob', text: 'If online: push via WebSocket. If offline: queue + push notification.' }
]) +
V.section('fa-circle', 'Presence (Online/Offline)') +
V.concept('fa-heartbeat', 'Heartbeat', 'Redis key with 30s TTL. Client sends heartbeat every 25s. No heartbeat → TTL expires → offline.', 'green')
        },
        {
            day: 23, title: "Notification Service", subtitle: "Multi-channel delivery", xp: 50,
            content: V.banner('fa-bell', 'NOTIFICATION SERVICE', 'Multi-channel delivery at scale', 'orange') +
V.archLayers([
    [{icon:'fa-calendar', label:'Events', type:'client'}, {icon:'fa-bell', label:'API', type:'server'}, {icon:'fa-filter', label:'Validate', type:'queue'}],
    [{icon:'fa-sort-amount-down', label:'Priority Queues', type:'queue'}],
    [{icon:'fa-mobile-alt', label:'Push', type:'cache'}, {icon:'fa-sms', label:'SMS', type:'storage'}, {icon:'fa-envelope', label:'Email', type:'database'}, {icon:'fa-desktop', label:'In-App', type:'server'}]
]) +
V.section('fa-cogs', 'Key Components') +
V.concept('fa-file-alt', 'Templates', '"Hi {{name}}, your order #{{order_id}} shipped!" — separate content from delivery.', 'green') +
V.concept('fa-ban', 'Dedup', 'Redis key "notif:{event_id}:{user_id}" with TTL. If exists → skip (already sent).', 'cyan') +
V.concept('fa-tachometer-alt', 'Rate Limit', 'Max 5 push/hr, 3 SMS/day per user. Prevent spam.', 'purple') +
V.concept('fa-sort-amount-up', 'Priority', 'OTP = bypass quiet hours. Marketing = wait for optimal time.', 'orange') +
V.concept('fa-redo', 'Retry', 'Exponential backoff: 1s, 4s, 16s, 64s → Dead Letter Queue.', 'pink')
        },
        {
            day: 24, title: "Distributed File Storage", subtitle: "GFS/HDFS architecture", xp: 50,
            content: V.banner('fa-hdd', 'DISTRIBUTED FILES', 'GFS/HDFS — storing massive files', 'purple') +
V.archLayers([
    [{icon:'fa-laptop', label:'Client', type:'client'}],
    [{icon:'fa-brain', label:'Master (metadata)', type:'server'}],
    [{icon:'fa-hdd', label:'Chunk 1', type:'database'}, {icon:'fa-hdd', label:'Chunk 2', type:'storage'}, {icon:'fa-hdd', label:'Chunk 3', type:'cache'}]
]) +
V.section('fa-puzzle-piece', 'Key Concepts') +
V.concept('fa-cut', 'Chunking', 'Split large files into 64MB chunks. Each chunk replicated 3x across different servers.', 'green') +
V.concept('fa-brain', 'Master Node', 'Stores metadata ONLY: file → chunks mapping, chunk → servers mapping.', 'cyan') +
V.concept('fa-hdd', 'Chunk Servers', 'Store actual data. Report health to master via heartbeat.', 'purple') +
V.section('fa-book-reader', 'Read Flow') +
V.steps([
    { title: 'Client asks Master', text: '"Where is file.txt chunk 2?"' },
    { title: 'Master responds', text: '"Chunk 2 is on CS2, CS4, CS6"' },
    { title: 'Client reads directly', text: 'Goes to nearest chunk server (bypasses master)' }
]) +
V.infoBox('FAULT TOLERANCE', 'Server dies → Master detects (no heartbeat) → re-replicates chunks to maintain 3 copies. Auto-healing.', 'tip')
        },
        {
            day: 25, title: "Microservices Patterns", subtitle: "Service architecture", xp: 50,
            content: V.banner('fa-cubes', 'MICROSERVICES', 'Patterns for distributed services', 'green') +
V.section('fa-door-open', 'API Gateway') +
V.archFlow([ {icon:'fa-mobile-alt', label:'Apps', type:'client'}, {icon:'fa-door-open', label:'API Gateway', type:'queue'}, {icon:'fa-server', label:'User Svc', type:'server'}, {icon:'fa-server', label:'Order Svc', type:'database'} ]) +
`<p>Single entry point: routing, auth, rate limiting, SSL termination.</p>` +
V.section('fa-toggle-off', 'Circuit Breaker') +
V.steps([
    { title: 'CLOSED (normal)', text: 'Requests flow through to downstream service' },
    { title: 'Failures exceed threshold', text: 'Circuit OPENS — fast-fail, no waiting for timeouts' },
    { title: 'After timeout → HALF-OPEN', text: 'Try one test request. Success=CLOSE, Fail=OPEN' }
]) +
V.infoBox('WHY', 'Without circuit breaker: downstream dies → your threads exhaust waiting → YOUR service crashes too. Cascading failure!', 'warning') +
V.section('fa-undo', 'Saga Pattern') +
V.code('Compensating Transactions', `Order OK → Payment OK → Inventory FAILS!
→ Refund payment (compensate)
→ Cancel order (compensate)
No distributed transactions — use undo actions instead.`)
        },
        {
            day: 26, title: "Design: Web Crawler", subtitle: "Internet scanner", xp: 100,
            content: V.banner('fa-spider', 'WEB CRAWLER', 'Crawling billions of pages', 'green') +
V.metrics([ {value:'1B', label:'PAGES/WEEK'}, {value:'1,650/s', label:'PAGES/SEC'}, {value:'500 TB', label:'STORAGE'} ]) +
V.section('fa-sitemap', 'Architecture') +
V.archLayers([
    [{icon:'fa-seedling', label:'Seed URLs', type:'client'}, {icon:'fa-list', label:'URL Frontier', type:'queue'}],
    [{icon:'fa-download', label:'Fetcher Workers', type:'server'}, {icon:'fa-code', label:'Parser', type:'cache'}],
    [{icon:'fa-ban', label:'Dedup', type:'storage'}, {icon:'fa-database', label:'Content Store', type:'database'}]
]) +
V.section('fa-hand-peace', 'Politeness') +
V.concept('fa-file-alt', 'robots.txt', 'Check what\'s allowed. Respect crawl-delay.', 'green') +
V.concept('fa-tachometer-alt', 'Rate Limit', 'Max 1 request/sec per domain. Never DDoS a website.', 'orange') +
V.section('fa-ban', 'Dedup Detection') +
V.concept('fa-filter', 'URL Dedup', 'Bloom filter: 1B URLs in ~1GB memory. Probabilistic but space-efficient.', 'cyan') +
V.concept('fa-fingerprint', 'Content Dedup', 'SimHash fingerprint catches same content at different URLs.', 'purple')
        },
        {
            day: 27, title: "Monitoring", subtitle: "Observability systems", xp: 50,
            content: V.banner('fa-chart-line', 'MONITORING', 'The three pillars of observability', 'cyan') +
V.section('fa-layer-group', 'Three Pillars') +
V.concept('fa-chart-bar', 'Metrics', 'Numbers over time: CPU 75%, latency p99=250ms, error rate 0.5%', 'green') +
V.concept('fa-scroll', 'Logs', 'Detailed event records: timestamps, error messages, context, trace IDs', 'cyan') +
V.concept('fa-route', 'Traces', 'Request journey across services: which service took how long?', 'purple') +
V.section('fa-star', 'Four Golden Signals (Google SRE)') +
V.table(['Signal', 'Measures', 'Alert When'], [ ['Latency', 'Response time', 'p99 > 500ms'], ['Traffic', 'Requests/sec', 'Outside expected ± 30%'], ['Errors', 'Failed ratio', '> 0.1%'], ['Saturation', 'Resource usage', 'CPU > 80%'] ]) +
V.infoBox('RULE', 'Alert on symptoms (latency, errors), NOT causes (CPU). Set hysteresis to avoid alert flapping.', 'key')
        },
        {
            day: 28, title: "Design: YouTube", subtitle: "Video platform breach", xp: 100,
            content: V.banner('fa-video', 'VIDEO PLATFORM', 'Upload, transcode, stream at scale', 'pink') +
V.metrics([ {value:'1B', label:'DAU'}, {value:'58K/s', label:'VIEWS'}, {value:'2.5 PB', label:'DAILY NEW'} ]) +
V.section('fa-upload', 'Upload Pipeline') +
V.archFlow([ {icon:'fa-user', label:'Creator', type:'client'}, {icon:'fa-upload', label:'Upload', type:'server'}, {icon:'fa-cloud', label:'S3 Raw', type:'storage'}, {icon:'fa-cogs', label:'Transcode', type:'queue'}, {icon:'fa-satellite-dish', label:'CDN', type:'cache'} ]) +
V.section('fa-film', 'Transcoding') +
`<p>Split video into 10-sec segments. Encode each into 240p, 480p, 720p, 1080p, 4K. Parallel processing!</p>` +
V.section('fa-wifi', 'Adaptive Bitrate') +
V.concept('fa-signal', 'ABR Streaming', 'Client measures bandwidth each segment. Bad connection → switch to 480p. Good → switch to 1080p. Seamless quality change.', 'green') +
V.section('fa-eye', 'View Counting') +
V.infoBox('PROBLEM', 'Can\'t UPDATE counter for each of 58K views/sec. Solution: batch counting. Local counter → flush to Kafka every 5s → aggregate → periodic DB update.', 'tip')
        }
    ]
},
{
    id: 5,
    title: "FINAL MISSIONS",
    subtitle: "Boss-level breaches",
    color: "#ffd000",
    days: [
        {
            day: 29, title: "Design: Google Maps", subtitle: "Navigation system", xp: 100,
            content: V.banner('fa-map-marked-alt', 'GOOGLE MAPS', 'Navigation at global scale', 'green') +
V.section('fa-th', 'Map Tiling') +
`<p>World split into 256×256px tiles per zoom level. Serve from CDN. Client only loads visible tiles.</p>` +
V.metrics([ {value:'1 tile', label:'ZOOM 0'}, {value:'16 tiles', label:'ZOOM 2'}, {value:'1T tiles', label:'ZOOM 20'} ]) +
V.section('fa-route', 'Route Calculation') +
V.concept('fa-project-diagram', 'Road Network = Graph', 'Nodes = intersections. Edges = roads. Weight = time to traverse.', 'cyan') +
V.concept('fa-layer-group', 'Hierarchical Routing', 'Local streets near start → highways for middle → local streets near end. 1000x fewer nodes than full Dijkstra!', 'green') +
V.section('fa-car', 'Real-Time Traffic') +
V.steps([
    { title: 'GPS data from millions of phones', text: 'Anonymous, aggregated speed data' },
    { title: 'Aggregate per road segment', text: 'Compare to expected speed' },
    { title: 'Update graph edge weights', text: 'Every 1-2 minutes' },
    { title: 'Recalculate active ETAs', text: 'Live rerouting if congestion detected' }
])
        },
        {
            day: 30, title: "Design: Distributed Cache", subtitle: "Redis cluster breach", xp: 100,
            content: V.banner('fa-bolt', 'DISTRIBUTED CACHE', 'Redis Cluster internals', 'yellow') +
V.code('How It Works', `16,384 hash slots distributed across nodes
Key → CRC16(key) % 16384 → slot → node
Client routes directly to correct node`) +
V.section('fa-exclamation-triangle', 'Failure Scenarios') +
V.concept('fa-bolt', 'Stampede', 'Hot key expires → 10K requests hit DB. Fix: lock, one request fetches.', 'orange') +
V.concept('fa-fire', 'Hot Key', '100K reads/sec on one key → node overwhelmed. Fix: local cache or key replication.', 'pink') +
V.concept('fa-snowflake', 'Avalanche', 'Many keys expire at once → DB flood. Fix: random TTL jitter.', 'cyan') +
V.concept('fa-ghost', 'Penetration', 'Non-existent keys bypass cache. Fix: cache null values or Bloom filter.', 'purple') +
V.section('fa-trash', 'Eviction') +
V.infoBox('DEFAULT', 'allkeys-lru: remove least recently used when memory full. Safe default for most workloads.', 'key') +
V.section('fa-save', 'Persistence') +
`<p><strong>RDB</strong> (snapshot) + <strong>AOF</strong> (log every write). Use both: fast recovery + minimal data loss.</p>`
        },
        {
            day: 31, title: "Design: Ticket Booking", subtitle: "Concurrency breach", xp: 100,
            content: V.banner('fa-ticket-alt', 'TICKET BOOKING', 'Preventing double-booking', 'purple') +
V.infoBox('THE PROBLEM', 'User A and User B both select Seat 5 at the same millisecond. Both proceed to payment. Both get the same seat! DOUBLE BOOKING.', 'warning') +
V.section('fa-lock', 'Solution: Redis Distributed Lock') +
V.code('Lock Flow', `SETNX "lock:event100:seat5" "userA" EX 600
→ Success? Seat held for 10 min
→ Fail? Someone else has it

Payment succeeds → mark BOOKED, delete lock
Payment timeout → lock auto-expires → seat free again`) +
V.section('fa-users', 'Flash Sale (10K users, 500 seats)') +
V.concept('fa-list-ol', 'Virtual Queue', 'First 10K enter queue. Process 100 at a time. "You are #3,456 in queue."', 'green') +
V.concept('fa-coins', 'Token Bucket', 'Allow only 500 concurrent booking sessions. Others wait.', 'cyan') +
V.infoBox('ALL-OR-NOTHING', 'Booking 3 seats? Either lock ALL 3 or release ALL. Never partial bookings.', 'key')
        },
        {
            day: 32, title: "Design: Autocomplete", subtitle: "Search prefix breach", xp: 100,
            content: V.banner('fa-keyboard', 'AUTOCOMPLETE', 'Type-ahead suggestions at scale', 'cyan') +
V.section('fa-tree', 'Core: Trie with Top-K') +
V.code('Pre-computed Results', `Each trie node stores top 5 results:

Node "ho" →
  ["hotel" (50K), "how to" (35K), "honda" (28K)]

Lookup = O(prefix length). Return pre-computed results instantly!`) +
V.section('fa-mobile-alt', 'Client Optimization') +
V.concept('fa-hourglass-half', 'Debounce', 'Wait 100ms after last keystroke before sending request. Reduces 70%+ server calls.', 'green') +
V.concept('fa-filter', 'Local Filter', 'Results for "ho" include "hotel". When user types "hot" → filter client-side. No server request!', 'cyan') +
V.concept('fa-ban', 'Cancel Previous', 'Fast typing? Cancel in-flight request for "h" when "ho" goes out.', 'purple') +
V.section('fa-sync', 'Freshness') +
V.vs(
    { title: 'OFFLINE (base)', text: 'Rebuild trie every 15 min from search logs. Batch process.', icon: 'fa-clock', type: 'good' },
    { title: 'REAL-TIME (trending)', text: 'Trending cache in Redis, updated every minute. Merge with base results.', icon: 'fa-bolt', type: 'good' }
)
        },
        {
            day: 33, title: "Weak Area Review", subtitle: "Reinforce protocols", xp: 50,
            content: V.banner('fa-redo', 'REVIEW DAY', 'Reinforce your weakest areas', 'orange') +
V.section('fa-tasks', 'Instructions') +
V.steps([
    { title: 'Pick 2 weak topics', text: 'Go back to whichever days felt unclear' },
    { title: 'Draw from memory', text: 'Architecture diagram, no peeking at notes' },
    { title: 'Write tradeoffs', text: 'What are the pros/cons of each choice?' },
    { title: 'Explain out loud', text: 'As if teaching a friend who knows nothing' }
]) +
V.section('fa-exclamation-circle', 'Common Struggles') +
V.concept('fa-circle-notch', 'Consistent Hashing (Day 10)', 'Draw the ring 5 times until it\'s automatic.', 'purple') +
V.concept('fa-project-diagram', 'CAP Theorem (Day 13)', 'Trace what happens during a network partition.', 'pink') +
V.concept('fa-broadcast-tower', 'Fan-out (Day 21)', 'Explain the celebrity problem and hybrid solution.', 'cyan') +
V.concept('fa-undo', 'Saga Pattern (Day 25)', 'Draw the compensation flow for a failed step.', 'orange')
        },
        {
            day: 34, title: "Mock Interview #1", subtitle: "Full simulation", xp: 100,
            content: V.banner('fa-user-clock', 'MOCK INTERVIEW', 'Full 45-minute simulation', 'green') +
V.section('fa-list', 'Pick One Problem') +
V.tags([ {text:'Design Uber/Lyft', type:'info'}, {text:'Design Dropbox', type:'info'}, {text:'Design Amazon', type:'info'} ]) +
V.section('fa-clock', 'Timer: 45 Minutes') +
V.steps([
    { title: '0:00 - 0:05 Requirements', text: 'Ask clarifying questions. Don\'t assume.' },
    { title: '0:05 - 0:08 Estimation', text: 'QPS, storage, bandwidth.' },
    { title: '0:08 - 0:25 High-Level Design', text: 'Draw boxes and arrows. Define APIs.' },
    { title: '0:25 - 0:40 Deep Dive', text: 'Pick hardest part. Discuss tradeoffs.' },
    { title: '0:40 - 0:45 Wrap Up', text: 'Bottlenecks, monitoring, 10x scale.' }
]) +
V.section('fa-check-square', 'Self-Review') +
V.tags([ {text:'Clarified requirements?', type:'info'}, {text:'Estimated scale?', type:'info'}, {text:'Discussed tradeoffs?', type:'info'}, {text:'Handled edge cases?', type:'info'}, {text:'Mentioned monitoring?', type:'info'} ])
        },
        {
            day: 35, title: "Mock Interview #2", subtitle: "Final boss breach", xp: 150,
            content: V.banner('fa-crown', 'FINAL BOSS', 'You are ready. Prove it.', 'yellow') +
V.section('fa-crosshairs', 'Pick Another Problem') +
V.tags([ {text:'Payment System', type:'info'}, {text:'Monitoring System', type:'info'}, {text:'TikTok Recs', type:'info'}, {text:'Task Scheduler', type:'info'} ]) +
V.section('fa-brain', 'Pattern Recognition') +
V.table(['Pattern', 'Use When'], [
    ['Cache + Replicas + CDN', 'Read-heavy systems'],
    ['Queue + Async workers', 'Write-heavy systems'],
    ['WebSocket + Pub/Sub', 'Real-time systems'],
    ['Inverted Index + Ranking', 'Search/Discovery'],
    ['Chunk + Distribute', 'Large data processing'],
    ['Consensus + Locks', 'Strong consistency required']
]) +
V.section('fa-map', '30-Second Template') +
V.code('For ANY Problem', `1. Clarify requirements (ask 3-5 questions)
2. Estimate scale (QPS, storage)
3. HLD: Client → LB → App → Cache → DB
4. Deep dive: hardest part + tradeoffs
5. Wrap up: bottlenecks, monitoring, 10x`) +
V.infoBox('YOU\'RE READY', 'The interview tests COMMUNICATION and TRADEOFFS, not perfect answers. Show your thinking process. Go breach those interviews.', 'key')
        }
    ]
}
];

return WEEKS;
}

// Build content after visuals.js is loaded
const WEEKS = buildContent();
