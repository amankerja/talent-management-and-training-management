/**
 * License Service & Online Verification
 * Connects to Google Apps Script License Server for Talent & Training Management
 * Server Endpoint: https://script.google.com/macros/s/AKfycby8xke5hsYB_qyM9B1aCmFFNkxpGzzeLecbAPb1aKgKqreFo3c4ohf9YksTUldSJwVbUg/exec
 * Target App Handler: talenttraining (handleTalent_Training)
 */

export const LICENSE_SERVER_URL =
  'https://script.google.com/macros/s/AKfycby8xke5hsYB_qyM9B1aCmFFNkxpGzzeLecbAPb1aKgKqreFo3c4ohf9YksTUldSJwVbUg/exec';

export const LICENSE_APP_TYPE = 'talenttraining';

const STORAGE_KEY_DEVICE_ID = 'workforce_os_device_id';
const STORAGE_KEY_LICENSE_VERIFY = 'workforce_os_license_last_verification';
export const STORAGE_KEY_ACTIVATED_ACCOUNT = 'workforce_os_activated_account';

export type LicenseServerStatus =
  | 'ACTIVATED'
  | 'SUCCESS'
  | 'ALREADY_USED'
  | 'INACTIVE'
  | 'INVALID'
  | 'INVALID_PASSWORD'
  | 'WRONG_PIN'
  | 'INVALID_PARAMETER'
  | 'ERROR_SHEET_NOT_FOUND'
  | 'ERROR_MISSING_APP_PARAMETER'
  | 'ERROR_UNKNOWN_APP'
  | 'NETWORK_ERROR'
  | 'TIMEOUT';

export interface LicenseVerifyParams {
  sn: string;
  companyName: string;
  phone: string;
  email: string;
  password?: string;
  pin?: string;
  deviceId?: string;
}

export interface ActivatedAccount {
  companyName: string;
  fullName: string;
  email: string;
  phone: string;
  licenseKey: string;
  pin: string;
  isActivated: boolean;
  activatedAt: string;
}

export interface LicenseVerificationResult {
  success: boolean;
  status: LicenseServerStatus;
  message: string;
  deviceId: string;
  rawResponse?: string;
  verifiedAt?: string;
}

/**
 * Retrieves saved activated account for quick PIN unlock
 */
export function getSavedActivatedAccount(): ActivatedAccount | null {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem(STORAGE_KEY_ACTIVATED_ACCOUNT);
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    if (parsed && parsed.isActivated && parsed.licenseKey) {
      return parsed;
    }
  } catch (e) {
    console.error('Error reading activated account', e);
  }
  return null;
}

/**
 * Saves activated account to local storage
 */
export function saveActivatedAccount(data: ActivatedAccount): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVATED_ACCOUNT, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving activated account', e);
  }
}

/**
 * Clears activated account (e.g. for complete license reset)
 */
export function clearActivatedAccount(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY_ACTIVATED_ACCOUNT);
  } catch (e) {
    console.error('Error clearing activated account', e);
  }
}

/**
 * Retrieves existing device ID or creates and stores a persistent hardware/browser UUID
 */
export function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') {
    return 'DEV-WOS-SERVER-NODE';
  }

  try {
    const existing = localStorage.getItem(STORAGE_KEY_DEVICE_ID);
    if (existing && existing.trim().length > 0) {
      return existing.trim();
    }

    // Generate unique robust device identifier
    const randomHex = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1).toUpperCase();
    const timestampPart = Date.now().toString(36).toUpperCase();
    const generated = `DEV-WOS-${timestampPart}-${randomHex()}-${randomHex()}`;

    localStorage.setItem(STORAGE_KEY_DEVICE_ID, generated);
    return generated;
  } catch {
    return 'DEV-WOS-FALLBACK-001';
  }
}

/**
 * Parse raw string returned from Google Apps Script endpoint
 */
function parseServerResponse(raw: string, deviceId: string): LicenseVerificationResult {
  const cleanRaw = raw.trim();
  const verifiedAt = new Date().toISOString();

  switch (cleanRaw) {
    case 'ACTIVATED':
      return {
        success: true,
        status: 'ACTIVATED',
        message: 'Lisensi resmi berhasil diaktivasi untuk perangkat ini.',
        deviceId,
        rawResponse: cleanRaw,
        verifiedAt
      };

    case 'SUCCESS':
      return {
        success: true,
        status: 'SUCCESS',
        message: 'Lisensi resmi valid dan terverifikasi untuk perangkat ini.',
        deviceId,
        rawResponse: cleanRaw,
        verifiedAt
      };

    case 'ALREADY_USED':
      return {
        success: false,
        status: 'ALREADY_USED',
        message: 'Kunci serial lisensi ini sudah terdaftar & terikat pada perangkat lain. Silakan hubungi admin / support untuk pemindahan lisensi.',
        deviceId,
        rawResponse: cleanRaw,
        verifiedAt
      };

    case 'INACTIVE':
      return {
        success: false,
        status: 'INACTIVE',
        message: 'Status lisensi ini sedang Tidak Aktif (Inactive / Expired). Silakan hubungi administrator.',
        deviceId,
        rawResponse: cleanRaw,
        verifiedAt
      };

    case 'INVALID':
      return {
        success: false,
        status: 'INVALID',
        message: 'Kunci serial lisensi tidak ditemukan pada server database. Pastikan kode lisensi dimasukkan dengan benar.',
        deviceId,
        rawResponse: cleanRaw,
        verifiedAt
      };

    case 'INVALID_PASSWORD':
    case 'WRONG_PIN':
    case 'WRONG_PASSWORD':
      return {
        success: false,
        status: 'INVALID_PASSWORD',
        message: 'Password / PIN Akses yang Anda masukkan tidak sesuai dengan database server.',
        deviceId,
        rawResponse: cleanRaw,
        verifiedAt
      };

    case 'INVALID_PARAMETER':
      return {
        success: false,
        status: 'INVALID_PARAMETER',
        message: 'Parameter serial (SN) atau ID Perangkat tidak lengkap.',
        deviceId,
        rawResponse: cleanRaw,
        verifiedAt
      };

    case 'ERROR_SHEET_NOT_FOUND':
      return {
        success: false,
        status: 'ERROR_SHEET_NOT_FOUND',
        message: 'Database lisensi di server (Sheet TALENT_TRAINING) tidak ditemukan.',
        deviceId,
        rawResponse: cleanRaw,
        verifiedAt
      };

    case 'ERROR_MISSING_APP_PARAMETER':
    case 'ERROR_UNKNOWN_APP':
      return {
        success: false,
        status: cleanRaw as LicenseServerStatus,
        message: `Konfigurasi aplikasi di server lisensi tidak cocok (${cleanRaw}).`,
        deviceId,
        rawResponse: cleanRaw,
        verifiedAt
      };

    default:
      return {
        success: false,
        status: 'INVALID',
        message: `Respon server tidak dikenali: "${cleanRaw}". Pastikan serial lisensi valid.`,
        deviceId,
        rawResponse: cleanRaw,
        verifiedAt
      };
  }
}

