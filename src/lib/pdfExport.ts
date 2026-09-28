import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { InterviewExperience, PreparePlan } from '../types';

/**
 * Robust wrapper to invoke jspdf-autotable across different bundler / ESM environments
 */
function applyTable(doc: jsPDF, options: any) {
  try {
    if (typeof (doc as any).autoTable === 'function') {
      (doc as any).autoTable(options);
      return true;
    }
    if (typeof autoTable === 'function') {
      autoTable(doc, options);
      return true;
    }
    if (typeof (autoTable as any)?.default === 'function') {
      (autoTable as any).default(doc, options);
      return true;
    }
  } catch (err) {
    console.warn('AutoTable rendering exception:', err);
  }
  return false;
}

function getFinalY(doc: jsPDF, fallbackY: number): number {
  try {
    const last = (doc as any).lastAutoTable;
    if (last && typeof last.finalY === 'number') {
      return last.finalY;
    }
  } catch {
    // Ignore
  }
  return fallbackY;
}

export function exportExperiencePDF(
  experience: InterviewExperience,
  preparePlan?: PreparePlan | null
): boolean {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 16;
    const contentWidth = pageWidth - margin * 2;
    let currentY = margin;

    // Sanitize data defensively
    const compName = experience.companyName || 'Company';
    const roleTitle = experience.role || 'Software Engineer';
    const driveType = experience.interviewType || 'Campus';
    const resultOutcome = experience.result || 'Outcome Undisclosed';
    const safeDifficulty = experience.difficulty || 'Moderate';
    const safeExpText = experience.experienceText || 'No detailed write-up provided.';
    const safeAdvice = experience.advice || '';
    const safeTechs = Array.isArray(experience.technologies) && experience.technologies.length > 0
      ? experience.technologies.join(', ')
      : 'General Problem Solving & Engineering Fundamentals';

    const safeRounds = Array.isArray(experience.rounds)
      ? experience.rounds.map((r: any, idx: number) => {
          const rName = typeof r === 'string' ? r : (r?.roundName || `Round ${idx + 1}`);
          const rQuestions = Array.isArray(r?.questions)
            ? r.questions.filter((q: any) => typeof q === 'string' && q.trim())
            : [];
          return { roundName: rName, questions: rQuestions };
        })
      : [];

    let yearVal: number | string = new Date().getFullYear();
    if (experience.year) {
      yearVal = experience.year;
    } else if (experience.createdAt) {
      const parsed = new Date(experience.createdAt);
      if (!isNaN(parsed.getFullYear())) {
        yearVal = parsed.getFullYear();
      }
    }

    // 1. BRAND ACCENT & RUNNING HEADER
    doc.setFillColor(234, 88, 12); // Orange (#ea580c)
    doc.rect(margin, currentY, contentWidth, 2.5, 'F');
    currentY += 7;

    // Eyebrow
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(234, 88, 12);
    doc.text('INTERVIEWHUB • STUDENT INTERVIEW INTELLIGENCE DEBRIEF', margin, currentY);
    currentY += 5.5;

    // Document Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42); // Slate 900
    doc.text(`${compName} - ${roleTitle}`, margin, currentY);
    currentY += 5.5;

    // Subtitle
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139); // Slate 500
    const collegeInfo = experience.authorCollege ? ` • ${experience.authorCollege}` : '';
    doc.text(`${driveType} Drive • Year ${yearVal}${collegeInfo}`, margin, currentY);
    currentY += 6;

    // 2. OVERVIEW METADATA TABLE
    const metadataRows: any[] = [
      [
        { content: 'Company', styles: { fontStyle: 'bold', textColor: [71, 85, 105] } },
        compName,
        { content: 'Final Outcome', styles: { fontStyle: 'bold', textColor: [71, 85, 105] } },
        {
          content: resultOutcome,
          styles: {
            fontStyle: 'bold',
            textColor:
              resultOutcome.toLowerCase().includes('not select') || resultOutcome.toLowerCase().includes('reject')
                ? [225, 29, 72] // Rose
                : resultOutcome.toLowerCase().includes('select') || resultOutcome.toLowerCase().includes('offer')
                ? [16, 185, 129] // Emerald
                : resultOutcome.toLowerCase().includes('wait')
                ? [217, 119, 6] // Amber
                : [71, 85, 105], // Slate
          },
        },
      ],
      [
        { content: 'Target Role', styles: { fontStyle: 'bold', textColor: [71, 85, 105] } },
        roleTitle,
        { content: 'Difficulty', styles: { fontStyle: 'bold', textColor: [71, 85, 105] } },
        safeDifficulty,
      ],
      [
        { content: 'Interview Drive', styles: { fontStyle: 'bold', textColor: [71, 85, 105] } },
        `${driveType} (${yearVal})`,
        { content: 'Total Rounds', styles: { fontStyle: 'bold', textColor: [71, 85, 105] } },
        `${safeRounds.length} Interview Rounds`,
      ],
      [
        { content: 'Technologies', styles: { fontStyle: 'bold', textColor: [71, 85, 105] } },
        {
          content: safeTechs,
          colSpan: 3,
        },
      ],
    ];

    if (Array.isArray(experience.tags) && experience.tags.length > 0) {
      metadataRows.push([
        { content: 'Domain Tags', styles: { fontStyle: 'bold', textColor: [71, 85, 105] } },
        {
          content: experience.tags.map((t) => `#${t}`).join('  '),
          colSpan: 3,
        },
      ]);
    }

    if (experience.authorName) {
      metadataRows.push([
        { content: 'Contributor', styles: { fontStyle: 'bold', textColor: [71, 85, 105] } },
        `${experience.authorName}${experience.authorCollege ? ` (${experience.authorCollege})` : ''}`,
        { content: 'Overall Rating', styles: { fontStyle: 'bold', textColor: [71, 85, 105] } },
        experience.overallRating ? `${experience.overallRating} / 5 Stars` : 'Verified',
      ]);
    }

    const metadataSuccess = applyTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      theme: 'grid',
      head: [['Parameter', 'Details', 'Parameter', 'Details']],
      body: metadataRows,
      headStyles: {
        fillColor: [241, 245, 249],
        textColor: [15, 23, 42],
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'left',
      },
      bodyStyles: {
        fontSize: 8.5,
        textColor: [30, 41, 59],
        cellPadding: 2.2,
      },
      styles: {
        lineColor: [226, 232, 240],
        lineWidth: 0.2,
      },
    });

    currentY = getFinalY(doc, currentY + (metadataSuccess ? 32 : 15)) + 7;

    // 3. STUDENT EXPERIENCE NARRATIVE
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.text('Interview Summary & Candidate Debrief', margin, currentY);
    currentY += 4.5;

    const narrativeSuccess = applyTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      theme: 'plain',
      body: [
        [
          {
            content: safeExpText,
            styles: {
              fontSize: 8.5,
              textColor: [51, 65, 85],
              cellPadding: { top: 2.5, bottom: 2.5, left: 3, right: 3 },
              fillColor: [248, 250, 252],
              lineColor: [226, 232, 240],
              lineWidth: 0.2,
            },
          },
        ],
      ],
    });

    currentY = getFinalY(doc, currentY + (narrativeSuccess ? 22 : 15)) + 7;

    // 4. STRUCTURED INTERVIEW ROUNDS & QUESTIONS TABLE
    if (safeRounds.length > 0) {
      if (currentY + 30 > pageHeight - margin) {
        doc.addPage();
        currentY = margin + 8;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(15, 23, 42);
      doc.text(`Interview Rounds & Questions Breakdown (${safeRounds.length} Rounds)`, margin, currentY);
      currentY += 4.5;

      const roundsTableRows = safeRounds.map((round, idx) => {
        const questionList = round.questions && round.questions.length > 0
          ? round.questions.map((q: string) => `•  ${q}`).join('\n\n')
          : 'Discussion on background, technical foundations, and domain questions.';

        return [
          `Round ${idx + 1}`,
          round.roundName,
          questionList,
        ];
      });

      const roundsSuccess = applyTable(doc, {
        startY: currentY,
        margin: { left: margin, right: margin },
        theme: 'striped',
        head: [['Round', 'Round Name', 'Questions & Discussion Topics Reported']],
        body: roundsTableRows,
        headStyles: {
          fillColor: [234, 88, 12], // Orange 600
          textColor: [255, 255, 255],
          fontSize: 8.5,
          fontStyle: 'bold',
        },
        columnStyles: {
          0: { cellWidth: 18, fontStyle: 'bold', halign: 'center' },
          1: { cellWidth: 40, fontStyle: 'bold' },
          2: { cellWidth: 'auto' },
        },
        bodyStyles: {
          fontSize: 8,
          textColor: [30, 41, 59],
          cellPadding: 3,
          valign: 'top',
        },
        alternateRowStyles: {
          fillColor: [254, 247, 242], // Light orange tint
        },
        styles: {
          lineColor: [226, 232, 240],
          lineWidth: 0.2,
        },
      });

      currentY = getFinalY(doc, currentY + (roundsSuccess ? 30 : 20)) + 7;
    }

    // 5. ADVICE FOR JUNIORS
    if (safeAdvice.trim()) {
      if (currentY + 28 > pageHeight - margin) {
        doc.addPage();
        currentY = margin + 8;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(15, 23, 42);
      doc.text('Candidate Advice for Aspirants & Juniors', margin, currentY);
      currentY += 4.5;

      const adviceSuccess = applyTable(doc, {
        startY: currentY,
        margin: { left: margin, right: margin },
        theme: 'plain',
        body: [
          [
            {
              content: `Key Advice: ${safeAdvice}`,
              styles: {
                fontSize: 8.5,
                textColor: [120, 53, 15], // Amber 800
                fillColor: [254, 252, 232], // Amber 50
                lineColor: [253, 230, 138], // Amber 200
                lineWidth: 0.3,
                cellPadding: 3.5,
                fontStyle: 'normal',
              },
            },
          ],
        ],
      });

      currentY = getFinalY(doc, currentY + (adviceSuccess ? 20 : 15)) + 7;
    }

    // 6. AI PREPARATION CHECKLIST (if present)
    if (preparePlan) {
      if (currentY + 35 > pageHeight - margin) {
        doc.addPage();
        currentY = margin + 8;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(67, 56, 202); // Indigo 700
      doc.text('Recommended Revision & Preparation Plan', margin, currentY);
      currentY += 4.5;

      const prepRows: any[] = [];
      if (preparePlan.summary) {
        prepRows.push(['Overview', preparePlan.summary]);
      }
      if (Array.isArray(preparePlan.recommendedStudyPlan) && preparePlan.recommendedStudyPlan.length > 0) {
        prepRows.push([
          'Study Roadmap',
          preparePlan.recommendedStudyPlan.map((s) => `✓  ${s}`).join('\n'),
        ]);
      }
      if (Array.isArray(preparePlan.proTips) && preparePlan.proTips.length > 0) {
        prepRows.push([
          'Preparation Tips',
          preparePlan.proTips.map((t) => `•  ${t}`).join('\n'),
        ]);
      }

      if (prepRows.length > 0) {
        applyTable(doc, {
          startY: currentY,
          margin: { left: margin, right: margin },
          theme: 'grid',
          head: [['Focus Area', 'Action Items & Guidance']],
          body: prepRows,
          headStyles: {
            fillColor: [238, 242, 255],
            textColor: [67, 56, 202],
            fontSize: 8,
            fontStyle: 'bold',
          },
          columnStyles: {
            0: { cellWidth: 32, fontStyle: 'bold', textColor: [67, 56, 202] },
            1: { cellWidth: 'auto' },
          },
          bodyStyles: {
            fontSize: 8,
            textColor: [30, 41, 59],
            cellPadding: 2.8,
          },
          styles: {
            lineColor: [224, 231, 255],
            lineWidth: 0.2,
          },
        });
      }
    }

    // 7. RUNNING HEADER & FOOTER WITH PAGE NUMBERS
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);

      // Running Header (Pages 2+)
      if (i > 1) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184);
        doc.text(
          `InterviewHub • ${compName} (${roleTitle}) Interview Debrief`,
          margin,
          9
        );
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.2);
        doc.line(margin, 11, pageWidth - margin, 11);
      }

      // Running Footer (All pages)
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.2);
      doc.line(margin, pageHeight - 9, pageWidth - margin, pageHeight - 9);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `InterviewHub Student Intelligence • Offline Preparation Document`,
        margin,
        pageHeight - 5
      );
      doc.text(
        `Page ${i} of ${totalPages}`,
        pageWidth - margin - 18,
        pageHeight - 5
      );
    }

    // Clean filename for download
    const cleanComp = compName.replace(/[^a-zA-Z0-9_-]/g, '_') || 'Company';
    const cleanRole = roleTitle.replace(/[^a-zA-Z0-9_-]/g, '_') || 'Role';
    doc.save(`${cleanComp}_${cleanRole}_Interview_Debrief.pdf`);
    return true;
  } catch (err) {
    console.error('exportExperiencePDF critical error:', err);
    return false;
  }
}
