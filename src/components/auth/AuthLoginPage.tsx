import React, { useState, useEffect } from 'react';
import { 
  Key, 
  Sparkles, 
  Building2, 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  ArrowRight,
  ShieldCheck, 
  AlertCircle,
  Copy, 
  Check,
  RotateCcw,
  LogIn,
  MessageCircle,
  Globe,
  Headphones
} from 'lucide-react';
import { useAuthStore, AccountType } from '../../store/useAuthStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useToastStore } from '../../store/useToastStore';
import { 
  getOrCreateDeviceId, 
  getSavedActivatedAccount,
  ActivatedAccount 
} from '../../services/licenseService';
import './AuthLoginPage.css';

export const AuthLoginPage: React.FC = () => {
  const { 
    verifyAndLoginLicensed, 
    loginWithPin, 
    loginAsDemo, 
    deviceId: storeDeviceId 
  } = useAuthStore();
  const companyProfile = useSettingsStore((s) => s.companyProfile);
  const addToast = useToastStore((s) => s.addToast);

  const deviceId = storeDeviceId || getOrCreateDeviceId();
  const [copiedDevId, setCopiedDevId] = useState(false);

  // Check if this device already has an activated license
  const [savedAccount, setSavedAccount] = useState<ActivatedAccount | null>(null);

  // View state: 'pin_login' (Returning user with saved license), 'overview' (2-button choice), 'form' (Credential input)
  const [viewState, setViewState] = useState<'pin_login' | 'overview' | 'form'>('overview');
  const [activeMode, setActiveMode] = useState<AccountType>('licensed');

  // Form inputs (ALL START EMPTY AND ARE MANDATORY)
  const [companyName, setCompanyName] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [licenseKey, setLicenseKey] = useState('');
  const [password, setPassword] = useState('');
  const [quickPin, setQuickPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatusText, setSubmitStatusText] = useState('');

  // Check saved account on mount
  useEffect(() => {
    const existing = getSavedActivatedAccount();
    if (existing && existing.isActivated && existing.licenseKey) {
      setSavedAccount(existing);
      setViewState('pin_login');
    } else {
      setViewState('overview');
    }
  }, []);

  const handleCopyDeviceId = () => {
    navigator.clipboard.writeText(deviceId);
    setCopiedDevId(true);
    addToast('ID Perangkat Disalin', `Device ID "${deviceId}" berhasil disalin ke clipboard.`, 'info');
    setTimeout(() => setCopiedDevId(false), 2000);
  };

  // 1. PIN-Only Login Handler (Untuk pengguna yang sudah pernah aktivasi di perangkat ini)
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!quickPin.trim()) {
      setErrorMsg('Silakan masukkan Password / PIN Akses Anda.');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatusText('Memverifikasi...');

    setTimeout(() => {
      const success = loginWithPin(quickPin.trim());
      if (success) {
        addToast(
          'Akses Dibuka',
          `Selamat datang kembali ${savedAccount?.fullName || ''}.`,
          'success'
        );
      } else {
        setErrorMsg('Password / PIN Akses salah. Silakan coba lagi.');
        addToast('Akses Ditolak', 'Password / PIN yang dimasukkan tidak sesuai.', 'error');
      }
      setIsSubmitting(false);
      setSubmitStatusText('');
    }, 300);
  };

  // Switch to clean activation form
  const handleOpenActivationForm = () => {
    setActiveMode('licensed');
    setErrorMsg('');
    setCompanyName('');
    setFullName('');
    setEmail('');
    setPhone('');
    setLicenseKey('');
    setPassword('');
    setViewState('form');
  };

  // Switch to demo form
  const handleOpenDemoForm = () => {
    setActiveMode('demo');
    setErrorMsg('');
    setCompanyName('');
    setFullName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setViewState('form');
  };

  // 2. Full Form Submit Handler (Aktivasi Baru atau Masuk Demo)
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Validasi semua kolom wajib diisi
    if (!companyName.trim()) {
      setErrorMsg('Nama Perusahaan / Organisasi wajib diisi.');
      return;
    }
    if (!fullName.trim()) {
      setErrorMsg('Nama Lengkap PIC wajib diisi.');
      return;
    }
    if (!email.trim()) {
      setErrorMsg('Email Resmi wajib diisi.');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('Nomor HP / WhatsApp wajib diisi.');
      return;
    }

    if (activeMode === 'licensed') {
      if (!licenseKey.trim()) {
        setErrorMsg('Nomor Serial Lisensi wajib diisi.');
        return;
      }
      if (!password.trim()) {
        setErrorMsg('Password / PIN Akses wajib diisi.');
        return;
      }

      setIsSubmitting(true);
      setSubmitStatusText('Menghubungi Server...');

      try {
        const result = await verifyAndLoginLicensed({
          companyName: companyName.trim(),
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          licenseKey: licenseKey.trim(),
          password: password.trim()
        });

        if (result.success) {
          addToast(
            'Aktivasi Lisensi Berhasil!',
            result.message || `Selamat datang ${fullName}. Akses Enterprise tanpa batas telah aktif.`,
            'success'
          );
        } else {
          setErrorMsg(result.message);
          addToast('Verifikasi Lisensi Gagal', result.message, 'error');
        }
      } catch (err: any) {
        const msg = `Terjadi kesalahan saat memverifikasi ke server: ${err?.message || 'Koneksi gagal'}`;
        setErrorMsg(msg);
        addToast('Kesalahan Koneksi', msg, 'error');
      } finally {
        setIsSubmitting(false);
        setSubmitStatusText('');
      }
    } else {
      // Demo Mode
      setIsSubmitting(true);
      setSubmitStatusText('Menyiapkan Sesi Uji Coba Demo...');

      setTimeout(() => {
        loginAsDemo({
          companyName: companyName.trim(),
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim()
        });
        addToast(
          'Masuk Mode Demo / Evaluasi',
          `Selamat datang di sesi uji coba ${fullName}. Kuota data dibatasi maksimal 5 data per tabel.`,
          'info'
        );
        setIsSubmitting(false);
        setSubmitStatusText('');
      }, 400);
    }
  };

  return (
    <div className="raters-login-root">
      {/* Background Soft Ambient Elements */}
      <div className="raters-bg-ambient" aria-hidden="true">
        <div className="raters-ambient-1" />
        <div className="raters-ambient-2" />
      </div>

      {/* Main Raters Floating Card */}
      <main className="raters-card">
        {/* ================= LEFT COLUMN ================= */}
        <section className="raters-left">
          {/* Brand Logo */}
          <div className="raters-brand">
            <img
              src={companyProfile?.companyLogo || '/favicon.png'}
              alt="Logo"
              style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'contain', background: '#ffffff', padding: 2, border: '1px solid rgba(226, 232, 240, 0.8)' }}
            />
            <span className="raters-brand-text">{savedAccount?.companyName || companyProfile?.companyName || 'Talent & Training OS'}</span>
          </div>

          {/* ========================================================================= */}
          {/* TAMPILAN 1: QUICK PIN LOGIN (JIKA PERANGKAT SUDAH AKTIF LISENSI)          */}
          {/* ========================================================================= */}
          {viewState === 'pin_login' && savedAccount ? (
            <div className="raters-center">
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '9999px',
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                color: '#065f46',
                fontSize: '11px',
                fontWeight: 700,
                marginBottom: '10px'
              }}>
                <ShieldCheck style={{ width: 14, height: 14, color: '#059669' }} />
                <span>Lisensi Terdaftar di Perangkat Ini</span>
              </div>

              <h1 className="raters-title" style={{ fontSize: '24px', marginBottom: '4px' }}>
                Selamat Datang Kembali
              </h1>
              <p className="raters-subtitle" style={{ marginBottom: '20px' }}>
                Masukkan Password / PIN Akses untuk membuka aplikasi
              </p>

              {/* Identity Card Badge */}
              <div style={{
                width: '100%',
                maxWidth: '380px',
                padding: '14px 16px',
                borderRadius: '16px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                marginBottom: '18px',
                textAlign: 'left'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: '#2563eb',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '15px'
                  }}>
                    {savedAccount.fullName ? savedAccount.fullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {savedAccount.fullName}
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                      {savedAccount.companyName} • <span style={{ color: '#0284c7' }}>{savedAccount.email}</span>
                    </div>
                  </div>
                </div>
              </div>

              {errorMsg && (
                <div className="raters-error-box" style={{ width: '100%', maxWidth: 380, marginBottom: 12 }}>
                  <AlertCircle style={{ width: 14, height: 14, flexShrink: 0 }} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* PIN / Password Form */}
              <form onSubmit={handlePinSubmit} style={{ width: '100%', maxWidth: '380px' }}>
                <div className="raters-input-group">
                  <label htmlFor="quickPin">
                    <span>Password / PIN Akses *</span>
                  </label>
                  <div className="raters-input-wrapper">
                    <Lock className="raters-input-icon" style={{ width: 15, height: 15 }} />
                    <input
                      id="quickPin"
                      type={showPassword ? 'text' : 'password'}
                      autoFocus
                      required
                      value={quickPin}
                      onChange={(e) => setQuickPin(e.target.value)}
                      placeholder="Masukkan PIN / Password"
                      className="raters-input"
                      style={{ paddingRight: 38 }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="raters-pass-toggle"
                    >
                      {showPassword ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="raters-btn raters-btn-blue"
                  style={{ marginTop: '10px', width: '100%' }}
                >
                  <LogIn style={{ width: 16, height: 16 }} />
                  <span>{isSubmitting ? submitStatusText : 'Buka Akses Sistem'}</span>
                </button>
              </form>

              {/* Actions below PIN login */}
              <div style={{
                marginTop: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px',
                fontSize: '11.5px'
              }}>
                <button
                  type="button"
                  onClick={handleOpenActivationForm}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#2563eb',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <RotateCcw style={{ width: 13, height: 13 }} />
                  <span>Ganti Akun / Lisensi Lain</span>
                </button>

                <span style={{ color: '#cbd5e1' }}>•</span>

                <button
                  type="button"
                  onClick={handleOpenDemoForm}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Masuk Mode Demo
                </button>
              </div>
            </div>
          ) : viewState === 'overview' ? (
            /* ========================================================================= */
            /* TAMPILAN 2: OVERVIEW PILIHAN PERTAMA KALI (LISENSI ATAU DEMO)             */
            /* ========================================================================= */
            <div className="raters-center">
              <h1 className="raters-title">Talent &amp; Training Management</h1>
              <p className="raters-subtitle">Enterprise strategic HR, talent architecture &amp; succession network</p>

              {/* Action Buttons Stack (2 Tombol Utama) */}
              <div className="raters-buttons-stack" style={{ gap: '16px' }}>
                {/* 1. Tombol: Sudah Punya Lisensi */}
                <button
                  type="button"
                  onClick={handleOpenActivationForm}
                  disabled={isSubmitting}
                  className="raters-btn raters-btn-blue"
                  title="Aktivasi menggunakan nomor serial lisensi resmi"
                >
                  <Key style={{ width: 17, height: 17 }} />
                  <span>Sudah Punya Lisensi</span>
                </button>

                {/* 2. Tombol: Demo Aplikasi */}
                <button
                  type="button"
                  onClick={handleOpenDemoForm}
                  disabled={isSubmitting}
                  className="raters-btn raters-btn-red"
                  title="Masuk mode demo evaluasi"
                >
                  <Sparkles style={{ width: 17, height: 17 }} />
                  <span>Demo Aplikasi</span>
                </button>
              </div>

              <p style={{
                fontSize: '11.5px',
                color: '#64748b',
                marginTop: '22px',
                lineHeight: 1.5,
                maxWidth: '320px'
              }}>
                Mode <strong>Demo Aplikasi</strong> Kuota data dibatasi maksimal 5 per tabel &amp; Read-Only.
              </p>
            </div>
          ) : (
            /* ========================================================================= */
            /* TAMPILAN 3: DETAILED FORM (SELURUH ISIAN KOSONG DAN WAJIB DIISI)          */
            /* ========================================================================= */
            <div className="raters-center">
              {/* Form Navigation Header */}
              <div className="raters-form-header">
                <button
                  type="button"
                  onClick={() => {
                    if (savedAccount) {
                      setViewState('pin_login');
                    } else {
                      setViewState('overview');
                    }
                  }}
                  className="raters-back-btn"
                >
                  <ArrowLeft style={{ width: 14, height: 14 }} />
                  <span>Kembali</span>
                </button>

                <div className="raters-mode-tabs">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveMode('licensed');
                      setErrorMsg('');
                    }}
                    className={`raters-mode-tab ${activeMode === 'licensed' ? 'active' : ''}`}
                  >
                    Sudah Punya Lisensi
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveMode('demo');
                      setErrorMsg('');
                    }}
                    className={`raters-mode-tab ${activeMode === 'demo' ? 'active' : ''}`}
                  >
                    Demo Aplikasi
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div className="raters-error-box" style={{ width: '100%', maxWidth: 380, marginBottom: 10 }}>
                  <AlertCircle style={{ width: 14, height: 14, flexShrink: 0 }} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Form Input Fields (Semua Kosong & Wajib Diisi) */}
              <form className="raters-detailed-form" onSubmit={handleFormSubmit} autoComplete="off">
                {/* 1. Nama Perusahaan */}
                <div className="raters-input-group">
                  <label htmlFor="companyName">
                    <span>Perusahaan / Organisasi *</span>
                  </label>
                  <div className="raters-input-wrapper">
                    <Building2 className="raters-input-icon" style={{ width: 16, height: 16 }} />
                    <input
                      id="companyName"
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Masukkan nama perusahaan"
                      className="raters-input"
                    />
                  </div>
                </div>

                {/* 2. Nama PIC & Email Resmi */}
                <div className="raters-two-col">
                  <div className="raters-input-group">
                    <label htmlFor="fullName">Nama PIC *</label>
                    <div className="raters-input-wrapper">
                      <User className="raters-input-icon" style={{ width: 15, height: 15 }} />
                      <input
                        id="fullName"
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Nama lengkap PIC"
                        className="raters-input"
                      />
                    </div>
                  </div>

                  <div className="raters-input-group">
                    <label htmlFor="email">Email Resmi *</label>
                    <div className="raters-input-wrapper">
                      <Mail className="raters-input-icon" style={{ width: 15, height: 15 }} />
                      <input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@perusahaan.co.id"
                        className="raters-input"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Nomor HP / WhatsApp */}
                <div className="raters-input-group">
                  <label htmlFor="phone">Nomor HP / WhatsApp *</label>
                  <div className="raters-input-wrapper">
                    <Phone className="raters-input-icon" style={{ width: 15, height: 15 }} />
                    <input
                      id="phone"
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+62 812-xxxx-xxxx"
                      className="raters-input"
                    />
                  </div>
                </div>

                {/* 4. Serial Lisensi & Device ID (Hanya Pada Mode Berlisensi) */}
                {activeMode === 'licensed' ? (
                  <div className="raters-input-group">
                    <div style={{
                      padding: '8px 12px',
                      borderRadius: '12px',
                      background: '#ecfdf5',
                      border: '1px solid #a7f3d0',
                      color: '#065f46',
                      fontSize: '11px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '7px',
                      marginBottom: '4px'
                    }}>
                      <ShieldCheck style={{ width: 15, height: 15, color: '#059669', flexShrink: 0 }} />
                      <span><strong>Akses Penuh Berlisensi:</strong> Unlimited 17 database &amp; semua fitur Read/Write aktif.</span>
                    </div>

                    <label htmlFor="licenseKey">
                      <span>Serial Lisensi *</span>
                    </label>
                    <div className="raters-input-wrapper">
                      <Key className="raters-input-icon" style={{ width: 15, height: 15 }} />
                      <input
                        id="licenseKey"
                        type="text"
                        required
                        value={licenseKey}
                        onChange={(e) => setLicenseKey(e.target.value)}
                        placeholder="Contoh: WOS-ENT-2026-AK-9988-MINING"
                        className="raters-input"
                        style={{ fontFamily: 'monospace', textTransform: 'uppercase' }}
                      />
                    </div>

                    {/* Device ID Card Display */}
                    <div style={{
                      marginTop: '6px',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      background: '#f8fafc',
                      border: '1px dashed #cbd5e1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px',
                      fontSize: '11px',
                      color: '#64748b'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                        <span style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 700, color: '#94a3b8' }}>ID Perangkat:</span>
                        <code style={{ fontSize: '11px', fontWeight: 700, color: '#1e293b', fontFamily: 'monospace' }}>{deviceId}</code>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyDeviceId}
                        title="Salin ID Perangkat"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: copiedDevId ? '#059669' : '#2563eb',
                          fontSize: '10.5px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}
                      >
                        {copiedDevId ? <Check style={{ width: 12, height: 12 }} /> : <Copy style={{ width: 12, height: 12 }} />}
                        <span>{copiedDevId ? 'Tersalin' : 'Salin'}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{
                    padding: '10px 12px',
                    borderRadius: '12px',
                    background: '#fef3c7',
                    border: '1px solid #fde68a',
                    color: '#92400e',
                    fontSize: '11.5px',
                    lineHeight: 1.4,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px'
                  }}>
                    <AlertCircle style={{ width: 16, height: 16, color: '#d97706', flexShrink: 0, marginTop: 1 }} />
                    <div>
                      <strong>Peringatan Mode Demo / Evaluasi:</strong><br />
                      Maksimal 5 data per tabel. Halaman analitikal &amp; kualifikasi bersifat <strong>Read-Only (Hanya Lihat)</strong>.
                    </div>
                  </div>
                )}

                {/* 5. Password / PIN Akses */}
                <div className="raters-input-group">
                  <label htmlFor="password">
                    <span>Password / PIN Akses *</span>
                  </label>
                  <div className="raters-input-wrapper">
                    <Lock className="raters-input-icon" style={{ width: 15, height: 15 }} />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Buat Password / PIN untuk login berikutnya"
                      className="raters-input"
                      style={{ paddingRight: 38 }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="raters-pass-toggle"
                    >
                      {showPassword ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`raters-btn ${activeMode === 'licensed' ? 'raters-btn-blue' : 'raters-btn-red'}`}
                  style={{ marginTop: 6 }}
                >
                  <span>{isSubmitting ? (submitStatusText || 'Memproses...') : activeMode === 'licensed' ? 'Verifikasi Server & Masuk' : 'Mulai Sesi Uji Coba Demo'}</span>
                  <ArrowRight style={{ width: 16, height: 16 }} />
                </button>
              </form>
            </div>
          )}

          {/* Admin Contact Support Bar */}
          <div className="raters-admin-support-bar">
            <div className="raters-admin-support-title">
              <Headphones style={{ width: 13, height: 13, color: '#2563eb' }} />
              <span>Bantuan Teknis &amp; Aktivasi Lisensi:</span>
            </div>
            <div className="raters-admin-support-links">
              <a
                href="https://wa.me/6282223089790"
                target="_blank"
                rel="noreferrer"
                className="raters-admin-support-item wa"
                title="Hubungi Admin via WhatsApp"
              >
                <MessageCircle style={{ width: 12, height: 12 }} />
                <span>WA: +62 822-2308-9790</span>
              </a>
              <a
                href="mailto:satriamudaprima@gmail.com"
                className="raters-admin-support-item mail"
                title="Hubungi Admin via Email"
              >
                <Mail style={{ width: 12, height: 12 }} />
                <span>satriamudaprima@gmail.com</span>
              </a>
              <a
                href="https://amankerja.com"
                target="_blank"
                rel="noreferrer"
                className="raters-admin-support-item web"
                title="Kunjungi Website Resmi"
              >
                <Globe style={{ width: 12, height: 12 }} />
                <span>amankerja.com</span>
              </a>
            </div>
          </div>

          {/* Footer Terms Disclaimer */}
          <div className="raters-footer-text" style={{ marginTop: '10px' }}>
            Dengan masuk ke sistem, Anda menyetujui <a href="#">Ketentuan Layanan</a> dan <a href="#">Kebijakan Privasi</a>.
          </div>
        </section>

        {/* ================= RIGHT COLUMN: Constellation Network Graphic ================= */}
        <section className="raters-right" aria-hidden="true">
          {/* Subtle Ambient Disc in Graphic */}
          <div className="raters-graphic-sphere" />

          {/* SVG Talent Network Constellation */}
          <svg
            className="raters-svg-canvas"
            viewBox="0 0 500 500"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="280" cy="270" r="160" fill="#e0eafc" fillOpacity="0.8" />

            <g className="raters-node-group">
              {/* Connecting Structural Lines / Bridges */}
              <line
                x1="120"
                y1="140"
                x2="380"
                y2="120"
                stroke="#d3e2fb"
                strokeWidth="12"
                strokeLinecap="round"
              />
              <line
                x1="120"
                y1="140"
                x2="240"
                y2="330"
                stroke="#d3e2fb"
                strokeWidth="12"
                strokeLinecap="round"
              />
              <line
                x1="380"
                y1="120"
                x2="240"
                y2="330"
                stroke="#d3e2fb"
                strokeWidth="12"
                strokeLinecap="round"
              />
              <line
                x1="240"
                y1="330"
                x2="420"
                y2="360"
                stroke="#d3e2fb"
                strokeWidth="10"
                strokeLinecap="round"
              />

              {/* Node 1: Top Left */}
              <g>
                <circle cx="120" cy="140" r="32" fill="#ffffff" stroke="#cbdcf8" strokeWidth="8" />
                <circle cx="120" cy="140" r="14" fill="#3b82f6" fillOpacity="0.8" />
              </g>

              {/* Node 2: Top Right */}
              <g>
                <circle cx="380" cy="120" r="36" fill="#ffffff" stroke="#cbdcf8" strokeWidth="8" />
                <circle cx="380" cy="120" r="16" fill="#6366f1" fillOpacity="0.8" />
              </g>

              {/* Node 3: Center Bottom (Main Hub) */}
              <g>
                <circle cx="240" cy="330" r="42" fill="#ffffff" stroke="#cbdcf8" strokeWidth="10" />
                <circle cx="240" cy="330" r="18" fill="#1d4ed8" fillOpacity="0.85" />
              </g>

              {/* Node 4: Secondary Right Hub */}
              <g>
                <circle cx="420" cy="360" r="26" fill="#ffffff" stroke="#cbdcf8" strokeWidth="7" />
                <circle cx="420" cy="360" r="10" fill="#0ea5e9" fillOpacity="0.8" />
              </g>
            </g>
          </svg>

          {/* Floating Card Badge at Bottom Right */}
          <div className="raters-card-overlay">
            <div className="raters-overlay-dot" />
            <div>
              <div className="raters-overlay-text">Enterprise Talent Network</div>
              <div className="raters-overlay-sub">17 Data Tables • Dual SQLite &amp; Web</div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
