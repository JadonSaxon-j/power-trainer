// ============================================================
// SIMULATIONS — one interactive SVG/HTML build per topic
// Each function receives a container <div> and renders into it.
// ============================================================

const PAL = {
  maroon: "#E0954F", maroonDark:"#0E1A2E", gold:"#E0A93D",
  green:"#34D399", greenGlow:"#5EF0BB", red:"#F0605A",
  idle:"#35496B", ink:"#DCE6F5", paper:"#101E33", cyan:"#4FD1C5", cyanGlow:"#7FEAE0"
};

// Brief "snap" pulse feedback when a component is toggled — call right after re-drawing
function snapPulse(el) {
  if (!el) return;
  el.classList.remove("snap-anim");
  void el.offsetWidth; // restart animation
  el.classList.add("snap-anim");
}

function svgEl(tag, attrs, parent) {
  const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
  for (const k in attrs) el.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(el);
  return el;
}
function newSVG(w, h) {
  return svgEl("svg", { viewBox:`0 0 ${w} ${h}`, width:"100%", height:h, style:"max-width:100%;display:block;margin:0 auto;" });
}
function infoTag(container, text) {
  let tag = container.querySelector(".sim-info-tag");
  if (!tag) {
    tag = document.createElement("div");
    tag.className = "info-tag sim-info-tag";
    container.appendChild(tag);
  }
  tag.textContent = text;
}

function renderSim(simId, container) {
  container.innerHTML = "";
  const fn = SIM_RENDERERS[simId];
  if (fn) fn(container);
  else container.textContent = "Simulation not found.";
}

const SIM_RENDERERS = {};

// ---------------------------------------------------------------
// 1. VOLTAGE LEVELS — clickable chain
// ---------------------------------------------------------------
SIM_RENDERERS["voltage-levels"] = function(container) {
  const stages = [
    { name:"Generation", v:"13.8–24 kV", d:"Voltage at the generator terminals, right where power is produced." },
    { name:"Transmission", v:"138–345 kV (up to 765 kV)", d:"Bulk power moved long distances at very high voltage to minimize losses." },
    { name:"Subtransmission", v:"69–138 kV", d:"Steps power down from transmission into local regions." },
    { name:"Distribution Primary", v:"12.47 / 13.8 kV", d:"What runs down utility poles through neighborhoods and industrial areas." },
    { name:"Utilization", v:"480Y/277V or 120/240V", d:"Final voltage delivered to motors, equipment, and household outlets." }
  ];
  const svg = newSVG(900, 210);
  const boxW = 160, gap = 24, startX = 20, y = 70, boxH = 90;
  stages.forEach((s, i) => {
    const x = startX + i*(boxW+gap);
    if (i > 0) {
      svgEl("line", { x1:x-gap, y1:y+boxH/2, x2:x, y2:y+boxH/2, stroke:PAL.idle, "stroke-width":4 }, svg);
      svgEl("polygon", { points:`${x-8},${y+boxH/2-6} ${x},${y+boxH/2} ${x-8},${y+boxH/2+6}`, fill:PAL.idle }, svg);
    }
    const g = svgEl("g", { class:"node-btn", tabindex:"0", role:"button" }, svg);
    const rect = svgEl("rect", { x, y, width:boxW, height:boxH, rx:4, fill:PAL.paper, stroke:PAL.maroon, "stroke-width":2, class:"node-shape" }, g);
    svgEl("text", { x:x+boxW/2, y:y+30, class:"node-label", "font-weight":"600" }, g).textContent = s.name;
    svgEl("text", { x:x+boxW/2, y:y+55, class:"node-sub", fill:PAL.gold }, g).textContent = s.v;
    g.style.cursor = "pointer";
    g.addEventListener("click", () => infoTag(container, `${s.name} — ${s.v}: ${s.d}`));
    g.addEventListener("keypress", e => { if (e.key === "Enter") g.dispatchEvent(new Event("click")); });
  });
  container.appendChild(svg);
  infoTag(container, "Click a stage to see its typical voltage and role.");
};

