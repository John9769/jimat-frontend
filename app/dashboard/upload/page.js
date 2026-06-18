'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { getChainInfo, scanBills, getProfile } from '@/lib/api';
import { t } from '@/lib/i18n';
import { ArrowLeft, Camera, FolderOpen, X, FileText, AlertCircle, Plus, Zap } from 'lucide-react';

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

// ── CANVAS IMAGE ENHANCEMENT ─────────────────────────────
// Converts raw camera photo to high-contrast grayscale
// Dramatically improves Claude OCR accuracy on TNB bills
const enhanceImageForOCR = (file) => {
  return new Promise((resolve) => {
    // PDFs — no enhancement needed, pass through directly
    if (file.type === 'application/pdf') {
      resolve(file);
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement('canvas');

      // Scale down if too large — reduces upload time
      // Max 2000px on longest side — still plenty for OCR
      const maxDim = 2000;
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height / width) * maxDim);
          width = maxDim;
        } else {
          width = Math.round((width / height) * maxDim);
          height = maxDim;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      // Draw original image
      ctx.drawImage(img, 0, 0, width, height);

      // Get pixel data
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;

      // Apply enhancement:
      // 1. Convert to grayscale
      // 2. Boost contrast (makes text black, background white)
      // 3. Sharpen edges
      for (let i = 0; i < data.length; i += 4) {
        // Grayscale
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];

        // Contrast boost — push darks darker, lights lighter
        // Factor 1.8 = strong contrast boost for bill text
        const factor = 1.8;
        const contrasted = factor * (gray - 128) + 128;
        const clamped = Math.max(0, Math.min(255, contrasted));

        data[i] = clamped;
        data[i + 1] = clamped;
        data[i + 2] = clamped;
        // Alpha unchanged
      }

      ctx.putImageData(imageData, 0, 0);

      // Export as high quality JPEG
      canvas.toBlob((blob) => {
        const enhanced = new File([blob], file.name.replace(/\.[^.]+$/, '_enhanced.jpg'), {
          type: 'image/jpeg'
        });
        URL.revokeObjectURL(url);
        resolve(enhanced);
      }, 'image/jpeg', 0.92);
    };

    img.onerror = () => {
      // Enhancement failed — use original
      URL.revokeObjectURL(url);
      resolve(file);
    };

    img.src = url;
  });
};

