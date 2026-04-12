# ❓ FAQ & Troubleshooting

## Installation Issues

### Q: `npm install` fails with "missing module" errors
**A:** Try clearing npm cache and reinstalling:
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Q: "Cannot find module 'fuse.js'" after npm install
**A:** Make sure you're using the updated `package.json`:
```bash
npm list fuse.js        # Should show version 7.0.0 or higher
npm install fuse.js@7   # If missing
```

### Q: "module not found: string-similarity"
**A:** Install the package:
```bash
npm install string-similarity
```

---

## Feature Issues

### Q: Fuzzy matching isn't catching typos
**A:** Fuzzy matching uses by default a 0.35 threshold. Typos need to be somewhat "close":
- ✅ "Javescript" matches "JavaScript"
- ✅ "Reacct" matches "React"
- ❌ "XYZ" won't match anything

If you want looser matching, edit `resumeAnalyzer.js` line where `batchFuzzyMatch` is called:
```javascript
const fuzzyMatches = batchFuzzyMatch(flatResumeSkills, flatJDSkills, 0.25); // More lenient
```

### Q: Semantic score is always low (30-40%)
**A:** This is normal if the resume and JD have very different wording.
- The semantic analyzer looks for common phrases and sentence structure
- If they use completely different vocabulary, semantic score will be lower
- The ATS and weighted skill scores compensate for this

### Q: Skill requirements aren't being parsed correctly
**A:** The parser looks for keywords like:
- **Required**: "must have", "required", "essential", "critical"
- **Preferred**: "preferred", "should have", "familiar with"
- **Nice-to-have**: "nice to have", "bonus", "plus"

If your JD doesn't use these keywords, all skills get redistributed:
- First 60% → Required
- Next 30% → Preferred
- Rest → Nice-to-have

### Q: Missing skills aren't showing "relationship scores"
**A:** Relationship scores only work for skills in the `skillRelationships.js` file.

Currently supported relationships:
- React → JavaScript
- Vue → JavaScript
- Angular → TypeScript
- Django → Python
- Flask → Python
- Spring Boot → Java
- Docker → Kubernetes
- And 40+ more...

If a skill isn't in the list, no relationship score. 
**To add more**: Edit `backend/utils/skillRelationships.js` and add to `SKILL_RELATIONSHIPS` object.

---

## Output Issues

### Q: Why is `overallMatch` different from `atsScore`?
**A:** They're calculated differently:
- `atsScore`: Only measures keywords, skills, sections, formatting
- `overallMatch`: Blends TF-IDF (40%) + ATS (35%) + Semantic (25%)

So even if ATS is low, semantic might be high if the resume addresses similar topics.

### Q: Why are there so many scores now?
**A:** Each score shows a different perspective:
- `tfidf`: How similar is the content overall?
- `ats`: How well does it match the keywords?
- `semantic`: Do the themes align?
- `weighted.required/preferred/nicetoHave`: How many skills at each level?
- `overallMatch`: Final combined score

You can display whichever ones are useful to your users.

### Q: Suggestions are empty even though skills are missing
**A:** Suggestions are only generated when:
1. ❌ Required skills are significantly mismatched, OR
2. ✅ Experience gap exists, OR
3. ✅ Related skills could help (e.g., has JavaScript but missing React)

If the candidate is a perfect match → no suggestions!

### Q: Fuzzy matches show but they're all exact matches
**A:** That's normal. Most real-world resumes spell skills correctly.
Fuzzy matching shines when there ARE typos:
- "Javescript", "Reacct", "Pytohn", etc.

---

## Performance Issues