// ---------------------------------------------------------------
// 2. SINGLE LINE DIAGRAM — breakers toggle energization
// ---------------------------------------------------------------
SIM_RENDERERS["sld"] = function(container) {
  const state = { main:true, brA:true, brB:true };
  let lastToggled = null;

  function draw() {
    container.querySelector("svg")?.remove();
    const svg = newSVG(760, 320);

    const mainEnergized = state.main;
    const aEnergized = mainEnergized && state.brA;
    const bEnergized = mainEnergized && state.brB;

    function wire(x1,y1,x2,y2,on) {
      svgEl("line", { x1,y1,x2,y2, stroke: on ? PAL.greenGlow : PAL.idle, "stroke-width": on ? 4:3, style: on ? "filter:drop-shadow(0 0 3px "+PAL.greenGlow+")":"" }, svg);
    }
    function breaker(x,y,id,on,label) {
      const g = svgEl("g", { class:"node-btn" }, svg);
      svgEl("rect", { x:x-14, y:y-14, width:28, height:28, fill: on ? PAL.paper : "#0a1220", stroke:PAL.maroon, "stroke-width":2.5 }, g);
      svgEl("line", { x1:x-14,y1: on? y+14 : y-14, x2:x+14, y2: on? y-14 : y+14, stroke:PAL.maroon, "stroke-width":2.5 }, g);
      svgEl("text", { x, y:y+34, class:"node-sub" }, g).textContent = label + (on ? " (CLOSED)" : " (OPEN)");
      g.style.cursor = "pointer";
      if (lastToggled === id) { g.classList.add("snap-anim"); lastToggled = null; }
      g.addEventListener("click", () => { state[id] = !state[id]; lastToggled = id; draw(); infoTag(container, `${label} ${state[id] ? "closed — current can flow through it" : "opened — this breaker now blocks current downstream"}.`); });
    }
    function xfmr(x,y,on){
      svgEl("circle",{cx:x-8,cy:y,r:14,fill:"none",stroke: on?PAL.green:PAL.idle,"stroke-width":2.5},svg);
      svgEl("circle",{cx:x+8,cy:y,r:14,fill:"none",stroke: on?PAL.green:PAL.idle,"stroke-width":2.5},svg);
    }
    function load(x,y,on,label){
      svgEl("polygon",{points:`${x-10},${y-14} ${x+10},${y-14} ${x},${y+10}`, fill: on?PAL.gold:PAL.idle, stroke:PAL.ink,"stroke-width":1},svg);
      svgEl("text",{x, y:y+30, class:"node-sub"},svg).textContent = label;
    }

    // Source
    svgEl("rect",{x:20,y:140,width:60,height:40, fill:PAL.paper, stroke:PAL.ink,"stroke-width":2},svg);
    svgEl("text",{x:50,y:165,class:"node-sub"},svg).textContent="SOURCE";
    wire(80,160,150,160,mainEnergized);
    breaker(170,160,"main",state.main,"CB-Main (52M)");
    wire(190,160,260,160,mainEnergized);
    // Bus
    svgEl("line",{x1:260,y1:100,x2:260,y2:220, stroke: mainEnergized?PAL.greenGlow:PAL.idle,"stroke-width":6},svg);
    svgEl("text",{x:260,y:90,class:"node-sub"},svg).textContent="BUS";

    // Branch A -> transformer -> load
    wire(260,120,340,120, aEnergized);
    breaker(360,120,"brA",state.brA,"CB-A (52A)");
    wire(380,120,440,120, aEnergized);
    xfmr(460,120, aEnergized);
    wire(482,120,560,120, aEnergized);
    load(600,120, aEnergized, "Load A (fed via xfmr)");

    // Branch B -> load directly
    wire(260,220,340,220, bEnergized);
    breaker(360,220,"brB",state.brB,"CB-B (52B)");
    wire(380,220,560,220, bEnergized);
    load(600,220, bEnergized, "Load B (direct feeder)");

    container.insertBefore(svg, container.firstChild);
  }
  draw();
  infoTag(container, "Click a breaker symbol to open/close it and see what stays energized.");
};

