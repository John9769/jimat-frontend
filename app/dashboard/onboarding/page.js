'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { saveAppliances, getProfile } from '@/lib/api';
import { t, APPLIANCE_TYPES } from '@/lib/i18n';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Zap, Plus, Trash2, ArrowLeft, ChevronDown } from 'lucide-react';

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

  const addAppliance = () => {
    setAppliances([...appliances, { ...defaultAppliance }]);
  };

  const removeAppliance = (index) => {
    if (appliances.length === 1) {
      toast.error('At least 1 appliance required');
      return;
    }
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

  if (loading || pageLoading) return <LoadingSpinner />;

  const selectClass = "bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-green-500 transition-colors w-full appearance-none";

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

      <div className="max-w-lg mx-auto px-4 py-6 pb-32">
        <h1 className="text-xl font-bold text-white mb-1">{t('onboard.title', lang)}</h1>
        <p className="text-gray-400 text-sm mb-6">{t('onboard.subtitle', lang)}</p>

        <div className="space-y-4">
          {appliances.map((appliance, index) => (
            <Card key={index} className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-green-500 text-sm font-semibold">
                  {lang === 'EN' ? `Appliance ${index + 1}` : `Peralatan ${index + 1}`}
                </span>
                <button
                  onClick={() => removeAppliance(index)}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <Input
                label={t('onboard.room', lang)}
                value={appliance.roomName}
                onChange={e => updateAppliance(index, 'roomName', e.target.value)}
                placeholder={lang === 'EN' ? 'e.g. Master Bedroom, Hall' : 'cth. Bilik Tidur Utama, Ruang Tamu'}
              />

              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-400 font-medium">{t('onboard.type', lang)}</label>
                <div className="relative">
                  <select
                    value={appliance.applianceType}
                    onChange={e => updateAppliance(index, 'applianceType', e.target.value)}
                    className={selectClass}
                  >
                    {APPLIANCE_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label[lang] || type.label.EN}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {appliance.applianceType === 'AIRCOND' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-sm text-gray-400 font-medium">{t('onboard.hp', lang)}</label>
                      <div className="relative">
                        <select
                          value={appliance.hp}
                          onChange={e => updateAppliance(index, 'hp', e.target.value)}
                          className={selectClass}
                        >
                          {['0.5', '0.75', '1.0', '1.5', '2.0', '2.5'].map(hp => (
                            <option key={hp} value={hp}>{hp} HP</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm text-gray-400 font-medium">{t('onboard.inverter', lang)}</label>
                      <div className="flex gap-2">
                        {[true, false].map(val => (
                          <button
                            key={String(val)}
                            type="button"
                            onClick={() => updateAppliance(index, 'inverter', val)}
                            className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                              appliance.inverter === val
                                ? 'border-green-500 bg-green-500/10 text-green-500'
                                : 'border-gray-700 text-gray-400'
                            }`}
                          >
                            {val ? (lang === 'EN' ? 'Yes' : 'Ya') : (lang === 'EN' ? 'No' : 'Tidak')}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="grid grid-cols-3 gap-3">
                <Input
                  label={t('onboard.age', lang)}
                  type="number"
                  value={appliance.ageYears}
                  onChange={e => updateAppliance(index, 'ageYears', e.target.value)}
                  placeholder="0"
                />
                <Input
                  label={t('onboard.qty', lang)}
                  type="number"
                  value={appliance.qty}
                  onChange={e => updateAppliance(index, 'qty', e.target.value)}
                  placeholder="1"
                />
                <Input
                  label={t('onboard.hours', lang)}
                  type="number"
                  value={appliance.avgHoursDaily}
                  onChange={e => updateAppliance(index, 'avgHoursDaily', e.target.value)}
                  placeholder="8"
                />
              </div>

              <Input
                label={t('onboard.brand', lang)}
                value={appliance.brand}
                onChange={e => updateAppliance(index, 'brand', e.target.value)}
                placeholder="e.g. Daikin, Panasonic"
              />
            </Card>
          ))}
        </div>

        <button
          onClick={addAppliance}
          className="w-full mt-4 py-3 border-2 border-dashed border-gray-700 rounded-2xl text-gray-400 hover:border-green-500 hover:text-green-500 transition-colors flex items-center justify-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          {t('onboard.addAppliance', lang)}
        </button>
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-950 border-t border-gray-800 p-4">
        <div className="max-w-lg mx-auto">
          <Button onClick={handleSave} loading={saving} fullWidth>
            {t('onboard.save', lang)}
          </Button>
        </div>
      </div>
    </div>
  );
}