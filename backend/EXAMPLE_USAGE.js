/**
 * EXAMPLE: Using Enhanced Resume Analysis
 * Demonstrates all 5 new features
 */

const { analyzeResumeAndJD } = require('./controllers/resumeAnalyzer');

// Example Resume (with typo intentionally)
const exampleResume = `
JOHN DOE
john@example.com | linkedin.com/in/johndoe

PROFESSIONAL SUMMARY
Experienced Frontend Developer with 5 years of experience building responsive web applications.

EXPERIENCE
Senior Frontend Developer | Tech Corp | 2022 - Present
- Led React team of 5 developers
- Implemented responsive UI using Tailwind CSS
- Managed state with Redux and Context API
- Mentored junior developers on JavaScript best practices

Frontend Developer | StartUp Co | 2020 - 2022
- Developed single-page applications using Vue.js
- Integrated REST APIs with Axios
- Collaborated with designers and backend team

SKILLS
Languages: JavaScript, TypeScript, HTML, CSS
Frameworks: React, Vue, Next.js
Tools: Git, GitHub, VSCode, Webpack, Babel
Styling: Tailwind CSS, SCSS, CSS-in-JS
Testing: Jest, React Testing Library
DevOps: Docker basics

EDUCATION
Bachelor of Computer Science | State University | 2020
`;

// Example Job Description
const exampleJD = `
Senior React Developer

Required:
- 5+ years of Javescript experience (note the typo in original)
- Expert-level React and TypeScript
- Experience with Node.js backend
- REST API design and implementation
- Docker containerization
- Git version control

Preferred:
- Next.js framework experience
- GraphQL knowledge
- AWS cloud experience
- Team leadership experience

Nice-to-Have:
- Python scripting
- Machine learning basics
- Kubernetes experience

About You:
You demonstrate strong technical leadership and mentor other developers.
You excel at problem-solving and have excellent communication skills.
You're passionate about building scalable, maintainable applications.

Responsibilities:
- Lead frontend architecture design
- Review code and mentor team
- Implement responsive user interfaces
- Optimize application performance
- Collaborate with backend and design teams
`;

// ============ RUN ANALYSIS ============
console.log('🔍 ANALYZING RESUME AGAINST JOB DESCRIPTION...\n');