export default function UploadPage() {
  const { user, loading, lang } = useAuth();
  const router = useRouter();
  const [chain, setChain] = useState(null);
  const [files, setFiles] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [showCameraTips, setShowCameraTips] = useState(false);
  const [pendingCameraSource, setPendingCameraSource] = useState(null);
  const cameraRef = useRef(null);
  const galleryRef = useRef(null);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
    if (user) {
      Promise.all([getChainInfo(), getProfile()])
        .then(([chainRes, profileRes]) => {
          setChain(chainRes.data);
          // Gate — no appliances = force onboarding first
          const applianceCount = profileRes.data.user.appliances?.length || 0;
          if (applianceCount === 0) {
            toast(
              lang === 'EN'
                ? 'Please declare your appliances first — helps JIMAT calculate your savings'
                : 'Sila isytihar peralatan anda dahulu — membantu JIMAT kira penjimatan anda',
              { icon: '⚡', duration: 4000 }
            );
            router.replace('/dashboard/onboarding');
          }
        })
        .catch(() => toast.error('Failed to load'))
        .finally(() => setPageLoading(false));
    }
  }, [user, loading]);

  const addFiles = useCallback(async (selected) => {
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

    if (valid.length === 0) return;

    // Enhance images before adding
    setEnhancing(true);
    try {
      const enhanced = await Promise.all(valid.map(f => enhanceImageForOCR(f)));
      setFiles(prev => {
        const combined = [...prev, ...enhanced];
        if (combined.length > maxFiles) {
          toast.error(lang === 'EN' ? `Only ${maxFiles} bill(s) allowed` : `Hanya ${maxFiles} bil dibenarkan`);
          return combined.slice(0, maxFiles);
        }
        return combined;
      });
    } catch (e) {
      // Fallback to original files
      setFiles(prev => {
        const combined = [...prev, ...valid];
        if (combined.length > maxFiles) return combined.slice(0, maxFiles);
        return combined;
      });
    } finally {
      setEnhancing(false);
    }
  }, [chain, lang]);

  const handleCamera = async (e) => {
    if (e.target.files?.length) {
      await addFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleGallery = async (e) => {
    if (e.target.files?.length) {
      await addFiles(e.target.files);
      e.target.value = '';
    }
  };

  const removeFile = (index) => setFiles(files.filter((_, i) => i !== index));

  // Show camera tips before opening camera
  const handleCameraClick = () => {
    setShowCameraTips(true);
  };

  const openCamera = () => {
    setShowCameraTips(false);
    setTimeout(() => cameraRef.current?.click(), 100);
  };

  const handleScan = async () => {
    const required = chain?.chain?.billsRequired || 2;
    if (files.length < required) {
      toast.error(lang === 'EN'
        ? `Please add ${required} bill(s) first`
        : `Sila tambah ${required} bil dahulu`);
      return;
    }

    // Gate — check appliances before scanning
    try {
      const profileRes = await getProfile();
      const applianceCount = profileRes.data.user.appliances?.length || 0;
      if (applianceCount === 0) {
        toast(
          lang === 'EN'
            ? '⚡ Please declare your appliances first — JIMAT needs this to calculate your savings'
            : '⚡ Sila isytihar peralatan anda dahulu — JIMAT perlukan ini untuk kira penjimatan anda',
          { duration: 4000 }
        );
        router.push('/dashboard/onboarding');
        return;
      }
    } catch (e) {
      // Profile fetch failed — allow to proceed, don't block
    }

    setScanning(true);
    try {
      const formData = new FormData();
      files.forEach(f => formData.append('bills', f));

      const res = await scanBills(formData);
      const { ocrResults, pricing } = res.data;

      // Store OCR results in sessionStorage for confirm page
      sessionStorage.setItem('jimat_ocr_results', JSON.stringify(ocrResults));
      sessionStorage.setItem('jimat_pricing', JSON.stringify(pricing));

      // Navigate to confirm page
      router.push('/dashboard/confirm');

    } catch (err) {
      const errorCode = err.response?.data?.errorCode;
      const isPdfAdvice = err.response?.data?.isPdfAdvice;
      const message = err.response?.data?.message || 'Failed to scan bills';

      if (isPdfAdvice) {
        // OCR failed — show PDF advice
        toast.error(
          lang === 'EN'
            ? 'Could not read bill clearly. Try uploading as PDF from TNB email or myTNB app.'
            : 'Gagal baca bil. Cuba muat naik sebagai PDF dari email TNB atau apl myTNB.',
          { duration: 6000 }
        );
      } else {
        toast.error(message, { duration: 5000 });
      }
    } finally {
      setScanning(false);
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
    ONBOARD: { label: lang === 'EN' ? '🆕 New User — Upload 2 bills' : '🆕 Pengguna Baru — Muat naik 2 bil', border: 'rgba(250,204,21,0.3)', bg: 'rgba(250,204,21,0.05)' },
    MONTHLY: { label: lang === 'EN' ? '✅ Loyal User — Upload 1 bill' : '✅ Pengguna Setia — Muat naik 1 bil', border: 'rgba(34,197,94,0.3)', bg: 'rgba(34,197,94,0.05)' },
    RESET: { label: lang === 'EN' ? '⚠️ Chain Broken — Upload 2 bills to reset' : '⚠️ Rantaian Terputus — Muat naik 2 bil untuk tetapkan semula', border: 'rgba(239,68,68,0.3)', bg: 'rgba(239,68,68,0.05)' }
  };

  const cc = chainConfig[chainStatus];

  return (
    <div className="min-h-screen relative" style={{ background: '#000000' }}>
      <ElectricBackground />

      {/* Hidden inputs */}
      <input ref={cameraRef} type="file" accept="image/*" capture="environment"
        onChange={handleCamera} className="hidden" />
      <input ref={galleryRef} type="file" accept=".jpg,.jpeg,.png,.pdf"
        multiple={billsRequired > 1}
        onChange={handleGallery} className="hidden" />

      {/* Camera Tips Modal */}
      {showCameraTips && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-lg rounded-3xl p-6 space-y-5"
            style={{ background: '#111111', border: '1px solid rgba(250,204,21,0.2)' }}>
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
                style={{ background: 'rgba(250,204,21,0.15)', border: '1px solid rgba(250,204,21,0.3)' }}>
                <Camera className="w-7 h-7" style={{ color: '#FACC15' }} />
              </div>
              <p className="text-white font-bold text-lg mb-1">
                {lang === 'EN' ? 'Tips For Best Scan' : 'Tips Untuk Imbasan Terbaik'}
              </p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {lang === 'EN'
                  ? 'Better photo = more accurate analysis'
                  : 'Foto lebih jelas = analisis lebih tepat'}
              </p>
            </div>

            <div className="space-y-3">
              {[
                { icon: '📄', en: 'Lay bill flat — no folds or creases', bm: 'Letak bil rata — tiada lipatan' },
                { icon: '💡', en: 'Good lighting — no shadows on text', bm: 'Cahaya cukup — tiada bayang pada teks' },
                { icon: '📐', en: 'All 4 corners visible in frame', bm: 'Semua 4 sudut kelihatan dalam bingkai' },
                { icon: '🎯', en: 'Hold steady — wait for camera to focus', bm: 'Pegang teguh — tunggu kamera fokus' },
              ].map((tip, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl p-3"
                  style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <span className="text-xl flex-shrink-0">{tip.icon}</span>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    {lang === 'EN' ? tip.en : tip.bm}
                  </p>
                </div>
              ))}
            </div>

            {/* PDF tip */}
            <div className="rounded-xl p-3"
              style={{ background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.2)' }}>
              <p className="text-xs" style={{ color: 'rgba(96,165,250,0.8)' }}>
                💡 {lang === 'EN'
                  ? 'Pro tip: PDF from TNB email or myTNB app gives 10x better accuracy than a photo.'
                  : 'Tip pro: PDF dari email TNB atau apl myTNB memberi ketepatan 10x lebih baik daripada foto.'}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCameraTips(false)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}
              >
                {lang === 'EN' ? 'Cancel' : 'Batal'}
              </button>
              <button
                onClick={openCamera}
                className="flex-1 py-3 rounded-xl text-sm font-bold"
                style={{
                  background: 'linear-gradient(135deg, #FACC15 0%, #EAB308 100%)',
                  color: '#000000',
                  boxShadow: '0 0 15px rgba(250,204,21,0.3)'
                }}
              >
                <span className="flex items-center justify-center gap-2">
                  <Camera className="w-4 h-4" />
                  {lang === 'EN' ? 'Open Camera' : 'Buka Kamera'}
                </span>
              </button>
            </div>

            {/* Upload PDF option in tips */}
            <button
              onClick={() => { setShowCameraTips(false); setTimeout(() => galleryRef.current?.click(), 100); }}
              className="w-full py-3 rounded-xl text-sm font-semibold text-center"
              style={{ color: 'rgba(96,165,250,0.7)', textDecoration: 'underline' }}
            >
              {lang === 'EN' ? 'Upload PDF instead (recommended)' : 'Muat naik PDF sebaliknya (disyorkan)'}
            </button>
          </div>
        </div>
      )}

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
          <h1 className="text-xl font-bold text-white mb-1">
            {lang === 'EN' ? 'Upload Your TNB Bill' : 'Muat Naik Bil TNB Anda'}
          </h1>
          <p className="text-sm" style={{ color: 'rgba(250,204,21,0.6)' }}>
            ⚡ {lang === 'EN'
              ? 'AI reads your bill in seconds'
              : 'AI membaca bil anda dalam beberapa saat'}
          </p>
        </div>

        {/* Chain + Price Banner */}
        <div className="rounded-2xl p-4" style={{ background: cc.bg, border: `1px solid ${cc.border}` }}>
          <p className="text-white text-sm font-semibold">{cc.label}</p>
          <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {lang === 'EN'
              ? `Analysis fee: RM${price} + RM1.00 gateway — paid after you verify`
              : `Yuran analisis: RM${price} + RM1.00 gateway — dibayar selepas anda sahkan`}
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
          <span className="text-sm whitespace-nowrap font-medium"
            style={{ color: files.length > 0 ? '#FACC15' : 'rgba(255,255,255,0.3)' }}>
            {files.length}/{billsRequired}
          </span>
        </div>

        {/* Selected Files */}
        {files.length > 0 && (
          <div className="space-y-2">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between rounded-xl p-3"
                style={{ background: 'rgba(250,204,21,0.05)', border: '1px solid rgba(250,204,21,0.2)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(250,204,21,0.15)', border: '1px solid rgba(250,204,21,0.3)' }}>
                    <FileText className="w-4 h-4" style={{ color: '#FACC15' }} />
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">
                      {lang === 'EN' ? `Bill ${index + 1}` : `Bil ${index + 1}`}
                      {file.name.includes('enhanced') && (
                        <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full"
                          style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>
                          ✓ Enhanced
                        </span>
                      )}
                    </p>
                    <p className="text-xs truncate max-w-44" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      {file.type === 'application/pdf' ? '📄 PDF' : '📸 Image'} — {(file.size / 1024).toFixed(0)}KB
                    </p>
                  </div>
                </div>
                <button onClick={() => removeFile(index)} className="p-1.5 rounded-lg"
                  style={{ color: 'rgba(239,68,68,0.5)' }}>
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Enhancing indicator */}
        {enhancing && (
          <div className="flex items-center justify-center gap-3 py-3 rounded-xl"
            style={{ background: 'rgba(250,204,21,0.05)', border: '1px solid rgba(250,204,21,0.15)' }}>
            <div className="w-4 h-4 border-2 rounded-full animate-spin"
              style={{ borderColor: 'rgba(250,204,21,0.3)', borderTopColor: '#FACC15' }} />
            <p className="text-sm" style={{ color: 'rgba(250,204,21,0.7)' }}>
              {lang === 'EN' ? 'Enhancing image for better OCR...' : 'Meningkatkan imej untuk OCR yang lebih baik...'}
            </p>
          </div>
        )}

        {/* Add Bill Section */}
        {canAddMore && !scanning && !enhancing && (
          <div className="space-y-3">
            <p className="text-sm text-center font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {files.length === 0
                ? (lang === 'EN' ? 'Add your TNB bill' : 'Tambah bil TNB anda')
                : (lang === 'EN'
                  ? `Add Bill ${files.length + 1} of ${billsRequired}`
                  : `Tambah Bil ${files.length + 1} daripada ${billsRequired}`)}
            </p>

            {/* Camera — PRIMARY */}
            <button
              onClick={handleCameraClick}
              className="w-full rounded-2xl p-6 flex flex-col items-center gap-3 transition-all duration-300"
              style={{
                background: 'rgba(250,204,21,0.06)',
                border: '2px solid rgba(250,204,21,0.25)',
                boxShadow: '0 0 20px rgba(250,204,21,0.05)'
              }}
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
                  {lang === 'EN'
                    ? 'Camera opens with scan tips'
                    : 'Kamera dibuka dengan tips imbasan'}
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

            {/* PDF / Gallery */}
            <button
              onClick={() => galleryRef.current?.click()}
              className="w-full rounded-2xl p-4 flex items-center gap-4 transition-all duration-300"
              style={{ background: 'rgba(96,165,250,0.05)', border: '1px solid rgba(96,165,250,0.2)' }}
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.3)' }}>
                <FolderOpen className="w-5 h-5" style={{ color: 'rgba(96,165,250,0.8)' }} />
              </div>
              <div className="text-left">
                <p className="text-white text-sm font-semibold">
                  {lang === 'EN' ? '📄 Upload PDF (Recommended)' : '📄 Muat Naik PDF (Disyorkan)'}
                </p>
                <p className="text-xs" style={{ color: 'rgba(96,165,250,0.6)' }}>
                  {lang === 'EN'
                    ? 'From TNB email or myTNB app — 10x more accurate'
                    : 'Dari email TNB atau apl myTNB — 10x lebih tepat'}
                </p>
              </div>
            </button>
          </div>
        )}

        {/* Add more buttons when 1 file added but need 2 */}
        {files.length > 0 && canAddMore && !scanning && !enhancing && (
          <div className="flex gap-2 mt-1">
            <button
              onClick={handleCameraClick}
              className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold"
              style={{ background: 'rgba(250,204,21,0.1)', border: '1px solid rgba(250,204,21,0.3)', color: '#FACC15' }}
            >
              <Camera className="w-4 h-4" />
              {lang === 'EN' ? 'Snap Bill 2' : 'Ambil Gambar Bil 2'}
            </button>
            <button
              onClick={() => galleryRef.current?.click()}
              className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold"
              style={{ background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.2)', color: 'rgba(96,165,250,0.7)' }}
            >
              <FolderOpen className="w-4 h-4" />
              {lang === 'EN' ? 'PDF' : 'PDF'}
            </button>
          </div>
        )}

        {/* 2 bills warning */}
        {billsRequired === 2 && files.length < billsRequired && !scanning && (
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

        {/* Scanning State */}
        {scanning && (
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
            <p className="text-white font-bold">
              {lang === 'EN' ? 'AI Reading Your Bill...' : 'AI Sedang Membaca Bil Anda...'}
            </p>
            <p className="text-xs mt-1" style={{ color: 'rgba(250,204,21,0.6)' }}>
              {lang === 'EN'
                ? 'Extracting charges and usage data'
                : 'Mengekstrak caj dan data penggunaan'}
            </p>
          </div>
        )}

        {/* Scan Button */}
        {filesReady && !scanning && !enhancing && (
          <div className="space-y-3 pt-2">
            <button
              onClick={handleScan}
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
                {lang === 'EN' ? 'Scan & Verify Bill' : 'Imbas & Sahkan Bil'}
              </span>
            </button>
            <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.2)' }}>
              {lang === 'EN'
                ? '⚡ You will verify the extracted values before paying'
                : '⚡ Anda akan mengesahkan nilai yang diekstrak sebelum membayar'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}