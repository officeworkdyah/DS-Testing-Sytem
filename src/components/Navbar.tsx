/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserRole } from '../types/index.ts';
import {
  GraduationCap,
  ShieldCheck,
  Sparkles,
  User,
  Sliders,
  Menu,
  X,
  BookOpen,
  Database
} from 'lucide-react';

interface NavbarProps {
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  pendingCount?: number;
  onOpenHome?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onSelectRole,
  pendingCount = 0,
  onOpenHome
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const roleLabels: Record<UserRole, { title: string; badge: string; color: string; icon: any }> = {
    participant: {
      title: 'Peserta',
      badge: 'Mode Tes',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: User
    },
    instructor: {
      title: 'Instruktur',
      badge: 'AI Agent & Bank Soal',
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      icon: Sparkles
    },
    admin: {
      title: 'Admin',
      badge: 'Kendali Penuh',
      color: 'bg-amber-50 text-amber-800 border-amber-200',
      icon: ShieldCheck
    }
  };

  const activeRoleInfo = roleLabels[currentRole];
  const ActiveIcon = activeRoleInfo.icon;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div
            onClick={onOpenHome}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">
                  AgenKompeten <span className="text-indigo-600">DS</span>
                </span>
                <span className="hidden sm:inline-block text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                  SKKNI 299/2020
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Uji Penempatan Level Data Science berbasis Gemini
              </p>
            </div>
          </div>

          {/* Desktop Role Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            <span className="text-xs text-slate-500 font-medium mr-1">Peran Aktif:</span>

            <button
              onClick={() => onSelectRole('participant')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                currentRole === 'participant'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Peserta</span>
            </button>

            <button
              onClick={() => onSelectRole('instructor')}
              className={`relative flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                currentRole === 'instructor'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Instruktur</span>
              {pendingCount > 0 && (
                <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-bold ${
                  currentRole === 'instructor' ? 'bg-amber-400 text-slate-900' : 'bg-amber-100 text-amber-800'
                }`}>
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onSelectRole('admin')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                currentRole === 'admin'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin</span>
            </button>
          </div>

          {/* Active Role Badge (Mobile & quick summary) */}
          <div className="flex md:hidden items-center space-x-2">
            <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${activeRoleInfo.color}`}>
              <ActiveIcon className="w-3.5 h-3.5" />
              <span>{activeRoleInfo.title}</span>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-4 space-y-2 shadow-lg">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Pilih Peran Pengguna (Prototipe)
          </p>

          <button
            onClick={() => {
              onSelectRole('participant');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
              currentRole === 'participant'
                ? 'bg-emerald-50 text-emerald-800 font-semibold'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-emerald-600" />
              <div className="text-left">
                <div>Peserta Tes</div>
                <div className="text-xs text-slate-500">Mengerjakan tes penempatan level</div>
              </div>
            </div>
            {currentRole === 'participant' && <span className="text-emerald-600 font-bold">✓</span>}
          </button>

          <button
            onClick={() => {
              onSelectRole('instructor');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
              currentRole === 'instructor'
                ? 'bg-indigo-50 text-indigo-800 font-semibold'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <div className="text-left">
                <div className="flex items-center space-x-2">
                  <span>Instruktur</span>
                  {pendingCount > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] bg-amber-100 text-amber-800 rounded-full font-bold">
                      {pendingCount} draf
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500">AI Agent & persetujuan bank soal</div>
              </div>
            </div>
            {currentRole === 'instructor' && <span className="text-indigo-600 font-bold">✓</span>}
          </button>

          <button
            onClick={() => {
              onSelectRole('admin');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
              currentRole === 'admin'
                ? 'bg-amber-50 text-amber-900 font-semibold'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center space-x-3">
              <ShieldCheck className="w-5 h-5 text-amber-600" />
              <div className="text-left">
                <div>Admin Sistem</div>
                <div className="text-xs text-slate-500">Kelola KUK, unduh CSV, log agent, pengaturan</div>
              </div>
            </div>
            {currentRole === 'admin' && <span className="text-amber-600 font-bold">✓</span>}
          </button>
        </div>
      )}
    </header>
  );
};
