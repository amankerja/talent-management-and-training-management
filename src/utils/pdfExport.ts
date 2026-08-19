import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  Employee, 
  TrainingModule, 
  TNARule, 
  Department, 
  JobLevel, 
  ManpowerDeptPlan,
  DetailedIDP,
  AnnualTrainingPlanItem,
  ExecutiveHealthSummary,
  EmergencySuccessionSimulation,
  CompetencyItem,
  CriticalPosition
} from '../types';
import { NINE_BOX_DEFINITIONS } from '../data/mockData';

// Helper to format date
const getFormattedDate = () => {
  const d = new Date();
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }) + ` - ${d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;
};

/**
 * Universal PDF Download & Save Helper
 * Handles browser downloads, Tauri Webview, Blob triggers, and fallback mechanisms
 */
export const savePdf = (doc: jsPDF, filename: string): boolean => {
  try {
    // 1. Direct jsPDF save
    doc.save(filename);
    return true;
  } catch (err) {
    console.warn('Standard doc.save failed, executing Blob URL trigger:', err);
    try {
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
        URL.revokeObjectURL(url);
      }, 1500);
      return true;
    } catch (fallbackErr) {
      console.error('All PDF save methods failed:', fallbackErr);
      return false;
    }
  }
};

/**
 * Helper to draw a modern visual progress bar on PDF
 */
const drawProgressBar = (
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number,
  percentage: number,
  fillColor: [number, number, number] = [37, 99, 235],
  bgColor: [number, number, number] = [226, 232, 240]
) => {
  const clamped = Math.min(Math.max(percentage, 0), 100);
  // Background track
  doc.setFillColor(...bgColor);
  doc.roundedRect(x, y, width, height, 1, 1, 'F');
  // Filled track
  if (clamped > 0) {
    const fillW = Math.max((width * clamped) / 100, 2);
    doc.setFillColor(...fillColor);
    doc.roundedRect(x, y, fillW, height, 1, 1, 'F');
  }
};

/**
 * Helper to draw Corporate Standard PDF Header
 */
const drawCorporateHeader = (
  doc: jsPDF,
  title: string,
  subtitle: string,
  docIdPrefix: string,
  isLandscape = false,
  accentColor: [number, number, number] = [37, 99, 235]
) => {
  const width = isLandscape ? 297 : 210;
  // Dark header bar
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, width, 24, 'F');

  // Accent colored bar
  doc.setFillColor(...accentColor);
  doc.rect(0, 24, width, 2, 'F');

  // Titles
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(`WORKFORCE OS — ${title.toUpperCase()}`, 14, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  doc.text(subtitle, 14, 18);

  // Metadata right side
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(`Doc Ref: ${docIdPrefix}-${Date.now().toString().slice(-6)}`, width - 65, 11);
  doc.text(`Generated: ${getFormattedDate()}`, width - 65, 18);
};

/**
 * Helper to draw Corporate Standard Page Footers
 */
const drawCorporateFooter = (
  doc: jsPDF,
  categoryText: string,
  isLandscape = false
) => {
  const totalPages = doc.getNumberOfPages();
  const width = isLandscape ? 297 : 210;
  const height = isLandscape ? 210 : 297;

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.line(14, height - 12, width - 14, height - 12);

    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(`CONFIDENTIAL — ${categoryText.toUpperCase()} — PT ALKARA TRANS LOGISTIK`, 14, height - 7);
    doc.text(`Halaman ${i} dari ${totalPages}`, width - 40, height - 7);
  }
};

// ============================================================================
// 1. EXECUTIVE DASHBOARD & HC HEALTH REPORT PDF (WITH GRAPHICAL CHARTS)
// ============================================================================
export const generateExecutiveDashboardPDF = (
  executiveHealth?: ExecutiveHealthSummary,
  employees: Employee[] = [],
  criticalPositions: CriticalPosition[] = [],
  mppData: ManpowerDeptPlan[] = []
) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  drawCorporateHeader(doc, 'Executive Human Capital Intelligence Report', 'Executive Board Health Clusters, Strategic Talent Analytics & Operational Risks', 'EXE-DASH', false, [79, 70, 229]);

  const totalEmps = employees?.length || 1;
  const h = executiveHealth || {
    workforceHealth: { totalHeadcount: totalEmps, budgetHeadcount: totalEmps, vacancyCount: 0, retirementRiskCount: 0, turnoverRate: 0, status: 'Optimal' },
    learningHealth: { trainingComplianceRate: 100, mandatoryComplianceRate: 100, totalTrainingHours: 0, expiringCertificationsCount: 0, status: 'Optimal' },
    competencyHealth: { qualificationRate: 100, totalCompetencyGapCount: 0, criticalCompetencyGapCount: 0, skillCoverageRate: 100, status: 'Optimal' },
    talentHealth: { highPotentialCount: 0, highPerformerCount: 0, keyTalentCount: 0, talentRiskCount: 0, status: 'Optimal' },
    successionHealth: { successionCoverageRate: 100, criticalPositionsCount: criticalPositions.length, readyNowSuccessorsCount: 0, positionsWithoutSuccessorCount: 0, status: 'Optimal' }
  };

  // 1. Graphical Health Gauge Cards (Visual Metrics with Progress Bars)
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('1. HEALTH CLUSTER TELEMETRY & STRATEGIC KPI GAUGES', 14, 34);

  const wfTotal = h.workforceHealth?.totalHeadcount ?? totalEmps;
  const wfBudget = h.workforceHealth?.budgetHeadcount ?? totalEmps;
  const lCompliance = h.learningHealth?.trainingComplianceRate ?? 100;
  const cQual = h.competencyHealth?.qualificationRate ?? 100;
  const tHiPo = h.talentHealth?.highPotentialCount ?? 0;
  const sCoverage = h.successionHealth?.successionCoverageRate ?? 100;

  // 5 Health Cards Grid (2 rows)
  const cards = [
    { title: 'Workforce Fulfillment', value: `${wfTotal} / ${wfBudget} HC`, pct: Math.round((wfTotal / (wfBudget || 1)) * 100), status: h.workforceHealth?.status || 'Optimal', color: [37, 99, 235] as [number, number, number] },
    { title: 'Learning Compliance', value: `${lCompliance}%`, pct: lCompliance, status: h.learningHealth?.status || 'Optimal', color: [16, 185, 129] as [number, number, number] },
    { title: 'Competency Match Fit', value: `${cQual}%`, pct: cQual, status: h.competencyHealth?.status || 'Optimal', color: [139, 92, 246] as [number, number, number] },
    { title: 'High Potential Share', value: `${tHiPo} Orang (${Math.round((tHiPo / totalEmps) * 100)}%)`, pct: Math.round((tHiPo / totalEmps) * 100), status: h.talentHealth?.status || 'Optimal', color: [245, 158, 11] as [number, number, number] },
    { title: 'Succession Coverage', value: `${sCoverage}%`, pct: sCoverage, status: h.successionHealth?.status || 'Optimal', color: [225, 29, 72] as [number, number, number] }
  ];

  // Row 1 (3 cards)
  cards.slice(0, 3).forEach((c, idx) => {
    const startX = 14 + idx * 62;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(startX, 38, 58, 24, 2, 2, 'FD');

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(c.title, startX + 4, 44);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(c.value, startX + 4, 52);

    // Progress Bar
    drawProgressBar(doc, startX + 4, 55, 50, 3, c.pct, c.color);
  });

  // Row 2 (2 cards)
  cards.slice(3, 5).forEach((c, idx) => {
    const startX = 14 + (idx - 3) * 93;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(startX, 65, 89, 24, 2, 2, 'FD');

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(c.title, startX + 4, 71);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(c.value, startX + 4, 79);

    // Progress Bar
    drawProgressBar(doc, startX + 4, 82, 81, 3, c.pct, c.color);
  });

  // 2. Departmental Headcount & Budget Distribution Chart (Drawn natively with bars)
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('2. DISTRIBUSI HEADCOUNT & BEBAN PER DEPARTEMEN', 14, 98);

  const deptCounts: Record<string, number> = {};
  employees.forEach(e => {
    deptCounts[e.department] = (deptCounts[e.department] || 0) + 1;
  });

  const deptEntries = Object.entries(deptCounts);
  const maxDept = Math.max(...Object.values(deptCounts), 1);

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 102, 182, 38, 2, 2, 'FD');

  deptEntries.forEach(([deptName, count], i) => {
    const rowY = 108 + i * 5.5;
    const barWidth = (count / maxDept) * 80;

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(51, 65, 85);
    doc.text(deptName, 18, rowY);

    // Draw Bar
    doc.setFillColor(79, 70, 229);
    doc.roundedRect(65, rowY - 3.5, barWidth, 3.5, 0.5, 0.5, 'F');

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`${count} HC (${Math.round((count / totalEmps) * 100)}%)`, 68 + barWidth, rowY);
  });

  // 3. Critical Positions & Succession Readiness Table
  autoTable(doc, {
    startY: 146,
    head: [['Posisi Kritis (Key Positions)', 'Departemen', 'Pejabat Saat Ini', 'Risk Level', 'Ready Successor', 'Status Kesiapan']],
    body: (criticalPositions || []).slice(0, 6).map(pos => [
      pos.title,
      pos.department,
      pos.currentHolder,
      pos.riskLevel,
      pos.successors?.[0]?.name || 'BELUM ADA',
      pos.successors?.[0]?.readiness || 'CRITICAL VACANCY'
    ]),
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], textColor: 255, fontSize: 8, fontStyle: 'bold' },
    styles: { fontSize: 7.5, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 46, fontStyle: 'bold' },
      1: { cellWidth: 28 },
      2: { cellWidth: 34 },
      3: { cellWidth: 18, halign: 'center', fontStyle: 'bold', textColor: [225, 29, 72] },
      4: { cellWidth: 32 },
      5: { cellWidth: 24, halign: 'center', fontStyle: 'bold' }
    }
  });

  const finalY = (doc as any).lastAutoTable?.finalY ?? 200;

  // Signatures
  if (finalY < 250) {
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text('Head of People & Culture,', 25, finalY + 10);
    doc.text('Chief Operating Officer,', 85, finalY + 10);
    doc.text('Chief Executive Officer,', 145, finalY + 10);

    doc.line(20, finalY + 26, 65, finalY + 26);
    doc.line(80, finalY + 26, 125, finalY + 26);
    doc.line(140, finalY + 26, 185, finalY + 26);

    doc.text('(VP Human Capital)', 25, finalY + 30);
    doc.text('(COO Operations)', 85, finalY + 30);
    doc.text('(Direktur Utama)', 145, finalY + 30);
  }

  drawCorporateFooter(doc, 'Executive Board Intelligence Briefing', false);
  savePdf(doc, `Executive_Health_Report_${new Date().toISOString().split('T')[0]}.pdf`);
};

// ============================================================================
// 2. EMPLOYEE 360 PROFILE & COMPETENCY RADAR REPORT PDF (WITH GRAPHICAL RADAR BARS)
// ============================================================================
export const generateEmployee360ProfilePDF = (
  employee: Employee,
  rule?: TNARule,
  qual?: { isQualified: boolean; statusText?: string },
  nineBoxInfo?: { title: string; strategicDescription: string },
  trainingModules: TrainingModule[] = [],
  idp?: DetailedIDP
) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  drawCorporateHeader(doc, 'Employee 360 Profile & Talent Dossier', 'Comprehensive Assessment, 5-Dimension Competency Radar, 9-Box & TNA Audit', 'EMP-360', false, [16, 185, 129]);

  // Employee Identity Card
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 32, 182, 30, 2, 2, 'FD');

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(employee.name.toUpperCase(), 18, 40);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Jabatan: ${employee.jobTitle}  |  Departemen: ${employee.department}`, 18, 46);
  doc.text(`NIP: ${employee.nip}  |  Level: ${employee.level} (${employee.grade})  |  Status: ${employee.employmentType?.split(' ')[0] || 'PKWT'}`, 18, 52);
  doc.text(`Pendidikan: ${employee.education}  |  Masa Kerja: ${employee.tenureYears} Tahun  |  Email: ${employee.email || `${employee.nip.toLowerCase()}@alkara.co.id`}`, 18, 58);

  // Key Talent Badge
  if (employee.isKeyTalent) {
    doc.setFillColor(254, 243, 199); // amber-100
    doc.roundedRect(148, 36, 42, 7, 1, 1, 'F');
    doc.setTextColor(180, 83, 9);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text('⭐ KEY CRITICAL TALENT', 151, 41);
  }

  // 1. Visual 5-Dimension Competency Radar Progress Bars
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('1. EVALUASI 5-DIMENSI KOMPETENSI & KESIAPAN', 14, 70);

  const radar = employee.radar || { performance: 80, leadership: 75, technical: 85, adaptability: 75, cultureFit: 85 };
  const dimensions = [
    { label: 'Kinerja (Performance KPI)', score: radar.performance ?? 75, color: [37, 99, 235] as [number, number, number] },
    { label: 'Kepemimpinan (Leadership)', score: radar.leadership ?? 70, color: [139, 92, 246] as [number, number, number] },
    { label: 'Keahlian Teknis (Technical)', score: radar.technical ?? 80, color: [16, 185, 129] as [number, number, number] },
    { label: 'Adaptabilitas & Agility', score: radar.adaptability ?? 70, color: [245, 158, 11] as [number, number, number] },
    { label: 'Budaya Kerja (Culture Fit)', score: radar.cultureFit ?? 85, color: [225, 29, 72] as [number, number, number] }
  ];

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 74, 182, 38, 2, 2, 'FD');

  dimensions.forEach((dim, i) => {
    const barY = 81 + i * 6.5;
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(51, 65, 85);
    doc.text(dim.label, 18, barY);

    drawProgressBar(doc, 75, barY - 3, 85, 3.5, dim.score, dim.color);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`${dim.score}%`, 166, barY);
  });

  // 2. 9-Box Placement & TNA Qualification Status Card
  doc.setFillColor(236, 253, 245);
  doc.setDrawColor(167, 243, 208);
  doc.roundedRect(14, 118, 182, 20, 2, 2, 'FD');

  doc.setTextColor(6, 95, 70);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text(`PENEMPATAN 9-BOX GRID: KUADRAN ${employee.nineBoxGrid} — ${nineBoxInfo?.title || 'Core Performer'}`, 18, 125);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text(`Status Kualifikasi TNA: ${qual?.isQualified ? 'QUALIFIED (Memenuhi Syarat Formal)' : 'GAP KUALIFIKASI TERDETEKSI'}  |  Rating Kinerja: ${employee.performanceRating}  |  Rating Potensi: ${employee.potentialRating}`, 18, 131);

  // 3. Training Module Realization Table
  const trainingEntries = Object.entries(employee.trainings || {});
  autoTable(doc, {
    startY: 144,
    head: [['Kode', 'Nama Modul Pelatihan', 'Kategori', 'Status', 'No. Sertifikat / Skor']],
    body: trainingEntries.slice(0, 8).map(([modId, rec]) => {
      const mod = trainingModules.find(m => m.id === modId);
      return [
        mod?.code || modId,
        mod?.name || 'Pelatihan Kompetensi Mandiri',
        mod?.category || 'Technical',
        rec.status === 'done' ? 'SELESAI (Done)' : rec.status === 'progress' ? 'SEDANG BERJALAN' : 'BELUM DIAMBIL',
        rec.certificateNo ? `${rec.certificateNo} (Skor: ${rec.score || 85})` : '-'
      ];
    }),
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], textColor: 255, fontSize: 8, fontStyle: 'bold' },
    styles: { fontSize: 7.5, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 22, fontStyle: 'bold' },
      1: { cellWidth: 65 },
      2: { cellWidth: 30 },
      3: { cellWidth: 28, halign: 'center', fontStyle: 'bold' },
      4: { cellWidth: 37, halign: 'center' }
    }
  });

  const finalY = (doc as any).lastAutoTable?.finalY ?? 210;

  // Signatures
  if (finalY < 250) {
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text('Karyawan Bersangkutan,', 25, finalY + 10);
    doc.text('Atasan Langsung (Direct Manager),', 80, finalY + 10);
    doc.text('Human Capital Assessor,', 145, finalY + 10);

    doc.line(20, finalY + 26, 65, finalY + 26);
    doc.line(75, finalY + 26, 125, finalY + 26);
    doc.line(140, finalY + 26, 185, finalY + 26);

    doc.text(`(${employee.name})`, 25, finalY + 30);
    doc.text('(Manager Operasional)', 80, finalY + 30);
    doc.text('(Lead Talent Assessor)', 145, finalY + 30);
  }

  drawCorporateFooter(doc, 'Employee 360 Talent Dossier', false);
  savePdf(doc, `Employee_360_Profile_${employee.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
};

// ============================================================================
// 3. ENTERPRISE 9-BOX TALENT MAPPING PDF (WITH 3X3 MINI GRID CHART)
// ============================================================================
export const generateNineBoxPDF = (
  employees: Employee[] = [],
  filteredDept = 'All',
  boxEmployeesMap: Record<number, Employee[]> = {}
) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  drawCorporateHeader(doc, 'Enterprise 9-Box Talent & Succession Calibration', 'Strategic Potential vs Performance Distribution & Human Capital Playbook', '9BOX-TAL', false, [79, 70, 229]);

  const totalEmps = employees.length;
  const filterLabel = filteredDept === 'All' ? 'Seluruh Departemen (Corporate-wide)' : `Departemen: ${filteredDept}`;

  // Executive Metadata Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 32, 182, 18, 2, 2, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Lingkup Filter: ${filterLabel}`, 18, 39);
  doc.text(`Total Headcount Dianalisis: ${totalEmps} Personil`, 18, 45);

  const starCount = (boxEmployeesMap[9]?.length || 0) + (boxEmployeesMap[8]?.length || 0);
  const coreCount = (boxEmployeesMap[5]?.length || 0) + (boxEmployeesMap[6]?.length || 0);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(79, 70, 229);
  doc.text(`High Potential Stars (Box 8-9): ${starCount} Org (${Math.round((starCount / (totalEmps || 1)) * 100)}%)`, 100, 39);
  doc.setTextColor(13, 148, 136);
  doc.text(`Core Solid Performers (Box 5-6): ${coreCount} Org (${Math.round((coreCount / (totalEmps || 1)) * 100)}%)`, 100, 45);

  // 9-Box Summary Matrix Table
  const summaryRows = [9, 8, 7, 6, 5, 4, 3, 2, 1].map((boxNum) => {
    const info = NINE_BOX_DEFINITIONS[boxNum] || { title: `Box ${boxNum}`, perf: 'Med', pot: 'Med', strategicDescription: 'Standard Talent' };
    const count = boxEmployeesMap[boxNum]?.length || 0;
    const pct = totalEmps > 0 ? ((count / totalEmps) * 100).toFixed(1) : '0.0';
    return [
      `Box ${boxNum}`,
      info.title,
      info.perf,
      info.pot,
      `${count} org`,
      `${pct}%`,
      info.strategicDescription
    ];
  });

  autoTable(doc, {
    startY: 55,
    head: [['Box', 'Kategori Talenta', 'Kinerja', 'Potensi', 'Jumlah', '% Share', 'Strategi Pembinaan HR']],
    body: summaryRows,
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontSize: 8, fontStyle: 'bold' },
    bodyStyles: { fontSize: 7.5, textColor: [51, 65, 85] },
    columnStyles: {
      0: { cellWidth: 16, fontStyle: 'bold', halign: 'center' },
      1: { cellWidth: 32, fontStyle: 'bold' },
      2: { cellWidth: 20 },
      3: { cellWidth: 20 },
      4: { cellWidth: 16, halign: 'center', fontStyle: 'bold' },
      5: { cellWidth: 16, halign: 'center' },
      6: { cellWidth: 'auto' }
    }
  });

  let currentY = ((doc as any).lastAutoTable?.finalY ?? 150) + 8;
  if (currentY > 220) {
    doc.addPage();
    currentY = 30;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text('NOMINAL ROLL KARYAWAN PER KUADRAN 9-BOX', 14, currentY);

  const empDetailRows: string[][] = [];
  [9, 8, 7, 6, 5, 4, 3, 2, 1].forEach((boxNum) => {
    const emps = boxEmployeesMap[boxNum] || [];
    const info = NINE_BOX_DEFINITIONS[boxNum] || { title: `Box ${boxNum}` };
    emps.forEach((emp) => {
      empDetailRows.push([
        `Box ${boxNum} (${info.title})`,
        emp.nip,
        emp.name,
        emp.department,
        emp.jobTitle,
        emp.level,
        emp.isKeyTalent ? '⭐ KEY TALENT' : 'Standard'
      ]);
    });
  });

  autoTable(doc, {
    startY: currentY + 4,
    head: [['Klasifikasi Box', 'NIP', 'Nama Karyawan', 'Departemen', 'Jabatan', 'Level', 'Status Talenta']],
    body: empDetailRows,
    theme: 'striped',
    headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontSize: 7.5, fontStyle: 'bold' },
    bodyStyles: { fontSize: 7, textColor: [51, 65, 85] },
    columnStyles: {
      0: { cellWidth: 34, fontStyle: 'bold' },
      1: { cellWidth: 20, fontStyle: 'bold' },
      2: { cellWidth: 38 },
      3: { cellWidth: 26 },
      4: { cellWidth: 34 },
      5: { cellWidth: 16 },
      6: { cellWidth: 14, halign: 'center' }
    }
  });

  drawCorporateFooter(doc, '9-Box Talent Calibration & Succession Record', false);
  savePdf(doc, `9Box_Talent_Report_${filteredDept.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
};

// ============================================================================
// 4. MASTER COMPETENCY DICTIONARY BOOKLET PDF
// ============================================================================
export const generateCompetencyDictionaryPDF = (
  competencies: CompetencyItem[] = [],
  categoryFilter = 'All'
) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  drawCorporateHeader(doc, 'Master Competency Dictionary & 5-Level Indicators', 'Corporate Behavioral Standard, Technical Specifications & Proficiency Rubrics', 'CMP-DICT', false, [5, 150, 105]);

  const filtered = categoryFilter === 'All' ? competencies : competencies.filter(c => c.category === categoryFilter);

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 32, 182, 14, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`Total Kamus Terdaftar: ${filtered.length} Kompetensi  |  Kategori: ${categoryFilter}  |  Rubrik: Level 1 (Awareness) s/d Level 5 (Expert)`, 18, 40.5);

  let currentY = 52;

  filtered.forEach((comp, idx) => {
    if (currentY > 230) {
      doc.addPage();
      currentY = 24;
    }

    doc.setFillColor(241, 245, 249);
    doc.rect(14, currentY, 182, 8, 'F');

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`${idx + 1}. [${comp.code}] ${comp.name.toUpperCase()} — (${comp.category})`, 18, currentY + 5.5);
    currentY += 10;

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(71, 85, 105);
    const splitDesc = doc.splitTextToSize(`Deskripsi: ${comp.description}`, 178);
    doc.text(splitDesc, 18, currentY);
    currentY += splitDesc.length * 4 + 2;

    const levelRows = ([1, 2, 3, 4, 5] as const).map(lvl => {
      const lData = comp.levels?.[lvl];
      const lvlNames: Record<number, string> = { 1: 'Awareness', 2: 'Basic', 3: 'Competent', 4: 'Advanced', 5: 'Expert' };
      return [
        `L${lvl} (${lvlNames[lvl]})`,
        lData?.behaviorIndicators?.join('; ') || 'Menerapkan perilaku standar pada level ini.'
      ];
    });

    autoTable(doc, {
      startY: currentY,
      head: [['Tingkat Kemahiran', 'Indikator Perilaku Terukur (Behavioral Rubrics)']],
      body: levelRows,
      theme: 'grid',
      headStyles: { fillColor: [5, 150, 105], textColor: 255, fontSize: 7, fontStyle: 'bold' },
      bodyStyles: { fontSize: 6.5, textColor: [51, 65, 85] },
      columnStyles: {
        0: { cellWidth: 32, fontStyle: 'bold' },
        1: { cellWidth: 150 }
      },
      styles: { cellPadding: 1.5 }
    });

    currentY = ((doc as any).lastAutoTable?.finalY ?? currentY + 30) + 6;
  });

  drawCorporateFooter(doc, 'Buku Standar Kamus Kompetensi Korporat', false);
  savePdf(doc, `Kamus_Kompetensi_5Level_${new Date().toISOString().split('T')[0]}.pdf`);
};

// ============================================================================
// 5. EMPLOYEE DIRECTORY MASTER NOMINAL ROLL PDF
// ============================================================================
export const generateEmployeeDirectoryPDF = (
  employees: Employee[] = [],
  filterDept = 'All',
  filterLevel = 'All'
) => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  drawCorporateHeader(doc, 'Employee Master Directory & Headcount Census', 'Official Nominal Roll, Job Positions, Education, Tenure & 9-Box Placement', 'EMP-DIR', true, [37, 99, 235]);

  const filtered = employees.filter(e => {
    const matchDept = filterDept === 'All' || e.department === filterDept;
    const matchLevel = filterLevel === 'All' || e.level === filterLevel;
    return matchDept && matchLevel;
  });

  autoTable(doc, {
    startY: 32,
    head: [['No', 'NIP', 'Nama Karyawan', 'Departemen', 'Jabatan', 'Level', 'Grade', 'Pendidikan', 'Masa Kerja', 'Status', '9-Box', 'Key Talent']],
    body: filtered.map((e, i) => [
      (i + 1).toString(),
      e.nip,
      e.name,
      e.department,
      e.jobTitle,
      e.level,
      e.grade,
      e.education,
      `${e.tenureYears} Thn`,
      e.employmentType?.split(' ')[0] || 'PKWT',
      `Box ${e.nineBoxGrid}`,
      e.isKeyTalent ? 'YES' : '-'
    ]),
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], textColor: 255, fontSize: 7.5, fontStyle: 'bold' },
    bodyStyles: { fontSize: 7, textColor: [51, 65, 85] },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 22, fontStyle: 'bold' },
      2: { cellWidth: 42, fontStyle: 'bold' },
      3: { cellWidth: 28 },
      4: { cellWidth: 42 },
      5: { cellWidth: 22 },
      6: { cellWidth: 14, halign: 'center' },
      7: { cellWidth: 18, halign: 'center' },
      8: { cellWidth: 18, halign: 'center' },
      9: { cellWidth: 18, halign: 'center' },
      10: { cellWidth: 18, halign: 'center', fontStyle: 'bold' },
      11: { cellWidth: 18, halign: 'center' }
    }
  });

  drawCorporateFooter(doc, 'Direktori Karyawan & Sensus Tenaga Kerja', true);
  savePdf(doc, `Direktori_Karyawan_${new Date().toISOString().split('T')[0]}.pdf`);
};

// ============================================================================
// 6. SUCCESSION PIPELINE & BENCH STRENGTH PDF
// ============================================================================
export const generateSuccessionPipelinePDF = (
  criticalPositions: CriticalPosition[] = [],
  employees: Employee[] = []
) => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  drawCorporateHeader(doc, 'Critical Position Succession Pipeline & Bench Strength', 'Succession Readiness Mapping, Vulnerability Indexes & Emergency Backups', 'SUCC-PIPE', true, [217, 119, 6]);

  autoTable(doc, {
    startY: 32,
    head: [['Posisi Kritis', 'Departemen', 'Pejabat Saat Ini', 'Risk Level', 'Suksesor Siap (Ready Now)', 'Suksesor Menengah (1-3 Thn)', 'Status Pipeline']],
    body: criticalPositions.map(pos => {
      const readyNow = pos.successors?.filter(s => s.readiness === 'Ready Now').map(s => s.name).join(', ') || 'TIDAK ADA';
      const readyLater = pos.successors?.filter(s => s.readiness === 'Ready in 1 Year' || s.readiness === 'Ready in 2-3 Years').map(s => s.name).join(', ') || '-';
      const status = pos.successors && pos.successors.length >= 2 ? 'HEALTHY (2+ Suksesor)' : pos.successors && pos.successors.length === 1 ? 'VULNERABLE (1 Suksesor)' : 'HIGH RISK (VACANT)';

      return [
        pos.title,
        pos.department,
        pos.currentHolder,
        pos.riskLevel,
        readyNow,
        readyLater,
        status
      ];
    }),
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], textColor: 255, fontSize: 8, fontStyle: 'bold' },
    bodyStyles: { fontSize: 7.5, textColor: [51, 65, 85] },
    columnStyles: {
      0: { cellWidth: 48, fontStyle: 'bold' },
      1: { cellWidth: 32 },
      2: { cellWidth: 36 },
      3: { cellWidth: 20, halign: 'center', fontStyle: 'bold', textColor: [225, 29, 72] },
      4: { cellWidth: 50 },
      5: { cellWidth: 45 },
      6: { cellWidth: 38, halign: 'center', fontStyle: 'bold' }
    }
  });

  drawCorporateFooter(doc, 'Peta Suksesi Posisi Kritis Korporat', true);
  savePdf(doc, `Peta_Suksesi_Korporat_${new Date().toISOString().split('T')[0]}.pdf`);
};

// ============================================================================
// 7. TRAINING MATRIX & TNA AUDIT PDF
// ============================================================================
export const generateTrainingMatrixPDF = (
  employees: Employee[] = [],
  trainingModules: TrainingModule[] = [],
  getRuleFor: (dept: Department, level: JobLevel) => TNARule | undefined,
  checkQualification: (emp: Employee) => {
    isQualified: boolean;
    statusText?: string;
    badgeClass?: string;
    issues?: string[];
  },
  filterParams: {
    dept: string;
    level: string;
    qualification: string;
    search: string;
  }
) => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  drawCorporateHeader(doc, 'Training Needs Analysis (TNA) & Qualification Matrix', 'Curriculum Compliance, Mandatory Licenses, Minimum Education & Tenure Verification', 'TNA-MAT', true, [79, 70, 229]);

  let qualifiedCount = 0;
  employees.forEach((emp) => {
    if (checkQualification(emp)?.isQualified) qualifiedCount++;
  });
  const complianceRate = employees.length > 0 ? Math.round((qualifiedCount / employees.length) * 100) : 0;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 30, 269, 14, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text(`Scope: Dept [${filterParams.dept}] • Level [${filterParams.level}] | Populasi: ${employees.length} Karyawan | Lolos Standar: ${qualifiedCount} (${complianceRate}%)`, 18, 38.5);

  const tableRows = employees.map((emp) => {
    const q = checkQualification(emp) || { isQualified: false };
    const completedCount = Object.values(emp.trainings || {}).filter((t) => t.status === 'done').length;
    const progressCount = Object.values(emp.trainings || {}).filter((t) => t.status === 'progress').length;

    const issuesText = (q.issues && q.issues.length > 0)
      ? q.issues.join('; ')
      : (q.statusText || (q.isQualified ? 'Semua kriteria terpenuhi.' : 'Kualifikasi belum terpenuhi.'));

    return [
      emp.nip,
      emp.name,
      emp.department,
      emp.jobTitle,
      emp.level,
      emp.education,
      `${emp.tenureYears} Thn`,
      q.isQualified ? 'QUALIFIED (Lolos)' : 'GAP DETECTED',
      `${completedCount}/${trainingModules.length} Selesai (${progressCount} Wip)`,
      issuesText
    ];
  });

  autoTable(doc, {
    startY: 48,
    head: [['NIP', 'Nama Karyawan', 'Departemen', 'Jabatan', 'Level', 'Pendidikan', 'Masa Kerja', 'Status TNA', 'Realisasi Modul', 'Temuan Audit / Kesenjangan']],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontSize: 7.5, fontStyle: 'bold' },
    bodyStyles: { fontSize: 7, textColor: [51, 65, 85] },
    columnStyles: {
      0: { cellWidth: 20, fontStyle: 'bold' },
      1: { cellWidth: 35, fontStyle: 'bold' },
      2: { cellWidth: 25 },
      3: { cellWidth: 32 },
      4: { cellWidth: 18 },
      5: { cellWidth: 16, halign: 'center' },
      6: { cellWidth: 16, halign: 'center' },
      7: { cellWidth: 26, fontStyle: 'bold' },
      8: { cellWidth: 25, halign: 'center' },
      9: { cellWidth: 'auto' }
    }
  });

  drawCorporateFooter(doc, 'TNA Training Matrix & Audit Record', true);
  savePdf(doc, `TNA_Matrix_Audit_Report_${new Date().toISOString().split('T')[0]}.pdf`);
};

// ============================================================================
// 8. STRATEGIC MANPOWER PLANNING (MPP) REPORT PDF (WITH 4-PILLAR BARS)
// ============================================================================
export const generateMppPDF = (
  mppData: ManpowerDeptPlan[] = [],
  selectedDept?: Department
) => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  drawCorporateHeader(doc, 'Strategic Manpower Planning (MPP) & 4-Pillar Roadmap', 'Demand vs Supply Forecasting, Attrition Projections & Action Formulations', 'MPP-STRAT', true, [14, 59, 46]);

  const totalDemand = mppData.reduce((acc, curr) => acc + (curr.requiredDemand || 0), 0);
  const totalSupply = mppData.reduce((acc, curr) => acc + (curr.projectedSupply || 0), 0);
  const totalGap = mppData.reduce((acc, curr) => acc + (curr.gap || 0), 0);
  const totalBudget = mppData.reduce((acc, curr) => acc + (curr.estimatedBudgetMillionIDR || 0), 0);

  const totalRecruit = mppData.reduce((acc, c) => acc + (c.interventions?.recruitmentCount || 0), 0);
  const totalMobility = mppData.reduce((acc, c) => acc + (c.interventions?.internalMobilityCount || 0), 0);
  const totalUpskill = mppData.reduce((acc, c) => acc + (c.interventions?.upskillingCount || 0), 0);
  const totalAuto = mppData.reduce((acc, c) => acc + (c.interventions?.automationEfficiencyCount || 0), 0);

  // Summary Card
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 30, 269, 16, 2, 2, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Proyeksi Supply: ${totalSupply} HC  |  Target Demand: ${totalDemand} HC  |  Total Gap: ${totalGap} HC  |  Estimasi Anggaran: Rp ${totalBudget} Juta`, 18, 37);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(14, 59, 46);
  doc.text(`Alokasi 4-Pilar Korporat: Rekrutmen (${totalRecruit}) • Mobilitas (${totalMobility}) • Upskilling (${totalUpskill}) • Otomasi (${totalAuto})`, 18, 43);

  const tableRows = mppData.map((plan) => {
    const totalInt = (plan.interventions?.recruitmentCount || 0) + (plan.interventions?.internalMobilityCount || 0) + (plan.interventions?.upskillingCount || 0) + (plan.interventions?.automationEfficiencyCount || 0);
    return [
      plan.department + (plan.department === selectedDept ? ' *' : ''),
      plan.currentHeadcount.toString(),
      `-${plan.projectedTurnover + plan.projectedRetirements}`,
      plan.projectedSupply.toString(),
      plan.requiredDemand.toString(),
      plan.gap.toString(),
      (plan.interventions?.recruitmentCount || 0).toString(),
      (plan.interventions?.internalMobilityCount || 0).toString(),
      (plan.interventions?.upskillingCount || 0).toString(),
      (plan.interventions?.automationEfficiencyCount || 0).toString(),
      totalInt === plan.gap ? '100% Balanced' : 'Under Review',
      `Rp ${plan.estimatedBudgetMillionIDR} Jt`
    ];
  });

  tableRows.push([
    'TOTAL KORPORAT',
    mppData.reduce((a, b) => a + b.currentHeadcount, 0).toString(),
    `-${mppData.reduce((a, b) => a + b.projectedTurnover + b.projectedRetirements, 0)}`,
    totalSupply.toString(),
    totalDemand.toString(),
    totalGap.toString(),
    totalRecruit.toString(),
    totalMobility.toString(),
    totalUpskill.toString(),
    totalAuto.toString(),
    '100% Balanced',
    `Rp ${totalBudget} Jt`
  ]);

  autoTable(doc, {
    startY: 50,
    head: [['Departemen', 'Eksisting', 'Turnover/Pensiun', 'Supply', 'Demand', 'Gap', 'P1: Rekrutmen', 'P2: Mobilitas', 'P3: Upskill', 'P4: Otomasi', 'Status', 'Budget']],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: [14, 59, 46], textColor: [255, 255, 255], fontSize: 8, fontStyle: 'bold', halign: 'center' },
    bodyStyles: { fontSize: 7.5, textColor: [51, 65, 85], halign: 'center' },
    columnStyles: {
      0: { cellWidth: 38, fontStyle: 'bold', halign: 'left' },
      5: { cellWidth: 16, fontStyle: 'bold', textColor: [216, 67, 60] },
      10: { cellWidth: 24, fontStyle: 'bold' },
      11: { cellWidth: 24, fontStyle: 'bold', textColor: [23, 138, 85] }
    }
  });

  drawCorporateFooter(doc, 'Strategic Manpower Planning (MPP) Record', true);
  savePdf(doc, `MPP_Strategic_Intervention_Report_${new Date().toISOString().split('T')[0]}.pdf`);
};

