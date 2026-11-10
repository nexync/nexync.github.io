// Shared results rendering for the verifiability poll.
// The SAME file lives in nvr-poll/ and nvr-poll-host/ (separate repos): edit one, copy it to the other.
(function () {
  const COLORS = ["#00caff", "#00ff41", "#ff004d"];

  // Each view is one results slide.
  const VIEWS = [
    { key: "same", tab: "Same task, different audience", title: "Same task, different audience, different answer",
      scales: [ { title: "The elegance of a proof", ids: ["A", "B"] },
                { title: "The quality of a piece of art", ids: ["D", "E"] } ] },
    { key: "experts", tab: "Different tasks, experts", title: "Different tasks, similar audiences, different answers",
      scales: [ { title: "Each task judged by experts", ids: ["A", "F", "D"],
                  short: { A: "Math", F: "Short story", D: "Art" } } ],
      discuss: { eyebrow: "Around the room · one answer each",
                 question: "What makes judging the elegance of a natural-language proof different from judging the quality of a short story?" } },
    { key: "all", tab: "All eight", title: "Where the room put every task",
      scales: [ { title: "All tasks", ids: ["A", "B", "C", "D", "E", "F", "G", "H"] } ] },
  ];

  const CSS = `
  .pr-scales { flex: 1; display: flex; flex-direction: column; gap: clamp(28px, 6vh, 80px); }
  /* "safe" vertical centring: never pushes content up over the header when it doesn't fit */
  .pr-scales > :first-child { margin-top: auto; }
  .pr-scales > :last-child { margin-bottom: auto; }
  .pr-scale h2 { font-size: clamp(16px, 1.6vw, 28px); font-weight: 700; margin-bottom: 8px; }
  .pr-plot { position: relative; margin: 0 clamp(20px, 4vw, 64px); }
  .pr-line { position: absolute; left: 0; right: 0; height: 10px; margin-top: -5px; border-radius: 5px;
    background: linear-gradient(to right, var(--red), var(--blue)); }
  .pr-ends { position: absolute; left: 0; right: 0; display: flex; justify-content: space-between; gap: 12px;
    font-size: clamp(11px, .9vw, 15px); color: var(--muted); }
  .pr-dot { position: absolute; width: 10px; height: 10px; border-radius: 50%; transform: translate(-50%, -50%); opacity: .55; }
  .pr-mean { position: absolute; width: clamp(24px, 2vw, 36px); height: clamp(24px, 2vw, 36px); border-radius: 50%;
    transform: translate(-50%, -50%); border: 3px solid var(--text); transition: left .6s ease;
    display: grid; place-items: center; font-weight: 800; font-size: clamp(11px, .9vw, 16px); color: #101010; }
  .pr-label { position: absolute; white-space: nowrap; font-size: clamp(13px, 1.25vw, 22px); line-height: 1.3; }
  .pr-label b { font-size: 1.1em; }
  .pr-label .pct { font-weight: 800; }
  .pr-empty { color: var(--muted); font-size: clamp(14px, 1.2vw, 20px); }
  .pr-discuss { display: flex; flex-direction: column; gap: clamp(8px, 1.4vh, 18px); }
  .pr-discuss .pr-eyebrow { font-size: clamp(12px, 1.1vw, 20px); font-weight: 700; letter-spacing: .14em;
    text-transform: uppercase; color: var(--red); }
  .pr-discuss .pr-q { font-family: Georgia, "Source Serif 4", serif; font-weight: 600; line-height: 1.2;
    font-size: clamp(22px, 2.8vw, 52px); color: var(--text); max-width: 34ch; text-wrap: balance; }
  `;
  function injectCss() {
    if (document.getElementById("pr-css")) return;
    const s = document.createElement("style");
    s.id = "pr-css";
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  const pct = (v) => Math.round(v * 100) + "%";

  // Keep the latest answer per name (people may resubmit after changing their mind). Order = first seen.
  function latestPerName(list) {
    const byName = new Map();
    for (const r of list || []) {
      if (!r || !r.answers) continue;
      const key = String(r.name || "").trim().toLowerCase() || Math.random();
      byName.set(key, r);
    }
    return [...byName.values()];
  }

  function demoResponses(n = 18) {
    const centre = { A: .72, B: .35, C: .85, D: .55, E: .22, F: .4, G: .45, H: .08 };
    const names = ["Ada", "Ben", "Chen", "Dana", "Eli", "Fatima", "Gus", "Hana", "Ivan", "Jo", "Kai", "Lena",
                   "Mo", "Nia", "Omar", "Priya", "Quinn", "Rosa", "Sam", "Tariq", "Uma", "Vik", "Wen", "Xia"];
    let seed = 7;
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    return Array.from({ length: n }, (_, i) => ({
      name: names[i % names.length] + (i >= names.length ? " " + (i + 1) : ""),
      answers: Object.fromEntries(Object.entries(centre).map(([k, c]) =>
        [k, Math.round(Math.min(1, Math.max(0, c + (rand() + rand() + rand() - 1.5) * .3)) * 1000) / 1000])),
      submittedAt: new Date(Date.now() - (n - i) * 7000).toISOString(),
    }));
  }

  function withParams(url, params) {
    const u = new URL(url, location.href);
    for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
    return u.toString();
  }

  function jsonp(url, timeoutMs = 10000) {
    return new Promise((resolve, reject) => {
      const cb = "__pollCb" + Date.now() + Math.floor(Math.random() * 1e6);
      const s = document.createElement("script");
      const done = (fn, arg) => { clearTimeout(t); delete window[cb]; s.remove(); fn(arg); };
      const t = setTimeout(() => done(reject, new Error("jsonp timeout")), timeoutMs);
      window[cb] = (data) => done(resolve, data);
      s.onerror = () => done(reject, new Error("jsonp failed"));
      s.src = withParams(url, { callback: cb });
      document.head.appendChild(s);
    });
  }

  // GET the response list from resultsUrl: fetch() first, JSONP (?callback=) as a fallback.
  async function fetchResponses(resultsUrl, pollId) {
    const url = withParams(resultsUrl, { poll: pollId });
    let data;
    try {
      const r = await fetch(url, { cache: "no-store" });
      if (!r.ok) throw new Error("HTTP " + r.status);
      data = await r.json();
    } catch (err) {
      console.warn("[poll] fetch failed, trying JSONP", err);
      data = await jsonp(url);
    }
    return Array.isArray(data) ? data : data.responses || [];
  }

  /* ---------- rendering ---------- */

  // Renders the scales (and discussion prompt, if any) of `view` into `box`. `box` must be in the document.
  function renderView(box, view, rs, itemsList) {
    injectCss();
    const items = Object.fromEntries(itemsList.map((it) => [it.id, it]));
    box.classList.add("pr-scales");
    box.innerHTML = "";
    if (!rs.length) {
      box.innerHTML = `<p class="pr-empty">No answers yet.</p>`;
    } else {
      for (const sc of view.scales) {
        const wrap = document.createElement("section");
        wrap.className = "pr-scale";
        const h = document.createElement("h2");
        h.textContent = sc.title;
        wrap.appendChild(h);
        box.appendChild(wrap);
        scalePlot(sc, rs, items, wrap);
      }
    }
    if (view.discuss) {
      const d = document.createElement("section");
      d.className = "pr-discuss";
      d.innerHTML = `<p class="pr-eyebrow"></p><p class="pr-q"></p>`;
      d.children[0].textContent = view.discuss.eyebrow;
      d.children[1].textContent = view.discuss.question;
      box.appendChild(d);
    }
  }

  function scalePlot(sc, rs, items, wrap) {
    const many = sc.ids.length > 3;
    const plot = document.createElement("div");
    plot.className = "pr-plot";
    plot.style.height = "200px"; // provisional, so labels can be measured
    wrap.appendChild(plot);

    const stats = sc.ids.map((id, i) => {
      const vals = rs.map((r) => Number(r.answers[id])).filter((v) => isFinite(v));
      const mean = vals.reduce((a, b) => a + b, 0) / (vals.length || 1);
      return { id, i, vals, mean, color: many ? "#f0f8ff" : COLORS[i % COLORS.length] };
    }).sort((a, b) => a.mean - b.mean);

    // labels first, so we can measure them and stack them into rows that don't overlap
    const W = plot.clientWidth;
    const pad = 18;
    const rows = { up: [], down: [] }; // each row: array of [x0, x1]
    for (const s of stats) {
      const it = items[s.id];
      const lab = document.createElement("div");
      lab.className = "pr-label";
      const head = sc.short && sc.short[s.id]
        ? `<b>${sc.short[s.id]} · ${s.id}</b>, ${it.who}`
        : many ? `<b>${s.id}</b>` : `<b>${s.id}</b> · ${it.who}`;
      lab.innerHTML = `${head} · <span class="pct" style="color:${many ? "inherit" : s.color}">${pct(s.mean)}</span>`;
      plot.appendChild(lab);
      const w = lab.offsetWidth;
      const cx = Math.min(Math.max(s.mean * W, w / 2), Math.max(w / 2, W - w / 2));
      const span = [cx - w / 2 - pad / 2, cx + w / 2 + pad / 2];
      let slot = null;
      for (let r = 0; !slot; r++) {
        for (const side of ["up", "down"]) {
          const row = rows[side][r] || (rows[side][r] = []);
          if (row.every(([a, b]) => span[1] <= a || span[0] >= b)) { row.push(span); slot = { side, r }; break; }
        }
      }
      Object.assign(s, { lab, w, cx, slot, lh: lab.offsetHeight });
    }

    const lh = Math.max(...stats.map((s) => s.lh), 24);
    const rowH = lh + 6;
    const nUp = Math.max(1, rows.up.length), nDown = rows.down.length;
    const lanes = many ? 0 : sc.ids.length, laneGap = 14;
    const axis = nUp * rowH + 18;
    const belowStart = axis + 40 + lanes * laneGap + 4;
    const H = belowStart + nDown * rowH + 4;
    plot.style.height = H + "px";

    const line = document.createElement("div");
    line.className = "pr-line";
    line.style.top = axis + "px";
    const ends = document.createElement("div");
    ends.className = "pr-ends";
    ends.style.top = axis + 14 + "px";
    ends.innerHTML = `<span>0% · pick the best number, 1000–2000</span><span>100% · an AIME answer</span>`;
    plot.prepend(line, ends);

    for (const s of stats) {
      if (!many) {
        const laneY = axis + 40 + s.i * laneGap;
        for (const v of s.vals) {
          const d = document.createElement("div");
          d.className = "pr-dot";
          d.style.left = v * 100 + "%";
          d.style.top = laneY + "px";
          d.style.background = s.color;
          plot.appendChild(d);
        }
      }
      const m = document.createElement("div");
      m.className = "pr-mean";
      m.style.left = s.mean * 100 + "%";
      m.style.top = axis + "px";
      m.style.background = s.color;
      m.textContent = s.id;
      plot.appendChild(m);

      s.lab.style.left = s.cx - s.w / 2 + "px";
      s.lab.style.top = (s.slot.side === "up"
        ? axis - 22 - (s.slot.r + 1) * rowH + 6
        : belowStart + s.slot.r * rowH) + "px";
    }
    return plot;
  }

  window.PollRender = { VIEWS, COLORS, pct, latestPerName, demoResponses, fetchResponses, withParams, renderView };
})();
