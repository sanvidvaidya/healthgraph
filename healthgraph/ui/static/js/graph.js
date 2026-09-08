/**
 * HealthGraph Interactive Relationship Graph Engine (Bespoke SVG).
 * Zero external libraries (no D3, no external CDNs) for complete local determinism.
 * Implements pan, zoom, force simulation, node selection, edge highlighting, and inspection.
 */

class HealthGraphVisualizer {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.options = Object.assign({
      onNodeClick: null,
      width: this.container.clientWidth || 900,
      height: 600
    }, options);

    this.nodes = [];
    this.edges = [];
    this.selectedNodeId = null;

    // Viewbox & Transform state
    this.transform = { x: 0, y: 0, scale: 1 };
    this.isDragging = false;
    this.dragStart = { x: 0, y: 0 };

    this.nodeColors = {
      Patient: "#0C5A56",
      Encounter: "#2C4258",
      Observation: "#3E6990",
      Condition: "#8C5800",
      Procedure: "#6B4C82",
      DiagnosticReport: "#237265",
      MedicationRequest: "#9C4221",
      Practitioner: "#4A525A",
      Organization: "#3A506B",
      Unresolved: "#9E2A2B"
    };

    this.initSVG();
    this.bindEvents();
  }

  initSVG() {
    this.container.innerHTML = `
      <div class="graph-controls" aria-label="Graph Zoom and Reset Controls">
        <button class="btn btn-sm btn-secondary" id="graph-zoom-in" title="Zoom In" aria-label="Zoom In">+</button>
        <button class="btn btn-sm btn-secondary" id="graph-zoom-out" title="Zoom Out" aria-label="Zoom Out">-</button>
        <button class="btn btn-sm btn-secondary" id="graph-zoom-reset" title="Reset View" aria-label="Reset View">⊙</button>
      </div>
      <div class="graph-legend">
        <div class="legend-item"><span class="legend-color" style="background:#0C5A56"></span> Patient</div>
        <div class="legend-item"><span class="legend-color" style="background:#2C4258"></span> Encounter</div>
        <div class="legend-item"><span class="legend-color" style="background:#3E6990"></span> Observation</div>
        <div class="legend-item"><span class="legend-color" style="background:#8C5800"></span> Condition</div>
        <div class="legend-item"><span class="legend-color" style="background:#9C4221"></span> Medication</div>
        <div class="legend-item"><span class="legend-color" style="background:#6B4C82"></span> Procedure</div>
        <div class="legend-item"><span class="legend-color" style="background:#4A525A"></span> Practitioner</div>
        <div class="legend-item"><span class="legend-color" style="background:#9E2A2B"></span> Unresolved</div>
      </div>
      <svg id="healthgraph-svg" width="100%" height="100%" viewBox="0 0 ${this.options.width} ${this.options.height}">
        <defs>
          <marker id="arrowhead" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#888" />
          </marker>
          <marker id="arrowhead-highlight" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#0C5A56" />
          </marker>
        </defs>
        <g id="viewport-group">
          <g id="edges-layer"></g>
          <g id="edge-labels-layer"></g>
          <g id="nodes-layer"></g>
        </g>
      </svg>
    `;

    this.svg = document.getElementById("healthgraph-svg");
    this.viewport = document.getElementById("viewport-group");
    this.edgesLayer = document.getElementById("edges-layer");
    this.edgeLabelsLayer = document.getElementById("edge-labels-layer");
    this.nodesLayer = document.getElementById("nodes-layer");
  }

  bindEvents() {
    // Pan via SVG drag
    this.svg.addEventListener("mousedown", (e) => {
      if (e.target.closest(".graph-node")) return;
      this.isDragging = true;
      this.dragStart = { x: e.clientX - this.transform.x, y: e.clientY - this.transform.y };
      this.svg.style.cursor = "grabbing";
    });

    window.addEventListener("mousemove", (e) => {
      if (!this.isDragging) return;
      this.transform.x = e.clientX - this.dragStart.x;
      this.transform.y = e.clientY - this.dragStart.y;
      this.applyTransform();
    });

    window.addEventListener("mouseup", () => {
      this.isDragging = false;
      this.svg.style.cursor = "grab";
    });

    // Zoom via wheel
    this.svg.addEventListener("wheel", (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      this.zoomAtPoint(zoomFactor, e.clientX, e.clientY);
    }, { passive: false });

    // Zoom buttons
    document.getElementById("graph-zoom-in").addEventListener("click", () => this.zoomStep(1.2));
    document.getElementById("graph-zoom-out").addEventListener("click", () => this.zoomStep(0.8));
    document.getElementById("graph-zoom-reset").addEventListener("click", () => this.resetView());
  }

  zoomStep(factor) {
    const rect = this.svg.getBoundingClientRect();
    this.zoomAtPoint(factor, rect.left + rect.width / 2, rect.top + rect.height / 2);
  }

  zoomAtPoint(factor, clientX, clientY) {
    const rect = this.svg.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const newScale = Math.max(0.2, Math.min(3.5, this.transform.scale * factor));
    this.transform.x = x - (x - this.transform.x) * (newScale / this.transform.scale);
    this.transform.y = y - (y - this.transform.y) * (newScale / this.transform.scale);
    this.transform.scale = newScale;
    this.applyTransform();
  }

  resetView() {
    this.transform = { x: 0, y: 0, scale: 1 };
    this.applyTransform();
  }

  applyTransform() {
    this.viewport.setAttribute("transform", `translate(${this.transform.x}, ${this.transform.y}) scale(${this.transform.scale})`);
  }

  setData(data) {
    this.nodes = (data.nodes || []).map(n => Object.assign({}, n));
    this.edges = (data.edges || []).map(e => Object.assign({}, e));
    this.layoutNodes();
    this.render();
  }

  layoutNodes() {
    // Deterministic organic circular/force layout
    const w = this.options.width;
    const h = this.options.height;
    const cx = w / 2;
    const cy = h / 2;

    const nodeMap = new Map();
    this.nodes.forEach((n, idx) => {
      nodeMap.set(n.id, n);
      // Group by resourceType
      if (n.resourceType === "Patient") {
        n.x = cx;
        n.y = cy;
      } else if (n.resourceType === "Encounter") {
        const angle = (idx * 1.3) % (2 * Math.PI);
        n.x = cx + Math.cos(angle) * 160;
        n.y = cy + Math.sin(angle) * 140;
      } else if (n.resourceType === "Observation") {
        const angle = (idx * 0.7) % (2 * Math.PI);
        const dist = 260 + (idx % 3) * 35;
        n.x = cx + Math.cos(angle) * dist;
        n.y = cy + Math.sin(angle) * dist;
      } else if (n.resourceType === "Practitioner" || n.resourceType === "Organization") {
        const angle = (idx * 2.1) % (2 * Math.PI);
        n.x = cx + Math.cos(angle) * 360;
        n.y = cy + Math.sin(angle) * 240;
      } else {
        const angle = (idx * 0.9) % (2 * Math.PI);
        const dist = 220 + (idx % 2) * 40;
        n.x = cx + Math.cos(angle) * dist;
        n.y = cy + Math.sin(angle) * dist;
      }
    });

    // Run simple force relaxation step to prevent overlap
    for (let iter = 0; iter < 40; iter++) {
      for (let i = 0; i < this.nodes.length; i++) {
        for (let j = i + 1; j < this.nodes.length; j++) {
          const a = this.nodes[i];
          const b = this.nodes[j];
          let dx = b.x - a.x;
          let dy = b.y - a.y;
          let dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const minDist = 70;
          if (dist < minDist) {
            const f = (minDist - dist) / dist * 0.15;
            if (a.resourceType !== "Patient") {
              a.x -= dx * f;
              a.y -= dy * f;
            }
            if (b.resourceType !== "Patient") {
              b.x += dx * f;
              b.y += dy * f;
            }
          }
        }
      }
    }
  }

  render() {
    this.edgesLayer.innerHTML = "";
    this.edgeLabelsLayer.innerHTML = "";
    this.nodesLayer.innerHTML = "";

    const nodeMap = new Map(this.nodes.map(n => [n.id, n]));

    // Render Edges
    this.edges.forEach((edge, idx) => {
      const src = nodeMap.get(edge.source);
      const tgt = nodeMap.get(edge.target);
      if (!src || !tgt) return;

      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      const d = `M ${src.x} ${src.y} L ${tgt.x} ${tgt.y}`;
      path.setAttribute("d", d);
      path.setAttribute("class", `graph-edge edge-src-${this.cleanId(edge.source)} edge-tgt-${this.cleanId(edge.target)}`);
      path.setAttribute("stroke", edge.isResolved === false ? "#9E2A2B" : "#C8C4B7");
      path.setAttribute("stroke-width", "1.5");
      if (edge.isResolved === false) {
        path.setAttribute("stroke-dasharray", "4,3");
      }
      path.setAttribute("fill", "none");
      path.setAttribute("marker-end", "url(#arrowhead)");
      this.edgesLayer.appendChild(path);

      // Edge label
      if (edge.label && this.nodes.length < 50) {
        const mx = (src.x + tgt.x) / 2;
        const my = (src.y + tgt.y) / 2;
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", mx);
        text.setAttribute("y", my - 4);
        text.setAttribute("font-size", "9");
        text.setAttribute("font-family", "ui-monospace, SF Mono, Menlo, monospace");
        text.setAttribute("fill", "#7E8790");
        text.setAttribute("text-anchor", "middle");
        text.textContent = edge.label;
        this.edgeLabelsLayer.appendChild(text);
      }
    });

    // Render Nodes
    this.nodes.forEach((node) => {
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.setAttribute("class", `graph-node node-${this.cleanId(node.id)}`);
      g.setAttribute("transform", `translate(${node.x}, ${node.y})`);
      g.setAttribute("tabindex", "0");
      g.setAttribute("role", "button");
      g.setAttribute("aria-label", `${node.resourceType}: ${node.title}`);
      g.style.cursor = "pointer";

      const color = node.isDangling ? this.nodeColors.Unresolved : (this.nodeColors[node.resourceType] || "#4A525A");
      const radius = node.resourceType === "Patient" ? 22 : (node.resourceType === "Encounter" ? 18 : 14);

      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("r", radius);
      circle.setAttribute("fill", color);
      circle.setAttribute("stroke", node.isDangling ? "#E8A8A9" : "#FFF");
      circle.setAttribute("stroke-width", "2");
      if (node.isDangling) {
        circle.setAttribute("stroke-dasharray", "3,2");
      }
      g.appendChild(circle);

      // Node label
      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("y", radius + 12);
      text.setAttribute("font-size", "11");
      text.setAttribute("font-family", "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif");
      text.setAttribute("font-weight", "500");
      text.setAttribute("fill", "#181B1E");
      text.setAttribute("text-anchor", "middle");
      
      const label = node.title.length > 20 ? node.title.substring(0, 18) + "…" : node.title;
      text.textContent = label;
      g.appendChild(text);

      // Node Type initials
      const initials = document.createElementNS("http://www.w3.org/2000/svg", "text");
      initials.setAttribute("y", "4");
      initials.setAttribute("font-size", radius >= 18 ? "11" : "9");
      initials.setAttribute("font-weight", "700");
      initials.setAttribute("font-family", "ui-monospace, SF Mono, monospace");
      initials.setAttribute("fill", "#FFF");
      initials.setAttribute("text-anchor", "middle");
      initials.textContent = node.resourceType.substring(0, 2).toUpperCase();
      g.appendChild(initials);

      // Event Listeners
      g.addEventListener("click", (e) => {
        e.stopPropagation();
        this.selectNode(node);
      });

      g.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this.selectNode(node);
        }
      });

      this.nodesLayer.appendChild(g);
    });
  }

  selectNode(node) {
    this.selectedNodeId = node.id;
    const cleanId = this.cleanId(node.id);

    // Dim other elements
    document.querySelectorAll(".graph-node").forEach(el => el.style.opacity = "0.25");
    document.querySelectorAll(".graph-edge").forEach(el => {
      el.style.opacity = "0.15";
      el.setAttribute("stroke", "#C8C4B7");
      el.setAttribute("stroke-width", "1.5");
      el.setAttribute("marker-end", "url(#arrowhead)");
    });

    // Highlight selected node
    const selEl = document.querySelector(`.node-${cleanId}`);
    if (selEl) {
      selEl.style.opacity = "1";
      selEl.querySelector("circle").setAttribute("stroke", "#181B1E");
      selEl.querySelector("circle").setAttribute("stroke-width", "3");
    }

    // Highlight adjacent nodes and edges
    this.edges.forEach(edge => {
      if (edge.source === node.id || edge.target === node.id) {
        const otherId = edge.source === node.id ? edge.target : edge.source;
        const otherEl = document.querySelector(`.node-${this.cleanId(otherId)}`);
        if (otherEl) otherEl.style.opacity = "1";

        const edgeEls = document.querySelectorAll(`.edge-src-${this.cleanId(edge.source)}.edge-tgt-${this.cleanId(edge.target)}`);
        edgeEls.forEach(el => {
          el.style.opacity = "1";
          el.setAttribute("stroke", "#0C5A56");
          el.setAttribute("stroke-width", "2.5");
          el.setAttribute("marker-end", "url(#arrowhead-highlight)");
        });
      }
    });

    if (this.options.onNodeClick) {
      this.options.onNodeClick(node);
    }
  }

  clearSelection() {
    this.selectedNodeId = null;
    document.querySelectorAll(".graph-node").forEach(el => {
      el.style.opacity = "1";
      el.querySelector("circle").setAttribute("stroke", "#FFF");
      el.querySelector("circle").setAttribute("stroke-width", "2");
    });
    document.querySelectorAll(".graph-edge").forEach(el => {
      el.style.opacity = "1";
      el.setAttribute("stroke", "#C8C4B7");
      el.setAttribute("stroke-width", "1.5");
      el.setAttribute("marker-end", "url(#arrowhead)");
    });
  }

  cleanId(str) {
    return (str || "").replace(/[^a-zA-Z0-9_-]/g, "_");
  }
}

window.HealthGraphVisualizer = HealthGraphVisualizer;
