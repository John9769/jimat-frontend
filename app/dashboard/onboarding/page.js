'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { saveAppliances, getProfile } from '@/lib/api';
import { t, APPLIANCE_TYPES } from '@/lib/i18n';
import { Plus, Trash2, ArrowLeft, ChevronDown } from 'lucide-react';

const defaultAppliance = {
  roomName: '',
  applianceType: 'AIRCOND',
  brand: '',
  hp: '1.5',
  inverter: false,
  ageYears: '0',
  qty: '1',
  avgHoursDaily: '8'
};

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

const ElectricInput = ({ label, type = 'text', value, onChange, placeholder }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="px-3 py-2.5 rounded-xl text-white text-sm placeholder-gray-600 outline-none transition-all duration-300"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(250,204,21,0.15)' }}
      onFocus={e => e.target.style.border = '1px solid rgba(250,204,21,0.5)'}
      onBlur={e => e.target.style.border = '1px solid rgba(250,204,21,0.15)'}
    />
  </div>
);

const ElectricSelect = ({ label, value, onChange, children }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</label>
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2.5 rounded-xl text-white text-sm outline-none appearance-none transition-all duration-300"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(250,204,21,0.15)' }}
        onFocus={e => e.target.style.border = '1px solid rgba(250,204,21,0.5)'}
        onBlur={e => e.target.style.border = '1px solid rgba(250,204,21,0.15)'}
      >
        {children}
      </select>
      <ChevronDown className="absolute right-3 top-3 w-4 h-4 pointer-events-none"
        style={{ color: 'rgba(250,204,21,0.4)' }} />
    </div>
  </div>
);

