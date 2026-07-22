const QUIZZES = [
    {
        id: "week1",
        title: "Core Fundamentals",
        subtitle: "Scaling, LB, Caching, Databases, CDN",
        questionCount: 10,
        questions: [
            {
                q: "Your single server can't handle the load. You have a stateful application storing sessions in server memory. What's the FIRST step to enable horizontal scaling?",
                options: [
                    "Add more RAM to the server",
                    "Move session state to external store (Redis/DB)",
                    "Add a load balancer",
                    "Shard the database"
                ],
                correct: 1,
                explanation: "You must make the app stateless FIRST by moving session state to an external store. Only then can a load balancer distribute requests to any server."
            },
            {
                q: "Your API has variable-length request processing times (some take 50ms, some take 5 seconds). Which load balancing algorithm is BEST?",
                options: [
                    "Round Robin",
                    "IP Hash",
                    "Least Connections",
                    "Random"
                ],
                correct: 2,
                explanation: "Least Connections sends new requests to the server with fewest active connections. This prevents slow-request servers from getting overloaded while fast servers sit idle."
            },
            {
                q: "You're using cache-aside pattern. A popular cached item expires, and 10,000 requests hit your database simultaneously. What is this problem called?",
                options: [
                    "Cache Penetration",
                    "Cache Avalanche",
                    "Cache Stampede (Thundering Herd)",
                    "Cache Poisoning"
                ],
                correct: 2,
                explanation: "Cache Stampede: a hot key expires → many requests simultaneously hit DB. Fix with locking (only one fetches) or early expiration (refresh before TTL)."
            },
            {
                q: "Your application needs complex JOINs across multiple tables, strict ACID transactions for money transfers, and a well-defined schema. Which database type?",
                options: [
                    "MongoDB (Document)",
                    "Redis (Key-Value)",
                    "PostgreSQL (SQL/Relational)",
                    "Cassandra (Column-Family)"
                ],
                correct: 2,
                explanation: "SQL databases provide ACID transactions, support complex JOINs, and enforce schemas — exactly what financial applications need."
            },
            {
                q: "You're designing a DynamoDB table for an e-commerce app. Primary query: 'Get all orders for user X from last 30 days.' What's the best key design?",
                options: [
                    "Partition Key: order_id",
                    "Partition Key: user_id, Sort Key: order_date",
                    "Partition Key: order_date, Sort Key: user_id",
                    "Partition Key: user_id + order_id (composite)"
                ],
                correct: 1,
                explanation: "Partition Key = user_id groups all user's orders together. Sort Key = order_date enables efficient range queries (last 30 days) within that partition."
            },
            {
                q: "A user in Tokyo loads your website. The origin server is in Virginia. What reduces their latency from 200ms to 20ms for static assets?",
                options: [
                    "Database indexing",
                    "CDN with edge server in Tokyo",
                    "Load balancer",
                    "Read replica in Tokyo"
                ],
                correct: 1,
                explanation: "A CDN caches static content at edge servers worldwide. User in Tokyo hits the Tokyo edge (20ms) instead of crossing the Pacific to Virginia (200ms)."
            },
            {
                q: "You deployed a new version of your JS file but users still see the old cached version on the CDN. What's the BEST long-term fix?",
                options: [
                    "Set CDN TTL to 0 (no caching)",
                    "Purge the CDN cache manually",
                    "Use versioned URLs: /app.v2.js",
                    "Add no-cache headers"
                ],
                correct: 2,
                explanation: "Versioned URLs (/app.v2.js, /app.abc123.js) are a permanent fix. Each deploy creates a new URL — old cache is simply never requested again. No manual purging needed."
            },
            {
                q: "Your database has 10 million user records. You frequently search by email. Queries are slow. What's the fix?",
                options: [
                    "Add more RAM to DB server",
                    "Create a B-tree index on the email column",
                    "Switch to NoSQL",
                    "Add a read replica"
                ],
                correct: 1,
                explanation: "A B-tree index on email turns O(n) full-table scans into O(log n) lookups. This is the standard fix for slow WHERE clause queries."
            },
            {
                q: "In a leader-follower replication setup, what happens if you read from a follower immediately after writing to the leader?",
                options: [
                    "You always get the latest data",
                    "You might get stale data (replication lag)",
                    "The read will fail",
                    "The follower redirects to the leader"
                ],
                correct: 1,
                explanation: "With async replication, followers can be behind the leader. Reading immediately after writing may return stale data. Fix: 'read-your-own-writes' pattern — route user's reads to leader for recently-written data."
            },
            {
                q: "You're designing a URL shortener. Which approach for generating short URLs avoids collisions without checking the database?",
                options: [
                    "MD5 hash of long URL, take first 7 chars",
                    "Random 7-character string",
                    "Pre-generated key service (KGS)",
                    "Auto-increment counter"
                ],
                correct: 2,
                explanation: "KGS pre-generates millions of unique keys. On request, take the next unused key — guaranteed unique, no DB check, no collision. Fastest approach at scale."
            }
        ]
    },
    {
        id: "week2",
        title: "Building Blocks",
        subtitle: "Queues, APIs, Hashing, Replication, CAP",
        questionCount: 10,
        questions: [
            {
                q: "An order event needs to be processed by BOTH the inventory service AND the email service. Which messaging pattern?",
                options: [
                    "Point-to-Point Queue (SQS)",
                    "Pub/Sub Topic (SNS/Kafka)",
                    "Direct HTTP call to both",
                    "Shared database table"
                ],
                correct: 1,
                explanation: "Pub/Sub delivers each message to ALL subscribers. Queue (point-to-point) delivers to exactly ONE consumer. Since both services need the event, use pub/sub."
            },
            {
                q: "Your payment API is NOT idempotent. A network timeout occurs and the client retries. What happens?",
                options: [
                    "Nothing — the retry is ignored",
                    "The customer gets charged twice",
                    "The server returns the cached result",
                    "The retry gets a 409 Conflict"
                ],
                correct: 1,
                explanation: "Without idempotency, POST /payment processes the charge again on retry → double charge. Fix: use an Idempotency-Key header — server stores result and returns it on retry."
            },
            {
                q: "You have 4 cache servers. You add a 5th. With simple mod hashing (hash % N), what percentage of keys need to move?",
                options: [
                    "About 20% (1/5)",
                    "About 75-80% (almost all!)",
                    "Exactly 25%",
                    "0% — keys stay where they are"
                ],
                correct: 1,
                explanation: "With mod hashing, changing N from 4 to 5 remaps ~80% of keys (only keys where hash%4 == hash%5 stay put). This is why consistent hashing exists — it moves only K/N keys."
            },
            {
                q: "In consistent hashing, you have 3 physical servers but uneven key distribution. What's the fix?",
                options: [
                    "Add more physical servers",
                    "Use range-based partitioning instead",
                    "Add virtual nodes (100-200 per server)",
                    "Rebalance keys manually"
                ],
                correct: 2,
                explanation: "Virtual nodes: each physical server gets multiple positions on the hash ring. More positions = more even distribution without adding hardware."
            },
            {
                q: "Your database is sharded by user_id. A query asks: 'Find all users named Alice.' What happens?",
                options: [
                    "Query goes to the shard containing 'Alice'",
                    "Query must hit ALL shards (scatter-gather)",
                    "Query fails — can't search by non-shard key",
                    "The index automatically routes it"
                ],
                correct: 1,
                explanation: "Querying by non-shard-key requires scatter-gather: hit ALL shards, merge results. This is slow. Fix: use a search index (Elasticsearch) for non-key queries."
            },
            {
                q: "In a quorum system with N=5 nodes, what's the minimum W and R values to guarantee strong consistency?",
                options: [
                    "W=1, R=1",
                    "W=3, R=3 (W+R > N)",
                    "W=5, R=5",
                    "W=2, R=2"
                ],
                correct: 1,
                explanation: "Strong consistency requires W + R > N. With N=5: W=3, R=3 (6 > 5) guarantees at least one node has the latest write in every read quorum."
            },
            {
                q: "A network partition splits your distributed database. Your banking app MUST show correct balances. Which CAP choice?",
                options: [
                    "AP — serve potentially stale balances to stay available",
                    "CP — reject requests rather than show wrong balance",
                    "CA — ignore the partition",
                    "Neither — CAP doesn't apply to banking"
                ],
                correct: 1,
                explanation: "Banking requires consistency over availability. During a partition, it's better to reject requests (CP) than show a wrong balance that causes overdrafts."
            },
            {
                q: "You want to rate-limit your API to 100 requests/minute per user. Which algorithm allows short bursts while maintaining long-term rate?",
                options: [
                    "Fixed Window Counter",
                    "Token Bucket",
                    "Leaky Bucket",
                    "Sliding Window Log"
                ],
                correct: 1,
                explanation: "Token Bucket allows bursts up to bucket size while maintaining average rate via refill. Fixed window has boundary burst issues, leaky bucket enforces strict constant rate."
            },
            {
                q: "Your rate limiter uses Redis. Two requests arrive simultaneously, both read counter=99 (limit=100), both increment. Result?",
                options: [
                    "One gets rejected automatically",
                    "Counter becomes 101 — limit exceeded due to race condition",
                    "Redis handles it atomically — impossible",
                    "Both get rate limited"
                ],
                correct: 1,
                explanation: "GET + check + INCR as separate operations creates a race condition. Fix: use Redis INCR atomically (single command), or a Lua script for GET+check+INCR as one atomic operation."
            },
            {
                q: "Kafka retains messages after consumption. SQS deletes them. When would you choose Kafka over SQS?",
                options: [
                    "Simple task queue with one consumer",
                    "Need to replay events for debugging or new consumers",
                    "AWS-native, minimal operational overhead",
                    "Low-throughput notifications"
                ],
                correct: 1,
                explanation: "Kafka's key advantage is message replay — consumers can reset their offset to re-process events. Critical for debugging, adding new consumers that need historical data, or event sourcing."
            }
        ]
    },
    {
        id: "week3",
        title: "Intermediate Systems",
        subtitle: "Estimation, Search, Notifications, IDs",
        questionCount: 10,
        questions: [
            {
                q: "Twitter has 150M DAU, each views feed 5x/day. What's the approximate READ QPS?",
                options: [
                    "~900/sec",
                    "~8,700/sec",
                    "~87,000/sec",
                    "~870,000/sec"
                ],
                correct: 1,
                explanation: "150M × 5 / 86,400 ≈ 8,680 reads/sec. Remember: divide by ~100,000 for quick mental math (150M × 5 = 750M / 100K ≈ 7,500 — close enough for estimation)."
            },
            {
                q: "Your app stores user profile images. Best architecture?",
                options: [
                    "Store image bytes as BLOB in PostgreSQL",
                    "Store metadata in DB, image in S3, serve via pre-signed URL",
                    "Store image on application server's local disk",
                    "Encode image as base64 in a JSON field"
                ],
                correct: 1,
                explanation: "Always separate metadata (DB) from binary data (S3). Pre-signed URLs let clients download directly from S3/CDN without bottlenecking your server."
            },
            {
                q: "You're building a product search. User searches 'red running shoes.' Which data structure powers this efficiently?",
                options: [
                    "B-tree index",
                    "Hash table",
                    "Inverted index",
                    "Red-black tree"
                ],
                correct: 2,
                explanation: "Inverted index maps each word → list of documents containing it. 'red' → [doc1, doc5], 'running' → [doc1, doc3], 'shoes' → [doc1, doc2]. Intersection = doc1."
            },
            {
                q: "Your chat app needs true bidirectional real-time communication. Which protocol?",
                options: [
                    "Short polling",
                    "Long polling",
                    "WebSocket",
                    "REST API"
                ],
                correct: 2,
                explanation: "WebSocket provides persistent bidirectional connection. Server can push messages anytime, client can send anytime. Essential for real-time chat, gaming, live updates."
            },
            {
                q: "You need globally unique, time-sortable, 64-bit IDs generated on multiple servers without coordination. Which approach?",
                options: [
                    "UUID v4",
                    "Auto-increment with two servers (odds/evens)",
                    "Snowflake ID",
                    "Random string"
                ],
                correct: 2,
                explanation: "Snowflake: 64-bit = compact, timestamp bits = time-sortable, machine ID = no coordination between servers, sequence = high throughput. Industry standard (Twitter, Discord)."
            },
            {
                q: "In TF-IDF scoring, a word that appears in ALL documents gets what IDF score?",
                options: [
                    "Very high (most important)",
                    "Near zero (not useful for distinguishing docs)",
                    "Negative",
                    "Undefined"
                ],
                correct: 1,
                explanation: "IDF = log(total_docs / docs_containing_word). If word is in ALL docs: log(N/N) = log(1) = 0. Common words like 'the' have near-zero IDF — they don't help distinguish documents."
            },
            {
                q: "Your notification system sends OTP codes and marketing emails. An OTP arrives 5 minutes late. What's wrong?",
                options: [
                    "Email server is slow",
                    "OTPs and marketing share the same queue — marketing volume blocks OTP",
                    "The user's email is slow",
                    "DNS is slow"
                ],
                correct: 1,
                explanation: "Without priority queues, critical notifications (OTP) get stuck behind bulk marketing. Fix: separate priority queues — critical gets its own fast path."
            },
            {
                q: "You're building Twitter's feed. A celebrity with 50M followers posts a tweet. Fan-out on write means...",
                options: [
                    "When the celebrity opens their feed, pull from everyone they follow",
                    "Push the tweet into 50M followers' feed caches (extremely slow/expensive!)",
                    "Store the tweet and let followers pull when they open the app",
                    "Send push notifications to all followers"
                ],
                correct: 1,
                explanation: "Fan-out on write pushes to ALL followers' caches. For 50M followers, that's 50M writes per tweet — unacceptable. This is the 'celebrity problem.' Fix: use fan-out on read for celebrities."
            },
            {
                q: "Your system uses cursor-based pagination. What advantage does it have over offset-based?",
                options: [
                    "Simpler to implement",
                    "Performance stays constant regardless of page number",
                    "Works without a database",
                    "Returns total count of records"
                ],
                correct: 1,
                explanation: "Offset-based: DB must skip N rows to get to page 5000 (slow!). Cursor-based: DB uses an indexed pointer to jump directly to the right position — O(1) regardless of page number."
            },
            {
                q: "Peak QPS is typically estimated as __ times the average QPS.",
                options: [
                    "1.5x",
                    "2-3x",
                    "10x",
                    "100x"
                ],
                correct: 1,
                explanation: "Standard estimation: Peak = 2-3x average. This accounts for daily traffic spikes (lunch hour, evening peak). Some events (flash sales) can be 10x+ but 2-3x is the interview standard."
            }
        ]
    },
    {
        id: "week4",
        title: "Advanced Systems",
        subtitle: "Chat, Files, Microservices, Video",
        questionCount: 10,
        questions: [
            {
                q: "In a chat system, how does Chat Server 1 know to route Alice's message to Bob on Chat Server 5?",
                options: [
                    "Broadcast to all chat servers",
                    "Redis mapping: user_id → chat_server",
                    "Bob's client polls all servers",
                    "DNS resolves Bob's server"
                ],
                correct: 1,
                explanation: "Redis stores {user_id: chat_server_id} for all connected users. To reach Bob: look up his server in Redis, route the message directly there."
            },
            {
                q: "A downstream payment service goes down. Without protection, what happens to the order service that calls it?",
                options: [
                    "Order service immediately returns 503",
                    "Order service threads exhaust waiting for timeouts → cascading failure",
                    "Load balancer reroutes automatically",
                    "Nothing — services are independent"
                ],
                correct: 1,
                explanation: "Without a circuit breaker, each order request waits 30s for payment timeout. Threads pile up → order service runs out of threads → entire service crashes. Cascading failure."
            },
            {
                q: "In the Saga pattern, Payment succeeds but Inventory fails. What must happen?",
                options: [
                    "Rollback the entire database transaction",
                    "Execute compensating transaction: refund payment",
                    "Retry inventory until it succeeds",
                    "Mark order as partially complete"
                ],
                correct: 1,
                explanation: "Sagas use compensating transactions instead of rollbacks. If a later step fails, execute undo actions for all completed steps (refund payment, cancel order)."
            },
            {
                q: "YouTube needs to store 500K new videos per day across multiple resolutions. Why not use PostgreSQL?",
                options: [
                    "PostgreSQL can't store video",
                    "Object storage (S3) is designed for large binary blobs — cheap, scalable, CDN-integrated",
                    "PostgreSQL doesn't support streaming",
                    "Videos need NoSQL"
                ],
                correct: 1,
                explanation: "Object storage is purpose-built for large binary data: unlimited scale, $0.023/GB/month (vs DB storage 10-50x more), native CDN integration, chunked upload/download."
            },
            {
                q: "A video platform uses adaptive bitrate streaming. The user's bandwidth drops from 10Mbps to 2Mbps mid-video. What happens?",
                options: [
                    "Video stops and buffers",
                    "Next segment switches to lower resolution (480p) automatically",
                    "Server re-encodes the remaining video",
                    "Video quality stays the same but loads slower"
                ],
                correct: 1,
                explanation: "Adaptive Bitrate: client measures bandwidth, requests appropriate quality for each 10-second segment. Bandwidth drops → next segment requested at lower quality. Seamless, no buffering."
            },
            {
                q: "In a distributed file system (GFS/HDFS), why are files split into 64MB chunks?",
                options: [
                    "It's a file system limitation",
                    "Enables parallel processing, easy replication, and failure recovery per-chunk",
                    "Reduces network overhead",
                    "Matches disk sector size"
                ],
                correct: 1,
                explanation: "Chunking enables: parallel reads/writes (multiple workers on different chunks), fine-grained replication (replicate individual chunks), and failure recovery (only re-replicate lost chunks, not entire file)."
            },
            {
                q: "Your web crawler is hitting amazon.com 100 times per second. What will happen?",
                options: [
                    "You'll crawl amazon.com faster",
                    "Amazon will rate-limit or block your IP; you're violating robots.txt crawl-delay",
                    "Your crawler will slow down",
                    "Nothing — websites don't monitor request rates"
                ],
                correct: 1,
                explanation: "Politeness is critical. Respect robots.txt crawl-delay, limit to 1 request/sec/domain. Aggressive crawling gets you blocked and harms the target site."
            },
            {
                q: "You want to detect duplicate web pages hosted at different URLs. Which technique?",
                options: [
                    "Compare URLs",
                    "Content fingerprinting (SimHash/MinHash)",
                    "Check file size",
                    "Compare HTTP headers"
                ],
                correct: 1,
                explanation: "Different URLs can host identical/near-identical content (mirrors, canonical URLs). SimHash/MinHash generates a fingerprint of content — similar content = similar fingerprint, regardless of URL."
            },
            {
                q: "Google SRE's Four Golden Signals are: Latency, Traffic, Errors, and...",
                options: [
                    "Throughput",
                    "Saturation",
                    "Uptime",
                    "Cost"
                ],
                correct: 1,
                explanation: "Saturation = how full your resources are (CPU, memory, disk, network). High saturation means you're approaching capacity limits and performance will degrade."
            },
            {
                q: "Your alert fires every time CPU spikes above 80% for 1 second, then resolves. This happens 50 times/day. The problem?",
                options: [
                    "CPU is too high",
                    "Alert is flapping — needs hysteresis (alert at 90%, resolve at 70%)",
                    "Need more servers",
                    "Monitoring is broken"
                ],
                correct: 1,
                explanation: "Flapping alerts cause alert fatigue. Fix with hysteresis: alert at 90%, only resolve at 70%. Also use longer evaluation windows (5 min sustained, not 1 second spike)."
            }
        ]
    },
    {
        id: "week5",
        title: "Final Missions",
        subtitle: "Maps, Cache, Booking, Autocomplete",
        questionCount: 10,
        questions: [
            {
                q: "Google Maps shows a world map. At zoom level 2, how many tiles exist?",
                options: [
                    "4 tiles",
                    "16 tiles (4×4)",
                    "64 tiles",
                    "256 tiles"
                ],
                correct: 1,
                explanation: "Zoom 0: 1 tile (whole world). Zoom 1: 4 tiles (2×2). Zoom 2: 16 tiles (4×4). Each zoom doubles both dimensions: 2^(2*zoom) total tiles."
            },
            {
                q: "Dijkstra's algorithm is too slow for continent-scale routing. What's the real-world solution?",
                options: [
                    "Use BFS instead",
                    "Hierarchical routing: local streets → highways → local streets",
                    "Pre-compute all possible routes",
                    "Use straight-line distance only"
                ],
                correct: 1,
                explanation: "Hierarchical routing classifies roads into levels. For long routes, only search highways for the middle portion, local streets only near start/end. 1000x fewer nodes explored."
            },
            {
                q: "In Redis Cluster, a key is assigned to a slot via CRC16(key) % 16384. Why 16,384 slots instead of hashing directly to nodes?",
                options: [
                    "16,384 is a magic number",
                    "Fixed slots make resharding easy — just migrate slot ranges between nodes",
                    "More slots means faster lookups",
                    "It's Redis's internal limit"
                ],
                correct: 1,
                explanation: "Fixed slot count decouples key distribution from node count. Adding a node = migrate some slots to it. Only migrated slots' keys move — minimal disruption, no full rehash."
            },
            {
                q: "10,000 users try to book 500 concert seats simultaneously. Without protection, what happens?",
                options: [
                    "First 500 get seats, rest get errors",
                    "Race conditions cause double-booking: same seat sold to multiple users",
                    "System handles it fine",
                    "Database automatically queues requests"
                ],
                correct: 1,
                explanation: "Without distributed locks or optimistic locking, concurrent reads show 'seat available' to multiple users who all proceed to payment → double booking."
            },
            {
                q: "A user selects 3 seats but payment fails after 8 minutes. With a Redis lock (TTL=10 min), what happens?",
                options: [
                    "Seats are permanently locked",
                    "Lock auto-expires in 2 more minutes, seats become available again",
                    "System crashes",
                    "User must manually release seats"
                ],
                correct: 1,
                explanation: "Redis SETNX with EX 600 (10 min TTL) auto-expires the lock. No payment within 10 min → lock vanishes → seats available for others. No manual cleanup needed."
            },
            {
                q: "Autocomplete for 'ho' returns ['hotel', 'how to', 'honda']. User types 'hot'. Optimal client behavior?",
                options: [
                    "Send new server request for 'hot'",
                    "Filter the cached 'ho' results client-side (hotel, hot → match!)",
                    "Wait for user to stop typing",
                    "Clear results and start over"
                ],
                correct: 1,
                explanation: "Client-side optimization: results for 'ho' already include anything matching 'hot'. Filter locally — no server request needed. Only query server for longer or different prefixes."
            },
            {
                q: "Your trie stores pre-computed top-5 results at every node. Why not compute results at query time by traversing children?",
                options: [
                    "Trie traversal is incorrect",
                    "Pre-computed = O(prefix_length) lookup vs O(all_descendants) traversal — orders of magnitude faster",
                    "It saves memory",
                    "Traversal doesn't return sorted results"
                ],
                correct: 1,
                explanation: "With pre-computed top-K: look up node → return stored results. O(prefix length). Without: traverse all descendants (millions for popular prefix like 'a') → way too slow for <100ms requirement."
            },
            {
                q: "You're in a system design interview. The interviewer says 'Design X.' What's your FIRST action?",
                options: [
                    "Start drawing the architecture",
                    "Estimate QPS and storage",
                    "Ask clarifying questions about requirements",
                    "Choose the database"
                ],
                correct: 2,
                explanation: "ALWAYS start with requirements. Wrong assumptions waste the entire interview. Ask: What features? How many users? Read/write ratio? Latency requirements? Consistency needs?"
            },
            {
                q: "Circuit breaker is in OPEN state. What happens to incoming requests?",
                options: [
                    "Requests are queued",
                    "Requests immediately fail (fast-fail) without calling the downstream service",
                    "Requests are retried continuously",
                    "Requests are routed to a backup service"
                ],
                correct: 1,
                explanation: "OPEN state = fail immediately. No waiting for timeouts, no thread exhaustion. After a timeout period, it goes to HALF-OPEN and tries one test request to check if the service recovered."
            },
            {
                q: "In your final system design interview, what should you mention in the last 5 minutes even if not asked?",
                options: [
                    "Your favorite programming language",
                    "Bottlenecks, monitoring/alerting, and what changes at 10x scale",
                    "How much the system will cost",
                    "A comparison with competitors"
                ],
                correct: 1,
                explanation: "Wrapping up with bottlenecks, monitoring, and scale shows engineering maturity. It demonstrates you think about production systems, not just design diagrams."
            }
        ]
    }
];
