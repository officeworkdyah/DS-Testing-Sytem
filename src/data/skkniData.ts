/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SkkniUnit } from '../types/index.ts';

export const SKKNI_DATA_SCIENCE_UNITS: SkkniUnit[] = [
  // --- BASIC: Data Understanding & Preparation ---
  {
    code: 'J.62DMI00.004.1',
    title: 'Mengumpulkan Data',
    level: 'Basic',
    category: 'Data Understanding & Preparation',
    description: 'Mengidentifikasi sumber data, menentukan metode pengumpulan data, dan mengumpulkan data sesuai kebutuhan proyek data science.',
    kuks: [
      '1.1 Sumber data diidentifikasi sesuai dengan kebutuhan pemodelan.',
      '1.2 Karakteristik dan format data dari sumber data dipelajari.',
      '2.1 Metode pengumpulan data (batch, streaming, scraping, API) ditentukan sesuai karakteristik sumber.',
      '2.2 Data dikumpulkan dan disimpan pada media penyimpanan yang ditentukan dengan memperhatikan aspek keamanan.'
    ]
  },
  {
    code: 'J.62DMI00.005.1',
    title: 'Menelaah Data',
    level: 'Basic',
    category: 'Data Understanding & Preparation',
    description: 'Melakukan analisis eksploratif untuk memahami struktur, tipe variabel, distribusi, dan pola awal dalam dataset.',
    kuks: [
      '1.1 Struktur dan tipe data dari setiap atribut diidentifikasi.',
      '1.2 Statistik deskriptif (mean, median, variansi, kuartil) dihitung untuk setiap variabel numerik.',
      '2.1 Visualisasi distribusi data dibuat untuk mengenali pola atau keanehan (anomaly).',
      '2.2 Hubungan korelasi antar variabel ditelaah secara statistik.'
    ]
  },
  {
    code: 'J.62DMI00.006.1',
    title: 'Memvalidasi Data',
    level: 'Basic',
    category: 'Data Understanding & Preparation',
    description: 'Memeriksa keabsahan, kelengkapan, konsistensi data terhadap batasan domain dan aturan integritas.',
    kuks: [
      '1.1 Kriteria validitas data dirumuskan berdasarkan batasan domain bisnis.',
      '1.2 Kelengkapan dan konsistensi data diperiksa terhadap aturan validasi.',
      '2.1 Nilai pencilan (outlier) dan nilai yang tidak rasional diidentifikasi.',
      '2.2 Status validitas data didokumentasikan dalam laporan validasi.'
    ]
  },
  {
    code: 'J.62DMI00.007.1',
    title: 'Menentukan Objek Data',
    level: 'Basic',
    category: 'Data Understanding & Preparation',
    description: 'Memilih baris, entitas, atau sampel data yang relevan dengan pertanyaan analisis serta memilah atribut kunci.',
    kuks: [
      '1.1 Batasan populasi dan kriteria inklusi/eksklusi objek data ditentukan.',
      '1.2 Teknik sampling (random, stratified, clustering) dipilih sesuai distribusi populasi.',
      '2.1 Objek atau entitas data yang relevan dipilih untuk proses pemodelan selanjutnya.'
    ]
  },
  {
    code: 'J.62DMI00.008.1',
    title: 'Membersihkan Data',
    level: 'Basic',
    category: 'Data Understanding & Preparation',
    description: 'Menangani data hilang (missing value), duplikasi data, nilai anomali, dan ketidakkonsistenan format data.',
    kuks: [
      '1.1 Data yang bernilai hilang (missing values) diidentifikasi dan ditangani dengan metode yang tepat (imputasi, drop).',
      '1.2 Data terduplikasi (duplicate records) dideteksi dan dieliminasi.',
      '2.1 Data pencilan (outliers) ditangani sesuai strategi proyek (winsorizing, capping, atau penghapusan).',
      '2.2 Inkonsistensi format teks, tanggal, dan satuan distandardisasi.'
    ]
  },
  {
    code: 'J.62DMI00.009.1',
    title: 'Mengkonstruksi Data',
    level: 'Basic',
    category: 'Data Understanding & Preparation',
    description: 'Melakukan rekayasa fitur (feature engineering), transformasi skala data, encoding kategori, dan derivasi variabel baru.',
    kuks: [
      '1.1 Fitur baru diturunkan dari variabel yang ada guna meningkatkan representasi data.',
      '1.2 Variabel kategorikal diubah menjadi representasi numerik (one-hot encoding, label encoding).',
      '2.1 Skala data numerik dinormalisasi atau distandarisasi (MinMax, Standard Scaler).',
      '2.2 Reduksi dimensi data dilakukan bila diperlukan (PCA, feature selection).'
    ]
  },
  {
    code: 'J.62DMI00.010.1',
    title: 'Menentukan Label Data',
    level: 'Basic',
    category: 'Data Understanding & Preparation',
    description: 'Menentukan dan memvalidasi target variabel atau anotasi label untuk pembelajaran terawasi (supervised learning).',
    kuks: [
      '1.1 Variabel sasaran (target/label) diidentifikasi sesuai tujuan analitis.',
      '1.2 Prosedur anotasi atau pelabelan data disusun secara sistematis.',
      '2.1 Distribusi kelas label dianalisis untuk mendeteksi ketidakseimbangan kelas (class imbalance).',
      '2.2 Strategi penanganan imbalance (SMOTE, class weighting, undersampling) disiapkan.'
    ]
  },
  {
    code: 'J.62DMI00.011.1',
    title: 'Mengintegrasikan Data',
    level: 'Basic',
    category: 'Data Understanding & Preparation',
    description: 'Menggabungkan beberapa dataset dari sumber berbeda melalui operasi join, merge, dan rekonsiliasi skema.',
    kuks: [
      '1.1 Kunci relasi (primary key / foreign key) antar sumber data diidentifikasi.',
      '1.2 Operasi penggabungan (merge, join, union) dilakukan dengan menjaga integritas data.',
      '2.1 Konflik duplikasi atribut dan redundansi informasi diselesaikan pasca-integrasi.'
    ]
  },

  // --- INTERMEDIATE: Modeling & Evaluation ---
  {
    code: 'J.62DMI00.012.1',
    title: 'Membangun Skenario Model',
    level: 'Intermediate',
    category: 'Modeling & Evaluation',
    description: 'Merancang skema pembagian dataset (train-validation-test), teknik validasi silang (cross-validation), dan metrik evaluasi model.',
    kuks: [
      '1.1 Dataset dibagi menjadi data latih, validasi, dan uji sesuai karakteristik masalah data.',
      '1.2 Strategi validasi silang (K-Fold, Stratified K-Fold, TimeSeriesSplit) ditentukan untuk mencegah data leakage.',
      '2.1 Metrik performa (Accuracy, Precision, Recall, F1-Score, ROC-AUC, RMSE, MAE) dipilih selaras tujuan kasus.'
    ]
  },
  {
    code: 'J.62DMI00.013.1',
    title: 'Membangun Model',
    level: 'Intermediate',
    category: 'Modeling & Evaluation',
    description: 'Memilih algoritma machine learning yang sesuai, melatih model dasar (baseline), dan melakukan penyetelan hiperparameter (hyperparameter tuning).',
    kuks: [
      '1.1 Algoritma machine learning dipilih berdasarkan karakteristik data dan kebutuhan kompleksitas komputasi.',
      '1.2 Model dasar (baseline model) dilatih dan dicatat performanya.',
      '2.1 Penyetelan hiperparameter (Grid Search, Random Search, Bayesian Optimization) dijalankan.',
      '2.2 Teknik ensemble (bagging, boosting, stacking) diimplementasikan bila diperlukan peningkatan akurasi.'
    ]
  },
  {
    code: 'J.62DMI00.014.1',
    title: 'Mengevaluasi Hasil Pemodelan',
    level: 'Intermediate',
    category: 'Modeling & Evaluation',
    description: 'Menganalisis performa model pada data uji, mendiagnosis bias-variance tradeoff (underfitting vs overfitting), dan interpretabilitas.',
    kuks: [
      '1.1 Performa model dihitung pada dataset uji menggunakan metrik yang telah disepakati.',
      '1.2 Kurva pembelajaran (learning curves) dan confusion matrix dianalisis untuk mendeteksi overfitting/underfitting.',
      '2.1 Kepentingan fitur (feature importance) atau interpretabilitas model (SHAP, LIME) diuji untuk akuntabilitas prediksi.'
    ]
  },
  {
    code: 'J.62DMI00.015.1',
    title: 'Melakukan Proses Review Pemodelan',
    level: 'Intermediate',
    category: 'Modeling & Evaluation',
    description: 'Melakukan peninjauan menyeluruh terhadap alur pipeline pemodelan, kepatuhan teknis, dan kelayakan sebelum ke tahap produksi.',
    kuks: [
      '1.1 Asumsi teknis dan dependensi algoritma diperiksa ulang secara kritis.',
      '1.2 Potensi kebocoran data (data leakage) dan bias representasi diaudit.',
      '2.1 Rekomendasi perbaikan model atau persetujuan model didokumentasikan secara formal.'
    ]
  },

  // --- ADVANCED: Business Understanding & Deployment ---
  {
    code: 'J.62DMI00.001.1',
    title: 'Menentukan Objektif Bisnis',
    level: 'Advanced',
    category: 'Business Understanding & Deployment',
    description: 'Menerjemahkan kebutuhan stakeholder bisnis menjadi visi analitik, mengidentifikasi tolok ukur nilai bisnis (ROI/KPI).',
    kuks: [
      '1.1 Kebutuhan dan masalah bisnis pengguna diidentifikasi melalui wawancara dan telaah dokumen.',
      '1.2 Kriteria keberhasilan bisnis (business success criteria) dirumuskan dalam metrik kuantitatif (contoh: churn reduction, revenue uplift).',
      '2.1 Penilaian kelayakan proyek (feasibility study) dari sisi sumber daya, data, dan risiko bisnis dilakukan.'
    ]
  },
  {
    code: 'J.62DMI00.002.1',
    title: 'Menentukan Tujuan Teknis Data Science',
    level: 'Advanced',
    category: 'Business Understanding & Deployment',
    description: 'Memetakan objektif bisnis ke rumusan masalah data science yang terukur (tipe prediksi, batasan latensi, threshold metrik teknis).',
    kuks: [
      '1.1 Masalah bisnis diterjemahkan ke dalam formulasi pemodelan analitik data science.',
      '1.2 Kriteria keberhasilan teknis (technical success criteria) ditetapkan dengan ambang batas terukur.',
      '2.1 Batasan operasional sistem (latensi prediksi, batas memori, throughput) dirumuskan.'
    ]
  },
  {
    code: 'J.62DMI00.003.1',
    title: 'Membuat Rencana Proyek Data Science',
    level: 'Advanced',
    category: 'Business Understanding & Deployment',
    description: 'Menyusun metodologi kerja (CRISP-DM/Agile), jadwal kerja, pembagian peran tim, estimasi biaya komputasi, dan mitigasi risiko.',
    kuks: [
      '1.1 Metodologi pengembangan data science dan tahapan fase kerja ditentukan.',
      '1.2 Alokasi sumber daya (manusia, komputasi GPU/cloud, data storage) dipetakan.',
      '2.1 Rencana kontinjensi dan manajemen risiko ketidakpastian data disusun.'
    ]
  },
  {
    code: 'J.62DMI00.016.1',
    title: 'Membuat Rencana Deployment Model',
    level: 'Advanced',
    category: 'Business Understanding & Deployment',
    description: 'Merancang arsitektur penyajian model (batch inference vs real-time REST API/gRPC), containerization, dan strategi integrasi.',
    kuks: [
      '1.1 Pola inferensi model (batch, microservice API, edge deployment) dipilih sesuai kebutuhan bisnis.',
      '1.2 Infrastruktur penyajian model (Docker container, Kubernetes, serverless) dirancang.',
      '2.1 Strategi pengujian deployment (canary release, blue-green deployment, shadow testing) disiapkan.'
    ]
  },
  {
    code: 'J.62DMI00.017.1',
    title: 'Melakukan Deployment Model',
    level: 'Advanced',
    category: 'Business Understanding & Deployment',
    description: 'Menerapkan model ke lingkungan produksi menggunakan CI/CD, mengonfigurasi endpoint API, dan memverifikasi integrasi sistem.',
    kuks: [
      '1.1 Pipeline otomasi deployment (CI/CD) dikonfigurasi untuk pengemasan model.',
      '1.2 Endpoint inferensi model diuji ketahanannya (smoke test, load test) di lingkungan target.',
      '2.1 Integrasi dengan sistem aplikasi pengguna dipastikan berjalan tanpa regresi fungsional.'
    ]
  },
  {
    code: 'J.62DMI00.018.1',
    title: 'Membuat Rencana Pemeliharaan Model',
    level: 'Advanced',
    category: 'Business Understanding & Deployment',
    description: 'Menyusun protokol pemantauan model (drift detection), strategi pemicu retraining otomatis, dan fallback mechanism.',
    kuks: [
      '1.1 Metrik pemantauan performa model (data drift, concept drift, latency degradation) ditentukan.',
      '1.2 Jadwal dan pemicu (trigger) pelatihan ulang model (automated retraining) dirancang.',
      '2.1 Mekanisme cadangan (fallback rule/heuristic) disiapkan jika inferensi model gagal di produksi.'
    ]
  },
  {
    code: 'J.62DMI00.019.1',
    title: 'Melakukan Pemeliharaan Model',
    level: 'Advanced',
    category: 'Business Understanding & Deployment',
    description: 'Memantau telemetry model di produksi, menganalisis laporan drift, memperbarui model, dan mengarsipkan artefak model.',
    kuks: [
      '1.1 Log prediksi model dan perubahan distribusi fitur masukan dipantau secara berkala.',
      '1.2 Pelatihan ulang model dijalankan ketika terjadi penurunan performa signifikan.',
      '2.1 Model baru diuji tanding (champion-challenger testing) sebelum menggantikan model lama di produksi.'
    ]
  },
  {
    code: 'J.62DMI00.020.1',
    title: 'Melakukan Review Proyek Data Science',
    level: 'Advanced',
    category: 'Business Understanding & Deployment',
    description: 'Mengevaluasi pencapaian hasil terhadap objektif bisnis awal, menghitung dampak bisnis nyata, dan menyusun lesson learned.',
    kuks: [
      '1.1 Ketercapaian KPI bisnis dievaluasi bersama para pemangku kepentingan.',
      '1.2 Evaluasi efisiensi biaya infrastruktur dan waktu pengerjaan dianalisis.',
      '2.1 Pembelajaran proyek (lessons learned) dan celah peningkatan di masa depan didokumentasikan.'
    ]
  },
  {
    code: 'J.62DMI00.021.1',
    title: 'Membuat Laporan Akhir Proyek Data Science',
    level: 'Advanced',
    category: 'Business Understanding & Deployment',
    description: 'Menyusun dokumentasi teknis komprehensif, executive summary bisnis, repositori kode, dan model card untuk tata kelola AI.',
    kuks: [
      '1.1 Laporan eksekutif disusun untuk pemangku kepentingan manajerial.',
      '1.2 Dokumentasi teknis terperinci (arsitektur data pipeline, hyperparameter, model card) disusun.',
      '2.1 Penyerahan artefak proyek (handover) dilakukan secara resmi kepada tim operasional.'
    ]
  }
];

export const LEVEL_DEFINITIONS: Record<string, { label: string; description: string; units: string[] }> = {
  Basic: {
    label: 'Basic (Data Understanding & Preparation)',
    description: 'Fokus pada pengumpulan, telaah, validasi, pembersihan, konstruksi, pelabelan, dan integrasi data.',
    units: SKKNI_DATA_SCIENCE_UNITS.filter(u => u.level === 'Basic').map(u => u.code)
  },
  Intermediate: {
    label: 'Intermediate (Modeling & Evaluation)',
    description: 'Fokus pada perancangan skenario validasi, algoritma machine learning, evaluasi metrik, dan review pemodelan.',
    units: SKKNI_DATA_SCIENCE_UNITS.filter(u => u.level === 'Intermediate').map(u => u.code)
  },
  Advanced: {
    label: 'Advanced (Business Understanding & Deployment)',
    description: 'Fokus pada objektif bisnis, perencanaan proyek data science, arsitektur deployment MLOps, pemeliharaan model, dan review proyek.',
    units: SKKNI_DATA_SCIENCE_UNITS.filter(u => u.level === 'Advanced').map(u => u.code)
  }
};
