import { about } from './about.mjs';
import { projects } from './projects.mjs';
import { experience } from './experience.mjs';
import { skills } from './skills.mjs';
import { education } from './education.mjs';
import { interests } from './interests.mjs';
import { portfolio } from './portfolio.mjs';

/**
 * Knowledge composer — assembles all domain sections into a single export.
 * Each section is independently maintainable in its own file.
 */
export const KNOWLEDGE = {
  about,
  projects,
  experience,
  skills,
  education,
  interests,
  portfolio,
};

// Re-export search helpers for backward compatibility
export { searchKnowledge, getProjectDetails, getExperience, getSkillsByCategory, getPortfolioInfo } from './search.mjs';
