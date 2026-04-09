import jsPDF from 'jspdf';

/* ─────────────────────────────────────────────────────────
   SAFE jsPDF 2.5.x PDF GENERATOR
   Uses ONLY verified jsPDF 2.x primitives:
     setFillColor, setDrawColor, setTextColor, setFontSize,
     setFont, rect, line, text, splitTextToSize, addPage,
     setLineWidth, internal.pageSize, save
   No roundedRect / circle (unreliable in 2.5.x)
─────────────────────────────────────────────────────────── */

// ── Colour palette ────────────────────────────────────────
const BLUE   = [37,  99,  235];   // brand blue
const DKNAV  = [15,  23,  55];    // header bg
const WHITE  = [255, 255, 255];
const INK    = [20,  24,  38];    // headings
const GRAY   = [80,  88, 110];    // body text
const LGRAY  = [210, 215, 228];   // borders / dividers
const BGPAGE = [247, 249, 253];   // subtle page bg

const GREEN  = [16,  185, 129];
const GREENL = [209, 250, 229];
const RED    = [239, 68,  68];
const REDL   = [254, 226, 226];
const AMBER  = [217, 119,  6];
const AMBERL = [254, 243, 192];
const VIOLET = [109,  40, 217];
const VIOLETL= [237, 233, 254];

function scoreColor(s) {
  if (s >= 80) return GREEN;
  if (s >= 60) return AMBER;
  return RED;
}
function scoreBg(s) {
  if (s >= 80) return GREENL;
  if (s >= 60) return AMBERL;
  return REDL;
}
function scoreLabel(s) {
  if (s >= 80) return 'Excellent';
  if (s >= 60) return 'Good';
  return 'Needs Work';
}