// ---------------------------------------------------------------
// 3. TRANSFORMERS — delta vs wye toggle
// ---------------------------------------------------------------
SIM_RENDERERS["transformers"] = function(container) {
  const state = { mode:"wye", lineV:12470 };
  let first = true;

  function draw() {
    container.querySelector(".xfmr-wrap")?.remove();
    const wrap = document.createElement("div");
    wrap.className = "xfmr-wrap" + (first ? "" : " snap-anim");
    first = false;

    const controls = document.createElement("div");
    controls.className = "sim-controls";
    ["delta","wye"].forEach(m => {
      const b = document.createElement("button");
      b.textContent = m === "delta" ? "Delta (Δ)" : "Wye (Y)";
      if (state.mode === m) b.classList.add("active");
      b.addEventListener("click", () => { state.mode = m; draw(); });
      controls.appendChild(b);
    });
    wrap.appendChild(controls);

    const svg = newSVG(420, 260);
    const cx = 210, cy = 120, r = 80;
    if (state.mode === "delta") {
      const p1 = [cx, cy-r], p2 = [cx-r*0.87, cy+r*0.5], p3 = [cx+r*0.87, cy+r*0.5];
      svgEl("line",{x1:p1[0],y1:p1[1],x2:p2[0],y2:p2[1],stroke:PAL.maroon,"stroke-width":3},svg);
      svgEl("line",{x1:p2[0],y1:p2[1],x2:p3[0],y2:p3[1],stroke:PAL.maroon,"stroke-width":3},svg);
      svgEl("line",{x1:p3[0],y1:p3[1],x2:p1[0],y2:p1[1],stroke:PAL.maroon,"stroke-width":3},svg);
      [p1,p2,p3].forEach(p => svgEl("circle",{cx:p[0],cy:p[1],r:5,fill:PAL.gold},svg));
      svgEl("text",{x:cx,y:230,class:"node-sub"},svg).textContent = "No neutral point — line V = phase V";
      svgEl("text",{x:cx,y:20,class:"node-label","font-weight":"600"},svg).textContent = `Line-to-line: ${state.lineV.toLocaleString()} V`;
    } else {
      const p1 = [cx, cy-r], p2 = [cx-r*0.87, cy+r*0.5], p3 = [cx+r*0.87, cy+r*0.5];
      [p1,p2,p3].forEach(p => {
        svgEl("line",{x1:cx,y1:cy,x2:p[0],y2:p[1],stroke:PAL.maroon,"stroke-width":3},svg);
        svgEl("circle",{cx:p[0],cy:p[1],r:5,fill:PAL.gold},svg);
      });
      svgEl("circle",{cx,cy,r:6,fill:PAL.green},svg);
      svgEl("text",{x:cx+14,y:cy-6,class:"node-sub"},svg).textContent = "Neutral (groundable)";
      const phaseV = Math.round(state.lineV/1.732);
      svgEl("text",{x:cx,y:230,class:"node-sub"},svg).textContent = `Neutral present — line V = phase V × √3`;
      svgEl("text",{x:cx,y:20,class:"node-label","font-weight":"600"},svg).textContent = `Line: ${state.lineV.toLocaleString()} V   |   Phase (to neutral): ${phaseV.toLocaleString()} V`;
    }
    wrap.appendChild(svg);
    container.insertBefore(wrap, container.firstChild);
  }
  draw();
  infoTag(container, "Toggle Delta / Wye. Notice: only wye has a neutral point you could ground.");
};

// ---------------------------------------------------------------
// 4. SWITCHES — click device for capability
// ---------------------------------------------------------------
SIM_RENDERERS["switches"] = function(container) {
  const devices = [
    { name:"Disconnect Switch", cap:"Isolation only — NO load-break capability. Only open with zero current flowing.", color: PAL.idle },
    { name:"Circuit Breaker", cap:"Interrupts both normal load current AND fault current via an arc-quenching medium (SF6/vacuum/oil/air).", color: PAL.maroon },
    { name:"Load-Break Switch", cap:"Can interrupt normal load current, but NOT rated to clear a fault.", color: PAL.gold },
    { name:"Recloser", cap:"Automatically opens on fault, then re-closes to test if a temporary fault has cleared; locks out after repeated failures.", color: PAL.green }
  ];
  const row = document.createElement("div");
  row.className = "sim-controls";
  devices.forEach(d => {
    const b = document.createElement("button");
    b.textContent = d.name;
    b.addEventListener("click", () => infoTag(container, `${d.name}: ${d.cap}`));
    row.appendChild(b);
  });
  container.appendChild(row);

  const warnBtn = document.createElement("button");
  warnBtn.className = "btn secondary";
  warnBtn.style.marginTop = "12px";
  warnBtn.textContent = "⚠ Simulate: open a disconnect UNDER LOAD";
  warnBtn.addEventListener("click", () => infoTag(container, "DANGEROUS: opening a disconnect under load throws a sustained arc it cannot quench — it can destroy the switch and injure nearby personnel. Always interrupt current with a breaker FIRST."));
  container.appendChild(warnBtn);
  infoTag(container, "Click a device to see what it's rated to interrupt.");
};

