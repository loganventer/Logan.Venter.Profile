export const portfolio = {
  overview: {
    title: "Portfolio Site Overview",
    description: "This portfolio is a static single-page site deployed on Netlify. It uses a JAMstack architecture: static HTML, CSS, and JavaScript on the frontend with Netlify serverless functions powering the backend. There is no build step or framework — the site is hand-crafted with vanilla HTML, Tailwind CSS via CDN, and modular ES6 JavaScript for maximum performance and zero build dependencies.",
  },
  frontend: {
    title: "Frontend Architecture",
    description: "The frontend is a single-page application built with vanilla HTML5, Tailwind CSS via CDN, and modular ES6 JavaScript following iDesign principles. The JS codebase uses contracts (IComponent, IEffect), core infrastructure (EventBus, ScrollObserver), and composition-based module assembly via app.js. Navigation uses a section-based architecture where clicking menu items shows and hides content sections with smooth CSS transitions. The design is fully responsive with a slide-out mobile menu, keyboard-accessible dropdown navigation, and ARIA attributes for screen reader support.",
  },
  theming: {
    title: "Theme System",
    description: "The site features a dark/light theme toggle implemented entirely through CSS custom properties on the root element, with a data-theme attribute controlling which palette is active. A small inline script in the HTML head reads the user's saved preference from localStorage before CSS loads, preventing any flash of the wrong theme. Tailwind utility classes are overridden per-theme using CSS attribute selectors. The neural network background and Mermaid diagrams also adapt their color palettes when the theme changes via EventBus.",
  },
  neuralBackground: {
    title: "Neural Network Background Animation",
    description: "The animated background is a custom canvas-based particle system that renders an interactive neural network visualization. It uses a quadtree spatial index for efficient neighbor detection, allowing smooth performance even with many particles. Features include dynamic signal propagation along connections with glow effects, automatic particle density reduction when frame rates drop, visibility-based pausing when the browser tab is inactive, and prefers-reduced-motion support. The animation adapts its color palette to match the current theme.",
  },
  chatbot: {
    title: "AI Chatbot Implementation",
    description: "The chatbot is an agentic AI assistant powered by Anthropic's Claude. It runs as a serverless function that receives user messages, wraps them in security delimiters, and orchestrates multi-turn tool-calling conversations with the Claude API. The bot has access to a structured knowledge base about Logan's experience, skills, projects, and education, which it queries through a hybrid RAG pipeline using BM25 and HyDE before responding. Responses are streamed to the browser using Server-Sent Events and rendered with a custom Markdown parser that supports code blocks, Mermaid diagrams, lists, headings, and inline formatting. After each response, the chatbot generates contextual follow-up suggestion chips that users can click to explore related topics, creating a guided conversational experience.",
  },
  chatbotSecurity: {
    title: "Chatbot Security Design",
    description: "The chatbot implements multiple layers of agentic AI security. User input is sanitized and wrapped in spotlighting delimiters to prevent prompt injection. The system prompt enforces strict boundaries so the bot will not follow user instructions that contradict its guidelines, reveal its configuration, or adopt alternate personas. Tool inputs are validated for type and length. All bot output passes through a filter that detects and blocks system prompt leakage patterns. The bot is strictly grounded in its knowledge base and will not fabricate facts.",
  },
  accessControl: {
    title: "Chatbot Access Control",
    description: "Access to the chatbot is gated behind a tiered token-based approval system with multi-layer anti-abuse protection. First-time visitors are auto-approved with a 5-minute HMAC-SHA256 signed token for instant access. After 3 auto-approvals, the system requires manual admin approval. Anti-abuse tracking uses three dimensions stored in a managed blob store: IP address, a persistent device UUID (localStorage-based, generated via crypto.randomUUID), and a hardware browser fingerprint (SHA-256 hash of canvas rendering, WebGL GPU renderer/vendor, screen resolution, color depth, pixel ratio, navigator language, platform, hardware concurrency, max touch points, and timezone). All three dimensions must be under the limit for auto-approval, preventing bypass via IP rotation, localStorage clearing, or incognito mode individually. When manual approval is required, visitors provide their email address and are notified via Resend email when the admin approves their request, with a direct link to the chatbot. The admin portal supports approve, deny, revoke, message limit reset, and emergency clear operations. Server-side message counting enforces a per-token demo limit of 25 messages.",
  },
  mermaidDiagrams: {
    title: "Mermaid Diagram Support",
    description: "Both the project showcase cards and the chatbot support Mermaid diagrams for visualizing architectures and workflows. Diagrams are rendered client-side with a custom theme configuration. A PNG download feature captures the rendered SVG, inlines all computed styles for standalone rendering, and exports at 4x resolution on a white background. The diagram color palette adapts to the current theme with separate pastel palettes for project cards and chatbot responses.",
  },
  pwa: {
    title: "Progressive Web App Features",
    description: "The site is a Progressive Web App with a service worker that caches static assets for offline access. It includes a web app manifest for installability, Apple touch icon support, and a theme color for the browser chrome. The service worker uses a cache-first strategy for static assets while always fetching serverless function calls fresh from the network.",
  },
  deployment: {
    title: "Deployment and Hosting",
    description: "The site is hosted on Netlify with automatic deployments from Git. Serverless functions run on the Node.js runtime and are bundled with esbuild. A build step generates the pre-computed RAG index as an ES module that gets inlined into the function bundle at deploy time. The domain is loganventer.com with HTTPS enforced. Security headers including Content Security Policy, X-Frame-Options, and Referrer-Policy are configured at the hosting level.",
  },
  mcpIntegration: {
    title: "Microsoft Learn MCP Integration",
    description: "The chatbot integrates with the Microsoft Learn MCP (Model Context Protocol) server to provide real-time access to official Microsoft documentation, code samples, and technical references. The integration uses a SOLID-architecture tool provider system where local knowledge base tools and remote MCP tools are composed through a unified tool registry. The MCP client connects per-request using Streamable HTTP transport, discovers available tools dynamically via the tools/list protocol method, and gracefully degrades if the remote server is unavailable. This demonstrates proficiency with MCP client implementation, dependency inversion, composition-based architecture, and the iDesign layered methodology (Manager, Engine, Resource Accessor, Utility).",
  },
  ragPipeline: {
    title: "Hybrid RAG Pipeline",
    description: "The chatbot's knowledge retrieval uses a hybrid RAG (Retrieval-Augmented Generation) pipeline combining BM25 scoring, HyDE (Hypothetical Document Embeddings), query expansion, and Reciprocal Rank Fusion (RRF). At build time, the knowledge base is chunked into segments and a BM25 inverted index is pre-computed with TF-IDF weighting, then output as an ES module that esbuild inlines into the function bundle. At query time, static synonym expansion broadens the search terms, BM25 scores chunks against the expanded query, and HyDE asks Claude to generate a hypothetical answer paragraph which is then BM25-matched against chunks to capture semantic intent without dense vector embeddings. The two ranked lists are fused using RRF (k=60) to produce the top-5 results. The entire pipeline is pure JavaScript with no external embedding APIs — only Anthropic's Claude for the HyDE step. HyDE gracefully degrades with a 3-second timeout, falling back to BM25-only retrieval. This demonstrates established agentic AI design patterns: retrieval augmentation, hypothetical document embeddings, rank fusion, and query expansion.",
  },
};
