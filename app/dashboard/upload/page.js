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
import { Zap, ArrowLeft, Upload, FileText, X, AlertCircle } from 'lucide-react';

export default function UploadPage() {
  const { user, loading, lang } = useAuth();
  const router = useRouter();
  const [chain, setChain] = useState(null);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const fileRef = useRef(null);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
    if (user) {
      getChainInfo()
        .then(res => setChain(res.data))
        .catch(() => toast.error('Failed to load chain info'))
        .finally(() => setPageLoading(false));
    }
  }, [user, loading]);

  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files);
    const maxFiles = chain?.chain?.billsRequired || 2;

    if (selected.length > maxFiles) {
      toast.error(`Only ${maxFiles} file(s) allowed`);
      return;
    }

    const valid = selected.filter(f => {
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

    setFiles(valid);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    const required = chain?.chain?.billsRequired || 2;
    if (files.length < required) {
      toast.error(`Please upload ${required} bill(s)`);
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach(f => formData.append('bills', f));

      const res = await uploadBills(formData);
      const { teaser, pricing } = res.data;

      toast.success('Bills analysed successfully!');
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
    ONBOARD: {
      label: lang === 'EN' ? '🆕 New User — Upload 2 consecutive bills' : '🆕 Pengguna Baru — Muat naik 2 bil berturut-turut',
      color: 'blue'
    },
    MONTHLY: {
      label: lang === 'EN' ? '✅ Loyal User — Upload this month\'s bill' : '✅ Pengguna Setia — Muat naik bil bulan ini',
      color: 'green'
    },
    RESET: {
      label: lang === 'EN' ? '⚠️ Chain Broken — Upload 2 consecutive bills to reset' : '⚠️ Rantaian Terputus — Muat naik 2 bil berturut-turut untuk tetapkan semula',
      color: 'red'
    }
  };

  const config = statusConfig[chainStatus];

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

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="text-xl font-bold text-white mb-1">{t('upload.title', lang)}</h1>
          <p className="text-gray-400 text-sm">{t(`upload.${chainStatus.toLowerCase()}`, lang)}</p>
        </div>

        {/* Status Banner */}
        <div className={`rounded-2xl p-4 border ${
          config.color === 'green' ? 'bg-green-500/10 border-green-500/30' :
          config.color === 'red' ? 'bg-red-500/10 border-red-500/30' :
          'bg-blue-500/10 border-blue-500/30'
        }`}>
          <p className="text-white text-sm">{config.label}</p>
          <p className="text-gray-400 text-xs mt-1">
            {lang === 'EN' ? `Payment: RM${price} + RM1.00 gateway fee` : `Bayaran: RM${price} + RM1.00 yuran gateway`}
          </p>
        </div>

        {/* Upload Zone */}
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-gray-700 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-green-500 transition-colors"
        >
          <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
            <Upload className="w-6 h-6 text-green-500" />
          </div>
          <div className="text-center">
            <p className="text-white text-sm font-medium">{t('upload.drag', lang)}</p>
            <p className="text-gray-500 text-xs mt-1">{t('upload.formats', lang)}</p>
            <p className="text-gray-600 text-xs mt-1">
              {lang === 'EN' ? `Max ${billsRequired} file(s)` : `Maksimum ${billsRequired} fail`}
            </p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            multiple={billsRequired === 2}
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Selected Files */}
        {files.length > 0 && (
          <div className="space-y-2">
            <p className="text-gray-400 text-sm font-medium">
              {lang === 'EN' ? 'Selected Files' : 'Fail Dipilih'} ({files.length}/{billsRequired})
            </p>
            {files.map((file, index) => (
              <Card key={index} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-green-500" />
                  </div>
                  <div>
                    <p className="text-white text-sm truncate max-w-48">{file.name}</p>
                    <p className="text-gray-500 text-xs">{(file.size / 1024).toFixed(0)} KB</p>
                  </div>
                </div>
                <button onClick={() => removeFile(index)} className="text-gray-500 hover:text-red-400">
                  <X className="w-4 h-4" />
                </button>
              </Card>
            ))}
          </div>
        )}

        {/* Warning if 2 bills required */}
        {billsRequired === 2 && (
          <div className="flex gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3">
            <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
            <p className="text-yellow-500 text-xs">
              {lang === 'EN'
                ? 'Upload 2 consecutive months e.g. April + May. Bills must be from the same account.'
                : 'Muat naik 2 bulan berturut-turut cth. April + Mei. Bil mesti dari akaun yang sama.'}
            </p>
          </div>
        )}

        {/* Analysing state */}
        {uploading && (
          <Card className="text-center py-6">
            <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-white font-medium text-sm">{t('upload.analysing', lang)}</p>
            <p className="text-gray-400 text-xs mt-1">{t('upload.processing', lang)}</p>
          </Card>
        )}

        {/* Upload Button */}
        {!uploading && (
          <Button
            onClick={handleUpload}
            disabled={files.length < billsRequired}
            fullWidth
          >
            <Upload className="w-4 h-4" />
            {lang === 'EN' ? `Analyse My Bill${billsRequired > 1 ? 's' : ''}` : `Analisis Bil Saya`}
          </Button>
        )}

        {/* Disclaimer */}
        <p className="text-gray-600 text-xs text-center">
          {lang === 'EN'
            ? 'Your bill is read by AI and immediately discarded. We do not store your bill images.'
            : 'Bil anda dibaca oleh AI dan dibuang serta-merta. Kami tidak menyimpan imej bil anda.'}
        </p>
      </div>
    </div>
  );
}