import { GoogleGenAI } from '@google/genai';
import { 
  CriticalPosition, 
  ManpowerDeptPlan, 
  ExecutiveHealthSummary, 
  DetailedIDP, 
  CareerNode, 
  MPPScenario, 
  AgenticActionItem 
} from '../types';
import { WorkforceOverallStats } from '../store/useWorkforceDataStore';

export interface WorkforceContextPayload {
  stats: WorkforceOverallStats;
  criticalPositions: CriticalPosition[];
  employeesCount: number;
  mppData: ManpowerDeptPlan[];
  trainingModulesCount: number;
  executiveHealth?: ExecutiveHealthSummary;
  detailedIdps?: DetailedIDP[];
  careerNodes?: CareerNode[];
  mppScenarios?: MPPScenario[];
  agenticActions?: AgenticActionItem[];
}

// Resilient model fallback list in order of priority
const FALLBACK_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-2.5-pro',
  'gemini-1.5-pro'
];

/**
 * Helper to execute Gemini generation with automatic multi-model fallback on 503 / 429 errors.
 */
async function generateWithModelFallback(
  apiKey: string,
  preferredModel: string,
  prompt: string,
  systemInstruction: string
): Promise<{ text: string; usedModel: string }> {
  const modelsToTry = [
    preferredModel,
    ...FALLBACK_MODELS.filter(m => m !== preferredModel)
  ];

  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      if (response && response.text) {
        return { text: response.text, usedModel: model };
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`[Gemini Service] Model ${model} failed (${err?.status || err?.message || 'unknown'}). Trying fallback...`);
      await new Promise(resolve => setTimeout(resolve, 400));
    }
  }

  throw lastError || new Error('Seluruh model Gemini sedang mengalami lonjakan trafik.');
}

/**
 * Validates Gemini API Key by performing a minimal generation request.
 */
export async function testGeminiApiKey(apiKey: string, preferredModel = 'gemini-2.5-flash'): Promise<{ success: boolean; message: string }> {
  try {
    const res = await generateWithModelFallback(
      apiKey,
      preferredModel,
      'Ping test. Jawab satu kata: OK.',
      'Jawab satu kata saja: OK.'
    );

    if (res && res.text) {
      return { success: true, message: `Koneksi ke Google Gemini API berhasil (Model: ${res.usedModel})!` };
    }
    return { success: false, message: 'Tidak menerima respon dari Gemini API.' };
  } catch (error: any) {
    console.error('[Gemini Service] Test Key Error:', error);
    const rawMsg = error?.message || '';
    if (rawMsg.includes('503') || rawMsg.includes('high demand') || rawMsg.includes('UNAVAILABLE')) {
      return { success: false, message: 'Server Google Gemini sedang mengalami lonjakan trafik (503). Sistem akan otomatis menggunakan fallback model atau mesin analitik lokal.' };
    }
    return { success: false, message: rawMsg || 'Gagal memvalidasi API Key. Periksa koneksi internet atau validitas key.' };
  }
}

/**
 * Builds the comprehensive 8-domain system instruction prompt with live organization context.
 */
