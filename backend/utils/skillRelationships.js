/**
 * Skill Relationship Mapping System
 * Creates semantic relationships between skills
 * Example: React → JavaScript → Frontend
 *          Django → Python → Backend
 */

/**
 * Comprehensive skill relationship graph
 * Maps skills to their related skills and categories
 */
const SKILL_RELATIONSHIPS = {
  // Frontend Framework → Language → Category
  'react': {
    requires: ['javascript'],
    relatedSkills: ['vue', 'angular', 'nextjs', 'typescript', 'html', 'css'],
    category: 'Frontend',
    description: 'React JavaScript library'
  },
  'vue': {
    requires: ['javascript'],
    relatedSkills: ['react', 'angular', 'vuex', 'typescript', 'html', 'css'],
    category: 'Frontend',
    description: 'Vue.js framework'
  },
  'angular': {
    requires: ['typescript', 'javascript'],
    relatedSkills: ['react', 'vue', 'rxjs', 'html', 'css'],
    category: 'Frontend',
    description: 'Angular framework'
  },
  'nextjs': {
    requires: ['react', 'javascript', 'nodejs'],
    relatedSkills: ['react', 'typescript', 'tailwind', 'vercel'],
    category: 'Frontend',
    description: 'Next.js React framework'
  },

  // Backend Framework → Language → Category
  'django': {
    requires: ['python'],
    relatedSkills: ['flask', 'fastapi', 'postgresql', 'rest', 'sqlalchemy'],
    category: 'Backend',
    description: 'Django Python web framework'
  },
  'flask': {
    requires: ['python'],
    relatedSkills: ['django', 'fastapi', 'sqlalchemy', 'rest'],
    category: 'Backend',
    description: 'Flask Python microframework'
  },
  'fastapi': {
    requires: ['python'],
    relatedSkills: ['django', 'flask', 'asyncio', 'pydantic', 'rest', 'graphql'],
    category: 'Backend',
    description: 'FastAPI Python framework'
  },
  'springboot': {
    requires: ['java'],
    relatedSkills: ['spring', 'maven', 'gradle', 'hibernate', 'postgresql'],
    category: 'Backend',
    description: 'Spring Boot framework'
  },
  'express': {
    requires: ['nodejs', 'javascript'],
    relatedSkills: ['nodejs', 'rest', 'mongodb', 'postgresql'],
    category: 'Backend',
    description: 'Express.js Node.js framework'
  },

  // Programming Languages
  'javascript': {
    enables: ['react', 'vue', 'angular', 'nodejs', 'nextjs'],
    relatedSkills: ['typescript', 'es6', 'nodejs'],
    category: 'Programming Languages',
    description: 'JavaScript language'
  },
  'python': {
    enables: ['django', 'flask', 'fastapi', 'pandas', 'numpy', 'tensorflow'],
    relatedSkills: ['django', 'flask', 'fastapi', 'data-science'],
    category: 'Programming Languages',
    description: 'Python language'
  },
  'java': {
    enables: ['springboot', 'spring', 'maven', 'gradle'],
    relatedSkills: ['springboot', 'spring', 'maven', 'gradle', 'sql'],
    category: 'Programming Languages',
    description: 'Java language'
  },
  'typescript': {
    requires: ['javascript'],
    relatedSkills: ['javascript', 'react', 'angular', 'nextjs'],
    category: 'Programming Languages',
    description: 'TypeScript language'
  },

  // Databases
  'postgresql': {
    relatedSkills: ['sql', 'nosql', 'mongodb', 'database-design', 'orm'],
    category: 'Databases',
    description: 'PostgreSQL database'
  },
  'mongodb': {
    relatedSkills: ['nosql', 'postgresql', 'mongoose', 'database-design'],
    category: 'Databases',
    description: 'MongoDB database'
  },
  'sql': {
    enables: ['postgresql', 'mysql', 'oracle', 'mssql'],
    relatedSkills: ['database-design', 'orm', 'sqlalchemy', 'prisma'],
    category: 'Databases',
    description: 'SQL language'
  },

  // DevOps & Infrastructure
  'docker': {
    relatedSkills: ['kubernetes', 'containerization', 'devops', 'ci-cd'],
    category: 'DevOps',
    description: 'Docker containerization'
  },
  'kubernetes': {
    requires: ['docker', 'containerization'],
    relatedSkills: ['docker', 'helm', 'devops', 'ci-cd', 'aws', 'gcp', 'azure'],
    category: 'DevOps',
    description: 'Kubernetes orchestration'
  },
  'github-actions': {
    relatedSkills: ['ci-cd', 'devops', 'github', 'jenkins', 'gitlab-ci'],
    category: 'DevOps',
    description: 'GitHub Actions CI/CD'
  },

  // Data Science & ML
  'pandas': {
    requires: ['python'],
    relatedSkills: ['python', 'numpy', 'data-analysis', 'data-science'],
    category: 'Data Science & ML',
    description: 'Pandas Python library'
  },
  'tensorflow': {
    requires: ['python'],
    relatedSkills: ['python', 'machine-learning', 'deep-learning', 'pytorch', 'keras'],
    category: 'Data Science & ML',
    description: 'TensorFlow ML framework'
  },
  'pytorch': {
    requires: ['python'],
    relatedSkills: ['python', 'machine-learning', 'deep-learning', 'tensorflow', 'nlp'],
    category: 'Data Science & ML',
    description: 'PyTorch ML framework'
  },

  // Cloud Platforms
  'aws': {
    relatedSkills: ['cloud', 'devops', 'ec2', 's3', 'lambda', 'azure', 'gcp'],
    category: 'Cloud',
    description: 'Amazon Web Services'
  },
  'azure': {
    relatedSkills: ['cloud', 'devops', 'aws', 'gcp', 'docker', 'kubernetes'],
    category: 'Cloud',
    description: 'Microsoft Azure'
  },
  'gcp': {
    relatedSkills: ['cloud', 'devops', 'aws', 'azure', 'google-cloud'],
    category: 'Cloud',
    description: 'Google Cloud Platform'
  }
};

