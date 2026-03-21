import { KNOWLEDGE } from './index.mjs';

export function searchKnowledge(query) {
  var q = query.toLowerCase();
  var results = [];

  if (q.includes("about") || q.includes("who") || q.includes("background") || q.includes("summary") || q.includes("bio")) {
    results.push({
      topic: "About",
      content: KNOWLEDGE.about.summary + " Values: " + KNOWLEDGE.about.values.join("; "),
    });
  }

  for (var p of KNOWLEDGE.projects) {
    if (q.includes("project") || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.tech.some(function (t) { return q.includes(t.toLowerCase()); })) {
      results.push({
        topic: "Project: " + p.name,
        content: p.description + " Tech: " + p.tech.join(", ") + ". Highlights: " + p.highlights.join("; "),
      });
    }
  }

  for (var e of KNOWLEDGE.experience) {
    if (q.includes("experience") || q.includes("work") || q.includes("career") || q.includes("job") || e.company.toLowerCase().includes(q) || (e.shortName && q.includes(e.shortName.toLowerCase())) || e.title.toLowerCase().includes(q)) {
      results.push({
        topic: e.title + " at " + e.company + " (" + e.period + ")",
        content: (e.note ? e.note + ". " : "") + "Responsibilities: " + e.responsibilities.join("; "),
      });
    }
  }

  if (q.includes("skill") || q.includes("tech") || q.includes("stack") || q.includes("language") || q.includes("framework") || q.includes("tool")) {
    var langs = KNOWLEDGE.skills.languages.map(function (l) { return l.name + " (" + l.level + "): " + l.description; }).join("; ");
    results.push({
      topic: "Technical Skills",
      content: "Languages: " + langs + ". Frameworks: " + KNOWLEDGE.skills.frameworks.join("; ") + ". Architectural concepts: " + KNOWLEDGE.skills.concepts.join("; "),
    });
  }

  if (q.includes("education") || q.includes("diploma") || q.includes("degree") || q.includes("school") || q.includes("study")) {
    results.push({
      topic: "Education",
      content: KNOWLEDGE.education.map(function (e) { return e.qualification + " from " + e.institution + " - " + e.achievement; }).join(". "),
    });
  }

  if (q.includes("interest") || q.includes("hobby") || q.includes("music") || q.includes("personal") || q.includes("game") || q.includes("app")) {
    results.push({
      topic: "Personal Interests",
      content: "Software: " + KNOWLEDGE.interests.software.join("; ") + ". Music: " + KNOWLEDGE.interests.music.join("; "),
    });
  }

  if (q.includes("built") || q.includes("website") || q.includes("this site") || q.includes("portfolio site") || q.includes("how does this") || q.includes("powered by") || q.includes("what powers")) {
    results.push({
      topic: "Portfolio Implementation",
      content: KNOWLEDGE.portfolio.overview.description,
    });
  }

  if (results.length === 0) {
    results.push({ topic: "About", content: KNOWLEDGE.about.summary });
  }

  return results;
}

export function getProjectDetails(name) {
  var q = name.toLowerCase();
  var project = KNOWLEDGE.projects.find(function (p) {
    return p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
  });
  if (!project) {
    return {
      found: false,
      message: "No project found matching '" + name + "'. Available projects: " + KNOWLEDGE.projects.map(function (p) { return p.name; }).join(", "),
    };
  }
  return { found: true, project: project };
}

export function getExperience(company) {
  var q = company.toLowerCase();
  var exp = KNOWLEDGE.experience.find(function (e) {
    return e.company.toLowerCase().includes(q) || (e.shortName && e.shortName.toLowerCase().includes(q));
  });
  if (!exp) {
    return {
      found: false,
      message: "No experience found for '" + company + "'. Companies: " + KNOWLEDGE.experience.map(function (e) { return e.company; }).join(", "),
    };
  }
  return { found: true, experience: exp };
}

export function getSkillsByCategory(category) {
  var q = category.toLowerCase();
  if (q === "all" || q === "everything") return KNOWLEDGE.skills;
  if (q.includes("lang")) return { languages: KNOWLEDGE.skills.languages };
  if (q.includes("frame") || q.includes("tool")) return { frameworks: KNOWLEDGE.skills.frameworks };
  if (q.includes("concept") || q.includes("arch") || q.includes("method")) return { concepts: KNOWLEDGE.skills.concepts };
  return KNOWLEDGE.skills;
}

export function getPortfolioInfo(topic) {
  var q = (topic || "").toLowerCase();
  var port = KNOWLEDGE.portfolio;
  var results = [];

  var mappings = [
    { keys: ["overview", "site", "portfolio", "built", "stack", "architecture", "how"], section: "overview" },
    { keys: ["frontend", "html", "css", "tailwind", "navigation", "responsive", "mobile"], section: "frontend" },
    { keys: ["theme", "dark", "light", "toggle", "color"], section: "theming" },
    { keys: ["neural", "particle", "background", "animation", "canvas"], section: "neuralBackground" },
    { keys: ["chatbot", "chat", "bot", "ai", "claude", "agent", "assistant", "suggestion", "follow-up"], section: "chatbot" },
    { keys: ["security", "injection", "prompt", "filter", "guard", "safe"], section: "chatbotSecurity" },
    { keys: ["access", "token", "auth", "gate", "approval", "login"], section: "accessControl" },
    { keys: ["mermaid", "diagram", "chart", "visual", "flowchart", "png"], section: "mermaidDiagrams" },
    { keys: ["pwa", "offline", "service worker", "install", "manifest"], section: "pwa" },
    { keys: ["deploy", "hosting", "netlify", "domain", "server"], section: "deployment" },
    { keys: ["mcp", "microsoft", "learn", "docs", "documentation", "streamable", "tool provider", "tool registry"], section: "mcpIntegration" },
    { keys: ["rag", "retrieval", "bm25", "hyde", "rrf", "fusion", "pipeline", "search", "query expansion", "chunk", "index"], section: "ragPipeline" },
  ];

  for (var m of mappings) {
    if (m.keys.some(function (k) { return q.includes(k); })) {
      var section = port[m.section];
      results.push({ topic: section.title, content: section.description });
    }
  }

  if (results.length === 0) {
    results.push({ topic: port.overview.title, content: port.overview.description });
  }

  return results;
}
