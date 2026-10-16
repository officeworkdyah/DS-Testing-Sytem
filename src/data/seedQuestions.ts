/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Question } from '../types/index.ts';

export const SEED_QUESTIONS: Question[] = [
  // --- BASIC UNITS ---
  {
    id: 'q-seed-004-1',
    unitCode: 'J.62DMI00.004.1',
    unitTitle: 'Mengumpulkan Data',
    level: 'Basic',
    stem: 'Seorang Data Scientist diminta mengumpulkan data transaksi pengguna e-commerce secara kontinu setiap detik untuk mendeteksi transaksi mencurigakan secara instan. Metode pengumpulan data apa yang paling sesuai?',
    options: [
      'Batch processing harian melalui file CSV dump',
      'Streaming data pipeline (misalnya menggunakan Kafka atau Pub/Sub)',
      'Web scraping halaman profil pengguna secara berkala setiap jam',
      'Eksport manual database relasional setiap pergantian shift kerja'
    ],
    correctAnswerIndex: 1,
    explanation: 'Untuk kebutuhan deteksi anomali/fraud berlatensi rendah secara kontinu setiap detik, metode pengumpulan data streaming (seperti Kafka atau GCP Pub/Sub) adalah standar industri sesuai KUK 2.1.',
    status: 'approved',
    audit: { clarity: 5, alignment: 5, unambiguousAnswer: 5, distractorQuality: 5, refinementCount: 0 },
    createdAt: '2026-10-10T08:00:00Z',
    approvedAt: '2026-10-10T08:05:00Z',
    source: 'seed'
  },
  {
    id: 'q-seed-004-2',
    unitCode: 'J.62DMI00.004.1',
    unitTitle: 'Mengumpulkan Data',
    level: 'Basic',
    stem: 'Ketika mengumpulkan data melalui API publik pihak ketiga, aspek keamanan dan tata kelola apa yang paling kritis untuk dipatuhi pengembang?',
    options: [
      'Menyimpan API token secara publik dalam repositori kode git agar mudah diakses tim',
      'Mengabaikan rate limiting (batasan frekuensi pemanggilan) agar data cepat terkumpul',
      'Mengamankan kredensial API melalui environment variables dan mematuhi batasan rate limiting',
      'Melakukan scraping tanpa membaca aturan Terms of Service penyedia data'
    ],
    correctAnswerIndex: 2,
    explanation: 'KUK 2.2 menekankan pengumpulan data dengan memperhatikan aspek keamanan, termasuk perlindungan token akses dan kepatuhan batasan permintaan (rate limit).',
    status: 'approved',
    audit: { clarity: 5, alignment: 5, unambiguousAnswer: 5, distractorQuality: 5, refinementCount: 0 },
    createdAt: '2026-10-10T08:10:00Z',
    approvedAt: '2026-10-10T08:15:00Z',
    source: 'seed'
  },
  {
    id: 'q-seed-004-3',
    unitCode: 'J.62DMI00.004.1',
    unitTitle: 'Mengumpulkan Data',
    level: 'Basic',
    stem: 'Format data semi-terstruktur manakah yang paling sering digunakan dalam pertukaran data API berbasis web?',
    options: [
      'Format JSON (JavaScript Object Notation)',
      'Format binary raw executable',
      'Format gambar Bitmap (.bmp)',
      'Format arsip terkompresi .tar.gz tanpa metadata'
    ],
    correctAnswerIndex: 0,
    explanation: 'JSON adalah format teks terbuka standar yang ringan dan paling umum digunakan untuk transfer data RESTful API (KUK 1.2).',
    status: 'approved',
    audit: { clarity: 5, alignment: 5, unambiguousAnswer: 5, distractorQuality: 5, refinementCount: 0 },
    createdAt: '2026-10-10T08:20:00Z',
    approvedAt: '2026-10-10T08:22:00Z',
    source: 'seed'
  },
  {
    id: 'q-seed-005-1',
    unitCode: 'J.62DMI00.005.1',
    unitTitle: 'Menelaah Data',
    level: 'Basic',
    stem: 'Jika sebuah variabel numerik memiliki distribusi yang sangat condong ke kanan (right-skewed / positive skewness), ukuran pemusatan data (central tendency) manakah yang paling tahan (robust) terhadap pencilan?',
    options: [
      'Rata-rata aritmatika (Mean)',
      'Nilai tengah (Median)',
      'Standar deviasi',
      'Variansi kuadrat'
    ],
    correctAnswerIndex: 1,
    explanation: 'Median tidak terpengaruh oleh nilai-nilai ekstrem di ekor distribusi, sehingga merupakan ukuran pemusatan yang robust untuk distribusi menceng (skewed) sesuai KUK 1.2.',
    status: 'approved',
    audit: { clarity: 5, alignment: 5, unambiguousAnswer: 5, distractorQuality: 5, refinementCount: 0 },
    createdAt: '2026-10-10T08:30:00Z',
    approvedAt: '2026-10-10T08:31:00Z',
    source: 'seed'
  },
  {
    id: 'q-seed-005-2',
    unitCode: 'J.62DMI00.005.1',
    unitTitle: 'Menelaah Data',
    level: 'Basic',
    stem: 'Visualisasi manakah yang paling efektif untuk menelaah persebaran lima angka ringkasan (minimum, Q1, median, Q3, maksimum) serta mendeteksi dugaan outlier pada satu variabel numerik?',
    options: [
      'Pie Chart (diagram lingkaran)',
      'Box Plot (diagram kotak-garis)',
      'Word Cloud',
      'Sankey Diagram'
    ],
    correctAnswerIndex: 1,
    explanation: 'Box plot menampilkan kuartil 1, median, kuartil 3, serta whisker dan titik-titik nilai pencilan secara visual (KUK 2.1).',
    status: 'approved',
    audit: { clarity: 5, alignment: 5, unambiguousAnswer: 5, distractorQuality: 5, refinementCount: 0 },
    createdAt: '2026-10-10T08:35:00Z',
    approvedAt: '2026-10-10T08:36:00Z',
    source: 'seed'
  },
  {
    id: 'q-seed-006-1',
    unitCode: 'J.62DMI00.006.1',
    unitTitle: 'Memvalidasi Data',
    level: 'Basic',
    stem: 'Dalam dataset pasien rumah sakit, ditemukan rekaman dengan nilai usia "-5" tahun dan tanggal masuk "2035-12-01". Tindakan validasi apa yang harus diambil?',
    options: [
      'Membiarkan nilai tersebut karena model machine learning akan otomatis memperbaikinya',
      'Mengubah tipe data menjadi teks tanpa memberi tanda apapun',
      'Mengidentifikasi rekaman tersebut sebagai pelanggaran aturan domain (domain constraint violation) dan mencatatnya dalam laporan validasi',
      'Langsung menghapus seluruh kolom usia dan tanggal masuk dari dataset'
    ],
    correctAnswerIndex: 2,
    explanation: 'KUK 1.2 dan 2.2 mewajibkan pemeriksaan konsistensi terhadap batasan rasional domain dan mendokumentasikan status keabsahan data dalam laporan validasi.',
    status: 'approved',
    audit: { clarity: 5, alignment: 5, unambiguousAnswer: 5, distractorQuality: 5, refinementCount: 0 },
    createdAt: '2026-10-10T08:40:00Z',
    approvedAt: '2026-10-10T08:42:00Z',
    source: 'seed'
  },
  {
    id: 'q-seed-007-1',
    unitCode: 'J.62DMI00.007.1',
    unitTitle: 'Menentukan Objek Data',
    level: 'Basic',
    stem: 'Jika populasi data nasabah perbankan memiliki proporsi kelas yang sangat berbeda antar segmen (misal 90% ritel reguler dan 10% nasabah prioritas), teknik pengambilan sampel apa yang menjaga proporsi tersebut tetap seimbang?',
    options: [
      'Simple Random Sampling murni tanpa pengelompokan',
      'Stratified Random Sampling (Sampling Acak Berstrata)',
      'Convenience Sampling (hanya mengambil data paling mudah diakses)',
      'Snowball Sampling'
    ],
    correctAnswerIndex: 1,
    explanation: 'Stratified sampling membagi populasi menjadi sub-populasi (strata) dan mengambil sampel dari tiap strata dengan proporsi yang sesuai (KUK 1.2).',
    status: 'approved',
    audit: { clarity: 5, alignment: 5, unambiguousAnswer: 5, distractorQuality: 5, refinementCount: 0 },
    createdAt: '2026-10-10T08:50:00Z',
    approvedAt: '2026-10-10T08:51:00Z',
    source: 'seed'
  },
  {
    id: 'q-seed-008-1',
    unitCode: 'J.62DMI00.008.1',
    unitTitle: 'Membersihkan Data',
    level: 'Basic',
    stem: 'Sebuah kolom fitur numerik penting memiliki 4% nilai hilang (missing values) yang berdistribusi acak (MCAR). Pendekatan pembersihan data apa yang lazim dan aman digunakan tanpa menghilangkan sampel secara drastis?',
    options: [
      'Menghapus seluruh kolom fitur tersebut beserta kolom lainnya',
      'Mengisi (imputasi) nilai hilang dengan median atau mean dari kolom tersebut',
      'Mengisi dengan angka 999999 tanpa standarisasi',
      'Mengganti nama kolom tanpa melakukan imputasi'
    ],
    correctAnswerIndex: 1,
    explanation: 'Imputasi dengan statistik deskriptif seperti median/mean atau algoritma KNN imputer adalah solusi standar untuk missing value kecil pada MCAR sesuai KUK 1.1.',
    status: 'approved',
    audit: { clarity: 5, alignment: 5, unambiguousAnswer: 5, distractorQuality: 5, refinementCount: 0 },
    createdAt: '2026-10-10T09:00:00Z',
    approvedAt: '2026-10-10T09:02:00Z',
    source: 'seed'
  },
  {
    id: 'q-seed-008-2',
    unitCode: 'J.62DMI00.008.1',
    unitTitle: 'Membersihkan Data',
    level: 'Basic',
    stem: 'Saat membersihkan data input teks alamat atau nama kota, variasi penulisan seperti "DKI Jakarta", "dki jakarta ", dan "Jakarta Pusat" perlu ditangani dengan:',
    options: [
      'Menghapus seluruh kolom alamat',
      'Standardisasi format melalui case folding (huruf kecil), strip whitespace, dan pemetaan kamus sinonim (canonical mapping)',
      'Membiarkan teks mentah agar model belajar semua permutasi ejaan',
      'Mengubah seluruh teks menjadi angka biner secara acak'
    ],
    correctAnswerIndex: 1,
    explanation: 'KUK 2.2 mengatur standardisasi inkonsistensi format teks melalui normalisasi spasi, case folding, dan mapping kanonikal.',
    status: 'approved',
    audit: { clarity: 5, alignment: 5, unambiguousAnswer: 5, distractorQuality: 5, refinementCount: 0 },
    createdAt: '2026-10-10T09:05:00Z',
    approvedAt: '2026-10-10T09:06:00Z',
    source: 'seed'
  },
  {
    id: 'q-seed-009-1',
    unitCode: 'J.62DMI00.009.1',
    unitTitle: 'Mengkonstruksi Data',
    level: 'Basic',
    stem: 'Dalam mempersiapkan fitur kategori bertipe nominal tanpa urutan (contoh: jenis metode pembayaran: [Transfer, Kartu Kredit, E-Wallet]), teknik encoding apa yang mencegah model mengasumsikan adanya urutan matematis buatan?',
    options: [
      'Label Encoding berurutan (0, 1, 2)',
      'One-Hot Encoding (variabel dummy biner)',
      'Target Encoding tanpa smoothing',
      'Mengalikan teks dengan konstanta phi'
    ],
    correctAnswerIndex: 1,
    explanation: 'One-Hot Encoding membuat kolom biner terpisah untuk setiap kategori sehingga model linier atau berbasis jarak tidak mengasumsikan hubungan ordinal (KUK 1.2).',
    status: 'approved',
    audit: { clarity: 5, alignment: 5, unambiguousAnswer: 5, distractorQuality: 5, refinementCount: 0 },
    createdAt: '2026-10-10T09:10:00Z',
    approvedAt: '2026-10-10T09:12:00Z',
    source: 'seed'
  },
  {
    id: 'q-seed-010-1',
    unitCode: 'J.62DMI00.010.1',
    unitTitle: 'Menentukan Label Data',
    level: 'Basic',
    stem: 'Pada proyek pendeteksian transaksi penipuan (fraud detection), rasio kelas penipuan hanya 0,2% dari total 1 juta transaksi. Masalah apa yang dihadapi dan teknik apa yang dapat dipertimbangkan?',
    options: [
      'Masalah Multikolinearitas; ditangani dengan regresi ridge',
      'Masalah Ketidakseimbangan Kelas (Class Imbalance); ditangani dengan SMOTE, oversampling, atau penyesuaian bobot kelas (class weight)',
      'Masalah Underfitting murni; ditangani dengan menambah layer konvolusi',
      'Masalah Kurangnya Objek Data; ditangani dengan web scraping acak'
    ],
    correctAnswerIndex: 1,
    explanation: 'KUK 2.1 dan 2.2 mengamanatkan deteksi class imbalance dan penerapan strategi penanganan seperti synthetic oversampling (SMOTE) atau class weighting.',
    status: 'approved',
    audit: { clarity: 5, alignment: 5, unambiguousAnswer: 5, distractorQuality: 5, refinementCount: 0 },
    createdAt: '2026-10-10T09:20:00Z',
    approvedAt: '2026-10-10T09:22:00Z',
    source: 'seed'
  },
  {
    id: 'q-seed-011-1',
    unitCode: 'J.62DMI00.011.1',
    unitTitle: 'Mengintegrasikan Data',
    level: 'Basic',
    stem: 'Dua tabel database berbeda ingin digabungkan. Tabel A berisi data master pelanggan (CustomerID unik) dan Tabel B berisi riwayat transaksi harian. Operasi apa yang digunakan untuk memastikan semua transaksi di Tabel B mendapatkan atribut profil dari Tabel A?',
    options: [
      'Cross join cartesian tanpa predikat',
      'Left join dari Tabel B ke Tabel A menggunakan kunci CustomerID',
      'Union vertikal baris demi baris',
      'Inner join dengan mengabaikan CustomerID'
    ],
    correctAnswerIndex: 1,
    explanation: 'Left join dari tabel transaksi ke tabel master memastikan tidak ada catatan transaksi yang hilang sembari menarik atribut pelanggan (KUK 1.2).',
    status: 'approved',
    audit: { clarity: 5, alignment: 5, unambiguousAnswer: 5, distractorQuality: 5, refinementCount: 0 },
    createdAt: '2026-10-10T09:30:00Z',
    approvedAt: '2026-10-10T09:31:00Z',
    source: 'seed'
  },

  // --- INTERMEDIATE UNITS ---
  {
    id: 'q-seed-012-1',
    unitCode: 'J.62DMI00.012.1',
    unitTitle: 'Membangun Skenario Model',
    level: 'Intermediate',
    stem: 'Mengapa pembagian dataset menjadi data latih (train) dan data uji (test) harus dilakukan SEBELUM melakukan rekayasa fitur seperti imputasi rata-rata atau normalisasi standard scaler?',
    options: [
      'Untuk menghemat kapasitas RAM komputer saat menjalankan script',
      'Untuk mencegah kebocoran informasi dari data uji ke dalam proses pelatihan (Data Leakage)',
      'Karena pustaka scikit-learn tidak mendukung transformasi data secara serentak',
      'Agar jumlah baris data uji menjadi lebih banyak daripada data latih'
    ],
    correctAnswerIndex: 1,
    explanation: 'Data leakage terjadi jika parameter transformasi (misal mean atau min/max dari test set) bocor ke dalam data latih, menyebabkan estimasi performa model menjadi bias optimis palsu (KUK 1.2).',
    status: 'approved',
    audit: { clarity: 5, alignment: 5, unambiguousAnswer: 5, distractorQuality: 5, refinementCount: 0 },
    createdAt: '2026-10-10T10:00:00Z',
    approvedAt: '2026-10-10T10:02:00Z',
    source: 'seed'
  },
  {
    id: 'q-seed-012-2',
    unitCode: 'J.62DMI00.012.1',
    unitTitle: 'Membangun Skenario Model',
    level: 'Intermediate',
    stem: 'Pada kasus data time-series (deret waktu) harga saham, metode validasi silang (cross-validation) manakah yang paling tepat untuk menghindari look-ahead bias?',
    options: [
      'K-Fold Cross-Validation acak (shuffled K-fold)',
      'TimeSeriesSplit (Rolling window / forward-chaining CV)',
      'Stratified 10-Fold acak',
      'Leave-One-Out acak'
    ],
    correctAnswerIndex: 1,
    explanation: 'Data time-series memiliki dependensi temporal. Melakukan pengacakan baris akan melanggar urutan waktu. TimeSeriesSplit hanya melatih dengan masa lalu dan menguji di masa depan (KUK 1.2).',
    status: 'approved',
    audit: { clarity: 5, alignment: 5, unambiguousAnswer: 5, distractorQuality: 5, refinementCount: 0 },
    createdAt: '2026-10-10T10:05:00Z',
    approvedAt: '2026-10-10T10:06:00Z',
    source: 'seed'
  },
  {
    id: 'q-seed-013-1',
    unitCode: 'J.62DMI00.013.1',
    unitTitle: 'Membangun Model',
    level: 'Intermediate',
    stem: 'Perbedaan mendasar antara algoritma ensemble Random Forest (Bagging) dan Gradient Boosting (Boosting) terletak pada:',
    options: [
      'Random Forest membangun pohon keputusan secara independen dan paralel, sedangkan Boosting membangun pohon secara sekuensial untuk mengoreksi error pohon sebelumnya',
      'Random Forest hanya untuk regresi, sedangkan Gradient Boosting hanya untuk klasifikasi teks',
      'Gradient Boosting tidak menggunakan pohon keputusan sama sekali',
      'Random Forest selalu menghasilkan satu pohon keputusan tunggal tanpa agregasi'
    ],
    correctAnswerIndex: 0,
    explanation: 'Bagging melatih pohon-pohon independen secara paralel untuk mereduksi variansi, sedangkan Boosting melatih pohon berurutan di mana setiap pohon fokus pada residu error sebelumnya (KUK 2.2).',
    status: 'approved',
    audit: { clarity: 5, alignment: 5, unambiguousAnswer: 5, distractorQuality: 5, refinementCount: 0 },
    createdAt: '2026-10-10T10:15:00Z',
    approvedAt: '2026-10-10T10:17:00Z',
    source: 'seed'
  },
  {
    id: 'q-seed-014-1',
    unitCode: 'J.62DMI00.014.1',
    unitTitle: 'Mengevaluasi Hasil Pemodelan',
    level: 'Intermediate',
    stem: 'Dalam sistem skrining medis penyakit kritis menular, tim medis lebih memprioritaskan agar seminimal mungkin penderita positif yang lolos tanpa terdeteksi (meminimalkan False Negative). Metrik evaluasi utama yang harus dimaksimalkan adalah:',
    options: [
      'Akurasi global (Overall Accuracy)',
      'Sensitivitas / Recall',
      'Presisi (Precision)',
      'Nilai p-value uji ANOVA'
    ],
    correctAnswerIndex: 1,
    explanation: 'Recall = TP / (TP + FN). Memaksimalkan Recall berarti menekan False Negative seminimal mungkin, sangat krusial pada diagnosis penyakit (KUK 1.1).',
    status: 'approved',
    audit: { clarity: 5, alignment: 5, unambiguousAnswer: 5, distractorQuality: 5, refinementCount: 0 },
    createdAt: '2026-10-10T10:30:00Z',
    approvedAt: '2026-10-10T10:32:00Z',
    source: 'seed'
  },
  {
    id: 'q-seed-014-2',
    unitCode: 'J.62DMI00.014.1',
    unitTitle: 'Mengevaluasi Hasil Pemodelan',
    level: 'Intermediate',
    stem: 'Model machine learning Anda menunjukkan akurasi 99% pada data latih (training set), namun akurasinya anjlok menjadi 61% pada data uji (test set). Kondisi ini mengindikasikan masalah:',
    options: [
      'Underfitting (High Bias)',
      'Overfitting (High Variance)',
      'Under-parameterization',
      'Data terlalu bersih dan seimbang'
    ],
    correctAnswerIndex: 1,
    explanation: 'Kesenjangan besar antara performa data latih yang sangat tinggi dan data uji yang rendah adalah tanda klasik overfitting / variansi tinggi (KUK 1.2).',
    status: 'approved',
    audit: { clarity: 5, alignment: 5, unambiguousAnswer: 5, distractorQuality: 5, refinementCount: 0 },
    createdAt: '2026-10-10T10:35:00Z',
    approvedAt: '2026-10-10T10:36:00Z',
    source: 'seed'
  },
  {
    id: 'q-seed-015-1',
    unitCode: 'J.62DMI00.015.1',
    unitTitle: 'Melakukan Proses Review Pemodelan',
    level: 'Intermediate',
    stem: 'Sebelum model disetujui untuk tahap deployment, tim melakukan uji SHAP (SHapley Additive exPlanations). Apa tujuan utama penerapan teknik ini?',
    options: [
      'Mengurangi jumlah memori RAM GPU saat training',
      'Meningkatkan interpretabilitas model kompleks (black box) dengan mengukur kontribusi marginal tiap fitur terhadap prediksi individual',
      'Mengonversi model deep learning menjadi format database SQL',
      'Menghapus secara otomatis semua fitur yang memiliki korelasi negatif'
    ],
    correctAnswerIndex: 1,
    explanation: 'KUK 2.1 menitikberatkan interpretabilitas dan akuntabilitas prediksi model. SHAP menjelaskan kontribusi masing-masing fitur terhadap output model.',
    status: 'approved',
    audit: { clarity: 5, alignment: 5, unambiguousAnswer: 5, distractorQuality: 5, refinementCount: 0 },
    createdAt: '2026-10-10T10:50:00Z',
    approvedAt: '2026-10-10T10:52:00Z',
    source: 'seed'
  },

  // --- ADVANCED UNITS ---
  {
    id: 'q-seed-001-1',
    unitCode: 'J.62DMI00.001.1',
    unitTitle: 'Menentukan Objektif Bisnis',
    level: 'Advanced',
    stem: 'Manajemen perbankan ingin menurunkan tingkat churn nasabah sebesar 15% dalam 2 kuartal ke depan. Sebagai pimpinan proyek data science, langkah awal apa yang harus dipastikan dalam menentukan objektif bisnis?',
    options: [
      'Langsung melatih model Neural Network 100 layer dengan semua data yang ada',
      'Mengidentifikasi definisi spesifik nasabah "churn", dampak finansial hilangnya nasabah, serta kriteria keberhasilan bisnis yang dapat diukur (ROI / penurunan rasio churn)',
      'Membeli server on-premise baru tanpa melakukan studi kelayakan bisnis',
      'Mengganti target bisnis menjadi pembuatan dashboard visualisasi semata'
    ],
    correctAnswerIndex: 1,
    explanation: 'KUK 1.1 dan 1.2 menetapkan bahwa objektif bisnis harus dirumuskan secara terukur, memahami dampak nilai bisnis, dan menetapkan kriteria keberhasilan bisnis kuantitatif.',
    status: 'approved',
    audit: { clarity: 5, alignment: 5, unambiguousAnswer: 5, distractorQuality: 5, refinementCount: 0 },
    createdAt: '2026-10-10T11:00:00Z',
    approvedAt: '2026-10-10T11:03:00Z',
    source: 'seed'
  },
  {
    id: 'q-seed-002-1',
    unitCode: 'J.62DMI00.002.1',
    unitTitle: 'Menentukan Tujuan Teknis Data Science',
    level: 'Advanced',
    stem: 'Objektif bisnis adalah "Mengurangi keterlambatan pengiriman paket kurir". Manakah rumusan tujuan teknis data science yang paling tepat dan terukur?',
    options: [
      'Membuat aplikasi mobile yang disukai kurir',
      'Membangun model regresi estimasi waktu tempuh (ETA) dengan batasan MAE < 8 menit dan latensi respon inferensi API < 150 ms',
      'Menggunakan algoritma paling mutakhir dari paper riset terbaru tanpa mempedulikan latensi',
      'Mengumpulkan data rute sebanyak-banyaknya di media penyimpanan tanpa batasan ukuran'
    ],
    correctAnswerIndex: 1,
    explanation: 'KUK 1.1 dan 2.1 mensyaratkan translasi objektif bisnis ke metrik teknis terukur (MAE < 8 menit) dan batasan operasional sistem (latensi < 150 ms).',
    status: 'approved',
    audit: { clarity: 5, alignment: 5, unambiguousAnswer: 5, distractorQuality: 5, refinementCount: 0 },
    createdAt: '2026-10-10T11:10:00Z',
    approvedAt: '2026-10-10T11:12:00Z',
    source: 'seed'
  },
  {
    id: 'q-seed-003-1',
    unitCode: 'J.62DMI00.003.1',
    unitTitle: 'Membuat Rencana Proyek Data Science',
    level: 'Advanced',
    stem: 'Dalam menyusun rencana proyek data science mengacu metodologi CRISP-DM, fase manakah yang memiliki siklus iteratif kembali ke Data Understanding apabila temuan data awal tidak mendukung rumusan teknis?',
    options: [
      'Hanya fase Deployment saja',
      'Data Preparation dan Business Understanding',
      'Tidak ada fase iteratif dalam CRISP-DM',
      'Fase Evaluasi yang dapat kembali ke Business Understanding sebelum Deployment'
    ],
    correctAnswerIndex: 3,
    explanation: 'CRISP-DM adalah siklus hidup iteratif di mana fase Evaluasi dapat mengembalikan proyek ke fase Business Understanding jika hasil evaluasi tidak memenuhi kriteria keberhasilan bisnis (KUK 1.1).',
    status: 'approved',
    audit: { clarity: 5, alignment: 5, unambiguousAnswer: 5, distractorQuality: 5, refinementCount: 0 },
    createdAt: '2026-10-10T11:20:00Z',
    approvedAt: '2026-10-10T11:22:00Z',
    source: 'seed'
  },
  {
    id: 'q-seed-016-1',
    unitCode: 'J.62DMI00.016.1',
    unitTitle: 'Membuat Rencana Deployment Model',
    level: 'Advanced',
    stem: 'Sebuah sistem scoring kredit bank membutuhkan inferensi waktu-nyata saat nasabah menekan tombol ajukan pinjaman di aplikasi mobile. Pola arsitektur deployment apa yang paling cocok direncanakan?',
    options: [
      'Batch offline inference yang dijalankan sekali seminggu di malam hari',
      'Real-time Microservice REST API atau gRPC yang dibungkus Docker container dengan auto-scaling',
      'Mengirimkan file jupyter notebook mentah kepada nasabah untuk dieksekusi di ponsel',
      'Menulis ulang bobot model secara manual ke dalam lembar kerja spreadsheet'
    ],
    correctAnswerIndex: 1,
    explanation: 'KUK 1.1 dan 1.2 merinci pemilihan pola inferensi sesuai kebutuhan waktu nyata (real-time API containerized microservice) dengan kapabilitas skalabilitas.',
    status: 'approved',
    audit: { clarity: 5, alignment: 5, unambiguousAnswer: 5, distractorQuality: 5, refinementCount: 0 },
    createdAt: '2026-10-10T11:30:00Z',
    approvedAt: '2026-10-10T11:32:00Z',
    source: 'seed'
  },
  {
    id: 'q-seed-017-1',
    unitCode: 'J.62DMI00.017.1',
    unitTitle: 'Melakukan Deployment Model',
    level: 'Advanced',
    stem: 'Strategi deployment manakah yang mengarahkan 10% lalu lintas pengguna riil ke versi model baru untuk memvalidasi stabilitas dan akurasi produksi secara bertahap sebelum pemindahan 100% traffic?',
    options: [
      'Big-bang direct replacement',
      'Canary Deployment',
      'Offline backup testing',
      'Cold restart deployment'
    ],
    correctAnswerIndex: 1,
    explanation: 'Canary deployment mengalirkan sebagian kecil traffic produksi (misal 5-10%) ke kandidat model baru untuk mitigasi risiko kegagalan sistem (KUK 2.1).',
    status: 'approved',
    audit: { clarity: 5, alignment: 5, unambiguousAnswer: 5, distractorQuality: 5, refinementCount: 0 },
    createdAt: '2026-10-10T11:40:00Z',
    approvedAt: '2026-10-10T11:42:00Z',
    source: 'seed'
  },
  {
    id: 'q-seed-018-1',
    unitCode: 'J.62DMI00.018.1',
    unitTitle: 'Membuat Rencana Pemeliharaan Model',
    level: 'Advanced',
    stem: 'Fenomena di mana distribusi statistik fitur masukan data pengguna berubah secara signifikan dari waktu ke waktu sementara hubungan kausal ke target tetap sama dikenal sebagai:',
    options: [
      'Data Drift (Covariate Shift)',
      'Concept Drift murni',
      'Hardware degradation',
      'Software deadlock'
    ],
    correctAnswerIndex: 0,
    explanation: 'Data Drift (atau covariate shift) terjadi saat P(X) berubah namun P(Y|X) tetap. KUK 1.1 mewajibkan perancangan metrik pemantauan drift fitur secara proaktif.',
    status: 'approved',
    audit: { clarity: 5, alignment: 5, unambiguousAnswer: 5, distractorQuality: 5, refinementCount: 0 },
    createdAt: '2026-10-10T11:50:00Z',
    approvedAt: '2026-10-10T11:52:00Z',
    source: 'seed'
  },
  {
    id: 'q-seed-019-1',
    unitCode: 'J.62DMI00.019.1',
    unitTitle: 'Melakukan Pemeliharaan Model',
    level: 'Advanced',
    stem: 'Saat melakukan pemeliharaan model di lingkungan produksi, strategi pengujian Champion-Challenger bertujuan untuk:',
    options: [
      'Menghapus database cadangan lama',
      'Membandingkan performa model produksi yang sedang berjalan (Champion) melawan model baru yang baru dilatih ulang (Challenger) menggunakan data riil yang sama',
      'Mengadu tim data scientist satu sama lain dalam kompetisi hackathon',
      'Menurunkan standar metrik kualitas agar model tidak perlu diperbarui lagi'
    ],
    correctAnswerIndex: 1,
    explanation: 'KUK 2.1 Champion-Challenger testing memvalidasi apakah model Challenger terbukti lebih unggul dalam kondisi aktual sebelum dipromosikan menggantikan model Champion.',
    status: 'approved',
    audit: { clarity: 5, alignment: 5, unambiguousAnswer: 5, distractorQuality: 5, refinementCount: 0 },
    createdAt: '2026-10-10T12:00:00Z',
    approvedAt: '2026-10-10T12:02:00Z',
    source: 'seed'
  },
  {
    id: 'q-seed-020-1',
    unitCode: 'J.62DMI00.020.1',
    unitTitle: 'Melakukan Review Proyek Data Science',
    level: 'Advanced',
    stem: 'Dalam review penutupan proyek data science, apa fokus utama yang ditinjau bersama para pengambil keputusan (stakeholders)?',
    options: [
      'Berapa baris kode Python yang telah ditulis tim',
      'Ketercapaian dampak nilai bisnis nyata (misalnya penurunan biaya operasional atau peningkatan retensi nasabah) dibandingkan dengan baseline sebelum proyek dimulai',
      'Merek laptop yang digunakan oleh para engineer',
      'Warna tema IDE yang paling disukai anggota tim'
    ],
    correctAnswerIndex: 1,
    explanation: 'KUK 1.1 menetapkan bahwa evaluasi penutupan proyek difokuskan pada ketercapaian KPI bisnis nyata dan ROI proyek.',
    status: 'approved',
    audit: { clarity: 5, alignment: 5, unambiguousAnswer: 5, distractorQuality: 5, refinementCount: 0 },
    createdAt: '2026-10-10T12:10:00Z',
    approvedAt: '2026-10-10T12:12:00Z',
    source: 'seed'
  },
  {
    id: 'q-seed-021-1',
    unitCode: 'J.62DMI00.021.1',
    unitTitle: 'Membuat Laporan Akhir Proyek Data Science',
    level: 'Advanced',
    stem: 'Dokumen "Model Card" yang disertakan dalam laporan akhir proyek data science bertindak sebagai sarana transparansi tata kelola AI yang mencakup:',
    options: [
      'Hanya kartu garansi perangkat keras server',
      'Ringkasan tujuan penggunaan yang dimaksudkan (intended use), batasan performa, demografi data pelatihan, potensi bias etis, dan metrik evaluasi model',
      'Daftar nomor rekening bank seluruh tim developer',
      'Struk pembelian lisensi perangkat lunak saja'
    ],
    correctAnswerIndex: 1,
    explanation: 'Model Card adalah standar dokumentasi AI etis (KUK 1.2) yang menjelaskan tujuan model, batasan, metrik performa, dan pertimbangan etis untuk tata kelola AI yang bertanggung jawab.',
    status: 'approved',
    audit: { clarity: 5, alignment: 5, unambiguousAnswer: 5, distractorQuality: 5, refinementCount: 0 },
    createdAt: '2026-10-10T12:20:00Z',
    approvedAt: '2026-10-10T12:22:00Z',
    source: 'seed'
  }
];
