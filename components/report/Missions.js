import Card from '@/components/ui/Card';
import { CheckCircle } from 'lucide-react';

export default function Missions({ missions, lang }) {
  // Handle both old format (array) and new format (object with missions + totalSaving)
  const missionList = Array.isArray(missions) ? missions : missions?.missions || [];
  const totalSaving = Array.isArray(missions) ? null : missions?.totalSaving;
  const coverageNote = Array.isArray(missions) ? null : missions?.coverageNote;

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

  // Calculate sum of mission savings
  const missionTotal = missionList.reduce((sum, m) => sum + (m.estimatedSavingMyr || 0), 0);

  return (
    <div className="space-y-4">

      {/* Total saving — matches bleeder total */}
      {totalSaving > 0 && (
        <div className="rounded-2xl p-4"
          style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)' }}>
          <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {lang === 'EN'
              ? 'Do these missions to save est.'
              : 'Laksanakan misi ini untuk jimat anggaran'}
          </p>
          <p className="text-3xl font-black" style={{ color: '#22c55e' }}>
            RM{totalSaving?.toFixed(2)}
            <span className="text-sm font-normal ml-1" style={{ color: 'rgba(34,197,94,0.6)' }}>
              /{lang === 'EN' ? 'month' : 'bulan'}
            </span>
          </p>
          <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
            {lang === 'EN'
              ? `Based on your declared appliances`
              : `Berdasarkan peralatan yang anda isytiharkan`}
          </p>
        </div>
      )}

      <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
        {lang === 'EN'
          ? 'Complete these missions before your next bill cycle'
          : 'Selesaikan misi ini sebelum kitaran bil seterusnya'}
      </p>

      {missionList.map((mission, i) => (
        <div key={i} className="rounded-2xl p-4 space-y-3"
          style={{
            background: i === 0 ? 'rgba(250,204,21,0.06)' : 'rgba(255,255,255,0.02)',
            border: `1px solid ${i === 0 ? 'rgba(250,204,21,0.25)' : 'rgba(255,255,255,0.06)'}`
          }}>
          <div className="flex items-start gap-3">
            <span className="text-2xl">{mission.icon}</span>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <p className="text-white font-bold text-sm">{mission.title}</p>
                <span className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}>
                  #{mission.priority}
                </span>
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

          {/* Saving amount — only show if > 0 */}
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
        </div>
      ))}

      {/* Coverage note — disclaimer only */}
      {coverageNote && (
        <div className="rounded-xl p-3"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
            🔍 {coverageNote}
          </p>
        </div>
      )}

      {/* How to track */}
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