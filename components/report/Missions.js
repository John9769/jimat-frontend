'use client';
import { useRouter } from 'next/navigation';
import { CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';

export default function Missions({ missions, lang }) {
  const router = useRouter();

  const missionList = Array.isArray(missions) ? missions : missions?.missions || [];
  const totalSaving = Array.isArray(missions) ? null : missions?.totalSaving;

  if (!missionList || missionList.length === 0) {
    return (
      <div className="rounded-2xl p-8 text-center"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
          {lang === 'EN' ? 'No missions available. Update your appliance profile.' : 'Tiada misi tersedia. Kemaskini profil peralatan anda.'}
        </p>
      </div>
    );
  }

  const getCardStyle = (mission, isFirst) => {
    if (mission.isCoverageAlert) {
      return { background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.3)' };
    }
    if (mission.isBehaviourMission) {
      return { background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.3)' };
    }
    return isFirst
      ? { background: 'rgba(250,204,21,0.06)', border: '1px solid rgba(250,204,21,0.25)' }
      : { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' };
  };

  const getTag = (mission) => {
    if (mission.isCoverageAlert) {
      return { label: lang === 'EN' ? 'Action Needed' : 'Perlu Tindakan', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' };
    }
    if (mission.isBehaviourMission) {
      return { label: lang === 'EN' ? 'This Month' : 'Bulan Ini', color: '#60a5fa', bg: 'rgba(96,165,250,0.12)' };
    }
    return null;
  };

  return (
    <div className="space-y-4">

      {totalSaving > 0 && (
        <div className="rounded-2xl p-4"
          style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)' }}>
          <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {lang === 'EN' ? 'Do these missions to save est.' : 'Laksanakan misi ini untuk jimat anggaran'}
          </p>
          <p className="text-3xl font-black" style={{ color: '#22c55e' }}>
            RM{totalSaving?.toFixed(2)}
            <span className="text-sm font-normal ml-1" style={{ color: 'rgba(34,197,94,0.6)' }}>
              /{lang === 'EN' ? 'month' : 'bulan'}
            </span>
          </p>
          <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
            {lang === 'EN' ? 'Based on your declared appliances' : 'Berdasarkan peralatan yang anda isytiharkan'}
          </p>
        </div>
      )}

      <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
        {lang === 'EN' ? 'Complete these missions before your next bill cycle' : 'Selesaikan misi ini sebelum kitaran bil seterusnya'}
      </p>

      {missionList.map((mission, i) => {
        const tag = getTag(mission);
        return (
          <div key={i} className="rounded-2xl p-4 space-y-3" style={getCardStyle(mission, i === 0)}>
            <div className="flex items-start gap-3">
              <span className="text-2xl">{mission.icon}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1 gap-2">
                  <p className="text-white font-bold text-sm">{mission.title}</p>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {tag && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: tag.bg, color: tag.color }}>
                        {tag.label}
                      </span>
                    )}
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}>
                      #{mission.priority}
                    </span>
                  </div>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  {mission.description}
                </p>
                {mission.appliance && (
                  <p className="text-xs mt-1" style={{ color: 'rgba(96,165,250,0.8)' }}>
                    📍 {mission.appliance}
                  </p>
                )}
              </div>
            </div>

            {mission.estimatedSavingMyr > 0 && (
              <div className="flex items-center justify-between rounded-xl px-3 py-2"
                style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)' }}>
                <p className="text-xs font-medium" style={{ color: 'rgba(34,197,94,0.8)' }}>
                  {lang === 'EN' ? 'Est. saving' : 'Anggaran jimat'}
                </p>
                <p className="font-bold text-sm" style={{ color: '#22c55e' }}>
                  RM{mission.estimatedSavingMyr?.toFixed(2)}/{lang === 'EN' ? 'month' : 'bulan'}
                </p>
              </div>
            )}

            {mission.actionButton && (
              <button onClick={() => router.push('/dashboard/onboarding')}
                className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-300"
                style={{ background: '#ef4444', color: '#ffffff' }}>
                {mission.actionButton}
              </button>
            )}
          </div>
        );
      })}

      <div className="rounded-2xl p-4"
        style={{ background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.2)' }}>
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="w-4 h-4" style={{ color: '#60a5fa' }} />
          <p className="text-sm font-medium" style={{ color: '#60a5fa' }}>
            {lang === 'EN' ? 'How to track progress' : 'Cara jejak kemajuan'}
          </p>
        </div>
        <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
          {lang === 'EN'
            ? 'Complete your missions and upload next month\'s bill. JIMAT will show you exactly how much you saved.'
            : 'Selesaikan misi anda dan muat naik bil bulan depan. JIMAT akan tunjukkan tepat berapa yang anda jimat.'}
        </p>
      </div>
    </div>
  );
}