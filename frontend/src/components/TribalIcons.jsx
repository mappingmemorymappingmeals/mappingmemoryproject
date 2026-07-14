// Warli / Santal inspired geometric line icons — 24x24 viewBox, stroke-based
// SECURITY: icon markup is static & internal, but we never inject raw HTML.
// Markup is parsed with DOMParser and rebuilt through an allow-list of safe
// SVG tags/attributes (no dangerouslySetInnerHTML / innerHTML anywhere).
import React from "react";

export const ICON_PATHS = {
  pot: '<path d="M8 4h8M9 4c0 2-2 3-2 5 0 4 2 7 5 7s5-3 5-7c0-2-2-3-2-5"/><path d="M12 16v3"/><path d="M9 21h6"/><circle cx="12" cy="9" r="1" fill="currentColor" stroke="none"/>',
  grain: '<path d="M12 21V8"/><path d="M12 8c-3 0-4-2-4-4 2 0 4 1 4 4zM12 8c3 0 4-2 4-4-2 0-4 1-4 4z"/><path d="M12 13c-3 0-4-2-4-4 2 0 4 1 4 4zM12 13c3 0 4-2 4-4-2 0-4 1-4 4z"/><path d="M12 18c-3 0-4-2-4-4 2 0 4 1 4 4zM12 18c3 0 4-2 4-4-2 0-4 1-4 4z"/>',
  root: '<path d="M12 3v5"/><path d="M9 5c1 1 2 2 3 3 1-1 2-2 3-3"/><path d="M12 8c-4 1-5 4-5 7 0 3 2 6 5 6s5-3 5-6c0-3-1-6-5-7z"/><path d="M10 13l4 4M14 13l-4 4"/>',
  mushroom: '<path d="M4 12c0-5 4-8 8-8s8 3 8 8H4z"/><path d="M9 12l-1 6c0 2 1 3 4 3s4-1 4-3l-1-6"/><circle cx="9" cy="8" r="0.8" fill="currentColor" stroke="none"/><circle cx="14" cy="7" r="0.8" fill="currentColor" stroke="none"/>',
  leaf: '<path d="M5 19C5 9 12 4 20 4c0 9-5 15-15 15z"/><path d="M5 19c3-5 7-9 11-11"/>',
  fish: '<path d="M3 12c3-4 7-6 11-6 3 0 6 2 7 6-1 4-4 6-7 6-4 0-8-2-11-6z"/><path d="M14 6l3 6-3 6"/><circle cx="7" cy="11" r="1" fill="currentColor" stroke="none"/>',
  flame: '<path d="M12 3c1 3 5 5 5 10a5 5 0 01-10 0c0-3 1-4 2-6 1 2 2 3 3 3 0-3-1-5 0-7z"/><path d="M7 21h10"/>',
  ant: '<circle cx="12" cy="6" r="2"/><circle cx="12" cy="12" r="2.5"/><circle cx="12" cy="18" r="2"/><path d="M9 5L6 3M15 5l3-2M9 12H4M20 12h-5M9 19l-3 2M15 19l3 2"/>',
  fruit: '<circle cx="12" cy="14" r="6"/><path d="M12 8c0-3 1-4 3-5"/><path d="M12 8c2-2 4-2 5-1"/>',
  herb: '<path d="M12 21v-9"/><path d="M12 12c0-4 3-6 6-6 0 4-2 6-6 6zM12 12c0-4-3-6-6-6 0 4 2 6 6 6z"/><path d="M9 18h6M12 15v6"/>',
  altar: '<path d="M12 3c1 2 3 3 3 6a3 3 0 11-6 0c0-3 2-4 3-6z"/><path d="M5 15h14M7 15l-1 6M17 15l1 6M12 15v6"/>',
  bowl: '<path d="M4 11h16c0 5-3 8-8 8s-8-3-8-8z"/><path d="M9 7c0-2 1-3 3-3s3 1 3 3"/>',
  pitha: '<path d="M12 3l8 9-8 9-8-9z"/><path d="M12 8l4 4-4 4-4-4z"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/>',
  ecology: '<path d="M4 18c2-6 6-10 12-12-1 7-5 11-12 12z"/><path d="M3 21c4-2 8-2 12 0M4 18c2-2 5-5 8-7"/>',
  community: '<circle cx="12" cy="5" r="2"/><path d="M12 7v4M8 21l4-10 4 10M9 16h6"/><circle cx="5" cy="9" r="1.5"/><path d="M5 10.5V13M3.5 17l1.5-4 1.5 4"/><circle cx="19" cy="9" r="1.5"/><path d="M19 10.5V13M17.5 17l1.5-4 1.5 4"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.5 4.5l2 2M17.5 17.5l2 2M19.5 4.5l-2 2M6.5 17.5l-2 2"/>',
  drum: '<ellipse cx="12" cy="7" rx="7" ry="2.5"/><path d="M5 7v9c0 1.5 3 2.8 7 2.8s7-1.3 7-2.8V7"/><path d="M5 11l14 3M19 11L5 14"/>',
  scroll: '<path d="M6 4h10a2 2 0 012 2v12a2 2 0 01-2 2H8a2 2 0 01-2-2z"/><path d="M6 4a2 2 0 00-2 2v2h4"/><path d="M10 9h5M10 12h5M10 15h3"/>',
  broken: '<path d="M9 4a8 8 0 00-5 8 8 8 0 008 8M15 4a8 8 0 015 8"/><path d="M15 20l2-3M19 17l-2-1M14 16l3 4"/>',
  weave: '<path d="M4 8l8-5 8 5-8 5z"/><path d="M4 8v8l8 5 8-5V8"/><path d="M12 13v8"/>',
  pin: '<path d="M12 21s-6-6-6-11a6 6 0 1112 0c0 5-6 11-6 11z"/><circle cx="12" cy="10" r="2"/>',
  eye: '<path d="M2 12c3-5 6.5-7 10-7s7 2 10 7c-3 5-6.5 7-10 7s-7-2-10-7z"/><circle cx="12" cy="12" r="3"/>',
  spiral: '<path d="M12 12a2 2 0 104 0 4 4 0 10-8 0 6 6 0 1012 0 8 8 0 10-16 0"/>',
  music: '<path d="M9 18V5l10-2v13"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/>',
  camera: '<path d="M4 8h3l2-3h6l2 3h3a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V9a1 1 0 011-1z"/><circle cx="12" cy="13" r="3.5"/>',
};

