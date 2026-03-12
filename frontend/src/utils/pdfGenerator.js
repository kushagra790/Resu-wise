import jsPDF from 'jspdf';

/**
 * Generate PDF report from analysis results
 */
export const generatePDFReport = (results, fileName = 'ResuWise_Analysis_Report') => {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 15;
    const margin = 15;
    const contentWidth = pageWidth - 2 * margin;

    // Helper functions
    const addHeading = (text, size = 24) => {
      doc.setFontSize(size);
      doc.setTextColor(40, 40, 40);
      doc.text(text, margin, yPosition);
      yPosition += size / 2.5;
    };

    const addSubheading = (text) => {
      doc.setFontSize(14);
      doc.setTextColor(66, 133, 244);
      doc.text(text, margin, yPosition);
      yPosition += 8;
    };

    const addSection = (title, content) => {
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = 15;
      }
      addSubheading(title);
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      const lines = doc.splitTextToSize(content, contentWidth - 10);
      doc.text(lines, margin + 5, yPosition);
      yPosition += lines.length * 5 + 5;
    };

    const addScoreBox = (label, score, color = [66, 133, 244]) => {
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = 15;
      }

      // Box
      doc.setDrawColor(color[0], color[1], color[2]);
      doc.setFillColor(color[0], color[1], color[2]);
      doc.rect(margin, yPosition - 5, contentWidth, 15, 'F');

      // Text
      doc.setFontSize(12);
      doc.setTextColor(255, 255, 255);
      doc.text(label, margin + 5, yPosition + 5);
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text(`${Math.round(score)}%`, margin + contentWidth - 15, yPosition + 5);

      yPosition += 20;
    };

    // Header
    doc.setFillColor(40, 40, 40);
    doc.rect(0, 0, pageWidth, 30, 'F');
    doc.setFontSize(28);
    doc.setTextColor(255, 255, 255);
    doc.text('ResuWise Analysis Report', margin, 15);
    doc.setFontSize(10);
    doc.setTextColor(200, 200, 200);
    doc.text(`Generated: ${new Date().toLocaleString()}`, margin, 22);

    yPosition = 40;

    // Main Scores
    addHeading('Overall Scores', 18);
    addScoreBox('Resume Match Score', results.matchPercentage, [16, 185, 129]);
    addScoreBox('ATS Compatibility Score', results.atsScore, [59, 130, 246]);

    // Experience Section
    if (results.experience && results.experience.resumeYears) {
      addSubheading('Experience Analysis');
      const expContent = `Your Experience: ${results.experience.resumeYears.join(', ')} years | Required: ${results.experience.requiredYears?.join(', ') || 'N/A'} years\n${results.experience.message}`;
      addSection('', expContent);
    }

    // Matched Skills Section
    if (results.matchedSkills && Object.keys(results.matchedSkills).length > 0) {
      addSubheading('Matched Skills');
      Object.entries(results.matchedSkills).forEach(([category, skills]) => {
        if (skills.length > 0) {
          const skillsText = `${category}: ${skills.join(', ')}`;
          doc.setFontSize(9);
          doc.setTextColor(100, 100, 100);
          const lines = doc.splitTextToSize(skillsText, contentWidth - 10);
          doc.text(lines, margin + 5, yPosition);
          yPosition += lines.length * 4 + 3;

          if (yPosition > pageHeight - 30) {
            doc.addPage();
            yPosition = 15;
          }
        }
      });
    }

    // Missing Skills Section
    if (results.missingSkills && Object.keys(results.missingSkills).length > 0) {
      const missingCount = Object.values(results.missingSkills).flat().length;
      if (missingCount > 0) {
        addSubheading('Skills to Develop');
        Object.entries(results.missingSkills).forEach(([category, skills]) => {
          if (skills.length > 0) {
            const skillsText = `${category}: ${skills.join(', ')}`;
            doc.setFontSize(9);
            doc.setTextColor(220, 100, 100);
            const lines = doc.splitTextToSize(skillsText, contentWidth - 10);
            doc.text(lines, margin + 5, yPosition);
            yPosition += lines.length * 4 + 3;

            if (yPosition > pageHeight - 30) {
              doc.addPage();
              yPosition = 15;
            }
          }
        });
      }
    }

    // ATS Breakdown
    if (results.atsScoreBreakdown && results.atsScoreBreakdown.breakdown) {
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = 15;
      }

      addSubheading('ATS Score Breakdown');
      const breakdown = results.atsScoreBreakdown.breakdown;

      const breakdownText = `
Keyword Density (40%): ${breakdown.keywordDensity}%
Skills Presence (30%): ${breakdown.skillsPresence}%
Section Detection (20%): ${breakdown.sectionDetection.score}%
Formatting Quality (10%): ${breakdown.formattingIndicators}%`;

      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(breakdownText.trim(), margin + 5, yPosition);
      yPosition += 25;
    }

    // Recommendations
    if (results.recommendations && results.recommendations.length > 0) {
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = 15;
      }

      addSubheading('Improvement Recommendations');
      results.recommendations.forEach((rec, idx) => {
        const bulletText = `${idx + 1}. ${rec}`;
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        const lines = doc.splitTextToSize(bulletText, contentWidth - 10);
        doc.text(lines, margin + 5, yPosition);
        yPosition += lines.length * 4 + 2;

        if (yPosition > pageHeight - 20) {
          doc.addPage();
          yPosition = 15;
        }
      });
    }

    // Footer
    const pageCount = doc.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }

    // Save PDF
    doc.save(`${fileName}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Failed to generate PDF report');
  }
};
