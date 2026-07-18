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
function quizStepsOf(t) { return t.steps.map((s,i)=>({s,i})).filter(x => x.s.type === "quiz"); }
function completedCount() { return Object.values(STATE.topics).filter(t => t.completed).length; }

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
// VIEW TRANSITION HELPER — fades the whole #app-root out/in
// ---------------------------------------------------------------
function transitionTo(buildFn) {
  const hasContent = root.children.length > 0;
  root.classList.remove("view-entering");
  if (hasContent) {
    root.classList.add("view-fade-out");
    setTimeout(() => {
      root.classList.remove("view-fade-out");
      root.innerHTML = "";
      buildFn();
      void root.offsetWidth;
      root.classList.add("view-entering");
    }, 150);
  } else {
    buildFn();
    root.classList.add("view-entering");
  }
}

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
  el("rect", { class:"node-shape", x:cx-34, y:cy-26, width:68, height:52, rx:8, fill:"rgba(16,30,51,0.85)", stroke:color, "stroke-width":2.5 });
  el("rect", { x:cx-34, y:cy-26, width:68, height:52, rx:8, fill:"none", stroke:color, "stroke-width":1, opacity:0.25 });
  const symbols = {
    breaker: () => { el("rect",{x:cx-10,y:cy-10,width:20,height:20,fill:"none",stroke:color,"stroke-width":2.5}); },
    transformer: () => { el("circle",{cx:cx-7,cy:cy,r:10,fill:"none",stroke:color,"stroke-width":2.2}); el("circle",{cx:cx+7,cy:cy,r:10,fill:"none",stroke:color,"stroke-width":2.2}); },
    bus: () => { el("line",{x1:cx-18,y1:cy,x2:cx+18,y2:cy,stroke:color,"stroke-width":5}); el("circle",{cx:cx-18,cy:cy,r:2.5,fill:color}); el("circle",{cx:cx+18,cy:cy,r:2.5,fill:color}); },
    disconnect: () => { el("line",{x1:cx-13,y1:cy+9,x2:cx+13,y2:cy-9,stroke:color,"stroke-width":3}); el("circle",{cx:cx-13,cy:cy+9,r:3,fill:color}); el("circle",{cx:cx+13,cy:cy-9,r:3,fill:color}); },
    ground: () => { [17,11,5].forEach((w,i)=>el("line",{x1:cx-w,y1:cy-7+i*7,x2:cx+w,y2:cy-7+i*7,stroke:color,"stroke-width":2.2})); },
    relay: () => { el("circle",{cx,cy,r:13,fill:"none",stroke:color,"stroke-width":2.2}); el("text",{x:cx,y:cy+4,"text-anchor":"middle","font-size":"10","font-family":"IBM Plex Mono","font-weight":"600",fill:color}).textContent="51"; },
    wave: () => { el("path",{d:`M${cx-17},${cy} q4.5,-13 9,0 t9,0 t9,0`, fill:"none", stroke:color,"stroke-width":2.2}); },
    scada: () => { el("rect",{x:cx-13,y:cy-10,width:26,height:17,rx:1,fill:"none",stroke:color,"stroke-width":2.2}); el("line",{x1:cx-7,y1:cy+8,x2:cx+7,y2:cy+8,stroke:color,"stroke-width":2.2}); el("circle",{cx:cx-7,cy:cy-4,r:1.6,fill:color}); }
  };
  (symbols[type] || symbols.bus)();
}