try {
  const result = analyzeResumeAndJD(exampleResume, exampleJD);

  // ============ FEATURE 1: Overall Scores ============
  console.log('💯 OVERALL SCORES');
  console.log('================================================');
  console.log(`Overall Match: ${result.scores.overallMatch}%`);
  console.log(`├─ TF-IDF (Semantic): ${result.scores.tfidf}%`);
  console.log(`├─ ATS (Keywords): ${result.scores.ats}%`);
  console.log(`└─ Semantic Analysis: ${result.scores.semantic}%`);
  console.log();

  // ============ FEATURE 2: Required/Preferred/Nice-to-Have ============
  console.log('🎯 SKILL REQUIREMENTS BREAKDOWN');
  console.log('================================================');
  console.log(`Required Skills Match: ${result.scores.weighted.required}%`);
  console.log(`  Matched: ${result.matchedSkillsByLevel.required.join(', ')}`);
  console.log(`  Missing: ${result.missingSkillsByLevel.required.join(', ')}`);
  console.log();
  
  console.log(`Preferred Skills Match: ${result.scores.weighted.preferred}%`);
  console.log(`  Matched: ${result.matchedSkillsByLevel.preferred.join(', ')}`);
  console.log(`  Missing: ${result.missingSkillsByLevel.preferred.join(', ')}`);
  console.log();
  
  console.log(`Nice-to-Have Match: ${result.scores.weighted.nicetoHave}%`);
  console.log(`  Matched: ${result.matchedSkillsByLevel.nicetoHave.join(', ')}`);
  console.log(`  Missing: ${result.missingSkillsByLevel.nicetoHave.join(', ')}`);
  console.log();

  // ============ FEATURE 3: Fuzzy Matching ============
  console.log('🔤 FUZZY MATCHING (Typo Detection)');
  console.log('================================================');
  console.log(`Exact Matches: ${result.fuzzyMatching.exactMatches}`);
  if (result.fuzzyMatching.fuzzyMatches.length > 0) {
    console.log(`Fuzzy Matches (Typos Caught):`);
    result.fuzzyMatching.fuzzyMatches.forEach(match => {
      console.log(`  "${match.original}" → "${match.matched}" (${Math.round(match.score * 100)}% confidence)`);
    });
  } else {
    console.log('Fuzzy Matches: None');
  }
  console.log();

  // ============ FEATURE 4: Semantic Analysis & Insights ============
  console.log('🧠 SEMANTIC ANALYSIS & THEMES');
  console.log('================================================');
  console.log(`Semantic Score: ${result.semanticAnalysis.score}%`);
  if (result.semanticAnalysis.insights.commonThemes.length > 0) {
    console.log('Common Themes:');
    result.semanticAnalysis.insights.commonThemes.forEach(theme => {
      console.log(`  ✓ ${theme.theme}: ${Math.round(theme.strength)}% alignment`);
    });
  }
  console.log();

  // ============ FEATURE 5: Strengths ============
  console.log('💪 YOUR STRENGTHS');
  console.log('================================================');
  result.strengths.forEach((strength, idx) => {
    const impactEmoji = strength.impact === 'high' ? '🔴' : strength.impact === 'medium' ? '🟡' : '🟢';
    console.log(`${idx + 1}. ${impactEmoji} ${strength.category}`);
    console.log(`   ${strength.description}`);
    if (strength.skills) {
      console.log(`   Skills: ${strength.skills.join(', ')}`);
    }
  });
  console.log();

  // ============ FEATURE 5: Suggestions ============
  console.log('📋 IMPROVEMENT SUGGESTIONS');
  console.log('================================================');
  if (result.suggestions.length === 0) {
    console.log('✓ Perfect match! No suggestions needed.');
  } else {
    result.suggestions.forEach((suggestion, idx) => {
      const priorityEmoji = suggestion.priority === 'critical' ? '🔴' : 
                           suggestion.priority === 'high' ? '🟠' : 
                           suggestion.priority === 'medium' ? '🟡' : '🟢';
      console.log(`${idx + 1}. ${priorityEmoji} [${suggestion.priority.toUpperCase()}] ${suggestion.category}`);
      console.log(`   Action: ${suggestion.action}`);
      if (suggestion.relatedSkills && suggestion.relatedSkills.length > 0) {
        console.log(`   Related Skills:`);
        suggestion.relatedSkills.forEach(rs => {
          console.log(`     - ${rs.skill}: ${rs.reason}`);
        });
      }
    });
  }
  console.log();

  // ============ FEATURE 4: Missing Skills (Prioritized) ============
  console.log('🎓 MISSING SKILLS (Prioritized Roadmap)');
  console.log('================================================');
  const missingByPriority = result.missingSkillsPrioritized;
  if (missingByPriority.length === 0) {
    console.log('✓ You have all required skills!');
  } else {
    console.log(missingByPriority.slice(0, 10).map(m => {
      const emoji = m.priority === 'critical' ? '🔴' : m.priority === 'high' ? '🟠' : '🟡';
      return `${emoji} ${m.skill} (${m.level})`;
    }).join('\n'));
  }
  console.log();

  // ============ ATS Breakdown ============
  console.log('📊 ATS SCORE BREAKDOWN');
  console.log('================================================');
  console.log(`Keyword Density: ${result.atsScoreBreakdown.keywordDensity}%`);
  console.log(`Skills Presence: ${result.atsScoreBreakdown.skillsPresence}%`);
  console.log(`Resume Sections: ${result.atsScoreBreakdown.sectionDetection.score}%`);
  console.log(`Formatting: ${result.atsScoreBreakdown.formattingIndicators}%`);
  console.log();

  // ============ Experience Match ============
  console.log('📅 EXPERIENCE MATCH');
  console.log('================================================');
  console.log(result.experience.message);
  console.log(`Score: ${result.experience.matchScore}%`);
  console.log();

  // ============ Summary ============
  console.log('📈 FINAL ASSESSMENT');
  console.log('================================================');
  if (result.scores.overallMatch >= 80) {
    console.log('🟢 STRONG FIT - Highly qualified for this role!');
  } else if (result.scores.overallMatch >= 60) {
    console.log('🟡 MODERATE FIT - Some gaps but could be a good candidate');
  } else {
    console.log('🔴 WEAK FIT - Significant skill gaps');
  }
  console.log();

} catch (error) {
  console.error('Error:', error.message);
}
