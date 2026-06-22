export const t = (key, lang = 'EN') => {
  const translations = {
    // App
    'app.name': { EN: 'JIMAT', BM: 'JIMAT' },
    'app.tagline': { EN: 'Stop Your Bill From Bleeding', BM: 'Hentikan Pembaziran Bil Anda' },
    'app.tagline2': { EN: 'Upload your TNB bill. We tell you exactly where your money is going — and how to stop it.', BM: 'Muat naik bil TNB anda. Kami tunjukkan tepat ke mana wang anda pergi — dan cara menghentikannya.' },

    // Auth
    'auth.login': { EN: 'Login', BM: 'Log Masuk' },
    'auth.register': { EN: 'Register', BM: 'Daftar' },
    'auth.logout': { EN: 'Logout', BM: 'Log Keluar' },
    'auth.email': { EN: 'Email Address', BM: 'Alamat Emel' },
    'auth.password': { EN: 'Password', BM: 'Kata Laluan' },
    'auth.name': { EN: 'Full Name', BM: 'Nama Penuh' },
    'auth.phone': { EN: 'Phone Number', BM: 'Nombor Telefon' },
    'auth.forgot': { EN: 'Forgot Password?', BM: 'Lupa Kata Laluan?' },
    'auth.noAccount': { EN: "Don't have an account?", BM: 'Tiada akaun?' },
    'auth.hasAccount': { EN: 'Already have an account?', BM: 'Sudah ada akaun?' },
    'auth.userType': { EN: 'Account Type', BM: 'Jenis Akaun' },
    'auth.household': { EN: 'Household', BM: 'Isi Rumah' },
    'auth.institutional': { EN: 'Institutional (Masjid/Surau/School)', BM: 'Institusi (Masjid/Surau/Sekolah)' },
    'auth.orgName': { EN: 'Organisation Name', BM: 'Nama Organisasi' },
    'auth.postcode': { EN: 'Postcode', BM: 'Poskod' },
    'auth.township': { EN: 'Township / Area', BM: 'Kawasan' },
    'auth.state': { EN: 'State', BM: 'Negeri' },
    'auth.housingType': { EN: 'Housing Type', BM: 'Jenis Kediaman' },

    // Dashboard
    'dash.welcome': { EN: 'Welcome back', BM: 'Selamat kembali' },
    'dash.uploadBill': { EN: 'Upload Bill', BM: 'Muat Naik Bil' },
    'dash.history': { EN: 'Bill History', BM: 'Sejarah Bil' },
    'dash.profile': { EN: 'Profile', BM: 'Profil' },
    'dash.noHistory': { EN: 'No bills uploaded yet', BM: 'Tiada bil dimuat naik lagi' },

    // Onboarding
    'onboard.title': { EN: 'Setup Your Home Profile', BM: 'Tetapkan Profil Rumah Anda' },
    'onboard.subtitle': { EN: 'Tell us about your appliances so we can identify your biggest energy bleeders', BM: 'Beritahu kami tentang peralatan anda supaya kami boleh kenal pasti pembazir tenaga terbesar anda' },
    'onboard.addAppliance': { EN: 'Add Appliance', BM: 'Tambah Peralatan' },
    'onboard.room': { EN: 'Room / Location', BM: 'Bilik / Lokasi' },
    'onboard.type': { EN: 'Appliance Type', BM: 'Jenis Peralatan' },
    'onboard.brand': { EN: 'Brand (optional)', BM: 'Jenama (pilihan)' },
    'onboard.hp': { EN: 'Horsepower (HP)', BM: 'Kuasa Kuda (HP)' },
    'onboard.inverter': { EN: 'Inverter?', BM: 'Penyongsang?' },
    'onboard.age': { EN: 'Age (years)', BM: 'Umur (tahun)' },
    'onboard.qty': { EN: 'Quantity', BM: 'Kuantiti' },
    'onboard.hours': { EN: 'Avg Hours/Day', BM: 'Purata Jam/Hari' },
    'onboard.save': { EN: 'Save & Continue', BM: 'Simpan & Teruskan' },

    // Upload
    'upload.title': { EN: 'Upload Your TNB Bill', BM: 'Muat Naik Bil TNB Anda' },
    'upload.onboard': { EN: 'Upload 2 consecutive months bills to get started', BM: 'Muat naik 2 bil bulan berturut-turut untuk bermula' },
    'upload.monthly': { EN: 'Upload this month\'s bill', BM: 'Muat naik bil bulan ini' },
    'upload.reset': { EN: 'Chain broken. Upload 2 consecutive bills to reset', BM: 'Rantaian terputus. Muat naik 2 bil berturut-turut untuk tetapkan semula' },
    'upload.drag': { EN: 'Drag & drop or click to upload', BM: 'Seret & lepas atau klik untuk muat naik' },
    'upload.formats': { EN: 'JPG, PNG or PDF accepted', BM: 'JPG, PNG atau PDF diterima' },
    'upload.analysing': { EN: 'Analysing your bill...', BM: 'Menganalisis bil anda...' },
    'upload.processing': { EN: 'Our engine is reading your bill. This takes 10-20 seconds.', BM: 'Enjin kami sedang membaca bil anda. Ini mengambil masa 10-20 saat.' },

    // Teaser
    'teaser.title': { EN: 'Your Bill Analysis is Ready', BM: 'Analisis Bil Anda Sudah Siap' },
    'teaser.overspend': { EN: 'Estimated Monthly Overspend', BM: 'Anggaran Pembaziran Bulanan' },
    'teaser.unlock': { EN: 'Unlock Full Report', BM: 'Buka Laporan Penuh' },
    'teaser.locked': { EN: 'Unlock to see your full analysis', BM: 'Buka kunci untuk lihat analisis penuh anda' },
    'teaser.bleeder': { EN: '#1 Bleeder Identified', BM: '#1 Pembazir Dikenal Pasti' },
    'teaser.missions': { EN: '3 Saving Missions Ready', BM: '3 Misi Penjimatan Bersedia' },
    'teaser.comparison': { EN: 'Month vs Month Analysis', BM: 'Analisis Bulan vs Bulan' },
    'teaser.afa': { EN: 'AFA Watch', BM: 'Pantauan AFA' },
    'teaser.disclaimer': { EN: '*Estimated based on your declared appliance profile & TNB published rates', BM: '*Anggaran berdasarkan profil peralatan yang anda isytihar & kadar TNB yang diterbitkan' },
    'teaser.pay': { EN: 'Pay RM{amount} to Unlock', BM: 'Bayar RM{amount} untuk Buka Kunci' },

    // Report
    'report.autopsy': { EN: 'Bill Autopsy', BM: 'Bedah Siasat Bil' },
    'report.bleeder': { EN: 'Your Bleeders', BM: 'Pembazir Anda' },
    'report.missions': { EN: 'Your Missions', BM: 'Misi Anda' },
    'report.comparison': { EN: 'Month vs Month', BM: 'Bulan vs Bulan' },
    'report.afa': { EN: 'AFA Watch', BM: 'Pantauan AFA' },
    'report.disclaimer': { EN: 'Disclaimer', BM: 'Penafian' },
    'report.share': { EN: 'Share My Savings', BM: 'Kongsi Penjimatan Saya' },
    'report.generation': { EN: 'Generation Charge', BM: 'Caj Jana Kuasa' },
    'report.capacity': { EN: 'Capacity Charge', BM: 'Caj Kapasiti' },
    'report.network': { EN: 'Network Charge', BM: 'Caj Rangkaian' },
    'report.retail': { EN: 'Retail Charge', BM: 'Caj Runcit' },
    'report.afa_charge': { EN: 'AFA', BM: 'AFA' },
    'report.eei': { EN: 'Energy Efficiency Incentive', BM: 'Insentif Cekap Tenaga' },
    'report.sst': { EN: 'Service Tax (SST)', BM: 'Cukai Perkhidmatan (SST)' },
    'report.kwtbb': { EN: 'Renewable Energy Fund', BM: 'Dana Tenaga Boleh Baharu' },
    'report.total': { EN: 'Total Bill', BM: 'Jumlah Bil' },
    'report.effective_rate': { EN: 'Effective Rate', BM: 'Kadar Efektif' },
    'report.improved': { EN: '🎉 Great job! Your bill improved this month', BM: '🎉 Tahniah! Bil anda bertambah baik bulan ini' },
    'report.worsened': { EN: '📈 Bill increased this month', BM: '📈 Bil meningkat bulan ini' },
    'report.first_month': { EN: 'This is your first analysis — complete a mission and come back next month to track progress', BM: 'Ini adalah analisis pertama anda — selesaikan misi dan kembali bulan depan untuk jejak kemajuan' },

    // Payment
    'pay.processing': { EN: 'Processing payment...', BM: 'Memproses pembayaran...' },
    'pay.success': { EN: 'Payment successful! Unlocking your report...', BM: 'Pembayaran berjaya! Membuka laporan anda...' },
    'pay.failed': { EN: 'Payment failed. Please try again.', BM: 'Pembayaran gagal. Sila cuba lagi.' },

    // Common
    'common.loading': { EN: 'Loading...', BM: 'Memuatkan...' },
    'common.error': { EN: 'Something went wrong', BM: 'Sesuatu telah silap' },
    'common.retry': { EN: 'Try Again', BM: 'Cuba Lagi' },
    'common.back': { EN: 'Back', BM: 'Kembali' },
    'common.next': { EN: 'Next', BM: 'Seterusnya' },
    'common.save': { EN: 'Save', BM: 'Simpan' },
    'common.cancel': { EN: 'Cancel', BM: 'Batal' },
    'common.delete': { EN: 'Delete', BM: 'Padam' },
    'common.edit': { EN: 'Edit', BM: 'Edit' },
    'common.yes': { EN: 'Yes', BM: 'Ya' },
    'common.no': { EN: 'No', BM: 'Tidak' },
    'common.myr': { EN: 'RM', BM: 'RM' },
    'common.kwh': { EN: 'kWh', BM: 'kWh' },
    'common.month': { EN: 'month', BM: 'bulan' },
    'common.perMonth': { EN: '/month', BM: '/bulan' },
  };

  const entry = translations[key];
  if (!entry) return key;
  return entry[lang] || entry['EN'] || key;
};