// ---------------------------------------------------------------
// MENU
// ---------------------------------------------------------------
function renderMenu() {
  transitionTo(() => {
    STATE.currentTopic = null; saveState();
    updateHmiProgress();

    const intro = document.createElement("div");
    intro.className = "menu-intro";
    const allDone = completedCount() === TOPICS.length;
    intro.innerHTML = `<span class="eyebrow">Priority Power Management — EE1 Prep</span>
      <h1>Substation One-Line Trainer</h1>
      <p>${allDone ? "Every module is energized. Revisit any node any time to review, or jump into the missed-question review from a module's completion screen." : "Click a component below to enter that training module. Each one mixes short lessons, quick quizzes, and a hands-on simulation. Your progress saves automatically."}</p>`;
    root.appendChild(intro);

    const wrap = document.createElement("div");
    wrap.className = "oneline-wrap";
    const cols = 3, colW = 320, rowH = 172, svgW = cols*colW, svgH = Math.ceil(TOPICS.length/cols)*rowH + 46;
    const svg = document.createElementNS("http://www.w3.org/2000/svg","svg");
    svg.setAttribute("viewBox", `0 0 ${svgW} ${svgH}`);
    svg.setAttribute("width","100%"); svg.setAttribute("height", Math.min(svgH,620));

    const busY = 30;
    const S = "http://www.w3.org/2000/svg";
    function el(tag, attrs, parent) { const e = document.createElementNS(S,tag); for (const k in attrs) e.setAttribute(k,attrs[k]); (parent||svg).appendChild(e); return e; }
    el("line", { x1:20, y1:busY, x2:svgW-20, y2:busY, stroke:"#E7B34A", "stroke-width":5, class:"energized-flow", style:"filter:drop-shadow(0 0 6px #E7B34A)" });
    el("text", { x:20, y:busY-12, class:"node-sub", "font-weight":"600" }).textContent = "MAIN BUS — 9 TRAINING MODULES";

    TOPICS.forEach((t, i) => {
      const col = i % cols, row = Math.floor(i/cols);
      const cx = colW*col + colW/2;
      const cy = busY + 96 + row*rowH;
      const tState = STATE.topics[t.id];
      const color = tState.completed ? "#34D399" : (tState.started ? "#E7B34A" : "#33465F");
      const active = tState.started || tState.completed;

      el("line", { x1:cx, y1:busY, x2:cx, y2:cy-26, stroke:color, "stroke-width": active?3:1.5,
        class: active ? "energized-flow" : "",
        style: active ? `filter:drop-shadow(0 0 5px ${color})` : "" });

      const g = el("g", { class:"node-btn", tabindex:"0", role:"button", "aria-label":t.title });
      if (tState.completed) g.classList.add("node-energized");
      drawNodeSymbol(g, t.symbol, cx, cy, color);
      t.navLabel.split("\n").forEach((line, li) => {
        el("text", { x:cx, y:cy+42+li*14, class:"node-label" }, g).textContent = line;
      });
      const totalQuizzes = quizStepsOf(t).length;
      const labelLines = t.navLabel.split("\n").length;
      const pillY = cy + 42 + labelLines*14 + 10;
      const statusText = tState.completed ? `COMPLETE ${tState.score}/${totalQuizzes}` : (tState.started ? "IN PROGRESS" : "NOT STARTED");
      const pillW = statusText.length * 5.6 + 16;
      el("rect", { x:cx-pillW/2, y:pillY-11, width:pillW, height:18, rx:9, fill:`${color}22`, stroke:color, "stroke-width":1 }, g);
      el("text", { x:cx, y:pillY+2, class:"node-pill-text", fill:color }, g).textContent = statusText;

      g.style.cursor = "pointer";
      g.addEventListener("click", () => openTopic(t.id));
      g.addEventListener("keypress", e => { if (e.key === "Enter") openTopic(t.id); });
    });

    wrap.appendChild(svg);
    root.appendChild(wrap);

    const legend = document.createElement("div");
    legend.className = "legend";
    legend.innerHTML = `
      <span><span class="swatch" style="background:#33465F"></span> Not started</span>
      <span><span class="swatch" style="background:#E7B34A"></span> In progress</span>
      <span><span class="swatch" style="background:#34D399"></span> Completed</span>`;
    root.appendChild(legend);
  });
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
  transitionTo(() => {
    const t = topicById(id);
    const tState = STATE.topics[id];
    const idx = Math.min(tState.stepIndex, t.steps.length - 1);
    const step = t.steps[idx];

    const header = document.createElement("div");
    header.className = "topic-header";
    header.innerHTML = `<div>
        <span class="eyebrow" style="font-family:var(--font-mono);font-size:12px;color:var(--gold);letter-spacing:.1em;">MODULE ${TOPICS.findIndex(x=>x.id===id)+1} OF ${TOPICS.length}</span>
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
    card.className = "step-card entering " + (step.type === "quiz" ? "quiz" : step.type === "sim" ? "sim" : "");

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
      let navRef;
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
      navRef = renderNavRow(id, idx, t, !!already);
    } else if (step.type === "sim") {
      card.innerHTML = `<div class="step-kicker">Simulation</div><h2>${step.title}</h2><p>${step.instructions}</p><div class="sim-box"></div>`;
      root.appendChild(card);
      const simBox = card.querySelector(".sim-box");
      renderSim(step.simId, simBox);
      renderNavRow(id, idx, t, true);
    }

    saveState();
  });
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
      finishModule(id);
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
// MODULE COMPLETE — summary modal, missed-question review, celebration
// ---------------------------------------------------------------
function missedQuestions(id) {
  const t = topicById(id);
  const tState = STATE.topics[id];
  return quizStepsOf(t)
    .map(({s, i}) => ({ step: s, answer: tState.answered[i] }))
    .filter(x => x.answer && !x.answer.correct);
}

function finishModule(id) {
  const t = topicById(id);
  const tState = STATE.topics[id];
  const total = quizStepsOf(t).length;
  const missed = missedQuestions(id);
  updateHmiProgress();

  if (completedCount() === TOPICS.length) {
    showCelebrationModal();
    return;
  }

  modalLayer.innerHTML = `
    <div class="modal-card">
      <h2>Module complete</h2>
      <p><b>${t.title}</b> — score: ${tState.score} / ${total}${missed.length ? `. ${missed.length} question${missed.length>1?"s":""} to review.` : ". Perfect score!"}</p>
      <div class="modal-actions">
        ${missed.length ? `<button class="btn" id="review-btn">Review missed questions</button>` : ""}
        <button class="btn secondary" id="menu-btn">Back to menu</button>
      </div>
    </div>`;
  modalLayer.classList.remove("hidden");
  const menuBtn = document.getElementById("menu-btn");
  menuBtn.addEventListener("click", () => { modalLayer.classList.add("hidden"); modalLayer.innerHTML=""; renderMenu(); });
  const reviewBtn = document.getElementById("review-btn");
  if (reviewBtn) reviewBtn.addEventListener("click", () => { modalLayer.classList.add("hidden"); modalLayer.innerHTML=""; renderMissedReview(id); });
}

function renderMissedReview(id) {
  transitionTo(() => {
    const t = topicById(id);
    const missed = missedQuestions(id);

    const header = document.createElement("div");
    header.className = "topic-header";
    header.innerHTML = `<div>
        <span class="eyebrow" style="font-family:var(--font-mono);font-size:12px;color:var(--red);letter-spacing:.1em;">REVIEW</span>
        <h1 style="margin-top:4px;">${t.title} — Missed Questions</h1>
      </div>`;
    const backBtn = document.createElement("button");
    backBtn.className = "btn secondary";
    backBtn.textContent = "← Back to menu";
    backBtn.addEventListener("click", renderMenu);
    header.appendChild(backBtn);
    root.appendChild(header);

    if (!missed.length) {
      const card = document.createElement("div");
      card.className = "step-card entering";
      card.innerHTML = `<p>No missed questions in this module — nice work.</p>`;
      root.appendChild(card);
      return;
    }

    missed.forEach(({step, answer}) => {
      const item = document.createElement("div");
      item.className = "missed-item";
      item.innerHTML = `
        <p style="margin-top:0;"><b>${step.q}</b></p>
        <p class="your-answer" style="margin:4px 0;">Your answer: ${step.options[answer.picked]}</p>
        <p class="right-answer" style="margin:4px 0;">Correct answer: ${step.options[step.correct]}</p>
        <p style="margin-bottom:0;color:var(--ink-soft);font-size:14px;">${step.explain}</p>`;
      root.appendChild(item);
    });

    const doneBtn = document.createElement("button");
    doneBtn.className = "btn";
    doneBtn.textContent = "Back to menu";
    doneBtn.addEventListener("click", renderMenu);
    root.appendChild(doneBtn);
  });
}

function showCelebrationModal() {
  modalLayer.innerHTML = `
    <div class="modal-card celebration">
      <div class="big-check">⚡</div>
      <h2>Grid fully energized</h2>
      <p>All 9 modules complete — every node on the one-line is lit up. You can revisit any module any time to brush up or review missed questions.</p>
      <div class="modal-actions" style="justify-content:center;">
        <button class="btn" id="celebrate-menu-btn">View the grid</button>
      </div>
    </div>`;
  modalLayer.classList.remove("hidden");
  document.getElementById("celebrate-menu-btn").addEventListener("click", () => {
    modalLayer.classList.add("hidden"); modalLayer.innerHTML = ""; renderMenu();
  });
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
