import React, { useState } from 'react';
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
  Layers
} from 'lucide-react';
import { useAuthStore, AccountType } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';
import './AuthLoginPage.css';

export const AuthLoginPage: React.FC = () => {
  const { loginAsLicensed, loginAsDemo } = useAuthStore();
  const addToast = useToastStore((s) => s.addToast);

  // View state: 'overview' (2-button choice) or 'form' (Detailed credential input)
  const [viewState, setViewState] = useState<'overview' | 'form'>('overview');
  const [activeMode, setActiveMode] = useState<AccountType>('licensed');

  // Form inputs
  const [companyName, setCompanyName] = useState('PT Aman Kerja');
  const [fullName, setFullName] = useState('Ahmad Faqih Didin');
  const [email, setEmail] = useState('corporate@amankerja.co.id');
  const [phone, setPhone] = useState('+62 812-3456-7890');
  const [licenseKey, setLicenseKey] = useState('WOS-ENT-2026-AK-9988-MINING');
  const [password, setPassword] = useState('••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Action 1: Sudah Punya Lisensi -> Open Form for Licensed mode
  const handleOpenLicensedForm = () => {
    setActiveMode('licensed');
    setErrorMsg('');
    setViewState('form');
  };

  // Action 2: Demo Aplikasi -> Direct instant login or demo form
  const handleDemoLogin = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      loginAsDemo({
        companyName: 'PT Tambang Nusantara Sejahtera (Demo)',
        fullName: 'Budi Santoso',
        email: 'budi.santoso@tambangnusantara.id',
        phone: '+62 813-8899-7766'
      });
      addToast(
        'Masuk Mode Demo / Evaluasi',
        'Selamat datang di sesi uji coba. Kuota data dibatasi maksimal 5 data per tabel & halaman tertentu bersifat Read-Only.',
        'info'
      );
      setIsSubmitting(false);
    }, 400);
  };

  const handleFillLicensedPreset = () => {
    setActiveMode('licensed');
    setCompanyName('PT Aman Kerja');
    setFullName('Ahmad Faqih Didin');
    setEmail('corporate@amankerja.co.id');
    setPhone('+62 812-3456-7890');
    setLicenseKey('WOS-ENT-2026-AK-9988-MINING');
    setErrorMsg('');
  };

  const handleFillDemoPreset = () => {
    setActiveMode('demo');
    setCompanyName('PT Tambang Nusantara Sejahtera');
    setFullName('Budi Santoso');
    setEmail('budi.santoso@tambangnusantara.id');
    setPhone('+62 813-8899-7766');
    setErrorMsg('');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!companyName.trim() || !fullName.trim() || !email.trim() || !phone.trim()) {
      setErrorMsg('Semua kolom identitas wajib diisi.');
      return;
    }

    if (activeMode === 'licensed' && !licenseKey.trim()) {
      setErrorMsg('Silakan masukkan kunci serial lisensi yang valid.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      if (activeMode === 'licensed') {
        loginAsLicensed({
          companyName: companyName.trim(),
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          licenseKey: licenseKey.trim()
        });
        addToast(
          'Aktivasi Lisensi Berhasil',
          `Selamat datang ${fullName}. Akses Enterprise tanpa batas telah aktif.`,
          'success'
        );
      } else {
        loginAsDemo({
          companyName: companyName.trim(),
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim()
        });
        addToast(
          'Masuk Mode Demo / Evaluasi',
          `Selamat datang di sesi uji coba. Kuota data dibatasi maksimal 5 data per tabel.`,
          'info'
        );
      }
      setIsSubmitting(false);
    }, 450);
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
            <div className="raters-logo-icon">
              <Layers style={{ width: 20, height: 20 }} />
            </div>
            <span className="raters-brand-text">WorkforceOS</span>
          </div>

          {/* Center Main View: 2 Choices (Sudah Punya Lisensi / Demo Aplikasi) OR Detailed Form */}
          {viewState === 'overview' ? (
            <div className="raters-center">
              <h1 className="raters-title">Welcome to WorkforceOS</h1>
              <p className="raters-subtitle">Enterprise talent management &amp; succession network</p>

              {/* Action Buttons Stack (Hanya 2 Tombol Sesuai Permintaan) */}
              <div className="raters-buttons-stack" style={{ gap: '16px' }}>
                {/* 1. Tombol: Sudah Punya Lisensi */}
                <button
                  type="button"
                  onClick={handleOpenLicensedForm}
                  disabled={isSubmitting}
                  className="raters-btn raters-btn-blue"
                  title="Masuk menggunakan akun dan serial lisensi resmi"
                >
                  <Key style={{ width: 17, height: 17 }} />
                  <span>Sudah Punya Lisensi</span>
                </button>

                {/* 2. Tombol: Demo Aplikasi */}
                <button
                  type="button"
                  onClick={handleDemoLogin}
                  disabled={isSubmitting}
                  className="raters-btn raters-btn-red"
                  title="Coba sesi evaluasi dengan kuota demo (Read-Only)"
                >
                  <Sparkles style={{ width: 17, height: 17 }} />
                  <span>Demo Aplikasi</span>
                </button>
              </div>

              {/* Info Note on Demo & License */}
              <p style={{
                fontSize: '11.5px',
                color: '#64748b',
                marginTop: '22px',
                lineHeight: 1.5,
                maxWidth: '320px'
              }}>
                Mode <strong>Demo Aplikasi</strong> dibatasi 5 data per tabel &amp; halaman analitikal bersifat <em>Read-Only</em>.
              </p>
            </div>
          ) : (
            /* Detailed Form View (Saat memilih Sudah Punya Lisensi atau ingin ganti mode) */
            <div className="raters-center">
              {/* Form Navigation Header */}
              <div className="raters-form-header">
                <button
                  type="button"
                  onClick={() => setViewState('overview')}
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

              {/* Form Input Fields */}
              <form className="raters-detailed-form" onSubmit={handleFormSubmit} autoComplete="off">
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
                      placeholder="Contoh: PT Aman Kerja"
                      className="raters-input"
                    />
                  </div>
                </div>

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
                        placeholder="Ahmad Faqih"
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
                        placeholder="pic@amankerja.co.id"
                        className="raters-input"
                      />
                    </div>
                  </div>
                </div>

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
                      <button
                        type="button"
                        onClick={handleFillLicensedPreset}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#2563eb',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Pakai Serial Bawaan
                      </button>
                    </label>
                    <div className="raters-input-wrapper">
                      <Key className="raters-input-icon" style={{ width: 15, height: 15 }} />
                      <input
                        id="licenseKey"
                        type="text"
                        required
                        value={licenseKey}
                        onChange={(e) => setLicenseKey(e.target.value)}
                        placeholder="WOS-ENT-2026-AK-9988-MINING"
                        className="raters-input"
                        style={{ fontFamily: 'monospace', textTransform: 'uppercase' }}
                      />
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

                <div className="raters-input-group">
                  <label htmlFor="password">Password / PIN Akses</label>
                  <div className="raters-input-wrapper">
                    <Lock className="raters-input-icon" style={{ width: 15, height: 15 }} />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan password akun"
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
                  <span>{isSubmitting ? 'Memproses Masuk...' : activeMode === 'licensed' ? 'Aktivasi & Masuk Berlisensi' : 'Mulai Sesi Uji Coba Demo'}</span>
                  <ArrowRight style={{ width: 16, height: 16 }} />
                </button>
              </form>
            </div>
          )}

          {/* Footer Terms Disclaimer */}
          <div className="raters-footer-text">
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
