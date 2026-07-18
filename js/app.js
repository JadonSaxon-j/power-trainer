// ============================================================
// APP — navigation, state persistence, step rendering
// ============================================================

const STORAGE_KEY = "ppmt_progress_v1";
const root = document.getElementById("app-root");
const modalLayer = document.getElementById("modal-layer");

function defaultState() {
  const topics = {};
  TOPICS.forEach(t => { topics[t.id] = { started:false, completed:false, stepIndex:0, score:0, answered:{} }; });
  return { topics, currentTopic:null };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    const fresh = defaultState();
    // merge to tolerate topic list changes
    TOPICS.forEach(t => { if (parsed.topics && parsed.topics[t.id]) fresh.topics[t.id] = parsed.topics[t.id]; });
    fresh.currentTopic = parsed.currentTopic || null;
    return fresh;
  } catch (e) {
    return defaultState();
  }
}

let STATE = loadState();

function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(STATE)); }
  catch (e) { console.error("Could not save progress:", e); }
}

function topicById(id) { return TOPICS.find(t => t.id === id); }

function completedCount() {
  return Object.values(STATE.topics).filter(t => t.completed).length;
}

function updateHmiProgress() {
  document.getElementById("hmi-progress").textContent = `MODULES ENERGIZED: ${completedCount()} / ${TOPICS.length}`;
}

function tickClock() {
  const el = document.getElementById("hmi-clock");
  if (el) el.textContent = new Date().toLocaleTimeString([], { hour:"2-digit", minute:"2-digit", second:"2-digit" });
}
setInterval(tickClock, 1000);
tickClock();

