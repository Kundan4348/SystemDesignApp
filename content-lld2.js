// LLD Week 7: Classic LLD Problems

const WEEK_LLD2 = {
    id: 7,
    title: "LLD MISSIONS",
    subtitle: "Classic problems — full solutions",
    color: "#ff006e",
    days: [
        {
            day: 43,
            title: "LLD: Elevator System",
            subtitle: "State machines + scheduling",
            xp: 100,
            content: V.banner('fa-sort', 'ELEVATOR SYSTEM', 'State pattern + scheduling algorithms', 'purple') +
V.section('fa-clipboard-list', 'Requirements') +
V.tags([
    { text: 'N elevators, M floors', type: 'info' },
    { text: 'Internal + external requests', type: 'info' },
    { text: 'Optimal dispatch', type: 'info' },
    { text: 'Direction display', type: 'info' }
]) +
V.section('fa-project-diagram', 'Class Diagram') +
V.code('Structure', `ElevatorSystem (Singleton)
 ◆── List<Elevator>
 ─── DispatchStrategy (interface)     ← Strategy!
       ←─ NearestElevatorStrategy
       ←─ SameDirectionStrategy

Elevator
 - id, currentFloor, Direction, ElevatorState
 - TreeSet<Integer> upRequests      (sorted!)
 - TreeSet<Integer> downRequests

enum Direction { UP, DOWN, IDLE }
enum ElevatorState { MOVING, STOPPED, MAINTENANCE }

Request
 - floor, Direction (external) / targetFloor (internal)`) +
V.section('fa-code', 'Core Logic — The SCAN Algorithm') +
V.code('Elevator Movement (Java)', `class Elevator {
    private int currentFloor = 0;
    private Direction direction = Direction.IDLE;
    private final TreeSet<Integer> upStops = new TreeSet<>();
    private final TreeSet<Integer> downStops =
        new TreeSet<>(Comparator.reverseOrder());

    public void addStop(int floor) {
        if (floor > currentFloor) upStops.add(floor);
        else if (floor < currentFloor) downStops.add(floor);
    }

    public void step() {  // called every tick
        if (direction == Direction.UP) {
            if (upStops.isEmpty()) { switchOrIdle(); return; }
            currentFloor++;
            if (upStops.contains(currentFloor)) {
                openDoors();
                upStops.remove(currentFloor);
            }
        }
        // ... symmetric for DOWN
    }
}
// SCAN (elevator algorithm): serve all stops in one direction,
// then reverse. Same algorithm as disk head scheduling!`) +
V.code('Dispatch Strategy', `class NearestElevatorStrategy implements DispatchStrategy {
    public Elevator select(List<Elevator> els, Request r) {
        return els.stream()
            .filter(e -> e.getState() != ElevatorState.MAINTENANCE)
            .min(Comparator.comparingInt(e -> cost(e, r)))
            .orElseThrow();
    }
    private int cost(Elevator e, Request r) {
        if (e.isIdle()) return Math.abs(e.getFloor() - r.floor());
        if (e.movingToward(r)) return Math.abs(e.getFloor() - r.floor());
        return Integer.MAX_VALUE / 2;  // wrong direction = expensive
    }
}`) +
V.why('TreeSet for stops is the key insight: it keeps floors SORTED, so "next stop in my direction" is O(log n) via ceiling()/floor(). Interviewers specifically watch for your data structure choice here.') +
V.walkthrough('DESIGN CHALLENGE', [
    {
        question: 'Elevator at floor 5 going UP with stops [7, 9]. New external request: floor 3 going DOWN. What should happen?',
        options: ['Elevator immediately reverses to floor 3', 'Request queued in downStops — served after finishing UP sweep (SCAN algorithm)', 'Request rejected', 'A new elevator is built'],
        correct: 1,
        explanation: 'SCAN: never abandon current direction mid-sweep (passengers inside expect their stops!). Floor 3 goes into downRequests, served when the elevator finishes going up and reverses. Alternatively, the dispatcher might assign floor 3 to a DIFFERENT elevator that\'s idle or heading down.'
    },
    {
        question: 'All elevators show as MAINTENANCE state but requests keep arriving. Where should this be handled?',
        options: ['Crash the system', 'DispatchStrategy filters out MAINTENANCE elevators; if none remain, queue the request and/or alert building ops', 'Ignore requests silently', 'Auto-repair elevators'],
        correct: 1,
        explanation: 'The strategy filters unavailable elevators. Empty result → don\'t throw to the user; enqueue the request for when an elevator returns to service, and emit an alert. Graceful degradation matters in LLD too.'
    }
]) +
V.interviewTip('Mention the disk-scheduling connection: "This is the SCAN/LOOK algorithm from OS disk scheduling." Cross-domain awareness = senior signal.')
        },
        {
            day: 44,
            title: "LLD: Splitwise",
            subtitle: "Expense sharing + debt simplification",
            xp: 100,
            content: V.banner('fa-money-bill-wave', 'SPLITWISE', 'Expense splitting with debt graph', 'green') +
V.section('fa-clipboard-list', 'Requirements') +
V.tags([
    { text: 'Add expenses', type: 'info' },
    { text: 'Equal / Exact / Percent splits', type: 'info' },
    { text: 'Show balances', type: 'info' },
    { text: 'Simplify debts', type: 'info' },
    { text: 'Groups', type: 'info' }
]) +
V.section('fa-project-diagram', 'Class Diagram') +
V.code('Structure', `ExpenseManager
 ◆── Map<String, User>
 ◆── List<Expense>
 ◆── BalanceSheet  (Map<UserPair, Double>)

Expense
 - id, amount, paidBy: User, List<Split>

Split (abstract)                    ← polymorphism!
 ←─ EqualSplit    (user)
 ←─ ExactSplit    (user, amount)
 ←─ PercentSplit  (user, percent)

SplitStrategy / validation per type
User: id, name, email`) +
V.section('fa-code', 'Core Code') +
V.code('Split Validation (Java)', `class ExpenseManager {
    public void addExpense(double amount, User paidBy,
                           List<Split> splits, SplitType type) {
        validate(amount, splits, type);
        for (Split s : splits) {
            double share = s.computeShare(amount, splits.size());
            if (!s.getUser().equals(paidBy))
                balanceSheet.add(s.getUser(), paidBy, share);
                // s.user OWES paidBy 'share'
        }
    }

    private void validate(double amt, List<Split> splits, SplitType t) {
        if (t == SplitType.EXACT) {
            double sum = splits.stream()
                .mapToDouble(s -> ((ExactSplit)s).getAmount()).sum();
            if (Math.abs(sum - amt) > 0.01)
                throw new InvalidSplitException("Exact amounts ≠ total");
        }
        if (t == SplitType.PERCENT) {
            double sum = splits.stream()
                .mapToDouble(s -> ((PercentSplit)s).getPercent()).sum();
            if (Math.abs(sum - 100.0) > 0.01)
                throw new InvalidSplitException("Percents ≠ 100");
        }
    }
}`) +
V.section('fa-magic', 'Debt Simplification — The Star Algorithm') +
V.code('Simplify Debts', `Problem: A owes B ₹100, B owes C ₹100
Naive: 2 transactions. Optimal: A pays C ₹100 directly. 1 transaction.

Algorithm (greedy, using net balances):
1. Compute NET balance per user:
   A: -100 (owes), B: 0 (pass-through), C: +100 (owed)
2. Max-heap of creditors, max-heap of debtors
3. Repeatedly match biggest debtor ↔ biggest creditor:
   settle min(|debt|, |credit|), reinsert remainder
4. Repeat until heaps empty

Result: minimum transaction count (≤ n-1 transactions)`) +
V.code('Java Sketch', `void simplify(Map<User, Double> net) {
    PriorityQueue<Entry> creditors = maxHeapByAmount();
    PriorityQueue<Entry> debtors   = maxHeapByAmount();
    net.forEach((u, bal) -> {
        if (bal > 0) creditors.add(new Entry(u, bal));
        else if (bal < 0) debtors.add(new Entry(u, -bal));
    });
    while (!creditors.isEmpty() && !debtors.isEmpty()) {
        Entry c = creditors.poll(), d = debtors.poll();
        double settled = Math.min(c.amount, d.amount);
        System.out.println(d.user + " pays " + c.user + ": " + settled);
        if (c.amount > settled) creditors.add(c.minus(settled));
        if (d.amount > settled) debtors.add(d.minus(settled));
    }
}`) +
V.walkthrough('DESIGN CHALLENGE', [
    {
        question: 'A pays ₹300 for lunch split equally among A, B, C. What balance entries are created?',
        options: ['A owes B ₹100, A owes C ₹100', 'B owes A ₹100, C owes A ₹100 (A\'s own share creates no entry)', 'Everyone owes ₹100 to the group', 'B owes A ₹150, C owes A ₹150'],
        correct: 1,
        explanation: 'Each share = 300/3 = ₹100. A paid, so B and C each owe A ₹100. A\'s own ₹100 share is self-owed — no entry. Total tracked debt: ₹200.'
    },
    {
        question: 'Percent split adds up to 99.9% due to floating point (33.3 + 33.3 + 33.3). Your validation rejects it. Users are annoyed. Best fix?',
        options: ['Remove validation', 'Use epsilon tolerance (±0.01) AND assign the rounding remainder to one participant (typically the payer)', 'Force users to enter exact decimals', 'Use doubles with more precision'],
        correct: 1,
        explanation: 'Money + floating point = classic trap. Use epsilon comparison for validation, store money as integer paise/cents (never double!), and push the 1-paisa rounding remainder to a designated participant so totals reconcile exactly.'
    }
]) +
V.interviewTip('Two senior signals in Splitwise: (1) "I\'d store money as long integer cents, not double" and (2) knowing the debt simplification greedy algorithm. Both take 10 seconds to say and instantly differentiate you.')
        },
        {
            day: 45,
            title: "LLD: BookMyShow",
            subtitle: "Booking + concurrency (LLD view)",
            xp: 100,
            content: V.banner('fa-film', 'BOOKMYSHOW', 'Movie booking — the LLD perspective', 'pink') +
V.section('fa-clipboard-list', 'Requirements') +
V.tags([
    { text: 'Cities → Cinemas → Screens → Shows', type: 'info' },
    { text: 'Seat selection + locking', type: 'info' },
    { text: 'Payment integration', type: 'info' },
    { text: 'No double booking!', type: 'pro' }
]) +
V.section('fa-project-diagram', 'Class Diagram') +
V.code('Structure', `City ◇── Cinema ◆── Screen ◆── Seat
Show: screen, movie, startTime, Map<Seat, SeatStatus>
Movie: id, title, duration

enum SeatStatus { AVAILABLE, LOCKED, BOOKED }
enum SeatType   { REGULAR, PREMIUM, RECLINER }

Booking: id, show, List<Seat>, user, BookingStatus, Payment
enum BookingStatus { PENDING, CONFIRMED, EXPIRED, CANCELLED }

SeatLockManager                     ← the heart!
 - Map<Show, Map<Seat, SeatLock>>
 - SeatLock: seat, user, lockTime, timeout

PaymentService / NotificationService (Observer!)`) +
V.section('fa-lock', 'The SeatLockManager — Core of the Problem') +
V.code('Thread-Safe Locking (Java)', `class SeatLockManager {
    private final Map<Show, Map<Seat, SeatLock>> locks =
        new ConcurrentHashMap<>();
    private static final Duration TIMEOUT = Duration.ofMinutes(10);

    public synchronized void lockSeats(Show show, List<Seat> seats,
                                       User user) {
        Map<Seat, SeatLock> showLocks =
            locks.computeIfAbsent(show, s -> new ConcurrentHashMap<>());

        // Phase 1: verify ALL seats lockable (all-or-nothing!)
        for (Seat seat : seats) {
            SeatLock existing = showLocks.get(seat);
            if (existing != null && !existing.isExpired())
                throw new SeatUnavailableException(seat);
        }
        // Phase 2: lock all
        for (Seat seat : seats)
            showLocks.put(seat, new SeatLock(seat, user,
                                 Instant.now(), TIMEOUT));
    }

    public boolean validateLockedBy(Show s, Seat seat, User u) {
        SeatLock lock = locks.get(s).get(seat);
        return lock != null && !lock.isExpired()
               && lock.getUser().equals(u);
    }
}`) +
V.code('Booking Flow', `class BookingService {
    public Booking createBooking(User user, Show show,
                                 List<Seat> seats) {
        lockManager.lockSeats(show, seats, user);      // throws if any taken
        return new Booking(UUID.randomUUID().toString(),
                           show, seats, user, BookingStatus.PENDING);
    }

    public void confirmBooking(Booking b, PaymentResult pr) {
        if (!pr.isSuccess()) { b.expire(); return; }   // locks auto-expire
        for (Seat seat : b.getSeats()) {
            if (!lockManager.validateLockedBy(b.getShow(), seat,
                                              b.getUser()))
                throw new LockExpiredException();
            b.getShow().markBooked(seat);
        }
        b.confirm();
        notifier.notifyAll(new BookingConfirmedEvent(b)); // Observer
    }
}`) +
V.why('This is the LLD twin of your HLD Day 31 (distributed booking). In-process: synchronized + lock map with TTL. Distributed: Redis SETNX with TTL. SAME two-phase pattern (validate-all, then lock-all), different scale. Say this in interviews — connecting LLD and HLD is gold.') +
V.walkthrough('DESIGN CHALLENGE', [
    {
        question: 'User locks 3 seats, pays, but confirmBooking runs at minute 10:01 — locks expired at 10:00. Meanwhile another user locked seat 2. What must happen?',
        options: ['Force the booking anyway — they paid!', 'Detect expired/stolen lock, fail confirmation, refund payment, notify user', 'Extend the lock retroactively', 'Book seats 1 and 3 only'],
        correct: 1,
        explanation: 'validateLockedBy fails → cannot confirm. Initiate refund (payment compensation — mini Saga pattern!), notify the user to rebook. Never force-book: seat 2 legitimately belongs to the other user now. This is why validate-before-confirm exists.'
    },
    {
        question: 'Why does lockSeats use two phases (check all, then lock all) instead of locking one seat at a time as it checks?',
        options: ['It\'s faster', 'Atomicity: locking incrementally could leave partial locks if seat 3 fails after seats 1-2 locked — then you must undo. Check-all-first avoids partial state.', 'Java requires it', 'It uses less memory'],
        correct: 1,
        explanation: 'All-or-nothing semantics. One-at-a-time locking + failure mid-way = rollback logic (error-prone) or leaked locks. Verify everything under the synchronized block, then commit. (Deadlock avoidance bonus: always lock seats in sorted order.)'
    }
]) +
V.interviewTip('The interviewer\'s hidden rubric for BookMyShow: (1) SeatLock with TTL, (2) all-or-nothing multi-seat locking, (3) validate-before-confirm, (4) payment failure compensation. Hit all four and you\'ve aced it.')
        },
        {
            day: 46,
            title: "LLD: Chess Game",
            subtitle: "Polymorphism showcase",
            xp: 100,
            content: V.banner('fa-chess-knight', 'CHESS', 'The polymorphism masterclass', 'yellow') +
V.section('fa-project-diagram', 'Class Diagram') +
V.code('Structure', `Game
 ◆── Board (8×8 Cell grid)
 ◆── Player white, black
 ─── GameStatus, List<Move> history

Piece (abstract)
 - Color, isKilled
 - abstract boolean canMove(Board b, Cell from, Cell to)
 ←─ King, Queen, Rook, Bishop, Knight, Pawn   ← each its own rules!

Cell: row, col, Piece (nullable)
Move: player, from, to, pieceMoved, pieceKilled
Player: name, Color`) +
V.section('fa-code', 'Polymorphic Movement — The Whole Point') +
V.code('Piece Implementations (Java)', `abstract class Piece {
    protected final Color color;
    abstract boolean canMove(Board b, Cell from, Cell to);
}

class Knight extends Piece {
    boolean canMove(Board b, Cell from, Cell to) {
        if (friendlyPieceAt(b, to)) return false;
        int dr = Math.abs(from.row - to.row);
        int dc = Math.abs(from.col - to.col);
        return dr * dc == 2;          // elegant L-shape check!
    }
}

class Rook extends Piece {
    boolean canMove(Board b, Cell from, Cell to) {
        if (from.row != to.row && from.col != to.col) return false;
        return b.isPathClear(from, to)      // no jumping
            && !friendlyPieceAt(b, to);
    }
}

class Queen extends Piece {
    boolean canMove(Board b, Cell from, Cell to) {
        return new Rook(color).canMove(b, from, to)
            || new Bishop(color).canMove(b, from, to);
        // Queen = Rook ∪ Bishop. Composition of behaviors!
    }
}`) +
V.code('Game Loop', `class Game {
    public void makeMove(Player p, Cell from, Cell to) {
        if (p != currentTurn) throw new NotYourTurnException();
        Piece piece = from.getPiece();
        if (piece == null || piece.getColor() != p.getColor())
            throw new InvalidMoveException();
        if (!piece.canMove(board, from, to))   // polymorphism!
            throw new InvalidMoveException();
        if (movePutsOwnKingInCheck(p, from, to))
            throw new InvalidMoveException();

        Move move = executeMove(from, to);
        history.add(move);                      // enables undo (Command!)
        if (isCheckmate(opponent(p))) status = GameStatus.CHECKMATE;
        currentTurn = opponent(p);
    }
}`) +
V.why('Game.makeMove calls piece.canMove() with ZERO knowledge of which piece type it is. Adding a fairy-chess piece = one new subclass. This is Open/Closed + polymorphism in its purest form — which is exactly why chess is asked.') +
V.walkthrough('DESIGN CHALLENGE', [
    {
        question: 'Where should "a move cannot leave your own king in check" live?',
        options: ['Inside each Piece.canMove() — every piece checks it', 'In Game/Board level — simulate the move, test king safety, applies uniformly to ALL pieces', 'In the King class', 'In the Player class'],
        correct: 1,
        explanation: 'King-safety is a GAME rule, not a piece-movement rule. Piece.canMove answers "is this shape of move legal for me?" Game answers "is this move legal in context?" Putting it in every piece duplicates logic 6 times (SRP violation).'
    },
    {
        question: 'You need undo functionality. Which pattern and what must Move store?',
        options: ['Memento of the whole board every move (heavy)', 'Command pattern: Move stores from, to, movedPiece, capturedPiece (if any) — undo() reverses it', 'Observer', 'Just replay from the start'],
        correct: 1,
        explanation: 'Command: each Move knows how to reverse itself — put movedPiece back on "from", restore capturedPiece to "to". O(1) undo. (Memento works but copies 64 cells per move; replay-from-start is O(n). Command is the clean answer — same as Day 40\'s editor undo!)'
    }
]) +
V.interviewTip('If short on time, implement Knight (cleanest logic: dr*dc==2) and Rook (path-clear check) fully, then say "Bishop is diagonal + path-clear, Queen is Rook OR Bishop." Shows the pattern without grinding through all six.')
        },
        {
            day: 47,
            title: "LLD: LRU Cache & Rate Limiter",
            subtitle: "Data-structure design",
            xp: 100,
            content: V.banner('fa-memory', 'LRU CACHE + RATE LIMITER', 'The data-structure LLD duo', 'cyan') +
V.section('fa-bolt', 'LRU Cache — O(1) Everything') +
V.code('The Insight', `Need: get(key) O(1), put(key,val) O(1), evict LRU O(1)

HashMap alone:  O(1) lookup, but no order
LinkedList alone: order, but O(n) lookup

ANSWER: HashMap<K, Node> + Doubly-Linked List
 - Map points directly at list nodes
 - List head = most recent, tail = least recent
 - Access → unlink node, move to head: O(1)
 - Evict → remove tail: O(1)`) +
V.code('Implementation (Java)', `class LRUCache<K, V> {
    private class Node {
        K key; V value;
        Node prev, next;
    }
    private final int capacity;
    private final Map<K, Node> map = new HashMap<>();
    private final Node head = new Node(), tail = new Node();
    // head <-> ... <-> tail (sentinels — no null checks!)

    public V get(K key) {
        Node n = map.get(key);
        if (n == null) return null;
        moveToHead(n);                    // mark as recently used
        return n.value;
    }

    public void put(K key, V value) {
        Node n = map.get(key);
        if (n != null) { n.value = value; moveToHead(n); return; }
        if (map.size() == capacity) {
            Node lru = tail.prev;         // least recently used
            unlink(lru);
            map.remove(lru.key);
        }
        Node fresh = new Node(key, value);
        map.put(key, fresh);
        addAfterHead(fresh);
    }
}`) +
V.why('Sentinel head/tail nodes eliminate every null check in unlink/insert — a detail interviewers notice. For thread-safety, mention: synchronized methods (simple), or segment locks, or just "use Guava/Caffeine in production." Java\'s LinkedHashMap(capacity, 0.75f, true) does LRU in 3 lines — mention it AFTER building it manually.') +
V.section('fa-tachometer-alt', 'Rate Limiter — Token Bucket (LLD)') +
V.code('Token Bucket (Java)', `class TokenBucket {
    private final long capacity;
    private final double refillPerMs;
    private double tokens;
    private long lastRefillTime;

    public synchronized boolean tryConsume() {
        refill();
        if (tokens >= 1) { tokens -= 1; return true; }
        return false;
    }

    private void refill() {
        long now = System.currentTimeMillis();
        tokens = Math.min(capacity,
            tokens + (now - lastRefillTime) * refillPerMs);
        lastRefillTime = now;
    }
}
// Lazy refill! No background thread — tokens computed on demand.

class RateLimiter {
    private final Map<String, TokenBucket> buckets =
        new ConcurrentHashMap<>();
    public boolean allow(String userId) {
        return buckets.computeIfAbsent(userId,
            id -> new TokenBucket(10, 0.001))   // 10 burst, 1/sec
            .tryConsume();
    }
}`) +
V.why('Lazy refill is the elegant trick: instead of a timer thread adding tokens, compute elapsed-time × rate at request time. Interviewers often ask "do you need a background thread?" — the answer is no.') +
V.walkthrough('DESIGN CHALLENGE', [
    {
        question: 'Your LRU cache needs TTL expiry too (entries die after 60s even if hot). Minimal change?',
        options: ['Rebuild with a different structure', 'Store expiryTime in Node; on get(), if expired → remove and return null (lazy expiry). Optionally a cleanup sweep for memory.', 'Background thread scanning all entries every second', 'Clear the whole cache every 60s'],
        correct: 1,
        explanation: 'Lazy expiration: check expiry on access, delete if stale — O(1), no threads. Add an occasional sweep (or min-heap by expiry) only if memory from never-accessed dead entries matters. Same lazy pattern Redis uses!'
    },
    {
        question: 'Token bucket with capacity 10, refill 1/sec. User idle for 1 hour, then sends 15 requests instantly. How many succeed?',
        options: ['15 — they earned 3600 tokens', '10 — tokens cap at bucket capacity; then 5 rejected until refill', 'All fail', '1 per second'],
        correct: 1,
        explanation: 'Math.min(capacity, ...) caps accumulation at 10. Idle time doesn\'t bank unlimited tokens — that\'s the entire point of the bucket: bounded burst (10), sustained rate (1/sec). The other 5 requests wait ~5 seconds.'
    }
]) +
V.interviewTip('LRU Cache is the single most-asked coding-style LLD question (it\'s also LeetCode 146). Practice writing it bug-free in 15 minutes: sentinels, moveToHead, evict-from-tail. Muscle memory pays off here.')
        },
        {
            day: 48,
            title: "LLD: Notification + Logger",
            subtitle: "Observer & Chain in production shape",
            xp: 100,
            content: V.banner('fa-bell', 'NOTIFICATION SYSTEM + LOGGER', 'Two pattern-showcase designs', 'orange') +
V.section('fa-bell', 'Notification System (LLD view)') +
V.code('Design', `NotificationService (Singleton)
 ◆── List<NotificationChannel>          ← Strategy per channel
       interface NotificationChannel { boolean send(Notification n); }
       ←─ EmailChannel, SMSChannel, PushChannel, WhatsAppChannel
 ─── RetryPolicy (maxAttempts, backoff)  ← Strategy
 ─── RateLimiter (per user per channel)  ← Day 47's class!
 ─── Observer hooks: onSent, onFailed    ← analytics subscribes

class Notification {
    String id; User recipient; String content;
    Priority priority; Set<ChannelType> channels;
}
enum Priority { CRITICAL, HIGH, MEDIUM, LOW }`) +
V.code('Send with Retry + Fallback (Java)', `public void send(Notification n) {
    for (ChannelType type : orderedByPreference(n)) {
        NotificationChannel ch = registry.get(type);
        if (!rateLimiter.allow(n.getRecipient(), type)) continue;
        if (trySendWithRetry(ch, n)) {
            observers.forEach(o -> o.onSent(n, type));
            return;                    // first success wins
        }
    }
    deadLetterQueue.add(n);            // all channels failed
    observers.forEach(o -> o.onFailed(n));
}

private boolean trySendWithRetry(NotificationChannel ch,
                                 Notification n) {
    for (int i = 0; i < retryPolicy.maxAttempts(); i++) {
        if (ch.send(n)) return true;
        sleep(retryPolicy.backoffMs(i));   // 1s, 4s, 16s...
    }
    return false;
}`) +
V.why('This mirrors your HLD Day 23 notification service exactly — but in-process. Channel = Strategy, analytics = Observer, retry with exponential backoff, DLQ for failures. One design, two altitudes. Interviewers may ask it at either level; know both.') +
V.section('fa-scroll', 'Logger Framework (Chain of Responsibility)') +
V.code('Logger Design (Java)', `enum LogLevel { DEBUG(1), INFO(2), WARN(3), ERROR(4); }

abstract class LogHandler {                 // the chain
    protected LogHandler next;
    protected LogLevel level;
    public void log(LogLevel msgLevel, String msg) {
        if (msgLevel.ordinal() >= level.ordinal()) write(msg);
        if (next != null) next.log(msgLevel, msg);
    }
    abstract void write(String msg);
}
class ConsoleHandler extends LogHandler {...}
class FileHandler    extends LogHandler {...}
class RemoteHandler  extends LogHandler {...}   // ships to ELK!

// Setup: console(DEBUG) → file(INFO) → remote(ERROR)
// One log() call, each handler decides independently.

class Logger {                               // Singleton
    private static final Logger INSTANCE = new Logger();
    private LogHandler chain;
    private final BlockingQueue<LogEntry> buffer =
        new LinkedBlockingQueue<>(10_000);   // async! never block app
}`) +
V.concept('fa-bolt', 'Async logging', 'Producer puts LogEntry in BlockingQueue, background thread drains to handlers. App threads never wait on disk/network I/O.', 'green') +
V.concept('fa-question', 'Queue full?', 'Drop DEBUG logs (bounded queue + policy) — losing debug logs beats blocking production requests.', 'orange') +
V.walkthrough('DESIGN CHALLENGE', [
    {
        question: 'OTP (CRITICAL) must try SMS first, then WhatsApp, then email. Marketing (LOW) is email-only, best-effort. Where does this routing live?',
        options: ['if-else in send()', 'A ChannelSelectionStrategy keyed by Priority — returns ordered channel list per notification type', 'Separate service per priority', 'Hard-code per notification'],
        correct: 1,
        explanation: 'Strategy again: CriticalRouting returns [SMS, WHATSAPP, EMAIL] (fallback chain), LowPriorityRouting returns [EMAIL] with no retries. New routing rule = new strategy. The send() loop you already wrote handles any ordered list.'
    },
    {
        question: 'Your logger writes synchronously to a remote ELK endpoint. ELK has a 2-second latency spike. What happens to your application and what\'s the fix?',
        options: ['Nothing — logging is free', 'Every request thread blocks 2s on logging → app-wide latency spike. Fix: async queue between app and handlers.', 'Logs get faster', 'ELK auto-scales'],
        correct: 1,
        explanation: 'Synchronous remote logging couples your app\'s latency to the log backend\'s. The BlockingQueue decouples: app threads enqueue (microseconds), a worker thread ships logs. Slow ELK → queue grows → drop-oldest-DEBUG policy. App unaffected.'
    }
]) +
V.interviewTip('Logger is a favorite "junior-friendly" LLD that hides depth: Singleton + Chain of Responsibility + async producer-consumer + backpressure policy. Naming all four out loud in 60 seconds is a power move.')
        },
        {
            day: 49,
            title: "LLD: Snake & Ladder + Tic-Tac-Toe",
            subtitle: "Game design fundamentals",
            xp: 100,
            content: V.banner('fa-dice', 'BOARD GAMES', 'Clean game loops and extensible boards', 'green') +
V.section('fa-dice', 'Snake & Ladder') +
V.code('Design (Java)', `class Game {
    private final Board board;
    private final Deque<Player> players = new ArrayDeque<>();
    private final Dice dice;

    public void play() {
        while (true) {
            Player p = players.poll();
            int roll = dice.roll();
            int target = p.getPosition() + roll;
            if (target <= board.size()) {
                target = board.applyJumps(target);  // snakes & ladders!
                p.setPosition(target);
                if (target == board.size()) {
                    announceWinner(p); return;
                }
            }                        // overshoot → stay put
            players.offer(p);        // back of the queue
        }
    }
}

class Board {
    private final int size;                       // 100
    private final Map<Integer, Integer> jumps;    // ONE map!
    // snake:  {99 → 41}   ladder: {2 → 38}
    int applyJumps(int pos) {
        return jumps.getOrDefault(pos, pos);
    }
}`) +
V.why('The elegant insight: snakes and ladders are the SAME abstraction — a jump from square A to square B. One Map<Integer,Integer> handles both. Interviewers watch whether you create separate Snake and Ladder classes (fine) or spot the unification (better).') +
V.concept('fa-random', 'Dice as injectable', 'Dice is an interface → LoadedDice for unit tests. Dependency injection makes randomness testable.', 'cyan') +
V.concept('fa-users', 'Deque for turns', 'poll() from front, offer() to back — natural round-robin. Supports "roll again on 6" by re-offering to front.', 'purple') +
V.section('fa-th', 'Tic-Tac-Toe') +
V.code('The O(1) Win Check (Java)', `class Board {
    private final int n;
    private final int[] rowSum, colSum;    // per player: +1 / -1
    private int diagSum, antiDiagSum;

    // X plays +1, O plays -1
    public boolean move(int r, int c, int val) {
        rowSum[r] += val; colSum[c] += val;
        if (r == c) diagSum += val;
        if (r + c == n - 1) antiDiagSum += val;

        return Math.abs(rowSum[r]) == n
            || Math.abs(colSum[c]) == n
            || Math.abs(diagSum)   == n
            || Math.abs(antiDiagSum) == n;   // win in O(1)!
    }
}
// Naive: scan 3 rows+cols+diags every move = O(n).
// Counter trick: O(1) per move. Works for any board size n.`) +
V.walkthrough('DESIGN CHALLENGE', [
    {
        question: 'Extend Snake & Ladder: a "freeze" square (skip next turn) and a "double-roll" square. Cleanest design?',
        options: ['if-else on position in Game.play()', 'Replace Map<Integer,Integer> with Map<Integer, SquareEffect> — interface with apply(player, game); JumpEffect, FreezeEffect, DoubleRollEffect implement it', 'Subclass Board per effect', 'Hard-code squares 13 and 27'],
        correct: 1,
        explanation: 'Strategy-style polymorphic effects: each square optionally has a SquareEffect. Jump becomes just one effect type among many. New square type = new class, Game loop unchanged. This upgrade question is THE reason interviewers ask this "easy" game.'
    },
    {
        question: 'For n×n Tic-Tac-Toe, why is the counter approach strictly better than storing the grid and scanning?',
        options: ['It uses no memory', 'O(1) win detection per move vs O(n) scanning; and you still keep the grid for move validation — the counters are an INDEX, not a replacement', 'The grid approach is wrong', 'It handles more players'],
        correct: 1,
        explanation: 'Counters are an auxiliary structure for instant win detection; the grid remains for "is this cell empty?" validation. Recognizing you need BOTH (grid for validity, counters for speed) is the complete answer.'
    }
]) +
V.interviewTip('Board games test your GAME LOOP structure: turn management, move validation, win detection, state transitions. Get the loop skeleton down first (while → poll player → validate → apply → check win → next), then optimize.')
        },
        {
            day: 50,
            title: "LLD: Final Patterns Map",
            subtitle: "Problem → Pattern cheat sheet",
            xp: 150,
            content: V.banner('fa-crown', 'LLD MASTERY MAP', 'Every problem mapped to its patterns', 'yellow') +
V.section('fa-map', 'Problem → Pattern Cheat Sheet') +
V.table(['LLD Problem', 'Core Patterns', 'Key Data Structures'], [
    ['Parking Lot', 'Singleton, Strategy, Factory', 'AtomicReference per spot'],
    ['Elevator', 'State, Strategy (dispatch)', 'TreeSet for stops (SCAN)'],
    ['Splitwise', 'Polymorphic splits, Strategy', 'Balance map + max-heaps'],
    ['BookMyShow', 'Lock manager, Observer, Saga-lite', 'ConcurrentHashMap + TTL locks'],
    ['Chess', 'Polymorphism, Command (undo)', '2D grid + move history'],
    ['LRU Cache', '(pure DS design)', 'HashMap + doubly-linked list'],
    ['Rate Limiter', '(pure DS design)', 'Lazy-refill token bucket'],
    ['Notification', 'Strategy, Observer, CoR', 'Channel registry + DLQ'],
    ['Logger', 'Singleton, Chain of Resp.', 'BlockingQueue (async)'],
    ['Snake & Ladder', 'Strategy (effects)', 'Jump map + Deque turns'],
    ['Tic-Tac-Toe', '(pure DS design)', 'Row/col/diag counters'],
    ['Vending Machine', 'State', 'State classes per phase'],
    ['ATM', 'State, Chain (cash dispense)', 'Denomination chain'],
    ['Food Delivery', 'Strategy, Observer, State', 'Order state machine']
]) +
V.section('fa-brain', 'The Pattern Selection Reflex') +
V.steps([
    { title: 'Swappable algorithm/policy?', text: 'Pricing, routing, splitting, dispatching → STRATEGY. The most common LLD pattern by far.' },
    { title: 'Object behaves differently per lifecycle phase?', text: 'Order status, elevator, vending machine → STATE. If you\'re writing if(status==X) chains, you missed it.' },
    { title: 'One event, many reactions?', text: 'Notifications, analytics, feed updates → OBSERVER.' },
    { title: 'Undo/redo or task queue?', text: 'Editor, chess history, job scheduler → COMMAND.' },
    { title: 'Complex construction with options?', text: 'Many optional fields → BUILDER.' },
    { title: 'Exactly one shared coordinator?', text: 'Config, lock manager, logger → SINGLETON (thread-safe!).' },
    { title: 'Request passes through processors?', text: 'Log levels, approvals, middleware → CHAIN OF RESPONSIBILITY.' }
]) +
V.section('fa-fire', 'The Universal LLD Checklist') +
V.tags([
    { text: 'Enums for fixed sets', type: 'pro' },
    { text: 'Interfaces at variation points', type: 'pro' },
    { text: 'Thread-safety on shared state', type: 'pro' },
    { text: 'Money as integer cents', type: 'pro' },
    { text: 'Immutable where possible', type: 'pro' },
    { text: 'Custom exceptions, not booleans', type: 'pro' },
    { text: 'One extensibility answer ready', type: 'pro' }
]) +
V.deepDive('HLD ↔ LLD: The Same Ideas at Two Altitudes', `
${V.table(['Concept', 'LLD Form', 'HLD Form'], [
    ['Pub/Sub', 'Observer pattern', 'Kafka / SNS'],
    ['Locking', 'synchronized / CAS', 'Redis SETNX / distributed locks'],
    ['Rate limiting', 'TokenBucket class', 'API Gateway + Redis counters'],
    ['Caching', 'LRU HashMap+DLL', 'Redis cluster + eviction policies'],
    ['Retries', 'Retry loop + backoff', 'Message queue redelivery + DLQ'],
    ['State machine', 'State pattern', 'Order status in DB + workflows'],
    ['Compensation', 'try/catch + undo', 'Saga pattern across services'],
    ['Async work', 'BlockingQueue + worker', 'SQS + consumer fleet']
])}
${V.why('This table is your unfair advantage. When an interviewer pivots "now scale your parking lot to 100 garages across the city" — you translate: AtomicReference → Redis lock, Observer → SNS, in-memory map → DynamoDB. Moving fluently between altitudes is the strongest senior signal there is.')}
`) +
V.interviewTip('Final advice: LLD interviews reward WORKING code over perfect architecture. A running parkVehicle() with one Strategy beats ten interfaces with no logic. Diagram fast (5 min), code the core flows (25 min), discuss extensions (10 min). Now go breach those interviews — for real this time.')
        }
    ]
};

WEEKS.push(WEEK_LLD2);
