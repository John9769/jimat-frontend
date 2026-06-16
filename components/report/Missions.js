import Card from '@/components/ui/Card';
import { CheckCircle } from 'lucide-react';

export default function Missions({ missions, lang }) {
  if (!missions || missions.length === 0) {
    return (
      <Card className="text-center py-8">
        <p className="text-gray-400 text-sm">
          {lang === 'EN' ? 'No missions available. Update your appliance profile.' : 'Tiada misi tersedia. Kemaskini profil peralatan anda.'}
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-gray-400 text-sm">
        {lang === 'EN'
          ? 'Complete these missions before your next bill cycle'
          : 'Selesaikan misi ini sebelum kitaran bil seterusnya'}
      </p>

      {missions.map((mission, i) => (
        <Card key={i} className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-2xl">{mission.icon}</span>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <p className="text-white font-semibold text-sm">{mission.title}</p>
                <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">
                  #{mission.priority}
                </span>
              </div>
              <p className="text-gray-400 text-xs leading-relaxed">{mission.description}</p>
              {mission.appliance && (
                <p className="text-blue-400 text-xs mt-1">📍 {mission.appliance}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between bg-green-500/10 rounded-xl px-3 py-2">
            <p className="text-green-400 text-xs font-medium">
              {lang === 'EN' ? 'Potential saving' : 'Penjimatan berpotensi'}
            </p>
            <p className="text-green-500 font-bold text-sm">
              RM{mission.estimatedSavingMyr?.toFixed(2)}/
              {lang === 'EN' ? 'month' : 'bulan'}
            </p>
          </div>
        </Card>
      ))}

      <Card className="bg-blue-500/10 border-blue-500/30">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="w-4 h-4 text-blue-400" />
          <p className="text-blue-400 text-sm font-medium">
            {lang === 'EN' ? 'How to track progress' : 'Cara jejak kemajuan'}
          </p>
        </div>
        <p className="text-gray-400 text-xs leading-relaxed">
          {lang === 'EN'
            ? 'Complete your missions and upload next month\'s bill. JIMAT will show you exactly how much you saved.'
            : 'Selesaikan misi anda dan muat naik bil bulan depan. JIMAT akan tunjukkan tepat berapa yang anda jimat.'}
        </p>
      </Card>
    </div>
  );
}