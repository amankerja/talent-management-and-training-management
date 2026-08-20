import { create } from 'zustand';
import { useSettingsStore } from './useSettingsStore';
import { 
  verifyLicenseOnline, 
  getOrCreateDeviceId, 
  LicenseVerificationResult, 
  LicenseServerStatus,
  ActivatedAccount,
  getSavedActivatedAccount,
  saveActivatedAccount,
  clearActivatedAccount
} from '../services/licenseService';

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
  deviceId: string;
  lastServerStatus: LicenseServerStatus | null;

  // Actions
  loginWithPin: (enteredPin: string) => boolean;
  loginAsLicensed: (data: { fullName: string; companyName: string; email: string; phone: string; licenseKey: string; password?: string }) => void;
  verifyAndLoginLicensed: (data: { fullName: string; companyName: string; email: string; phone: string; licenseKey: string; password?: string }) => Promise<LicenseVerificationResult>;
  loginAsDemo: (data: { fullName: string; companyName: string; email: string; phone: string }) => void;
  upgradeToLicensed: (data: { fullName: string; companyName: string; email: string; phone: string; licenseKey: string; password?: string } | string) => boolean;
  verifyAndUpgradeLicensed: (data: { fullName: string; companyName: string; email: string; phone: string; licenseKey: string; password?: string }) => Promise<LicenseVerificationResult>;
  logout: () => void;
  resetActivation: () => void;

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
    fullName: '',
    companyName: '',
    email: '',
    phone: ''
  },
  licenseKey: ''
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
    deviceId: getOrCreateDeviceId(),
    lastServerStatus: null,

    loginWithPin: (enteredPin: string) => {
      const savedAccount = getSavedActivatedAccount();
      if (!savedAccount) return false;

      const trimmedInput = enteredPin.trim();
      const storedPin = (savedAccount.pin || '').trim();

      // Check PIN match (or if no pin was set, allow opening)
      if (storedPin && trimmedInput !== storedPin) {
        return false;
      }

      const userProfile = {
        fullName: savedAccount.fullName,
        companyName: savedAccount.companyName,
        email: savedAccount.email,
        phone: savedAccount.phone
      };

      // Sync settings
      useSettingsStore.getState().setCompanyProfile({
        companyName: savedAccount.companyName,
        companyEmail: savedAccount.email,
        companyPhone: savedAccount.phone
      });
      useSettingsStore.getState().setLicenseInfo({
        licensedTo: savedAccount.companyName,
        licenseKey: savedAccount.licenseKey,
        licenseType: 'Commercial Enterprise (Royalty-Free Lifetime)',
        maxHeadcount: 'Unlimited Enterprise Headcount',
        isActivated: true
      });

      const next = {
        isAuthenticated: true,
        accountType: 'licensed' as AccountType,
        userProfile,
        licenseKey: savedAccount.licenseKey,
        deviceId: getOrCreateDeviceId(),
        lastServerStatus: 'SUCCESS' as LicenseServerStatus
      };
      set(next);
      persistSession(next);
      return true;
    },

    loginAsLicensed: ({ fullName, companyName, email, phone, licenseKey, password }) => {
      const userProfile = { fullName, companyName, email, phone };
      const cleanedKey = licenseKey.trim().toUpperCase();
      const pin = (password || '').trim();

      // Save activated account for quick PIN unlock
      saveActivatedAccount({
        companyName,
        fullName,
        email,
        phone,
        licenseKey: cleanedKey,
        pin,
        isActivated: true,
        activatedAt: new Date().toISOString()
      });

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
        licenseKey: cleanedKey,
        deviceId: getOrCreateDeviceId(),
        lastServerStatus: 'SUCCESS' as LicenseServerStatus
      };
      set(next);
      persistSession(next);
    },

    verifyAndLoginLicensed: async ({ fullName, companyName, email, phone, licenseKey, password }) => {
      const deviceId = getOrCreateDeviceId();
      const cleanedKey = licenseKey.trim().toUpperCase();
      const pin = (password || '').trim();

      const result = await verifyLicenseOnline({
        sn: cleanedKey,
        companyName,
        phone,
        email,
        password: pin,
        pin,
        deviceId
      });

      if (result.success) {
        const userProfile = { fullName, companyName, email, phone };

        // Save activated account for quick PIN unlock
        saveActivatedAccount({
          companyName,
          fullName,
          email,
          phone,
          licenseKey: cleanedKey,
          pin,
          isActivated: true,
          activatedAt: new Date().toISOString()
        });

        // Sync company profile & license info in SettingsStore
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
          licenseKey: cleanedKey,
          deviceId,
          lastServerStatus: result.status
        };
        set(next);
        persistSession(next);
      } else {
        set({ lastServerStatus: result.status });
      }

      return result;
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
        licenseKey: 'DEMO-TRIAL-EVALUATION-MODE',
        deviceId: getOrCreateDeviceId(),
        lastServerStatus: null
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
      let pin = '';

      if (typeof data === 'string') {
        licenseKey = data.trim().toUpperCase();
      } else {
        companyName = data.companyName.trim();
        fullName = data.fullName.trim();
        email = data.email.trim();
        phone = data.phone.trim();
        licenseKey = data.licenseKey.trim().toUpperCase();
        pin = (data.password || '').trim();
      }

      if (!licenseKey || licenseKey.length < 5) return false;

      const userProfile = { fullName, companyName, email, phone };

      saveActivatedAccount({
        companyName,
        fullName,
        email,
        phone,
        licenseKey,
        pin,
        isActivated: true,
        activatedAt: new Date().toISOString()
      });

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
        licenseKey,
        deviceId: getOrCreateDeviceId(),
        lastServerStatus: 'SUCCESS' as LicenseServerStatus
      };
      set(next);
      persistSession(next);
      return true;
    },

    verifyAndUpgradeLicensed: async ({ fullName, companyName, email, phone, licenseKey, password }) => {
      const deviceId = getOrCreateDeviceId();
      const cleanedKey = licenseKey.trim().toUpperCase();
      const pin = (password || '').trim();

      const result = await verifyLicenseOnline({
        sn: cleanedKey,
        companyName,
        phone,
        email,
        password: pin,
        pin,
        deviceId
      });

      if (result.success) {
        const userProfile = { fullName, companyName, email, phone };

        saveActivatedAccount({
          companyName,
          fullName,
          email,
          phone,
          licenseKey: cleanedKey,
          pin,
          isActivated: true,
          activatedAt: new Date().toISOString()
        });

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
          licenseKey: cleanedKey,
          deviceId,
          lastServerStatus: result.status
        };
        set(next);
        persistSession(next);
      } else {
        set({ lastServerStatus: result.status });
      }

      return result;
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

    resetActivation: () => {
      clearActivatedAccount();
      const next = {
        isAuthenticated: false,
        accountType: 'licensed' as AccountType,
        userProfile: DEFAULT_AUTH.userProfile,
        licenseKey: ''
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
