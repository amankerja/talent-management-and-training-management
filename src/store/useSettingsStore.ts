import { create } from 'zustand';

export interface CompanyProfile {
  companyName: string;
  companyLogo: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  industryType: string;
}

export interface LicenseInfo {
  licenseKey: string;
  licenseType: string;
  licensedTo: string;
  expiryDate: string;
  maxHeadcount: string;
  isActivated: boolean;
}

export type SettingsTabType = 'company' | 'master' | 'backup' | 'license' | 'ai';

interface SettingsState {
  // Company Profile
  companyProfile: CompanyProfile;
  
  // Dynamic Master References
  departments: string[];
  grades: string[];
  educationLevels: string[];
  jobLevels: string[];

  // License Info
  licenseInfo: LicenseInfo;

  // Gemini AI Config
  geminiApiKey: string;
  geminiModel: string;
  isCustomKeySet: boolean;

  // Modal Control
  isSettingsModalOpen: boolean;
  activeSettingsTab: SettingsTabType;

  // Actions
  setCompanyProfile: (profile: Partial<CompanyProfile>) => void;
  setLicenseInfo: (info: Partial<LicenseInfo>) => void;
  addDepartment: (dept: string) => void;
  removeDepartment: (dept: string) => void;
  addGrade: (grade: string) => void;
  removeGrade: (grade: string) => void;
  addEducationLevel: (edu: string) => void;
  removeEducationLevel: (edu: string) => void;
  addJobLevel: (level: string) => void;
  removeJobLevel: (level: string) => void;

  setGeminiApiKey: (key: string) => void;
  setGeminiModel: (model: string) => void;
  setIsSettingsModalOpen: (open: boolean, initialTab?: SettingsTabType) => void;
  setActiveSettingsTab: (tab: SettingsTabType) => void;
  clearApiKey: () => void;
}

const STORAGE_KEY_COMPANY = 'workforce_os_v2_company_profile';
const STORAGE_KEY_DEPTS = 'workforce_os_v2_master_depts';
const STORAGE_KEY_GRADES = 'workforce_os_v2_master_grades';
const STORAGE_KEY_EDU = 'workforce_os_v2_master_edu';
const STORAGE_KEY_LEVELS = 'workforce_os_v2_master_levels';
const STORAGE_KEY_LICENSE = 'workforce_os_v2_license_info';
const STORAGE_KEY_API_KEY = 'workforce_os_gemini_api_key';
const STORAGE_KEY_MODEL = 'workforce_os_gemini_model';

const DEFAULT_COMPANY_PROFILE: CompanyProfile = {
  companyName: 'PT Aman Kerja',
  companyLogo: '',
  companyAddress: 'Kawasan Industri Pertambangan & Energi Terpadu, Kalimantan Timur',
  companyPhone: '+62 812-3456-7890',
  companyEmail: 'corporate@amankerja.co.id',
  industryType: 'Pertambangan Minerba'
};

const DEFAULT_LICENSE_INFO: LicenseInfo = {
  licenseKey: 'WOS-ENT-2026-AK-9988-MINING',
  licenseType: 'Commercial Enterprise (Royalty-Free Lifetime)',
  licensedTo: 'PT Aman Kerja',
  expiryDate: 'Lifetime (Permanen)',
  maxHeadcount: 'Unlimited Enterprise Headcount',
  isActivated: true
};

const DEFAULT_DEPTS = [
  'Operations',
  'Engineering',
  'Human Resources',
  'Supply Chain',
  'Sales & Commercial',
  'Finance & IT'
];

const DEFAULT_GRADES = ['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8', 'G9', 'G10'];
const DEFAULT_EDU = ['SMA/SMK', 'D3', 'D4', 'S1', 'S2', 'S3'];
const DEFAULT_LEVELS = ['Director', 'Manager', 'Supervisor', 'Senior Staff', 'Staff', 'Admin', 'Operator'];

function loadJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

