import React, { useState, useMemo } from 'react';
import { useWorkforce, ActiveTabType } from '../../context/WorkforceContext';
import {
  HelpCircle,
  BookOpen,
  Search,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Sparkles,
  Users,
  Target,
  GraduationCap,
  Award,
  Compass,
  TrendingUp,
  FileText,
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Building2,
  ShieldCheck,
  Briefcase,
  Layers,
  Clock,
  ArrowUpRight,
  Info,
  ExternalLink,
  ChevronRight,
  Play,
  RotateCcw,
  Check,
  MessageCircle,
  Mail,
  Globe,
  Headphones,
  Phone
} from 'lucide-react';

// Types
type HelpSubTab = 'qna' | 'usecases';

interface QnAItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  keyPoints?: string[];
  targetTab?: ActiveTabType;
  targetSubTab?: string;
  targetSubTabKey?: 'workforce' | 'competencyTna' | 'learningTraining' | 'talentSuccession' | 'performanceDev' | 'workforcePlanning' | 'peopleIntelligence';
  tags: string[];
}

interface WorkflowStep {
  stepNumber: number;
  title: string;
  pageName: string;
  pageFunction: string;
  actions: string[];
  sampleData?: string;
  targetTab: ActiveTabType;
  targetSubTabKey?: 'workforce' | 'competencyTna' | 'learningTraining' | 'talentSuccession' | 'performanceDev' | 'workforcePlanning' | 'peopleIntelligence';
  targetSubTab?: string;
  expectedOutput: string;
}

interface UseCaseSimulation {
  id: string;
  title: string;
  tag: string;
  tagTone: 'blue' | 'emerald' | 'amber' | 'purple' | 'rose';
  scenarioContext: string;
  objective: string;
  keyBenefits: string[];
  steps: WorkflowStep[];
  successCriteria: string;
}

