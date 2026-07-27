// Data for interactive exercises: animations, builders, code challenges, flashcards, mock interviews

// ============ ANIMATED DIAGRAM CONFIGS ============
const ANIM_CONFIGS = {
    cacheFlow: {
        nodes: [
            { icon: 'fa-mobile-alt', label: 'Client', type: 'client' },
            { icon: 'fa-bolt', label: 'Cache', type: 'cache' },
            { icon: 'fa-database', label: 'Database', type: 'database' }
        ],
        flows: [
            { from: 0, to: 1, label: '1. Client requests data from cache', hit: false },
            { from: 1, to: 0, label: '2. CACHE HIT! Data returned in 2ms', hit: true },
            { from: 0, to: 1, label: '3. Different key — CACHE MISS', miss: false },
            { from: 1, to: 2, label: '4. Cache fetches from database (50ms)', miss: true },
            { from: 2, to: 1, label: '5. Data stored in cache for next time', hit: true },
            { from: 1, to: 0, label: '6. Data returned to client', hit: true }
        ]
    },
    requestFlow: {
        nodes: [
            { icon: 'fa-users', label: 'Users', type: 'client' },
            { icon: 'fa-balance-scale', label: 'LB', type: 'queue' },
            { icon: 'fa-server', label: 'Server 1', type: 'server' },
            { icon: 'fa-server', label: 'Server 2', type: 'server' },
            { icon: 'fa-bolt', label: 'Redis', type: 'cache' },
            { icon: 'fa-database', label: 'DB', type: 'database' }
        ],
        flows: [
            { from: 0, to: 1, label: '1. Request arrives at load balancer' },
            { from: 1, to: 2, label: '2. LB routes to Server 1 (least connections)' },
            { from: 2, to: 4, label: '3. Server checks Redis cache' },
            { from: 4, to: 2, label: '4. Cache HIT — data returned', hit: true },
            { from: 0, to: 1, label: '5. New request arrives' },
            { from: 1, to: 3, label: '6. LB routes to Server 2' },
            { from: 3, to: 4, label: '7. Server checks Redis — MISS', miss: true },
            { from: 4, to: 5, label: '8. Fetch from database' },
            { from: 5, to: 4, label: '9. Store in Redis for next time', hit: true },
            { from: 4, to: 3, label: '10. Return data to server' }
        ]
    }
};

// ============ ARCHITECTURE BUILDER CONFIGS ============
const BUILDER_CONFIGS = {
    urlShortener: {
        components: [
            { id: 'client', icon: 'fa-mobile-alt', label: 'Client', type: 'client' },
            { id: 'cdn', icon: 'fa-globe', label: 'CDN', type: 'cache' },
            { id: 'lb', icon: 'fa-balance-scale', label: 'Load Balancer', type: 'queue' },
            { id: 'api', icon: 'fa-server', label: 'API Servers', type: 'server' },
            { id: 'cache', icon: 'fa-bolt', label: 'Redis Cache', type: 'cache' },
            { id: 'db', icon: 'fa-database', label: 'Database', type: 'database' },
            { id: 'kgs', icon: 'fa-key', label: 'Key Gen Service', type: 'server' }
        ],
        answer: {
            order: ['client', 'lb', 'api', 'cache', 'db'],
            description: 'Build the URL shortener request path: client → LB → API → Cache → DB'
        }
    },
    chatSystem: {
        components: [
            { id: 'client', icon: 'fa-mobile-alt', label: 'Client', type: 'client' },
            { id: 'ws', icon: 'fa-exchange-alt', label: 'WebSocket', type: 'queue' },
            { id: 'chat', icon: 'fa-server', label: 'Chat Server', type: 'server' },
            { id: 'redis', icon: 'fa-bolt', label: 'Redis (routing)', type: 'cache' },
            { id: 'kafka', icon: 'fa-stream', label: 'Message Queue', type: 'queue' },
            { id: 'db', icon: 'fa-database', label: 'Cassandra', type: 'database' },
            { id: 'push', icon: 'fa-bell', label: 'Push Service', type: 'storage' }
        ],
        answer: {
            order: ['client', 'ws', 'chat', 'redis', 'db'],
            description: 'Build the chat message flow: client connects via WebSocket to chat server, which uses Redis for user routing and Cassandra for storage'
        }
    }
};

