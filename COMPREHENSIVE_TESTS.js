#!/usr/bin/env node
/**
 * COMPREHENSIVE TEST SUITE FOR RESUMEWISE ANALYZER
 * 
 * Run: node COMPREHENSIVE_TESTS.js
 * 
 * This file contains 5 test cases covering:
 * 1. Perfect match scenario
 * 2. Partial match scenario (70-75% overlap)
 * 3. Poor match scenario (<40% overlap)
 * 4. Typo tolerance test (fuzzy matching)
 * 5. Poor structure test (missing sections)
 */

const { analyzeResumeAndJD } = require('./backend/controllers/resumeAnalyzer');

// ============================================================================
// TEST DATA
// ============================================================================

const TEST_CASES = [
  {
    id: 1,
    name: "Perfect Match",
    description: "Resume perfectly aligned with job description",
    resume: `SENIOR REACT DEVELOPER

EXPERIENCE
React Developer at TechCorp (2020-2024, 4 years)
- Built responsive React applications with Redux state management
- Integrated REST APIs and managed data flow
- Used TypeScript for type safety and Jest for unit testing
- Collaborated on responsive UI components

SKILLS
Languages: JavaScript, TypeScript
Frontend: React, Next.js, HTML, CSS, Tailwind CSS, Redux
Backend: Node.js, Express.js
Testing: Jest, React Testing Library
Tools: Git, GitHub, VS Code, Webpack, Babel

EDUCATION
B.S. Computer Science - State University (2020)`,

    jd: `Senior React Developer - 4+ years required

REQUIRED SKILLS:
- 4+ years React experience (CRITICAL)
- JavaScript and TypeScript proficiency
- REST API integration
- Redux or state management techniques
- Jest and unit testing experience
- Knowledge of modern JavaScript (ES6+)

PREFERRED SKILLS:
- Next.js framework experience
- Node.js backend understanding
- Tailwind CSS styling
- Git version control

NICE-TO-HAVE:
- GitHub Actions CI/CD
- Docker containerization`,

    expectedScore: { min: 91, max: 94 },
    expectedComponents: {
      tfIdf: { min: 90, max: 95 },
      ats: { min: 92, max: 96 },
      semantic: { min: 85, max: 90 }
    }
  },

  {
    id: 2,
    name: "Partial Match (70-75% overlap)",
    description: "Resume has foundational skills but lacks specialization",
    resume: `FULL-STACK DEVELOPER

EXPERIENCE
Web Developer at StartupXYZ (2021-2024, 3 years)
- Built React components for web platform
- Worked with Python backend frameworks
- Designed PostgreSQL database schemas
- Used GitHub for version control and collaboration

SKILLS
Languages: JavaScript, Python
Frontend: React, HTML, CSS, Bootstrap
Backend: Flask, Django, Python
Databases: PostgreSQL, MongoDB
Other: Git, Linux basics`,

    jd: `Senior React Developer - 5+ years required

REQUIRED:
- 5+ years professional React development
- TypeScript expertise
- Redux or similar state management
- Automated testing with Jest or React Testing Library
- REST API development experience

PREFERRED:
- Next.js framework
- Node.js and Express
- Real-time applications knowledge

NICE-TO-HAVE:
- GraphQL experience
- AWS or cloud deployment`,

    expectedScore: { min: 71, max: 76 },
    expectedComponents: {
      tfIdf: { min: 70, max: 75 },
      ats: { min: 68, max: 72 },
      semantic: { min: 72, max: 78 }
    }
  },

  {
    id: 3,
    name: "Poor Match (<40% overlap)",
    description: "Completely different career track (DevOps vs React)",
    resume: `DEVOPS ENGINEER

EXPERIENCE
Infrastructure Engineer at CloudCorp (2019-2024, 5 years)
- Managed Docker and Kubernetes orchestration
- Provisioned AWS infrastructure and EC2 instances
- Implemented CI/CD pipelines with Jenkins and GitLab CI
- Automated Linux server administration with Bash scripts

SKILLS
DevOps: Docker, Kubernetes, Jenkins, Terraform, Ansible
Cloud: AWS, EC2, S3, Lambda, RDS
Scripting: Bash, Python, Go
Monitoring: Prometheus, ELK Stack
Tools: Linux, Git, Nginx`,

    jd: `Senior React Developer - 5+ years required

REQUIRED:
- 5+ years React.js development
- JavaScript and TypeScript
- Component-based architecture
- REST API integration
- Redux or Vuex state management
- Jest and testing frameworks

PREFERRED:
- Next.js and SSR concepts
- Node.js backend
- Tailwind CSS`,

    expectedScore: { min: 23, max: 32 },
    expectedComponents: {
      tfIdf: { min: 20, max: 30 },
      ats: { min: 25, max: 35 },
      semantic: { min: 15, max: 25 }
    }
  },

  {
    id: 4,
    name: "Typos & Fuzzy Matching",
    description: "Same content as good match but with intentional typos",
    resume: `FRONTEND ENGINEER

EXPERIENCE
React Developer (2021-2024, 3 years)
- Built UIs with Reacct and Javescript
- Used Typscript for type safety and static checking
- Tested with Jests and React Test Libary
- Styled with Tailwnd CSS for responsive design

SKILLS
Languages: Javescript, Typscript
Frontend: Reacct, Next.js, HTML, CSS, Tailwnd CSS
State: Redox or Context API
Testing: Jests, React Test Libary
Backend: Node.js, Expresss.js`,

    jd: `React Developer - 3+ years required

REQUIRED:
- 3+ years React development
- JavaScript and TypeScript
- State management (Redux preferred)
- Jest testing framework
- CSS and Tailwind CSS

PREFERRED:
- Next.js
- Node.js`,

    expectedScore: { min: 85, max: 89 },
    expectedComponents: {
      tfIdf: { min: 82, max: 88 },
      ats: { min: 85, max: 90 },
      semantic: { min: 80, max: 85 }
    }
  },

  {
    id: 5,
    name: "Poor Structure (Missing Sections)",
    description: "Good content but lacks proper resume structure",
    resume: `JOHN DOE | john.doe@example.com | linkedin.com/in/johndoe

React developer with 4 years professional experience building dynamic user interfaces and web applications. Strong expertise in JavaScript, TypeScript, and React ecosystem. Proficient in state management with Redux, testing with Jest, and backend integration with Node.js and Express. Familiar with Tailwind CSS for styling, database technologies like PostgreSQL, and Git for version control. Quick learner with solid fundamеntals in computer science.

CORE SKILLS: React, JavaScript, TypeScript, Redux, Jest, React Testing Library, Node.js, Express, HTML, CSS, Tailwind CSS, PostgreSQL`,

    jd: `Senior React Developer - 4+ years required

REQUIRED:
- 4+ years React experience
- JavaScript/TypeScript proficiency
- Jest testing
- Redux state management

PREFERRED:
- Next.js
- Node.js backend
- Tailwind CSS

NICE-TO-HAVE:
- Docker
- GraphQL`,

    expectedScore: { min: 78, max: 82 },
    expectedComponents: {
      tfIdf: { min: 80, max: 85 },
      ats: { min: 70, max: 76 },
      semantic: { min: 82, max: 86 }
    }
  }
];