export default function OnboardingPage() {
  const { user, loading, lang } = useAuth();
  const router = useRouter();
  const [appliances, setAppliances] = useState([{ ...defaultAppliance }]);
  const [saving, setSaving] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
    if (user) {
      getProfile()
        .then(res => {
          if (res.data.user.appliances?.length > 0) {
            setAppliances(res.data.user.appliances.map(a => ({
              roomName: a.roomName,
              applianceType: a.applianceType,
              brand: a.brand || '',
              hp: String(a.hp || '1.5'),
              inverter: a.inverter,
              ageYears: String(a.ageYears || '0'),
              qty: String(a.qty || '1'),
              avgHoursDaily: String(a.avgHoursDaily || '8')
            })));
          }
        })
        .finally(() => setPageLoading(false));
    }
  }, [user, loading]);

  const addAppliance = () => setAppliances([...appliances, { ...defaultAppliance }]);

  const removeAppliance = (index) => {
    if (appliances.length === 1) { toast.error('At least 1 appliance required'); return; }
    setAppliances(appliances.filter((_, i) => i !== index));
  };

  const updateAppliance = (index, field, value) => {
    const updated = [...appliances];
    updated[index] = { ...updated[index], [field]: value };
    setAppliances(updated);
  };

  const handleSave = async () => {
    for (const a of appliances) {
      if (!a.roomName || !a.avgHoursDaily) {
        toast.error('Please fill room name and hours for all appliances');
        return;
      }
    }
    setSaving(true);
    try {
      await saveAppliances({ appliances });
      toast.success('Appliances saved!');
      router.push('/dashboard/upload');
    } catch (err) {
      toast.error('Failed to save appliances');
    } finally {
      setSaving(false);
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

  return (
    <div className="min-h-screen relative" style={{ background: '#000000' }}>
      <ElectricBackground />

      {/* Header */}
      <div className="relative z-10 px-4 py-3 flex items-center gap-3 sticky top-0"
        style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(250,204,21,0.1)' }}>
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

      <div className="relative z-10 max-w-lg mx-auto px-4 py-6 pb-32">
        {/* Title */}
        <h1 className="text-xl font-bold text-white mb-1">{t('onboard.title', lang)}</h1>
        <p className="text-sm mb-6" style={{ color: 'rgba(250,204,21,0.6)' }}>
          ⚡ {t('onboard.subtitle', lang)}
        </p>

        {/* Appliance Cards */}
        <div className="space-y-4">
          {appliances.map((appliance, index) => (
            <div key={index} className="rounded-2xl p-4 space-y-3"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(250,204,21,0.15)' }}>

              {/* Card Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold"
                    style={{ background: 'rgba(250,204,21,0.15)', color: '#FACC15', border: '1px solid rgba(250,204,21,0.3)' }}>
                    {index + 1}
                  </div>
                  <span className="text-sm font-semibold" style={{ color: '#FACC15' }}>
                    {lang === 'EN' ? `Appliance ${index + 1}` : `Peralatan ${index + 1}`}
                  </span>
                </div>
                <button onClick={() => removeAppliance(index)}
                  className="transition-colors p-1 rounded-lg"
                  style={{ color: 'rgba(239,68,68,0.6)' }}>
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <ElectricInput
                label={t('onboard.room', lang)}
                value={appliance.roomName}
                onChange={e => updateAppliance(index, 'roomName', e.target.value)}
                placeholder={lang === 'EN' ? 'e.g. Master Bedroom, Hall' : 'cth. Bilik Tidur Utama, Ruang Tamu'}
              />

              <ElectricSelect
                label={t('onboard.type', lang)}
                value={appliance.applianceType}
                onChange={e => updateAppliance(index, 'applianceType', e.target.value)}
              >
                {APPLIANCE_TYPES.map(type => (
                  <option key={type.value} value={type.value} style={{ background: '#111' }}>
                    {type.label[lang] || type.label.EN}
                  </option>
                ))}
              </ElectricSelect>

              {appliance.applianceType === 'AIRCOND' && (
                <div className="grid grid-cols-2 gap-3">
                  <ElectricSelect
                    label={t('onboard.hp', lang)}
                    value={appliance.hp}
                    onChange={e => updateAppliance(index, 'hp', e.target.value)}
                  >
                    {['0.5', '0.75', '1.0', '1.5', '2.0', '2.5'].map(hp => (
                      <option key={hp} value={hp} style={{ background: '#111' }}>{hp} HP</option>
                    ))}
                  </ElectricSelect>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      {t('onboard.inverter', lang)}
                    </label>
                    <div className="flex gap-2">
                      {[true, false].map(val => (
                        <button
                          key={String(val)}
                          type="button"
                          onClick={() => updateAppliance(index, 'inverter', val)}
                          className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all duration-300"
                          style={appliance.inverter === val
                            ? { background: '#FACC15', color: '#000000', boxShadow: '0 0 10px rgba(250,204,21,0.3)' }
                            : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' }
                          }
                        >
                          {val ? (lang === 'EN' ? 'Yes' : 'Ya') : (lang === 'EN' ? 'No' : 'Tidak')}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2">
                <ElectricInput
                  label={t('onboard.age', lang)}
                  type="number"
                  value={appliance.ageYears}
                  onChange={e => updateAppliance(index, 'ageYears', e.target.value)}
                  placeholder="0"
                />
                <ElectricInput
                  label={t('onboard.qty', lang)}
                  type="number"
                  value={appliance.qty}
                  onChange={e => updateAppliance(index, 'qty', e.target.value)}
                  placeholder="1"
                />
                <ElectricInput
                  label={t('onboard.hours', lang)}
                  type="number"
                  value={appliance.avgHoursDaily}
                  onChange={e => updateAppliance(index, 'avgHoursDaily', e.target.value)}
                  placeholder="8"
                />
              </div>

              <ElectricInput
                label={t('onboard.brand', lang)}
                value={appliance.brand}
                onChange={e => updateAppliance(index, 'brand', e.target.value)}
                placeholder="e.g. Daikin, Panasonic"
              />
            </div>
          ))}
        </div>

        {/* Add Appliance Button */}
        <button
          onClick={addAppliance}
          className="w-full mt-4 py-4 rounded-2xl flex items-center justify-center gap-2 text-sm font-medium transition-all duration-300"
          style={{
            border: '2px dashed rgba(250,204,21,0.2)',
            color: 'rgba(250,204,21,0.5)',
            background: 'rgba(250,204,21,0.02)'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.border = '2px dashed rgba(250,204,21,0.5)';
            e.currentTarget.style.color = '#FACC15';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.border = '2px dashed rgba(250,204,21,0.2)';
            e.currentTarget.style.color = 'rgba(250,204,21,0.5)';
          }}
        >
          <Plus className="w-4 h-4" />
          {t('onboard.addAppliance', lang)}
        </button>
      </div>

      {/* Fixed Bottom Save Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 z-20"
        style={{ background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)', borderTop: '1px solid rgba(250,204,21,0.1)' }}>
        <div className="max-w-lg mx-auto">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-300"
            style={{
              background: saving ? 'rgba(250,204,21,0.3)' : 'linear-gradient(135deg, #FACC15 0%, #EAB308 100%)',
              color: '#000000',
              boxShadow: saving ? 'none' : '0 0 20px rgba(250,204,21,0.4)'
            }}
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                {lang === 'EN' ? 'Saving...' : 'Menyimpan...'}
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" fill="#000000" />
                </svg>
                {t('onboard.save', lang)}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}