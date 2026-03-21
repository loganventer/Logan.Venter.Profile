import { IComponent } from '../contracts/IComponent.js';

/**
 * Mermaid SVG theme override for project cards and chatbot diagrams.
 * Listens to theme-change events via EventBus.
 */
export class MermaidTheme extends IComponent {
  constructor(eventBus) {
    super();
    this._eventBus = eventBus;
    this._unsubscribe = null;
  }

  mount() {
    // Expose globally for chatbot mermaid rendering
    window.updateMermaidTheme = (theme) => this._applyTheme(theme);

    // Listen for theme changes
    this._unsubscribe = this._eventBus.on('theme-change', (theme) => {
      this._applyTheme(theme);
    });
  }

  unmount() {
    if (this._unsubscribe) this._unsubscribe();
    delete window.updateMermaidTheme;
  }

  _applyTheme(theme) {
    const isLight = theme === 'light';
    const ATTR = 'data-orig-style';

    function overrideEls(svg, selector, applyFn) {
      svg.querySelectorAll(selector).forEach(function (el) {
        if (isLight) {
          if (!el.hasAttribute(ATTR)) {
            el.setAttribute(ATTR, el.getAttribute('style') || '');
          }
          applyFn(el);
        } else if (el.hasAttribute(ATTR)) {
          var orig = el.getAttribute(ATTR);
          if (orig) {
            el.setAttribute('style', orig);
          } else {
            el.removeAttribute('style');
          }
          el.removeAttribute(ATTR);
        }
      });
    }

    // Pastel palettes per project accent color
    var palettes = {
      blue: { fill: '#dbeafe', stroke: '#60a5fa' },
      green: { fill: '#d1fae5', stroke: '#34d399' },
      amber: { fill: '#fef3c7', stroke: '#fbbf24' },
      purple: { fill: '#ede9fe', stroke: '#a78bfa' }
    };

    // === Project card diagrams ===
    document.querySelectorAll('.project-card').forEach(function (card) {
      var svg = card.querySelector('svg');
      if (!svg) return;

      var p = palettes.blue;
      if (card.querySelector('.project-card-accent-green')) p = palettes.green;
      else if (card.querySelector('.project-card-accent-amber')) p = palettes.amber;
      else if (card.querySelector('.project-card-accent-purple')) p = palettes.purple;

      overrideEls(svg, '.node rect, .node polygon, .node circle', function (el) {
        var orig = el.getAttribute(ATTR) || '';
        var isNeutral = orig.indexOf('1e293b') !== -1;
        el.style.setProperty('fill', isNeutral ? '#f1f5f9' : p.fill, 'important');
        el.style.setProperty('stroke', p.stroke, 'important');
      });
      overrideEls(svg, '.nodeLabel', function (el) {
        el.style.setProperty('color', '#1e293b', 'important');
      });
      svg.querySelectorAll('.edgeLabel rect, .edgeLabel polygon').forEach(function (el) {
        el.style.setProperty('fill', isLight ? '#e2e8f0' : '#1e293b', 'important');
        el.style.setProperty('stroke', 'none', 'important');
      });
      svg.querySelectorAll('.edgeLabel span').forEach(function (el) {
        el.style.setProperty('color', isLight ? '#334155' : '#e2e8f0', 'important');
      });
      overrideEls(svg, '.flowchart-link', function (el) {
        el.style.setProperty('stroke', '#94a3b8', 'important');
      });
      overrideEls(svg, 'marker path', function (el) {
        el.style.setProperty('fill', '#94a3b8', 'important');
        el.style.setProperty('stroke', '#94a3b8', 'important');
      });
    });

    // === Chatbot diagrams (varied node colors) ===
    var chatNodePalettes = isLight ? [
      { fill: '#dbeafe', stroke: '#60a5fa', text: '#1e40af' },
      { fill: '#d1fae5', stroke: '#34d399', text: '#065f46' },
      { fill: '#fef3c7', stroke: '#fbbf24', text: '#92400e' },
      { fill: '#ede9fe', stroke: '#a78bfa', text: '#5b21b6' },
      { fill: '#fce7f3', stroke: '#f472b6', text: '#9d174d' },
      { fill: '#cffafe', stroke: '#22d3ee', text: '#155e75' },
      { fill: '#ffedd5', stroke: '#fb923c', text: '#9a3412' },
      { fill: '#e0e7ff', stroke: '#818cf8', text: '#3730a3' }
    ] : [
      { fill: '#1e3a5f', stroke: '#3b82f6', text: '#93c5fd' },
      { fill: '#1a3a2a', stroke: '#10b981', text: '#6ee7b7' },
      { fill: '#3b2a1a', stroke: '#f59e0b', text: '#fcd34d' },
      { fill: '#2a1a3b', stroke: '#8b5cf6', text: '#c4b5fd' },
      { fill: '#3b1a2a', stroke: '#f472b6', text: '#fbcfe8' },
      { fill: '#1a3b3b', stroke: '#22d3ee', text: '#a5f3fc' },
      { fill: '#3b2514', stroke: '#fb923c', text: '#fed7aa' },
      { fill: '#1e1a3b', stroke: '#818cf8', text: '#c7d2fe' }
    ];
    var chatEdgeBg = isLight ? '#e2e8f0' : '#0f172a';
    var chatEdgeText = isLight ? '#334155' : '#cbd5e1';
    var chatLine = isLight ? '#94a3b8' : '#64748b';

    document.querySelectorAll('.chat-mermaid-block svg').forEach(function (svg) {
      svg.querySelectorAll('.node').forEach(function (node, i) {
        var cp = chatNodePalettes[i % chatNodePalettes.length];
        node.querySelectorAll('rect, polygon, circle').forEach(function (el) {
          el.style.setProperty('fill', cp.fill, 'important');
          el.style.setProperty('fill-opacity', isLight ? '1' : '0.55', 'important');
          el.style.setProperty('stroke', cp.stroke, 'important');
        });
        node.querySelectorAll('.nodeLabel').forEach(function (el) {
          el.style.setProperty('color', cp.text, 'important');
        });
      });
      svg.querySelectorAll('.edgeLabel rect, .edgeLabel polygon').forEach(function (el) {
        el.style.setProperty('fill', chatEdgeBg, 'important');
        el.style.setProperty('stroke', 'none', 'important');
      });
      svg.querySelectorAll('.edgeLabel span').forEach(function (el) {
        el.style.setProperty('color', chatEdgeText, 'important');
      });
      svg.querySelectorAll('.flowchart-link').forEach(function (el) {
        el.style.setProperty('stroke', chatLine, 'important');
      });
      svg.querySelectorAll('marker path').forEach(function (el) {
        el.style.setProperty('fill', chatLine, 'important');
        el.style.setProperty('stroke', chatLine, 'important');
      });
    });
  }
}
