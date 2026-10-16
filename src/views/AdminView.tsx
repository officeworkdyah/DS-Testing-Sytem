/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ParticipantSession,
  SkkniUnit,
  AgentLog,
  AppSettings,
  UserRole
} from '../types/index.ts';
import {
  getAllSessions,
  deleteSession,
  getAllUnits,
  saveUnits,
  getAllAgentLogs,
  getSettings,
  saveSettings,
  exportFullDatabaseJSON,
  importFullDatabaseJSON,
  resetDatabaseToDefaults
} from '../services/db.ts';
import { extractKUKFromPDF, syncStandardKUK } from '../services/api.ts';
import {
  ShieldCheck,
  Users,
  Download,
  Upload,
  FileText,
  Settings,
  Activity,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Search,
  Filter,
  ArrowRight,
  User,
  Plus
} from 'lucide-react';

interface AdminViewProps {
  onSwitchRole: (role: UserRole) => void;
  onRefreshStats?: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ onSwitchRole, onRefreshStats }) => {
  const [activeTab, setActiveTab] = useState<'sessions' | 'skkni' | 'logs' | 'settings'>('sessions');

  // Sessions state
  const [sessions, setSessions] = useState<ParticipantSession[]>([]);
  const [sessionSearch, setSessionSearch] = useState('');
  const [sessionLevelFilter, setSessionLevelFilter] = useState<string>('all');
  const [viewSessionDetail, setViewSessionDetail] = useState<ParticipantSession | null>(null);

  // SKKNI units state
  const [units, setUnits] = useState<SkkniUnit[]>([]);
  const [isExtractingKuk, setIsExtractingKuk] = useState(false);
  const [kukUploadStatus, setKukUploadStatus] = useState<string>('');
  const [selectedUnitForKuk, setSelectedUnitForKuk] = useState<SkkniUnit | null>(null);

  // Agent logs state
  const [agentLogs, setAgentLogs] = useState<AgentLog[]>([]);
  const [viewLogDetail, setViewLogDetail] = useState<AgentLog | null>(null);

  // Settings state
  const [settings, setSettings] = useState<AppSettings>({
    questionsPerLevel: 5,
    passingThreshold: 70,
    autoAgentReplenishNotice: true
  });
  const [settingsSavedMsg, setSettingsSavedMsg] = useState(false);
  const [backupStatusMsg, setBackupStatusMsg] = useState('');

  const loadAllAdminData = async () => {
    try {
      const [sessList, uList, logsList, setts] = await Promise.all([
        getAllSessions(),
        getAllUnits(),
        getAllAgentLogs(),
        getSettings()
      ]);
      setSessions(sessList);
      setUnits(uList);
      setAgentLogs(logsList);
      setSettings(setts);
      onRefreshStats?.();
    } catch (e) {
      console.error('Error loading admin data:', e);
    }
  };

  useEffect(() => {
    loadAllAdminData();
  }, []);

  // CSV Export for Participant Results
  const handleExportCSV = () => {
    if (sessions.length === 0) {
      alert('Belum ada data sesi peserta untuk diekspor.');
      return;
    }

    const headers = [
      'ID Peserta',
      'Nama Peserta',
      'Waktu Selesai',
      'Skor Basic (%)',
      'Skor Intermediate (%)',
      'Skor Advanced (%)',
      'Total Rata-rata (%)',
      'Level Akhir'
    ];

    const rows = sessions.map((s) => [
      `"${s.participantId}"`,
      `"${s.participantName.replace(/"/g, '""')}"`,
      `"${new Date(s.completedAt).toLocaleString('id-ID')}"`,
      s.scoreBasic,
      s.scoreIntermediate,
      s.scoreAdvanced,
      s.totalScore,
      `"${s.finalLevel}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Hasil_Peserta_AgenKompetenDS_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Delete session
  const handleDeleteSession = async (id: string) => {
    if (confirm('Hapus riwayat sesi peserta ini?')) {
      await deleteSession(id);
      await loadAllAdminData();
    }
  };

  // Upload and Extract PDF SKKNI
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExtractingKuk(true);
    setKukUploadStatus('Membaca file PDF...');

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = (reader.result as string).split(',')[1];
          setKukUploadStatus('Menganalisis dokumen SKKNI & mengekstrak KUK...');

          const res = await extractKUKFromPDF({ pdfBase64: base64Data });

          if (res.extractedUnits && Array.isArray(res.extractedUnits)) {
            // Merge with existing units
            const updatedUnits = units.map((existing) => {
              const match = res.extractedUnits.find(
                (ext: any) => ext.code.trim().toLowerCase() === existing.code.trim().toLowerCase()
              );
              if (match && Array.isArray(match.kuks) && match.kuks.length > 0) {
                return { ...existing, kuks: match.kuks };
              }
              return existing;
            });

            await saveUnits(updatedUnits);
            setUnits(updatedUnits);
            if (res.notice) {
              setKukUploadStatus(res.notice);
            } else {
              setKukUploadStatus(`Berhasil! KUK untuk ${res.extractedUnits.length} unit berhasil diperbarui dari dokumen SKKNI.`);
            }
          } else {
            setKukUploadStatus('Berhasil disinkronkan dengan 21 unit SKKNI No. 299/2020.');
          }
        } catch (err: any) {
          let errText = err.message || 'Gagal memproses dokumen';
          if (errText.includes('503') || errText.includes('high demand') || errText.includes('UNAVAILABLE')) {
            errText = 'Server AI Gemini sedang mengalami lonjakan beban sesaat (503). Sistem telah menyediakan tombol "Sinkronkan KUK Standar Resmi" di bawah untuk memuat KUK seluruh unit secara langsung.';
          }
          setKukUploadStatus(errText);
        } finally {
          setIsExtractingKuk(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setKukUploadStatus('Gagal membaca file: ' + err.message);
      setIsExtractingKuk(false);
    }
  };

  // Instant official KUK sync
  const handleSyncOfficialKUK = async () => {
    setIsExtractingKuk(true);
    setKukUploadStatus('Menyinkronkan KUK standar resmi Kepmenaker No. 299/2020...');
    try {
      const res = await syncStandardKUK();
      if (res.extractedUnits && Array.isArray(res.extractedUnits)) {
        const updatedUnits = units.map((existing) => {
          const match = res.extractedUnits.find(
            (ext: any) => ext.code.trim().toLowerCase() === existing.code.trim().toLowerCase()
          );
          if (match && Array.isArray(match.kuks) && match.kuks.length > 0) {
            return { ...existing, kuks: match.kuks };
          }
          return existing;
        });

        await saveUnits(updatedUnits);
        setUnits(updatedUnits);
        setKukUploadStatus('Berhasil! KUK resmi Kepmenaker No. 299/2020 untuk 21 unit telah dimuat dan aktif.');
      }
    } catch (err: any) {
      setKukUploadStatus('Gagal menyinkronkan: ' + err.message);
    } finally {
      setIsExtractingKuk(false);
    }
  };

  // Save Settings
  const handleSaveSettings = async () => {
    await saveSettings(settings);
    setSettingsSavedMsg(true);
    setTimeout(() => setSettingsSavedMsg(false), 3000);
  };

  // Export JSON Backup
  const handleExportBackup = async () => {
    const jsonStr = await exportFullDatabaseJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Cadangan_AgenKompetenDS_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setBackupStatusMsg('Cadangan JSON berhasil diunduh.');
  };

  // Import JSON Backup
  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        await importFullDatabaseJSON(reader.result as string);
        await loadAllAdminData();
        setBackupStatusMsg('Basis data berhasil dipulihkan dari cadangan.');
      } catch (err: any) {
        setBackupStatusMsg('Gagal memulihkan cadangan: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  // Reset to Defaults
  const handleResetDefaults = async () => {
    if (confirm('PERINGATAN: Apakah Anda yakin ingin mengatur ulang basis data ke kondisi awal (default)? Data riwayat sesi peserta dan draf akan dikembalikan ke data benih.')) {
      await resetDatabaseToDefaults();
      await loadAllAdminData();
      alert('Basis data berhasil diatur ulang ke kondisi default bawaan SKKNI No. 299/2020.');
    }
  };

  // Filter sessions
  const filteredSessions = sessions.filter((s) => {
    if (sessionLevelFilter !== 'all' && s.finalLevel !== sessionLevelFilter) return false;
    if (sessionSearch.trim()) {
      const q = sessionSearch.toLowerCase();
      const inName = s.participantName.toLowerCase().includes(q);
      const inId = s.participantId.toLowerCase().includes(q);
      if (!inName && !inId) return false;
    }
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Top Admin Header & Full Role Switcher */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 mb-8 shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Pusat Kendali & Tata Kelola Admin</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Dashboard Administrasi AgenKompeten DS
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Sebagai Admin, Anda dapat mengelola KUK SKKNI, memantau hasil peserta, mengunduh data CSV, serta mengakses fitur Instruktur dan Peserta kapan saja.
            </p>
          </div>

          {/* Quick Shortcuts to other roles */}
          <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0">
            <button
              onClick={() => onSwitchRole('instructor')}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors flex items-center space-x-2 shadow-xs"
            >
              <Sparkles className="w-4 h-4" />
              <span>Buka Fitur Instruktur</span>
            </button>
            <button
              onClick={() => onSwitchRole('participant')}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center space-x-2 shadow-xs"
            >
              <User className="w-4 h-4" />
              <span>Buka Fitur Peserta</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 mb-6 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('sessions')}
          className={`pb-3 px-4 text-sm font-semibold transition-colors flex items-center space-x-2 shrink-0 ${
            activeTab === 'sessions'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Hasil Peserta ({sessions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('skkni')}
          className={`pb-3 px-4 text-sm font-semibold transition-colors flex items-center space-x-2 shrink-0 ${
            activeTab === 'skkni'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Impor SKKNI & KUK (21 Unit)</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`pb-3 px-4 text-sm font-semibold transition-colors flex items-center space-x-2 shrink-0 ${
            activeTab === 'logs'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Log Agent ({agentLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-3 px-4 text-sm font-semibold transition-colors flex items-center space-x-2 shrink-0 ${
            activeTab === 'settings'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Pengaturan & Cadangan</span>
        </button>
      </div>

      {/* TAB 1: HASIL PESERTA */}
      {activeTab === 'sessions' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Rekapitulasi Hasil Uji Peserta
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Daftar nilai penempatan level peserta berdasarkan SKKNI Data Science
              </p>
            </div>

            <button
              onClick={handleExportCSV}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center space-x-2 transition-colors shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Ekspor ke CSV</span>
            </button>
          </div>

          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <span className="text-xs text-slate-500">Filter Level:</span>
              <select
                aria-label="Filter berdasarkan Level Peserta"
                value={sessionLevelFilter}
                onChange={(e) => setSessionLevelFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white text-slate-700 font-medium"
              >
                <option value="all">Semua Level</option>
                <option value="Basic">Basic</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama atau ID peserta..."
                value={sessionSearch}
                onChange={(e) => setSessionSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
              />
            </div>
          </div>

          {/* Table */}
          {filteredSessions.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              Belum ada data peserta yang terekam atau cocok dengan pencarian.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-3">Peserta</th>
                    <th className="py-3 px-3">Tanggal Tes</th>
                    <th className="py-3 px-3 text-center">Basic</th>
                    <th className="py-3 px-3 text-center">Intermediate</th>
                    <th className="py-3 px-3 text-center">Advanced</th>
                    <th className="py-3 px-3 text-center">Level Akhir</th>
                    <th className="py-3 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSessions.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{s.participantName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{s.participantId}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {new Date(s.completedAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="py-3 px-3 text-center font-semibold text-emerald-700">
                        {s.scoreBasic}%
                      </td>
                      <td className="py-3 px-3 text-center font-semibold text-blue-700">
                        {s.scoreIntermediate}%
                      </td>
                      <td className="py-3 px-3 text-center font-semibold text-purple-700">
                        {s.scoreAdvanced}%
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                            s.finalLevel === 'Basic'
                              ? 'bg-emerald-100 text-emerald-800'
                              : s.finalLevel === 'Intermediate'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {s.finalLevel}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right space-x-2">
                        <button
                          onClick={() => setViewSessionDetail(s)}
                          className="p-1 rounded-md text-indigo-600 hover:bg-indigo-50"
                          title="Lihat Detail Hasil & Rekomendasi"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSession(s.id)}
                          className="p-1 rounded-md text-rose-500 hover:bg-rose-50"
                          title="Hapus Sesi"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: IMPOR SKKNI & KUK */}
      {activeTab === 'skkni' && (
        <div className="space-y-6">
          {/* PDF Uploader & Sync Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Pengelolaan Kriteria Unjuk Kerja (KUK) SKKNI No. 299/2020
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Perbarui acuan KUK 21 unit kompetensi melalui unggah dokumen PDF atau sinkronisasi instan
                </p>
              </div>

              <button
                onClick={handleSyncOfficialKUK}
                disabled={isExtractingKuk}
                className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs transition-colors flex items-center space-x-1.5 shrink-0 border border-indigo-200 shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Muat KUK Resmi (1-Klik Instan)</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Option 1: PDF Upload */}
              <div className="border-2 border-dashed border-indigo-200 bg-indigo-50/20 rounded-2xl p-5 text-center flex flex-col justify-between">
                <div>
                  <Upload className="w-7 h-7 text-indigo-500 mx-auto mb-2" />
                  <div className="text-xs font-bold text-slate-800 mb-1">
                    Unggah Berkas PDF SKKNI
                  </div>
                  <p className="text-[11px] text-slate-500 mb-4">
                    Gemini akan membaca dokumen PDF dan mengekstrak butir KUK untuk setiap unit kompetensi.
                  </p>
                </div>

                <div>
                  <label className="cursor-pointer inline-block">
                    <span className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs inline-block transition-colors shadow-xs">
                      {isExtractingKuk ? 'Sedang Memproses...' : 'Pilih File PDF SKKNI'}
                    </span>
                    <input
                      type="file"
                      accept=".pdf"
                      disabled={isExtractingKuk}
                      onChange={handlePdfUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[10px] text-slate-400 mt-2">
                    Format didukung: Dokumen PDF resmi
                  </p>
                </div>
              </div>

              {/* Option 2: Pre-bundled Standard Sync */}
              <div className="border border-slate-200 bg-slate-50/50 rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold mb-2">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="text-xs font-bold text-slate-800 mb-1">
                    KUK Bawaan Kepmenaker No. 299/2020
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed mb-4">
                    Sistem sudah dilengkapi database KUK lengkap untuk seluruh 21 unit (Basic, Intermediate, Advanced) sesuai naskah asli Kepmenaker.
                  </p>
                </div>

                <button
                  onClick={handleSyncOfficialKUK}
                  disabled={isExtractingKuk}
                  className="w-full py-2 px-3 rounded-xl bg-white border border-slate-300 hover:border-slate-400 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center space-x-1.5 shadow-2xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${isExtractingKuk ? 'animate-spin' : ''}`} />
                  <span>Sinkronkan Database KUK Resmi</span>
                </button>
              </div>
            </div>

            {kukUploadStatus && (
              <div className={`mt-4 p-3.5 rounded-xl border text-xs font-medium flex items-start space-x-2.5 ${
                kukUploadStatus.includes('503') || kukUploadStatus.includes('lonjakan')
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}>
                {kukUploadStatus.includes('503') || kukUploadStatus.includes('lonjakan') ? (
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <span>{kukUploadStatus}</span>
                  {(kukUploadStatus.includes('503') || kukUploadStatus.includes('lonjakan')) && (
                    <div className="mt-2">
                      <button
                        onClick={handleSyncOfficialKUK}
                        className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[11px] font-semibold"
                      >
                        Muat KUK Resmi Sekarang (Tanpa Antre) &rarr;
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* List of 21 SKKNI Units with KUK Inspector */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Daftar 21 Unit SKKNI & Kriteria Unjuk Kerja (KUK)
                </h3>
                <p className="text-xs text-slate-500">
                  Klik unit untuk memeriksa atau menyesuaikan KUK yang digunakan AI Agent
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
                21 Unit Tersedia
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto pr-1">
              {units.map((u) => (
                <div
                  key={u.code}
                  onClick={() => setSelectedUnitForKuk(u)}
                  className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-slate-50/50 cursor-pointer transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-xs font-bold text-indigo-600">
                        {u.code}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          u.level === 'Basic'
                            ? 'bg-emerald-100 text-emerald-800'
                            : u.level === 'Intermediate'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {u.level}
                      </span>
                    </div>

                    <div className="font-bold text-sm text-slate-900 mb-1">{u.title}</div>
                    <p className="text-xs text-slate-500 line-clamp-2 mb-3">{u.description}</p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
                    <span className="font-medium text-slate-700">
                      {u.kuks ? u.kuks.length : 0} Kriteria Unjuk Kerja (KUK)
                    </span>
                    <span className="text-indigo-600 font-semibold hover:underline">
                      Periksa KUK &rarr;
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LOG AGENT */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
          <div className="mb-6">
            <h3 className="text-base font-bold text-slate-900">
              Audit Log Kerja AI Agent Penyusun Soal
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Catatan riwayat eksekusi agen: waktu, target unit, jumlah draf dibuat, dan jumlah siklus perbaikan
            </p>
          </div>

          {agentLogs.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              Belum ada riwayat aktivitas AI Agent. Silakan jalankan agent di halaman Instruktur.
            </div>
          ) : (
            <div className="space-y-3">
              {agentLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors text-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold uppercase text-[10px] ${
                          log.status === 'sukses'
                            ? 'bg-emerald-100 text-emerald-800'
                            : log.status === 'batas_tercapai'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {log.status === 'sukses' ? 'Sasaran Tercapai' : log.status}
                      </span>
                      <span className="font-semibold text-slate-800">
                        Target Level: {log.levelRequested}
                      </span>
                    </div>

                    <span className="text-[11px] text-slate-400">
                      {new Date(log.timestamp).toLocaleString('id-ID')}
                    </span>
                  </div>

                  <p className="text-slate-700 font-medium mb-3">{log.summary}</p>

                  <div className="flex flex-wrap items-center justify-between text-slate-500 pt-2 border-t border-slate-200 gap-2">
                    <div className="flex items-center space-x-4">
                      <span>
                        Draf Baru: <strong>{log.questionsCreated}</strong>
                      </span>
                      <span>
                        Perbaikan Mandiri: <strong>{log.refinementsCount}x</strong>
                      </span>
                    </div>

                    <button
                      onClick={() => setViewLogDetail(log)}
                      className="text-indigo-600 font-semibold hover:underline"
                    >
                      Buka Rincian Log ({log.details?.length || 0} langkah) &rarr;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: PENGATURAN & CADANGAN */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Settings Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Pengaturan Tes Penempatan
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Konfigurasi parameter perakitan soal tes dan standar penentuan level
            </p>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Jumlah Soal per Level dalam Tes:
                </label>
                <input
                  type="number"
                  min="1"
                  max="15"
                  value={settings.questionsPerLevel}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      questionsPerLevel: parseInt(e.target.value) || 5
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Total butir soal per tes: {settings.questionsPerLevel * 3} butir (seimbang antara Basic, Intermediate, Advanced). Default: 5.
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Ambang Batas Lulus per Level (%):
                </label>
                <input
                  type="number"
                  min="40"
                  max="100"
                  value={settings.passingThreshold}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      passingThreshold: parseInt(e.target.value) || 70
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Standar minimal kualifikasi sesuai acuan SKKNI. Default: 70%.
                </span>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleSaveSettings}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors shadow-xs"
                >
                  Simpan Pengaturan
                </button>
                {settingsSavedMsg && (
                  <div className="mt-2 text-center text-xs text-emerald-600 font-semibold">
                    ✓ Pengaturan berhasil disimpan
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Database Backup & Restore */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Cadangan & Pemulihan Basis Data (IndexedDB)
              </h3>
              <p className="text-xs text-slate-500 mb-6">
                Ekspor seluruh data unit SKKNI, bank soal, riwayat koreksi, dan sesi peserta ke file JSON lokal peramban.
              </p>

              <div className="space-y-3">
                <button
                  onClick={handleExportBackup}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center space-x-2 transition-colors"
                >
                  <Download className="w-4 h-4 text-indigo-600" />
                  <span>Ekspor Cadangan Data (JSON)</span>
                </button>

                <div>
                  <label className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center space-x-2 cursor-pointer transition-colors">
                    <Upload className="w-4 h-4 text-emerald-600" />
                    <span>Impor Cadangan Data (JSON)</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportBackup}
                      className="hidden"
                    />
                  </label>
                </div>

                {backupStatusMsg && (
                  <div className="text-xs text-indigo-600 bg-indigo-50 p-2.5 rounded-xl font-medium">
                    {backupStatusMsg}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-rose-700 mb-1">Zona Bahaya</h4>
              <p className="text-[11px] text-slate-400 mb-3">
                Mengembalikan seluruh data unit dan bank soal ke konfigurasi awal bawaan.
              </p>
              <button
                onClick={handleResetDefaults}
                className="w-full py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-200 transition-colors"
              >
                Reset Database ke Kondisi Awal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DETAIL SESI PESERTA */}
      {viewSessionDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Rincian Sesi Peserta: {viewSessionDetail.participantName}
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  ID: {viewSessionDetail.participantId} • Selesai:{' '}
                  {new Date(viewSessionDetail.completedAt).toLocaleString('id-ID')}
                </p>
              </div>
              <button
                onClick={() => setViewSessionDetail(null)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Score summary */}
            <div className="grid grid-cols-4 gap-2 text-center mb-6">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <div className="text-[10px] text-emerald-800 font-medium">Basic</div>
                <div className="text-lg font-bold text-emerald-700">{viewSessionDetail.scoreBasic}%</div>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                <div className="text-[10px] text-blue-800 font-medium">Intermediate</div>
                <div className="text-lg font-bold text-blue-700">{viewSessionDetail.scoreIntermediate}%</div>
              </div>
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                <div className="text-[10px] text-purple-800 font-medium">Advanced</div>
                <div className="text-lg font-bold text-purple-700">{viewSessionDetail.scoreAdvanced}%</div>
              </div>
              <div className="p-3 bg-slate-900 text-white rounded-xl">
                <div className="text-[10px] text-slate-300 font-medium">Level Akhir</div>
                <div className="text-base font-extrabold text-amber-400 uppercase">
                  {viewSessionDetail.finalLevel}
                </div>
              </div>
            </div>

            {/* Recommendation if present */}
            {viewSessionDetail.recommendation && (
              <div className="mb-6 p-4 rounded-2xl bg-indigo-50 border border-indigo-100 text-xs">
                <h4 className="font-bold text-indigo-900 mb-1 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Saran Belajar dari Gemini AI:</span>
                </h4>
                <p className="text-indigo-950 leading-relaxed whitespace-pre-line">
                  {viewSessionDetail.recommendation}
                </p>
              </div>
            )}

            {/* Unit performance breakdown */}
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Rincian Capaian Per Unit Soal:
            </h4>
            <div className="space-y-2 mb-6 max-h-48 overflow-y-auto">
              {viewSessionDetail.unitBreakdown?.map((u, uIdx) => (
                <div
                  key={uIdx}
                  className="p-2.5 rounded-lg border border-slate-200 text-xs flex items-center justify-between"
                >
                  <div>
                    <span className="font-semibold text-slate-800">
                      [{u.level}] {u.unitCode} - {u.unitTitle}
                    </span>
                  </div>
                  <span className="font-bold text-slate-700">
                    {u.correct}/{u.total} ({u.percentage}%)
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setViewSessionDetail(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DETAIL & EDIT KUK UNIT */}
      {selectedUnitForKuk && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <span className="text-xs font-bold text-indigo-600">{selectedUnitForKuk.code}</span>
                <h3 className="font-bold text-slate-900 text-base">{selectedUnitForKuk.title}</h3>
                <span className="text-xs text-slate-500">Level: {selectedUnitForKuk.level}</span>
              </div>
              <button
                onClick={() => setSelectedUnitForKuk(null)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 space-y-3 mb-4 text-xs">
              <p className="text-slate-600 italic bg-slate-50 p-3 rounded-xl border border-slate-200">
                {selectedUnitForKuk.description}
              </p>

              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] pt-1">
                Daftar Kriteria Unjuk Kerja (KUK):
              </h4>

              {selectedUnitForKuk.kuks && selectedUnitForKuk.kuks.length > 0 ? (
                <div className="space-y-2">
                  {selectedUnitForKuk.kuks.map((kuk, kIdx) => (
                    <div key={kIdx} className="p-2.5 rounded-lg border border-slate-200 bg-white flex items-start space-x-2">
                      <span className="w-5 h-5 rounded-md bg-indigo-50 text-indigo-700 font-bold shrink-0 flex items-center justify-center text-[10px]">
                        {kIdx + 1}
                      </span>
                      <span className="text-slate-700 pt-0.5">{kuk}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 italic">Belum ada KUK khusus untuk unit ini.</p>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedUnitForKuk(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DETAIL LOG AGENT */}
      {viewLogDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Rincian Log Eksekusi AI Agent
                </h3>
                <p className="text-xs text-slate-400">
                  {new Date(viewLogDetail.timestamp).toLocaleString('id-ID')}
                </p>
              </div>
              <button
                onClick={() => setViewLogDetail(null)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 bg-slate-950 text-emerald-400 p-4 rounded-xl font-mono text-[11px] overflow-y-auto space-y-1.5 mb-4 border border-slate-800">
              {viewLogDetail.details?.map((step, sIdx) => (
                <div key={sIdx} className="leading-relaxed">
                  <span className="text-slate-500 mr-2">&gt;</span>
                  {step}
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setViewLogDetail(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
