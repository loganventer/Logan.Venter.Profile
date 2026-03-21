export const projects = [
  {
    name: "Production MCP Server Framework for .NET 9",
    category: ".NET Framework",
    description:
      "A Model Context Protocol server framework supporting multiple transport protocols with session management, JWT and API key authentication, JSON schema validation, and automatic tool discovery. Built for enterprise AI agent integrations.",
    tech: [".NET 9", "C#", "gRPC", "SignalR", "Polly", "FluentValidation", "LangChain"],
    highlights: [
      "6 transport protocols (stdio, REST, SSE, Streamable HTTP, SignalR, gRPC)",
      "12+ production example server implementations",
      "LangChain/LangGraph integration with Python client support",
      "Session management with JWT and API key authentication",
      "JSON schema validation for tool inputs",
      "Automatic tool discovery from assemblies",
      "Cross-platform Docker deployment (Linux, Mac, Windows)",
    ],
  },
  {
    name: "Enterprise Agentic Chatbot Framework",
    category: "Full-Stack AI Platform",
    description:
      "Full-stack agentic chatbot platform with a 4-project architecture (Framework, Chatbot, Administration, Common) following strict iDesign dependency direction. Features production RAG with 14 chunking strategies, multi-LLM routing, planning coordination, multi-turn security, and admin portal with bot creation wizard.",
    tech: ["Python", "LangChain", "LangGraph", "FastAPI", "React", "TypeScript", "Vite"],
    highlights: [
      "4-project monorepo with strict iDesign dependency direction (Common ← Framework ← Chatbot/Admin)",
      "Production RAG engine with 14 chunking strategies, hybrid retrieval (BM25 + vector), RAPTOR hierarchical summarization, and hallucination detection",
      "Planning coordinator with 3 strategies (ReAct, Plan-Execute, Adaptive) and full agentic tool-calling loop with streaming",
      "Multi-turn security pipeline with prompt injection scanning, risk accumulation/decay, canary tokens, and capability restriction",
      "4 LLM providers (Anthropic, Azure OpenAI, Ollama, GAIA) and 3 embedding providers with factory-based routing",
      "6 vector store integrations (FAISS, Qdrant, Chroma, Pinecone, Weaviate, PKL) with semantic caching",
      "Multi-provider auth (Azure AD, JWT, API key) with RBAC engine",
      "OpenTelemetry + Elasticsearch observability with correlation IDs and A/B testing metrics",
      "Real-time audio transcription via WebSocket",
      "React + TypeScript + Vite frontends for both chatbot and admin UIs",
    ],
  },
  {
    name: "Enterprise Agentic Administration Portal",
    category: "Bot Management Platform",
    description:
      "Admin portal for creating, configuring, and managing chatbot agents. Features a 9-tab bot creation wizard with auto-metadata generation, knowledge base versioning with incremental updates, agent deployment management, and monitoring dashboard.",
    tech: ["Python", "FastAPI", "React", "TypeScript", "Vite"],
    highlights: [
      "9-tab bot creation wizard with real-time validation and SSE progress streaming",
      "LLM-powered auto-generation of bot personality, system prompt, and greetings",
      "Knowledge base versioning with incremental updates (delta detection, embedding reuse)",
      "Agent deployment management with port allocation and health monitoring",
      "In-browser chat playground for testing deployed agents",
      "Dashboard with health status, usage metrics, and error logs",
    ],
  },
  {
    name: "AI-Powered Azure DevOps Integration via MCP",
    category: "Enterprise AI Integration",
    description:
      "MCP server exposing Azure DevOps operations as AI-callable tools. Enables LLM agents to manage work items, pull requests, projects, and relationships through natural language.",
    tech: [".NET 9", "C#", "Azure DevOps REST API", "MCP"],
    highlights: [
      "Work item management through natural language",
      "Pull request operations via AI agents",
      "Project and relationship management as MCP tools",
    ],
  },
  {
    name: "AI-Powered Knowledge Base System",
    category: "Knowledge Management Platform",
    description:
      "Production knowledge management platform with hierarchical document organization, semantic search via vector embeddings, dynamic Qdrant container management, and conversational RAG interface. Includes admin dashboard, file upload, and audit logging.",
    tech: [".NET 9", "Python", "React", "Qdrant", "FastAPI"],
    highlights: [
      "Hierarchical document organization with tagging",
      "Semantic search via vector embeddings",
      "Dynamic Qdrant container management",
      "Conversational RAG interface for natural language queries",
      "Admin dashboard with file upload and audit logging",
    ],
  },
  {
    name: "Hierarchical Code Review Agent System",
    category: "Multi-Agent Orchestration",
    description:
      "Multi-agent system for automated code review and fix orchestration with recursive depth control. 30 specialized agents organized in a hierarchical numbering system covering backend and frontend quality analysis, security, accessibility, performance, and automated fix orchestration.",
    tech: ["Claude Opus", "Claude Sonnet", "Agent Orchestration", "iDesign"],
    highlights: [
      "30 specialized review and fix agents with recursive orchestration",
      "Backend coverage: C#, Java, Python, Go, Node.js, Ruby, Rust, PHP",
      "Frontend coverage: React, Vue, Angular, Svelte",
      "Architecture, security (OWASP), test coverage, accessibility (WCAG), and UX heuristic reviews",
      "Automated fix agents coordinated by master orchestrators",
      "Hierarchical depth control preventing context fragmentation",
    ],
  },
];
