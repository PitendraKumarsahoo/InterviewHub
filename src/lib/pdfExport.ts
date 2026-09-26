import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { InterviewExperience, PreparePlan } from '../types';

export function exportExperiencePDF(
  experience: InterviewExperience,
  preparePlan?: PreparePlan | null
) {
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

  // Running header and footer handler
  const totalPagesExp = '{total_pages_count_string}';

  // 1. BRAND ACCENT & RUNNING HEADER
  doc.setFillColor(79, 70, 229); // Deep Indigo (#4f46e5)
  doc.rect(margin, currentY, contentWidth, 2.5, 'F');
  currentY += 7;

  // Eyebrow
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(79, 70, 229);
  doc.text('INTERVIEWHUB • STUDENT INTERVIEW INTELLIGENCE', margin, currentY);
  currentY += 5.5;

  // Document Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.text(`${experience.companyName} - ${experience.role}`, margin, currentY);
  currentY += 5.5;

  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // Slate 500
  const yearVal = experience.year || new Date(experience.createdAt).getFullYear();
  const collegeInfo = experience.authorCollege ? ` • ${experience.authorCollege}` : '';
  doc.text(`${experience.interviewType} Drive • Year ${yearVal}${collegeInfo}`, margin, currentY);
  currentY += 6;

  // 2. OVERVIEW METADATA TABLE (using jspdf-autotable)
  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    theme: 'grid',
    head: [['Parameter', 'Details', 'Parameter', 'Details']],
    body: [
      [
        { content: 'Company', styles: { fontStyle: 'bold', textColor: [71, 85, 105] } },
        experience.companyName,
        { content: 'Final Outcome', styles: { fontStyle: 'bold', textColor: [71, 85, 105] } },
        {
          content: experience.result,
          styles: {
            fontStyle: 'bold',
            textColor:
              experience.result === 'Selected'
                ? [16, 185, 129] // Emerald
                : experience.result === 'Not Selected'
                ? [225, 29, 72] // Rose
                : [79, 70, 229],
          },
        },
      ],
      [
        { content: 'Target Role', styles: { fontStyle: 'bold', textColor: [71, 85, 105] } },
        experience.role,
        { content: 'Evaluation Level', styles: { fontStyle: 'bold', textColor: [71, 85, 105] } },
        experience.difficulty || 'Moderate',
      ],
      [
        { content: 'Interview Drive', styles: { fontStyle: 'bold', textColor: [71, 85, 105] } },
        `${experience.interviewType} (${yearVal})`,
        { content: 'Total Rounds', styles: { fontStyle: 'bold', textColor: [71, 85, 105] } },
        `${experience.rounds.length} Interview Rounds`,
      ],
      [
        { content: 'Technologies', styles: { fontStyle: 'bold', textColor: [71, 85, 105] } },
        {
          content: experience.technologies?.length
            ? experience.technologies.join(', ')
            : 'General Problem Solving',
          colSpan: 3,
        },
      ],
    ],
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

  currentY = (doc as any).lastAutoTable.finalY + 7;

  // 3. STUDENT EXPERIENCE NARRATIVE
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Interview Summary & Candidate Debrief', margin, currentY);
  currentY += 4.5;

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    theme: 'plain',
    body: [
      [
        {
          content: experience.experienceText,
          styles: {
            fontSize: 8.5,
            textColor: [51, 65, 85],
            cellPadding: { top: 2, bottom: 2, left: 3, right: 3 },
            fillColor: [248, 250, 252],
            lineColor: [226, 232, 240],
            lineWidth: 0.2,
          },
        },
      ],
    ],
  });

  currentY = (doc as any).lastAutoTable.finalY + 7;

  // 4. STRUCTURED INTERVIEW ROUNDS & QUESTIONS TABLE (jspdf-autotable)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`Interview Rounds & Questions Breakdown (${experience.rounds.length} Rounds)`, margin, currentY);
  currentY += 4.5;

  const roundsTableRows = experience.rounds.map((round, idx) => {
    const questionList = round.questions && round.questions.length > 0
      ? round.questions.filter((q) => q.trim()).map((q) => `•  ${q}`).join('\n\n')
      : 'No specific questions recorded for this round.';

    return [
      `Round ${idx + 1}`,
      round.roundName,
      questionList,
    ];
  });

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    theme: 'striped',
    head: [['Round', 'Round Name', 'Questions & Discussion Topics Reported']],
    body: roundsTableRows,
    headStyles: {
      fillColor: [79, 70, 229], // Indigo 600
      textColor: [255, 255, 255],
      fontSize: 8.5,
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 18, fontStyle: 'bold', halign: 'center' },
      1: { cellWidth: 38, fontStyle: 'bold' },
      2: { cellWidth: 'auto' },
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
      cellPadding: 3,
      valign: 'top',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    styles: {
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 7;

  // 5. ADVICE FOR JUNIORS (Highlight Block)
  if (experience.advice && experience.advice.trim()) {
    // Check page space
    if (currentY + 28 > pageHeight - margin) {
      doc.addPage();
      currentY = margin + 8;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.text('Candidate Advice for Aspirants & Juniors', margin, currentY);
    currentY += 4.5;

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      theme: 'plain',
      body: [
        [
          {
            content: `Key Advice: ${experience.advice}`,
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

    currentY = (doc as any).lastAutoTable.finalY + 7;
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
    if (preparePlan.recommendedStudyPlan && preparePlan.recommendedStudyPlan.length > 0) {
      prepRows.push([
        'Study Roadmap',
        preparePlan.recommendedStudyPlan.map((s) => `✓  ${s}`).join('\n'),
      ]);
    }
    if (preparePlan.proTips && preparePlan.proTips.length > 0) {
      prepRows.push([
        'Preparation Tips',
        preparePlan.proTips.map((t) => `•  ${t}`).join('\n'),
      ]);
    }

    if (prepRows.length > 0) {
      autoTable(doc, {
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
        `InterviewHub • ${experience.companyName} (${experience.role}) Interview Experience`,
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
      pageWidth - margin - 15,
      pageHeight - 5
    );
  }

  // Clean filename for download
  const cleanComp = experience.companyName.replace(/[^a-zA-Z0-9]/g, '_');
  const cleanRole = experience.role.replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`${cleanComp}_${cleanRole}_Interview_Experience.pdf`);
}
