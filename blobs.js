// Floating glow blobs that bounce around #arena.
// Easter egg: click all three original blobs to release a swarm of new ones.
(function () {
  const arena = document.getElementById("arena");
  const speed = 2;
  const swarmPerBlob = 5; // new blobs released from each original
  const swarmMinBoost = 2; // swarm blobs move 2x-5x faster than the originals
  const swarmMaxBoost = 5;

  const originals = Array.from(arena.getElementsByClassName("blob"));
  const maxX = arena.clientWidth - originals[0].offsetWidth;
  const maxY = arena.clientHeight - originals[0].offsetHeight;

  // every moving blob: { el, x, y, vx, vy }
  const blobs = originals.map((el) => ({
    el,
    x: Math.floor(Math.random() * maxX),
    y: Math.floor(Math.random() * maxY),
    vx: Math.random() < 0.5 ? speed : -speed,
    vy: Math.random() < 0.5 ? speed : -speed,
  }));

  // ---- easter egg ----
  const caught = new Set();
  let released = false;

  // hue (0-360) of a "#rrggbb" color
  function hexToHue(hex) {
    const n = parseInt(hex.trim().slice(1), 16);
    const r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
    const max = Math.max(r, g, b), d = max - Math.min(r, g, b);
    if (d === 0) return 0;
    const h = max === r ? (g - b) / d : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return (h * 60 + 360) % 360;
  }

  // a random variation of the parent's hue: shifted hue, any vividness, darker to lighter
  function shadeOf(hue) {
    const h = (hue + Math.random() * 50 - 25 + 360) % 360;
    const s = 60 + Math.random() * 40;
    const l = 30 + Math.random() * 50;
    return `hsl(${h.toFixed(0)}, ${s.toFixed(0)}%, ${l.toFixed(0)}%)`;
  }

  // burst children out of a parent blob in evenly spread directions, in its color family
  function spew(parent) {
    const hue = hexToHue(parent.el.style.getPropertyValue("--color"));
    const offset = Math.random() * 2 * Math.PI;
    for (let i = 0; i < swarmPerBlob; i++) {
      const el = document.createElement("div");
      el.className = "blob";
      el.style.setProperty("--color", shadeOf(hue));
      arena.appendChild(el);

      const angle = offset + (i / swarmPerBlob) * 2 * Math.PI + Math.random() * 0.4;
      const s = speed * (swarmMinBoost + Math.random() * (swarmMaxBoost - swarmMinBoost));
      blobs.push({ el, x: parent.x, y: parent.y, vx: Math.cos(angle) * s, vy: Math.sin(angle) * s });
    }
  }

  const parents = blobs.slice(); // only the original three are part of the egg
  parents.forEach((b) => {
    b.el.addEventListener("click", () => {
      if (released || caught.has(b)) return;
      caught.add(b);
      b.el.classList.add("caught");
      if (caught.size === parents.length) {
        released = true;
        parents.forEach(spew);
      }
    });
  });

  // ---- animation ----
  // Velocities are in px per 60Hz frame; scaling by elapsed time keeps the
  // speed the same even when the browser drops frames or runs at 120Hz+.
  let last = performance.now();

  function animate(now) {
    // cap the step so a backgrounded tab doesn't teleport blobs on return
    const dt = Math.min((now - last) / (1000 / 60), 4);
    last = now;

    for (const b of blobs) {
      b.x += b.vx * dt;
      b.y += b.vy * dt;

      // bounce with clamping to avoid getting stuck outside
      if (b.x <= 0) { b.x = 0; b.vx = Math.abs(b.vx); }
      else if (b.x >= maxX) { b.x = maxX; b.vx = -Math.abs(b.vx); }

      if (b.y <= 0) { b.y = 0; b.vy = Math.abs(b.vy); }
      else if (b.y >= maxY) { b.y = maxY; b.vy = -Math.abs(b.vy); }

      // `translate` skips layout + repaint (left/top forced both every frame), and
      // unlike `transform` it composes correctly with the `scale` on caught blobs
      b.el.style.translate = `${b.x}px ${b.y}px`;
    }
    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
})();