// ---------------------------------------------------------------
// 5. SUBSTATIONS — bus arrangements
// ---------------------------------------------------------------
SIM_RENDERERS["substations"] = function(container) {
  const state = { type:"single", tripped:false };
  const types = [
    { id:"single", label:"Single Bus" },
    { id:"ring", label:"Ring Bus" },
    { id:"bah", label:"Breaker-and-a-Half" }
  ];

  let subFirst = true;
  function draw() {
    container.querySelector(".sub-wrap")?.remove();
    const wrap = document.createElement("div"); wrap.className = "sub-wrap" + (subFirst ? "" : " snap-anim"); subFirst = false;
    const controls = document.createElement("div"); controls.className = "sim-controls";
    types.forEach(t => {
      const b = document.createElement("button");
      b.textContent = t.label;
      if (state.type === t.id) b.classList.add("active");
      b.addEventListener("click", () => { state.type = t.id; state.tripped=false; draw(); });
      controls.appendChild(b);
    });
    const tripBtn = document.createElement("button");
    tripBtn.textContent = state.tripped ? "Reset breaker" : "Trip a breaker";
    tripBtn.addEventListener("click", () => { state.tripped = !state.tripped; draw(); });
    controls.appendChild(tripBtn);
    wrap.appendChild(controls);

    const svg = newSVG(700, 220);
    if (state.type === "single") {
      svgEl("line",{x1:100,y1:100,x2:600,y2:100,stroke:state.tripped?PAL.idle:PAL.greenGlow,"stroke-width":6},svg);
      svgEl("text",{x:350,y:80,class:"node-sub"},svg).textContent="Single Bus";
      [180,350,520].forEach((x,i)=>{
        svgEl("line",{x1:x,y1:100,x2:x,y2:170,stroke:state.tripped?PAL.idle:PAL.greenGlow,"stroke-width":3},svg);
        svgEl("rect",{x:x-10,y:170,width:20,height:20,fill:PAL.paper,stroke:PAL.maroon,"stroke-width":2},svg);
        svgEl("text",{x,y:210,class:"node-sub"},svg).textContent="Ckt "+(i+1);
      });
      infoTag(container, state.tripped ? "One bus fault/outage = ENTIRE bus and all circuits go dark. This is the reliability tradeoff of a single bus." : "All circuits share one bus — click 'Trip a breaker' to see what a bus fault does here.");
    } else if (state.type === "ring") {
      const cx=350, cy=110, r=90;
      const pts = [0,90,180,270].map(a => [cx + r*Math.cos(a*Math.PI/180), cy + r*Math.sin(a*Math.PI/180)]);
      for (let i=0;i<4;i++){
        const p1=pts[i], p2=pts[(i+1)%4];
        const isTripped = state.tripped && i===0;
        svgEl("line",{x1:p1[0],y1:p1[1],x2:p2[0],y2:p2[1],stroke:isTripped?PAL.idle:PAL.greenGlow,"stroke-width":4},svg);
      }
      pts.forEach((p,i)=>{
        svgEl("rect",{x:p[0]-10,y:p[1]-10,width:20,height:20,fill:PAL.paper,stroke:PAL.maroon,"stroke-width":2},svg);
        svgEl("text",{x:p[0],y:p[1]-18,class:"node-sub"},svg).textContent="CB"+(i+1);
        svgEl("line",{x1:p[0],y1:p[1],x2:p[0]+(p[0]>cx?40:-40),y2:p[1],stroke:PAL.green,"stroke-width":3},svg);
        svgEl("text",{x:p[0]+(p[0]>cx?60:-60),y:p[1]+4,class:"node-sub"},svg).textContent="Ckt"+(i+1);
      });
      infoTag(container, state.tripped ? "Even with CB1 open, power reroutes the other way around the ring — every circuit stays fed. That's the whole point of a ring bus." : "Circuits alternate with breakers around a ring — click 'Trip a breaker' to see the reroute.");
    } else {
      svgEl("text",{x:350,y:30,class:"node-sub"},svg).textContent="3 breakers serve 2 circuits (simplified)";
      const y1=70,y2=140;
      svgEl("line",{x1:150,y1,x2:550,y2:y1,stroke:PAL.greenGlow,"stroke-width":5},svg);
      svgEl("line",{x1:150,y1:y2,x2:550,y2:y2,stroke:PAL.greenGlow,"stroke-width":5},svg);
      [200,350,500].forEach((x,i)=>{
        const isTripped = state.tripped && i===1;
        svgEl("line",{x1:x,y1:y1,x2:x,y2:y2,stroke:isTripped?PAL.idle:PAL.greenGlow,"stroke-width":3},svg);
        svgEl("rect",{x:x-10,y:(y1+y2)/2-10,width:20,height:20,fill:PAL.paper,stroke:PAL.maroon,"stroke-width":2},svg);
      });
      svgEl("line",{x1:200,y1:(y1+y2)/2,x2:80,y2:(y1+y2)/2-30,stroke:PAL.green,"stroke-width":3},svg);
      svgEl("text",{x:60,y:(y1+y2)/2-40,class:"node-sub"},svg).textContent="Ckt 1";
      svgEl("line",{x1:500,y1:(y1+y2)/2,x2:620,y2:(y1+y2)/2+30,stroke:PAL.green,"stroke-width":3},svg);
      svgEl("text",{x:640,y:(y1+y2)/2+50,class:"node-sub"},svg).textContent="Ckt 2";
      infoTag(container, state.tripped ? "The middle breaker being out doesn't drop either circuit — each circuit still has a path through its own dedicated breaker plus the two buses." : "Two circuits, three breakers, two buses — click 'Trip a breaker' to test the middle (shared) breaker.");
    }
    wrap.appendChild(svg);
    container.insertBefore(wrap, container.firstChild);
  }
  draw();
};