// ---------------------------------------------------------------
// NODE SYMBOLS for the menu one-line diagram
// ---------------------------------------------------------------
function drawNodeSymbol(g, type, cx, cy, color) {
  const S = "http://www.w3.org/2000/svg";
  function el(tag, attrs) {
    const e = document.createElementNS(S, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    g.appendChild(e);
    return e;
  }
  el("rect", { class:"node-shape", x:cx-30, y:cy-22, width:60, height:44, rx:4, fill:"#fff", stroke:color, "stroke-width":2.5 });
  const symbols = {
    breaker: () => { el("rect",{x:cx-9,y:cy-9,width:18,height:18,fill:"none",stroke:color,"stroke-width":2.5}); },
    transformer: () => { el("circle",{cx:cx-6,cy:cy,r:9,fill:"none",stroke:color,"stroke-width":2}); el("circle",{cx:cx+6,cy:cy,r:9,fill:"none",stroke:color,"stroke-width":2}); },
    bus: () => { el("line",{x1:cx-16,y1:cy,x2:cx+16,y2:cy,stroke:color,"stroke-width":5}); },
    disconnect: () => { el("line",{x1:cx-12,y1:cy+8,x2:cx+12,y2:cy-8,stroke:color,"stroke-width":3}); el("circle",{cx:cx-12,cy:cy+8,r:3,fill:color}); el("circle",{cx:cx+12,cy:cy-8,r:3,fill:color}); },
    ground: () => { [16,10,4].forEach((w,i)=>el("line",{x1:cx-w,y1:cy-6+i*7,x2:cx+w,y2:cy-6+i*7,stroke:color,"stroke-width":2})); },
    relay: () => { el("circle",{cx,cy,r:12,fill:"none",stroke:color,"stroke-width":2}); el("text",{x:cx,y:cy+4,"text-anchor":"middle","font-size":"9","font-family":"IBM Plex Mono",fill:color}).textContent="51"; },
    wave: () => { el("path",{d:`M${cx-16},${cy} q4,-12 8,0 t8,0 t8,0`, fill:"none", stroke:color,"stroke-width":2}); },
    scada: () => { el("rect",{x:cx-12,y:cy-9,width:24,height:16,fill:"none",stroke:color,"stroke-width":2}); el("line",{x1:cx-6,y1:cy+7,x2:cx+6,y2:cy+7,stroke:color,"stroke-width":2}); }
  };
  (symbols[type] || symbols.bus)();
}

// ---------------------------------------------------------------
// MENU
// ---------------------------------------------------------------
function renderMenu() {
  STATE.currentTopic = null; saveState();
  updateHmiProgress();
  root.innerHTML = "";

  const intro = document.createElement("div");
  intro.className = "menu-intro";
  intro.innerHTML = `<span class="eyebrow">Priority Power Management — EE1 Prep</span>
    <h1>Substation One-Line Trainer</h1>
    <p>Click a component below to enter that training module. Each one mixes short lessons, quick quizzes, and a hands-on simulation. Your progress saves automatically.</p>`;
  root.appendChild(intro);

  const wrap = document.createElement("div");
  wrap.className = "oneline-wrap";
  const cols = 3, colW = 320, rowH = 150, svgW = cols*colW, svgH = Math.ceil(TOPICS.length/cols)*rowH + 40;
  const svg = document.createElementNS("http://www.w3.org/2000/svg","svg");
  svg.setAttribute("viewBox", `0 0 ${svgW} ${svgH}`);
  svg.setAttribute("width","100%"); svg.setAttribute("height", Math.min(svgH,560));

  // main bus line across the top
  const busY = 30;
  const S = "http://www.w3.org/2000/svg";
  function el(tag, attrs, parent) { const e = document.createElementNS(S,tag); for (const k in attrs) e.setAttribute(k,attrs[k]); (parent||svg).appendChild(e); return e; }
  el("line", { x1:20, y1:busY, x2:svgW-20, y2:busY, stroke:"#B8892B", "stroke-width":5 });
  el("text", { x:20, y:busY-10, class:"node-sub", "font-weight":"600" }).textContent = "MAIN BUS — 9 TRAINING MODULES";

  TOPICS.forEach((t, i) => {
    const col = i % cols, row = Math.floor(i/cols);
    const cx = colW*col + colW/2;
    const cy = busY + 90 + row*rowH;
    const tState = STATE.topics[t.id];
    const color = tState.completed ? "#3F7856" : (tState.started ? "#B8892B" : "#A7A08F");

    el("line", { x1:cx, y1:busY, x2:cx, y2:cy-22, stroke:color, "stroke-width": tState.started||tState.completed?3:2 });

    const g = el("g", { class:"node-btn", tabindex:"0", role:"button", "aria-label":t.title });
    drawNodeSymbol(g, t.symbol, cx, cy, color);
    t.navLabel.split("\n").forEach((line, li) => {
      el("text", { x:cx, y:cy+44+li*13, class:"node-label" }, g).textContent = line;
    });
    const statusText = tState.completed ? `✓ complete (${tState.score}/${t.steps.filter(s=>s.type==="quiz").length})` : (tState.started ? "in progress" : "not started");
    el("text", { x:cx, y:cy+44+t.navLabel.split("\n").length*13+2, class:"node-sub" }, g).textContent = statusText;

    g.style.cursor = "pointer";
    g.addEventListener("click", () => openTopic(t.id));
    g.addEventListener("keypress", e => { if (e.key === "Enter") openTopic(t.id); });
  });

  wrap.appendChild(svg);
  root.appendChild(wrap);

  const legend = document.createElement("div");
  legend.className = "legend";
  legend.innerHTML = `
    <span><span class="swatch" style="background:#A7A08F"></span> Not started</span>
    <span><span class="swatch" style="background:#B8892B"></span> In progress</span>
    <span><span class="swatch" style="background:#3F7856"></span> Completed</span>`;
  root.appendChild(legend);
}

// ---------------------------------------------------------------
// TOPIC VIEW
// ---------------------------------------------------------------
function openTopic(id, forceRestart) {
  const t = topicById(id);
  const tState = STATE.topics[id];
  if (forceRestart) {
    tState.started = false; tState.completed = false; tState.stepIndex = 0; tState.score = 0; tState.answered = {};
  }
  tState.started = true;
  STATE.currentTopic = id;
  saveState();
  renderTopicStep(id);
}

function renderTopicStep(id) {
  const t = topicById(id);
  const tState = STATE.topics[id];
  const idx = Math.min(tState.stepIndex, t.steps.length - 1);
  const step = t.steps[idx];
  root.innerHTML = "";

  const header = document.createElement("div");
  header.className = "topic-header";
  header.innerHTML = `<div>
      <span class="eyebrow" style="font-family:var(--font-mono);font-size:12px;color:var(--maroon);letter-spacing:.1em;">MODULE ${TOPICS.findIndex(x=>x.id===id)+1} OF ${TOPICS.length}</span>
      <h1 style="margin-top:4px;">${t.title}</h1>
      <div class="progress-track"><div class="progress-fill" style="width:${Math.round(((idx)/t.steps.length)*100)}%"></div></div>
    </div>`;
  const backBtn = document.createElement("button");
  backBtn.className = "btn secondary";
  backBtn.textContent = "← Back to menu";
  backBtn.addEventListener("click", renderMenu);
  header.appendChild(backBtn);
  root.appendChild(header);

  const card = document.createElement("div");
  card.className = "step-card " + (step.type === "quiz" ? "quiz" : step.type === "sim" ? "sim" : "");

  if (step.type === "lesson") {
    card.innerHTML = `<div class="step-kicker">Lesson</div><h2>${step.title}</h2><p>${step.body}</p>`;
    root.appendChild(card);
    renderNavRow(id, idx, t, true);
  } else if (step.type === "quiz") {
    card.innerHTML = `<div class="step-kicker">Quick check</div><h2>${step.q}</h2>`;
    const optWrap = document.createElement("div");
    optWrap.className = "quiz-options";
    const already = tState.answered[idx];
    let answeredNow = !!already;
    step.options.forEach((opt, oi) => {
      const b = document.createElement("button");
      b.className = "quiz-opt";
      b.textContent = opt;
      if (already) {
        b.disabled = true;
        if (oi === step.correct) b.classList.add("correct");
        else if (oi === already.picked) b.classList.add("wrong");
      }
      b.addEventListener("click", () => {
        if (answeredNow) return;
        answeredNow = true;
        const correct = oi === step.correct;
        tState.answered[idx] = { picked: oi, correct };
        if (correct) tState.score++;
        saveState();
        [...optWrap.children].forEach((child, ci) => {
          child.disabled = true;
          if (ci === step.correct) child.classList.add("correct");
          else if (ci === oi && !correct) child.classList.add("wrong");
        });
        const fb = document.createElement("div");
        fb.className = "feedback " + (correct ? "correct" : "wrong");
        fb.textContent = (correct ? "Correct. " : "Not quite. ") + step.explain;
        card.appendChild(fb);
        navRef.nextBtn.disabled = false;
      });
      optWrap.appendChild(b);
    });
    card.appendChild(optWrap);
    if (already) {
      const fb = document.createElement("div");
      fb.className = "feedback " + (already.correct ? "correct" : "wrong");
      fb.textContent = (already.correct ? "Correct. " : "Not quite. ") + step.explain;
      card.appendChild(fb);
    }
    root.appendChild(card);
    const navRef = renderNavRow(id, idx, t, !!already);
  } else if (step.type === "sim") {
    card.innerHTML = `<div class="step-kicker">Simulation</div><h2>${step.title}</h2><p>${step.instructions}</p><div class="sim-box"></div>`;
    root.appendChild(card);
    const simBox = card.querySelector(".sim-box");
    renderSim(step.simId, simBox);
    renderNavRow(id, idx, t, true);
  }

  saveState();
}

function renderNavRow(id, idx, t, canNext) {
  const row = document.createElement("div");
  row.className = "nav-row";
  const prevBtn = document.createElement("button");
  prevBtn.className = "btn secondary";
  prevBtn.textContent = "← Previous";
  prevBtn.disabled = idx === 0;
  prevBtn.addEventListener("click", () => { STATE.topics[id].stepIndex = Math.max(0, idx-1); saveState(); renderTopicStep(id); });

  const nextBtn = document.createElement("button");
  const isLast = idx === t.steps.length - 1;
  nextBtn.className = "btn";
  nextBtn.textContent = isLast ? "Finish module" : "Next →";
  nextBtn.disabled = !canNext;
  nextBtn.addEventListener("click", () => {
    if (isLast) {
      STATE.topics[id].completed = true;
      saveState();
      renderMenu();
    } else {
      STATE.topics[id].stepIndex = idx + 1;
      saveState();
      renderTopicStep(id);
    }
  });
  row.appendChild(prevBtn);
  row.appendChild(nextBtn);
  root.appendChild(row);
  return { row, prevBtn, nextBtn };
}

// ---------------------------------------------------------------
// RESUME / RESTART MODAL
// ---------------------------------------------------------------
function showResumeModal(topicId) {
  const t = topicById(topicId);
  const tState = STATE.topics[topicId];
  modalLayer.innerHTML = `
    <div class="modal-card">
      <h2>Welcome back</h2>
      <p>You left off in <b>${t.title}</b> (step ${tState.stepIndex+1} of ${t.steps.length}). Want to pick up where you left off, or start this module over?</p>
      <div class="modal-actions">
        <button class="btn" id="resume-btn">Resume</button>
        <button class="btn secondary" id="restart-btn">Restart module</button>
      </div>
    </div>`;
  modalLayer.classList.remove("hidden");
  document.getElementById("resume-btn").addEventListener("click", () => {
    modalLayer.classList.add("hidden"); modalLayer.innerHTML = "";
    renderTopicStep(topicId);
  });
  document.getElementById("restart-btn").addEventListener("click", () => {
    modalLayer.classList.add("hidden"); modalLayer.innerHTML = "";
    openTopic(topicId, true);
  });
}

// ---------------------------------------------------------------
// INIT
// ---------------------------------------------------------------
(function init() {
  updateHmiProgress();
  const pending = STATE.currentTopic;
  if (pending && STATE.topics[pending] && STATE.topics[pending].started && !STATE.topics[pending].completed) {
    renderMenu();
    showResumeModal(pending);
  } else {
    renderMenu();
  }
})();