// ============ CODE CHALLENGE CONFIGS ============
const CODE_CHALLENGES = {
    lruCache: {
        title: 'LRU Cache',
        description: 'Implement get(key) and put(key, value) with O(1) time complexity and capacity limit.',
        starterCode: `class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    // TODO: add data structures
  }

  get(key) {
    // TODO: return value or -1 if not found
    // Mark as recently used
  }

  put(key, value) {
    // TODO: add key-value pair
    // Evict least recently used if at capacity
  }
}`,
        testCases: [
            { name: 'Basic put and get', test: 'const c = new LRUCache(2); c.put(1, 1); c.put(2, 2); return c.get(1);', expected: 1 },
            { name: 'Returns -1 for missing', test: 'const c = new LRUCache(2); c.put(1, 1); return c.get(5);', expected: -1 },
            { name: 'Evicts LRU on capacity', test: 'const c = new LRUCache(2); c.put(1, 1); c.put(2, 2); c.put(3, 3); return c.get(1);', expected: -1 },
            { name: 'Access updates recency', test: 'const c = new LRUCache(2); c.put(1, 1); c.put(2, 2); c.get(1); c.put(3, 3); return c.get(2);', expected: -1 },
            { name: 'Update existing key', test: 'const c = new LRUCache(2); c.put(1, 1); c.put(1, 10); return c.get(1);', expected: 10 }
        ],
        solution: `class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map(); // Map maintains insertion order in JS
  }

  get(key) {
    if (!this.map.has(key)) return -1;
    const val = this.map.get(key);
    this.map.delete(key);     // remove
    this.map.set(key, val);   // re-insert at end (most recent)
    return val;
  }

  put(key, value) {
    if (this.map.has(key)) this.map.delete(key);
    this.map.set(key, value);
    if (this.map.size > this.capacity) {
      const firstKey = this.map.keys().next().value;
      this.map.delete(firstKey);  // remove LRU (first inserted)
    }
  }
}`
    },
    tokenBucket: {
        title: 'Token Bucket Rate Limiter',
        description: 'Implement tryConsume() that returns true if request is allowed, false if rate exceeded.',
        starterCode: `class TokenBucket {
  constructor(capacity, refillRate) {
    this.capacity = capacity;     // max tokens
    this.refillRate = refillRate; // tokens per second
    // TODO: initialize
  }

  tryConsume() {
    // TODO: refill tokens based on elapsed time
    // TODO: try to consume 1 token
    // Return true if allowed, false if rejected
  }
}`,
        testCases: [
            { name: 'First request allowed', test: 'const tb = new TokenBucket(5, 1); return tb.tryConsume();', expected: true },
            { name: 'Capacity limits burst', test: 'const tb = new TokenBucket(3, 1); tb.tryConsume(); tb.tryConsume(); tb.tryConsume(); return tb.tryConsume();', expected: false },
            { name: 'Single capacity works', test: 'const tb = new TokenBucket(1, 1); tb.tryConsume(); return tb.tryConsume();', expected: false },
            { name: 'Initial full bucket', test: 'const tb = new TokenBucket(10, 1); let count=0; while(tb.tryConsume()) count++; return count;', expected: 10 }
        ],
        solution: `class TokenBucket {
  constructor(capacity, refillRate) {
    this.capacity = capacity;
    this.refillRate = refillRate;
    this.tokens = capacity;
    this.lastRefill = Date.now();
  }

  tryConsume() {
    this.refill();
    if (this.tokens >= 1) {
      this.tokens -= 1;
      return true;
    }
    return false;
  }

  refill() {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(this.capacity,
      this.tokens + elapsed * this.refillRate);
    this.lastRefill = now;
  }
}`
    }
};