// ---------------------------------------------------------------
// 6. GROUNDING — fault current path by scheme
// ---------------------------------------------------------------
SIM_RENDERERS["grounding"] = function(container) {
  const state = { type:"solid", fault:false };
  const types = [
    { id:"solid", label:"Solidly Grounded" },
    { id:"resistance", label:"Resistance Grounded" },
    { id:"ungrounded", label:"Ungrounded" }
  ];
  const messages = {
    solid: "High fault current flows straight to ground — protection sees it clearly and clears the fault FAST.",
    resistance: "The resistor limits fault current — less damage/arc-flash energy, but the fault takes a bit longer to detect and clear.",
    ungrounded: "Very little current flows — the system may not even trip on this first fault. Sounds convenient, but the fault is now hard to detect, and a SECOND fault on another phase becomes a dangerous phase-to-phase event."
  };

  let gndFirst = true;
  function draw() {
    container.querySelector(".gnd-wrap")?.remove();
    const wrap = document.createElement("div"); wrap.className = "gnd-wrap" + (gndFirst ? "" : " snap-anim"); gndFirst = false;
    const controls = document.createElement("div"); controls.className = "sim-controls";
    types.forEach(t => {
      const b = document.createElement("button");
      b.textContent = t.label;
      if (state.type === t.id) b.classList.add("active");
      b.addEventListener("click", () => { state.type = t.id; state.fault=false; draw(); });
      controls.appendChild(b);
    });
    const faultBtn = document.createElement("button");
    faultBtn.textContent = state.fault ? "Clear fault" : "Simulate ground fault";
    faultBtn.addEventListener("click", () => { state.fault = !state.fault; draw(); });
    controls.appendChild(faultBtn);
    wrap.appendChild(controls);

    const svg = newSVG(500, 220);
    svgEl("rect",{x:200,y:30,width:100,height:60,fill:PAL.paper,stroke:PAL.ink,"stroke-width":2},svg);
    svgEl("text",{x:250,y:65,class:"node-sub"},svg).textContent="Xfmr Neutral";
    if (state.type === "resistance") {
      svgEl("rect",{x:235,y:100,width:30,height:20,fill:PAL.paper,stroke:PAL.gold,"stroke-width":2},svg);
      svgEl("text",{x:250,y:135,class:"node-sub"},svg).textContent="Resistor";
    }
    if (state.type !== "ungrounded") {
      svgEl("line",{x1:250,y1:90,x2:250,y2:state.type==="resistance"?100:170, stroke:PAL.ink,"stroke-width":3},svg);
      if(state.type==="resistance") svgEl("line",{x1:250,y1:120,x2:250,y2:170,stroke:PAL.ink,"stroke-width":3},svg);
      svgEl("line",{x1:230,y1:170,x2:270,y2:170,stroke:PAL.ink,"stroke-width":4},svg);
      svgEl("line",{x1:236,y1:180,x2:264,y2:180,stroke:PAL.ink,"stroke-width":3},svg);
      svgEl("line",{x1:242,y1:190,x2:258,y2:190,stroke:PAL.ink,"stroke-width":2},svg);
    } else {
      svgEl("text",{x:250,y:150,class:"node-sub"},svg).textContent="(no ground connection)";
    }
    if (state.fault) {
      const fcolor = state.type === "solid" ? PAL.red : (state.type === "resistance" ? PAL.gold : PAL.idle);
      const fwidth = state.type === "solid" ? 6 : (state.type === "resistance" ? 4 : 2);
      svgEl("line",{x1:250,y1:90,x2:400,y2:90,stroke:fcolor,"stroke-width":fwidth},svg);
      svgEl("circle",{cx:410,cy:90,r:10,fill:fcolor},svg);
      svgEl("text",{x:410,y:70,class:"node-sub"},svg).textContent="FAULT";
    }
    wrap.appendChild(svg);
    container.insertBefore(wrap, container.firstChild);
  }
  draw();
  infoTag(container, "Choose a grounding scheme, then simulate a fault to see how the response differs.");
  container.addEventListener("click", () => {
    setTimeout(() => infoTag(container, state.fault ? messages[state.type] : "Choose a grounding scheme, then simulate a fault to see how the response differs."), 0);
  });
};