### Q: Analysis takes >500ms
**A:** This might happen if:
1. Resume/JD are extremely long (5000+ words each)
2. Network is slow (shouldn't matter, all local)
3. System is under heavy load

Solutions:
- Trim very long resumes to key sections
- Run analysis on backend (not browser)
- Cache results if analyzing same resume multiple times

### Q: Memory usage is high
**A:** The TF-IDF vectorizer stores entire vocabulary in memory.
For typical resume+JD:
- Vocabulary size: 2000-5000 words
- Memory needed: <10MB

Only an issue with very large documents (10,000+ words each).

---

## Data Issues

### Q: Analysis result has null/undefined fields
**A:** This happens if:
1. Empty resume or JD provided
2. Resume/JD in unsupported format (e.g., PDF not converted to text)

Solution: Ensure both inputs are valid text strings before calling `analyzeResumeAndJD`.

### Q: Skill extraction misses some skills
**A:** Reasons:
1. **Skill not in dictionary**: The system only recognizes 200+ predefined skills
2. **Typo in skill name**: "Ract" won't match "React"
3. **Informal name**: "web dev" won't match "JavaScript"

To add more skills, edit `backend/controllers/resumeAnalyzer.js` → `SKILL_KEYWORDS`.

Example:
```javascript
'Frontend': [
  'react', 'vue', 'angular',
  'astro', 'qwik', 'remix'  // Add emerging frameworks
]
```

### Q: Experience years not detected
**A:** The regex looks for patterns like:
- "3 years"
- "5+ years"
- "2 yrs"
- "7 year"

Won't match:
- "2018 - 2021" (dates, not years of experience)
- "3-year" (without "years" keyword)
- "approximately 5 years" (word before number)

---

## Customization

### Q: Can I adjust the scoring weights?
**A:** Yes! In `resumeAnalyzer.js`, find this line:
```javascript
const finalMatchScore = Math.round(
  (tfidfScore * 0.4) +       // Change to 0.5
  (atsScore * 0.35) +        // Change to 0.3
  (semanticScore * 0.25)     // Change to 0.2
);
```

Remember: weights must sum to 1.0

### Q: Can I change skill requirement weights?
**A:** Yes! In `skillRequirementParser.js`, find `calculateWeightedSkillScore`:
```javascript
scores.required.weight = 0.5;      // Change from 0.5
scores.preferred.weight = 0.3;     // Change from 0.3
scores.nicetoHave.weight = 0.2;    // Change from 0.2
```

### Q: Can I add industry-specific skills?
**A:** Yes! Add to `SKILL_KEYWORDS` in `resumeAnalyzer.js`:
```javascript
'Finance': [
  'accounting', 'auditing', 'tax', 'corporate finance', 'derivatives'
],
'Healthcare': [
  'hipaa', 'hl7', 'epic', 'cerner', 'medical coding'
]
```

### Q: Can I create my own skill relationships?
**A:** Yes! In `skillRelationships.js`, add to `SKILL_RELATIONSHIPS`:
```javascript
'yourskill': {
  requires: ['prerequisite1', 'prerequisite2'],
  relatedSkills: ['related1', 'related2'],
  category: 'Your Category',
  description: 'What is this skill?'
}
```

---

## Integration Issues

### Q: How do I integrate this into my API routes?
**A:** Example for `/api/analyze` route:
```javascript
router.post('/analyze', async (req, res) => {
  try {
    const { resume, jobDescription } = req.body;
    
    if (!resume || !jobDescription) {
      return res.status(400).json({ error: 'Missing resume or JD' });
    }

    const analysis = analyzeResumeAndJD(resume, jobDescription);

    res.json({
      success: true,
      overallScore: analysis.scores.overallMatch,
      strengths: analysis.strengths,
      gaps: analysis.missingSkillsPrioritized,
      suggestions: analysis.suggestions
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Q: Should I cache analysis results?
**A:** Yes, if same resume+JD is analyzed multiple times:
```javascript
const cache = new Map();

function getAnalysis(resume, jd) {
  const key = `${resume.slice(0, 50)}_${jd.slice(0, 50)}`;
  if (cache.has(key)) return cache.get(key);
  
  const result = analyzeResumeAndJD(resume, jd);
  cache.set(key, result);
  return result;
}
```

### Q: How do I display results on frontend?
**A:** The response now has:
```javascript
{
  scores: {
    overallMatch,        // Main score to display
    weighted: {...}      // Show breakdown by skill level
  },
  strengths: [...],     // Green checkmarks ✓
  suggestions: [...],   // Action items
  missingSkillsPrioritized: [...]  // Learning roadmap
}
```

Example React component:
```jsx
<div>
  <h2>Match Score: {data.scores.overallMatch}%</h2>
  <h3>Strengths:</h3>
  {data.strengths.map(s => <p key={s.category}>✓ {s.description}</p>)}
  <h3>Improve:</h3>
  {data.suggestions.map(s => <p key={s.category}>→ {s.action}</p>)}
</div>
```

---

## Still Having Issues?

1. **Check logs**: Look for `[FUZZY MATCH]`, `[ATS]`, `[SEMANTIC]` etc. in console
2. **Verify inputs**: Ensure resume and JD are valid text strings
3. **Test example**: Run `EXAMPLE_USAGE.js` to see expected behavior
4. **Check files**: Verify all new utility files exist in `backend/utils/`

Common error messages and solutions:

| Error | Solution |
|-------|----------|
| "Cannot find module 'fuse.js'" | `npm install fuse.js` |
| "Cannot find module 'string-similarity'" | `npm install string-similarity` |
| "generateStrengths is not a function" | Make sure functions are exported in `resumeAnalyzer.js` |
| "skillRequirementParser is not a function" | Import: `const { ... } = require('./utils/skillRequirementParser')` |
| "Result has no property 'strengths'" | Output structure changed - check return object |

---

## Questions Not Answered?

See detailed docs:
- `QUICK_START.md` - Getting started
- `ENHANCED_FEATURES.md` - Feature details
- `EXAMPLE_USAGE.js` - Working example
- Inline comments in utility files