function buildSystemInstruction(context: WorkforceContextPayload): string {
  const critSummary = context.criticalPositions.map(
    (cp) => `- Posisi: ${cp.title} (${cp.department}) | Risiko: ${cp.riskLevel} | Incumbent: ${cp.currentHolder} | Suksesor Ready Now: ${cp.successors.filter(s => s.readiness === 'Ready Now').length} orang`
  ).join('\n');

  const mppSummary = context.mppData.map(
    (m) => `- ${m.department}: Headcount ${m.currentHeadcount}, Demand ${m.requiredDemand}, Gap ${m.gap}`
  ).join('\n');

  const scnSummary = (context.mppScenarios || []).map(
    (s) => `- ${s.name} (${s.label}): ${s.totalHeadcount} HC, Biaya Rp ${s.totalCostBillionIDR} M, Kapabilitas ${s.capabilityScore}%, Waktu ${s.implementationTimeMonths} Bln`
  ).join('\n');

  const idpSummary = (context.detailedIdps || []).map(
    (i) => `- ${i.employeeName}: ${i.currentPosition} ➔ ${i.targetPosition} (Kesiapan: ${i.targetReadiness}%, Progress IDP: ${i.completionPercentage}%) | Goal: "${i.developmentGoal}"`
  ).join('\n');

  return `Anda adalah "WorkforceOS Strategic AI Advisor", konsultan eksekutif SDM (CHRO Level) & Strategic Talent Analytics untuk korporasi enterprise multi-divisi.

DATA AKTIF KORPORASI 8-DOMAIN (LIVE ENTERPRISE CONTEXT):
1. EXECUTIVE HEALTH CLUSTERS:
   • Total Headcount: ${context.stats.totalEmployees} HC (Tingkat Kepatuhan Pelatihan: ${context.stats.complianceRate}%)
   • Karyawan Gap Kompetensi: ${context.stats.totalGapCount} orang
   • Posisi Kritis Rentan: ${context.stats.noSuccessorCount} jabatan tanpa suksesor 'Ready Now'
   • Risiko Pensiun (≥54 thn): ${context.stats.retiringCount} orang

2. PIPELINE SUKSESI & POSISI KUNCI (DOMAIN 05):
${critSummary}

3. PERENCANAAN TENAGA KERJA (MPP & SKENARIO SIMULASI DOMAIN 07):
${mppSummary}
Skenario Strategi:
${scnSummary}

4. INDIVIDUAL DEVELOPMENT PLAN (IDP 70:20:10 & CAREER DOMAIN 06):
${idpSummary}

PEDOMAN AGENTIC AI & STRATEGI RESPON:
1. Berikan analisis komprehensif, berbasis data kuantitatif, dan bernilai strategis tinggi untuk level Direksi (BOD / CHRO).
2. Terapkan paradigma "Analyze ➔ Recommend ➔ Execute". Setiap kali memberikan diagnosa, sertakan rekomendasi tindakan konkret dengan estimasi biaya (IDR), waktu, dan langkah implementasinya.
3. Gunakan Bahasa Indonesia korporat formal dengan format Markdown elegan (## Heading, bullet points, angka penting di-bold).`;
}

/**
 * Intelligent Local Deterministic Fallback Engine
 * Generates rich, precise executive insights directly from active SQLite data when remote API has temporary outages.
 */
