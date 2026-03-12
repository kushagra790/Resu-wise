/**
 * Intelligent suggestions generator
 * Provides actionable recommendations based on analysis
 */

export const generateImprovementSuggestions = (results) => {
  const suggestions = [];

  if (!results) return suggestions;

  const {
    matchPercentage = 0,
    atsScore = 0,
    matchedSkills = {},
    missingSkills = {},
    experience = {},
    atsScoreBreakdown = {}
  } = results;

  // Experience gap suggestions
  if (experience.isQualified === false && experience.requiredYears && experience.resumeYears) {
    const deficit = experience.requiredYears[0] - (experience.resumeYears[0] || 0);
    if (deficit > 0) {
      suggestions.push(
        `You're ${deficit} year${deficit > 1 ? 's' : ''} short on required experience. Consider emphasizing related project work and transferable skills to compensate.`
      );
      suggestions.push(
        `Highlight internships, freelance projects, or volunteer work relevant to the required skill areas to bridge the experience gap.`
      );
    }
  }

  // Missing skills suggestions
  const allMissingSkills = Object.values(missingSkills).flat();
  if (allMissingSkills.length > 0) {
    const topMissing = allMissingSkills.slice(0, 3);
    
    // Check if missing skills are in specific categories
    const missingByCategory = Object.entries(missingSkills)
      .filter(([_, skills]) => skills.length > 0)
      .map(([category, skills]) => ({ category, skills }));

    // Category-specific suggestions
    missingByCategory.forEach(({ category, skills }) => {
      if (category === 'Programming Languages') {
        if (skills.length > 0) {
          suggestions.push(
            `Add hands-on experience with ${skills.slice(0, 2).join(' and ')} by building a project or completing online courses.`
          );
        }
      } else if (category === 'Frontend' || category === 'Backend') {
        if (skills.length > 0) {
          suggestions.push(
            `Develop practical experience with ${skills[0]} through real-world projects or contributions to open-source repositories.`
          );
        }
      } else if (category === 'DevOps') {
        if (skills.length > 0) {
          suggestions.push(
            `Gain hands-on Docker ${skills.includes('Docker') ? 'deployment' : 'and Kubernetes'} experience through CI/CD setup in personal or professional projects.`
          );
        }
      } else if (category === 'Cloud') {
        if (skills.length > 0) {
          const cloudProvider = skills[0]?.toLowerCase() || 'cloud platform';
          suggestions.push(
            `Complete ${cloudProvider.charAt(0).toUpperCase() + cloudProvider.slice(1)} cloud certification or build projects on the platform to demonstrate proficiency.`
          );
        }
      } else if (category === 'Databases') {
        if (skills.length > 0) {
          suggestions.push(
            `Practice database design and optimization with ${skills[0]} through personal projects or database internships.`
          );
        }
      }
    });
  }

  // Match percentage suggestions
  if (matchPercentage < 50) {
    suggestions.push(
      `Your resume match is quite low. Consider restructuring your resume to better align with the job posting using similar terminology and keywords.`
    );
    suggestions.push(
      `Review the job description carefully and rewrite your experience summaries to explicitly mention the most critical requirements.`
    );
  } else if (matchPercentage < 70) {
    suggestions.push(
      `Your resume shows moderate alignment. Add more specific examples and quantifiable achievements that directly match the job requirements.`
    );
  }

  // ATS score suggestions
  if (atsScoreBreakdown.breakdown) {
    const breakdown = atsScoreBreakdown.breakdown;

    if (breakdown.keywordDensity < 60) {
      suggestions.push(
        `Increase keyword density by incorporating technical terms from the job posting throughout your resume, especially in the summary and experience sections.`
      );
    }

    if (breakdown.skillsPresence < 60) {
      suggestions.push(
        `Create a dedicated "Technical Skills" section listing all relevant programming languages, tools, and frameworks to improve ATS parsing.`
      );
    }

    if (breakdown.sectionDetection.score < 70) {
      const missingSections = [];
      if (!breakdown.sectionDetection.detected.includes('education')) missingSections.push('Education');
      if (!breakdown.sectionDetection.detected.includes('experience')) missingSections.push('Experience');
      if (!breakdown.sectionDetection.detected.includes('skills')) missingSections.push('Technical Skills');
      
      if (missingSections.length > 0) {
        suggestions.push(
          `Add or highlight the following sections: ${missingSections.join(', ')}. These are standard resume sections that ATS systems expect.`
        );
      }
    }

    if (breakdown.formattingIndicators < 60) {
      suggestions.push(
        `Improve resume formatting by using bullet points, consistent spacing, and clear section headers. Avoid graphics, tables, and unusual fonts that ATS systems struggle to parse.`
      );
    }
  }

  // General achievement suggestions
  if (matchPercentage >= 70 || atsScore >= 70) {
    const matchedCount = Object.values(matchedSkills).flat().length;
    if (matchedCount > 0) {
      suggestions.push(
        `Include measurable achievements and quantifiable results for your projects in the ${Object.keys(matchedSkills)[0] || 'technical'} areas to strengthen your candidacy.`
      );
    }
  }

  // Proactive suggestions for high-scoring resumes
  if (matchPercentage >= 80 && atsScore >= 75) {
    suggestions.push(
      `Your resume is well-optimized! Add links to GitHub, portfolio, or deployed projects to further demonstrate your expertise.`
    );
    suggestions.push(
      `Consider highlighting certifications or continuous learning achievements relevant to the role.`
    );
  }

  return suggestions;
};

/**
 * Generate actionable improvement text
 */
export const getActionableImprovement = (category, skills) => {
  if (!skills || skills.length === 0) return '';

  const skillsText = skills.length === 1 ? skills[0] : `${skills.slice(0, -1).join(', ')} and ${skills[skills.length - 1]}`;

  const suggestions = {
    'Programming Languages': `Learn ${skillsText} through coding challenges, personal projects, or online courses like Udemy or freeCodeCamp.`,
    'Frontend': `Build projects using ${skillsText}. Create a portfolio piece that demonstrates mastery of these technologies.`,
    'Backend': `Develop server-side experience with ${skillsText}. Build REST APIs or microservices to showcase your skills.`,
    'Databases': `Practice database modeling and optimization with ${skillsText}. Work on performance tuning and query optimization.`,
    'DevOps': `Set up CI/CD pipelines using ${skillsText} in personal or professional projects to gain hands-on experience.`,
    'Cloud': `Explore ${skillsText} cloud services by building and deploying applications. Consider earning relevant certifications.`,
    'Tools & Platforms': `Integrate ${skillsText} into your workflow. Document your experience in README files and project documentation.`
  };

  return suggestions[category] || `Gain practical experience with ${skillsText} through project work and deliberate practice.`;
};