// ── Main export ───────────────────────────────────────────
export const generatePDFReport = (results, fileName = 'ResuWise_Analysis_Report') => {
  try {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const PW = doc.internal.pageSize.getWidth();   // 210
    const PH = doc.internal.pageSize.getHeight();  // 297
    const ML = 14;
    const MR = 14;
    const CW = PW - ML - MR;

    let y = 0;

    // ── helpers ────────────────────────────────────────────
    const nl = (n = 4) => { y += n; };

    const guard = (need = 20) => {
      if (y + need > PH - 18) {
        footer();
        doc.addPage();
        pageBg();
        y = 20;
      }
    };

    const pageBg = () => {
      doc.setFillColor(...BGPAGE);
      doc.rect(0, 0, PW, PH, 'F');
    };

    const footer = () => {
      const pg = doc.internal.getCurrentPageInfo().pageNumber;
      const tot = doc.internal.pages.length - 1;
      doc.setFillColor(...DKNAV);
      doc.rect(0, PH - 12, PW, 12, 'F');
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(140, 160, 200);
      doc.text('ResuWise  ·  AI Resume Intelligence', ML, PH - 4.5);
      doc.text(`Page ${pg} of ${tot}`, PW - MR, PH - 4.5, { align: 'right' });
      doc.text('Confidential · For personal use only', PW / 2, PH - 4.5, { align: 'center' });
    };

    const set = (size, style = 'normal', color = INK) => {
      doc.setFontSize(size);
      doc.setFont('helvetica', style);
      doc.setTextColor(...color);
    };

    const filledRect = (x, ry, w, h, color) => {
      doc.setFillColor(...color);
      doc.rect(x, ry, w, h, 'F');
    };

    const strokedRect = (x, ry, w, h, color, lw = 0.3) => {
      doc.setDrawColor(...color);
      doc.setLineWidth(lw);
      doc.rect(x, ry, w, h, 'S');
    };

    const hline = (color = LGRAY, lw = 0.25) => {
      doc.setDrawColor(...color);
      doc.setLineWidth(lw);
      doc.line(ML, y, PW - MR, y);
      y += 3.5;
    };

    // Section heading with left accent bar
    const sectionHead = (title) => {
      guard(18);
      filledRect(ML, y, 3, 8, BLUE);
      set(10, 'bold', INK);
      doc.text(title, ML + 6, y + 6);
      y += 10;
      hline(LGRAY, 0.2);
    };

    // Labelled metric row (label ... value%)
    const metricRow = (label, val, barColor, weight) => {
      guard(14);
      set(8, 'normal', GRAY);
      doc.text(label, ML + 2, y + 3.5);
      if (weight) {
        const lw = doc.getTextWidth(label);
        set(7, 'normal', [160, 170, 190]);
        doc.text(`(${weight})`, ML + 2 + lw + 1.5, y + 3.5);
      }
      const valStr = (val !== undefined && val !== null) ? `${Math.round(val)}%` : 'N/A';
      set(9, 'bold', barColor);
      doc.text(valStr, PW - MR - 1, y + 3.5, { align: 'right' });

      // Track bg
      const bx = ML + 2, bw = CW - 4, bh = 2.2;
      filledRect(bx, y + 5.5, bw, bh, [220, 225, 235]);
      if (val > 0) filledRect(bx, y + 5.5, (bw * Math.min(val, 100)) / 100, bh, barColor);
      y += 12;
    };

    // Render skill chips wrapping across lines
    const skillChips = (skills, fgColor, bgColor) => {
      if (!skills || skills.length === 0) return;
      let cx = ML + 3;
      const chipH = 6;

      skills.forEach(skill => {
        const label = String(skill);
        set(7.5, 'normal', fgColor);
        const tw = doc.getTextWidth(label);
        const cw = tw + 7;

        if (cx + cw > PW - MR) {
          cx = ML + 3;
          y += chipH + 2;
          guard(10);
        }
        // Chip background
        filledRect(cx, y, cw, chipH, bgColor);
        // Chip border (1px)
        doc.setDrawColor(...fgColor);
        doc.setLineWidth(0.15);
        doc.rect(cx, y, cw, chipH, 'S');
        // Chip text
        set(7.5, 'normal', fgColor);
        doc.text(label, cx + 3.5, y + 4.2);
        cx += cw + 2.5;
      });
      y += chipH + 3;
    };

    // Category row (coloured heading + chip list)
    const categorySkills = (cat, skills, fg, bg) => {
      if (!skills || skills.length === 0) return;
      guard(18);
      set(8, 'bold', fg);
      doc.text(cat, ML + 2, y + 4);
      // count badge (simple rect)
      const catW  = doc.getTextWidth(cat);
      const badgeTxt = `${skills.length}`;
      filledRect(ML + 2 + catW + 2, y, doc.getTextWidth(badgeTxt) + 5, 6, bg);
      set(7, 'bold', fg);
      doc.text(badgeTxt, ML + 2 + catW + 4.5, y + 4.2);
      y += 7;
      skillChips(skills, fg, bg);
      y += 1;
    };

    /* ═══════════════════════════════════════════════════════
       PAGE 1 : COVER
    ═══════════════════════════════════════════════════════ */
    pageBg();

    // Navy header band
    filledRect(0, 0, PW, 46, DKNAV);
    // Blue accent bottom stripe
    filledRect(0, 43, PW, 3, BLUE);

    // RW logo square
    filledRect(ML, 9, 13, 13, BLUE);
    set(10, 'bold', WHITE);
    doc.text('RW', ML + 3, 18);

    // Brand name
    set(17, 'bold', WHITE);
    doc.text('ResuWise', ML + 17, 17);
    set(7.5, 'normal', [140, 170, 210]);
    doc.text('AI RESUME INTELLIGENCE PLATFORM', ML + 17, 22.5);

    // Report title (right)
    set(10.5, 'bold', [210, 230, 255]);
    doc.text('RESUME ANALYSIS REPORT', PW - MR, 16, { align: 'right' });
    const now = new Date();
    const dateStr = `Generated: ${now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}  ${now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
    set(7.5, 'normal', [120, 150, 200]);
    doc.text(dateStr, PW - MR, 23, { align: 'right' });

    y = 55;

    /* ── Score Cards (side by side) ───────────────────── */
    const renderCard = (x, cardW, label, sub, score) => {
      const cg = scoreColor(score);
      const bg = scoreBg(score);
      const lbl = scoreLabel(score);
      const cardH = 44;

      // White card bg
      filledRect(x, y, cardW, cardH, WHITE);
      strokedRect(x, y, cardW, cardH, LGRAY, 0.3);
      // Top coloured bar (3 mm)
      filledRect(x, y, cardW, 3, cg);

      // Score big number
      set(28, 'bold', cg);
      doc.text(`${Math.round(score)}%`, x + cardW / 2, y + 21, { align: 'center' });

      // Grade badge pill (simulated with rect)
      const badgeW = 26;
      const bx = x + (cardW - badgeW) / 2;
      filledRect(bx, y + 23, badgeW, 6.5, bg);
      set(7.5, 'bold', cg);
      doc.text(lbl, x + cardW / 2, y + 27.8, { align: 'center' });

      // Label
      set(8.5, 'bold', GRAY);
      doc.text(label, x + cardW / 2, y + 36, { align: 'center' });

      // Sub-label
      set(6.5, 'normal', [160, 170, 190]);
      doc.text(sub, x + cardW / 2, y + 40.5, { align: 'center' });
    };

    const halfW = (CW - 5) / 2;
    renderCard(ML,              halfW, 'Resume Match Score',      'Semantic + ATS analysis',    results.matchPercentage || 0);
    renderCard(ML + halfW + 5,  halfW, 'ATS Compatibility Score', 'Skills, keywords & format',  results.atsScore        || 0);
    y += 50;

    /* ── ATS Breakdown Bars ────────────────────────────── */
    const bd = results.atsScoreBreakdown;
    if (bd && bd.keywordDensity !== undefined) {
      sectionHead('ATS Score Breakdown');
      metricRow('Keyword Density',   bd.keywordDensity,               BLUE,   '40%');
      metricRow('Skills Presence',   bd.skillsPresence,               VIOLET, '30%');
      metricRow('Section Detection', bd.sectionDetection?.score,      GREEN,  '20%');
      metricRow('Formatting Quality',bd.formattingIndicators,         AMBER,  '10%');

      if (bd.sectionDetection?.detected?.length > 0) {
        set(7.5, 'normal', [140, 148, 168]);
        doc.text(`Detected sections: ${bd.sectionDetection.detected.join(', ')}`, ML + 2, y);
        y += 7;
      }
    }

    /* ── Experience ────────────────────────────────────── */
    const exp = results.experience;
    if (exp && (exp.resumeYears?.length > 0 || exp.requiredYears?.length > 0)) {
      guard(36);
      sectionHead('Experience Analysis');

      const qualified = exp.isQualified;
      const cardC  = qualified ? GREEN : RED;
      const cardBg = qualified ? GREENL : REDL;
      const expH   = 26;

      filledRect(ML, y, CW, expH, cardBg);
      strokedRect(ML, y, CW, expH, cardC, 0.3);

      // Your experience (left)
      set(7, 'normal', GRAY);
      doc.text('Your Experience', ML + 6, y + 7);
      set(15, 'bold', INK);
      const yrsTxt = exp.resumeYears?.length > 0 ? `${exp.resumeYears.join(', ')} yrs` : 'N/A';
      doc.text(yrsTxt, ML + 6, y + 18);

      // Centre
      const tick = qualified ? '✓  Qualifies' : '✗  Gap Found';
      set(9, 'bold', cardC);
      doc.text(tick, PW / 2, y + 14, { align: 'center' });

      // Required (right)
      set(7, 'normal', GRAY);
      doc.text('Required', PW - MR - 6, y + 7, { align: 'right' });
      set(15, 'bold', INK);
      const reqTxt = exp.requiredYears?.length > 0 ? `${exp.requiredYears.join(', ')} yrs` : 'N/A';
      doc.text(reqTxt, PW - MR - 6, y + 18, { align: 'right' });

      y += expH + 4;

      if (exp.message) {
        set(8, 'normal', cardC);
        const lines = doc.splitTextToSize(exp.message, CW - 4);
        doc.text(lines, ML + 2, y);
        y += lines.length * 4.5 + 4;
      }
    }

    /* ── Matched Skills ────────────────────────────────── */
    const matched = results.matchedSkills || {};
    if (Object.values(matched).flat().length > 0) {
      guard(22);
      sectionHead('Matched Skills');
      Object.entries(matched).forEach(([cat, skills]) => {
        if (skills?.length > 0) categorySkills(cat, skills, GREEN, GREENL);
      });
    }

    /* ── Missing Skills ────────────────────────────────── */
    const missing = results.missingSkills || {};
    if (Object.values(missing).flat().length > 0) {
      guard(22);
      sectionHead('Skills to Develop');
      Object.entries(missing).forEach(([cat, skills]) => {
        if (skills?.length > 0) categorySkills(cat, skills, RED, REDL);
      });
    }

    /* ── Recommendations ───────────────────────────────── */
    const recs = [];
    if (bd) {
      if (bd.keywordDensity    < 70) recs.push('Increase keyword density — mirror technical terms directly from the job description.');
      if (bd.skillsPresence    < 70) recs.push('Highlight all required skills — ensure every skill category from the JD appears in your resume.');
      if ((bd.sectionDetection?.score ?? 100) < 70) recs.push('Add standard sections: Skills, Experience, Education, and Contact.');
      if (bd.formattingIndicators < 70) recs.push('Improve formatting — use clear bullet points and distinct section headings.');
    }
    if ((results.matchPercentage || 0) < 60) recs.push('Tailor your resume for this specific role — align language and key focus areas with the JD.');
    if (recs.length === 0) recs.push('Great work! Your resume is well-optimized. Consider quantifying your achievements with numbers.');

    guard(28);
    sectionHead('Recommendations');

    recs.forEach((rec, i) => {
      guard(14);
      // Number box
      filledRect(ML + 2, y, 6, 6, AMBERL);
      set(7.5, 'bold', AMBER);
      doc.text(`${i + 1}`, ML + 5, y + 4.5);

      set(8.5, 'normal', GRAY);
      const lines = doc.splitTextToSize(rec, CW - 14);
      doc.text(lines, ML + 11, y + 4.5);
      y += lines.length * 5 + 3;
    });

    /* ── Disclaimer ────────────────────────────────────── */
    guard(22);
    y += 5;
    filledRect(ML, y, CW, 18, [237, 242, 255]);
    strokedRect(ML, y, CW, 18, [180, 200, 240], 0.2);
    set(8, 'bold', BLUE);
    doc.text('About this report', ML + 5, y + 6);
    set(7.5, 'normal', GRAY);
    const disc = doc.splitTextToSize(
      'Generated by ResuWise using TF-IDF vectorization and cosine similarity. Scores are indicative and should be used alongside human review.',
      CW - 10
    );
    doc.text(disc, ML + 5, y + 12);
    y += 22;

    /* ── Finalize footers ──────────────────────────────── */
    const total = doc.internal.pages.length - 1;
    for (let p = 1; p <= total; p++) {
      doc.setPage(p);
      footer();
    }

    doc.save(`${fileName}.pdf`);

  } catch (err) {
    console.error('[PDF] Generation failed:', err);
    alert(`PDF generation error: ${err.message}`);
  }
};