const SVG_NS = "http://www.w3.org/2000/svg";
const ALLOWED_TAGS = new Set(["path", "circle", "ellipse", "rect", "line", "polyline", "polygon"]);

// Parse static icon markup into sanitized SVG child nodes (allow-listed tags only)
function parseIconNodes(markup) {
  const doc = new DOMParser().parseFromString(`<svg xmlns="${SVG_NS}">${markup}</svg>`, "image/svg+xml");
  if (doc.querySelector("parsererror")) {
    console.warn("TribalIcons: failed to parse icon markup");
    return [];
  }
  return Array.from(doc.documentElement.children).filter((n) => ALLOWED_TAGS.has(n.tagName.toLowerCase()));
}

function isSafeAttr(name) {
  const an = name.toLowerCase();
  return !an.startsWith("on") && !an.includes("href") && an !== "style";
}

// Cache of parsed React element arrays per icon name (static content)
const reactElementCache = new Map();

function iconReactElements(name) {
  if (reactElementCache.has(name)) return reactElementCache.get(name);
  const els = parseIconNodes(ICON_PATHS[name] || ICON_PATHS.bowl).map((node, i) => {
    const tag = node.tagName.toLowerCase();
    const props = { key: `${name}-${tag}-${i}` };
    for (const attr of Array.from(node.attributes)) {
      if (!isSafeAttr(attr.name)) continue;
      const an = attr.name.toLowerCase();
      props[an === "stroke-width" ? "strokeWidth" : an] = attr.value;
    }
    return React.createElement(tag, props);
  });
  reactElementCache.set(name, els);
  return els;
}

export function TribalIcon({ name, size = 18, color = "currentColor", strokeWidth = 1.5, className = "" }) {
  const iconName = ICON_PATHS[name] ? name : "bowl";
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {iconReactElements(iconName)}
    </svg>
  );
}

// Build a real (sanitized) SVG DOM element — used for MapLibre marker elements.
// Replaces the old iconSvgString/innerHTML approach.
export function buildIconSvgElement(name, color = "#E8CBA8", strokeWidth = 1.6) {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", color);
  svg.setAttribute("stroke-width", String(strokeWidth));
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  parseIconNodes(ICON_PATHS[name] ? ICON_PATHS[name] : ICON_PATHS.bowl).forEach((node) => {
    const child = document.createElementNS(SVG_NS, node.tagName.toLowerCase());
    Array.from(node.attributes).forEach((attr) => {
      if (isSafeAttr(attr.name)) child.setAttribute(attr.name, attr.value);
    });
    svg.appendChild(child);
  });
  return svg;
}

// Decorative Warli figure strip (dancing stick figures holding hands)
export function WarliStrip({ color = "#C89B6C", count = 5, size = 16 }) {
  const fig = (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round">
      <circle cx="12" cy="5" r="2.4" />
      <path d="M12 7.5L9 13h6zM9 13l-2 6M15 13l2 6M12 7.5 5 10M12 7.5l7 2.5" />
    </svg>
  );
  return (
    <div className="warli-strip" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => `warli-fig-${i}`).map((figId, i) => (
        <span key={figId} style={{ transform: i % 2 ? "scaleX(-1)" : "none" }}>{fig}</span>
      ))}
    </div>
  );
}