/**
 * Find skill relationships
 */
function getSkillRelationships(skill) {
  const normalized = skill.toLowerCase().replace(/[\s.\-]/g, '');
  
  // Try direct match
  if (SKILL_RELATIONSHIPS[normalized]) {
    return SKILL_RELATIONSHIPS[normalized];
  }

  // Try partial match
  for (const [key, value] of Object.entries(SKILL_RELATIONSHIPS)) {
    if (key.includes(normalized) || normalized.includes(key)) {
      return value;
    }
  }

  return null;
}

/**
 * Calculate relationship-based skill score
 * If exact skill not found, check if related skills are present
 */
function calculateRelationshipScore(missingSkill, availableSkills) {
  const relationships = getSkillRelationships(missingSkill);

  if (!relationships) {
    return { score: 0, reason: 'No relationships found' };
  }

  const availableSet = new Set(
    availableSkills.map(s => s.toLowerCase().replace(/[\s.\-]/g, ''))
  );

  let partialScore = 0;
  let matchedRelations = [];

  // Check if prerequisite skills are present
  if (relationships.requires) {
    const requiredPresent = relationships.requires.filter(req => {
      const normalized = req.toLowerCase().replace(/[\s.\-]/g, '');
      return availableSet.has(normalized);
    });
    
    if (requiredPresent.length > 0) {
      partialScore += (requiredPresent.length / relationships.requires.length) * 40;
      matchedRelations.push(`Has ${requiredPresent.join(', ')} (prerequisite)`);
    }
  }

  // Check if related skills are present
  if (relationships.relatedSkills) {
    const relatedPresent = relationships.relatedSkills.filter(rel => {
      const normalized = rel.toLowerCase().replace(/[\s.\-]/g, '');
      return availableSet.has(normalized);
    });
    
    if (relatedPresent.length > 0) {
      partialScore += (relatedPresent.length / relationships.relatedSkills.length) * 30;
      matchedRelations.push(`Related: ${relatedPresent.join(', ')}`);
    }
  }

  // Check if related category skills exist
  if (relationships.category) {
    const categorySkills = Object.entries(SKILL_RELATIONSHIPS)
      .filter(([, v]) => v.category === relationships.category)
      .map(([k]) => k);

    const categoryPresent = categorySkills.filter(cat => availableSet.has(cat)).length;
    if (categoryPresent > 0) {
      partialScore += Math.min(categoryPresent * 10, 20);
      matchedRelations.push(`${categoryPresent} skills from ${relationships.category}`);
    }
  }

  return {
    score: Math.min(partialScore, 60), // Max 60% for related skills
    reason: matchedRelations.length > 0 
      ? `Partial match via relationships: ${matchedRelations.join('; ')}`
      : 'No related skills found'
  };
}

/**
 * Find learning path recommendations
 * If missing a skill, suggest what to learn first
 */
function getLearningPath(targetSkill) {
  const relationships = getSkillRelationships(targetSkill);

  if (!relationships || !relationships.requires) {
    return [];
  }

  return relationships.requires.map(req => ({
    skill: req,
    reason: `Learn ${req} first - it's a prerequisite for ${targetSkill}`,
    priority: 'high'
  }));
}

/**
 * Suggest skill combinations
 * What other skills to develop alongside a skill
 */
function suggestComplementarySkills(skill) {
  const relationships = getSkillRelationships(skill);

  if (!relationships) {
    return [];
  }

  return (relationships.relatedSkills || []).map(related => ({
    skill: related,
    reason: `Complements ${skill} nicely`
  })).slice(0, 5);
}

module.exports = {
  SKILL_RELATIONSHIPS,
  getSkillRelationships,
  calculateRelationshipScore,
  getLearningPath,
  suggestComplementarySkills
};
