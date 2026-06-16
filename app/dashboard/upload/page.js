'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { getChainInfo, uploadBills } from '@/lib/api';
import { t } from '@/lib/i18n';
import { ArrowLeft, Camera, FolderOpen, X, FileText, AlertCircle, Plus } from 'lucide-react';

function ElectricBackground() {
  const [particles] = useState(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 3,
      color: Math.random() > 0.5 ? '#FACC15' : '#86EFAC'
    }))
  );
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" style={{ background: '#000000' }}>
      {particles.map(p => (
        <div key={p.id} className="absolute rounded-full animate-pulse"
          style={{
            left: p.left, top: p.top,
            width: p.size, height: p.size,
            background: p.color, opacity: 0.2,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`
          }} />
      ))}
    </div>
  );
}

export default function UploadPage() {
  const { user, loading, lang } = useAuth();
  const router = useRouter();
  const [chain, setChain] = useState(null);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const cameraRef = useRef(null);
  const galleryRef = useRef(null);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
    if (user) {
      getChainInfo()
        .then(res => setChain(res.data))
        .catch(() => toast.error('Failed to load chain info'))
        .finally(() => setPageLoading(false));
    }
  }, [user, loading]);

  const addFiles = (selected) => {
    const maxFiles = chain?.chain?.billsRequired || 2;
    const valid = Array.from(selected).filter(f => {
      const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowed.includes(f.type)) {
        toast.error(`${f.name} — JPG, PNG or PDF only`);
        return false;
      }
      if (f.size > 10 * 1024 * 1024) {
        toast.error(`${f.name} — Max 10MB`);
        return false;
      }
      return true;
    });

    setFiles(prev => {
      const combined = [...prev, ...valid];
      if (combined.length > maxFiles) {
        toast.error(lang === 'EN' ? `Only ${maxFiles} bill(s) allowed` : `Hanya ${maxFiles} bil dibenarkan`);
        return combined.slice(0, maxFiles);
      }
      return combined;
    });
  };

  const handleCamera = (e) => {
    if (e.target.files?.length) { addFiles(e.target.files); e.target.value = ''; }
  };

  const handleGallery = (e) => {
    if (e.target.files?.length) { addFiles(e.target.files); e.target.value = ''; }
  };

  const removeFile = (index) => setFiles(files.filter((_, i) => i !== index));

  const handleUpload = async () => {
    const required = chain?.chain?.billsRequired || 2;
    if (files.length < required) {
      toast.error(lang === 'EN' ? `Please add ${required} bill(s) first` : `Sila tambah ${required} bil dahulu`);
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach(f => formData.append('bills', f));
      const res = await uploadBills(formData);
      const { teaser, pricing } = res.data;
      toast.success(lang === 'EN' ? 'Bills analysed!' : 'Bil dianalisis!');
      router.push(`/dashboard/teaser?id=${teaser.recordId}&amount=${teaser.estimatedOverspendMyr}&price=${pricing.price}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process bills');
    } finally {
      setUploading(false);
    }
  };

  if (loading || pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#000000' }}>
        <div className="text-center">
          <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse"
            style={{ background: 'rgba(250,204,21,0.1)', border: '1px solid rgba(250,204,21,0.3)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" fill="#FACC15" />
            </svg>
          </div>
          <p className="text-sm animate-pulse" style={{ color: 'rgba(250,204,21,0.6)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  const billsRequired = chain?.chain?.billsRequired || 2;
  const chainStatus = chain?.chain?.status || 'ONBOARD';
  const price = chain?.pricing?.price || 11.99;
  const filesReady = files.length >= billsRequired;
  const canAddMore = files.length < billsRequired;

  const chainConfig = {
    ONBOARD: { label: lang === 'EN' ? '🆕 New User' : '🆕 Pengguna Baru', border: 'rgba(250,204,21,0.3)', bg: 'rgba(250,204,21,0.05)' },
    MONTHLY: { label: lang === 'EN' ? '✅ Loyal User' : '✅ Pengguna Setia', border: 'rgba(34,197,94,0.3)', bg: 'rgba(34,197,94,0.05)' },
    RESET: { label: lang === 'EN' ? '⚠️ Chain Broken' : '⚠️ Rantaian Terputus', border: 'rgba(239,68,68,0.3)', bg: 'rgba(239,68,68,0.05)' }
  };

  const cc = chainConfig[chainStatus];

  return (
    <div className="min-h-screen relative" style={{ background: '#000000' }}>
      <ElectricBackground />

      {/* Hidden inputs */}
      <input ref={cameraRef} type="file" accept="image/*" capture="environment"
        onChange={handleCamera} className="hidden" />
      <input ref={galleryRef} type="file" accept=".jpg,.jpeg,.png,.pdf"
        onChange={handleGallery} className="hidden" />

      {/* Header */}
      <div className="relative z-10 px-4 py-3 flex items-center gap-3 sticky top-0"
        style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(250,204,21,0.1)' }}>
        <button onClick={() => router.back()} style={{ color: 'rgba(250,204,21,0.6)' }}>
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(250,204,21,0.15)', border: '1px solid rgba(250,204,21,0.3)' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" fill="#FACC15" />
            </svg>
          </div>
          <span className="font-bold text-white tracking-wide">JIMAT</span>
        </div>
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-4 py-6 pb-32 space-y-5">

        {/* Title */}
        <div>
          <h1 className="text-xl font-bold text-white mb-1">{t('upload.title', lang)}</h1>
          <p className="text-sm" style={{ color: 'rgba(250,204,21,0.6)' }}>
            ⚡ {t(`upload.${chainStatus.toLowerCase()}`, lang)}
          </p>
        </div>

        {/* Chain + Price Banner */}
        <div className="rounded-2xl p-4" style={{ background: cc.bg, border: `1px solid ${cc.border}` }}>
          <p className="text-white text-sm font-semibold">{cc.label}</p>
          <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {lang === 'EN'
              ? `Analysis fee: RM${price} + RM1.00 gateway — paid after analysis`
              : `Yuran analisis: RM${price} + RM1.00 gateway — dibayar selepas analisis`}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-3">
          {Array.from({ length: billsRequired }).map((_, i) => (
            <div key={i} className="flex-1 h-2 rounded-full transition-all duration-500"
              style={{
                background: i < files.length ? '#FACC15' : 'rgba(255,255,255,0.08)',
                boxShadow: i < files.length ? '0 0 8px rgba(250,204,21,0.4)' : 'none'
              }} />
          ))}
          <span className="text-sm whitespace-nowrap font-medium" style={{ color: files.length > 0 ? '#FACC15' : 'rgba(255,255,255,0.3)' }}>
            {files.length}/{billsRequired}
          </span>
        </div>

        {/* Selected Files */}
        {files.length > 0 && (
          <div className="space-y-2">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between rounded-xl p-3 transition-all"
                style={{ background: 'rgba(250,204,21,0.05)', border: '1px solid rgba(250,204,21,0.2)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(250,204,21,0.15)', border: '1px solid rgba(250,204,21,0.3)' }}>
                    <FileText className="w-4 h-4" style={{ color: '#FACC15' }} />
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">
                      {lang === 'EN' ? `Bill ${index + 1}` : `Bil ${index + 1}`}
                      <span className="ml-2 text-xs font-normal" style={{ color: 'rgba(250,204,21,0.5)' }}>✓</span>
                    </p>
                    <p className="text-xs truncate max-w-44" style={{ color: 'rgba(255,255,255,0.3)' }}>{file.name}</p>
                  </div>
                </div>
                <button onClick={() => removeFile(index)} className="p-1.5 rounded-lg transition-colors"
                  style={{ color: 'rgba(239,68,68,0.5)' }}>
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add Bill Section */}
        {canAddMore && !uploading && (
          <div className="space-y-3">
            <p className="text-sm text-center font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {files.length === 0
                ? (lang === 'EN' ? 'Add your TNB bill' : 'Tambah bil TNB anda')
                : (lang === 'EN' ? `Add Bill ${files.length + 1} of ${billsRequired}` : `Tambah Bil ${files.length + 1} daripada ${billsRequired}`)}
            </p>

            {/* Camera — PRIMARY for mobile */}
            <button
              onClick={() => cameraRef.current?.click()}
              className="w-full rounded-2xl p-6 flex flex-col items-center gap-3 transition-all duration-300"
              style={{
                background: 'rgba(250,204,21,0.06)',
                border: '2px solid rgba(250,204,21,0.25)',
                boxShadow: '0 0 20px rgba(250,204,21,0.05)'
              }}
              onTouchStart={e => e.currentTarget.style.border = '2px solid rgba(250,204,21,0.6)'}
              onTouchEnd={e => e.currentTarget.style.border = '2px solid rgba(250,204,21,0.25)'}
            >
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #FACC15 0%, #EAB308 100%)',
                  boxShadow: '0 0 25px rgba(250,204,21,0.4)'
                }}>
                <Camera className="w-8 h-8" style={{ color: '#000000' }} />
              </div>
              <div className="text-center">
                <p className="text-white font-bold text-base">
                  {lang === 'EN' ? 'Snap Your Bill' : 'Ambil Gambar Bil'}
                </p>
                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {lang === 'EN' ? 'Point camera at your TNB bill' : 'Arahkan kamera ke bil TNB anda'}
                </p>
              </div>
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
                {lang === 'EN' ? 'or' : 'atau'}
              </span>
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
            </div>

            {/* Gallery / PDF */}
            <button
              onClick={() => galleryRef.current?.click()}
              className="w-full rounded-2xl p-4 flex items-center gap-4 transition-all duration-300"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <FolderOpen className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.4)' }} />
              </div>
              <div className="text-left">
                <p className="text-white text-sm font-semibold">
                  {lang === 'EN' ? 'Gallery or PDF File' : 'Galeri atau Fail PDF'}
                </p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  {lang === 'EN' ? 'JPG, PNG or PDF — Max 10MB' : 'JPG, PNG atau PDF — Maks 10MB'}
                </p>
              </div>
            </button>
          </div>
        )}

        {/* Add More button — when 1 file added but need 2 */}
        {files.length > 0 && canAddMore && !uploading && (
          <div className="flex gap-2">
            <button
              onClick={() => cameraRef.current?.click()}
              className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all"
              style={{ background: 'rgba(250,204,21,0.1)', border: '1px solid rgba(250,204,21,0.3)', color: '#FACC15' }}
            >
              <Plus className="w-4 h-4" />
              <Camera className="w-4 h-4" />
              {lang === 'EN' ? 'Add Bill 2 (Camera)' : 'Tambah Bil 2 (Kamera)'}
            </button>
            <button
              onClick={() => galleryRef.current?.click()}
              className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}
            >
              <Plus className="w-4 h-4" />
              <FolderOpen className="w-4 h-4" />
              {lang === 'EN' ? 'File' : 'Fail'}
            </button>
          </div>
        )}

        {/* Warning */}
        {billsRequired === 2 && files.length < billsRequired && (
          <div className="flex gap-2 rounded-xl p-3"
            style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.25)' }}>
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#EAB308' }} />
            <p className="text-xs" style={{ color: '#EAB308' }}>
              {lang === 'EN'
                ? 'Need 2 consecutive months e.g. May + June. Same TNB account only.'
                : '2 bulan berturut-turut diperlukan cth. Mei + Jun. Akaun TNB yang sama sahaja.'}
            </p>
          </div>
        )}

        {/* Analysing State */}
        {uploading && (
          <div className="rounded-2xl p-8 text-center"
            style={{ background: 'rgba(250,204,21,0.05)', border: '1px solid rgba(250,204,21,0.2)' }}>
            <div className="relative w-14 h-14 mx-auto mb-4">
              <div className="w-14 h-14 rounded-full border-4 animate-spin"
                style={{ borderColor: 'rgba(250,204,21,0.2)', borderTopColor: '#FACC15' }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" fill="#FACC15" />
                </svg>
              </div>
            </div>
            <p className="text-white font-bold">{t('upload.analysing', lang)}</p>
            <p className="text-xs mt-1" style={{ color: 'rgba(250,204,21,0.6)' }}>
              {t('upload.processing', lang)}
            </p>
          </div>
        )}

        {/* Analyse Button */}
        {filesReady && !uploading && (
          <div className="space-y-3 pt-2">
            <button
              onClick={handleUpload}
              className="w-full py-4 rounded-xl font-bold text-base transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, #FACC15 0%, #EAB308 100%)',
                color: '#000000',
                boxShadow: '0 0 25px rgba(250,204,21,0.4)'
              }}
            >
              <span className="flex items-center justify-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" fill="#000000" />
                </svg>
                {lang === 'EN' ? 'Analyse My Bills Now' : 'Analisis Bil Saya Sekarang'}
              </span>
            </button>
            <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.2)' }}>
              {lang === 'EN'
                ? '⚡ AI reads and immediately discards your bill. Never stored.'
                : '⚡ AI membaca dan membuang bil anda serta-merta. Tidak disimpan.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}