// ============ FLASHCARD DECKS ============
const FLASHCARD_DECKS = {
    hldConcepts: {
        cards: [
            { front: 'What is the difference between horizontal and vertical scaling?', back: 'Vertical = more power to ONE machine (RAM, CPU). Horizontal = more machines. Horizontal has no ceiling and is fault-tolerant.' },
            { front: 'What are the 3 cache problems? (Stampede, Penetration, Avalanche)', back: 'Stampede: hot key expires, many requests hit DB. Fix: lock.\nPenetration: non-existent keys bypass cache. Fix: cache nulls/Bloom filter.\nAvalanche: many keys expire at once. Fix: random TTL jitter.' },
            { front: 'CAP Theorem: what\'s the REAL choice?', back: 'Partitions will happen (P is mandatory). Choice: Consistency (reject requests) or Availability (serve possibly stale data). CP for banking, AP for social feeds.' },
            { front: 'When to use Kafka vs SQS?', back: 'Kafka: high throughput, need replay, event streaming, ordering per partition.\nSQS: simple task queue, AWS-native, no replay needed.' },
            { front: 'Fan-out on Write vs Read — when to use each?', back: 'Write (push): pre-compute feeds. Fast reads, slow writes. Bad for celebrities (50M writes).\nRead (pull): compute at read time. Fast writes, slow reads.\nHybrid: push for regular users, pull for celebrities.' },
            { front: 'What is consistent hashing and why use it?', back: 'Keys and servers placed on a ring. Key → walk clockwise to nearest server. Adding/removing server moves only K/N keys (not 80%). Used by DynamoDB, Redis Cluster, CDNs.' },
            { front: 'Snowflake ID: what are the 3 components?', back: '64 bits: 41-bit timestamp (69 years) + 10-bit machine ID (1024 machines) + 12-bit sequence (4096/ms/machine). Time-sortable, decentralized, compact.' },
            { front: 'What is a quorum and when is it strongly consistent?', back: 'N nodes, write to W, read from R. If W + R > N → at least one node has the latest write. Example: N=3, W=2, R=2 → strong consistency.' },
            { front: 'WebSocket vs SSE vs Long Polling?', back: 'WebSocket: bidirectional, persistent. Best for chat, gaming.\nSSE: server→client only, simple. Best for feeds.\nLong Poll: server holds request until data ready. Fallback.' },
            { front: 'What is the circuit breaker pattern?', back: 'CLOSED→requests flow. Failures exceed threshold→OPEN→instant fail (no waiting). After timeout→HALF-OPEN→test one request. Success=CLOSE, Fail=OPEN. Prevents cascading failures.' },
            { front: 'What is the Saga pattern?', back: 'Replaces distributed transactions in microservices. If step N fails, run compensating transactions for steps 1 to N-1 (refund, cancel). Choreography (events) or Orchestration (central coordinator).' },
            { front: 'The 5-step system design framework?', back: '1. Requirements (5 min) — ask!\n2. Estimation (3 min) — QPS, storage\n3. High-level design (10 min) — boxes + arrows\n4. Deep dive (15 min) — hardest part + tradeoffs\n5. Wrap up (5 min) — bottlenecks, monitoring, 10x' }
        ]
    },
    lldPatterns: {
        cards: [
            { front: 'SOLID: S — Single Responsibility', back: 'A class has ONE reason to change. Don\'t mix business logic, persistence, formatting, and logging in one class.' },
            { front: 'SOLID: O — Open/Closed', back: 'Open for extension, closed for modification. New behavior via new classes (interface implementations), not editing existing code.' },
            { front: 'SOLID: L — Liskov Substitution', back: 'Subtypes must substitute for base types without breaking behavior. If Square extends Rectangle but setWidth also sets height → LSP violated.' },
            { front: 'SOLID: I — Interface Segregation', back: 'Many small interfaces > one fat interface. Robot shouldn\'t implement eat() from a Worker interface. Split into Workable, Eatable.' },
            { front: 'SOLID: D — Dependency Inversion', back: 'Depend on abstractions, not concretions. OrderService depends on Database interface (injected), NOT on MySQLDatabase directly.' },
            { front: 'Strategy vs State: what\'s the difference?', back: 'Same structure, different intent. Strategy: CLIENT chooses the algorithm (pricing method). State: OBJECT transitions itself (order lifecycle).' },
            { front: 'When to use Decorator pattern?', back: 'When you need stackable optional behaviors without subclass explosion. N addons = N classes, 2^N combinations. Coffee + milk + whip = wrap with decorators.' },
            { front: 'Adapter vs Facade?', back: 'Adapter: translate ONE interface to another (compatibility — Stripe SDK → your PaymentGateway).\nFacade: simplify MANY interfaces into one (convenience — video conversion subsystem).' },
            { front: 'Observer pattern in one sentence?', back: 'Subject maintains subscriber list; on state change, notifies all observers. Decouples publisher from subscribers. In-process version of Kafka pub-sub.' },
            { front: 'Command pattern: what makes it powerful?', back: 'Encapsulates a request as an object with execute() and undo(). Enables: undo/redo (history stack), queueing, logging. Editor Ctrl+Z = Command.' },
            { front: 'LRU Cache: what two data structures and why?', back: 'HashMap (O(1) lookup by key) + Doubly-Linked List (O(1) move-to-front/remove-tail). Together: O(1) get, put, and evict.' },
            { front: 'Parking Lot LLD: the 3 patterns used?', back: 'Singleton (one lot), Strategy (fee calculation + spot assignment), AtomicReference/CAS (thread-safe per-spot claiming without global lock).' }
        ]
    }
};