export const STATES = [
  'Johor', 'Kedah', 'Kelantan', 'Melaka', 'Negeri Sembilan',
  'Pahang', 'Perak', 'Perlis', 'Pulau Pinang', 'Sabah',
  'Sarawak', 'Selangor', 'Terengganu', 'W.P. Kuala Lumpur',
  'W.P. Labuan', 'W.P. Putrajaya'
];

export const HOUSING_TYPES = [
  'Apartment / Flat',
  'Condominium',
  'Terraced House',
  'Semi-Detached',
  'Bungalow',
  'Masjid / Surau',
  'School',
  'Community Hall',
  'Other'
];

export const APPLIANCE_TYPES = [
  { value: 'AIRCOND', label: { EN: 'Air Conditioner', BM: 'Penghawa Dingin' } },
  { value: 'WATER_HEATER', label: { EN: 'Water Heater', BM: 'Pemanas Air' } },
  { value: 'REFRIGERATOR', label: { EN: 'Refrigerator', BM: 'Peti Sejuk' } },
  { value: 'WASHING_MACHINE', label: { EN: 'Washing Machine', BM: 'Mesin Basuh' } },
  { value: 'TV', label: { EN: 'Television', BM: 'Televisyen' } },
  { value: 'LIGHTS', label: { EN: 'Lights / Bulbs', BM: 'Lampu' } },
  { value: 'WATER_PUMP', label: { EN: 'Water Pump', BM: 'Pam Air' } },
  { value: 'RICE_COOKER', label: { EN: 'Rice Cooker', BM: 'Periuk Nasi' } },
  { value: 'MICROWAVE', label: { EN: 'Microwave', BM: 'Ketuhar Gelombang Mikro' } },
  { value: 'OVEN', label: { EN: 'Oven', BM: 'Ketuhar' } },
  { value: 'COMPUTER', label: { EN: 'Computer / Laptop', BM: 'Komputer / Laptop' } },
  { value: 'FAN', label: { EN: 'Fan', BM: 'Kipas' } },
  { value: 'IRON', label: { EN: 'Iron', BM: 'Seterika' } },
  { value: 'WIFI_ROUTER', label: { EN: 'WiFi Router', BM: 'Router WiFi' } },
  { value: 'OTHER', label: { EN: 'Other', BM: 'Lain-lain' } },
];