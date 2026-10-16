/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { UserRole } from './types/index.ts';
import { Navbar } from './components/Navbar.tsx';
import { HomeRolePicker } from './views/HomeRolePicker.tsx';
import { ParticipantView } from './views/ParticipantView.tsx';
import { InstructorView } from './views/InstructorView.tsx';
import { AdminView } from './views/AdminView.tsx';
import {
  getAllQuestions,
  getAllUnits,
  getAllSessions
} from './services/db.ts';

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | UserRole>('home');
  const [approvedCount, setApprovedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [unitsCount, setUnitsCount] = useState(21);
  const [totalParticipants, setTotalParticipants] = useState(0);

  const refreshGlobalStats = async () => {
    try {
      const [questions, units, sessions] = await Promise.all([
        getAllQuestions(),
        getAllUnits(),
        getAllSessions()
      ]);
      setApprovedCount(questions.filter((q) => q.status === 'approved').length);
      setPendingCount(questions.filter((q) => q.status === 'pending').length);
      setUnitsCount(units.length);
      setTotalParticipants(sessions.length);
    } catch (e) {
      console.error('Failed to load global stats:', e);
    }
  };

  useEffect(() => {
    refreshGlobalStats();
  }, []);

  const handleSelectRole = (role: UserRole) => {
    setCurrentView(role);
    refreshGlobalStats();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Navigation */}
      <Navbar
        currentRole={currentView === 'home' ? 'participant' : currentView}
        onSelectRole={handleSelectRole}
        pendingCount={pendingCount}
        onOpenHome={() => setCurrentView('home')}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'home' && (
          <HomeRolePicker
            onSelectRole={handleSelectRole}
            approvedCount={approvedCount}
            pendingCount={pendingCount}
            totalParticipants={totalParticipants}
            unitsCount={unitsCount}
          />
        )}

        {currentView === 'participant' && (
          <ParticipantView onBackToHome={() => setCurrentView('home')} />
        )}

        {currentView === 'instructor' && (
          <InstructorView onRefreshStats={refreshGlobalStats} />
        )}

        {currentView === 'admin' && (
          <AdminView
            onSwitchRole={handleSelectRole}
            onRefreshStats={refreshGlobalStats}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong>AgenKompeten DS</strong> &mdash; Uji Penempatan Level Data Science berbasis SKKNI No. 299/2020.
          </div>
          <div className="flex items-center space-x-4 text-slate-400">
            <span>Penyimpanan Aman Browser (IndexedDB)</span>
            <span>•</span>
            <span>Ditenagai Gemini AI</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