// ============ MOCK INTERVIEW CONFIGS ============
const MOCK_CONFIGS = {
    twitterFeed: {
        problem: 'Design Twitter\'s news feed system',
        steps: [
            { title: 'Requirements', timeMin: 5, prompt: 'What features does the system need? What are the non-functional requirements (scale, latency, consistency)?', idealAnswer: 'Functional: post tweets, follow users, view feed. Non-functional: 300M DAU, feed loads <500ms, eventual consistency OK (few sec delay fine), read-heavy 100:1 ratio.' },
            { title: 'Scale Estimation', timeMin: 3, prompt: 'Estimate QPS, storage, and bandwidth.', idealAnswer: 'Write: 300M×0.5/86400 ≈ 1,700 tweets/sec. Read: 300M×10/86400 ≈ 35,000 feed/sec. Peak: 105K/sec. Storage: 150M tweets/day × 500 bytes = 75GB/day.' },
            { title: 'High-Level Design', timeMin: 12, prompt: 'Draw the main components and data flow. How does a tweet get from author to followers\' feeds?', idealAnswer: 'Client → LB → API servers → Post Service (writes to DB + sends to Fan-out Service) → Fan-out writes to each follower\'s feed cache (Redis sorted set). Read path: Client → Feed Service → Redis cache → return.' },
            { title: 'Deep Dive: Fan-out Strategy', timeMin: 15, prompt: 'The celebrity problem: user with 50M followers posts. How do you handle this?', idealAnswer: 'Hybrid approach. Regular users (<10K followers): fan-out on write — push tweet to followers\' caches. Celebrities (>10K): fan-out on read — when follower opens feed, fetch celebrity tweets on demand and merge with pre-built cache. Redis ZREVRANGE for top N by timestamp.' },
            { title: 'Wrap Up', timeMin: 5, prompt: 'What are the bottlenecks? How would you monitor? What changes at 10x scale?', idealAnswer: 'Bottlenecks: fan-out for celebrities (solved by hybrid), feed cache memory (keep last 200 per user). Monitor: feed latency p99, cache hit ratio (>95%), fan-out completion time. At 10x: multi-region, more aggressive ML-based ranking, tiered storage for old tweets.' }
        ]
    }
};