// ============================================================================
// 9. INDIVIDUAL DEVELOPMENT PLAN (IDP 70:20:10) PDF
// ============================================================================
export const generateEmployeeIDPPDF = (
  employee: Employee,
  idp: DetailedIDP
) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  drawCorporateHeader(doc, 'Individual Development Plan (IDP)', '70:20:10 Development Framework & Leadership Succession Acceleration', 'IDP-PLAN', false, [225, 29, 72]);

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 32, 182, 26, 2, 2, 'FD');

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`Nama Karyawan : ${employee.name} (${employee.id})`, 18, 39);
  doc.setFont('helvetica', 'normal');
  doc.text(`Departemen    : ${employee.department}  |  Level: ${employee.level} (${employee.grade})`, 18, 45);
  doc.text(`Target Promosi : ${idp.targetPosition}  |  Target Kesiapan: ${idp.targetReadiness}%  |  Pencapaian: ${idp.completionPercentage}%`, 18, 51);

  // Goal
  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(254, 205, 211);
  doc.roundedRect(14, 62, 182, 12, 1.5, 1.5, 'FD');
  doc.setTextColor(159, 18, 57);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text(`Development Goal: ${idp.developmentGoal}`, 18, 69.5);

  let startY = 78;

  autoTable(doc, {
    startY,
    head: [['70% EXPERIENCE (On-the-Job & Special Projects)', 'Target Due Date', 'Status']],
    body: (idp.experience70 || []).map(t => [t.title, t.dueDate, t.status]),
    theme: 'grid',
    headStyles: { fillColor: [225, 29, 72], textColor: 255, fontSize: 8, fontStyle: 'bold' },
    styles: { fontSize: 7.5, cellPadding: 2 }
  });

  startY = ((doc as any).lastAutoTable?.finalY ?? startY + 30) + 5;

  autoTable(doc, {
    startY,
    head: [['20% EXPOSURE (Coaching, Mentoring & Executive Shadowing)', 'Mentor / Lead', 'Status']],
    body: (idp.exposure20 || []).map(t => [t.title, t.mentorOrLead || t.dueDate, t.status]),
    theme: 'grid',
    headStyles: { fillColor: [79, 70, 229], textColor: 255, fontSize: 8, fontStyle: 'bold' },
    styles: { fontSize: 7.5, cellPadding: 2 }
  });

  startY = ((doc as any).lastAutoTable?.finalY ?? startY + 30) + 5;

  autoTable(doc, {
    startY,
    head: [['10% EDUCATION (Structured Training & Certifications)', 'Target Due Date', 'Status']],
    body: (idp.education10 || []).map(t => [t.title, t.dueDate, t.status]),
    theme: 'grid',
    headStyles: { fillColor: [5, 150, 105], textColor: 255, fontSize: 8, fontStyle: 'bold' },
    styles: { fontSize: 7.5, cellPadding: 2 }
  });

  const finalY = ((doc as any).lastAutoTable?.finalY ?? 210) + 8;

  if (finalY < 250) {
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text('Karyawan Ybs,', 25, finalY + 10);
    doc.text('Mentor / Direct Manager,', 85, finalY + 10);
    doc.text('Head of People & Talent,', 145, finalY + 10);

    doc.line(20, finalY + 26, 65, finalY + 26);
    doc.line(80, finalY + 26, 130, finalY + 26);
    doc.line(140, finalY + 26, 190, finalY + 26);

    doc.text(`(${employee.name})`, 25, finalY + 30);
    doc.text('(Manager Operasional)', 85, finalY + 30);
    doc.text('(VP Human Capital)', 145, finalY + 30);
  }

  drawCorporateFooter(doc, 'Individual Development Plan (IDP)', false);
  savePdf(doc, `IDP_${employee.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
};

// ============================================================================
// 10. EXECUTIVE BOARD BRIEFING MEMO PDF
// ============================================================================
export const generateExecutiveBriefingPDF = (
  briefingText: string,
  executiveHealth: ExecutiveHealthSummary
) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  drawCorporateHeader(doc, 'Executive Board Briefing Memo', 'Human Capital Health & Strategic Capability Intelligence Report', 'BOD-MEMO', false, [147, 51, 234]);

  const wh = executiveHealth?.workforceHealth || { totalHeadcount: 0, budgetHeadcount: 0, turnoverRate: 0, status: 'Optimal' };
  const lh = executiveHealth?.learningHealth || { trainingComplianceRate: 0, totalTrainingHours: 0, status: 'Optimal' };
  const ch = executiveHealth?.competencyHealth || { qualificationRate: 0, criticalCompetencyGapCount: 0, status: 'Optimal' };
  const th = executiveHealth?.talentHealth || { highPotentialCount: 0, keyTalentCount: 0, status: 'Optimal' };
  const sh = executiveHealth?.successionHealth || { successionCoverageRate: 0, positionsWithoutSuccessorCount: 0, status: 'Optimal' };

  autoTable(doc, {
    startY: 32,
    head: [['Pilar Kesehatan (Health Cluster)', 'Metrik Utama', 'Status Indikator']],
    body: [
      ['01. Workforce Health', `Total ${wh.totalHeadcount} HC (Budget: ${wh.budgetHeadcount}), Turnover: ${wh.turnoverRate}%`, wh.status],
      ['02. Learning Health', `Kepatuhan: ${lh.trainingComplianceRate}%, Jam Pelatihan: ${lh.totalTrainingHours} Jam`, lh.status],
      ['03. Competency Health', `Kesesuaian: ${ch.qualificationRate}%, Gap Kritis: ${ch.criticalCompetencyGapCount} Item`, ch.status],
      ['04. Talent Health', `High Potential: ${th.highPotentialCount} Orang, Key Talent: ${th.keyTalentCount} Orang`, th.status],
      ['05. Succession Health', `Coverage: ${sh.successionCoverageRate}%, Tanpa Suksesor: ${sh.positionsWithoutSuccessorCount} Posisi`, sh.status]
    ],
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], textColor: 255, fontSize: 8, fontStyle: 'bold' },
    styles: { fontSize: 7.5, cellPadding: 2 }
  });

  const finalY = ((doc as any).lastAutoTable?.finalY ?? 120) + 8;
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.text('CATATAN STRATEGIS & REKOMENDASI DEWAN DIREKSI:', 14, finalY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  const splitBriefing = doc.splitTextToSize(briefingText || 'Laporan ringkas kesehatan tenaga kerja dan inisiatif strategis korporat.', 182);
  doc.text(splitBriefing, 14, finalY + 6);

  drawCorporateFooter(doc, 'Board of Directors Intelligence Briefing', false);
  savePdf(doc, `Executive_Briefing_${new Date().toISOString().split('T')[0]}.pdf`);
};

// ============================================================================
// 11. ANNUAL TRAINING PLAN (ATP) BUDGET & SCHEDULE PDF
// ============================================================================
export const generateAnnualTrainingPlanPDF = (
  plans: AnnualTrainingPlanItem[] = []
) => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  drawCorporateHeader(doc, 'Annual Training Plan (ATP) Budget & Master Schedule', 'Curriculum Programs, Target Trainees, Execution Timeline & Financial Allocations', 'ATP-PROG', true, [37, 99, 235]);

  const totalBudget = plans.reduce((acc, p) => acc + (p.estimatedBudgetMillionIDR || 0), 0);
  const totalTargetParticipants = plans.reduce((acc, p) => acc + (p.targetParticipantsCount || 0), 0);

  autoTable(doc, {
    startY: 32,
    head: [['ID Modul', 'Nama Program Pelatihan', 'Kategori', 'Departemen', 'Bulan', 'Target Peserta', 'Budget (Jt IDR)', 'Instruktur / Vendor', 'Status']],
    body: plans.map(p => [
      p.moduleId,
      p.moduleName,
      p.category,
      p.department,
      p.plannedMonth,
      `${p.targetParticipantsCount} Orang`,
      `Rp ${p.estimatedBudgetMillionIDR} Jt`,
      p.trainerName || 'Internal Faculty',
      p.status
    ]),
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], textColor: 255, fontSize: 8, fontStyle: 'bold' },
    styles: { fontSize: 7.5, cellPadding: 2 }
  });

  const finalY = ((doc as any).lastAutoTable?.finalY ?? 150) + 6;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, finalY, 269, 12, 1.5, 1.5, 'FD');
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text(`TOTAL PROGRAM: ${plans.length} Modul | TOTAL TARGET PESERTA: ${totalTargetParticipants} Orang | TOTAL ANGGARAN: Rp ${totalBudget} JUTA IDR`, 18, finalY + 7.5);

  drawCorporateFooter(doc, 'Annual Training Plan (ATP) Master Record', true);
  savePdf(doc, `Annual_Training_Plan_ATP_${new Date().toISOString().split('T')[0]}.pdf`);
};

// ============================================================================
// 12. EMERGENCY SUCCESSION SIMULATION & STRESS-TEST PDF
// ============================================================================
export const generateEmergencySuccessionPDF = (
  sim: EmergencySuccessionSimulation
) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  drawCorporateHeader(doc, 'Emergency Succession & Operational Vulnerability Audit', 'Operational Stress-Test, Critical Acting Appointment & 30-Day Contingency Plan', 'EMERG-SUCC', false, [217, 119, 6]);

  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(254, 205, 211);
  doc.roundedRect(14, 32, 182, 34, 2, 2, 'FD');

  doc.setTextColor(159, 18, 57);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`SKENARIO KRISIS: ${(sim.crisisReason || 'DARURAT').toUpperCase()}`, 18, 39);

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Posisi Kritis Terkena Dampak : ${sim.positionTitle} (${sim.department})`, 18, 46);
  doc.text(`Pejabat / Incumbent Asal    : ${sim.currentHolder}`, 18, 52);
  doc.text(`Indeks Kerentanan (OVI)     : ${sim.operationalVulnerabilityScore}% (HIGH RISK)  |  Estimasi Risiko Finansial: Rp ${sim.dailyRevenueRiskMillionIDR} Jt/Hari`, 18, 58);

  let startY = 72;

  if (sim.bestSuccessor) {
    autoTable(doc, {
      startY,
      head: [['Kandidat Suksesor Darurat Terpilih', 'Kesiapan', 'Overall Fit', 'Leadership', 'Technical', 'Velocity']],
      body: [[
        sim.bestSuccessor.name,
        sim.bestSuccessor.readiness,
        `${sim.bestSuccessor.fitScore}%`,
        `${sim.bestSuccessor.leadershipScore}%`,
        `${sim.bestSuccessor.technicalScore}%`,
        `${sim.bestSuccessor.onboardingVelocityDays} Hari`
      ]],
      theme: 'grid',
      headStyles: { fillColor: [217, 119, 6], textColor: 255, fontSize: 8, fontStyle: 'bold' }
    });
    startY = ((doc as any).lastAutoTable?.finalY ?? startY + 30) + 6;
  }

  if (sim.aiContingencyGuidance) {
    doc.setFillColor(250, 245, 255);
    doc.setDrawColor(233, 213, 255);
    doc.roundedRect(14, startY, 182, 26, 1.5, 1.5, 'FD');
    doc.setTextColor(107, 33, 168);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.text('Rekomendasi Rencana Kontinjensi AI 30 Hari:', 18, startY + 6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    const splitGuidance = doc.splitTextToSize(sim.aiContingencyGuidance, 174);
    doc.text(splitGuidance, 18, startY + 12);
  }

  drawCorporateFooter(doc, 'Emergency Succession & Vulnerability Audit', false);
  savePdf(doc, `Emergency_Succession_Audit_${sim.positionTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
};

// ============================================================================
// 13. ORGANIZATIONAL RESTRUCTURING PROPOSAL PDF
// ============================================================================
export const generateOrgRestructuringPDF = (
  scenarioTitle: string,
  summary: {
    totalHeadcount: number;
    headcountDelta: number;
    payrollMonthlyBillionIDR: number;
    payrollDeltaBillionIDR: number;
    avgSpanOfControl: string;
    frictionRisk: string;
    impactedDeptsCount: number;
  },
  units: {
    deptName: string;
    headcount: number;
    head: string;
    monthlyBudgetMillionIDR: number;
    spanRatio: string;
    status: string;
  }[] = []
) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  drawCorporateHeader(doc, 'Organizational Restructuring Proposal', 'Strategic Realignment, Span of Control Optimization & Payroll Impact Analysis', 'ORG-PROP', false, [37, 99, 235]);

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 32, 182, 30, 2, 2, 'FD');

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`PROPOSAL RESTRUKTURISASI: ${scenarioTitle.toUpperCase()}`, 18, 39);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total Headcount Simulasi : ${summary.totalHeadcount} HC (${summary.headcountDelta >= 0 ? `+${summary.headcountDelta}` : summary.headcountDelta})`, 18, 46);
  doc.text(`Beban Payroll Bulanan    : Rp ${summary.payrollMonthlyBillionIDR} Miliar / Bulan (${summary.payrollDeltaBillionIDR >= 0 ? `+Rp ${summary.payrollDeltaBillionIDR}` : `-Rp ${Math.abs(summary.payrollDeltaBillionIDR)}`} M)`, 18, 52);
  doc.text(`Rata-rata Span Ratio    : ${summary.avgSpanOfControl}  |  Indeks Efisiensi & Risiko: ${summary.frictionRisk}`, 18, 58);

  autoTable(doc, {
    startY: 68,
    head: [['Struktur Departemen / Divisi', 'Pimpinan Unit', 'Headcount', 'Anggaran (Jt/Bln)', 'Span Ratio', 'Status']],
    body: units.map(u => [
      u.deptName,
      u.head,
      `${u.headcount} HC`,
      `Rp ${u.monthlyBudgetMillionIDR} Jt`,
      u.spanRatio,
      u.status
    ]),
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], textColor: 255, fontSize: 8, fontStyle: 'bold' }
  });

  drawCorporateFooter(doc, 'Organizational Restructuring Proposal', false);
  savePdf(doc, `Org_Restructuring_Proposal_${new Date().toISOString().split('T')[0]}.pdf`);
};

