import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings, 
  X, 
  Key, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Sparkles, 
  ExternalLink, 
  Trash2, 
  Cpu, 
  ShieldCheck, 
  RefreshCw,
  Building2,
  Tags,
  Database,
  Download,
  Upload,
  RotateCcw,
  Plus,
  Phone,
  Mail,
  MapPin,
  Image as ImageIcon,
  Check,
  FileJson,
  Award,
  Shield,
  FileCheck,
  QrCode,
  User,
  Copy,
  Globe,
  MessageCircle,
  Headphones
} from 'lucide-react';
import { useSettingsStore, SettingsTabType } from '../../store/useSettingsStore';
import { useWorkforceDataStore } from '../../store/useWorkforceDataStore';
import { useAuthStore } from '../../store/useAuthStore';
import { testGeminiApiKey } from '../../services/gemini';
import { useToastStore } from '../../store/useToastStore';
import { getOrCreateDeviceId, verifyLicenseOnline } from '../../services/licenseService';

export const SettingsModal: React.FC = () => {
  const { 
    companyProfile,
    setCompanyProfile,
    licenseInfo,
    setLicenseInfo,
    departments,
    grades,
    educationLevels,
    jobLevels,
    addDepartment,
    removeDepartment,
    addGrade,
    removeGrade,
    addEducationLevel,
    removeEducationLevel,
    addJobLevel,
    removeJobLevel,
    geminiApiKey, 
    geminiModel, 
    isSettingsModalOpen, 
    activeSettingsTab,
    setGeminiApiKey, 
    setGeminiModel, 
    setIsSettingsModalOpen, 
    setActiveSettingsTab,
    clearApiKey 
  } = useSettingsStore();

  const workforceStore = useWorkforceDataStore();
  const addToast = useToastStore((s) => s.addToast);
  const { accountType, userProfile, upgradeToLicensed, verifyAndUpgradeLicensed, deviceId: storeDeviceId } = useAuthStore();

  const deviceId = storeDeviceId || getOrCreateDeviceId();
  const [copiedDevId, setCopiedDevId] = useState(false);
  const [isVerifyingLicense, setIsVerifyingLicense] = useState(false);

  // Local Form States
  const [localCompany, setLocalCompany] = useState(companyProfile);
  const [localLicense, setLocalLicense] = useState(licenseInfo);
  const [licenseForm, setLicenseForm] = useState({
    companyName: companyProfile.companyName || userProfile.companyName || '',
    fullName: userProfile.fullName || '',
    email: companyProfile.companyEmail || userProfile.email || '',
    phone: companyProfile.companyPhone || userProfile.phone || '',
    licenseKey: licenseInfo.licenseKey || '',
    password: ''
  });

  const [newDept, setNewDept] = useState('');
  const [newGrade, setNewGrade] = useState('');
  const [newEdu, setNewEdu] = useState('');
  const [newLevel, setNewLevel] = useState('');

  // AI states
  const [inputKey, setInputKey] = useState(geminiApiKey);
  const [selectedModel, setLocalModel] = useState(geminiModel);
  const [showKey, setShowKey] = useState(false);
  const [testState, setTestState] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  // Backup / File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  // Sync state when modal opens
  React.useEffect(() => {
    if (isSettingsModalOpen) {
      setLocalCompany(companyProfile);
      setLocalLicense(licenseInfo);
      setLicenseForm({
        companyName: companyProfile.companyName || userProfile.companyName || '',
        fullName: userProfile.fullName || '',
        email: companyProfile.companyEmail || userProfile.email || '',
        phone: companyProfile.companyPhone || userProfile.phone || '',
        licenseKey: licenseInfo.licenseKey || '',
        password: ''
      });
      setInputKey(geminiApiKey);
      setLocalModel(geminiModel);
      setTestState('idle');
      setTestMessage('');
    }
  }, [isSettingsModalOpen, companyProfile, licenseInfo, userProfile, geminiApiKey, geminiModel]);

  if (!isSettingsModalOpen) return null;

  // Handle Save Company Profile
  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    setCompanyProfile(localCompany);
    // Also sync license "Licensed To" with company name
    setLicenseInfo({ licensedTo: localCompany.companyName });
    setLocalLicense((prev) => ({ ...prev, licensedTo: localCompany.companyName }));
    addToast('Profil Perusahaan Disimpan', `Informasi ${localCompany.companyName} berhasil diperbarui.`, 'success');
  };

  const handleCopyDeviceId = () => {
    navigator.clipboard.writeText(deviceId);
    setCopiedDevId(true);
    addToast('ID Perangkat Disalin', `Device ID "${deviceId}" berhasil disalin ke clipboard.`, 'info');
    setTimeout(() => setCopiedDevId(false), 2000);
  };

  // Handle Online Verification & Save License from Demo Mode
  const handleSaveLicense = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!licenseForm.companyName.trim() || !licenseForm.fullName.trim() || !licenseForm.email.trim() || !licenseForm.phone.trim()) {
      addToast('Validasi Gagal', 'Nama perusahaan, nama PIC, email, dan nomor HP wajib diisi lengkap.', 'error');
      return;
    }

    if (!licenseForm.licenseKey.trim()) {
      addToast('Validasi Gagal', 'Silakan masukkan kunci serial lisensi yang valid.', 'error');
      return;
    }

    setIsVerifyingLicense(true);
    try {
      const result = await verifyAndUpgradeLicensed({
        companyName: licenseForm.companyName.trim(),
        fullName: licenseForm.fullName.trim(),
        email: licenseForm.email.trim(),
        phone: licenseForm.phone.trim(),
        licenseKey: licenseForm.licenseKey.trim(),
        password: licenseForm.password.trim()
      });

      if (result.success) {
        setLocalLicense((prev) => ({
          ...prev,
          licenseKey: licenseForm.licenseKey.trim().toUpperCase(),
          licensedTo: licenseForm.companyName.trim(),
          licenseType: 'Commercial Enterprise (Royalty-Free Lifetime)',
          maxHeadcount: 'Unlimited Enterprise Headcount',
          isActivated: true
        }));
        setLocalCompany((prev) => ({
          ...prev,
          companyName: licenseForm.companyName.trim(),
          companyEmail: licenseForm.email.trim(),
          companyPhone: licenseForm.phone.trim()
        }));
        addToast(
          'Aktivasi Lisensi Berhasil!',
          result.message || `Selamat ${licenseForm.fullName}. Lisensi Enterprise resmi aktif untuk ${licenseForm.companyName}. Seluruh 17 tabel & fitur analitikal terbuka tanpa batas kuota.`,
          'success'
        );
      } else {
        addToast('Aktivasi Gagal', result.message, 'error');
      }
    } catch (err: any) {
      addToast('Kesalahan Server', `Gagal menghubungkan ke server lisensi: ${err?.message || 'Koneksi error'}`, 'error');
    } finally {
      setIsVerifyingLicense(false);
    }
  };

  // Check license status online with server without submitting
  const handleCheckServerStatus = async () => {
    if (!licenseForm.licenseKey.trim()) {
      addToast('Validasi', 'Masukkan serial lisensi terlebih dahulu untuk verifikasi online.', 'warning');
      return;
    }
    setIsVerifyingLicense(true);
    try {
      const res = await verifyLicenseOnline({
        sn: licenseForm.licenseKey.trim(),
        companyName: licenseForm.companyName.trim(),
        phone: licenseForm.phone.trim(),
        email: licenseForm.email.trim(),
        deviceId
      });
      if (res.success) {
        addToast('Status Server: VALID', res.message, 'success');
      } else {
        addToast(`Status Server: ${res.status}`, res.message, 'error');
      }
    } catch (e: any) {
      addToast('Gagal Cek Server', e?.message || 'Koneksi error', 'error');
    } finally {
      setIsVerifyingLicense(false);
    }
  };

  // Handle Logo Upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        addToast('File Terlalu Besar', 'Ukuran logo maksimal 2MB (disarankan PNG/SVG/JPG).', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setLocalCompany((prev) => ({ ...prev, companyLogo: base64 }));
        setCompanyProfile({ companyLogo: base64 });
        addToast(
          'Logo Berhasil Diperbarui!',
          'Logo perusahaan telah aktif dan otomatis diterapkan di Sidebar, Favicon, Header, & Laporan PDF.',
          'success'
        );
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Remove Logo / Reset to Default
  const handleRemoveLogo = () => {
    setLocalCompany((prev) => ({ ...prev, companyLogo: '' }));
    setCompanyProfile({ companyLogo: '' });
    addToast('Logo Direset', 'Logo dikembalikan ke ikon default sistem.', 'info');
  };

  // Handle Export Full Database Backup
  const handleExportFullBackup = () => {
    try {
      const state = workforceStore;
      const backupData = {
        meta: {
          appName: 'WorkforceOS Enterprise',
          version: '2.1.0',
          exportedAt: new Date().toISOString(),
          companyName: localCompany.companyName
        },
        companyProfile: localCompany,
        licenseInfo: localLicense,
        masterReferences: {
          departments,
          grades,
          educationLevels,
          jobLevels
        },
        database: {
          employees: state.employees,
          jobPositions: state.jobPositions,
          trainingModules: state.trainingModules,
          tnaRules: state.tnaRules,
          criticalPositions: state.criticalPositions,
          mppData: state.mppData,
          competencies: state.competencies,
          positionCompetencies: state.positionCompetencies,
          employeeAssessments: state.employeeAssessments,
          workforceMovements: state.workforceMovements,
          annualTrainingPlans: state.annualTrainingPlans,
          trainers: state.trainers,
          trainingEvents: state.trainingEvents,
          trainingReminders: state.trainingReminders,
          detailedIdps: state.detailedIdps,
          careerNodes: state.careerNodes,
          mppScenarios: state.mppScenarios,
          agenticActions: state.agenticActions
        }
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
      const downloadAnchor = document.createElement('a');
      const filename = `backup_workforce_os_${localCompany.companyName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', filename);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      addToast('Backup Berhasil', `File backup ${filename} berhasil diunduh.`, 'success');
    } catch (err) {
      console.error('Backup error:', err);
      addToast('Gagal Backup', 'Terjadi kesalahan saat mengekspor database.', 'error');
    }
  };

  // Handle Import / Restore Database Backup
  const handleFileSelectForRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        setIsRestoring(true);
        const parsed = JSON.parse(event.target?.result as string);

        if (!parsed.database || !Array.isArray(parsed.database.employees)) {
          throw new Error('Format file backup tidak valid atau rusak.');
        }

        const db = parsed.database;

        // Restore to store
        useWorkforceDataStore.setState({
          employees: db.employees || [],
          jobPositions: db.jobPositions || [],
          trainingModules: db.trainingModules || [],
          tnaRules: db.tnaRules || {},
          criticalPositions: db.criticalPositions || [],
          mppData: db.mppData || [],
          competencies: db.competencies || [],
          positionCompetencies: db.positionCompetencies || [],
          employeeAssessments: db.employeeAssessments || [],
          workforceMovements: db.workforceMovements || [],
          annualTrainingPlans: db.annualTrainingPlans || [],
          trainers: db.trainers || [],
          trainingEvents: db.trainingEvents || [],
          trainingReminders: db.trainingReminders || [],
          detailedIdps: db.detailedIdps || [],
          careerNodes: db.careerNodes || [],
          mppScenarios: db.mppScenarios || [],
          agenticActions: db.agenticActions || []
        });

        // Restore company profile & master references if present
        if (parsed.companyProfile) {
          setCompanyProfile(parsed.companyProfile);
          setLocalCompany(parsed.companyProfile);
        }

        if (parsed.licenseInfo) {
          setLicenseInfo(parsed.licenseInfo);
          setLocalLicense(parsed.licenseInfo);
        }

        addToast(
          'Restore Database Sukses',
          `Database berhasil dipulihkan (${db.employees.length} karyawan, ${db.jobPositions.length} jabatan).`,
          'success'
        );
      } catch (err: any) {
        console.error('Restore error:', err);
        addToast('Gagal Restore', err.message || 'Gagal membaca file backup JSON.', 'error');
      } finally {
        setIsRestoring(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  // AI Save
  const handleSaveAI = () => {
    setGeminiApiKey(inputKey);
    setGeminiModel(selectedModel);
    addToast('Pengaturan AI Disimpan', 'Konfigurasi Gemini AI Engine berhasil disimpan.', 'success');
  };

  const handleTestConnection = async () => {
    const keyToTest = inputKey.trim();
    if (!keyToTest) {
      setTestState('error');
      setTestMessage('Silakan masukkan API Key terlebih dahulu.');
      return;
    }

    setTestState('testing');
    setTestMessage('Menghubungi Google Gemini AI...');

    const res = await testGeminiApiKey(keyToTest, selectedModel);
    if (res.success) {
      setTestState('success');
      setTestMessage(res.message);
      addToast('Koneksi Berhasil', 'API Key valid dan siap digunakan.', 'success');
    } else {
      setTestState('error');
      setTestMessage(res.message);
      addToast('Koneksi Gagal', res.message, 'error');
    }
  };

  const handleClearAI = () => {
    clearApiKey();
    setInputKey('');
    setTestState('idle');
    setTestMessage('');
    addToast('API Key Dihapus', 'Kunci API telah dihapus dari penyimpanan lokal.', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Pusat Pengaturan Sistem &amp; Organisasi
              </h3>
              <p className="text-xs text-slate-500">
                Profil korporasi, master referensi, lisensi, AI engine, dan cadangan database
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsSettingsModalOpen(false)}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 px-6 gap-2 pt-2 overflow-x-auto custom-scrollbar">
          {[
            { id: 'company' as SettingsTabType, label: 'Profil Perusahaan', icon: Building2 },
            { id: 'master' as SettingsTabType, label: 'Master Referensi', icon: Tags },
            { id: 'license' as SettingsTabType, label: 'Lisensi & Produk', icon: Award },
            { id: 'backup' as SettingsTabType, label: 'Backup & Restore', icon: Database },
            { id: 'ai' as SettingsTabType, label: 'AI Engine', icon: Sparkles }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSettingsTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSettingsTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'border-blue-600 text-blue-600 bg-white rounded-t-lg shadow-2xs'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6 flex-1">
          
          {/* ========================================================================= */}
          {/* TAB 1: PROFIL PERUSAHAAN */}
          {/* ========================================================================= */}
          {activeSettingsTab === 'company' && (
            <form onSubmit={handleSaveCompany} className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nama Perusahaan */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700">Nama Perusahaan / Entitas Bisnis</label>
                  <input
                    type="text"
                    value={localCompany.companyName}
                    onChange={(e) => setLocalCompany({ ...localCompany, companyName: e.target.value })}
                    placeholder="Contoh: PT Aman Kerja"
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                {/* Jenis Industri */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700">Sektor / Bidang Industri</label>
                  <input
                    type="text"
                    value={localCompany.industryType}
                    onChange={(e) => setLocalCompany({ ...localCompany, industryType: e.target.value })}
                    placeholder="Contoh: Pertambangan Minerba, Energi & Konstruksi"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                {/* Logo Perusahaan */}
                <div className="space-y-2 sm:col-span-2 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/90">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-blue-600" />
                      <span>Logo Perusahaan / Branding Organisasi</span>
                    </label>
                    <span className="text-[10px] font-bold text-slate-400">
                      Format PNG, SVG, JPG (Maks. 2MB)
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3.5 pt-1">
                    {localCompany.companyLogo ? (
                      <div className="relative group shrink-0">
                        <img
                          src={localCompany.companyLogo}
                          alt="Logo Preview"
                          className="w-14 h-14 rounded-2xl object-contain border border-slate-200 bg-white p-1.5 shadow-xs"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveLogo}
                          title="Hapus / Reset ke logo default"
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-xs cursor-pointer transition"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-2xl border-2 border-dashed border-slate-300 bg-white flex items-center justify-center text-slate-400 shrink-0 shadow-2xs">
                        <Building2 className="w-6 h-6 text-slate-400" />
                      </div>
                    )}

                    <div className="flex-1 w-full space-y-1.5">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={localCompany.companyLogo}
                          onChange={(e) => setLocalCompany({ ...localCompany, companyLogo: e.target.value })}
                          placeholder="https://... atau klik tombol Unggah File"
                          className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-hidden focus:border-blue-500"
                        />
                        <label className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer transition flex items-center gap-1.5 shrink-0 shadow-xs">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Pilih File</span>
                          <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                        </label>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-tight">
                        Logo ini otomatis diterapkan di <strong>Sidebar</strong>, <strong>Header</strong>, <strong>Halaman Login</strong>, <strong>Laporan PDF &amp; Excel</strong>, serta <strong>Favicon Tab Browser</strong>.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Alamat Kantor */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>Alamat Kantor Pusat / Site Tambang</span>
                  </label>
                  <textarea
                    rows={2}
                    value={localCompany.companyAddress}
                    onChange={(e) => setLocalCompany({ ...localCompany, companyAddress: e.target.value })}
                    placeholder="Alamat lengkap operasional..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                {/* No Telepon */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>Nomor Telepon / WhatsApp</span>
                  </label>
                  <input
                    type="text"
                    value={localCompany.companyPhone}
                    onChange={(e) => setLocalCompany({ ...localCompany, companyPhone: e.target.value })}
                    placeholder="+62 812-xxxx-xxxx"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                {/* Email Resmi */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>Email Resmi Korporat</span>
                  </label>
                  <input
                    type="email"
                    value={localCompany.companyEmail}
                    onChange={(e) => setLocalCompany({ ...localCompany, companyEmail: e.target.value })}
                    placeholder="corporate@perusahaan.co.id"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan Profil Perusahaan</span>
                </button>
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: MASTER REFERENSI & ORGANISASI */}
          {/* ========================================================================= */}
          {activeSettingsTab === 'master' && (
            <div className="space-y-6 animate-fade-in">
              {/* 1. Kelola Departemen */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Daftar Departemen / Divisi</h4>
                    <p className="text-[11px] text-slate-500">Unit kerja yang digunakan di seluruh bagan &amp; modul</p>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                    {departments.length} Departemen
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {departments.map((dept) => (
                    <span
                      key={dept}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-800 shadow-2xs"
                    >
                      <span>{dept}</span>
                      {departments.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeDepartment(dept)}
                          className="text-slate-400 hover:text-rose-600 transition cursor-pointer"
                          title={`Hapus ${dept}`}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (newDept.trim()) {
                          addDepartment(newDept);
                          setNewDept('');
                        }
                      }
                    }}
                    placeholder="Tambah nama departemen baru..."
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-hidden focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newDept.trim()) {
                        addDepartment(newDept);
                        setNewDept('');
                      }
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah</span>
                  </button>
                </div>
              </div>

              {/* 2. Kelola Grade Jabatan */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Daftar Grade Jabatan (Salary &amp; Leveling)</h4>
                    <p className="text-[11px] text-slate-500">Skala penggolongan jabatan untuk remunerasi &amp; suksesi</p>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
                    {grades.length} Grade
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {grades.map((grade) => (
                    <span
                      key={grade}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs font-bold text-indigo-700 shadow-2xs"
                    >
                      <span>Grade {grade}</span>
                      {grades.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeGrade(grade)}
                          className="text-slate-400 hover:text-rose-600 transition cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={newGrade}
                    onChange={(e) => setNewGrade(e.target.value)}
                    placeholder="Contoh: G11, Grade 12..."
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-hidden focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newGrade.trim()) {
                        addGrade(newGrade);
                        setNewGrade('');
                      }
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Grade</span>
                  </button>
                </div>
              </div>

              {/* 3. Kelola Jenjang Pendidikan */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Daftar Jenjang Pendidikan</h4>
                    <p className="text-[11px] text-slate-500">Standar kualifikasi formal untuk rekrutmen &amp; TNA</p>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                    {educationLevels.length} Jenjang
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {educationLevels.map((edu) => (
                    <span
                      key={edu}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-emerald-800 shadow-2xs"
                    >
                      <span>{edu}</span>
                      {educationLevels.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeEducationLevel(edu)}
                          className="text-slate-400 hover:text-rose-600 transition cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={newEdu}
                    onChange={(e) => setNewEdu(e.target.value)}
                    placeholder="Contoh: D4, Profesi, Sertifikasi K3..."
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-hidden focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newEdu.trim()) {
                        addEducationLevel(newEdu);
                        setNewEdu('');
                      }
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Pendidikan</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: LISENSI & PRODUK */}
          {/* ========================================================================= */}
          {activeSettingsTab === 'license' && (
            <form onSubmit={handleSaveLicense} className="space-y-5 animate-fade-in">
              {/* License Status Banner */}
              {accountType === 'demo' ? (
                <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3.5 shadow-2xs">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-amber-950">Status: Akun Demo / Evaluasi (Read-Only)</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 uppercase">
                        TRIAL MODE
                      </span>
                    </div>
                    <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                      Sistem sedang berjalan dalam mode evaluasi dengan kuota maksimal 5 data per tabel dan fitur analitikal bersifat Read-Only. Masukkan data identitas lengkap dan serial lisensi resmi di bawah untuk aktivasi akses komersial tanpa batas.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-linear-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex items-start gap-3.5 shadow-2xs">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-emerald-950">Status Lisensi: Aktif &amp; Terverifikasi</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800">
                        COMMERCIAL READY
                      </span>
                    </div>
                    <p className="text-xs text-emerald-700 mt-0.5 leading-relaxed">
                      Sistem beroperasi di bawah lisensi resmi dengan hak komersialisasi penuh, dukungan dual database (SQLite Offline &amp; Web), dan kapasitas headcount tanpa batas.
                    </p>
                  </div>
                </div>
              )}

              {/* License Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Tipe Lisensi</span>
                  <p className="text-xs font-bold text-slate-900">{localLicense.licenseType}</p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Terdaftar Atas Nama</span>
                  <p className="text-xs font-bold text-slate-900">{licenseForm.companyName || localCompany.companyName}</p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Masa Berlaku</span>
                  <p className="text-xs font-bold text-emerald-700">{localLicense.expiryDate}</p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Kapasitas Karyawan</span>
                  <p className="text-xs font-bold text-slate-900">{localLicense.maxHeadcount}</p>
                </div>
              </div>

              {/* Form Input Data Identitas & Kunci Serial Lisensi (Sesuai Halaman Login) */}
              <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white space-y-3.5 shadow-2xs">
                <div className="border-b border-slate-100 pb-2.5">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <Key className="w-4 h-4 text-blue-600" />
                    <span>Formulir Aktivasi Lisensi Korporat</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Lengkapi identitas perusahaan, PIC pengelola, kontak resmi, dan nomor serial lisensi untuk aktivasi.
                  </p>
                </div>

                {/* 1. Nama Perusahaan */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Nama Perusahaan / Organisasi <span className="text-rose-500">*</span></span>
                  </label>
                  <input
                    type="text"
                    required
                    value={licenseForm.companyName}
                    onChange={(e) => setLicenseForm({ ...licenseForm, companyName: e.target.value })}
                    placeholder="Contoh: PT Aman Kerja"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:border-blue-500 transition"
                  />
                </div>

                {/* 2. Nama PIC & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Nama Lengkap PIC / Pengguna <span className="text-rose-500">*</span></span>
                    </label>
                    <input
                      type="text"
                      required
                      value={licenseForm.fullName}
                      onChange={(e) => setLicenseForm({ ...licenseForm, fullName: e.target.value })}
                      placeholder="Contoh: Ahmad Faqih Didin"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:border-blue-500 transition"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>Email Resmi Perusahaan <span className="text-rose-500">*</span></span>
                    </label>
                    <input
                      type="email"
                      required
                      value={licenseForm.email}
                      onChange={(e) => setLicenseForm({ ...licenseForm, email: e.target.value })}
                      placeholder="corporate@amankerja.co.id"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                {/* 3. No Telepon / WhatsApp */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>Nomor HP / WhatsApp PIC <span className="text-rose-500">*</span></span>
                  </label>
                  <input
                    type="text"
                    required
                    value={licenseForm.phone}
                    onChange={(e) => setLicenseForm({ ...licenseForm, phone: e.target.value })}
                    placeholder="+62 812-3456-7890"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:border-blue-500 transition"
                  />
                </div>

                {/* 4. Serial Lisensi & Device ID */}
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-blue-600" />
                      <span>Kunci Serial Lisensi (License Key) <span className="text-rose-500">*</span></span>
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        disabled={isVerifyingLicense}
                        onClick={handleCheckServerStatus}
                        className="text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold cursor-pointer flex items-center gap-1"
                        title="Periksa validitas serial ke server Google Apps Script"
                      >
                        <Globe className="w-3 h-3" />
                        <span>Cek Server Online</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setLicenseForm({
                            companyName: 'PT Aman Kerja',
                            fullName: 'Ahmad Faqih Didin',
                            email: 'corporate@amankerja.co.id',
                            phone: '+62 812-3456-7890',
                            licenseKey: 'WOS-ENT-2026-AK-9988-MINING'
                          });
                        }}
                        className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                      >
                        Gunakan Serial Bawaan
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    required
                    value={licenseForm.licenseKey}
                    onChange={(e) => setLicenseForm({ ...licenseForm, licenseKey: e.target.value })}
                    placeholder="WOS-ENT-2026-AK-9988-MINING"
                    className="w-full px-3.5 py-2 rounded-xl border border-blue-200 bg-blue-50/40 text-xs font-mono text-slate-900 uppercase focus:bg-white focus:outline-hidden focus:border-blue-500 transition"
                  />

                  {/* Device ID Display */}
                  <div className="mt-2 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[10px] font-bold uppercase text-slate-400">ID Perangkat Ini:</span>
                      <code className="font-mono font-bold text-slate-800 truncate">{deviceId}</code>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyDeviceId}
                      className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer shrink-0"
                    >
                      {copiedDevId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedDevId ? 'Tersalin!' : 'Salin ID'}</span>
                    </button>
                  </div>
                </div>

                {/* 5. Password / PIN Akses */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-slate-400" />
                    <span>Password / PIN Akses *</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={licenseForm.password}
                    onChange={(e) => setLicenseForm({ ...licenseForm, password: e.target.value })}
                    placeholder="Buat Password / PIN untuk login berikutnya"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:border-blue-500 transition"
                  />
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isVerifyingLicense}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-bold shadow-xs transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <FileCheck className="w-4 h-4" />
                    <span>{isVerifyingLicense ? 'Menghubungi Server...' : 'Verifikasi Server & Aktivasi Lisensi Enterprise'}</span>
                  </button>
                </div>
              </div>

              {/* Official Admin Contact Support Card */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-linear-to-r from-blue-50/60 via-indigo-50/30 to-white space-y-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Headphones className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Bantuan Teknis &amp; Lisensi Resmi</h4>
                    <p className="text-[10.5px] text-slate-500">Hubungi admin untuk aktivasi serial baru, konsultasi, atau bantuan teknis.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  <a
                    href="https://wa.me/6282223089790"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-800 transition group"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600 group-hover:scale-110 transition-transform shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[9.5px] font-bold text-emerald-600 uppercase block">WhatsApp</span>
                      <span className="text-[11px] font-bold truncate block text-emerald-950">+62 822-2308-9790</span>
                    </div>
                  </a>

                  <a
                    href="mailto:satriamudaprima@gmail.com"
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100/80 border border-blue-200 text-blue-800 transition group"
                  >
                    <Mail className="w-3.5 h-3.5 text-blue-600 group-hover:scale-110 transition-transform shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[9.5px] font-bold text-blue-600 uppercase block">Email</span>
                      <span className="text-[11px] font-bold truncate block text-blue-950">satriamudaprima@gmail.com</span>
                    </div>
                  </a>

                  <a
                    href="https://amankerja.com"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-purple-50 hover:bg-purple-100/80 border border-purple-200 text-purple-800 transition group"
                  >
                    <Globe className="w-3.5 h-3.5 text-purple-600 group-hover:scale-110 transition-transform shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[9.5px] font-bold text-purple-600 uppercase block">Website</span>
                      <span className="text-[11px] font-bold truncate block text-purple-950">amankerja.com</span>
                    </div>
                  </a>
                </div>
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: BACKUP & RESTORE ALL DATABASE */}
          {/* ========================================================================= */}
          {activeSettingsTab === 'backup' && (
            <div className="space-y-5 animate-fade-in">
              {/* Export Full Backup Card */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-linear-to-br from-blue-50/50 to-white space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                      <Download className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Backup Seluruh Database (.JSON)</h4>
                      <p className="text-xs text-slate-500">
                        Unduh salinan lengkap 17 domain data (karyawan, posisi, TNA, suksesi, MPP, IDP, dan kompetensi)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs text-slate-500">
                  <span>Format: Single Enterprise JSON snapshot</span>
                  <button
                    type="button"
                    onClick={handleExportFullBackup}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-2 transition shadow-xs cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Unduh Cadangan Lengkap</span>
                  </button>
                </div>
              </div>

              {/* Import / Restore Backup Card */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-linear-to-br from-purple-50/50 to-white space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Restore / Pulihkan Database</h4>
                      <p className="text-xs text-slate-500">
                        Unggah file cadangan JSON untuk memulihkan seluruh data dan relasi korporasi
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs text-slate-500">
                  <span>Peringatan: Data aktif akan digantikan dengan data dari file cadangan</span>
                  <label className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold flex items-center gap-2 transition shadow-xs cursor-pointer">
                    <FileJson className="w-4 h-4" />
                    <span>{isRestoring ? 'Memulihkan...' : 'Pilih File Backup (.JSON)'}</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json"
                      onChange={handleFileSelectForRestore}
                      disabled={isRestoring}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Reset to Initial Seeder */}
              <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-rose-900">Reset Database ke Kondisi Awal</h4>
                  <p className="text-[11px] text-rose-600">
                    Mengembalikan semua data ke seeder awal PT Aman Kerja (3 record per entitas)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Apakah Anda yakin ingin mereset seluruh database ke kondisi awal seeder?')) {
                      workforceStore.reseedDatabase();
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Seeder</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: AI ENGINE CONFIGURATION */}
          {/* ========================================================================= */}
          {activeSettingsTab === 'ai' && (
            <div className="space-y-5 animate-fade-in">
              {/* API Key Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-blue-600" />
                    <span>Google Gemini API Key</span>
                  </label>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <span>Dapatkan API Key Gratis</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    placeholder="AIzaSy..."
                    value={inputKey}
                    onChange={(e) => {
                      setInputKey(e.target.value);
                      setTestState('idle');
                    }}
                    className="w-full pr-10 pl-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-hidden transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Model Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-blue-600" />
                  <span>Model Gemini AI</span>
                </label>

                <select
                  value={selectedModel}
                  onChange={(e) => {
                    setLocalModel(e.target.value);
                    setTestState('idle');
                  }}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-hidden"
                >
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash (Paling Stabil &amp; Jarang Antre - Direkomendasikan)</option>
                  <option value="gemini-2.0-flash">Gemini 2.0 Flash (Generasi Baru - Cepat &amp; Responsif)</option>
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash (Model Teranyar)</option>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Reasoning Stabil)</option>
                  <option value="gemini-2.5-pro">Gemini 2.5 Pro (Model Pro Teranyar)</option>
                </select>
              </div>

              {/* Connection Test Box */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={testState === 'testing' || !inputKey.trim()}
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${testState === 'testing' ? 'animate-spin' : ''}`} />
                    <span>{testState === 'testing' ? 'Menguji Koneksi...' : 'Uji Koneksi API'}</span>
                  </button>

                  {inputKey && (
                    <button
                      type="button"
                      onClick={handleClearAI}
                      className="text-rose-600 hover:text-rose-800 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus Kunci</span>
                    </button>
                  )}
                </div>

                {testState !== 'idle' && (
                  <div className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                    testState === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' :
                    testState === 'error' ? 'bg-rose-50 border-rose-200 text-rose-900' :
                    'bg-blue-50 border-blue-200 text-blue-900'
                  }`}>
                    {testState === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> :
                     testState === 'error' ? <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" /> :
                     <RefreshCw className="w-4 h-4 text-blue-600 animate-spin shrink-0 mt-0.5" />}
                    <span className="leading-relaxed">{testMessage}</span>
                  </div>
                )}
              </div>

              {/* Security & Privacy Notice */}
              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-start gap-2.5 text-[11px] text-slate-600">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Privasi Terjamin:</strong> API Key disimpan 100% secara lokal di penyimpanan perangkat Anda dan hanya dipanggil untuk diagnosis AI strategis.
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveAI}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                >
                  Simpan Pengaturan AI
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Sistem Operasional: <strong>{localCompany.companyName}</strong></span>
          </div>
          <button
            type="button"
            onClick={() => setIsSettingsModalOpen(false)}
            className="px-4 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </motion.div>
    </div>
  );
};