// ============================================================================
// TEST EXECUTION
// ============================================================================

async function runTests() {
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║       RESUMEWISE COMPREHENSIVE TEST SUITE                     ║');
  console.log('║       5 Test Cases - End-to-End Verification                  ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');

  let passedTests = 0;
  let failedTests = 0;
  const results = [];

  for (const testCase of TEST_CASES) {
    console.log(`\n${'═'.repeat(65)}`);
    console.log(`TEST CASE ${testCase.id}: ${testCase.name}`);
    console.log(`${'═'.repeat(65)}`);
    console.log(`Description: ${testCase.description}\n`);

    try {
      // Run analysis
      console.log('Running analysis...');
      const startTime = Date.now();
      const result = await analyzeResumeAndJD(testCase.resume, testCase.jd);
      const duration = Date.now() - startTime;

      // Extract scores
      const finalScore = result.scores.overallMatch;
      const tfidfScore = result.scores.tfidf;
      const atsScore = result.scores.ats;
      const semanticScore = result.scores.semantic;

      // Validate scores
      const finalScoreValid = finalScore >= testCase.expectedScore.min && 
                             finalScore <= testCase.expectedScore.max;
      const tfidfValid = tfidfScore >= testCase.expectedComponents.tfIdf.min && 
                        tfidfScore <= testCase.expectedComponents.tfIdf.max;
      const atsValid = atsScore >= testCase.expectedComponents.ats.min && 
                      atsScore <= testCase.expectedComponents.ats.max;
      const semanticValid = semanticScore >= testCase.expectedComponents.semantic.min && 
                           semanticScore <= testCase.expectedComponents.semantic.max;

      const testPassed = finalScoreValid && tfidfValid && atsValid && semanticValid;

      // Print results
      console.log(`📊 SCORES:`);
      console.log(`   TF-IDF Score:      ${tfidfScore}% ${tfidfValid ? '✅' : '❌'} (expected: ${testCase.expectedComponents.tfIdf.min}-${testCase.expectedComponents.tfIdf.max}%)`);
      console.log(`   ATS Score:         ${atsScore}% ${atsValid ? '✅' : '❌'} (expected: ${testCase.expectedComponents.ats.min}-${testCase.expectedComponents.ats.max}%)`);
      console.log(`   Semantic Score:    ${semanticScore}% ${semanticValid ? '✅' : '❌'} (expected: ${testCase.expectedComponents.semantic.min}-${testCase.expectedComponents.semantic.max}%)`);
      console.log(`   >>> FINAL SCORE:   ${finalScore}% ${finalScoreValid ? '✅' : '❌'} (expected: ${testCase.expectedScore.min}-${testCase.expectedScore.max}%)`);
      console.log(`   Processing Time:   ${duration}ms ⏱️`);

      console.log(`\n📋 DETAILS:`);
      const totalMatched = Object.values(result.matchedSkills).flat().length;
      const totalMissing = Object.values(result.missingSkills).flat().length;
      console.log(`   Matched Skills:    ${totalMatched}`);
      console.log(`   Missing Skills:    ${totalMissing}`);
      console.log(`   Required Met:      ${result.matchedSkillsByLevel.required.length}/${result.skillRequirements.required.length}`);
      console.log(`   Preferred Met:     ${result.matchedSkillsByLevel.preferred.length}/${result.skillRequirements.preferred.length}`);
      console.log(`   Nice-to-Have Met:  ${result.matchedSkillsByLevel.nicetoHave.length}/${result.skillRequirements.nicetoHave.length}`);

      if (result.strengths && result.strengths.length > 0) {
        console.log(`\n💪 STRENGTHS:`);
        result.strengths.slice(0, 3).forEach(strength => {
          console.log(`   • ${strength.description}`);
        });
      }

      if (result.suggestions && result.suggestions.length > 0) {
        console.log(`\n🎯 SUGGESTIONS:`);
        result.suggestions.slice(0, 3).forEach(suggestion => {
          console.log(`   • ${suggestion.action || suggestion.description || JSON.stringify(suggestion)}`);
        });
      }

      if (testPassed) {
        console.log(`\n✅ TEST PASSED`);
        passedTests++;
      } else {
        console.log(`\n❌ TEST FAILED`);
        failedTests++;
      }

      results.push({
        testCase: testCase.id,
        name: testCase.name,
        passed: testPassed,
        finalScore,
        duration
      });

    } catch (error) {
      console.error(`\n❌ ERROR DURING TEST: ${error.message}`);
      failedTests++;
      results.push({
        testCase: testCase.id,
        name: testCase.name,
        passed: false,
        error: error.message
      });
    }
  }

  // Print summary
  console.log(`\n\n${'═'.repeat(65)}`);
  console.log(`FINAL TEST SUMMARY`);
  console.log(`${'═'.repeat(65)}`);
  console.log(`✅ Passed: ${passedTests}/${TEST_CASES.length}`);
  console.log(`❌ Failed: ${failedTests}/${TEST_CASES.length}`);
  console.log(`Success Rate: ${Math.round((passedTests / TEST_CASES.length) * 100)}%`);

  console.log(`\n📊 Results by Test Case:`);
  results.forEach(r => {
    const status = r.passed ? '✅' : '❌';
    const score = r.finalScore ? `(${r.finalScore}%)` : '(ERROR)';
    const time = r.duration ? `${r.duration}ms` : '';
    console.log(`   ${status} Test ${r.testCase}: ${r.name} ${score} ${time}`);
  });

  console.log(`\n🎯 OVERALL VERDICT: ${passedTests === TEST_CASES.length ? '✅ ALL TESTS PASSED - SYSTEM IS PRODUCTION READY!' : '⚠️ SOME TESTS FAILED - REVIEW NEEDED'}`);
  console.log(`\n${'═'.repeat(65)}`);
}

// ============================================================================
// RUN TESTS
// ============================================================================

runTests().catch(console.error);
