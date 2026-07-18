// ============================================================
// TOPIC CONTENT — Power Engineering Trainer
// Each topic has an ordered list of "steps": lesson | quiz | sim
// ============================================================

const TOPICS = [

// ------------------------------------------------------------
{
  id: "voltage-levels",
  title: "Common Voltage Levels",
  navLabel: "VOLTAGE\nLEVELS",
  symbol: "bus",
  steps: [
    { type:"lesson", title:"Why voltage levels exist",
      body:`Power is moved at high voltage and used at low voltage — that's the whole game. High voltage means low current for the same power (P = V &times; I), and low current means smaller conductors and far less energy lost to heat (I&sup2;R losses) over long transmission distances. Every transformer you'll see in the field exists to step voltage up or down at the right point in that chain.` },

    { type:"lesson", title:"The chain: generation to your outlet",
      body:`<b>Generation:</b> 13.8&ndash;24 kV at the generator terminals.<br>
      <b>Transmission:</b> 138 kV, 230 kV, 345 kV, up to 500&ndash;765 kV (EHV) &mdash; moves bulk power long distances.<br>
      <b>Subtransmission:</b> 69 kV, 138 kV &mdash; feeds from transmission down into local areas.<br>
      <b>Distribution primary:</b> 12.47 kV, 13.8 kV, 4.16 kV, 34.5 kV &mdash; what runs down your street.<br>
      <b>Utilization/secondary:</b> 480Y/277 V (industrial/commercial), 208Y/120 V (commercial), 120/240 V (residential).<br><br>
      In <b>ERCOT/Texas</b>, you'll commonly see 345 kV and 138 kV as the backbone transmission voltages, with 12.47 kV and 13.8 kV as very common distribution primary voltages.` },

    { type:"quiz", q:"Why is power transmitted at very high voltage over long distances?",
      options:[
        "To make the equipment look more impressive",
        "To reduce current for the same power, which cuts resistive (I²R) losses",
        "Because generators can only produce high voltage",
        "High voltage is required by federal law for all power lines"
      ], correct:1,
      explain:"P = V × I. For a fixed power, raising voltage lowers current — and losses scale with the square of current, so this dramatically cuts energy wasted as heat over long lines." },

    { type:"lesson", title:"Matching voltage to the job",
      body:`A 480V industrial motor doesn't connect straight to a 138 kV transmission line — there's always a transformer stepping voltage down in stages. As a rule: the farther the power has to travel, the higher the voltage; the closer to the actual load, the lower the voltage. You'll see this reflected directly in single-line diagrams as a series of transformers, each one dropping the voltage another step.` },

    { type:"quiz", q:"Which pair is a realistic distribution primary voltage you might see in Texas?",
      options:["120/240 V", "345 kV", "12.47 kV or 13.8 kV", "6 V"],
      correct:2,
      explain:"12.47 kV and 13.8 kV are classic distribution primary voltages — the level that runs on the poles down streets before it's stepped down again for individual buildings." },

    { type:"sim", title:"Interactive: the voltage chain", simId:"voltage-levels",
      instructions:"Click each stage of the chain below to see its typical voltage and role." },

    { type:"quiz", q:"A recloser sits on a 12.47 kV distribution feeder. Roughly what voltage would you expect the secondary of a nearby service transformer to deliver to a home?",
      options:["12.47 kV", "480 V", "120/240 V", "345 kV"], correct:2,
      explain:"Residential utilization voltage in North America is 120/240V split-phase, delivered by a final step-down (distribution) transformer off the primary feeder." }
  ]
},

// ------------------------------------------------------------
{
  id: "sld",
  title: "Single Line Diagrams",
  navLabel: "ONE-LINE\nDIAGRAMS",
  symbol: "breaker",
  steps: [
    { type:"lesson", title:"What a one-line diagram actually is",
      body:`A real three-phase power system has three conductors per circuit — drawing all three every time would be unreadable. A <b>single line diagram (SLD)</b> simplifies this: one line represents all three phases, and standard symbols represent breakers, switches, transformers, buses, and protection devices. It's the master map of a substation or system — the first thing you'll pull up to understand how power flows and where to isolate equipment.` },

    { type:"lesson", title:"Core symbols you'll see constantly",
      body:`<b>Bus:</b> a thick horizontal line &mdash; a common connection point multiple circuits tie into.<br>
      <b>Circuit breaker:</b> a square or a box with an X or circle &mdash; can interrupt current under load or fault.<br>
      <b>Disconnect switch:</b> a diagonal line/blade symbol &mdash; isolates equipment, no-load only.<br>
      <b>Transformer:</b> two overlapping circles &mdash; steps voltage up or down.<br>
      <b>CT (current transformer):</b> a small circle around the conductor.<br>
      <b>Ground:</b> a stack of horizontal lines, shrinking in width.<br>
      <b>Arrow at the end of a line:</b> a feeder or load leaving the diagram.` },

    { type:"quiz", q:"On a single line diagram, what does a stack of shrinking horizontal lines usually represent?",
      options:["A capacitor bank", "A ground connection", "A bus tie", "A recloser"], correct:1,
      explain:"That shrinking-lines symbol is the standard ground/earth symbol — you'll see it wherever equipment frames, neutrals, or shield wires tie to ground." },

    { type:"lesson", title:"ANSI device numbers",
      body:`Protection devices on an SLD are often labeled with a number inside a circle instead of words &mdash; this is the ANSI/IEEE device numbering standard. A few you'll see constantly:<br>
      <b>52</b> = circuit breaker &nbsp; <b>89</b> = disconnect switch &nbsp; <b>50/51</b> = instantaneous / time overcurrent relay &nbsp; <b>87</b> = differential relay &nbsp; <b>27</b> = undervoltage &nbsp; <b>59</b> = overvoltage &nbsp; <b>25</b> = sync-check &nbsp; <b>86</b> = lockout relay.<br>
      Memorizing 52 and 87 alone will let you read most protection one-lines a lot faster.` },

    { type:"quiz", q:"You see a device labeled '87' near a power transformer on an SLD. What kind of protection is that?",
      options:["Undervoltage relay", "Differential relay (compares current in vs. out)", "Disconnect switch", "Recloser control"], correct:1,
      explain:"87 is differential protection — it compares current entering vs. leaving a zone (like a transformer) and trips if they don't match, which indicates an internal fault." },

    { type:"sim", title:"Interactive: build & energize a one-line", simId:"sld",
      instructions:"Click the breakers to open/close them and watch which parts of the diagram stay energized." },

    { type:"quiz", q:"Why do engineers use a single line diagram instead of drawing all three phases?",
      options:[
        "Three-phase systems don't really have three separate conductors",
        "It's a simplification — one line stands in for all three phases to make the system readable",
        "It's only used for single-phase residential systems",
        "Regulations require hiding two of the three phases"
      ], correct:1,
      explain:"The one-line is purely a readability simplification for balanced three-phase systems — the physical system still has three phases; the diagram just represents them with one line and standard symbols." }
  ]
},

// ------------------------------------------------------------
{
  id: "transformers",
  title: "Transformers, Delta/Wye, CT & PT",
  navLabel: "TRANSFORMERS",
  symbol: "transformer",
  steps: [
    { type:"lesson", title:"The basic idea",
      body:`A power transformer has two (or more) windings sharing a magnetic core. Changing current in the primary winding induces a voltage in the secondary winding, scaled by the <b>turns ratio</b>. More turns on the secondary than the primary steps voltage up; fewer turns steps it down. No moving parts, no chemical process &mdash; it's pure electromagnetic induction, which is why transformers are so reliable and long-lived.` },

    { type:"lesson", title:"Delta (&Delta;) windings",
      body:`In a delta connection, windings form a closed triangle &mdash; there's no neutral point. Line voltage equals phase voltage. Delta is common on the high side (transmission-facing side) of transformers. A key practical fact: a delta winding traps circulating <b>3rd-harmonic</b> current inside the triangle instead of letting it flow onto the line &mdash; this is a real reason Dy transformers are so common, tying directly into power quality.` },

    { type:"quiz", q:"What's true of a delta-connected winding?",
      options:[
        "It has a neutral point you can ground",
        "Line voltage equals phase voltage, and there's no neutral",
        "It always produces 480V regardless of turns ratio",
        "It cannot be used on the high side of a transformer"
      ], correct:1,
      explain:"Delta windings form a closed loop with no neutral point, so line-to-line voltage equals the voltage across each winding (phase voltage)." },

    { type:"lesson", title:"Wye (Y) windings",
      body:`In a wye connection, one end of each winding ties together at a common neutral point, the other ends go to the three lines. Line voltage = phase voltage &times; &radic;3. Because there's a neutral, wye windings can be grounded &mdash; this is what gives you both a phase-to-phase voltage and a phase-to-neutral voltage from the same transformer. Example: 12.47 kV / 7.2 kV wye means 12.47 kV line-to-line, 7.2 kV line-to-neutral. Distribution secondaries are almost always wye for exactly this reason &mdash; it's how you get 120V out of a system that's also carrying 208V or 480V.` },

    { type:"quiz", q:"A transformer is labeled 12.47 kV / 7.2 kV. What's the relationship between those two numbers?",
      options:[
        "They're unrelated ratings for two separate transformers",
        "7.2 kV is the line-to-neutral voltage of a wye system whose line-to-line voltage is 12.47 kV",
        "12.47 kV is a typo and should be 7.2 kV",
        "7.2 kV is always the fault current rating"
      ], correct:1,
      explain:"12.47 kV / √3 ≈ 7.2 kV — classic wye system labeling, giving you both the line-to-line and line-to-neutral voltage from a single transformer." },

    { type:"lesson", title:"CT vs. PT — the pair you must never mix up",
      body:`<b>Current Transformer (CT):</b> steps a large line current down to a standard low value (often 5A or 1A) for metering and relays. It's wired <b>in series</b> with the line. Golden safety rule: <u>never open a CT secondary while the primary is energized</u> &mdash; with no load on the secondary, all that primary current tries to force itself through, creating a dangerous high-voltage spike. Always short a CT secondary before disconnecting it.<br><br>
      <b>Potential Transformer (PT / VT):</b> steps a high line voltage down to a standard low voltage (typically 120V) for metering and relays. It's wired <b>in parallel</b> (across the line), like a voltmeter. Golden rule here is the opposite: <u>never short a PT secondary</u> &mdash; that would try to draw excessive current through it.` },

    { type:"quiz", q:"Which statement correctly distinguishes a CT from a PT?",
      options:[
        "A CT is wired in parallel and a PT in series",
        "A CT is wired in series (never open the secondary); a PT is wired in parallel (never short the secondary)",
        "Both are wired in series and behave identically",
        "A CT measures voltage and a PT measures current"
      ], correct:1,
      explain:"CT = series, current sensing, never open the secondary live. PT = parallel, voltage sensing, never short the secondary. Mixing these up is one of the most common — and dangerous — field mistakes." },

    { type:"sim", title:"Interactive: delta vs. wye", simId:"transformers",
      instructions:"Toggle between delta and wye winding configurations and see how the neutral point and voltage relationships change." }
  ]
},

// ------------------------------------------------------------
{
  id: "switches",
  title: "Switches & Switchgear",
  navLabel: "SWITCHES",
  symbol: "disconnect",
  steps: [
    { type:"lesson", title:"Not all switches are the same",
      body:`Field engineers use several different devices depending on what needs to be interrupted &mdash; normal load current, or a fault current thousands of amps higher. Picking the wrong one, or operating one out of sequence, is a real safety hazard.` },

    { type:"lesson", title:"Disconnect switch (isolator)",
      body:`A disconnect switch has <b>no arc-quenching capability</b> &mdash; it's built to open only when there is no load current flowing (zero or near-zero current). Its job is to create a <b>visible</b> air gap so crews can be certain a section of equipment is truly isolated before working on it. Opening a disconnect under load can throw a dangerous arc and destroy the switch.` },

    { type:"quiz", q:"When is it safe to open a disconnect switch?",
      options:["Any time, it's designed for load interruption", "Only after load current has already been interrupted (e.g., by a breaker)", "Only during a fault", "Disconnects can never be opened manually"], correct:1,
      explain:"Disconnects have no arc-quenching design — they're for isolation after current is already broken elsewhere (usually by a breaker), not for interrupting load." },

    { type:"lesson", title:"Circuit breaker",
      body:`A circuit breaker <b>can</b> interrupt both normal load current and much larger fault current, using an arc-quenching medium &mdash; SF6 gas, vacuum, oil, or air, depending on the design and voltage class. Breakers are usually operated automatically, tripped by a protective relay sensing an abnormal condition, though they can also be operated manually.` },

    { type:"lesson", title:"Load-break switch, recloser, and fuse",
      body:`<b>Load-break switch:</b> can interrupt normal load current (unlike a plain disconnect) but is not rated to clear a fault &mdash; a cheaper option where full breaker fault-interrupting capability isn't needed.<br>
      <b>Recloser:</b> a self-contained breaker-like device on distribution feeders that automatically opens on a fault, then re-closes to test if the fault (often a tree branch or lightning strike) has cleared &mdash; if the fault persists after a few tries, it locks open.<br>
      <b>Fuse:</b> a one-time sacrificial overcurrent device, common for protecting smaller taps and individual transformers.` },

    { type:"quiz", q:"What is the correct order of operations to safely isolate a piece of equipment for maintenance?",
      options:[
        "Open the disconnect first, then the breaker",
        "Open the breaker first (interrupts current), then open the disconnect (isolates)",
        "It doesn't matter which order",
        "Open both simultaneously"
      ], correct:1,
      explain:"Breaker opens first to interrupt current safely; only then is it safe to open the disconnect, since it has no current-interrupting capability. Reverse the order when re-energizing: close the disconnect first, then the breaker." },

    { type:"sim", title:"Interactive: pick the right device", simId:"switches",
      instructions:"Click each device to see what it can safely interrupt." }
  ]
},

// ------------------------------------------------------------
{
  id: "substations",
  title: "Understanding Substations",
  navLabel: "SUBSTATIONS",
  symbol: "bus",
  steps: [
    { type:"lesson", title:"What a substation does",
      body:`A substation is where voltage gets transformed (via power transformers) and where switching/protection decisions get made. It's the interchange between transmission and subtransmission, or subtransmission and distribution. Beyond transformers, a typical substation includes buses, breakers, disconnects, CTs/PTs, protective relays, a control house with SCADA equipment, a grounding grid, and often surge arresters and capacitor banks.` },

    { type:"lesson", title:"Bus arrangements — the reliability/cost tradeoff",
      body:`<b>Single bus:</b> simplest and cheapest, but one fault or one bus outage takes everything down &mdash; low reliability.<br>
      <b>Main-and-transfer bus:</b> adds a backup bus so a breaker can be taken out of service without dropping the circuit.<br>
      <b>Ring bus:</b> breakers form a ring; each circuit connects between two breakers, so a single breaker failure doesn't drop a circuit &mdash; good balance of cost and reliability.<br>
      <b>Breaker-and-a-half:</b> three breakers serve two circuits, giving very high reliability &mdash; common in EHV transmission substations where an outage is very costly.<br>
      <b>Double bus, double breaker:</b> the most reliable (and most expensive) &mdash; every circuit has two breakers to two independent buses.` },

    { type:"quiz", q:"Which bus arrangement has the lowest cost but also the lowest reliability?",
      options:["Breaker-and-a-half", "Double bus, double breaker", "Single bus", "Ring bus"], correct:2,
      explain:"A single bus is the simplest and cheapest design, but a fault on the bus itself (or maintenance on it) takes out everything connected to it — hence the lowest reliability." },

    { type:"lesson", title:"Why the arrangement matters on the job",
      body:`When you're reading a substation SLD, the bus arrangement tells you how much of the system goes dark if a given breaker trips or is taken out for maintenance. In a ring bus or breaker-and-a-half scheme, you can isolate a single breaker for maintenance and keep every circuit energized through the alternate path &mdash; that's the whole point of paying for the extra breakers.` },

    { type:"quiz", q:"Why would a utility choose a breaker-and-a-half scheme at a major EHV substation despite the extra cost?",
      options:[
        "It requires fewer breakers than a single bus",
        "It allows a breaker to be taken out for maintenance without dropping any circuit — high reliability where outages are very costly",
        "It's required by every substation regardless of voltage",
        "It eliminates the need for protective relays"
      ], correct:1,
      explain:"Breaker-and-a-half uses 3 breakers per 2 circuits so any single breaker can be removed from service without interrupting service to either circuit — valuable at high-voltage nodes where an outage affects a huge amount of the grid." },

    { type:"sim", title:"Interactive: bus arrangements", simId:"substations",
      instructions:"Switch between bus arrangement types and trip a breaker to see what stays energized." },

    { type:"quiz", q:"Which of these is NOT typically found in a substation?",
      options:["Power transformer", "Grounding grid", "Protective relays", "Residential water heater"], correct:3,
      explain:"Power transformers, grounding grids, and protective relays are core substation equipment. A water heater is a downstream utilization-voltage load, not substation equipment." }
  ]
},

// ------------------------------------------------------------
{
  id: "grounding",
  title: "Grounding",
  navLabel: "GROUNDING",
  symbol: "ground",
  steps: [
    { type:"lesson", title:"Why we ground power systems at all",
      body:`Grounding does three jobs at once: (1) protects personnel by limiting touch and step voltage during a fault, (2) protects equipment by giving fault current a controlled, low-impedance path so protection can detect and clear it fast, and (3) stabilizes system voltage by giving the system a fixed voltage reference to ground.` },

    { type:"lesson", title:"System grounding types",
      body:`<b>Solidly grounded:</b> the neutral is tied directly to ground with no added impedance. Most common in distribution systems. Produces high fault current on a ground fault, but that lets protection clear the fault fast.<br>
      <b>Resistance grounded:</b> the neutral connects to ground through a resistor, deliberately limiting fault current. Common in industrial plants, where limiting damage and arc-flash energy &mdash; and sometimes staying online through a single fault &mdash; matters more than instant clearing.<br>
      <b>Ungrounded:</b> no intentional ground reference. A single line-to-ground fault doesn't trip the system, which sounds good for uptime &mdash; but a second, simultaneous fault on a different phase becomes a serious phase-to-phase fault, and the first fault can be hard to detect at all.<br>
      <b>Resonant/reactance grounded (Petersen coil):</b> a tuned reactor cancels the fault current at the fault point, letting arcing ground faults self-extinguish &mdash; used in some systems to suppress arcing faults.` },

    { type:"quiz", q:"Why might an industrial plant intentionally choose resistance grounding over solid grounding?",
      options:[
        "Resistance grounding is cheaper to install in all cases",
        "It limits fault current and arc-flash energy, and can allow continued operation through a single fault",
        "It eliminates the need for any grounding grid",
        "It's required for all systems above 480V"
      ], correct:1,
      explain:"Limiting fault current reduces equipment damage and arc-flash hazard, and in some plant designs lets a process keep running through a single ground fault rather than tripping immediately — valuable where an unplanned shutdown is very costly." },

    { type:"lesson", title:"Equipment grounding vs. system grounding",
      body:`These are two different things people mix up. <b>System grounding</b> is about the neutral point of the source (transformer/generator). <b>Equipment grounding</b> is about bonding metal enclosures, frames, and structures back to ground so that if a live conductor faults to a metal case, the fault current has a low-impedance path to trip protection fast &mdash; instead of energizing the case and waiting for a person to complete the circuit.` },

    { type:"quiz", q:"A substation's buried copper grid tied to ground rods around the yard is primarily there to:",
      options:[
        "Improve the substation's appearance",
        "Control step and touch potential across the site during a fault, protecting personnel",
        "Increase the voltage of the system",
        "Replace the need for circuit breakers"
      ], correct:1,
      explain:"The grounding grid equalizes potential across the substation footprint so that during a fault, the voltage difference a person could experience between two points (step potential) or between equipment and ground (touch potential) stays within safe limits." },

    { type:"sim", title:"Interactive: grounding types under fault", simId:"grounding",
      instructions:"Simulate a ground fault under each grounding scheme and see how the current path differs." }
  ]
},

// ------------------------------------------------------------
{
  id: "relays",
  title: "Protective Relays",
  navLabel: "RELAYS",
  symbol: "relay",
  steps: [
    { type:"lesson", title:"The relay's job",
      body:`A protective relay watches current and voltage signals (fed to it at safe, scaled-down levels by CTs and PTs) and decides whether the system is in a normal or abnormal (faulted/overloaded) state. If it decides something's wrong, it sends a trip signal to a circuit breaker's trip coil, which opens the breaker and removes power from the faulted section.` },

    { type:"lesson", title:"Common relay types (ANSI device numbers)",
      body:`<b>50 / 51</b> &mdash; instantaneous / time overcurrent: trips on excess current, with 51 adding an intentional time delay for coordination.<br>
      <b>87</b> &mdash; differential: compares current entering vs. leaving a protected zone (like a transformer or bus); a mismatch means current is escaping somewhere it shouldn't &mdash; an internal fault.<br>
      <b>27 / 59</b> &mdash; under/overvoltage.<br>
      <b>21</b> &mdash; distance (impedance-based) relay, common on transmission lines.<br>
      <b>79</b> &mdash; reclosing relay, coordinates automatic reclose attempts.<br>
      <b>86</b> &mdash; lockout relay: requires manual reset, preventing automatic reclosing into a fault that hasn't actually cleared.` },

    { type:"quiz", q:"A relay compares the current flowing into a transformer against the current flowing out, and trips if they don't match. What type of relay is this?",
      options:["Overcurrent (50/51)", "Differential (87)", "Undervoltage (27)", "Reclosing (79)"], correct:1,
      explain:"That's the defining behavior of differential (87) protection — it assumes current in should equal current out of a protected zone, and any mismatch signals an internal fault." },

    { type:"lesson", title:"Coordination — why relays are staggered",
      body:`In a real feeder, you don't want a fault far downstream to trip a breaker way upstream and black out everyone in between. Relays are <b>coordinated</b>: the breaker closest to the fault is set to trip fastest, with upstream breakers set with a slightly longer time delay as backup, only tripping if the closer device fails to clear the fault. This selectivity is why you'll see overcurrent time-current curves staggered between devices on a feeder.` },

    { type:"quiz", q:"Why are protective relays on a feeder coordinated with staggered time delays rather than all set to trip instantly?",
      options:[
        "To make the system slower on purpose for no reason",
        "So the breaker closest to a fault trips first, minimizing the number of customers affected",
        "Because relays can only operate at one fixed speed",
        "Time delays are only used for undervoltage relays"
      ], correct:1,
      explain:"Coordination (selectivity) ensures the smallest possible section of the system is interrupted for any given fault — the nearest upstream device clears it, and devices further back only act as backup if it fails." },

    { type:"sim", title:"Interactive: relay trips a breaker", simId:"relays",
      instructions:"Simulate a fault and watch the CT feed the relay, and the relay trip the breaker." }
  ]
},

// ------------------------------------------------------------
{
  id: "power-quality",
  title: "Power Quality",
  navLabel: "POWER\nQUALITY",
  symbol: "wave",
  steps: [
    { type:"lesson", title:"What 'power quality' actually covers",
      body:`Power quality problems are deviations from a clean, steady 60 Hz sine wave at rated voltage. This connects directly to work you've already done &mdash; your VFD/EMI project at NexTier was fundamentally a power quality problem: switching noise from a variable frequency drive interfering with a nearby signal.` },

    { type:"lesson", title:"Sags, swells, and transients",
      body:`<b>Voltage sag:</b> a brief drop in voltage, commonly caused by a large motor starting nearby or a fault elsewhere on the system before it clears.<br>
      <b>Voltage swell:</b> a brief rise in voltage, often from a large load suddenly dropping off, or a single-line-to-ground fault on an ungrounded system raising voltage on the healthy phases.<br>
      <b>Transient/spike:</b> a very fast, short voltage disturbance &mdash; lightning strikes and switching operations are classic causes.` },

    { type:"quiz", q:"A large motor starting nearby causes nearby equipment to briefly experience a voltage dip. What is this called?",
      options:["A voltage swell", "A voltage sag", "A harmonic", "A power factor event"], correct:1,
      explain:"A sag is a brief voltage drop — motor starting inrush current is one of the most common real-world causes." },

    { type:"lesson", title:"Harmonics",
      body:`Nonlinear loads &mdash; VFDs, switch-mode power supplies, LED drivers &mdash; don't draw current in a clean sinusoidal shape, which distorts the voltage waveform for everything sharing that circuit. This distortion is measured as <b>THD (Total Harmonic Distortion)</b>, with IEEE 519 giving recommended limits. Delta-wye transformers actually help here: the delta winding traps circulating 3rd-harmonic current instead of letting it propagate onto the line &mdash; a direct callback to the transformer topic.` },

    { type:"quiz", q:"Which of these is a classic source of harmonic distortion on a power system?",
      options:["A resistive heating element", "A variable frequency drive (VFD)", "An incandescent light bulb", "A disconnect switch"], correct:1,
      explain:"VFDs switch current in non-sinusoidal pulses to control motor speed, injecting harmonic frequencies onto the line — exactly the mechanism behind your EMI mitigation project." },

    { type:"lesson", title:"Power factor",
      body:`Power factor is the ratio of real power (the power actually doing work, in kW) to apparent power (kVA, what the system actually has to supply). A low power factor means more current has to flow for the same amount of useful work &mdash; utilities often penalize industrial customers with poor power factor because it wastes system capacity. Capacitor banks are commonly added to correct power factor, though engineers have to be careful they don't create a resonance with existing harmonics on the system.` },

    { type:"sim", title:"Interactive: waveform viewer", simId:"power-quality",
      instructions:"Toggle between a clean sine wave, a harmonic-distorted wave, a sag, and a swell." }
  ]
},

// ------------------------------------------------------------
{
  id: "scada",
  title: "SCADA",
  navLabel: "SCADA",
  symbol: "scada",
  steps: [
    { type:"lesson", title:"What SCADA is for",
      body:`SCADA &mdash; Supervisory Control And Data Acquisition &mdash; is how utilities and energy managers monitor and control substations and grid assets remotely, without needing a person physically at every site. It's the layer that turns a one-line diagram into a live, real-time picture on a screen.` },

    { type:"lesson", title:"The core pieces",
      body:`<b>RTU (Remote Terminal Unit):</b> sits at the substation, reads real sensors (breaker status, voltage, current) and can execute remote commands (open/close a breaker) sent from the control center.<br>
      <b>Master station / control center:</b> where operators view HMI (human-machine interface) screens showing live one-line diagrams overlaid with real data.<br>
      <b>Communication links:</b> fiber, radio, or cellular connections carrying data between RTUs and the master station.<br>
      <b>Historian:</b> logs data over time for trending, analysis, and troubleshooting.` },

    { type:"quiz", q:"What is the role of an RTU in a SCADA system?",
      options:[
        "It's the operator's screen at the control center",
        "It sits at the substation, reads real equipment status, and executes remote commands",
        "It's a type of protective relay",
        "It stores historical data only"
      ], correct:1,
      explain:"The RTU is the field-side device — it's the bridge between physical equipment (breakers, sensors) at the substation and the remote control center." },

    { type:"lesson", title:"Point types you'll hear about",
      body:`<b>Status points:</b> discrete on/off data &mdash; is the breaker open or closed.<br>
      <b>Analog points:</b> continuous measured values &mdash; voltage, current, MW, MVAR.<br>
      <b>Control points:</b> commands sent from the control center back down to the field &mdash; remote open/close.<br>
      This directly connects to what you'll be working with day to day: platforms like the ones Priority Power uses for client energy asset monitoring are essentially SCADA/dashboard layers presenting exactly this kind of live status, analog, and historical data.` },

    { type:"quiz", q:"A dashboard shows a live MW reading updating every few seconds from a substation. What kind of SCADA point is that?",
      options:["A status point", "An analog point", "A control point", "A historian"], correct:1,
      explain:"A continuously varying measured value like MW is an analog point — as opposed to a simple open/closed status point or a remote command (control point)." },

    { type:"sim", title:"Interactive: SCADA control room", simId:"scada",
      instructions:"Send a remote open/close command to a substation breaker and watch the status and one-line update live." },

    { type:"quiz", q:"Why does SCADA matter for someone doing energy asset management and advisory work, rather than just field operations?",
      options:[
        "It doesn't — SCADA is only relevant to field crews",
        "It's the data source behind monitoring dashboards and reporting used for client-facing energy management decisions",
        "SCADA only applies to residential customers",
        "It replaces the need for any engineering analysis"
      ], correct:1,
      explain:"Energy management and advisory platforms are built on top of the same live status/analog data that SCADA collects — understanding SCADA fundamentals helps you understand what's actually behind the dashboards you'll be using and interpreting." }
  ]
}

];