/**
 * Verifies license key with the central server
 */
export async function verifyLicenseOnline(params: LicenseVerifyParams): Promise<LicenseVerificationResult> {
  const deviceId = params.deviceId || getOrCreateDeviceId();
  const sn = params.sn ? params.sn.trim() : '';
  const companyName = params.companyName ? params.companyName.trim() : '';
  const phone = params.phone ? params.phone.trim() : '';
  const email = params.email ? params.email.trim() : '';
  const password = (params.password || params.pin || '').trim();

  if (!sn) {
    return {
      success: false,
      status: 'INVALID_PARAMETER',
      message: 'Kunci serial lisensi wajib diisi.',
      deviceId
    };
  }

  const queryParams = new URLSearchParams({
    app: LICENSE_APP_TYPE,
    sn: sn,
    deviceId: deviceId,
    nama_perusahaan: companyName,
    no_telepon: phone,
    email: email,
    password: password,
    pin: password
  });

  const targetUrl = `${LICENSE_SERVER_URL}?${queryParams.toString()}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    const response = await fetch(targetUrl, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        success: false,
        status: 'NETWORK_ERROR',
        message: `Gagal terhubung ke server lisensi (HTTP ${response.status}). Periksa koneksi internet Anda.`,
        deviceId
      };
    }

    const textOutput = await response.text();
    const result = parseServerResponse(textOutput, deviceId);

    // If verification succeeded, save timestamp to localStorage
    if (result.success && typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          STORAGE_KEY_LICENSE_VERIFY,
          JSON.stringify({
            sn,
            deviceId,
            companyName,
            status: result.status,
            verifiedAt: result.verifiedAt
          })
        );
      } catch (err) {
        console.error('Failed to save license verification record', err);
      }
    }

    return result;
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      return {
        success: false,
        status: 'TIMEOUT',
        message: 'Koneksi ke server lisensi melebihi batas waktu (Timeout). Pastikan koneksi internet aktif & stabil.',
        deviceId
      };
    }

    return {
      success: false,
      status: 'NETWORK_ERROR',
      message: `Terjadi kendala saat menghubungi server lisensi: ${error?.message || 'Koneksi gagal'}`,
      deviceId
    };
  }
}

/**
 * Get last local verification record
 */
export function getLastVerificationRecord(): {
  sn?: string;
  deviceId?: string;
  companyName?: string;
  status?: string;
  verifiedAt?: string;
} | null {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem(STORAGE_KEY_LICENSE_VERIFY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

/**
 * Records demo access user information to the central server
 */
export async function recordDemoAccessOnline(params: {
  companyName: string;
  fullName: string;
  phone: string;
  email: string;
  password?: string;
  pin?: string;
  deviceId?: string;
}): Promise<{ success: boolean; message: string }> {
  const deviceId = params.deviceId || getOrCreateDeviceId();
  const companyName = params.companyName ? params.companyName.trim() : '';
  const fullName = params.fullName ? params.fullName.trim() : '';
  const phone = params.phone ? params.phone.trim() : '';
  const email = params.email ? params.email.trim() : '';
  const password = (params.password || params.pin || 'DEMO').trim();

  const queryParams = new URLSearchParams({
    app: LICENSE_APP_TYPE,
    sn: 'DEMO-TRIAL-EVALUATION-MODE',
    deviceId: deviceId,
    nama_perusahaan: companyName,
    nama_pic: fullName,
    no_telepon: phone,
    email: email,
    password: password,
    pin: password,
    is_demo: 'true'
  });

  const targetUrl = `${LICENSE_SERVER_URL}?${queryParams.toString()}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(targetUrl, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      return { success: true, message: 'Data sesi demo berhasil dicatat ke server.' };
    }
    return { success: false, message: `Server mengembalikan status HTTP ${response.status}.` };
  } catch (err: any) {
    console.warn('Gagal mencatat data demo ke server (aplikasi tetap mengizinkan sesi lokal):', err?.message);
    return { success: false, message: err?.message || 'Koneksi gagal' };
  }
}