export const HelpAndUseCasesView: React.FC = () => {
  const { setActiveTab, setDomainSubTab, addToast } = useWorkforce();

  const [activeSubTab, setActiveSubTab] = useState<HelpSubTab>('qna');
  const [qnaSearch, setQnaSearch] = useState('');
  const [selectedQnACategory, setSelectedQnACategory] = useState('Semua');
  const [expandedQnA, setExpandedQnA] = useState<Record<string, boolean>>({
    'qna-1': true,
    'qna-4': true
  });

  const [useCaseSearch, setUseCaseSearch] = useState('');
  const [selectedUseCaseId, setSelectedUseCaseId] = useState('uc-1');
  const [activeStepIndex, setActiveStepIndex] = useState<Record<string, number>>({
    'uc-1': 0,
    'uc-2': 0,
    'uc-3': 0,
    'uc-4': 0,
    'uc-5': 0,
    'uc-6': 0
  });

  // Toggle Accordion Q&A
  const toggleQnA = (id: string) => {
    setExpandedQnA((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Quick jump to module handler
  const handleNavigateToModule = (
    tab: ActiveTabType,
    subTabKey?: 'workforce' | 'competencyTna' | 'learningTraining' | 'talentSuccession' | 'performanceDev' | 'workforcePlanning' | 'peopleIntelligence',
    subTab?: string
  ) => {
    setActiveTab(tab);
    if (subTabKey && subTab) {
      setDomainSubTab(subTabKey, subTab);
    }
    addToast('Navigasi Berhasil', `Membuka halaman target modul.`, 'info');
  };

  // ============================================================================
  // DATABASE 1: COMPREHENSIVE Q&A REPOSITORY
  // ============================================================================
  const QNA_LIST: QnAItem[] = [
    {
      id: 'qna-1',
      category: '01. Arsitektur & Navigasi',
      question: 'Apa saja 8 Grand Domain yang ada di WorkforceOS dan bagaimana alur integrasinya?',
      answer: 'WorkforceOS dibangun dengan arsitektur 8 Grand Domain yang terintegrasi secara closed-loop (tertutup dan berkesinambungan). Data yang diubah pada satu modul akan langsung memperbarui kalkulasi metrik di seluruh domain lain secara live.',
      keyPoints: [
        '01. Executive Cockpit: Diagnostik ringkasan 5 pilar kesehatan tenaga kerja (Health Clusters).',
        '02. Workforce Foundation: Sensus master karyawan, bagan struktur organisasi & pencatatan mutasi.',
        '03. Competency & TNA: Standar jabatan harmonisasi, kamus 5-level & matriks audit kualifikasi.',
        '04. Learning & Training: Manajemen kurikulum, katalog silabus & jadwal anggaran tahunan (ATP).',
        '05. Talent & Succession: Kalibrasi kuadran 9-Box & flight simulator suksesi darurat.',
        '06. Performance & IDP: Formulasi rencana akselerasi individu 70:20:10 & roadmap karier.',
        '07. Workforce Planning: Analisis supply vs demand tenaga kerja & formulasi intervensi 4-Pilar.',
        '08. People Intelligence: Analisis prediktif risiko turnover & AI strategic advisor.'
      ],
      targetTab: 'executive',
      tags: ['arsitektur', 'domain', 'gambaran umum', 'navigasi']
    },
    {
      id: 'qna-2',
      category: '02. Organisasi & Karyawan',
      question: 'Bagaimana cara menambahkan karyawan baru dan menghubungkannya dengan Struktur Organisasi?',
      answer: 'Penambahan karyawan baru dapat dilakukan secara individu melalui tombol [+ Tambah Karyawan] di header, atau secara massal melalui file Excel. Setelah karyawan terdaftar, sistem akan otomatis mencocokkan jabatannya ke dalam bagan hierarki Struktur Organisasi (SO) dan peta jabatan departemen.',
      keyPoints: [
        'Klik tombol [+ Tambah Karyawan] di pojok kanan atas aplikasi.',
        'Isi NIP, Nama Lengkap, Departemen, Jabatan, Level, Grade, Pendidikan, dan Status Kontrak.',
        'Sistem akan otomatis menghitung kuadran 9-Box awal dan menampilkannya di bagan organisasi.',
        'Untuk impor massal, gunakan Pusat Export / Import di sidebar kiri.'
      ],
      targetTab: 'workforce',
      targetSubTabKey: 'workforce',
      targetSubTab: 'directory',
      tags: ['karyawan baru', 'input karyawan', 'struktur organisasi', 'so']
    },
    {
      id: 'qna-3',
      category: '02. Organisasi & Karyawan',
      question: 'Bagaimana cara mengedit profil, gelar, atau status talenta seorang karyawan?',
      answer: 'Anda dapat mengklik baris karyawan pada Direktori Karyawan untuk membuka Profil 360, lalu klik tombol [✏️ Edit Profil] di bagian header modal. Di sana Anda dapat memperbarui nama dengan gelar, jabatan, pendidikan, masa kerja, hingga rating kinerja/potensi.',
      keyPoints: [
        'Buka Domain 02 (Workforce Foundation) -> Direktori Karyawan.',
        'Klik baris karyawan untuk membuka Profil 360.',
        'Klik [✏️ Edit Profil] di header atas.',
        'Simpan perubahan; kuadran 9-box dan audit TNA akan langsung dikalkulasi ulang seketika.'
      ],
      targetTab: 'workforce',
      targetSubTabKey: 'workforce',
      targetSubTab: 'directory',
      tags: ['edit profil', 'profil 360', 'ubah data', 'gelar']
    },
    {
      id: 'qna-4',
      category: '03. Kompetensi & TNA',
      question: 'Apa perbedaan antara Standar Jabatan Harmonisasi dan Kamus Standar Kompetensi?',
      answer: 'Standar Jabatan Harmonisasi menggabungkan syarat administratif (TNA hard criteria seperti pendidikan minimum, masa kerja, lisensi wajib) dengan kebutuhan kompetensi spesifik untuk jabatan tersebut. Sedangkan Kamus Kompetensi adalah pustaka pusat (library) berisi definisi kompetensi beserta rubrik indikator perilaku terukur dari Level 1 (Awareness) sampai Level 5 (Expert).',
      keyPoints: [
        'Standar Jabatan Harmonisasi: Spesifik per jabatan/level, menentukan lolos/tidaknya kualifikasi TNA.',
        'Kamus Kompetensi 5-Level: Pustaka umum perilaku terukur yang dapat digunakan lintas posisi.',
        'Karyawan yang lolos Bagian 1 (Administratif) namun memiliki gap pada Bagian 2 (Kompetensi) wajib dimasukkan ke IDP 70:20:10.'
      ],
      targetTab: 'competency-tna',
      targetSubTabKey: 'competencyTna',
      targetSubTab: 'harmonization',
      tags: ['standar jabatan', 'kamus kompetensi', 'tna', 'rubrik 5-level']
    },
    {
      id: 'qna-5',
      category: '03. Kompetensi & TNA',
      question: 'Bagaimana sistem mendeteksi GAP Kualifikasi pada Matriks Pelatihan (TNA Matrix)?',
      answer: 'Sistem membandingkan profil karyawan dengan aturan TNA standar untuk jabatan & departemennya. Jika pendidikan karyawan di bawah standar minimum, masa kerja kurang, lisensi wajib belum dimiliki, atau modul pelatihan wajib belum berstatus "Done", sistem secara otomatis memberi label "GAP DETECTED" dan mencantumkan daftar item yang belum terpenuhi.',
      keyPoints: [
        'Kriteria Pendidikan: Misalnya S1 untuk Level Manager.',
        'Kriteria Masa Kerja: Misalnya minimal 3 tahun.',
        'Kriteria Sertifikasi: Misalnya sertifikat K3 Umum / POP.',
        'Kriteria Modul: Semua modul kurikulum bertanda wajib harus berstatus Selesai.'
      ],
      targetTab: 'competency-tna',
      targetSubTabKey: 'competencyTna',
      targetSubTab: 'matrix',
      tags: ['gap kualifikasi', 'tna matrix', 'compliance', 'audit finding']
    },
    {
      id: 'qna-6',
      category: '04. Pelatihan & ATP',
      question: 'Bagaimana alur penyusunan Rencana Pelatihan Tahunan (Annual Training Plan / ATP)?',
      answer: 'Penyusunan ATP dimulai dengan melihat sebaran kesenjangan di Skill Gap Heatmap, kemudian masuk ke Domain 04 (Learning & Training) tab "Annual Training Plan". Anda dapat menambahkan modul baru, menetapkan target bulan pelaksanaan, menentukan kuota peserta, dan mengalokasikan estimasi anggaran biaya.',
      keyPoints: [
        'Identifikasi gap prioritas di Domain 03 (Skill Gap Heatmap).',
        'Buka Domain 04 -> Tab Annual Training Plan.',
        'Klik [+ Tambah Program ATP] dan isi target peserta, departemen, instruktur, dan budget (Juta IDR).',
        'Cetak dokumen jadwal resmi menggunakan tombol [📄 Cetak ATP (PDF)].'
      ],
      targetTab: 'learning-training',
      targetSubTabKey: 'learningTraining',
      targetSubTab: 'atp',
      tags: ['atp', 'annual training plan', 'anggaran pelatihan', 'jadwal']
    },
    {
      id: 'qna-7',
      category: '05. 9-Box & Suksesi',
      question: 'Bagaimana sistem mengelompokkan karyawan ke dalam Kuadran 9-Box?',
      answer: 'Kuadran 9-Box dihitung secara otomatis berdasarkan kombinasi Rating Kinerja (Performance: Low, Medium, High) dan Rating Potensi (Potential: Low, Medium, High). Kuadran 9 mewakili "Star Talent" (High Performance & High Potential), sedangkan Kuadran 1 mewakili "Under Performer".',
      keyPoints: [
        'Box 9 (Star): Kinerja Tinggi & Potensi Tinggi -> Target Suksesor Cepat.',
        'Box 8 (High Potential): Kinerja Sedang & Potensi Tinggi -> Butuh Penguatan Teknis.',
        'Box 6 (High Performer): Kinerja Tinggi & Potensi Sedang -> Ahli Fungsional/Core.',
        'Box 5 (Core Performer): Kinerja Sedang & Potensi Sedang -> Tulang Punggung Operasional.'
      ],
      targetTab: 'talent-succession',
      targetSubTabKey: 'talentSuccession',
      targetSubTab: 'ninebox',
      tags: ['9-box', 'kuadran talenta', 'kinerja', 'potensi', 'star']
    },
    {
      id: 'qna-8',
      category: '05. 9-Box & Suksesi',
      question: 'Kapan dan bagaimana cara menggunakan Emergency Flight Simulator?',
      answer: 'Emergency Flight Simulator digunakan saat terjadi krisis atau kekosongan mendadak pada Posisi Kritis (misalnya pejabat kunci mengundurkan diri tiba-tiba). Simulator ini mengaudit skor OVI (Operational Vulnerability Index), menghitung risiko finansial harian, memilih suksesor darurat terbaik berdasarkan kesiapan, dan menerbitkan rencana kontinjensi 30 hari.',
      keyPoints: [
        'Buka Domain 05 (Talent & Succession) -> Tab Emergency Simulator.',
        'Pilih posisi kritis yang terdampak dan alasan krisis.',
        'Sistem menghitung risiko operasional & menyajikan suksesor darurat dengan onboarding velocity tercepat.',
        'Klik [⚡ Aktifkan Emergency IDP 30 Hari] dan cetak Laporan Audit Krisis PDF.'
      ],
      targetTab: 'talent-succession',
      targetSubTabKey: 'talentSuccession',
      targetSubTab: 'simulator',
      tags: ['emergency simulator', 'suksesi darurat', 'posisi kritis', 'ovi']
    },
    {
      id: 'qna-9',
      category: '06. IDP & Kinerja',
      question: 'Apa itu Kerangka Kerja IDP 70:20:10 dan bagaimana pengisiannya?',
      answer: 'Individual Development Plan (IDP) 70:20:10 adalah kerangka pengembangan kepemimpinan dan kompetensi modern yang membagi aksi pengembangan menjadi 70% Pengalaman Praktis (On-the-Job & Special Projects), 20% Paparan Sosial (Coaching & Shadowing Mentor), dan 10% Edukasi Formal (Pelatihan & Sertifikasi).',
      keyPoints: [
        '70% Experience: Penugasan proyek strategis, rotasi, atau penyelesaian masalah operasional riil.',
        '20% Exposure: Sesi 1-on-1 mentoring dengan VP/Manager dan executive shadowing.',
        '10% Education: Kursus terstruktur, sertifikasi profesi, dan workshop teknis.',
        'Dilengkapi blok tanda tangan resmi dan cetak dokumen IDP 70:20:10 PDF.'
      ],
      targetTab: 'performance-dev',
      targetSubTabKey: 'performanceDev',
      targetSubTab: 'idp',
      tags: ['idp', '70:20:10', 'pengembangan karyawan', 'mentoring']
    },
    {
      id: 'qna-10',
      category: '07. MPP 4-Pilar',
      question: 'Apa yang dimaksud dengan Intervensi 4-Pilar pada Perencanaan Tenaga Kerja (MPP)?',
      answer: 'Intervensi 4-Pilar adalah metodologi penutupan gap antara Supply tenaga kerja yang diproyeksikan (setelah dikurangi turnover & pensiun) dengan Demand kebutuhan bisnis. Keempat pilar tersebut adalah: Pilar 1: Rekrutmen Eksternal (Buy), Pilar 2: Mobilitas Internal/Promosi (Borrow), Pilar 3: Upskilling/Reskilling (Build), dan Pilar 4: Otomasi/Efisiensi (Bot).',
      keyPoints: [
        'Pilar 1 (Buy): Rekrutmen personil baru dari luar perusahaan.',
        'Pilar 2 (Borrow): Rotasi atau transfer internal antar departemen.',
        'Pilar 3 (Build): Peningkatan kompetensi karyawan yang sudah ada.',
        'Pilar 4 (Bot): Efisiensi digitalisasi untuk mengurangi kebutuhan penambahan fisik tenaga kerja.'
      ],
      targetTab: 'workforce-planning',
      tags: ['mpp', '4-pilar', 'manpower planning', 'demand vs supply']
    },
    {
      id: 'qna-11',
      category: '08. AI & Intelligence',
      question: 'Bagaimana cara menggunakan fitur Tanya AI Advisor (People Intelligence)?',
      answer: 'Buka Domain 08 (People Intelligence) atau klik tombol [✨ Tanya AI Advisor] di header/dashboard. Anda dapat mengajukan pertanyaan strategis seputar analisis turnover, rekomendasi suksesi, strategi retensi karyawan bintang, hingga proyeksi biaya pelatihan. AI ditenagai oleh Google Gemini API.',
      keyPoints: [
        'Gunakan prompt cepat (Quick Prompts) yang telah disediakan atau ketik pertanyaan bebas.',
        'Dapat menghasilkan memo rekomendasi resmi Dewan Direksi.',
        'Tersedia tombol [📄 Cetak PDF Briefing] untuk mencetak memo eksekutif AI.'
      ],
      targetTab: 'people-intelligence',
      tags: ['ai advisor', 'gemini', 'people intelligence', 'asisten ai']
    },
    {
      id: 'qna-12',
      category: '09. Ekspor & Cetak PDF',
      question: 'Bagaimana cara mencetak laporan PDF di seluruh modul dan apakah sudah dilengkapi grafik?',
      answer: 'Seluruh modul di WorkforceOS telah dilengkapi tombol Cetak PDF berdesain eksekutif Dark Navy (#0f172a). Template PDF dibuat dengan grafik bawaan (progress bars, distribusi 9-box, kartu metrik, status audit) dan blok tanda tangan persetujuan resmi.',
      keyPoints: [
        'Cetak Laporan Eksekutif: Tersedia di Domain 01 (Executive Dashboard).',
        'Cetak Dossier Karyawan 360: Tersedia di modal Profil 360 (Domain 02).',
        'Cetak Standar Jabatan & Kamus: Tersedia di Domain 03 (Competency & TNA).',
        'Cetak Jadwal ATP & Audit Krisis: Tersedia di Domain 04 & Domain 05.',
        'Cetak MPP & IDP 70:20:10: Tersedia di Domain 07 & Domain 06.'
      ],
      targetTab: 'executive',
      tags: ['cetak pdf', 'grafik pdf', 'ekspor', 'laporan resmi']
    },
    {
      id: 'qna-13',
      category: '09. Ekspor & Cetak PDF',
      question: 'Bagaimana format template Excel untuk impor data massal agar tidak terjadi duplikasi?',
      answer: 'Setiap modul (Standar Harmonisasi, Kamus Kompetensi, Data Karyawan, dan Nilai Pelatihan) memiliki tombol [📄 Template Excel] untuk mengunduh format kolom yang sesuai. Fitur impor dilengkapi logika smart anti-duplikasi yang memverifikasi kode/nama; data yang sudah ada akan dilewati (skip) secara otomatis.',
      keyPoints: [
        'Unduh template resmi melalui tombol [📄 Template Excel].',
        'Isi data sesuai kolom yang telah ditentukan.',
        'Upload file Excel melalui tombol [📥 Import Excel].',
        'Sistem akan menampilkan ringkasan data yang berhasil ditambahkan vs data yang dilewati karena sudah ada.'
      ],
      targetTab: 'competency-tna',
      targetSubTabKey: 'competencyTna',
      targetSubTab: 'harmonization',
      tags: ['template excel', 'import excel', 'anti-duplikasi', 'bulk import']
    }
  ];

  // ============================================================================
  // DATABASE 2: END-TO-END USE CASE SIMULATIONS (MINIMAL 6 SIMULASI LENGKAP)
  // ============================================================================
  const USE_CASES: UseCaseSimulation[] = [
    {
      id: 'uc-1',
      title: 'Simulasi 1: Onboarding Karyawan Baru (New Hire Onboarding)',
      tag: 'Workforce & TNA',
      tagTone: 'blue',
      scenarioContext: 'Perusahaan baru saja merekrut seorang "Senior Operations Supervisor" baru untuk Departemen Operasional. Karyawan ini harus didaftarkan ke sistem, dipetakan ke bagan organisasi, disesuaikan dengan standar TNA, dan didaftarkan ke modul pelatihan kurikulum onboarding.',
      objective: 'Memastikan karyawan baru tercatat di master data, terhubung ke bagan struktur organisasi, dan memiliki kepatuhan standar kualifikasi sejak hari pertama kerja.',
      keyBenefits: [
        'Zero blindspot data master karyawan baru',
        'Kepatuhan kualifikasi jabatan terverifikasi otomatis',
        'Jalur kurikulum onboarding langsung terjadwal'
      ],
      successCriteria: 'Karyawan terdaftar di Direktori, terlihat di Bagan SO, berstatus Lolos/Gap pada TNA Matrix, dan ter-enroll pada kurikulum pelatihan.',
      steps: [
        {
          stepNumber: 1,
          title: 'Verifikasi Kebutuhan Headcount di Perencanaan MPP',
          pageName: 'Domain 07: Workforce Planning',
          pageFunction: 'Memastikan departemen target memiliki alokasi kuota rekrutmen terbuka pada pilar Buy (Pilar 1).',
          actions: [
            'Buka menu Workforce Planning (Domain 07).',
            'Pilih departemen "Operations".',
            'Pastikan kolom "P1: Rekrutmen" memiliki alokasi headcount yang cukup.'
          ],
          sampleData: 'Departemen: Operations | Kebutuhan: Supervisor | Pilar: P1 (Rekrutmen)',
          targetTab: 'workforce-planning',
          expectedOutput: 'Kuota rekrutmen terkonfirmasi valid dan sesuai plafon anggaran operasional.'
        },
        {
          stepNumber: 2,
          title: 'Input Data Master Karyawan di Direktori',
          pageName: 'Domain 02: Workforce Foundation -> Direktori Karyawan',
          pageFunction: 'Mendaftarkan NIP, nama lengkap, gelar, pendidikan, jabatan, dan masa kerja karyawan baru.',
          actions: [
            'Buka Domain 02 (Workforce Foundation) tab Direktori Karyawan.',
            'Klik tombol [+ Tambah Karyawan] di pojok kanan atas.',
            'Isi Nama: "Bambang Pamungkas, S.T.", NIP: "ALK-2026-091", Departemen: "Operations", Jabatan: "Senior Operations Supervisor", Level: "Supervisor", Grade: "G5", Pendidikan: "S1", Masa Kerja: "0 Tahun".',
            'Klik [Simpan Data Karyawan].'
          ],
          sampleData: 'NIP: ALK-2026-091 | Bambang Pamungkas, S.T. | Level: Supervisor | Grade: G5',
          targetTab: 'workforce',
          targetSubTabKey: 'workforce',
          targetSubTab: 'directory',
          expectedOutput: 'Karyawan baru muncul di tabel direktori dengan status aktif dan kuadran 9-Box awal terhitung.'
        },
        {
          stepNumber: 3,
          title: 'Penempatan pada Struktur Organisasi & Peta Jabatan',
          pageName: 'Domain 02: Workforce Foundation -> Struktur Organisasi',
          pageFunction: 'Meninjau hierarki atasan langsung dan span of control tim operasional.',
          actions: [
            'Buka tab "Struktur Organisasi" di Domain 02.',
            'Pilih unit "Operations Division".',
            'Verifikasi bahwa posisi Senior Operations Supervisor terhubung langsung di bawah Operations Manager.'
          ],
          sampleData: 'Atasan Langsung: Operations Manager | Span of Control: 6 Operator',
          targetTab: 'workforce',
          targetSubTabKey: 'workforce',
          targetSubTab: 'org',
          expectedOutput: 'Posisi jabatan terpetakan dalam bagan hierarki dan headcount unit ter-update otomatis.'
        },
        {
          stepNumber: 4,
          title: 'Pemberlakuan Standar Kualifikasi Jabatan Harmonisasi',
          pageName: 'Domain 03: Competency & TNA -> Standar Jabatan Harmonisasi',
          pageFunction: 'Menghubungkan jabatan karyawan dengan syarat administratif kualifikasi TNA & kompetensi perilaku.',
          actions: [
            'Buka Domain 03 tab "Standar Jabatan Harmonisasi".',
            'Pilih standar untuk "Senior Operations Supervisor".',
            'Tinjau syarat administratif: S1 Teknik, Sertifikasi POP K3 Tambang, dan 4 Modul Wajib Kurikulum.'
          ],
          sampleData: 'Min Edu: S1 | Min Tenure: 0 Thn | Wajib: Safety Mining, Leadership 101',
          targetTab: 'competency-tna',
          targetSubTabKey: 'competencyTna',
          targetSubTab: 'harmonization',
          expectedOutput: 'Standar kualifikasi resmi aktif mengikat karyawan bersangkutan.'
        },
        {
          stepNumber: 5,
          title: 'Audit Kualifikasi & Enrollment ke Matriks Pelatihan',
          pageName: 'Domain 03: Competency & TNA -> Matriks Pelatihan (TNA Matrix)',
          pageFunction: 'Memeriksa gap awal onboarding dan mendaftarkan modul pelatihan yang harus diselesaikan.',
          actions: [
            'Buka tab "Matriks Pelatihan & TNA" di Domain 03.',
            'Cari nama "Bambang Pamungkas".',
            'Sistem akan menampilkan modul yang belum selesai ("Progress" / "Not Taken").',
            'Klik sel pelatihan untuk meng-update status ke "In Progress" saat karyawan mengikuti onboarding.',
            'Cetak bukti audit kualifikasi awal dengan tombol [📄 PDF].'
          ],
          sampleData: 'Status Awal: Onboarding Progress | Modul Wajib: 3 Modul Terdaftar',
          targetTab: 'competency-tna',
          targetSubTabKey: 'competencyTna',
          targetSubTab: 'matrix',
          expectedOutput: 'Rencana pembelajaran awal onboarding aktif terpantau di matriks pelatihan korporat.'
        }
      ]
    },
    {
      id: 'uc-2',
      title: 'Simulasi 2: Promosi Jabatan & Kenaikan Grade/Level (Promotion & Grade Escalation)',
      tag: 'Talent & Succession',
      tagTone: 'emerald',
      scenarioContext: 'Seorang karyawan berkinerja unggul (Box 9 - Star) saat ini menjabat sebagai "Fleet Maintenance Engineer" (Level Officer, Grade G4) dan dipersiapkan untuk promosi ke jenjang "Maintenance Planning Section Head" (Level Supervisor, Grade G5).',
      objective: 'Memverifikasi kelayakan promosi, mengaudit kesenjangan kompetensi, menyusun IDP akselerasi, mengeksekusi promosi jabatan, dan memperbarui riwayat pergerakan karyawan.',
      keyBenefits: [
        'Promosi berbasis data objektif kualifikasi & 9-box',
        'Akselerasi kesiapan melalui IDP 70:20:10 terstruktur',
        'Riwayat mutasi & kenaikan grade terekam resmi'
      ],
      successCriteria: 'Karyawan memenuhi syarat TNA level baru, menyelesaikan IDP target kesiapan, dan jabatan/grade resmi terbarui di SO serta tercatat di Workforce Movement.',
      steps: [
        {
          stepNumber: 1,
          title: 'Evaluasi Kuadran 9-Box & Rekam Jejak Kinerja',
          pageName: 'Domain 05: Talent & Succession -> 9-Box Talent Matrix',
          pageFunction: 'Memastikan karyawan berada pada kuadran siap promosi (Box 9 Star atau Box 8 High Potential).',
          actions: [
            'Buka Domain 05 tab "9-Box Talent Matrix".',
            'Cari karyawan target promosi.',
            'Pastikan rating kinerja = High (Rating A) dan potensi = High (Rating A).'
          ],
          sampleData: 'Kuadran: Box 9 (Star Talent) | Kinerja: 4.8 / 5.0 | Potensi: High',
          targetTab: 'talent-succession',
          targetSubTabKey: 'talentSuccession',
          targetSubTab: 'ninebox',
          expectedOutput: 'Karyawan terkonfirmasi sebagai talenta prioritas promosi.'
        },
        {
          stepNumber: 2,
          title: 'Audit Kesenjangan Syarat Standar Jabatan Target',
          pageName: 'Domain 03: Competency & TNA -> Standar Jabatan Harmonisasi',
          pageFunction: 'Membandingkan profil karyawan dengan syarat jabatan target (Supervisor Section Head).',
          actions: [
            'Buka Domain 03 tab "Standar Jabatan Harmonisasi".',
            'Pilih standar posisi target "Maintenance Planning Section Head".',
            'Periksa persyaratan: Kualifikasi Pendidikan (S1), Masa Kerja (Min. 3 Thn), Sertifikasi (POP Tambang), dan Target Kompetensi (Level 3-4).'
          ],
          sampleData: 'Jabatan Target: Section Head | Syarat: POP Tambang + Leadership Level 3',
          targetTab: 'competency-tna',
          targetSubTabKey: 'competencyTna',
          targetSubTab: 'harmonization',
          expectedOutput: 'Daftar kesenjangan spesifik (gap) yang harus ditutup sebelum SK promosi terbit.'
        },
        {
          stepNumber: 3,
          title: 'Penyusunan Individual Development Plan (IDP 70:20:10) Akselerasi',
          pageName: 'Domain 06: Performance & Development -> IDP 70:20:10 Studio',
          pageFunction: 'Merumuskan rencana aksi pengembangan 3-6 bulan untuk menutup gap sebelum promosi.',
          actions: [
            'Buka Domain 06 tab "IDP 70:20:10".',
            'Pilih profil karyawan bersangkutan.',
            'Tetapkan Target Promosi: "Maintenance Planning Section Head", Target Kesiapan: "95%".',
            'Tambahkan tugas 70% Experience (Lead Fleet Overhaul Project), 20% Exposure (Mentoring mingguan dengan Maintenance Manager), dan 10% Education (Sertifikasi POP & Executive Leadership).',
            'Cetak dokumen IDP resmi PDF untuk ditandatangani bersama atasan.'
          ],
          sampleData: 'IDP Cycle: 6 Bulan | Target Readiness: 95% | Focus: Strategic Overhaul Planning',
          targetTab: 'performance-dev',
          targetSubTabKey: 'performanceDev',
          targetSubTab: 'idp',
          expectedOutput: 'Dokumen IDP akselerasi promosi aktif dan terpantau progres penyelesaiannya.'
        },
        {
          stepNumber: 4,
          title: 'Penyelesaian Modul & Verifikasi Kelulusan Uji Kompetensi',
          pageName: 'Domain 04: Learning & Training -> Manajemen Modul Pelatihan',
          pageFunction: 'Mencatat penyelesaian sertifikasi dan penilaian nilai kelulusan pelatihan.',
          actions: [
            'Buka Domain 04 atau TNA Matrix di Domain 03.',
            'Update status modul "Leadership 101" dan "Safety Mining Level 2" menjadi "Done".',
            'Input nomor sertifikat lisensi dan skor evaluasi (misal: Skor 92).'
          ],
          sampleData: 'Sertifikat: POP-2026-8819 | Skor: 92 | Status: Completed',
          targetTab: 'learning-training',
          targetSubTabKey: 'learningTraining',
          targetSubTab: 'modules',
          expectedOutput: 'Status audit TNA berubah menjadi "QUALIFIED (Lolos)" secara otomatis.'
        },
        {
          stepNumber: 5,
          title: 'Eksekusi Promosi, Update Grade & Rekam Mutasi Karyawan',
          pageName: 'Domain 02: Workforce Foundation -> Direktori & Mutasi Karyawan',
          pageFunction: 'Memperbarui data jabatan/grade baru dan mencatatkan riwayat promosi di log pergerakan karyawan.',
          actions: [
            'Buka Domain 02 Direktori Karyawan, klik baris karyawan -> [✏️ Edit Profil].',
            'Ubah Jabatan: "Maintenance Planning Section Head", Level: "Supervisor", Grade: "G5".',
            'Buka tab "Workforce Movement" di Domain 02 untuk mencatat mutasi promosi resmi.',
            'Cetak lembar Dossier Profil 360 PDF yang sudah memuat jabatan dan grade baru.'
          ],
          sampleData: 'Mutasi: Promosi Internal | Jabatan Baru: Maintenance Planning Section Head | Grade Baru: G5',
          targetTab: 'workforce',
          targetSubTabKey: 'workforce',
          targetSubTab: 'directory',
          expectedOutput: 'Jabatan dan grade baru aktif di seluruh sistem, SO ter-update, dan riwayat mutasi tersimpan permanen.'
        }
      ]
    },
    {
      id: 'uc-3',
      title: 'Simulasi 3: Mitigasi Suksesi Darurat (Emergency Succession & Acting Appointment)',
      tag: 'Talent & Crisis',
      tagTone: 'rose',
      scenarioContext: 'Seorang pejabat kunci "Operations Manager" di site tambang utama mendadak mengundurkan diri dalam tempo 2 minggu (Sudden Resignation). Posisi ini memiliki risiko operasional kritis yang dapat menghentikan aktivitas hauling batubara senilai Rp 85 Juta/hari.',
      objective: 'Mengidentifikasi suksesor darurat terbaik dalam hitungan menit, menghitung dampak risiko kerentanan operasional, menerbitkan SK Pelaksana Tugas (Pjs / Acting), dan mengaktifkan IDP transisi krisis 30 hari.',
      keyBenefits: [
        'Respon mitigasi kekosongan kritis < 15 menit',
        'Penentuan suksesor berbasis kecocokan fit & velocity onboarding',
        'Otomatisasi IDP Darurat 30 hari & pelaporan resmi ke Direksi'
      ],
      successCriteria: 'Suksesor darurat terpilih dengan fit score tertinggi, SK Pjs terbit, IDP Transisi 30 Hari aktif, dan laporan audit krisis PDF diterima Dewan Direksi.',
      steps: [
        {
          stepNumber: 1,
          title: 'Deteksi Posisi Kritis & Status Bench Kesiapan Suksesor',
          pageName: 'Domain 05: Talent & Succession -> Succession Bench Pipeline',
          pageFunction: 'Memeriksa daftar kandidat suksesor yang terdaftar pada posisi Operations Manager.',
          actions: [
            'Buka Domain 05 tab "Succession Bench Pipeline".',
            'Cari posisi "Operations Manager".',
            'Periksa ketersediaan suksesor dengan status "Ready Now".'
          ],
          sampleData: 'Posisi: Operations Manager | Risiko: High | Suksesor Terdaftar: 2 Kandidat',
          targetTab: 'talent-succession',
          targetSubTabKey: 'talentSuccession',
          targetSubTab: 'succession',
          expectedOutput: 'Daftar suksesor teridentifikasi beserta persentase fit score masing-masing.'
        },
        {
          stepNumber: 2,
          title: 'Jalankan Emergency Flight Simulator',
          pageName: 'Domain 05: Talent & Succession -> Emergency Simulator',
          pageFunction: 'Melakukan stress-test operasional dan kalkulasi Operational Vulnerability Index (OVI).',
          actions: [
            'Buka tab "Emergency Flight Simulator" di Domain 05.',
            'Pilih Posisi Kritis: "Operations Manager (Operations)".',
            'Pilih Skenario Krisis: "Sudden Resignation (2-Weeks Notice)".',
            'Klik tombol [⚡ Jalankan Simulasi Krisis].'
          ],
          sampleData: 'Krisis: Sudden Resignation | Dampak Tim: 14 Bawahan Langsung Terdampak',
          targetTab: 'talent-succession',
          targetSubTabKey: 'talentSuccession',
          targetSubTab: 'simulator',
          expectedOutput: 'Skor Indeks Kerentanan OVI (misal: 78% High Risk) dan estimasi kerugian finansial terhitung instan.'
        },
        {
          stepNumber: 3,
          title: 'Seleksi Suksesor Darurat Terbaik (Best Acting Successor)',
          pageName: 'Domain 05: Talent & Succession -> Emergency Simulator Hasil Rekomendasi',
          pageFunction: 'Memilih kandidat dengan kecocokan teknis, leadership, dan onboarding velocity tercepat.',
          actions: [
            'Tinjau kartu Best Successor yang direkomendasikan AI (misal: "Ahmad Faqih Didin").',
            'Periksa metrik: Fit Score (88%), Leadership (85%), Technical (90%), Velocity (7 Hari Onboarding).'
          ],
          sampleData: 'Kandidat Terpilih: Ahmad Faqih Didin | Fit: 88% | Onboarding Velocity: 7 Hari',
          targetTab: 'talent-succession',
          targetSubTabKey: 'talentSuccession',
          targetSubTab: 'simulator',
          expectedOutput: 'Kandidat suksesor paling optimal terpilih untuk penunjukan pejabat Pjs.'
        },
        {
          stepNumber: 4,
          title: 'Aktivasi IDP Transisi Darurat 30 Hari & Catat Mutasi Pjs',
          pageName: 'Domain 05 -> Tombol [⚡ Aktifkan Emergency IDP 30 Hari]',
          pageFunction: 'Mengaktifkan kurikulum darurat 30 hari di Domain 06 secara instan tanpa input manual.',
          actions: [
            'Klik tombol merah [⚡ Aktifkan Emergency IDP 30 Hari & Tugaskan].',
            'Sistem otomatis membuat IDP krisis berisi: Otorisasi anggaran site, transisi komando K3, dan crash course kepatuhan KTT.',
            'Sistem langsung mengarahkan Anda ke lembar IDP aktif di Domain 06.'
          ],
          sampleData: 'IDP Krisis: 30-Day Emergency Command Transition | Status: Active',
          targetTab: 'performance-dev',
          targetSubTabKey: 'performanceDev',
          targetSubTab: 'idp',
          expectedOutput: 'IDP Transisi 30 Hari langsung aktif di modul kinerja dan suksesor resmi mengemban tugas Pjs.'
        },
        {
          stepNumber: 5,
          title: 'Cetak Laporan Audit Krisis & Memo Dewan Direksi (PDF)',
          pageName: 'Domain 05: Talent & Succession -> [📄 Cetak Laporan Audit Krisis (PDF)]',
          pageFunction: 'Menghasilkan dokumen resmi SK Direksi & audit kerentanan operasional dalam format PDF.',
          actions: [
            'Kembali ke tab Emergency Simulator.',
            'Klik tombol [📄 Cetak Laporan Audit Krisis (PDF)].',
            'Dokumen PDF resmi berstempel dan berformat Board Memo langsung terunduh untuk ditandatangani CEO.'
          ],
          sampleData: 'Doc ID: EMERG-SUCC-XXXXXX | Lampiran: Rekomendasi Mitigasi AI 30 Hari',
          targetTab: 'talent-succession',
          targetSubTabKey: 'talentSuccession',
          targetSubTab: 'simulator',
          expectedOutput: 'Dokumen legalitas penunjukan Pjs dan mitigasi risiko krisis siap dilaporkan ke Dewan Direksi.'
        }
      ]
    },
    {
      id: 'uc-4',
      title: 'Simulasi 4: Perencanaan Pelatihan Tahunan Korporat (Annual Training Plan / ATP Lifecycle)',
      tag: 'Learning & Budget',
      tagTone: 'purple',
      scenarioContext: 'Divisi Human Capital sedang menyusun Rencana Kerja & Anggaran Perusahaan (RKAP) untuk program pengembangan kompetensi tahunan (Annual Training Plan 2026). Diperlukan konsolidasi gap kompetensi massal dan alokasi anggaran pelatihan per bulan.',
      objective: 'Mengonversi gap kompetensi seluruh karyawan menjadi program pelatihan terstruktur, menjadwalkan alokasi bulan, menunjuk instruktur, dan mengestimasi anggaran total.',
      keyBenefits: [
        'Penyusunan anggaran pelatihan berbasis kebutuhan riil (needs-driven)',
        'Distribusi jadwal merata sepanjang 12 bulan kalender',
        'Visibilitas total realisasi anggaran per departemen'
      ],
      successCriteria: 'Jadwal ATP tahunan tersusun lengkap dengan kuota peserta, alokasi anggaran (Jt IDR), dan dokumen master PDF siap approval.',
      steps: [
        {
          stepNumber: 1,
          title: 'Analisis Peta Kesenjangan Kompetensi Massal',
          pageName: 'Domain 03: Competency & TNA -> Skill Gap Heatmap',
          pageFunction: 'Mengidentifikasi area kompetensi yang memiliki gap terbanyak di seluruh departemen.',
          actions: [
            'Buka Domain 03 tab "Skill Gap Heatmap".',
            'Periksa heatmap warna merah/amber (misal: "K3 Pertambangan & POP" dan "Advanced Fleet Telematics").',
            'Catat jumlah karyawan yang membutuhkan intervensi pelatihan.'
          ],
          sampleData: 'Gap Kritis Terdeteksi: 18 Karyawan butuh K3 Tambang, 12 Karyawan butuh Telematics',
          targetTab: 'competency-tna',
          targetSubTabKey: 'competencyTna',
          targetSubTab: 'heatmap',
          expectedOutput: 'Daftar topik modul prioritas yang harus dimasukkan ke dalam kalender tahunan ATP.'
        },
        {
          stepNumber: 2,
          title: 'Pendaftaran & Penyesuaian Silabus Modul Kurikulum',
          pageName: 'Domain 04: Learning & Training -> Manajemen Modul',
          pageFunction: 'Memastikan modul pelatihan telah memiliki silabus terdaftar, durasi jam, dan metode pelatihan.',
          actions: [
            'Buka Domain 04 tab "Katalog Modul".',
            'Jika ada topik baru, klik [+ Tambah Modul Baru] di pojok kanan atas.',
            'Isi Nama Modul: "Heavy Equipment Safety & Telemetry", Kode: "MOD-SAF-05", Kategori: "Technical", Durasi: "16 Jam", Biaya per Peserta: "Rp 2.5 Juta".'
          ],
          sampleData: 'Kode: MOD-SAF-05 | Durasi: 16 Jam | Biaya: Rp 2.5 Jt/Pax',
          targetTab: 'learning-training',
          targetSubTabKey: 'learningTraining',
          targetSubTab: 'modules',
          expectedOutput: 'Modul kurikulum resmi terdaftar dalam katalog pelatihan korporat.'
        },
        {
          stepNumber: 3,
          title: 'Formulasi Program & Jadwal Pelatihan pada Studio ATP',
          pageName: 'Domain 04: Learning & Training -> Annual Training Plan',
          pageFunction: 'Menjadwalkan program ke dalam bulan rencana dan menetapkan target peserta.',
          actions: [
            'Buka Domain 04 tab "Annual Training Plan".',
            'Klik [+ Tambah Program ATP].',
            'Pilih Modul: "MOD-SAF-05", Departemen: "Operations", Bulan: "Maret 2026", Target Peserta: "15 Orang", Budget: "Rp 37.5 Juta", Instruktur: "Pusdiklat K3 Nasional".',
            'Klik [Simpan Program ATP].'
          ],
          sampleData: 'Bulan: Maret 2026 | Kuota: 15 Orang | Anggaran: Rp 37.5 Juta | Vendor: Pusdiklat K3',
          targetTab: 'learning-training',
          targetSubTabKey: 'learningTraining',
          targetSubTab: 'atp',
          expectedOutput: 'Program pelatihan terjadwal di kalender korporat dan total anggaran tahunan ter-update otomatis.'
        },
        {
          stepNumber: 4,
          title: 'Pelaksanaan & Tracking Realisasi Lifecycle Status Pelatihan',
          pageName: 'Domain 04: Learning & Training -> Lifecycle Status',
          pageFunction: 'Memantau siklus status dari "Planned" -> "In Progress" -> "Completed".',
          actions: [
            'Saat bulan pelatihan tiba, ubah status program menjadi "In Progress".',
            'Setelah batch selesai diselenggarakan, ubah status menjadi "Completed" dan input feedback score evaluasi (1-5).'
          ],
          sampleData: 'Status: Completed | Feedback Score: 4.85 / 5.00 | Realisasi Peserta: 15 / 15',
          targetTab: 'learning-training',
          targetSubTabKey: 'learningTraining',
          targetSubTab: 'atp',
          expectedOutput: 'Realisasi jam pelatihan terakumulasi ke dalam Executive Health Dashboard.'
        },
        {
          stepNumber: 5,
          title: 'Cetak Master Dokumen Jadwal & Anggaran ATP (PDF)',
          pageName: 'Domain 04: Learning & Training -> [📄 Cetak ATP (PDF)]',
          pageFunction: 'Mencetak jadwal master rencana pelatihan korporat dan rincian alokasi anggaran.',
          actions: [
            'Buka tab Annual Training Plan di Domain 04.',
            'Klik tombol [📄 Cetak ATP (PDF)].',
            'Laporan PDF landscape resmi berstandar korporat akan terunduh lengkap dengan rekapitulasi total budget.'
          ],
          sampleData: 'Laporan: ATP_Master_Schedule_2026.pdf | Format: Landscape Grid',
          targetTab: 'learning-training',
          targetSubTabKey: 'learningTraining',
          targetSubTab: 'atp',
          expectedOutput: 'Dokumen master ATP 2026 resmi siap disahkan oleh Human Capital Directorate.'
        }
      ]
    },
    {
      id: 'uc-5',
      title: 'Simulasi 5: Restrukturisasi Organisasi & Penyesuaian Beban Payroll',
      tag: 'Org Design & Cost',
      tagTone: 'amber',
      scenarioContext: 'Manajemen merencanakan pembentukan divisi baru "Supply Chain & Logistics Automation" serta penggabungan (merger) unit support untuk memangkas duplikasi peran dan mengoptimalkan rasio span of control.',
      objective: 'Mensimulasikan perubahan struktur organisasi, menghitung delta headcount, mengevaluasi dampak beban payroll bulanan, dan mencetak proposal resmi ke Dewan Direksi.',
      keyBenefits: [
        'Simulasi skenario sebelum implementasi riil tanpa risiko data rusak',
        'Kalkulasi otomatis efisiensi/tambahan payroll bulanan',
        'Analisis rasio span of control ideal (1:5 s/d 1:8)'
      ],
      successCriteria: 'Proposal restrukturisasi terformulasikan dengan kalkulasi payroll delta dan proposal PDF siap diajukan ke Direksi.',
      steps: [
        {
          stepNumber: 1,
          title: 'Buka Studio Simulasi Restrukturisasi Organisasi',
          pageName: 'Domain 02: Workforce Foundation -> Struktur Organisasi -> Org Restructuring Studio',
          pageFunction: 'Mengaktifkan workspace simulasi skenario desain organisasi baru.',
          actions: [
            'Buka Domain 02 tab "Struktur Organisasi".',
            'Klik tombol [🏗️ Studio Desain & Restrukturisasi SO].',
            'Pilih atau buat skenario baru: "Skenario A: Efisiensi Unit & Otomasi Supply Chain".'
          ],
          sampleData: 'Skenario: Streamlined Operations 2026 | Baseline Headcount: 85 HC',
          targetTab: 'workforce',
          targetSubTabKey: 'workforce',
          targetSubTab: 'org',
          expectedOutput: 'Workspace simulasi interaktif terbuka dengan data unit eksisting.'
        },
        {
          stepNumber: 2,
          title: 'Penyesuaian Struktur Unit, Merger & Pemisahan Divisi',
          pageName: 'Domain 02: Org Design Studio -> Manajemen Unit Departemen',
          pageFunction: 'Menyesuaikan alokasi target headcount dan struktur hierarki per departemen.',
          actions: [
            'Sesuaikan target headcount pada unit "Operations" (-3 HC efisiensi).',
            'Tambah unit baru "Automation Logistics" (+4 HC spesialis).',
            'Sesuaikan alokasi anggaran operasional bulanan.'
          ],
          sampleData: 'Operations: 45 -> 42 HC | Automation Logistics: 0 -> 4 HC (Baru)',
          targetTab: 'workforce',
          targetSubTabKey: 'workforce',
          targetSubTab: 'org',
          expectedOutput: 'Peta unit baru terbentuk dengan kalkulasi span of control real-time.'
        },
        {
          stepNumber: 3,
          title: 'Evaluasi Span of Control & Indeks Risiko Friksi Organisasi',
          pageName: 'Domain 02: Org Design Studio -> Telemetri Efisiensi',
          pageFunction: 'Memeriksa apakah rasio rentang kendali atasan-bawahan berada pada batas sehat.',
          actions: [
            'Periksa metrik Rata-rata Span of Control (misal: 1:6.5 ideal).',
            'Tinjau Indeks Risiko Friksi (Friction Risk) untuk memastikan tidak terjadi bottleneck koordinasi.'
          ],
          sampleData: 'Span of Control: 1:6.5 (Optimal) | Friction Risk: Low-Medium',
          targetTab: 'workforce',
          targetSubTabKey: 'workforce',
          targetSubTab: 'org',
          expectedOutput: 'Rekomendasi struktural terkonfirmasi sehat dan tidak membebani manajer lini.'
        },
        {
          stepNumber: 4,
          title: 'Kalkulasi Otomatis Dampak Beban Payroll Bulanan',
          pageName: 'Domain 02: Org Design Studio -> Analisis Biaya Payroll',
          pageFunction: 'Menghitung selisih (delta) pengeluaran gaji bulanan antara struktur lama vs baru.',
          actions: [
            'Lihat kartu ringkasan biaya: Total Beban Payroll Baru (misal: Rp 1.42 Miliar/Bulan).',
            'Verifikasi nilai Delta Payroll (misal: Penghematan Efisiensi Rp 45 Juta/Bulan).'
          ],
          sampleData: 'Payroll Eksisting: Rp 1.465 M/Bln | Payroll Simulasi: Rp 1.420 M/Bln (Hemat Rp 45 Jt/Bln)',
          targetTab: 'workforce',
          targetSubTabKey: 'workforce',
          targetSubTab: 'org',
          expectedOutput: 'Kalkulasi finansial ROI efisiensi organisasi terkuantifikasi jelas.'
        },
        {
          stepNumber: 5,
          title: 'Cetak Dokumen Proposal Restrukturisasi Organisasi (PDF)',
          pageName: 'Domain 02: Org Design Studio -> [📄 Cetak Proposal (PDF)]',
          pageFunction: 'Menghasilkan dokumen proposal resmi untuk Rapat Umum Pemegang Saham / Dewan Direksi.',
          actions: [
            'Klik tombol [📄 Cetak Proposal (PDF)].',
            'Dokumen proposal resmi berstempel dan tabel komparasi departemen langsung terunduh.',
            'Ajukan dokumen ke Direktur Utama (CEO) untuk persetujuan eksekusi perubahan struktur.'
          ],
          sampleData: 'Dokumen: Org_Restructuring_Proposal_2026.pdf | Otorisator: CEO & VP Org Design',
          targetTab: 'workforce',
          targetSubTabKey: 'workforce',
          targetSubTab: 'org',
          expectedOutput: 'Proposal restrukturisasi formal siap disahkan dan dieksekusi secara bertahap.'
        }
      ]
    },
    {
      id: 'uc-6',
      title: 'Simulasi 6: Evaluasi Kinerja Tahunan, Kalibrasi 9-Box & Proteksi Key Talent',
      tag: 'Performance & Talent',
      tagTone: 'purple',
      scenarioContext: 'Pada siklus akhir tahun, HR Directorate mengadakan Talent Review Committee Meeting untuk mengkalibrasi penilaian kinerja tahunan, memetakan kembali kuadran 9-Box seluruh karyawan, serta menetapkan perlakuan khusus bagi Key Talent / High Potential.',
      objective: 'Mengintegrasikan penilaian kinerja tahunan dengan pemetaan kuadran 9-Box, mengidentifikasi karyawan bintang (Stars), menyematkan status Key Talent, dan menyiapkan paket retensi.',
      keyBenefits: [
        'Kalibrasi talenta objektif tanpa bias subjektivitas',
        'Identifikasi dini risiko attrition pada kelompok karyawan bintang',
        'Penyusunan playbook pembinaan yang sesuai kuadran'
      ],
      successCriteria: 'Seluruh karyawan terkalibrasi di 9-Box, karyawan bintang berstatus Key Talent, dan laporan kalibrasi PDF terdistribusi ke Komite Suksesi.',
      steps: [
        {
          stepNumber: 1,
          title: 'Input & Update Penilaian Rating Kinerja serta Potensi',
          pageName: 'Domain 02: Workforce Foundation -> Direktori Karyawan',
          pageFunction: 'Memperbarui skor evaluasi kinerja akhir tahun dan asesmen potensi kepemimpinan.',
          actions: [
            'Buka Domain 02 Direktori Karyawan.',
            'Pilih karyawan yang dievaluasi -> Klik [✏️ Edit Profil].',
            'Update Performance Rating (Low / Medium / High) dan Potential Rating (Low / Medium / High).',
            'Sistem seketika menghitung ulang nomor Kuadran 9-Box karyawan.'
          ],
          sampleData: 'Rating Kinerja: High (Skor 95) | Rating Potensi: High | Kuadran Baru: Box 9',
          targetTab: 'workforce',
          targetSubTabKey: 'workforce',
          targetSubTab: 'directory',
          expectedOutput: 'Data kinerja terbaru tersimpan dan kuadran 9-Box ter-update otomatis.'
        },
        {
          stepNumber: 2,
          title: 'Review Distribusi Sebaran Kuadran pada 9-Box Engine',
          pageName: 'Domain 05: Talent & Succession -> 9-Box Talent Matrix',
          pageFunction: 'Menganalisis proporsi sebaran talenta korporat (Stars, High Potentials, Core Performers, Risk).',
          actions: [
            'Buka Domain 05 tab "9-Box Talent Matrix".',
            'Gunakan filter departemen untuk melihat sebaran unit tertentu atau seluruh korporat.',
            'Tinjau persentase Box 9 (Target ideal: 5-10% dari total populasi).'
          ],
          sampleData: 'Populasi: 85 Karyawan | Box 9 (Stars): 8 Org (9.4%) | Box 5 (Core): 32 Org (37.6%)',
          targetTab: 'talent-succession',
          targetSubTabKey: 'talentSuccession',
          targetSubTab: 'ninebox',
          expectedOutput: 'Sebaran talenta terkalibrasi seimbang sesuai kurva normal korporat.'
        },
        {
          stepNumber: 3,
          title: 'Penetapan Status Key Talent & Kandidat Suksesor',
          pageName: 'Domain 02: Direktori Karyawan & Domain 05: Suksesi',
          pageFunction: 'Memberikan badge "Key Critical Talent" dan mendaftarkannya sebagai suksesor posisi kritis.',
          actions: [
            'Pada modal profil karyawan Box 9/8, aktifkan opsi "Key Critical Talent: Ya".',
            'Buka Domain 05 tab "Succession Bench Pipeline", nominasikan karyawan sebagai suksesor posisi Manager/Superintendent terkait.'
          ],
          sampleData: 'Status: ⭐ Key Critical Talent | Posisi Suksesi: Ready Now (1-3 Mo)',
          targetTab: 'talent-succession',
          targetSubTabKey: 'talentSuccession',
          targetSubTab: 'succession',
          expectedOutput: 'Karyawan terlindungi dengan status Key Talent dan masuk radar suksesi prioritas.'
        },
        {
          stepNumber: 4,
          title: 'Formulasi Playbook Pembinaan & Retensi Khusus',
          pageName: 'Domain 05: 9-Box Talent Engine -> HR Strategic Playbook',
          pageFunction: 'Menerapkan aksi retensi dan pembinaan yang disarankan sistem per kuadran.',
          actions: [
            'Baca ringkasan playbook aksi strategis untuk Box 9: "Fast-track succession, executive sponsorship, retention bonus / long-term incentive plan (LTIP)".',
            'Buka Domain 06 untuk membuat IDP akselerasi eksekutif.'
          ],
          sampleData: 'Playbook Box 9: Fast-track Promotion + LTIP Retention Package',
          targetTab: 'talent-succession',
          targetSubTabKey: 'talentSuccession',
          targetSubTab: 'ninebox',
          expectedOutput: 'Rencana aksi retensi terdefinisi jelas untuk mencegah pembajakan talenta (talent poaching).'
        },
        {
          stepNumber: 5,
          title: 'Cetak Laporan Kalibrasi 9-Box & Dossier Profil 360 (PDF)',
          pageName: 'Domain 05: [📄 Ekspor Laporan PDF] & Profil 360: [📄 Cetak Dossier (PDF)]',
          pageFunction: 'Mencetak dokumen resmi hasil rapat kalibrasi komite talenta.',
          actions: [
            'Di Domain 05, klik [📄 Ekspor Laporan PDF] untuk mengunduh laporan kalibrasi 9-box korporat.',
            'Di Profil 360 karyawan bersangkutan, klik [📄 Cetak Dossier (PDF)] untuk mencetak CV Dossier lengkap beserta grafik radar kompetensi 5-dimensi.'
          ],
          sampleData: 'Dokumen: 9Box_Talent_Report_2026.pdf & Employee_360_Dossier.pdf',
          targetTab: 'talent-succession',
          targetSubTabKey: 'talentSuccession',
          targetSubTab: 'ninebox',
          expectedOutput: 'Seluruh berkas administrasi kalibrasi talenta terdokumentasi rapi untuk arsip Komite Remunerasi & Nominasi.'
        }
      ]
    }
  ];

  // Category list for Q&A filter
  const QNA_CATEGORIES = useMemo(() => {
    const cats = Array.from(new Set(QNA_LIST.map((q) => q.category))).sort();
    return ['Semua', ...cats];
  }, []);

  // Filtered Q&A items
  const filteredQnA = useMemo(() => {
    return QNA_LIST.filter((q) => {
      const matchCat = selectedQnACategory === 'Semua' || q.category === selectedQnACategory;
      const qLower = qnaSearch.toLowerCase();
      const matchSearch =
        !qnaSearch ||
        q.question.toLowerCase().includes(qLower) ||
        q.answer.toLowerCase().includes(qLower) ||
        q.tags.some((t) => t.toLowerCase().includes(qLower));
      return matchCat && matchSearch;
    });
  }, [qnaSearch, selectedQnACategory]);

  // Filtered Use Cases
  const filteredUseCases = useMemo(() => {
    return USE_CASES.filter((u) => {
      const qLower = useCaseSearch.toLowerCase();
      return (
        !useCaseSearch ||
        u.title.toLowerCase().includes(qLower) ||
        u.scenarioContext.toLowerCase().includes(qLower) ||
        u.tag.toLowerCase().includes(qLower)
      );
    });
  }, [useCaseSearch]);

  const activeUseCase = USE_CASES.find((u) => u.id === selectedUseCaseId) || USE_CASES[0];
  const currentStepIndex = activeStepIndex[activeUseCase.id] || 0;
  const currentStep = activeUseCase.steps[currentStepIndex] || activeUseCase.steps[0];

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50 overflow-hidden font-sans text-slate-800">
      {/* Top Header Banner */}
      <div className="bg-white border-b border-slate-200 px-4 lg:px-6 py-3.5 shrink-0 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 max-w-7xl mx-auto">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-xs mt-0.5">
              <BookOpen className="w-4.5 h-4.5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60">
                  Knowledge &amp; Simulation
                </span>
                <span className="text-xs text-slate-300">•</span>
                <span className="text-xs font-semibold text-slate-500">Panduan Operasional Terpadu</span>
              </div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight font-display">
                Pusat Bantuan, Tanya Jawab &amp; Simulasi Alur Kerja
              </h1>
            </div>
          </div>

          {/* Sub Tab Switcher */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/80 shrink-0 self-start md:self-center">
            <button
              onClick={() => setActiveSubTab('qna')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'qna'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
              <span>Pusat Bantuan &amp; Q&amp;A ({QNA_LIST.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab('usecases')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'usecases'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Play className="w-3.5 h-3.5 text-emerald-600" />
              <span>Simulasi Alur Kerja ({USE_CASES.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-6">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* Official Admin Contact Support Banner */}
          <div className="p-5 sm:p-6 rounded-2xl bg-linear-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20 shadow-xs">
                <Headphones className="w-6 h-6 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-400 text-slate-900">
                    Official Support
                  </span>
                  <span className="text-xs text-blue-100 font-medium">Bantuan Teknis &amp; Aktivasi Lisensi</span>
                </div>
                <h3 className="text-sm sm:text-base font-bold mt-0.5">
                  Pusat Layanan Konsultasi &amp; Kontak Admin Resmi
                </h3>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <a
                href="https://wa.me/6282223089790"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-xs transition-all"
                title="Chat WhatsApp Admin"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp: +62 822-2308-9790</span>
              </a>

              <a
                href="mailto:satriamudaprima@gmail.com"
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white text-xs font-bold transition-all"
                title="Kirim Email ke Admin"
              >
                <Mail className="w-4 h-4" />
                <span>satriamudaprima@gmail.com</span>
              </a>

              <a
                href="https://amankerja.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 text-xs font-bold transition-all"
                title="Kunjungi Website Resmi"
              >
                <Globe className="w-4 h-4" />
                <span>amankerja.com</span>
              </a>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* TAB 1: PUSAT BANTUAN & FAQ / Q&A LENGKAP */}
          {/* ========================================================================= */}
          {activeSubTab === 'qna' && (
            <div className="space-y-6 animate-fade-in">
              {/* Search & Category Filter Toolbar */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="relative flex-1 max-w-xl">
                    <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={qnaSearch}
                      onChange={(e) => setQnaSearch(e.target.value)}
                      placeholder="Cari pertanyaan, kata kunci (misal: 9-box, TNA, promosi, mutasi, atp, pdf)..."
                      className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-500 transition-all text-slate-800 placeholder-slate-400"
                    />
                    {qnaSearch && (
                      <button
                        onClick={() => setQnaSearch('')}
                        className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <div className="text-xs text-slate-500 font-medium">
                    Menampilkan <strong className="text-slate-900">{filteredQnA.length}</strong> dari {QNA_LIST.length} Tanya Jawab
                  </div>
                </div>

                {/* Category Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
                  {QNA_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedQnACategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                        selectedQnACategory === cat
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Accordion Q&A List */}
              <div className="space-y-3">
                {filteredQnA.length === 0 ? (
                  <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
                    <HelpCircle className="w-10 h-10 text-slate-300 mx-auto" />
                    <h3 className="text-sm font-bold text-slate-700">Tidak ada pertanyaan yang sesuai</h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      Coba gunakan kata kunci lain atau pilih kategori "Semua" untuk melihat seluruh panduan.
                    </p>
                    <button
                      onClick={() => { setQnaSearch(''); setSelectedQnACategory('Semua'); }}
                      className="px-3.5 py-2 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs hover:bg-blue-100 transition"
                    >
                      Reset Filter Pencarian
                    </button>
                  </div>
                ) : (
                  filteredQnA.map((item) => {
                    const isExpanded = !!expandedQnA[item.id];

                    return (
                      <div
                        key={item.id}
                        className={`rounded-2xl border transition-all duration-150 overflow-hidden bg-white ${
                          isExpanded ? 'border-blue-300 shadow-sm' : 'border-slate-200/80 hover:border-slate-300'
                        }`}
                      >
                        {/* Question Header */}
                        <button
                          onClick={() => toggleQnA(item.id)}
                          className="w-full p-4.5 text-left flex items-start justify-between gap-4 cursor-pointer hover:bg-slate-50/60 transition-colors"
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            <div className={`p-1.5 rounded-xl shrink-0 mt-0.5 ${
                              isExpanded ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                            }`}>
                              <HelpCircle className="w-4 h-4" />
                            </div>

                            <div className="min-w-0 space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-md">
                                  {item.category}
                                </span>
                              </div>
                              <h3 className="text-sm font-bold text-slate-900 leading-snug">
                                {item.question}
                              </h3>
                            </div>
                          </div>

                          <div className="p-1 rounded-lg text-slate-400 shrink-0">
                            {isExpanded ? <ChevronUp className="w-5 h-5 text-blue-600" /> : <ChevronDown className="w-5 h-5" />}
                          </div>
                        </button>

                        {/* Answer Expanded Body */}
                        {isExpanded && (
                          <div className="px-5 pb-5 pt-1 border-t border-slate-100 bg-slate-50/40 space-y-4 animate-fade-in">
                            <div className="p-4 rounded-xl bg-white border border-slate-200/70 text-xs text-slate-700 leading-relaxed space-y-3 shadow-2xs">
                              <p className="font-medium text-slate-800 leading-relaxed">{item.answer}</p>

                              {item.keyPoints && item.keyPoints.length > 0 && (
                                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                                  <span className="text-[11px] font-bold text-slate-900 block">Poin-Poin Penting &amp; Prosedur:</span>
                                  {item.keyPoints.map((pt, idx) => (
                                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                                      <span>{pt}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Footer Actions & Tags */}
                            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-[10px] text-slate-400 font-bold uppercase">Tags:</span>
                                {item.tags.map((t) => (
                                  <span
                                    key={t}
                                    onClick={() => setQnaSearch(t)}
                                    className="text-[10px] font-medium bg-slate-200/70 hover:bg-blue-100 hover:text-blue-700 text-slate-600 px-2 py-0.5 rounded-full cursor-pointer transition-colors"
                                  >
                                    #{t}
                                  </span>
                                ))}
                              </div>

                              {item.targetTab && (
                                <button
                                  onClick={() => handleNavigateToModule(item.targetTab!, item.targetSubTabKey, item.targetSubTab)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-2xs transition-all cursor-pointer"
                                >
                                  <span>🚀 Buka Modul Terkait</span>
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Enterprise HR Glossary Cheat Sheet */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-slate-900 border-b border-slate-100 pb-3">
                  <Info className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold">Glosarium Singkatan &amp; Istilah Metrik Kunci Enterprise</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <span className="text-xs font-bold text-blue-700 font-mono">TNA (Training Needs Analysis)</span>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Analisis kebutuhan pelatihan berdasarkan audit syarat pendidikan minimum, masa kerja, lisensi wajib, dan kurikulum standar jabatan.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <span className="text-xs font-bold text-amber-700 font-mono">9-Box Talent Matrix</span>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Matriks 3x3 yang memetakan kinerja masa lalu (Performance) vs potensi pertumbuhan masa depan (Potential) untuk kalibrasi suksesi.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <span className="text-xs font-bold text-rose-700 font-mono">OVI (Operational Vulnerability Index)</span>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Skor indeks kerentanan operasional (0-100%) yang mengukur tingkat keparahan risiko jika suatu posisi kritis kosong tanpa suksesor.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <span className="text-xs font-bold text-emerald-700 font-mono">IDP 70:20:10</span>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Rencana pengembangan individu yang membagi aksi menjadi 70% Proyek Nyata, 20% Mentoring Atasan, dan 10% Pelatihan Formal.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <span className="text-xs font-bold text-purple-700 font-mono">ATP (Annual Training Plan)</span>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Rencana jadwal dan anggaran pelatihan korporat selama 12 bulan yang mengonsolidasikan seluruh kebutuhan kompetensi departemen.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <span className="text-xs font-bold text-slate-800 font-mono">MPP 4-Pilar</span>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Perencanaan pemenuhan tenaga kerja melalui 4 pilar: Rekrutmen Eksternal (Buy), Mutasi Internal (Borrow), Upskilling (Build), dan Otomasi (Bot).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: SIMULASI ALUR KERJA / USE CASES END-TO-END */}
          {/* ========================================================================= */}
          {activeSubTab === 'usecases' && (
            <div className="space-y-6 animate-fade-in">
              {/* Header Selector Grid of 6 Use Cases */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Play className="w-4 h-4 text-emerald-600" />
                      <span>Pilih Skenario Simulasi Alur Kerja (End-to-End Walkthrough)</span>
                    </h2>
                    <p className="text-xs text-slate-500">
                      Pilih salah satu dari 6 skenario nyata di bawah ini untuk melihat panduan langkah demi langkah beserta halaman dan fungsinya.
                    </p>
                  </div>

                  <div className="relative max-w-xs w-full">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={useCaseSearch}
                      onChange={(e) => setUseCaseSearch(e.target.value)}
                      placeholder="Cari skenario..."
                      className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-white border border-slate-200 focus:outline-none focus:border-blue-500 text-slate-800"
                    />
                  </div>
                </div>

                {/* Scenario Cards Horizontal Selector */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredUseCases.map((uc) => {
                    const isSelected = uc.id === activeUseCase.id;

                    return (
                      <div
                        key={uc.id}
                        onClick={() => setSelectedUseCaseId(uc.id)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                          isSelected
                            ? 'bg-blue-50/80 border-blue-500 shadow-sm ring-1 ring-blue-500/20'
                            : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/60'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            uc.tagTone === 'rose' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                            uc.tagTone === 'emerald' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            uc.tagTone === 'amber' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            uc.tagTone === 'purple' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                            'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                            {uc.tag}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {uc.steps.length} Langkah
                          </span>
                        </div>

                        <h3 className="text-xs font-bold text-slate-900 line-clamp-2">
                          {uc.title}
                        </h3>

                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                          {uc.objective}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected Simulation Master Detail View */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-6">
                {/* Active Scenario Header Banner */}
                <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                        Skenario Simulasi Aktif
                      </span>
                      <h2 className="text-base font-bold text-white mt-0.5">
                        {activeUseCase.title}
                      </h2>
                    </div>

                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                      Total: {activeUseCase.steps.length} Langkah Alur Kerja
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="space-y-1">
                      <span className="text-[11px] text-slate-400 font-bold uppercase">Konteks &amp; Kasus Pemicu:</span>
                      <p className="text-slate-300 leading-relaxed text-[11px]">{activeUseCase.scenarioContext}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] text-slate-400 font-bold uppercase">Tujuan Utama (Objective):</span>
                      <p className="text-slate-300 leading-relaxed text-[11px]">{activeUseCase.objective}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] text-slate-400 font-bold uppercase">Hasil Akhir yang Diharapkan:</span>
                      <p className="text-emerald-400 font-medium leading-relaxed text-[11px]">{activeUseCase.successCriteria}</p>
                    </div>
                  </div>
                </div>

                {/* Interactive Workflow Stepper Progress Bar */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Tahapan Alur Kerja (Workflow Steps)
                    </span>
                    <span className="text-xs font-semibold text-blue-600">
                      Langkah {currentStepIndex + 1} dari {activeUseCase.steps.length}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                    {activeUseCase.steps.map((st, sIdx) => {
                      const isCurrent = sIdx === currentStepIndex;
                      const isPassed = sIdx < currentStepIndex;

                      return (
                        <button
                          key={st.stepNumber}
                          onClick={() => setActiveStepIndex((prev) => ({ ...prev, [activeUseCase.id]: sIdx }))}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer space-y-1 ${
                            isCurrent
                              ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-500/20'
                              : isPassed
                              ? 'bg-emerald-50/60 border-emerald-300'
                              : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              isCurrent ? 'bg-blue-600 text-white' : isPassed ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                            }`}>
                              {isPassed ? '✓' : st.stepNumber}
                            </span>

                            <span className="text-[9px] font-bold text-slate-400">Step {st.stepNumber}</span>
                          </div>

                          <h4 className="text-[11px] font-bold text-slate-900 line-clamp-1">
                            {st.title}
                          </h4>
                          <p className="text-[10px] text-slate-500 truncate">
                            {st.pageName.split('->')[0]}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Active Step Detailed Card */}
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-black bg-blue-600 text-white px-2.5 py-0.5 rounded-lg">
                          LANGKAH {currentStep.stepNumber}
                        </span>
                        <span className="text-xs font-bold text-slate-500">•</span>
                        <span className="text-xs font-bold text-blue-700">{currentStep.pageName}</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900">
                        {currentStep.title}
                      </h3>
                    </div>

                    {/* Direct Navigate Button */}
                    <button
                      onClick={() => handleNavigateToModule(currentStep.targetTab, currentStep.targetSubTabKey, currentStep.targetSubTab)}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer shrink-0"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>🚀 Buka Modul Ini Sekarang</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* Left: Purpose & Action Checklist */}
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-white border border-slate-200/80 space-y-2">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                          Fungsi &amp; Tujuan Halaman:
                        </span>
                        <p className="text-xs text-slate-700 leading-relaxed font-medium">
                          {currentStep.pageFunction}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-white border border-slate-200/80 space-y-3">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                          Instruksi Aksi yang Dilakukan:
                        </span>
                        <div className="space-y-2">
                          {currentStep.actions.map((act, aIdx) => (
                            <div key={aIdx} className="flex items-start gap-2.5 text-xs text-slate-700">
                              <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                                {aIdx + 1}
                              </span>
                              <span className="leading-relaxed">{act}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right: Sample Data & Expected Output */}
                    <div className="space-y-4">
                      {currentStep.sampleData && (
                        <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2">
                          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                            Contoh Data Input (Sample Input):
                          </span>
                          <div className="p-2.5 rounded-lg bg-slate-800 font-mono text-xs text-emerald-300 leading-relaxed">
                            {currentStep.sampleData}
                          </div>
                        </div>
                      )}

                      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
                        <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Hasil yang Diharapkan (Expected Result):</span>
                        </span>
                        <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                          {currentStep.expectedOutput}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Stepper Navigation Buttons */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-200/80">
                    <button
                      disabled={currentStepIndex === 0}
                      onClick={() => setActiveStepIndex((prev) => ({ ...prev, [activeUseCase.id]: Math.max(currentStepIndex - 1, 0) }))}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        currentStepIndex === 0
                          ? 'opacity-40 cursor-not-allowed bg-slate-200 text-slate-400'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      ← Langkah Sebelumnya
                    </button>

                    <button
                      disabled={currentStepIndex === activeUseCase.steps.length - 1}
                      onClick={() => setActiveStepIndex((prev) => ({ ...prev, [activeUseCase.id]: Math.min(currentStepIndex + 1, activeUseCase.steps.length - 1) }))}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        currentStepIndex === activeUseCase.steps.length - 1
                          ? 'opacity-40 cursor-not-allowed bg-slate-200 text-slate-400'
                          : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
                      }`}
                    >
                      Langkah Selanjutnya →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
