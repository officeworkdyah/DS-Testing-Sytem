/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Question,
  SkkniUnit,
  CorrectionHistory,
  SkillLevel,
  AgentLog
} from '../types/index.ts';
import {
  getAllUnits,
  getAllQuestions,
  approveQuestion,
  deleteQuestion,
  saveQuestion,
  addCorrectionHistory,
  getAllCorrectionHistory,
  saveAgentLog
} from '../services/db.ts';
import { runAgentPenyusunSoal } from '../services/api.ts';
import {
  Sparkles,
  CheckCircle2,
  Trash2,
  Edit3,
  AlertTriangle,
  Play,
  RotateCcw,
  Sliders,
  Filter,
  Search,
  BookOpen,
  Layers,
  Clock,
  History,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Cpu,
  Loader2
} from 'lucide-react';

interface InstructorViewProps {
  onRefreshStats?: () => void;
}

export const InstructorView: React.FC<InstructorViewProps> = ({ onRefreshStats }) => {
  const [units, setUnits] = useState<SkkniUnit[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [corrections, setCorrections] = useState<CorrectionHistory[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'bank' | 'history'>('pending');

  // Filters
  const [levelFilter, setLevelFilter] = useState<'Semua' | 'Basic' | 'Intermediate' | 'Advanced'>('Semua');
  const [unitFilter, setUnitFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Agent State
  const [agentLevelTarget, setAgentLevelTarget] = useState<'All' | 'Basic' | 'Intermediate' | 'Advanced'>('All');
  const [agentRunning, setAgentRunning] = useState(false);
  const [agentStatusText, setAgentStatusText] = useState('');
  const [agentLogs, setAgentLogs] = useState<string[]>([]);
  const [showAgentModal, setShowAgentModal] = useState(false);

  // Advanced Agent Controls (Manual override)
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [manualUnitCode, setManualUnitCode] = useState<string>('all');
  const [manualTargetCount, setManualTargetCount] = useState<number>(3);

  // Edit / Delete Modals with Reason Capture
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    question: Question | null;
    reason: string;
  }>({ isOpen: false, question: null, reason: '' });

  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    question: Question | null;
    stem: string;
    options: string[];
    correctAnswerIndex: number;
    explanation: string;
    reason: string;
  }>({
    isOpen: false,
    question: null,
    stem: '',
    options: ['', '', '', ''],
    correctAnswerIndex: 0,
    explanation: '',
    reason: ''
  });

  const loadData = async () => {
    try {
      const [uList, qList, cList] = await Promise.all([
        getAllUnits(),
        getAllQuestions(),
        getAllCorrectionHistory()
      ]);
      setUnits(uList);
      setQuestions(qList);
      setCorrections(cList);
      onRefreshStats?.();
    } catch (err) {
      console.error('Gagal memuat data instruktur:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute coverage per unit
  const coverageMap: Record<string, { approved: number; pending: number; title: string; level: string }> = {};
  units.forEach((u) => {
    coverageMap[u.code] = { approved: 0, pending: 0, title: u.title, level: u.level };
  });

  questions.forEach((q) => {
    if (coverageMap[q.unitCode]) {
      if (q.status === 'approved') {
        coverageMap[q.unitCode].approved++;
      } else {
        coverageMap[q.unitCode].pending++;
      }
    }
  });

  // Check deficit across all or per level (target: >= 3 approved per unit)
  const unitsBelowTarget = units.filter((u) => (coverageMap[u.code]?.approved || 0) < 3);
  const pendingQuestions = questions.filter((q) => q.status === 'pending');
  const approvedQuestions = questions.filter((q) => q.status === 'approved');

  // Trigger AI Agent to fulfill bank
  const handleTriggerAgent = async (targetLevel: 'All' | 'Basic' | 'Intermediate' | 'Advanced') => {
    setAgentRunning(true);
    setShowAgentModal(true);
    setAgentStatusText('Menyiapkan AI Agent...');
    setAgentLogs([]);

    const existingStems: Record<string, string[]> = {};
    questions.forEach((q) => {
      if (!existingStems[q.unitCode]) existingStems[q.unitCode] = [];
      existingStems[q.unitCode].push(q.stem);
    });

    try {
      const result = await runAgentPenyusunSoal({
        level: targetLevel,
        units,
        currentCoverage: coverageMap,
        correctionHistory: corrections,
        existingStems,
        customUnitCode: advancedOpen && manualUnitCode !== 'all' ? manualUnitCode : undefined,
        customCount: advancedOpen ? manualTargetCount : 3,
        onStatusUpdate: (msg) => setAgentStatusText(msg),
        onLogEvent: (logText) => setAgentLogs((prev) => [...prev, logText]),
        onQuestionCreated: async (newQ) => {
          await saveQuestion(newQ);
          setQuestions((prev) => [newQ, ...prev]);
        }
      });

      // Record agent log
      const logEntry: AgentLog = {
        id: `agent-run-${Date.now()}`,
        timestamp: new Date().toISOString(),
        levelRequested: targetLevel,
        targetUnits: units.map((u) => u.code),
        questionsCreated: result.createdQuestions.length,
        refinementsCount: result.refinementsCount,
        status: result.status,
        summary: result.summary,
        details: result.logs
      };
      await saveAgentLog(logEntry);

      await loadData();
      setActiveTab('pending');
    } catch (err: any) {
      setAgentLogs((prev) => [...prev, `[ERROR] ${err.message}`]);
      setAgentStatusText('Terjadi kendala saat agent bekerja.');
    } finally {
      setAgentRunning(false);
    }
  };

  // Actions on Questions
  const handleApprove = async (qId: string) => {
    await approveQuestion(qId);
    await loadData();
  };

  const handleOpenDelete = (q: Question) => {
    setDeleteModal({
      isOpen: true,
      question: q,
      reason: ''
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.question) return;
    const q = deleteModal.question;

    // Save correction reason so agent learns from it
    if (deleteModal.reason.trim()) {
      const entry: CorrectionHistory = {
        id: `corr-${Date.now()}`,
        unitCode: q.unitCode,
        unitTitle: q.unitTitle,
        action: 'deleted',
        originalStem: q.stem,
        reason: deleteModal.reason.trim(),
        timestamp: new Date().toISOString()
      };
      await addCorrectionHistory(entry);
    }

    await deleteQuestion(q.id);
    setDeleteModal({ isOpen: false, question: null, reason: '' });
    await loadData();
  };

  const handleOpenEdit = (q: Question) => {
    setEditModal({
      isOpen: true,
      question: q,
      stem: q.stem,
      options: [...q.options],
      correctAnswerIndex: q.correctAnswerIndex,
      explanation: q.explanation,
      reason: ''
    });
  };

  const handleConfirmEdit = async () => {
    if (!editModal.question) return;
    const q = editModal.question;

    const updatedQ: Question = {
      ...q,
      stem: editModal.stem,
      options: editModal.options,
      correctAnswerIndex: editModal.correctAnswerIndex,
      explanation: editModal.explanation
    };

    // Save correction reason so agent learns from it
    if (editModal.reason.trim()) {
      const entry: CorrectionHistory = {
        id: `corr-${Date.now()}`,
        unitCode: q.unitCode,
        unitTitle: q.unitTitle,
        action: 'edited',
        originalStem: q.stem,
        reason: editModal.reason.trim(),
        timestamp: new Date().toISOString()
      };
      await addCorrectionHistory(entry);
    }

    await saveQuestion(updatedQ);
    setEditModal({
      isOpen: false,
      question: null,
      stem: '',
      options: ['', '', '', ''],
      correctAnswerIndex: 0,
      explanation: '',
      reason: ''
    });
    await loadData();
  };

  // Filter questions for display
  const filterList = (list: Question[]) => {
    return list.filter((q) => {
      if (levelFilter !== 'Semua' && q.level !== levelFilter) return false;
      if (unitFilter !== 'all' && q.unitCode !== unitFilter) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const inStem = q.stem.toLowerCase().includes(query);
        const inUnit = q.unitCode.toLowerCase().includes(query) || q.unitTitle.toLowerCase().includes(query);
        if (!inStem && !inUnit) return false;
      }
      return true;
    });
  };

  const displayedPending = filterList(pendingQuestions);
  const displayedApproved = filterList(approvedQuestions);

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Auto Alert Notice: Unit Below Target */}
      {unitsBelowTarget.length > 0 && (
        <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-amber-950">
                Pemberitahuan Cakupan Bank Soal
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                Terdapat <strong className="font-semibold">{unitsBelowTarget.length} unit</strong> yang belum mencapai target minimal 3 soal yang disetujui.
              </p>
            </div>
          </div>

          <button
            onClick={() => handleTriggerAgent('All')}
            disabled={agentRunning}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors flex items-center justify-center space-x-2 shrink-0 shadow-xs"
          >
            <Sparkles className="w-4 h-4" />
            <span>Biarkan Agent Melengkapi</span>
          </button>
        </div>
      )}

      {/* Main Agent Action Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                AI Agent Penyusun Soal Data Science
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Siklus otonom: <em>Rencana &rarr; Aksi &rarr; Periksa (Skor 1-5) &rarr; Perbaiki &rarr; Simpan Draf</em>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Target Level Select */}
            <select
              aria-label="Pilih Target Level Bank Soal"
              value={agentLevelTarget}
              onChange={(e) => setAgentLevelTarget(e.target.value as any)}
              className="px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-700 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            >
              <option value="All">Semua Level (21 Unit)</option>
              <option value="Basic">Level: Basic (8 Unit)</option>
              <option value="Intermediate">Level: Intermediate (4 Unit)</option>
              <option value="Advanced">Level: Advanced (9 Unit)</option>
            </select>

            <button
              onClick={() => handleTriggerAgent(agentLevelTarget)}
              disabled={agentRunning}
              className="flex-1 md:flex-none px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors flex items-center justify-center space-x-2 shadow-xs"
            >
              {agentRunning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Agent Sedang Bekerja...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Lengkapi Bank Soal</span>
                </>
              )}
            </button>

            <button
              onClick={() => setAdvancedOpen(!advancedOpen)}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs flex items-center space-x-1"
              title="Opsi Lanjutan"
            >
              <Sliders className="w-4 h-4" />
              <span className="hidden sm:inline">Opsi</span>
              {advancedOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Collapsible Advanced Options */}
        {advancedOpen && (
          <div className="mt-4 pt-4 bg-slate-50/70 p-4 rounded-xl border border-slate-200">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              Opsi Manual Instruktur
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-600 mb-1">
                  Pilih Unit Tertentu:
                </label>
                <select
                  aria-label="Pilih Unit Spesifik SKKNI"
                  value={manualUnitCode}
                  onChange={(e) => setManualUnitCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                >
                  <option value="all">Semua Unit dalam Level Terpilih</option>
                  {units.map((u) => (
                    <option key={u.code} value={u.code}>
                      [{u.level}] {u.code} - {u.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-600 mb-1">
                  Target Jumlah Soal per Unit:
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={manualTargetCount}
                  onChange={(e) => setManualTargetCount(parseInt(e.target.value) || 3)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 mb-6">
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-3 px-4 text-sm font-semibold transition-colors relative flex items-center space-x-2 ${
            activeTab === 'pending'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <span>Menunggu Persetujuan</span>
          {pendingQuestions.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
              {pendingQuestions.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('bank')}
          className={`pb-3 px-4 text-sm font-semibold transition-colors relative flex items-center space-x-2 ${
            activeTab === 'bank'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <span>Bank Soal Disetujui</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            {approvedQuestions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 px-4 text-sm font-semibold transition-colors relative flex items-center space-x-2 ${
            activeTab === 'history'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Riwayat Koreksi ({corrections.length})</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 bg-slate-50 p-3 rounded-xl border border-slate-200">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center space-x-1 text-xs text-slate-500 mr-2">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </div>

          <select
            aria-label="Filter berdasarkan Jenjang Level"
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white text-slate-700 font-medium"
          >
            <option value="Semua">Semua Level</option>
            <option value="Basic">Basic</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>

          <select
            aria-label="Filter berdasarkan Unit SKKNI"
            value={unitFilter}
            onChange={(e) => setUnitFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white text-slate-700 font-medium max-w-[220px] truncate"
          >
            <option value="all">Semua Unit SKKNI</option>
            {units.map((u) => (
              <option key={u.code} value={u.code}>
                {u.code} - {u.title}
              </option>
            ))}
          </select>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari teks soal atau unit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* TAB 1: MENUNGGU PERSETUJUAN */}
      {activeTab === 'pending' && (
        <div>
          {displayedPending.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">
                Tidak Ada Draf yang Menunggu Persetujuan
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-5">
                Semua draf soal yang disusun oleh AI Agent telah Anda tinjau atau disetujui.
              </p>
              <button
                onClick={() => handleTriggerAgent('All')}
                className="px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold text-xs inline-flex items-center space-x-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Susun Soal Baru dengan Agent</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-xs text-slate-500 mb-2">
                Menampilkan {displayedPending.length} draf soal buatan AI Agent:
              </div>

              {displayedPending.map((q) => {
                const audit = q.audit;
                return (
                  <div
                    key={q.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 hover:border-indigo-200 transition-all"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            q.level === 'Basic'
                              ? 'bg-emerald-100 text-emerald-800'
                              : q.level === 'Intermediate'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {q.level}
                        </span>
                        <span className="text-xs font-semibold text-slate-700">
                          {q.unitCode} — {q.unitTitle}
                        </span>
                      </div>

                      {/* Agent Self-Audit Badges (Skor 1-5) */}
                      {audit && (
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium" title="Kejelasan kalimat soal">
                            Kejelasan: {audit.clarity}/5
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium" title="Kesesuaian dengan KUK SKKNI">
                            Kesesuaian: {audit.alignment}/5
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium" title="Kunci jawaban tunggal & pasti">
                            Kunci Tunggal: {audit.unambiguousAnswer}/5
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium" title="Kualitas pengecoh realistis">
                            Pengecoh: {audit.distractorQuality}/5
                          </span>
                          {audit.refinementCount > 0 && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-semibold" title="Jumlah siklus perbaikan mandiri">
                              {audit.refinementCount}x diperbaiki
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Question Stem */}
                    <p className="text-sm text-slate-900 font-semibold mb-4 leading-relaxed">
                      {q.stem}
                    </p>

                    {/* Options */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                      {q.options.map((opt, oIdx) => {
                        const isCorrect = q.correctAnswerIndex === oIdx;
                        return (
                          <div
                            key={oIdx}
                            className={`p-2.5 rounded-xl border text-xs flex items-start space-x-2 ${
                              isCorrect
                                ? 'border-emerald-300 bg-emerald-50/70 text-emerald-950 font-medium'
                                : 'border-slate-100 bg-slate-50/60 text-slate-700'
                            }`}
                          >
                            <span
                              className={`w-5 h-5 rounded-md shrink-0 flex items-center justify-center font-bold text-[10px] ${
                                isCorrect
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-200 text-slate-600'
                              }`}
                            >
                              {['A', 'B', 'C', 'D'][oIdx]}
                            </span>
                            <span className="pt-0.5">{opt}</span>
                            {isCorrect && (
                              <span className="ml-auto text-[10px] text-emerald-700 font-bold shrink-0">
                                (Kunci)
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Discussion */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600 mb-4">
                      <strong className="text-slate-800">Pembahasan SKKNI:</strong> {q.explanation}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                      <button
                        onClick={() => handleOpenDelete(q)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-rose-600 text-xs font-semibold flex items-center space-x-1 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </button>

                      <button
                        onClick={() => handleOpenEdit(q)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-indigo-600 text-xs font-semibold flex items-center space-x-1 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handleApprove(q.id)}
                        className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center space-x-1 shadow-xs transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Setujui</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: BANK SOAL DISETUJUI */}
      {activeTab === 'bank' && (
        <div>
          {/* Unit Coverage Indicators Grid */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 mb-6">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center">
              <Layers className="w-4 h-4 text-indigo-600 mr-1.5" />
              Indikator Cakupan Soal Per Unit SKKNI (Target: 3 Soal)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto pr-1">
              {units.map((u) => {
                const cov = coverageMap[u.code] || { approved: 0, pending: 0 };
                const isComplete = cov.approved >= 3;

                return (
                  <div
                    key={u.code}
                    onClick={() => setUnitFilter(u.code)}
                    className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                      unitFilter === u.code
                        ? 'border-indigo-500 bg-indigo-50/50 ring-1 ring-indigo-500'
                        : isComplete
                        ? 'border-slate-200 bg-emerald-50/20 hover:border-emerald-300'
                        : 'border-amber-200 bg-amber-50/30 hover:border-amber-400'
                    }`}
                  >
                    <div className="truncate mr-2">
                      <div className="font-semibold text-slate-800 truncate">
                        {u.code}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">{u.title}</div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md font-bold text-xs ${
                          isComplete
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {cov.approved}/3
                      </span>
                      {cov.pending > 0 && (
                        <div className="text-[10px] text-slate-400">
                          +{cov.pending} draf
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* List of Approved Questions */}
          {displayedApproved.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-2xl border border-slate-200 p-8">
              <p className="text-sm text-slate-600">
                Tidak ada soal disetujui yang cocok dengan filter saat ini.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs text-slate-500 mb-2">
                <span>Menampilkan {displayedApproved.length} soal aktif di bank soal:</span>
                {unitFilter !== 'all' && (
                  <button
                    onClick={() => setUnitFilter('all')}
                    className="text-indigo-600 hover:underline font-semibold"
                  >
                    Reset Filter Unit ({unitFilter})
                  </button>
                )}
              </div>

              {displayedApproved.map((q, idx) => (
                <div
                  key={q.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 hover:border-slate-300 transition-all"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-400">#{idx + 1}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          q.level === 'Basic'
                            ? 'bg-emerald-100 text-emerald-800'
                            : q.level === 'Intermediate'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {q.level}
                      </span>
                      <span className="text-xs font-semibold text-slate-700">
                        {q.unitCode} — {q.unitTitle}
                      </span>
                    </div>

                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      Disetujui
                    </span>
                  </div>

                  <p className="text-sm text-slate-900 font-medium mb-3">{q.stem}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                    {q.options.map((opt, oIdx) => (
                      <div
                        key={oIdx}
                        className={`p-2 rounded-lg text-xs ${
                          q.correctAnswerIndex === oIdx
                            ? 'bg-emerald-50 text-emerald-900 font-semibold border border-emerald-200'
                            : 'bg-slate-50 text-slate-600 border border-slate-100'
                        }`}
                      >
                        {['A', 'B', 'C', 'D'][oIdx]}. {opt}
                        {q.correctAnswerIndex === oIdx && ' (Kunci)'}
                      </div>
                    ))}
                  </div>

                  <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200 mb-3">
                    <strong>Pembahasan:</strong> {q.explanation}
                  </div>

                  <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleOpenDelete(q)}
                      className="px-3 py-1 rounded-lg border border-slate-200 hover:border-rose-300 text-rose-600 text-xs font-medium flex items-center space-x-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus Soal</span>
                    </button>
                    <button
                      onClick={() => handleOpenEdit(q)}
                      className="px-3 py-1 rounded-lg border border-slate-200 hover:border-indigo-300 text-indigo-600 text-xs font-medium flex items-center space-x-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Soal</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: RIWAYAT KOREKSI INSTRUKTUR */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900">
              Riwayat Koreksi & Catatan Instruktur
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Data umpan balik ini otomatis dibaca oleh AI Agent melalui alat <code>bacaRiwayatKoreksi(kodeUnit)</code> agar tidak mengulangi kesalahan serupa.
            </p>
          </div>

          {corrections.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              Belum ada riwayat koreksi atau penghapusan soal.
            </div>
          ) : (
            <div className="space-y-3">
              {corrections.map((c) => (
                <div
                  key={c.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold uppercase text-[10px] ${
                          c.action === 'deleted'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-indigo-100 text-indigo-800'
                        }`}
                      >
                        {c.action === 'deleted' ? 'Dihapus' : 'Diedit'}
                      </span>
                      <span className="font-semibold text-slate-800">
                        {c.unitCode} — {c.unitTitle}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(c.timestamp).toLocaleDateString('id-ID')}
                    </span>
                  </div>

                  <div className="text-slate-600 italic">
                    &ldquo;{c.originalStem.slice(0, 120)}...&rdquo;
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-slate-800">
                    <strong className="text-indigo-600">Alasan/Umpan Balik Instruktur:</strong>{' '}
                    {c.reason}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: LIVE AGENT CYCLE DRAWER / MODAL */}
      {showAgentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    AI Agent Penyusun Soal Aktif
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Gemini 3.8 Flash • Kepmenaker No. 299/2020
                  </p>
                </div>
              </div>

              {!agentRunning && (
                <button
                  onClick={() => setShowAgentModal(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold p-1"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Current Realtime Status */}
            <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-900 text-xs font-semibold flex items-center space-x-2 mb-4">
              {agentRunning ? (
                <Loader2 className="w-4 h-4 animate-spin text-indigo-600 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              )}
              <span className="leading-snug">{agentStatusText}</span>
            </div>

            {/* Terminal Live Feed of Thoughts */}
            <div className="flex-1 bg-slate-950 text-emerald-400 p-4 rounded-xl font-mono text-[11px] overflow-y-auto space-y-1.5 mb-4 border border-slate-800 shadow-inner">
              {agentLogs.length === 0 ? (
                <div className="text-slate-500 italic">Menunggu respon pertama agen...</div>
              ) : (
                agentLogs.map((log, lIdx) => (
                  <div key={lIdx} className="leading-relaxed">
                    <span className="text-slate-500 mr-1.5">&gt;</span>
                    {log}
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-xs text-slate-400">
                {agentRunning ? 'Siklus sedang berlangsung...' : 'Sesi agent telah selesai'}
              </span>

              <button
                onClick={() => setShowAgentModal(false)}
                disabled={agentRunning}
                className={`px-5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  agentRunning
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {agentRunning ? 'Harap Tunggu...' : 'Tutup & Lihat Hasil'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DELETE QUESTION WITH REASON */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900 mb-2">Hapus Soal</h3>
            <p className="text-xs text-slate-600 mb-4">
              Apakah Anda yakin ingin menghapus soal ini? Anda dapat memberikan alasan singkat agar AI Agent tidak membuat kesalahan yang sama di masa depan.
            </p>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Alasan Penghapusan (Opsional - Umpan Balik untuk Agent):
              </label>
              <textarea
                value={deleteModal.reason}
                onChange={(e) => setDeleteModal({ ...deleteModal, reason: e.target.value })}
                placeholder="Contoh: Soal terlalu teoritis, kurang ada konteks data science nyata..."
                rows={3}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setDeleteModal({ isOpen: false, question: null, reason: '' })}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
              >
                Hapus Soal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT QUESTION WITH REASON */}
      {editModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 mb-4">Edit Butir Soal</h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Pertanyaan (Stem):
                </label>
                <textarea
                  value={editModal.stem}
                  onChange={(e) => setEditModal({ ...editModal, stem: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-2">
                  4 Pilihan Opsi & Kunci Jawaban:
                </label>
                <div className="space-y-2">
                  {editModal.options.map((opt, oIdx) => (
                    <div key={oIdx} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="correctAnswerKey"
                        checked={editModal.correctAnswerIndex === oIdx}
                        onChange={() => setEditModal({ ...editModal, correctAnswerIndex: oIdx })}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="font-bold text-slate-500 w-5">
                        {['A', 'B', 'C', 'D'][oIdx]}.
                      </span>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...editModal.options];
                          newOpts[oIdx] = e.target.value;
                          setEditModal({ ...editModal, options: newOpts });
                        }}
                        className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Pembahasan / Alasan Kunci:
                </label>
                <textarea
                  value={editModal.explanation}
                  onChange={(e) => setEditModal({ ...editModal, explanation: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100">
                <label className="block font-semibold text-indigo-900 mb-1">
                  Alasan Perubahan (Umpan Balik untuk AI Agent):
                </label>
                <input
                  type="text"
                  value={editModal.reason}
                  onChange={(e) => setEditModal({ ...editModal, reason: e.target.value })}
                  placeholder="Contoh: Mengoreksi opsi B agar tidak ambigu..."
                  className="w-full px-3 py-1.5 rounded-lg border border-indigo-200 bg-white"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6 pt-4 border-t border-slate-100">
              <button
                onClick={() =>
                  setEditModal({
                    isOpen: false,
                    question: null,
                    stem: '',
                    options: ['', '', '', ''],
                    correctAnswerIndex: 0,
                    explanation: '',
                    reason: ''
                  })
                }
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmEdit}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
