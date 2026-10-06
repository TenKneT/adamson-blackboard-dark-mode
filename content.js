(() => {
  "use strict";
  const key = "adamsonDarkEnabled";
  const flag = "data-adamson-dark";
  const probe = "data-adm-probing";
  const marks = ["data-adm-surface", "data-adm-text", "data-adm-border", "data-adm-before", "data-adm-after"];
  const skip = "script, style, link, meta, img, video, canvas, iframe, object, embed, source, svg, svg *";
  const urgent = new Set();
  const scans = new Map();
  const idleAvailable = typeof requestIdleCallback === "function";
  let enabled = true;
  let observer;
  let animation = null;
  let background = null;

  function neutral(value) {
    const c = value.match(/[\d.]+/g)?.map(Number);
    if (!c || c.length < 3 || (c.length === 4 && c[3] < 0.5)) return null;
    return Math.max(c[0], c[1], c[2]) - Math.min(c[0], c[1], c[2]) <= 6 ? c[0] : null;
  }

  function eligible(element) {
    return element instanceof Element && element.isConnected && !element.matches(skip);
  }

  function update(elements) {
    const probed = [];
    // Temporarily suppress existing hints, then retain attributes whose values did not change.
    for (const element of elements) {
      if (marks.some(mark => element.hasAttribute(mark))) {
        element.setAttribute(probe, "");
        probed.push(element);
      }
    }
    try {
      const updates = elements.map(element => {
        const style = getComputedStyle(element);
        if (style.display === "none") return [element, ...marks.map(() => null)];
        const bg = neutral(style.backgroundColor);
        const fg = neutral(style.color);
        const sides = ["Top", "Right", "Bottom", "Left"].map(side => {
          const line = style["border" + side + "Style"];
          if (line === "none" || line === "hidden" || parseFloat(style["border" + side + "Width"]) === 0) return "0";
          const n = neutral(style["border" + side + "Color"]);
          return n !== null && n > 110 ? "1" : "0";
        }).join("");
        const pseudos = ["::before", "::after"].map(pseudo => {
          const decoration = getComputedStyle(element, pseudo);
          if (decoration.content === "none" || decoration.content === "normal") return null;
          const value = neutral(decoration.backgroundColor);
          return value !== null && value > 155 ? (value > 235 ? "paper" : "raised") : null;
        });
        return [element, bg !== null && bg > 155 ? (bg > 235 ? "paper" : "raised") : null,
          fg !== null && fg < 150 ? (fg < 80 ? "primary" : "secondary") : null,
          sides.includes("1") ? sides : null, ...pseudos];
      });
      for (const [element, ...values] of updates) {
        values.forEach((value, i) => {
          if (element.getAttribute(marks[i]) === value) return;
          if (value === null) element.removeAttribute(marks[i]);
          else element.setAttribute(marks[i], value);
        });
      }
    } finally {
      for (const element of probed) element.removeAttribute(probe);
    }
  }

  function scheduleInteraction() {
    if (animation === null && urgent.size) animation = requestAnimationFrame(flushInteraction);
  }

  function flushInteraction() {
    animation = null;
    if (!enabled) return;
    const elements = [];
    for (const element of urgent) {
      urgent.delete(element);
      if (eligible(element)) elements.push(element);
      if (elements.length === 12) break;
    }
    if (elements.length) update(elements);
    scheduleInteraction();
  }

  function queueInteraction(event) {
    if (!enabled) return;
    const related = event.relatedTarget;
    let node = event.target;
    for (let depth = 0; node instanceof Element && depth < 5; depth++, node = node.parentElement) {
      if (node === document.body || node === document.documentElement ||
          node.matches("main, #main-content, .route-view-container, .course-main-content")) break;
      // An ancestor shared by both targets never lost hover or focus-within.
      if (related instanceof Node && node.contains(related)) break;
      if (eligible(node)) urgent.add(node);
    }
    scheduleInteraction();
  }
  for (const type of ["pointerover", "pointerout", "focusin", "focusout"]) {
    document.addEventListener(type, queueInteraction, { passive: true });
  }

  function scheduleBackground() {
    if (background !== null || !scans.size) return;
    background = idleAvailable ? requestIdleCallback(flushBackground, { timeout: 120 }) : setTimeout(flushBackground, 16);
  }

  function queueScan(element) {
    if (!enabled || !eligible(element)) return;
    const existing = scans.get(element);
    if (existing) {
      if (existing.started) existing.again = true;
      return;
    }
    for (const [root, scan] of scans) {
      if (!scan.started && root.contains(element)) return;
      if (!scan.started && element.contains(root)) scans.delete(root);
    }
    scans.set(element, { root: element, started: false, again: false, walker: null });
    scheduleBackground();
  }

  function takeScanBatch() {
    const elements = new Set();
    while (scans.size && elements.size < 16) {
      const scan = scans.values().next().value;
      if (!scan.root.isConnected) { scans.delete(scan.root); continue; }
      let node;
      if (!scan.started) {
        scan.started = true;
        scan.walker = document.createTreeWalker(scan.root, NodeFilter.SHOW_ELEMENT, {
          acceptNode: element => element.matches(skip) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
        });
        node = scan.root;
      } else node = scan.walker.nextNode();
      if (node) {
        if (eligible(node)) elements.add(node);
      } else {
        scans.delete(scan.root);
        if (scan.again) scans.set(scan.root, { root: scan.root, started: false, again: false, walker: null });
      }
    }
    return [...elements];
  }

  function flushBackground(deadline) {
    background = null;
    if (!enabled) return;
    if (urgent.size && !deadline?.didTimeout) { scheduleBackground(); return; }
    const start = performance.now();
    let batches = 0;
    do {
      const elements = takeScanBatch();
      if (elements.length) update(elements);
      batches++;
      if (deadline && !deadline.didTimeout && deadline.timeRemaining() < 1) break;
    } while (scans.size && !urgent.size && batches < 8 && performance.now() - start < 4);
    scheduleBackground();
  }

  function cancelWork() {
    if (animation !== null) cancelAnimationFrame(animation);
    if (background !== null) {
      if (idleAvailable) cancelIdleCallback(background);
      else clearTimeout(background);
    }
    animation = background = null;
    urgent.clear();
    scans.clear();
  }

  function apply(next = enabled) {
    const same = enabled === next;
    enabled = next;
    const root = document.documentElement;
    if (!root) return;
    const value = enabled ? "on" : "off";
    if (same && root.getAttribute(flag) === value) return;
    observer?.disconnect();
    cancelWork();
    root.setAttribute(flag, value);
    if (!enabled) return;
    queueScan(root);
    observer ??= new MutationObserver(records => {
      for (const record of records) {
        if (record.type === "attributes") queueScan(record.target);
        else for (const node of record.addedNodes) queueScan(node);
      }
    });
    observer.observe(root, {
      subtree: true, childList: true, attributes: true, attributeFilter: ["class", "style"]
    });
  }

  let changed = false;
  browser.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes[key]) {
      changed = true;
      apply(changes[key].newValue !== false);
    }
  });
  if (document.documentElement) apply();
  else {
    const ready = new MutationObserver(() => {
      if (document.documentElement) { ready.disconnect(); apply(); }
    });
    ready.observe(document, { childList: true });
  }
  browser.storage.local.get(key).then(settings => {
    if (!changed) apply(settings[key] !== false);
  }).catch(() => { /* Keep the requested theme usable when storage is unavailable. */ });
})();
