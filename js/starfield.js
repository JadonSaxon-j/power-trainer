// ============================================================
// STARFIELD — ambient space background (nebula + twinkling stars)
// ============================================================
(function () {
  const bg = document.createElement("div");
  bg.id = "space-bg";
  bg.setAttribute("aria-hidden", "true");
  document.body.prepend(bg);

  const nebulas = [
    { x:"8%",  y:"12%", size:560, color:"90,70,170",  dur:48 },
    { x:"85%", y:"18%", size:480, color:"79,209,197", dur:56 },
    { x:"70%", y:"78%", size:620, color:"90,70,170",  dur:52 },
    { x:"15%", y:"75%", size:440, color:"224,169,61", dur:64 }
  ];
  nebulas.forEach((n, i) => {
    const el = document.createElement("div");
    el.className = "nebula-blob";
    el.style.left = n.x;
    el.style.top = n.y;
    el.style.width = n.size + "px";
    el.style.height = n.size + "px";
    el.style.background = `radial-gradient(circle, rgba(${n.color},0.32), rgba(${n.color},0) 70%)`;
    el.style.animationDuration = n.dur + "s";
    el.style.animationDelay = (i * 4) + "s";
    bg.appendChild(el);
  });

  const starCount = 180;
  for (let i = 0; i < starCount; i++) {
    const s = document.createElement("div");
    s.className = "star";
    const size = Math.random() * 1.8 + 0.6;
    s.style.width = size + "px";
    s.style.height = size + "px";
    s.style.left = (Math.random() * 100) + "%";
    s.style.top = (Math.random() * 100) + "%";
    s.style.setProperty("--star-max", (Math.random() * 0.5 + 0.5).toFixed(2));
    s.style.animationDuration = (Math.random() * 4 + 2.5) + "s";
    s.style.animationDelay = (Math.random() * 6) + "s";
    bg.appendChild(s);
  }

  // A handful of brighter "feature" stars with a subtle cross glow
  const brightCount = 10;
  for (let i = 0; i < brightCount; i++) {
    const s = document.createElement("div");
    s.className = "star star-bright";
    s.style.left = (Math.random() * 100) + "%";
    s.style.top = (Math.random() * 100) + "%";
    s.style.animationDuration = (Math.random() * 3 + 3) + "s";
    s.style.animationDelay = (Math.random() * 5) + "s";
    bg.appendChild(s);
  }
})();
