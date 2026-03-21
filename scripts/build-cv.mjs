import puppeteer from "puppeteer";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

import { about } from "../netlify/functions/knowledge/about.mjs";
import { projects } from "../netlify/functions/knowledge/projects.mjs";
import { experience } from "../netlify/functions/knowledge/experience.mjs";
import { skills } from "../netlify/functions/knowledge/skills.mjs";
import { education } from "../netlify/functions/knowledge/education.mjs";
import { interests } from "../netlify/functions/knowledge/interests.mjs";
import { references } from "../netlify/functions/knowledge/references.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const templatePath = join(__dirname, "cv-template.html");
const outDir = join(__dirname, "..", "assets", "documents");

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Map company names to their reference entries for inline display
function findRefs(companyName) {
  const q = companyName.toLowerCase();
  return references.filter(r => q.includes(r.company.toLowerCase().split("/")[0].trim()) || r.company.toLowerCase().includes(q.split("(")[0].trim()));
}

function buildContent() {
  let html = "";

  // Header with profile link
  html += `<h1>Logan Venter</h1>\n`;
  html += `<div class="subtitle">Senior AI/Platform Engineer</div>\n`;
  html += `<div class="contact">`;
  html += `<a href="mailto:logan.venter@outlook.com">logan.venter@outlook.com</a>`;
  html += ` &nbsp;|&nbsp; +27 60 974 2113 / +27 76 414 0083`;
  html += ` &nbsp;|&nbsp; <a href="https://loganventer.com">loganventer.com</a>`;
  html += `</div>\n`;
  html += `<p style="margin:8px 0;font-size:9.5pt;color:#334155;">${esc(about.summary)}</p>\n`;

  // Experience with inline references
  html += `<h2>Professional Experience</h2>\n`;
  for (const exp of experience) {
    html += `<h3>${esc(exp.title)}</h3>\n`;
    html += `<h4>${esc(exp.company)} <span class="period">${esc(exp.period)}</span></h4>\n`;
    if (exp.note) html += `<div class="note">${esc(exp.note)}</div>\n`;
    html += `<ul>\n`;
    for (const r of exp.responsibilities) {
      html += `  <li>${esc(r)}</li>\n`;
    }
    html += `</ul>\n`;

    // Inline references for this company
    const refs = findRefs(exp.company);
    if (refs.length > 0) {
      const contacts = refs.flatMap(r => r.contacts);
      html += `<div class="note" style="margin-top:2px;">References: ${contacts.map(c => `${esc(c.name)} (${esc(c.phone)})`).join(", ")}</div>\n`;
    }
  }

  // Projects with highlights
  html += `<h2>Featured Projects</h2>\n`;
  for (const proj of projects) {
    html += `<h3>${esc(proj.name)}</h3>\n`;
    html += `<p style="font-size:9.5pt;color:#334155;margin:2px 0;">${esc(proj.description)}</p>\n`;
    if (proj.highlights && proj.highlights.length > 0) {
      html += `<ul>\n`;
      for (const h of proj.highlights) {
        html += `  <li>${esc(h)}</li>\n`;
      }
      html += `</ul>\n`;
    }
    html += `<div style="margin:3px 0;">`;
    for (const t of proj.tech) {
      html += `<span class="tag">${esc(t)}</span>`;
    }
    html += `</div>\n`;
  }

  // Skills
  html += `<h2>Technical Skills</h2>\n`;
  html += `<div class="skills-grid">\n`;
  for (const lang of skills.languages) {
    html += `<div class="skill-item"><span class="skill-label">${esc(lang.name)}</span> (${esc(lang.level)}) — ${esc(lang.description)}</div>\n`;
  }
  html += `</div>\n`;
  html += `<h4 style="margin-top:8px;">Frameworks &amp; Tools</h4>\n<ul>\n`;
  for (const fw of skills.frameworks) {
    html += `  <li>${esc(fw)}</li>\n`;
  }
  html += `</ul>\n`;
  html += `<h4 style="margin-top:8px;">Architectural Concepts</h4>\n<ul>\n`;
  for (const c of skills.concepts) {
    html += `  <li>${esc(c)}</li>\n`;
  }
  html += `</ul>\n`;

  // Education
  html += `<h2>Education</h2>\n`;
  for (const edu of education) {
    html += `<h3>${esc(edu.qualification)}</h3>\n`;
    html += `<h4>${esc(edu.institution)}</h4>\n`;
    html += `<p style="font-size:9.5pt;color:#334155;">${esc(edu.achievement)}</p>\n`;
    if (edu.subjects) {
      html += `<p style="font-size:9pt;color:#64748b;">Subjects: ${edu.subjects.map(esc).join(", ")}</p>\n`;
    }
  }

  // Personal Interests
  html += `<h2>Personal Interests</h2>\n`;
  html += `<ul>\n`;
  for (const item of interests.software) {
    html += `  <li>${esc(item)}</li>\n`;
  }
  for (const item of interests.music) {
    html += `  <li>${esc(item)}</li>\n`;
  }
  html += `</ul>\n`;

  // Core Values
  html += `<h2>Core Values</h2>\n<ul>\n`;
  for (const v of about.values) {
    html += `  <li>${esc(v)}</li>\n`;
  }
  html += `</ul>\n`;

  // All References
  html += `<h2>References</h2>\n`;
  html += `<div class="skills-grid">\n`;
  for (const ref of references) {
    html += `<div class="skill-item" style="margin-bottom:6px;"><span class="skill-label">${esc(ref.company)}</span><br>`;
    for (const c of ref.contacts) {
      html += `${esc(c.name)}: ${esc(c.phone)}<br>`;
    }
    html += `</div>\n`;
  }
  html += `</div>\n`;

  return html;
}

async function generatePdf() {
  console.log("Building CV PDF...");

  const template = readFileSync(templatePath, "utf-8");
  const content = buildContent();
  const fullHtml = template.replace("{{CONTENT}}", content);

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(fullHtml, { waitUntil: "networkidle0" });

  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const year = today.getFullYear();
  const dateStr = `${day}-${month}-${year}`;
  const filename = `Logan Venter Curriculum Vitae ${dateStr}.pdf`;
  const outPath = join(outDir, filename);

  await page.pdf({
    path: outPath,
    format: "A4",
    margin: { top: "20px", right: "20px", bottom: "20px", left: "20px" },
    printBackground: true,
  });

  await browser.close();
  console.log(`  CV generated: ${outPath}`);
  return { filename, outPath };
}

generatePdf().catch((err) => {
  console.error("CV generation failed:", err);
  process.exit(1);
});