// ---------------------------------------------------------------
// 7. RELAYS — CT feeds relay, relay trips breaker
// ---------------------------------------------------------------
SIM_RENDERERS["relays"] = function(container) {
  const state = { fault:false, tripped:false };

  function draw() {
    container.querySelector(".relay-wrap")?.remove();
    const wrap = document.createElement("div"); wrap.className = "relay-wrap";
    const controls = document.createElement("div"); controls.className = "sim-controls";
    const btn = document.createElement("button");
    btn.textContent = state.fault ? "Clear fault / reset" : "Simulate a fault";
    btn.addEventListener("click", () => {
      if (!state.fault) {
        state.fault = true; state.tripped = false; draw();
        infoTag(container, "CT senses a current spike and feeds it to the relay...");
        setTimeout(() => { state.tripped = true; draw(); infoTag(container, "Relay logic exceeded its threshold — trip signal sent to the breaker's trip coil. Breaker OPENS, isolating the fault."); }, 900);
      } else {
        state.fault = false; state.tripped = false; draw();
        infoTag(container, "System reset to normal — breaker closed, no fault present.");
      }
    });
    controls.appendChild(btn);
    wrap.appendChild(controls);

    const svg = newSVG(650, 220);
    const lineOn = !state.tripped;
    svgEl("line",{x1:20,y1:60,x2:620,y2:60, stroke: lineOn ? PAL.greenGlow : PAL.idle, "stroke-width":4},svg);
    // CT
    svgEl("circle",{cx:200,cy:60,r:16,fill:"none",stroke: state.fault? PAL.red : PAL.maroon,"stroke-width":3},svg);
    svgEl("text",{x:200,y:100,class:"node-sub"},svg).textContent="CT";
    // breaker
    const bx=380;
    svgEl("rect",{x:bx-14,y:46,width:28,height:28,fill:PAL.paper,stroke:PAL.maroon,"stroke-width":2.5},svg);
    svgEl("line",{x1:bx-14,y1: state.tripped? 74:46, x2:bx+14, y2: state.tripped? 46:74, stroke:PAL.maroon,"stroke-width":2.5},svg);
    svgEl("text",{x:bx,y:100,class:"node-sub"},svg).textContent = state.tripped ? "Breaker (OPEN)" : "Breaker (closed)";
    // relay
    svgEl("rect",{x:170,y:130,width:70,height:44,fill:PAL.paper,stroke:PAL.gold,"stroke-width":2.5},svg);
    svgEl("text",{x:205,y:156,class:"node-sub"},svg).textContent="Relay (51)";
    svgEl("line",{x1:200,y1:76,x2:205,y2:130, stroke: state.fault?PAL.red:PAL.idle, "stroke-width":2, "stroke-dasharray":"4 3"},svg);
    svgEl("line",{x1:240,y1:150,x2:bx,y2:150, stroke: state.tripped?PAL.red:PAL.idle, "stroke-width":2, "stroke-dasharray":"4 3"},svg);
    svgEl("line",{x1:bx,y1:150,x2:bx,y2:74, stroke: state.tripped?PAL.red:PAL.idle, "stroke-width":2, "stroke-dasharray":"4 3"},svg);
    svgEl("text",{x:205,y:190,class:"node-sub"},svg).textContent = "CT signal";
    svgEl("text",{x:bx,y:190,class:"node-sub"},svg).textContent = "Trip signal";
    // fault point
    if (state.fault) {
      svgEl("circle",{cx:500,cy:60,r:10,fill:PAL.red},svg);
      svgEl("text",{x:500,y:40,class:"node-sub"},svg).textContent="FAULT";
    }
    wrap.appendChild(svg);
    container.insertBefore(wrap, container.firstChild);
  }
  draw();
  infoTag(container, "Click 'Simulate a fault' to watch the CT → relay → breaker trip sequence.");
};