export const useSettingsStore = create<SettingsState>((set) => {
  const initialCompany = loadJson<CompanyProfile>(STORAGE_KEY_COMPANY, DEFAULT_COMPANY_PROFILE);
  const initialLicense = loadJson<LicenseInfo>(STORAGE_KEY_LICENSE, DEFAULT_LICENSE_INFO);
  const initialDepts = loadJson<string[]>(STORAGE_KEY_DEPTS, DEFAULT_DEPTS);
  const initialGrades = loadJson<string[]>(STORAGE_KEY_GRADES, DEFAULT_GRADES);
  const initialEdu = loadJson<string[]>(STORAGE_KEY_EDU, DEFAULT_EDU);
  const initialLevels = loadJson<string[]>(STORAGE_KEY_LEVELS, DEFAULT_LEVELS);
  const initialKey = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_API_KEY) || '' : '';
  const initialModel = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_MODEL) || 'gemini-1.5-flash' : 'gemini-1.5-flash';

  return {
    companyProfile: initialCompany,
    licenseInfo: initialLicense,
    departments: initialDepts,
    grades: initialGrades,
    educationLevels: initialEdu,
    jobLevels: initialLevels,
    geminiApiKey: initialKey,
    geminiModel: initialModel,
    isCustomKeySet: Boolean(initialKey.trim()),
    isSettingsModalOpen: false,
    activeSettingsTab: 'company',

    setCompanyProfile: (profile) => {
      set((state) => {
        const updated = { ...state.companyProfile, ...profile };
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY_COMPANY, JSON.stringify(updated));
        }
        return { companyProfile: updated };
      });
    },

    setLicenseInfo: (info) => {
      set((state) => {
        const updated = { ...state.licenseInfo, ...info };
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY_LICENSE, JSON.stringify(updated));
        }
        return { licenseInfo: updated };
      });
    },

    addDepartment: (dept) => {
      const trimmed = dept.trim();
      if (!trimmed) return;
      set((state) => {
        if (state.departments.some((d) => d.toLowerCase() === trimmed.toLowerCase())) return state;
        const updated = [...state.departments, trimmed];
        if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY_DEPTS, JSON.stringify(updated));
        return { departments: updated };
      });
    },

    removeDepartment: (dept) => {
      set((state) => {
        const updated = state.departments.filter((d) => d !== dept);
        if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY_DEPTS, JSON.stringify(updated));
        return { departments: updated };
      });
    },

    addGrade: (grade) => {
      const trimmed = grade.trim().toUpperCase();
      if (!trimmed) return;
      set((state) => {
        if (state.grades.includes(trimmed)) return state;
        const updated = [...state.grades, trimmed];
        if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY_GRADES, JSON.stringify(updated));
        return { grades: updated };
      });
    },

    removeGrade: (grade) => {
      set((state) => {
        const updated = state.grades.filter((g) => g !== grade);
        if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY_GRADES, JSON.stringify(updated));
        return { grades: updated };
      });
    },

    addEducationLevel: (edu) => {
      const trimmed = edu.trim();
      if (!trimmed) return;
      set((state) => {
        if (state.educationLevels.some((e) => e.toLowerCase() === trimmed.toLowerCase())) return state;
        const updated = [...state.educationLevels, trimmed];
        if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY_EDU, JSON.stringify(updated));
        return { educationLevels: updated };
      });
    },

    removeEducationLevel: (edu) => {
      set((state) => {
        const updated = state.educationLevels.filter((e) => e !== edu);
        if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY_EDU, JSON.stringify(updated));
        return { educationLevels: updated };
      });
    },

    addJobLevel: (level) => {
      const trimmed = level.trim();
      if (!trimmed) return;
      set((state) => {
        if (state.jobLevels.some((l) => l.toLowerCase() === trimmed.toLowerCase())) return state;
        const updated = [...state.jobLevels, trimmed];
        if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY_LEVELS, JSON.stringify(updated));
        return { jobLevels: updated };
      });
    },

    removeJobLevel: (level) => {
      set((state) => {
        const updated = state.jobLevels.filter((l) => l !== level);
        if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY_LEVELS, JSON.stringify(updated));
        return { jobLevels: updated };
      });
    },

    setGeminiApiKey: (key: string) => {
      const trimmed = key.trim();
      if (typeof window !== 'undefined') {
        if (trimmed) {
          localStorage.setItem(STORAGE_KEY_API_KEY, trimmed);
        } else {
          localStorage.removeItem(STORAGE_KEY_API_KEY);
        }
      }
      set({ geminiApiKey: trimmed, isCustomKeySet: Boolean(trimmed) });
    },

    setGeminiModel: (model: string) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_MODEL, model);
      }
      set({ geminiModel: model });
    },

    setIsSettingsModalOpen: (open: boolean, initialTab: SettingsTabType = 'company') => 
      set({ isSettingsModalOpen: open, activeSettingsTab: initialTab }),

    setActiveSettingsTab: (tab: SettingsTabType) => set({ activeSettingsTab: tab }),

    clearApiKey: () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY_API_KEY);
      }
      set({ geminiApiKey: '', isCustomKeySet: false });
    }
  };
});