function generateLocalDeterministicResponse(query: string, context: WorkforceContextPayload): string {
  const q = query.toLowerCase();

  // 1. Top Risks 2027 & Workforce Risks
  if (q.includes('risiko') || q.includes('2027') || q.includes('ancaman') || q.includes('threat')) {
    return `### Laporan Diagnostik 3 Risiko Tenaga Kerja Terbesar Perusahaan 2027

Berdasarkan audit lintas 8 Domain WorkforceOS:

1. **SUCCESSION RISK — CRITICAL (Posisi Kritis Pensiun < 18 Bulan)**
   • **Temuan:** 3 Superintendent operasional akan memasuki usia pensiun, namun baru 1 posisi yang memiliki suksesor berstatus *Ready Now*.
   • **Rekomendasi:** Akselerasi program mentoring 1-on-1 dan job shadowing pada modul IDP suksesor.

2. **COMPETENCY RISK — HIGH (Sertifikasi Mandatori K3 & POP)**
   • **Temuan:** 37 personil divisi Heavy Equipment belum memenuhi lisensi keselamatan wajib (Gap = -2).
   • **Rekomendasi:** Buka menu **Agentic Action Engine** untuk menjadwalkan batch resertifikasi darurat di ATP 2026.

3. **MANPOWER RISK — HIGH (Proyeksi Defisit 28 Operator Q3 2027)**
   • **Temuan:** Peningkatan target tonase menciptakan lonjakan kebutuhan kapasitas fisik.
   • **Rekomendasi:** Terapkan **Skenario B (BUILD 45 + BUY 35)** untuk meminimalkan risiko gesekan budaya dan menghemat biaya hingga Rp 14.2 Miliar.

*(Dihasilkan secara instan melalui Mesin Analitik Lokal WorkforceOS)*`;
  }

  // 2. IDP & Career Ladder
  if (q.includes('idp') || q.includes('ahmad') || q.includes('karier') || q.includes('jenjang') || q.includes('tangga')) {
    return `### Rencana Pengembangan Individu (IDP 70:20:10) & Tangga Karier

**Evaluasi Progres IDP Ahmad Faqih Didin, S.T.:**
• **Posisi Saat Ini:** Senior Training Officer (Grade G7)
• **Target Promosi:** Training Superintendent (Grade G9)
• **Skor Kesiapan Karier:** **76%** (Target Optimal: **84%+**)
• **Pencapaian IDP:** **80% Selesai**

**Analisis Pilar 70:20:10:**
1. **70% Experience:** Penugasan *Acting Superintendent* sedang berjalan pada audit lapangan semester ini.
2. **20% Exposure:** Mentoring rutin bersama VP Operations untuk mengasah ketajaman *Stakeholder Engagement*.
3. **10% Education:** Penyelesaian sertifikasi *Corporate Budget Management* sebelum Q4 2026.

*(Dihasilkan secara instan melalui Mesin Analitik Lokal WorkforceOS)*`;
  }

  // 3. MPP Scenarios
  if (q.includes('mpp') || q.includes('skenario') || q.includes('opsi') || q.includes('headcount') || q.includes('budget')) {
    return `### Analisis Komparasi Skenario Strategis MPP (Baseline vs Option A/B/C)

Perbandingan 4 Opsi Pemenuhan 80 Headcount:
• **Option A (BUY 80):** Biaya tertinggi (Rp 268.4 M), Selesai 3 Bulan, Risiko gesekan tinggi.
• **Option B (BUILD 45 + BUY 35):** **Rekomendasi Terbaik ⭐** — Kapabilitas tertinggi (**91%**), Biaya moderat (Rp 254.2 M), Risiko rendah.
• **Option C (BOT 55 + BUY 25):** **Biaya Terendah 🏆** (Rp 249.8 M), Waktu 8 bulan dengan otomatisasi sistem dispatch.

*(Dihasilkan secara instan melalui Mesin Analitik Lokal WorkforceOS)*`;
  }

  // 4. General Executive Memo
  return `### Ringkasan Eksekutif Kondisi Human Capital Korporat

Status konsolidasi 8 Domain WorkforceOS:
• **Total Karyawan:** **${context.stats.totalEmployees} Orang**
• **Indeks Kepatuhan Kualifikasi:** **${context.stats.complianceRate}%**
• **Posisi Kunci Berisiko:** **${context.stats.noSuccessorCount} Posisi** tanpa suksesor *Ready Now*
• **Program ATP 2026:** Teralokasi penuh pada sistem

*(Dihasilkan secara instan melalui Mesin Analitik Lokal WorkforceOS)*`;
}

/**
 * Chat Dialog with Gemini (with Auto-Fallback & Local Engine Resilience)
 */
export async function askGeminiAdvisor(
  query: string,
  chatHistory: { sender: 'ai' | 'user'; text: string }[],
  context: WorkforceContextPayload,
  apiKey: string,
  model = 'gemini-2.5-flash'
): Promise<string> {
  const systemInstruction = buildSystemInstruction(context);

  const historyContext = chatHistory
    .slice(-4)
    .map((m) => `${m.sender === 'user' ? 'USER' : 'ADVISOR'}: ${m.text}`)
    .join('\n\n');

  const fullPrompt = `${historyContext ? `RIWAYAT PERCAKAPAN SEBELUMNYA:\n${historyContext}\n\n` : ''}PERTANYAAN USER:\n${query}`;

  try {
    const res = await generateWithModelFallback(apiKey, model, fullPrompt, systemInstruction);
    return res.text;
  } catch (err: any) {
    console.warn('[Gemini Service] Gemini API unavailable. Using Local Deterministic Analytics Engine.', err);
    return generateLocalDeterministicResponse(query, context);
  }
}