// ---------------------------------------------------------------
// 8. POWER QUALITY — waveform viewer
// ---------------------------------------------------------------
SIM_RENDERERS["power-quality"] = function(container) {
  const state = { mode:"clean" };
  const modes = [
    { id:"clean", label:"Clean sine" },
    { id:"harmonic", label:"Harmonics" },
    { id:"sag", label:"Sag" },
    { id:"swell", label:"Swell" }
  ];
  const messages = {
    clean: "A clean 60Hz sine wave at rated voltage — the ideal.",
    harmonic: "Distorted by higher-frequency content riding on the fundamental — typically from nonlinear loads like VFDs or switch-mode power supplies.",
    sag: "A brief dip in voltage magnitude — commonly from motor starting inrush or a nearby fault before it clears.",
    swell: "A brief rise in voltage magnitude — often from a large load dropping off, or a ground fault on an ungrounded system."
  };

  let pqFirst = true;
  function draw() {
    container.querySelector(".pq-wrap")?.remove();
    const wrap = document.createElement("div"); wrap.className="pq-wrap" + (pqFirst ? "" : " snap-anim"); pqFirst = false;
    const controls = document.createElement("div"); controls.className="sim-controls";
    modes.forEach(m => {
      const b = document.createElement("button");
      b.textContent = m.label;
      if (state.mode === m.id) b.classList.add("active");
      b.addEventListener("click", () => { state.mode = m.id; draw(); infoTag(container, messages[m.id]); });
      controls.appendChild(b);
    });
    wrap.appendChild(controls);

    const w=640,h=200, mid=h/2;
    const svg = newSVG(w,h);
    svgEl("line",{x1:0,y1:mid,x2:w,y2:mid,stroke:PAL.idle,"stroke-width":1},svg);
    let d = "M0,"+mid;
    for (let x=0; x<=w; x+=3) {
      const t = x/w * 4 * Math.PI;
      let amp = 70;
      let y;
      if (state.mode === "clean") { y = mid - amp*Math.sin(t); }
      else if (state.mode === "harmonic") { y = mid - amp*(Math.sin(t) + 0.28*Math.sin(3*t) + 0.15*Math.sin(5*t)); }
      else if (state.mode === "sag") { const inDip = x > w*0.35 && x < w*0.65; y = mid - amp*(inDip?0.45:1)*Math.sin(t); }
      else { const inSwell = x > w*0.35 && x < w*0.65; y = mid - amp*(inSwell?1.5:1)*Math.sin(t); }
      d += ` L${x},${y}`;
    }
    const waveColor = state.mode === "clean" ? PAL.cyanGlow : state.mode === "harmonic" ? PAL.gold : state.mode === "sag" ? PAL.idle : PAL.red;
    svgEl("path",{d, fill:"none", stroke:waveColor, "stroke-width":2.5, style:`filter:drop-shadow(0 0 4px ${waveColor})`},svg);
    wrap.appendChild(svg);
    container.insertBefore(wrap, container.firstChild);
  }
  draw();
  infoTag(container, messages.clean);
};

