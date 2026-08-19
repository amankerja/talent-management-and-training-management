import { create } from 'zustand';
import { useSettingsStore } from './useSettingsStore';

export type AccountType = 'licensed' | 'demo';

export interface UserProfile {
  fullName: string;
  companyName: string;
  email: string;
  phone: string;
}

interface AuthState {
  isAuthenticated: boolean;
  accountType: AccountType;
  userProfile: UserProfile;
  licenseKey: string;

  // Actions
  loginAsLicensed: (data: { fullName: string; companyName: string; email: string; phone: string; licenseKey: string }) => void;
  loginAsDemo: (data: { fullName: string; companyName: string; email: string; phone: string }) => void;
  upgradeToLicensed: (data: { fullName: string; companyName: string; email: string; phone: string; licenseKey: string } | string) => boolean;
  logout: () => void;

  // Helper checks
  isDemo: () => boolean;
  isReadOnlyFeature: (featureName: 'matrix' | 'org_chart' | 'employee_360' | 'career_ladder') => boolean;
  canCreateData: (currentCount: number) => { allowed: boolean; reason?: string };
}

const STORAGE_KEY_AUTH = 'workforce_os_v2_auth_session';

const DEFAULT_AUTH = {
  isAuthenticated: false,
  accountType: 'licensed' as AccountType,
  userProfile: {
    fullName: 'Ahmad Faqih Didin',
    companyName: 'PT Aman Kerja',
    email: 'faqih@amankerja.co.id',
    phone: '+62 812-3456-7890'
  },
  licenseKey: 'WOS-ENT-2026-AK-9988-MINING'
};

function loadStoredAuth() {
  if (typeof window === 'undefined') return DEFAULT_AUTH;
  try {
    const saved = localStorage.getItem(STORAGE_KEY_AUTH);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error reading auth storage', e);
  }
  return DEFAULT_AUTH;
}

export const useAuthStore = create<AuthState>((set, get) => {
  const initial = loadStoredAuth();

  const persistSession = (state: Partial<AuthState>) => {
    if (typeof window !== 'undefined') {
      try {
        const full = {
          isAuthenticated: state.isAuthenticated ?? get().isAuthenticated,
          accountType: state.accountType ?? get().accountType,
          userProfile: state.userProfile ?? get().userProfile,
          licenseKey: state.licenseKey ?? get().licenseKey
        };
        localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(full));
      } catch (err) {
        console.error('Error saving auth session', err);
      }
    }
  };

  return {
    isAuthenticated: initial.isAuthenticated,
    accountType: initial.accountType || 'licensed',
    userProfile: initial.userProfile || DEFAULT_AUTH.userProfile,
    licenseKey: initial.licenseKey || DEFAULT_AUTH.licenseKey,

    loginAsLicensed: ({ fullName, companyName, email, phone, licenseKey }) => {
      const userProfile = { fullName, companyName, email, phone };
      const cleanedKey = licenseKey.trim().toUpperCase();

      // Sync company profile in SettingsStore
      useSettingsStore.getState().setCompanyProfile({
        companyName,
        companyEmail: email,
        companyPhone: phone
      });
      useSettingsStore.getState().setLicenseInfo({
        licensedTo: companyName,
        licenseKey: cleanedKey,
        licenseType: 'Commercial Enterprise (Royalty-Free Lifetime)',
        maxHeadcount: 'Unlimited Enterprise Headcount',
        isActivated: true
      });

      const next = {
        isAuthenticated: true,
        accountType: 'licensed' as AccountType,
        userProfile,
        licenseKey: cleanedKey
      };
      set(next);
      persistSession(next);
    },

    loginAsDemo: ({ fullName, companyName, email, phone }) => {
      const userProfile = { fullName, companyName, email, phone };

      // Sync company profile in SettingsStore
      useSettingsStore.getState().setCompanyProfile({
        companyName: companyName || 'PT Aman Kerja (Demo Trial)',
        companyEmail: email,
        companyPhone: phone
      });
      useSettingsStore.getState().setLicenseInfo({
        licensedTo: companyName || 'Akun Demo / Trial',
        licenseKey: 'DEMO-TRIAL-EVALUATION-MODE',
        licenseType: 'Demo Evaluation (Maks 5 Data / Tabel & Read-Only)',
        maxHeadcount: 'Maksimal 5 Karyawan (Demo Quota)',
        isActivated: false
      });

      const next = {
        isAuthenticated: true,
        accountType: 'demo' as AccountType,
        userProfile,
        licenseKey: 'DEMO-TRIAL-EVALUATION-MODE'
      };
      set(next);
      persistSession(next);
    },

    upgradeToLicensed: (data) => {
      let companyName = get().userProfile.companyName;
      let fullName = get().userProfile.fullName;
      let email = get().userProfile.email;
      let phone = get().userProfile.phone;
      let licenseKey = '';

      if (typeof data === 'string') {
        licenseKey = data.trim().toUpperCase();
      } else {
        companyName = data.companyName.trim();
        fullName = data.fullName.trim();
        email = data.email.trim();
        phone = data.phone.trim();
        licenseKey = data.licenseKey.trim().toUpperCase();
      }

      if (!licenseKey || licenseKey.length < 5) return false;

      const userProfile = { fullName, companyName, email, phone };

      useSettingsStore.getState().setCompanyProfile({
        companyName,
        companyEmail: email,
        companyPhone: phone
      });

      useSettingsStore.getState().setLicenseInfo({
        licensedTo: companyName,
        licenseKey,
        licenseType: 'Commercial Enterprise (Royalty-Free Lifetime)',
        maxHeadcount: 'Unlimited Enterprise Headcount',
        isActivated: true
      });

      const next = {
        isAuthenticated: true,
        accountType: 'licensed' as AccountType,
        userProfile,
        licenseKey
      };
      set(next);
      persistSession(next);
      return true;
    },

    logout: () => {
      const next = {
        isAuthenticated: false
      };
      set(next);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY_AUTH);
      }
    },

    isDemo: () => get().accountType === 'demo',

    isReadOnlyFeature: (featureName) => {
      if (get().accountType !== 'demo') return false;
      const readOnlyFeatures = ['matrix', 'org_chart', 'employee_360', 'career_ladder'];
      return readOnlyFeatures.includes(featureName);
    },

    canCreateData: (currentCount: number) => {
      if (get().accountType === 'licensed') {
        return { allowed: true };
      }
      // Demo limitation: max 5 items per table/entity
      if (currentCount >= 5) {
        return {
          allowed: false,
          reason: 'Batas Kuota Demo Terpenuhi: Akun demo dibatasi maksimal 5 data per tabel. Silakan aktivasi lisensi enterprise untuk akses tanpa batas.'
        };
      }
      return { allowed: true };
    }
  };
});
