/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { UserRole } from '../types/index.ts';
import {
  User,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Database,
  Layers,
  Award,
  Zap,
  BookOpen
} from 'lucide-react';

interface HomeRolePickerProps {
  onSelectRole: (role: UserRole) => void;
  approvedCount: number;
  pendingCount: number;
  totalParticipants: number;
  unitsCount: number;
}

export const HomeRolePicker: React.FC<HomeRolePickerProps> = ({
  onSelectRole,
  approvedCount,
  pendingCount,
  totalParticipants,
  unitsCount
}) => {
  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-4">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>Berbasis SKKNI Kepmenaker No. 299 Tahun 2020 & Gemini AI</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
          Tes Penempatan Level <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-blue-600 to-teal-500">
            Data Science Indonesia
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
          Platform uji kompetensi terstandarisasi untuk mengukur kesiapan praktisi pada level{' '}
          <strong className="text-slate-900 font-semibold">Basic</strong>,{' '}
          <strong className="text-slate-900 font-semibold">Intermediate</strong>, atau{' '}
          <strong className="text-slate-900 font-semibold">Advanced</strong>, didukung agen cerdas penyusun soal otomatis.
        </p>
      </div>

      {/* Role Selection Cards */}
      <div className="mb-12">
        <div className="text-center mb-6">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">
            Pilih Peran Anda untuk Memulai
          </span>
          <p className="text-xs text-slate-600 mt-1">
            (Prototipe sistem evaluasi — Anda dapat berpindah peran kapan saja melalui menu atas)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card: Peserta */}
          <div
            onClick={() => onSelectRole('participant')}
            className="group relative bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 hover:border-emerald-300 hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-5 group-hover:scale-110 transition-transform">
                <User className="w-6 h-6" />
              </div>

              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                  Peserta Tes
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                  Uji Level
                </span>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                Masukkan nama Anda, kerjakan 15 butir soal pilihan ganda acak, dan dapatkan sertifikasi penempatan level serta saran belajar dari Gemini.
              </p>

              <div className="space-y-2 mb-6">
                <div className="flex items-start text-xs text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2 shrink-0 mt-0.5" />
                  <span>Level otomatis: Basic, Intermediate, Advanced</span>
                </div>
                <div className="flex items-start text-xs text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2 shrink-0 mt-0.5" />
                  <span>Kunci jawaban aman (dihitung setelah selesai)</span>
                </div>
                <div className="flex items-start text-xs text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2 shrink-0 mt-0.5" />
                  <span>Rencana belajar personal dari kelemahan unit</span>
                </div>
              </div>
            </div>

            <button className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-emerald-600 text-white font-semibold text-sm group-hover:bg-emerald-700 transition-colors shadow-xs">
              <span>Masuk Sebagai Peserta</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Card: Instruktur */}
          <div
            onClick={() => onSelectRole('instructor')}
            className="group relative bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 hover:border-indigo-300 hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
          >
            {pendingCount > 0 && (
              <div className="absolute -top-3 -right-2 px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-bold shadow-md animate-pulse">
                {pendingCount} Menunggu Persetujuan
              </div>
            )}

            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-5 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>

              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  Instruktur
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-100 text-indigo-800">
                  AI Agent
                </span>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                Aktifkan AI Agent Penyusun Soal dengan siklus cerdas <em>Rencana &rarr; Aksi &rarr; Periksa &rarr; Perbaiki</em> untuk melengkapi bank soal hingga 3 soal per unit.
              </p>

              <div className="space-y-2 mb-6">
                <div className="flex items-start text-xs text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-indigo-500 mr-2 shrink-0 mt-0.5" />
                  <span>Agent cerdas dengan Gemini Function Calling</span>
                </div>
                <div className="flex items-start text-xs text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-indigo-500 mr-2 shrink-0 mt-0.5" />
                  <span>Audit mandiri 4 kriteria kualitas & perbaikan otomatis</span>
                </div>
                <div className="flex items-start text-xs text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-indigo-500 mr-2 shrink-0 mt-0.5" />
                  <span>Daftar persetujuan, koreksi, dan umpan balik</span>
                </div>
              </div>
            </div>

            <button className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-indigo-600 text-white font-semibold text-sm group-hover:bg-indigo-700 transition-colors shadow-xs">
              <span>Masuk Sebagai Instruktur</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Card: Admin */}
          <div
            onClick={() => onSelectRole('admin')}
            className="group relative bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 hover:border-amber-300 hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700 mb-5 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>

              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                  Admin Sistem
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-900">
                  Semua Akses
                </span>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                Akses penuh ke semua fitur: unggah PDF SKKNI untuk ekstraksi KUK otomatis, pantau tabel hasil peserta, unduh CSV, kelola log agent, dan pengaturan.
              </p>

              <div className="space-y-2 mb-6">
                <div className="flex items-start text-xs text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-amber-500 mr-2 shrink-0 mt-0.5" />
                  <span>Impor dokumen PDF SKKNI & kelola KUK unit</span>
                </div>
                <div className="flex items-start text-xs text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-amber-500 mr-2 shrink-0 mt-0.5" />
                  <span>Tabel hasil peserta & ekspor rekap ke CSV</span>
                </div>
                <div className="flex items-start text-xs text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-amber-500 mr-2 shrink-0 mt-0.5" />
                  <span>Cadangan database JSON & audit log agent</span>
                </div>
              </div>
            </div>

            <button className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-amber-600 text-white font-semibold text-sm group-hover:bg-amber-700 transition-colors shadow-xs">
              <span>Masuk Sebagai Admin</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Snapshot Stats Bar */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          <div className="p-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-indigo-400 mb-1">
              {unitsCount} Unit
            </div>
            <div className="text-xs text-slate-300 font-medium">
              SKKNI No. 299/2020
            </div>
          </div>

          <div className="p-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mb-1">
              {approvedCount} Soal
            </div>
            <div className="text-xs text-slate-300 font-medium">
              Bank Soal Disetujui
            </div>
          </div>

          <div className="p-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 mb-1">
              {pendingCount} Draf
            </div>
            <div className="text-xs text-slate-300 font-medium">
              Menunggu Review
            </div>
          </div>

          <div className="p-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400 mb-1">
              {totalParticipants} Sesi
            </div>
            <div className="text-xs text-slate-300 font-medium">
              Peserta Selesai Diuji
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
