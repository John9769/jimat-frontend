'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { getChainInfo, uploadBills } from '@/lib/api';
import { t } from '@/lib/i18n';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Zap, ArrowLeft, Upload, FileText, X, AlertCircle, Camera, Image } from 'lucide-react';

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
    if (e.target.files?.length) {
      addFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleGallery = (e) => {
    if (e.target.files?.length) {
      addFiles(e.target.files);
      e.target.value = '';
    }
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    const required = chain?.chain?.billsRequired || 2;
    if (files.length < required) {
      toast.error(lang === 'EN'
        ? `Please add ${required} bill(s) first`
        : `Sila tambah ${required} bil dahulu`);
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

  if (loading || pageLoading) return <LoadingSpinner />;

  const billsRequired = chain?.chain?.billsRequired || 2;
  const chainStatus = chain?.chain?.status || 'ONBOARD';
  const price = chain?.pricing?.price || 11.99;

  const statusConfig = {
    ONBOARD: { label: lang === 'EN' ? '🆕 New — Upload 2 consecutive bills' : '🆕 Baru — Muat naik 2 bil berturut-turut', color: 'blue' },
    MONTHLY: { label: lang === 'EN' ? '✅ Loyal — Upload this month bill' : '✅ Setia — Muat naik bil bulan ini', color: 'green' },
    RESET:   { label: lang === 'EN' ? '⚠️ Chain Broken — Upload 2 bills to reset' : '⚠️ Rantaian Terputus — Muat naik 2 bil untuk tetapkan semula', color: 'red' }
  };

  const config = statusConfig[chainStatus];
  const filesReady = files.length >= billsRequired;

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-green-500" />
          <span className="font-bold text-white">JIMAT</span>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">

        {/* Title */}
        <div>
          <h1 className="text-xl font-bold text-white mb-1">{t('upload.title', lang)}</h1>
          <p className="text-gray-400 text-sm">{t(`upload.${chainStatus.toLowerCase()}`, lang)}</p>
        </div>

        {/* Status + Price Banner */}
        <div className={`rounded-2xl p-4 border ${
          config.color === 'green' ? 'bg-green-500/10 border-green-500/30' :
          config.color === 'red'   ? 'bg-red-500/10 border-red-500/30' :
                                     'bg-blue-500/10 border-blue-500/30'
        }`}>
          <p className="text-white text-sm font-medium">{config.label}</p>
          <p className="text-gray-400 text-xs mt-1">
            {lang === 'EN' ? `Payment after analysis: RM${price} + RM1.00 gateway` : `Bayaran selepas analisis: RM${price} + RM1.00 gateway`}
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center gap-3">
          {Array.from({ length: billsRequired }).map((_, i) => (
            <div key={i} className={`flex-1 h-2 rounded-full transition-all ${
              i < files.length ? 'bg-green-500' : 'bg-gray-800'
            }`} />
          ))}
          <span className="text-gray-400 text-sm whitespace-nowrap">
            {files.length}/{billsRequired} {lang === 'EN' ? 'bill(s)' : 'bil'}
          </span>
        </div>

        {/* Selected Files */}
        {files.length > 0 && (
          <div className="space-y-2">
            {files.map((file, index) => (
              <Card key={index} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-green-500" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">
                      {lang === 'EN' ? `Bill ${index + 1}` : `Bil ${index + 1}`}
                    </p>
                    <p className="text-gray-500 text-xs truncate max-w-48">{file.name}</p>
                  </div>
                </div>
                <button onClick={() => removeFile(index)} className="text-gray-500 hover:text-red-400 p-1">
                  <X className="w-4 h-4" />
                </button>
              </Card>
            ))}
          </div>
        )}

        {/* Add Bill Buttons — show if still need more files */}
        {files.length < billsRequired && !uploading && (
          <div className="space-y-3">
            <p className="text-gray-400 text-sm text-center">
              {lang === 'EN'
                ? `Add Bill ${files.length + 1} of ${billsRequired}`
                : `Tambah Bil ${files.length + 1} daripada ${billsRequired}`}
            </p>

            {/* Camera Button — Mobile primary */}
            <button
              onClick={() => cameraRef.current?.click()}
              className="w-full bg-green-500/10 border-2 border-green-500/30 hover:border-green-500 rounded-2xl p-6 flex flex-col items-center gap-3 transition-all"
            >
              <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center">
                <Camera className="w-7 h-7 text-gray-950" />
              </div>
              <div className="text-center">
                <p className="text-white font-semibold">
                  {lang === 'EN' ? 'Take Photo of Bill' : 'Ambil Gambar Bil'}
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  {lang === 'EN' ? 'Use your camera to capture the bill' : 'Gunakan kamera untuk tangkap bil'}
                </p>
              </div>
            </button>
            <input
              ref={cameraRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleCamera}
              className="hidden"
            />

            {/* Gallery / File Button */}
            <button
              onClick={() => galleryRef.current?.click()}
              className="w-full bg-gray-900 border border-gray-700 hover:border-gray-500 rounded-2xl p-4 flex items-center gap-4 transition-all"
            >
              <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center flex-shrink-0">
                <Image className="w-5 h-5 text-gray-400" />
              </div>
              <div className="text-left">
                <p className="text-white text-sm font-medium">
                  {lang === 'EN' ? 'Choose from Gallery / Files' : 'Pilih dari Galeri / Fail'}
                </p>
                <p className="text-gray-500 text-xs">
                  {lang === 'EN' ? 'JPG, PNG or PDF accepted' : 'JPG, PNG atau PDF diterima'}
                </p>
              </div>
            </button>
            <input
              ref={galleryRef}
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleGallery}
              className="hidden"
            />
          </div>
        )}

        {/* Warning if 2 bills required */}
        {billsRequired === 2 && files.length < billsRequired && (
          <div className="flex gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3">
            <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
            <p className="text-yellow-500 text-xs">
              {lang === 'EN'
                ? 'Upload 2 consecutive months e.g. May + June. Bills must be from the same TNB account.'
                : 'Muat naik 2 bulan berturut-turut cth. Mei + Jun. Bil mesti dari akaun TNB yang sama.'}
            </p>
          </div>
        )}

        {/* Analysing State */}
        {uploading && (
          <Card className="text-center py-8">
            <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white font-semibold">{t('upload.analysing', lang)}</p>
            <p className="text-gray-400 text-sm mt-1">{t('upload.processing', lang)}</p>
          </Card>
        )}

        {/* Analyse Button — only show when all files ready */}
        {filesReady && !uploading && (
          <div className="space-y-3">
            <Button onClick={handleUpload} fullWidth className="py-4 text-base">
              <Zap className="w-5 h-5" />
              {lang === 'EN' ? 'Analyse My Bills' : 'Analisis Bil Saya'}
            </Button>
            <p className="text-gray-600 text-xs text-center">
              {lang === 'EN'
                ? 'AI reads your bill and immediately discards it. We never store your bill images.'
                : 'AI membaca bil anda dan membuangnya serta-merta. Kami tidak menyimpan imej bil anda.'}
            </p>
          </div>
        )}

      </div>
    </div>
  );
}