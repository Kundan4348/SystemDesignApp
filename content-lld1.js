// LLD Week 6: OOP Foundations, SOLID, Design Patterns

const WEEK_LLD1 = {
    id: 6,
    title: "LLD PROTOCOLS",
    subtitle: "OOP, SOLID, Design Patterns",
    color: "#ff6600",
    days: [
        {
            day: 36,
            title: "OOP Foundations",
            subtitle: "The 4 pillars + UML",
            xp: 50,
            content: V.banner('fa-cube', 'OOP FOUNDATIONS', 'The building blocks of low-level design', 'orange') +
V.section('fa-layer-group', 'The 4 Pillars') +
V.concept('fa-box', 'Encapsulation', 'Bundle data + methods together. Hide internals behind private fields, expose behavior via public methods. Protects invariants.', 'green') +
V.concept('fa-eye-slash', 'Abstraction', 'Expose WHAT something does, hide HOW. Interfaces define contracts; callers don\'t care about implementation.', 'cyan') +
V.concept('fa-sitemap', 'Inheritance', 'IS-A relationship. Dog extends Animal. Reuse + polymorphism. Use sparingly — prefer composition.', 'purple') +
V.concept('fa-random', 'Polymorphism', 'Same interface, different behavior. Shape.area() works for Circle, Square, Triangle — caller doesn\'t know which.', 'pink') +
V.section('fa-code', 'Encapsulation in Practice') +
V.code('Java', `public class BankAccount {
    private double balance;  // hidden — no direct access

    public void deposit(double amount) {
        if (amount <= 0) throw new IllegalArgumentException();
        balance += amount;   // invariant protected
    }

    public double getBalance() { return balance; }
}
// account.balance = -500;  ← IMPOSSIBLE. Encapsulation wins.`) +
V.section('fa-handshake', 'Composition over Inheritance') +
V.vs(
    { title: 'COMPOSITION (HAS-A)', text: 'Car HAS-A Engine. Swap engine types at runtime. Flexible, testable, no fragile hierarchies.', icon: 'fa-puzzle-piece', type: 'good' },
    { title: 'DEEP INHERITANCE (IS-A)', text: 'Car extends Vehicle extends Machine extends Thing... Fragile base class problem. Changes ripple everywhere.', icon: 'fa-link', type: 'bad' }
) +
V.why('Interviewers love asking "composition vs inheritance." Answer: inheritance for true IS-A with stable base classes (rare); composition for everything else. Favor interfaces + injected dependencies.') +
V.section('fa-project-diagram', 'UML Class Diagram Notation') +
V.code('Relationships You Must Know', `A ──────▷ B    A extends B        (inheritance, solid + hollow arrow)
A ┄┄┄┄┄▷ B    A implements B     (realization, dashed + hollow arrow)
A ────── B    association         (A knows about B)
A ◇───── B    aggregation         (A has B, B can outlive A)
A ◆───── B    composition         (A owns B, B dies with A)
A ┄┄┄┄┄> B    dependency          (A uses B temporarily)`) +
V.analogy('Aggregation vs Composition: A Team ◇ has Players — players exist without the team. A House ◆ has Rooms — destroy the house, rooms are gone.') +
V.walkthrough('TEST: OOP Concepts', [
    {
        question: 'You have PaymentProcessor with subclasses CardProcessor, UPIProcessor, WalletProcessor. Client code has if(type=="card")... else if(type=="upi")... What OOP principle fixes this?',
        options: ['Encapsulation — make type private', 'Polymorphism — call processor.process(), each subclass implements its own', 'Inheritance — add more subclasses', 'Abstraction — hide the if-else in a helper'],
        correct: 1,
        explanation: 'Polymorphism eliminates type-checking chains. Store a PaymentProcessor reference, call process() — the right implementation runs automatically. Adding a new payment type = new class, ZERO changes to client code.'
    },
    {
        question: 'A ParkingLot class contains ParkingFloor objects. When the lot is demolished, floors cease to exist. Which UML relationship?',
        options: ['Association', 'Aggregation (hollow diamond)', 'Composition (filled diamond)', 'Dependency'],
        correct: 2,
        explanation: 'Composition: the whole OWNS the parts, parts cannot outlive the whole. ParkingLot ◆── ParkingFloor. If floors could be moved to another lot (they can\'t!), it would be aggregation.'
    }
]) +
V.interviewTip('In LLD interviews, start by identifying ENTITIES (nouns → classes), then BEHAVIORS (verbs → methods), then RELATIONSHIPS (has-a, is-a). Sketch the class diagram before writing any code.')
        },
        {
            day: 37,
            title: "SOLID Principles",
            subtitle: "The 5 rules of clean design",
            xp: 60,
            content: V.banner('fa-gem', 'SOLID PRINCIPLES', 'The foundation of maintainable code', 'yellow') +
V.section('fa-s', 'S — Single Responsibility') +
`<p>A class should have <strong>ONE reason to change</strong>.</p>` +
V.code('Violation → Fix', `// BAD: 3 reasons to change
class Report {
    generateContent() {...}   // business logic changes
    formatAsPDF() {...}       // format changes
    saveToDatabase() {...}    // persistence changes
}

// GOOD: one job each
class ReportGenerator { generateContent() {...} }
class PDFFormatter    { format(content) {...} }
class ReportRepository{ save(report) {...} }`) +
V.section('fa-o', 'O — Open/Closed') +
`<p>Open for <strong>extension</strong>, closed for <strong>modification</strong>. Add new behavior via new classes, not by editing existing ones.</p>` +
V.code('Violation → Fix', `// BAD: every new shape edits this method
double area(Object shape) {
    if (shape instanceof Circle) {...}
    else if (shape instanceof Square) {...}  // keeps growing!
}

// GOOD: new shape = new class, nothing edited
interface Shape { double area(); }
class Circle implements Shape { public double area() {...} }
class Square implements Shape { public double area() {...} }`) +
V.section('fa-l', 'L — Liskov Substitution') +
`<p>Subtypes must be <strong>substitutable</strong> for their base types without breaking behavior.</p>` +
V.code('The Classic Violation', `class Rectangle { setWidth(w); setHeight(h); }
class Square extends Rectangle {
    setWidth(w)  { width = w; height = w; }  // surprise!
}

Rectangle r = new Square();
r.setWidth(5); r.setHeight(10);
assert r.area() == 50;  // FAILS! area is 100. LSP violated.
// Square IS-NOT-A Rectangle in behavior. Don't inherit.`) +
V.section('fa-i', 'I — Interface Segregation') +
`<p>Many small interfaces beat one fat interface. Clients shouldn\'t depend on methods they don\'t use.</p>` +
V.code('Violation → Fix', `// BAD: Robot forced to implement eat()
interface Worker { work(); eat(); sleep(); }

// GOOD: segregated
interface Workable { work(); }
interface Eatable  { eat(); }
class Human implements Workable, Eatable {...}
class Robot implements Workable {...}  // only what it needs`) +
V.section('fa-d', 'D — Dependency Inversion') +
`<p>Depend on <strong>abstractions</strong>, not concretions. High-level modules shouldn\'t import low-level details.</p>` +
V.code('Violation → Fix', `// BAD: OrderService hard-wired to MySQL
class OrderService {
    private MySQLDatabase db = new MySQLDatabase();
}

// GOOD: depends on interface, injected
class OrderService {
    private final Database db;
    OrderService(Database db) { this.db = db; }  // inject!
}
// Now: swap MySQL → DynamoDB → MockDB (tests) freely`) +
V.walkthrough('TEST: Spot the Violation', [
    {
        question: 'class UserService { register(); sendWelcomeEmail(); validatePassword(); generatePDF(); logToFile(); } — which principle is most violated?',
        options: ['Liskov Substitution', 'Single Responsibility — 5 unrelated jobs in one class', 'Interface Segregation', 'Open/Closed'],
        correct: 1,
        explanation: 'SRP violation: registration logic, email, validation, PDF generation, and logging are 5 different responsibilities with 5 different reasons to change. Split into UserService, EmailService, PasswordValidator, PDFGenerator, Logger.'
    },
    {
        question: 'Your NotificationSender has: if(type=="email"){...} else if(type=="sms"){...}. Every new channel means editing this method. Which principle does the fix use?',
        options: ['Open/Closed — new channel = new class implementing NotificationChannel interface', 'Liskov Substitution', 'Dependency Inversion only', 'Encapsulation'],
        correct: 0,
        explanation: 'Open/Closed: define NotificationChannel interface with send() method. EmailChannel, SMSChannel, PushChannel implement it. New channel = new class. The sender iterates channels polymorphically — never edited again.'
    },
    {
        question: 'PenguinBird extends Bird, but Bird has fly(). Penguin throws UnsupportedOperationException in fly(). Which principle is violated?',
        options: ['Single Responsibility', 'Open/Closed', 'Liskov Substitution — Penguin can\'t substitute for Bird without breaking callers', 'Dependency Inversion'],
        correct: 2,
        explanation: 'LSP: any code doing bird.fly() explodes when handed a Penguin. Fix the hierarchy: interface Flyable { fly(); } — only flying birds implement it. Never inherit then break the contract.'
    }
]) +
V.interviewTip('SOLID is THE most asked LLD theory topic. Memorize one violation example + fix per principle. When designing in an interview, name-drop naturally: "I\'ll inject this dependency to follow DIP" — shows fluency.')
        },
        {
            day: 38,
            title: "Creational Patterns",
            subtitle: "Singleton, Factory, Builder",
            xp: 60,
            content: V.banner('fa-industry', 'CREATIONAL PATTERNS', 'Controlling object creation', 'green') +
V.section('fa-circle', 'Singleton — One Instance Ever') +
V.code('Thread-Safe Singleton (Java)', `public class Config {
    private static volatile Config instance;
    private Config() {}  // private constructor!

    public static Config getInstance() {
        if (instance == null) {                 // fast path
            synchronized (Config.class) {
                if (instance == null)            // double-check
                    instance = new Config();
            }
        }
        return instance;
    }
}`) +
V.tags([{text:'Use: config, connection pools, loggers', type:'pro'}, {text:'Hidden global state', type:'con'}, {text:'Hard to unit test', type:'con'}]) +
V.why('Interviewers ask: "Why double-checked locking?" — Without it, every getInstance() call pays synchronization cost. With it, only the FIRST call synchronizes. "volatile" prevents half-constructed instance visibility across threads.') +
V.section('fa-industry', 'Factory Method — Delegate Creation') +
V.code('Factory (Java)', `interface Notification { void send(String msg); }
class EmailNotification implements Notification {...}
class SMSNotification implements Notification {...}

class NotificationFactory {
    public static Notification create(String type) {
        return switch (type) {
            case "EMAIL" -> new EmailNotification();
            case "SMS"   -> new SMSNotification();
            default -> throw new IllegalArgumentException();
        };
    }
}
// Client: Notification n = NotificationFactory.create("EMAIL");
// Client never touches concrete classes → easy to extend`) +
V.section('fa-cubes', 'Abstract Factory — Families of Objects') +
`<p>Factory of factories. Create related objects together (e.g., a UI theme creates matching Button + Checkbox + Menu).</p>` +
V.code('Abstract Factory', `interface UIFactory { Button createButton(); Menu createMenu(); }
class DarkThemeFactory  implements UIFactory {...}  // dark button + menu
class LightThemeFactory implements UIFactory {...}  // light button + menu
// Swap entire families with one line: UIFactory f = new DarkThemeFactory();`) +
V.section('fa-hammer', 'Builder — Step-by-Step Construction') +
V.code('Builder (Java)', `Burger burger = new Burger.Builder()
    .bun("sesame")
    .patty("veg")
    .cheese(true)
    .lettuce(true)
    .build();

// vs telescoping constructor hell:
// new Burger("sesame", "veg", true, true, false, null, 2, false)
//             ...which boolean was cheese again??`) +
V.tags([{text:'Use: many optional params', type:'pro'}, {text:'Immutable result objects', type:'pro'}, {text:'Readable at call site', type:'pro'}]) +
V.section('fa-clone', 'Prototype — Clone Existing Objects') +
`<p>Copy an existing object instead of building from scratch. Useful when construction is expensive (e.g., object loaded from DB).</p>` +
V.walkthrough('TEST: Pick the Pattern', [
    {
        question: 'You\'re designing an HTTP request class with 2 required fields (url, method) and 12 optional ones (headers, timeout, retries, body...). Which pattern?',
        options: ['Singleton', 'Factory Method', 'Builder — fluent API for many optional parameters', 'Prototype'],
        correct: 2,
        explanation: 'Builder is THE answer for many optional parameters. Request.builder().url(x).method(GET).timeout(30).build() — readable, immutable, no 12-argument constructor. This is how OkHttp/Retrofit actually work.'
    },
    {
        question: 'Your app needs exactly one DatabaseConnectionPool shared everywhere. Two threads call getInstance() simultaneously on first access. Without protection, what happens?',
        options: ['Second thread waits automatically', 'Two pools get created — race condition. Need synchronized double-checked locking.', 'JVM prevents it', 'The pool merges automatically'],
        correct: 1,
        explanation: 'Race: both threads see instance==null, both construct. Result: two pools, wasted connections, possible errors. Fix: double-checked locking with volatile, OR eager initialization, OR enum singleton (Josh Bloch\'s favorite).'
    }
]) +
V.realWorld('Spring Framework', 'Spring beans are singletons by default — one instance per container, injected everywhere (DIP + Singleton combined). Spring also uses FactoryBean extensively for complex object creation.')
        },
        {
            day: 39,
            title: "Structural Patterns",
            subtitle: "Adapter, Decorator, Facade, Proxy",
            xp: 60,
            content: V.banner('fa-shapes', 'STRUCTURAL PATTERNS', 'Composing objects into larger structures', 'cyan') +
V.section('fa-plug', 'Adapter — Make Incompatible Interfaces Work') +
V.code('Adapter (Java)', `// You have: legacy XML API. You need: JSON interface.
interface JsonService { String getJson(); }

class XmlService { String getXml() {...} }  // can't change this

class XmlToJsonAdapter implements JsonService {
    private final XmlService xml;
    XmlToJsonAdapter(XmlService xml) { this.xml = xml; }
    public String getJson() {
        return convertXmlToJson(xml.getXml());  // adapt!
    }
}`) +
V.analogy('A power plug adapter: your US laptop charger (existing interface) works in an EU socket (expected interface). Neither side changes — the adapter translates.') +
V.section('fa-layer-group', 'Decorator — Add Behavior Without Subclassing') +
V.code('Decorator (Java)', `interface Coffee { double cost(); String desc(); }
class SimpleCoffee implements Coffee { cost() → 5; }

class MilkDecorator implements Coffee {
    private final Coffee inner;
    MilkDecorator(Coffee c) { inner = c; }
    public double cost() { return inner.cost() + 1.5; }
}

Coffee order = new WhipDecorator(
                 new MilkDecorator(
                   new SimpleCoffee()));   // 5 + 1.5 + 2 = 8.5
// Stack ANY combination at runtime. No MilkWhipSugarCoffee class explosion!`) +
V.why('Without Decorator, N addons = 2^N subclasses (MilkCoffee, MilkSugarCoffee, MilkSugarWhipCoffee...). With Decorator: N classes, infinite combinations. Java I/O works this way: new BufferedReader(new FileReader(...)).') +
V.section('fa-door-open', 'Facade — Simple Front for Complex Subsystem') +
V.code('Facade', `class VideoConverterFacade {
    File convert(String filename, String format) {
        // hides: CodecFactory, BitrateReader, AudioMixer,
        //        FrameBuffer, MuxerRegistry... 10 classes
        return simpleResult;
    }
}
// Client calls ONE method instead of orchestrating 10 classes`) +
V.section('fa-shield-alt', 'Proxy — Control Access to an Object') +
V.concept('fa-hourglass', 'Lazy Proxy', 'Delay expensive creation until first use (virtual proxy).', 'green') +
V.concept('fa-lock', 'Protection Proxy', 'Check permissions before forwarding the call.', 'orange') +
V.concept('fa-bolt', 'Cache Proxy', 'Return cached result instead of recomputing. This is literally how Redis-backed caching decorates your DB layer.', 'cyan') +
V.section('fa-sitemap', 'Composite — Trees of Objects') +
V.code('Composite', `interface FileSystemItem { long size(); }
class File implements FileSystemItem { size() → bytes; }
class Folder implements FileSystemItem {
    List<FileSystemItem> children;
    public long size() {
        return children.stream().mapToLong(FileSystemItem::size).sum();
    }  // recursion over the tree — files and folders treated uniformly
}`) +
V.walkthrough('TEST: Structural Patterns', [
    {
        question: 'Your pizza app: base pizza + optional toppings (cheese, olives, jalapeno, corn...). Users combine freely. Which pattern avoids class explosion?',
        options: ['Factory for each combination', 'Decorator — wrap base pizza with topping decorators at runtime', 'Builder', 'Singleton toppings'],
        correct: 1,
        explanation: 'Decorator: new CheeseDecorator(new OliveDecorator(new BasePizza())). Each decorator adds cost() and description(). Any combination, no subclass explosion. (Builder is for CONSTRUCTION with options; Decorator is for LAYERING behavior — both defensible, but Decorator is the classic answer here.)'
    },
    {
        question: 'You integrate Stripe\'s SDK but your codebase expects your own PaymentGateway interface. You can\'t modify Stripe\'s code. Which pattern?',
        options: ['Adapter — wrap Stripe SDK inside a class implementing YOUR interface', 'Facade', 'Proxy', 'Bridge'],
        correct: 0,
        explanation: 'Adapter: StripeAdapter implements PaymentGateway, internally translating your charge() calls into Stripe\'s API calls. Swap payment providers by writing new adapters — your codebase never changes.'
    }
]) +
V.interviewTip('Adapter vs Facade confusion is common. Adapter = translate ONE interface to another (compatibility). Facade = simplify MANY interfaces into one (convenience). Adapter changes the interface; Facade reduces the surface.')
        },
        {
            day: 40,
            title: "Behavioral Patterns",
            subtitle: "Strategy, Observer, State, Command",
            xp: 60,
            content: V.banner('fa-exchange-alt', 'BEHAVIORAL PATTERNS', 'How objects communicate and vary behavior', 'purple') +
V.section('fa-chess', 'Strategy — Swappable Algorithms') +
V.code('Strategy (Java)', `interface PricingStrategy { double price(Order o); }
class RegularPricing  implements PricingStrategy {...}
class SalePricing     implements PricingStrategy {...}
class MemberPricing   implements PricingStrategy {...}

class Checkout {
    private PricingStrategy strategy;           // injected
    void setStrategy(PricingStrategy s) { strategy = s; }
    double total(Order o) { return strategy.price(o); }
}
// Swap algorithms at RUNTIME. No if-else chains. Open/Closed satisfied.`) +
V.section('fa-broadcast-tower', 'Observer — Publish/Subscribe') +
V.code('Observer (Java)', `interface Observer { void update(String event); }

class OrderService {
    private List<Observer> observers = new ArrayList<>();
    void subscribe(Observer o) { observers.add(o); }

    void placeOrder(Order order) {
        // ... save order ...
        observers.forEach(o -> o.update("ORDER_PLACED"));
    }
}
// EmailService, InventoryService, AnalyticsService all subscribe.
// OrderService doesn't know they exist. Total decoupling.`) +
V.why('Observer is the in-process version of a message queue! Same concept as SNS/Kafka pub-sub from HLD Week 2 — one publisher, many subscribers, loose coupling. Connecting LLD patterns to HLD concepts impresses interviewers.') +
V.section('fa-traffic-light', 'State — Behavior Changes with State') +
V.code('State (Java)', `interface OrderState {
    OrderState next();
    void cancel();
}
class PlacedState    implements OrderState { next() → Shipped;  cancel() → OK }
class ShippedState   implements OrderState { next() → Delivered; cancel() → throw! }
class DeliveredState implements OrderState { next() → throw;    cancel() → throw! }

class Order {
    private OrderState state = new PlacedState();
    void nextStage() { state = state.next(); }   // no if-else!
}`) +
V.analogy('State pattern = a state machine as classes. Vending machine: NoCoin → HasCoin → Dispensing. Each state class knows its valid transitions. Invalid action in wrong state → exception. Perfect for Order lifecycles, elevators, game characters.') +
V.section('fa-terminal', 'Command — Requests as Objects') +
V.code('Command (Java)', `interface Command { void execute(); void undo(); }

class CutCommand implements Command {
    execute() { editor.cut(); }
    undo()    { editor.paste(); }
}

class CommandHistory {
    Deque<Command> history = new ArrayDeque<>();
    void run(Command c) { c.execute(); history.push(c); }
    void undoLast()     { history.pop().undo(); }
}
// This is how Ctrl+Z works in every editor!`) +
V.section('fa-link', 'Chain of Responsibility — Pass Along Handlers') +
V.code('Chain', `abstract class Approver {
    protected Approver next;
    abstract void approve(Expense e);
}
Manager (< $1K) → Director (< $10K) → VP (< $100K) → CEO
// Request travels the chain until someone handles it.
// Middleware in Express/Spring works exactly this way.`) +
V.section('fa-list', 'Quick Reference — All Behavioral') +
V.table(['Pattern', 'One-Liner', 'Real Example'], [
    ['Strategy', 'Swappable algorithm', 'Payment methods, sorting'],
    ['Observer', 'Notify subscribers on change', 'Event listeners, pub-sub'],
    ['State', 'Behavior per state, no if-else', 'Order lifecycle, vending machine'],
    ['Command', 'Request as object, undoable', 'Undo/redo, task queues'],
    ['Chain of Resp.', 'Pass until handled', 'Middleware, approval flows'],
    ['Template Method', 'Skeleton algo, subclass fills steps', 'Frameworks calling your hooks'],
    ['Iterator', 'Traverse without exposing internals', 'for-each loops'],
    ['Mediator', 'Central hub for communication', 'Chat room, air traffic control']
]) +
V.walkthrough('TEST: Behavioral Patterns', [
    {
        question: 'Ride-sharing app: fare calculation differs by ride type (Economy, Premium, Pool) AND can change at runtime (surge pricing). Which pattern?',
        options: ['State', 'Strategy — inject FareStrategy, swap SurgePricingStrategy at runtime', 'Observer', 'Command'],
        correct: 1,
        explanation: 'Strategy: FareCalculator holds a FareStrategy. Normal hours → StandardFare, surge → SurgeFare (wraps standard × multiplier). Runtime-swappable algorithms = Strategy\'s exact purpose.'
    },
    {
        question: 'Vending machine: insertCoin() while dispensing should fail; dispense() without coin should fail. Nested if-else is getting unmaintainable. Which pattern?',
        options: ['Strategy', 'Chain of Responsibility', 'State — IdleState, HasCoinState, DispensingState each define valid actions', 'Decorator'],
        correct: 2,
        explanation: 'State pattern: each state class implements insertCoin()/selectItem()/dispense() — valid actions transition state, invalid ones throw. The machine delegates to current state. No conditionals, impossible states unrepresentable.'
    },
    {
        question: 'When a user posts, you must: send notifications, update feeds, log analytics, check content moderation. More actions coming next quarter. Which pattern decouples this?',
        options: ['Facade', 'Observer — PostService publishes "POST_CREATED", subscribers react independently', 'Template Method', 'Builder'],
        correct: 1,
        explanation: 'Observer: PostService fires the event; NotificationObserver, FeedObserver, AnalyticsObserver, ModerationObserver each subscribe. New requirement = new observer class. PostService never changes (Open/Closed too!).'
    }
]) +
V.interviewTip('Strategy vs State look identical structurally (interface + implementations). The difference is INTENT: Strategy = client chooses the algorithm; State = the object transitions itself between states. Say this distinction out loud — it\'s a favorite probe.')
        },
        {
            day: 41,
            title: "LLD Interview Method",
            subtitle: "The 5-step LLD framework",
            xp: 50,
            content: V.banner('fa-map', 'LLD FRAMEWORK', 'How to attack any LLD problem', 'green') +
V.steps([
    { title: 'CLARIFY REQUIREMENTS (5 min)', text: 'Scope the problem: "Parking lot — single or multi-floor? Vehicle types? Payment? Reservations?" Write down 4-6 core requirements. Cut everything else.' },
    { title: 'IDENTIFY ENTITIES (5 min)', text: 'Nouns → classes: ParkingLot, Floor, Spot, Vehicle, Ticket, Payment. Enums for fixed sets: VehicleType, SpotSize, PaymentStatus.' },
    { title: 'DEFINE RELATIONSHIPS (5 min)', text: 'ParkingLot ◆ has Floors ◆ has Spots. Ticket → references Vehicle + Spot. Draw the class diagram — boxes and arrows.' },
    { title: 'DESIGN CORE FLOWS (15 min)', text: 'Walk the main use cases method by method: parkVehicle() → findSpot() → assignSpot() → issueTicket(). Apply patterns where they fit naturally.' },
    { title: 'HANDLE EDGE CASES + EXTEND (10 min)', text: 'Lot full? Concurrent parking on same spot (locks!)? Lost ticket? Then: "How would you add EV charging spots?" — show Open/Closed extension.' }
]) +
V.section('fa-exclamation-triangle', 'Top LLD Mistakes') +
V.concept('fa-times', 'God Class', 'One ParkingLot class doing everything. Split responsibilities (SRP).', 'pink') +
V.concept('fa-times', 'Pattern Stuffing', 'Forcing 8 patterns into a parking lot. Use patterns only where the problem demands them.', 'orange') +
V.concept('fa-times', 'Skipping Concurrency', 'Two cars, one spot — always mention synchronization/locking for shared mutable state.', 'yellow') +
V.concept('fa-times', 'No Enums', 'Using strings for VehicleType invites bugs. Enums make invalid states impossible.', 'cyan') +
V.section('fa-key', 'Signals Interviewers Score') +
V.tags([
    { text: 'Clean class diagram first', type: 'pro' },
    { text: 'SOLID applied naturally', type: 'pro' },
    { text: 'Enums + interfaces', type: 'pro' },
    { text: 'Concurrency awareness', type: 'pro' },
    { text: 'Extensibility answer ready', type: 'pro' }
]) +
V.deepDive('Concurrency in LLD — The Minimum You Must Know', `
${V.code('Thread-Safe Spot Assignment', `public synchronized Ticket parkVehicle(Vehicle v) {
    ParkingSpot spot = findAvailableSpot(v.getType());
    if (spot == null) throw new LotFullException();
    spot.assign(v);          // atomic within synchronized
    return new Ticket(v, spot);
}

// Better granularity: lock per-spot, not whole lot
public boolean tryAssign(Vehicle v) {
    return occupied.compareAndSet(false, true);  // CAS, lock-free
}`)}
<p><strong>Interview vocabulary:</strong> synchronized (coarse), ReentrantLock (flexible), AtomicBoolean/compareAndSet (lock-free), ConcurrentHashMap (thread-safe collections), optimistic vs pessimistic locking (connects to your Day 31 booking system!).</p>
${V.why('Concurrency is the #1 differentiator between junior and senior LLD answers. Even one sentence — "findSpot and assign must be atomic, I\'d use a per-spot lock to avoid serializing the whole lot" — moves you up a level.')}
`) +
V.interviewTip('Timebox strictly: if you spend 25 minutes on class diagrams, you\'ll never show working logic. Diagram fast, then write the 2-3 methods that contain REAL logic (spot assignment, fee calculation) — that\'s where evaluation happens.')
        },
        {
            day: 42,
            title: "LLD: Parking Lot",
            subtitle: "The classic — full solution",
            xp: 100,
            content: V.banner('fa-parking', 'PARKING LOT', 'The most-asked LLD problem — complete design', 'cyan') +
V.section('fa-clipboard-list', 'Requirements') +
V.tags([
    { text: 'Multi-floor', type: 'info' },
    { text: 'Car / Bike / Truck', type: 'info' },
    { text: 'Spot sizes: S / M / L', type: 'info' },
    { text: 'Ticket on entry', type: 'info' },
    { text: 'Pay on exit (hourly)', type: 'info' },
    { text: 'Display free spots', type: 'info' }
]) +
V.section('fa-project-diagram', 'Class Diagram') +
V.code('Structure', `ParkingLot (Singleton)
 ◆── List<ParkingFloor>
      ◆── List<ParkingSpot>
           - id, SpotSize, isOccupied, Vehicle

Vehicle (abstract) ←─ Car / Bike / Truck
 - licensePlate, VehicleType

Ticket
 - id, vehicle, spot, entryTime

EntryGate  → issues Ticket
ExitGate   → calculates fee via FeeStrategy

FeeStrategy (interface)          ← Strategy pattern!
 ←─ HourlyFeeStrategy
 ←─ WeekendFeeStrategy

SpotAssignmentStrategy (interface)
 ←─ NearestSpotStrategy
 ←─ RandomSpotStrategy`) +
V.section('fa-code', 'Core Code') +
V.code('Entities (Java)', `enum VehicleType { BIKE, CAR, TRUCK }
enum SpotSize    { SMALL, MEDIUM, LARGE }

class ParkingSpot {
    private final String id;
    private final SpotSize size;
    private final AtomicReference<Vehicle> occupant = new AtomicReference<>();

    boolean canFit(Vehicle v) {
        return occupant.get() == null && size.fits(v.getType());
    }
    boolean tryPark(Vehicle v) {
        return occupant.compareAndSet(null, v);  // thread-safe!
    }
    void free() { occupant.set(null); }
}`) +
V.code('Main Flow (Java)', `class ParkingLot {
    private static final ParkingLot INSTANCE = new ParkingLot();
    private final List<ParkingFloor> floors = new ArrayList<>();
    private SpotAssignmentStrategy assigner = new NearestSpotStrategy();

    public Ticket parkVehicle(Vehicle v) {
        ParkingSpot spot = assigner.findSpot(floors, v);
        if (spot == null || !spot.tryPark(v))
            throw new LotFullException();
        return new Ticket(UUID.randomUUID().toString(),
                          v, spot, Instant.now());
    }

    public Receipt unpark(Ticket t, FeeStrategy fee) {
        long hours = Duration.between(t.getEntryTime(),
                          Instant.now()).toHours() + 1;
        double amount = fee.calculate(t.getVehicle().getType(), hours);
        t.getSpot().free();
        return new Receipt(t, amount);
    }
}`) +
V.code('Strategy Implementations', `interface FeeStrategy {
    double calculate(VehicleType type, long hours);
}

class HourlyFeeStrategy implements FeeStrategy {
    private static final Map<VehicleType, Double> RATE = Map.of(
        VehicleType.BIKE, 10.0,
        VehicleType.CAR, 20.0,
        VehicleType.TRUCK, 40.0);
    public double calculate(VehicleType t, long hours) {
        return RATE.get(t) * hours;
    }
}`) +
V.section('fa-shield-alt', 'Design Decisions Explained') +
V.concept('fa-circle', 'Singleton ParkingLot', 'One lot instance coordinates everything. (In real systems, prefer DI container-managed singleton.)', 'green') +
V.concept('fa-chess', 'Strategy for fees + assignment', 'Weekend pricing or nearest-to-elevator assignment = new class, zero edits to ParkingLot. Open/Closed.', 'cyan') +
V.concept('fa-atom', 'AtomicReference for spots', 'compareAndSet makes tryPark atomic — two threads can\'t take one spot. No global lock needed.', 'purple') +
V.concept('fa-cube', 'Vehicle abstract class', 'Common fields (plate, type) shared; new vehicle types extend without touching existing code.', 'orange') +
V.walkthrough('DESIGN CHALLENGE', [
    {
        question: 'Requirement change: add EV spots with chargers. Bikes/cars can park in EV spots ONLY if no regular spot exists. Where does this logic go?',
        options: ['Inside ParkingLot.parkVehicle() with if-else', 'A new EVAwareSpotStrategy implementing SpotAssignmentStrategy — swap it in', 'Subclass ParkingLot', 'Modify every ParkingSpot'],
        correct: 1,
        explanation: 'The assignment strategy encapsulates spot-finding rules. EVAwareSpotStrategy: try regular spots first, fall back to EV spots for non-EVs. ParkingLot code untouched — this is exactly why we used Strategy. Open/Closed in action.'
    },
    {
        question: 'Two cars arrive at two entry gates simultaneously; both gates find the SAME last free spot. Without protection, both get tickets for it. Your fix?',
        options: ['Only allow one gate', 'spot.tryPark() uses compareAndSet — exactly one gate succeeds, the other retries findSpot()', 'Synchronize the entire parkVehicle method globally', 'Random delays between gates'],
        correct: 1,
        explanation: 'CAS (compareAndSet) on the spot itself: atomically "if null, set to vehicle." One gate wins, the loser gets false and searches again. Per-spot atomicity scales; a global lock would serialize ALL parking across all gates.'
    }
]) +
V.interviewTip('Parking Lot tests whether you can COMBINE patterns: Singleton (lot) + Strategy (fees, assignment) + Factory (vehicle creation from gate input) + thread-safety. Practice drawing this diagram from memory in under 5 minutes.')
        }
    ]
};

WEEKS.push(WEEK_LLD1);