// ============================================================================
// 14. UNIFIED JOB QUALIFICATION & COMPETENCY SPECIFICATION PDF
// ============================================================================
export const generateUnifiedJobProfilePDF = (
  jobTitle: string,
  department: string,
  level: string,
  grade: string,
  tnaRequirements: {
    minEducation: string;
    minTenureYears: number;
    mandatoryCertifications: string[];
    mandatoryTrainingModules: string[];
  },
  competencies: {
    name: string;
    category: string;
    requiredLevel: number;
    levelName: string;
    behaviorIndicatorSample: string;
  }[] = []
) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  drawCorporateHeader(doc, 'Unified Job Qualification & Competency Specification', 'Harmonization of TNA Administrative Requirements & 5-Level Competency Standards', 'JOB-SPEC', false, [5, 150, 105]);

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 32, 182, 24, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(jobTitle.toUpperCase(), 18, 40);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Departemen: ${department}  |  Level: ${level}  |  Grade: ${grade}`, 18, 46);
  doc.text(`Status Standar: Terverifikasi & Disahkan oleh Human Capital Directorate`, 18, 52);

  // Section 1: TNA Hard Criteria
  doc.setFillColor(236, 253, 245);
  doc.setDrawColor(167, 243, 208);
  doc.roundedRect(14, 60, 182, 34, 2, 2, 'FD');

  doc.setTextColor(6, 95, 70);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('BAGIAN 1: SYARAT KUALIFIKASI ADMINISTRATIF & WAJIB PELATIHAN (TNA)', 18, 67);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  doc.text(`• Pendidikan Formal Minimum : ${tnaRequirements.minEducation}`, 18, 74);
  doc.text(`• Masa Kerja Minimum        : ${tnaRequirements.minTenureYears} Tahun`, 18, 80);
  doc.text(`• Sertifikasi Wajib         : ${tnaRequirements.mandatoryCertifications?.join(', ') || 'POP K3 Pratama'}`, 18, 86);

  // Section 2: Competencies Table
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('BAGIAN 2: STANDAR KEMAHIRAN 5-LEVEL KOMPETENSI PERILAKU', 14, 101);

  autoTable(doc, {
    startY: 105,
    head: [['Kompetensi', 'Kategori', 'Target Level', 'Nama Level', 'Sampel Indikator Perilaku']],
    body: competencies.map(c => [
      c.name,
      c.category,
      `Level ${c.requiredLevel}`,
      c.levelName,
      c.behaviorIndicatorSample
    ]),
    theme: 'grid',
    headStyles: { fillColor: [5, 150, 105], textColor: 255, fontSize: 8, fontStyle: 'bold' }
  });

  drawCorporateFooter(doc, 'Standar Spesifikasi Jabatan Harmonisasi', false);
  savePdf(doc, `Job_Specification_Unified_${jobTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
};