// ---------------------------------------------------------------
// 9. SCADA — remote control room
// ---------------------------------------------------------------
SIM_RENDERERS["scada"] = function(container) {
  const state = { closed:true, mw: 42.6 };
  let scadaFirst = true;

  function draw() {
    container.querySelector(".scada-wrap")?.remove();
    const wrap = document.createElement("div"); wrap.className="scada-wrap" + (scadaFirst ? "" : " snap-anim"); scadaFirst = false;

    const svg = newSVG(500,150);
    svgEl("line",{x1:20,y1:70,x2:220,y2:70, stroke: state.closed?PAL.greenGlow:PAL.idle,"stroke-width":4},svg);
    svgEl("rect",{x:206,y:56,width:28,height:28,fill:PAL.paper,stroke:PAL.maroon,"stroke-width":2.5},svg);
    svgEl("line",{x1:206,y1: state.closed?84:56, x2:234, y2: state.closed?56:84, stroke:PAL.maroon,"stroke-width":2.5},svg);
    svgEl("line",{x1:248,y1:70,x2:420,y2:70, stroke: state.closed?PAL.greenGlow:PAL.idle,"stroke-width":4},svg);
    svgEl("text",{x:220,y:110,class:"node-sub"},svg).textContent="Substation Breaker CB-7";
    wrap.appendChild(svg);

    const panel = document.createElement("div");
    panel.className = "sim-box";
    panel.style.marginTop = "0";
    panel.innerHTML = `
      <div style="font-family:var(--font-mono);font-size:13px;line-height:1.8;">
        <div><b>STATUS POINT</b> — CB-7: <span style="color:${state.closed?PAL.green:PAL.red}">${state.closed ? "CLOSED" : "OPEN"}</span></div>
        <div><b>ANALOG POINT</b> — Feeder MW: ${state.closed ? state.mw.toFixed(1) : "0.0"} MW</div>
      </div>`;
    wrap.appendChild(panel);

    const controls = document.createElement("div"); controls.className="sim-controls";
    const b1 = document.createElement("button"); b1.textContent = "Send OPEN command";
    const b2 = document.createElement("button"); b2.textContent = "Send CLOSE command";
    if (!state.closed) b1.classList.add("active"); else b2.classList.add("active");
    b1.addEventListener("click", () => { infoTag(container, "Control command transmitted to RTU..."); setTimeout(()=>{ state.closed=false; draw(); infoTag(container, "RTU executed the open command — status point updated to OPEN, analog MW reading drops to 0.");},700); });
    b2.addEventListener("click", () => { infoTag(container, "Control command transmitted to RTU..."); setTimeout(()=>{ state.closed=true; draw(); infoTag(container, "RTU executed the close command — status point updated to CLOSED, MW reading resumes.");},700); });
    controls.appendChild(b1); controls.appendChild(b2);
    wrap.appendChild(controls);

    container.insertBefore(wrap, container.firstChild);
  }
  draw();
  infoTag(container, "This mimics a SCADA HMI: send a remote command and watch the RTU-reported status/analog points update.");
};
