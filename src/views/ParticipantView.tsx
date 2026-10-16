/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Question,
  ParticipantSession,
  SkillLevel,
  TestResultUnitBreakdown,
  AppSettings
} from '../types/index.ts';
import {
  saveParticipantSession,
  getApprovedQuestions,
  getSettings
} from '../services/db.ts';
import { requestStudyRecommendation } from '../services/api.ts';
import {
  User,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  BookOpen,
  Award,
  Clock,
  HelpCircle,
  Check,
  ChevronRight,
  TrendingUp,
  FileCheck,
  Loader2,
  Share2
} from 'lucide-react';

interface ParticipantViewProps {
  onBackToHome: () => void;
}

// Sanitized test question without exposing answer keys
interface SanitizedQuestion {
  id: string;
  unitCode: string;
  unitTitle: string;
  level: SkillLevel;
  stem: string;
  options: string[];
}

export const ParticipantView: React.FC<ParticipantViewProps> = ({ onBackToHome }) => {
  const [step, setStep] = useState<'intro' | 'testing' | 'result'>('intro');
  const [name, setName] = useState('');
  const [participantId, setParticipantId] = useState('');
  const [settings, setSettings] = useState<AppSettings>({
    questionsPerLevel: 5,
    passingThreshold: 70,
    autoAgentReplenishNotice: true
  });

  // Test session state
  const [sanitizedQuestions, setSanitizedQuestions] = useState<SanitizedQuestion[]>([]);
  const [rawQuestionsMap, setRawQuestionsMap] = useState<Record<string, Question>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});
  const [showConfirmFinishModal, setShowConfirmFinishModal] = useState(false);
  const [showQuestionGridModal, setShowQuestionGridModal] = useState(false);

  // Result state
  const [resultSession, setResultSession] = useState<ParticipantSession | null>(null);
  const [isGeneratingRecommendation, setIsGeneratingRecommendation] = useState(false);
  const [activeResultTab, setActiveResultTab] = useState<'summary' | 'review'>('summary');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Generate an anonymous ID for privacy
    const randomHex = Math.floor(1000 + Math.random() * 9000);
    setParticipantId(`DS-PESERTA-${randomHex}`);

    // Load settings
    getSettings().then(setSettings).catch(console.error);
  }, []);

  // Helper shuffle array
  const shuffleArray = <T,>(array: T[]): T[] => {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  // Start test: compile equal number of questions per level
  const handleStartTest = async () => {
    if (!name.trim()) {
      setErrorMsg('Harap masukkan nama Anda terlebih dahulu');
      return;
    }
    setErrorMsg('');

    try {
      const approved = await getApprovedQuestions();

      if (approved.length === 0) {
        setErrorMsg('Bank soal saat ini masih kosong. Silakan masuk ke mode Instruktur untuk membuat soal dengan AI Agent.');
        return;
      }

      const basicPool = approved.filter((q) => q.level === 'Basic');
      const interPool = approved.filter((q) => q.level === 'Intermediate');
      const advPool = approved.filter((q) => q.level === 'Advanced');

      const targetCount = settings.questionsPerLevel || 5;

      // Sample evenly
      const selectedBasic = shuffleArray(basicPool).slice(0, targetCount);
      const selectedInter = shuffleArray(interPool).slice(0, targetCount);
      const selectedAdv = shuffleArray(advPool).slice(0, targetCount);

      const allSelected = [...selectedBasic, ...selectedInter, ...selectedAdv];

      if (allSelected.length === 0) {
        setErrorMsg('Tidak cukup soal yang disetujui dalam bank soal untuk memulai tes.');
        return;
      }

      // Store complete map for secure scoring at the end
      const map: Record<string, Question> = {};
      allSelected.forEach((q) => {
        map[q.id] = q;
      });
      setRawQuestionsMap(map);

      // Create shuffled test presentation with option shuffling
      // SECURITY: correctAnswerIndex is NEVER sent to the presentation model
      const randomizedTest: SanitizedQuestion[] = shuffleArray(allSelected).map((q) => {
        // Shuffle options and calculate where the original correct answer landed
        const originalCorrectOption = q.options[q.correctAnswerIndex];
        const shuffledOptions = shuffleArray(q.options);

        // Store mapping in memory on server or hidden map
        map[q.id] = {
          ...q,
          options: shuffledOptions,
          correctAnswerIndex: shuffledOptions.indexOf(originalCorrectOption)
        };

        return {
          id: q.id,
          unitCode: q.unitCode,
          unitTitle: q.unitTitle,
          level: q.level,
          stem: q.stem,
          options: shuffledOptions
        };
      });

      setSanitizedQuestions(randomizedTest);
      setCurrentIndex(0);
      setUserAnswers({});
      setFlaggedQuestions({});
      setStep('testing');
    } catch (err: any) {
      setErrorMsg('Gagal menyusun soal tes: ' + err.message);
    }
  };

  // Select option for current question
  const handleSelectOption = (optionIndex: number) => {
    const currentQ = sanitizedQuestions[currentIndex];
    if (!currentQ) return;
    setUserAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optionIndex
    }));
  };

  const toggleFlagCurrentQuestion = () => {
    const currentQ = sanitizedQuestions[currentIndex];
    if (!currentQ) return;
    setFlaggedQuestions((prev) => ({
      ...prev,
      [currentQ.id]: !prev[currentQ.id]
    }));
  };

  // Finish test and calculate scores
  const handleFinishTest = async () => {
    setShowConfirmFinishModal(false);

    // Calculate score per level
    let basicTotal = 0;
    let basicCorrect = 0;
    let interTotal = 0;
    let interCorrect = 0;
    let advTotal = 0;
    let advCorrect = 0;

    const unitStats: Record<string, { unitCode: string; unitTitle: string; level: SkillLevel; total: number; correct: number }> = {};

    sanitizedQuestions.forEach((sq) => {
      const fullQ = rawQuestionsMap[sq.id];
      if (!fullQ) return;

      const chosen = userAnswers[sq.id];
      const isCorrect = chosen !== undefined && chosen === fullQ.correctAnswerIndex;

      // Level aggregations
      if (sq.level === 'Basic') {
        basicTotal++;
        if (isCorrect) basicCorrect++;
      } else if (sq.level === 'Intermediate') {
        interTotal++;
        if (isCorrect) interCorrect++;
      } else if (sq.level === 'Advanced') {
        advTotal++;
        if (isCorrect) advCorrect++;
      }

      // Unit aggregations
      if (!unitStats[sq.unitCode]) {
        unitStats[sq.unitCode] = {
          unitCode: sq.unitCode,
          unitTitle: sq.unitTitle,
          level: sq.level,
          total: 0,
          correct: 0
        };
      }
      unitStats[sq.unitCode].total++;
      if (isCorrect) unitStats[sq.unitCode].correct++;
    });

    const scoreBasic = basicTotal > 0 ? Math.round((basicCorrect / basicTotal) * 100) : 0;
    const scoreIntermediate = interTotal > 0 ? Math.round((interCorrect / interTotal) * 100) : 0;
    const scoreAdvanced = advTotal > 0 ? Math.round((advCorrect / advTotal) * 100) : 0;
    const totalQuestions = sanitizedQuestions.length;
    const totalCorrect = basicCorrect + interCorrect + advCorrect;
    const totalScore = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

    const threshold = settings.passingThreshold || 70;

    // Qualification rules from prompt:
    // - Advanced: skor Basic >= 70%, Intermediate >= 70%, dan Advanced >= 70%
    // - Intermediate: skor Basic >= 70% dan Intermediate >= 70%
    // - Basic: selain itu
    let finalLevel: SkillLevel = 'Basic';
    if (scoreBasic >= threshold && scoreIntermediate >= threshold && scoreAdvanced >= threshold) {
      finalLevel = 'Advanced';
    } else if (scoreBasic >= threshold && scoreIntermediate >= threshold) {
      finalLevel = 'Intermediate';
    } else {
      finalLevel = 'Basic';
    }

    const unitBreakdown: TestResultUnitBreakdown[] = Object.values(unitStats).map((u) => ({
      unitCode: u.unitCode,
      unitTitle: u.unitTitle,
      level: u.level,
      total: u.total,
      correct: u.correct,
      percentage: Math.round((u.correct / u.total) * 100)
    }));

    // Identify weakest units
    const weakestUnits = [...unitBreakdown]
      .sort((a, b) => a.percentage - b.percentage)
      .slice(0, 3)
      .map((u) => ({
        code: u.unitCode,
        title: u.unitTitle,
        level: u.level,
        scoreRatio: `${u.correct}/${u.total} (${u.percentage}%)`
      }));

    const sessionData: ParticipantSession = {
      id: `session-${Date.now()}`,
      participantId,
      participantName: name.trim(),
      startedAt: new Date(Date.now() - sanitizedQuestions.length * 45000).toISOString(),
      completedAt: new Date().toISOString(),
      answers: userAnswers,
      scoreBasic,
      scoreIntermediate,
      scoreAdvanced,
      totalScore,
      finalLevel,
      unitBreakdown,
      recommendation: ''
    };

    setResultSession(sessionData);
    setStep('result');

    // Save session in IndexedDB
    await saveParticipantSession(sessionData);

    // Request AI Study Recommendations from server Gemini
    // (Privacy: Real name is never sent, only participantId)
    setIsGeneratingRecommendation(true);
    try {
      const rec = await requestStudyRecommendation({
        participantId,
        finalLevel,
        weakestUnits,
        scoreBasic,
        scoreIntermediate,
        scoreAdvanced
      });
      sessionData.recommendation = rec;
      setResultSession({ ...sessionData });
      await saveParticipantSession(sessionData);
    } catch (e) {
      console.warn('Recommendation generation error:', e);
    } finally {
      setIsGeneratingRecommendation(false);
    }
  };

  const answeredCount = Object.keys(userAnswers).length;
  const currentQ = sanitizedQuestions[currentIndex];

  // --- RENDER STEP 1: INTRO ---
  if (step === 'intro') {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Uji Penempatan Level Data Science
              </h2>
              <p className="text-xs text-slate-500">
                Standar Kompetensi Kerja Nasional Indonesia (SKKNI No. 299/2020)
              </p>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center">
                <BookOpen className="w-4 h-4 text-indigo-600 mr-2" />
                Ketentuan Penentuan Level:
              </h4>
              <ul className="text-xs text-slate-600 space-y-2">
                <li className="flex items-start">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 mr-2 shrink-0" />
                  <span>
                    <strong className="text-slate-800">Advanced:</strong> Nilai Basic &ge; 70%, Intermediate &ge; 70%, dan Advanced &ge; 70%.
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 mr-2 shrink-0" />
                  <span>
                    <strong className="text-slate-800">Intermediate:</strong> Nilai Basic &ge; 70% dan Intermediate &ge; 70%.
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 mr-2 shrink-0" />
                  <span>
                    <strong className="text-slate-800">Basic:</strong> Apabila belum memenuhi ambang batas di atas.
                  </span>
                </li>
              </ul>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100">
                <div className="text-xs font-semibold text-indigo-900">Basic</div>
                <div className="text-lg font-bold text-indigo-600">{settings.questionsPerLevel} Soal</div>
                <div className="text-[10px] text-indigo-700">Data Prep</div>
              </div>
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100">
                <div className="text-xs font-semibold text-blue-900">Intermediate</div>
                <div className="text-lg font-bold text-blue-600">{settings.questionsPerLevel} Soal</div>
                <div className="text-[10px] text-blue-700">Modeling & Eval</div>
              </div>
              <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100">
                <div className="text-xs font-semibold text-purple-900">Advanced</div>
                <div className="text-lg font-bold text-purple-600">{settings.questionsPerLevel} Soal</div>
                <div className="text-[10px] text-purple-700">Deployment & MLOps</div>
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-4 mb-6">
            <div>
              <label htmlFor="participant-name" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Nama Lengkap Peserta
              </label>
              <input
                id="participant-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Budi Santoso"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                onKeyDown={(e) => e.key === 'Enter' && handleStartTest()}
              />
              <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
                <span>ID Anonim Sistem: {participantId}</span>
                <span>Data tersimpan di peramban</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={onBackToHome}
              className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              Kembali
            </button>
            <button
              onClick={handleStartTest}
              className="w-full sm:flex-1 py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors flex items-center justify-center space-x-2 shadow-xs"
            >
              <span>Mulai Tes Penempatan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER STEP 2: ACTIVE TEST ---
  if (step === 'testing' && currentQ) {
    const isAnswered = userAnswers[currentQ.id] !== undefined;
    const isFlagged = !!flaggedQuestions[currentQ.id];

    return (
      <div className="max-w-3xl mx-auto py-6 px-4 sm:px-6">
        {/* Top Progress Bar & Header */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 mb-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Soal {currentIndex + 1} dari {sanitizedQuestions.length}
              </span>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                  currentQ.level === 'Basic'
                    ? 'bg-emerald-100 text-emerald-800'
                    : currentQ.level === 'Intermediate'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-purple-100 text-purple-800'
                }`}
              >
                Level: {currentQ.level}
              </span>
            </div>

            {/* Quick Grid Navigator Trigger */}
            <button
              onClick={() => setShowQuestionGridModal(true)}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center space-x-1"
            >
              <span>Daftar Soal ({answeredCount}/{sanitizedQuestions.length})</span>
            </button>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full transition-all duration-300"
              style={{
                width: `${Math.round((answeredCount / sanitizedQuestions.length) * 100)}%`
              }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-6">
          <div className="mb-4">
            <span className="text-xs font-semibold text-slate-400">
              Unit: {currentQ.unitCode} — {currentQ.unitTitle}
            </span>
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 leading-relaxed mt-2">
              {currentQ.stem}
            </h3>
          </div>

          {/* Options */}
          <div className="space-y-3 my-6">
            {currentQ.options.map((opt, oIdx) => {
              const isSelected = userAnswers[currentQ.id] === oIdx;
              const optionLetters = ['A', 'B', 'C', 'D'];

              return (
                <button
                  key={oIdx}
                  onClick={() => handleSelectOption(oIdx)}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-start space-x-3 ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20 text-slate-900 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50 text-slate-700'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center font-bold text-xs ${
                      isSelected
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {optionLetters[oIdx]}
                  </div>
                  <span className="text-sm pt-0.5 leading-snug">{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Question bottom tools */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={toggleFlagCurrentQuestion}
              className={`flex items-center space-x-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                isFlagged
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : 'text-slate-500 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{isFlagged ? '★ Ditandai Ragu' : '☆ Tandai Ragu'}</span>
            </button>

            <span className="text-xs text-slate-400">
              {isAnswered ? 'Jawaban tersimpan' : 'Belum dijawab'}
            </span>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-colors ${
              currentIndex === 0
                ? 'opacity-40 cursor-not-allowed border-slate-200 text-slate-400'
                : 'border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Sebelumnya</span>
          </button>

          {currentIndex < sanitizedQuestions.length - 1 ? (
            <button
              onClick={() => setCurrentIndex((prev) => Math.min(sanitizedQuestions.length - 1, prev + 1))}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-colors"
            >
              <span>Berikutnya</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setShowConfirmFinishModal(true)}
              className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors shadow-xs"
            >
              <Check className="w-4 h-4" />
              <span>Selesai & Kumpulkan</span>
            </button>
          )}
        </div>

        {/* Modal Confirm Finish */}
        {showConfirmFinishModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Konfirmasi Pengumpulan Tes</h3>
              <p className="text-sm text-slate-600 mb-4">
                Anda telah menjawab{' '}
                <strong className="text-slate-900">{answeredCount}</strong> dari{' '}
                <strong className="text-slate-900">{sanitizedQuestions.length}</strong> butir soal.
                {answeredCount < sanitizedQuestions.length && (
                  <span className="block mt-1 text-amber-600 font-medium">
                    Masih ada {sanitizedQuestions.length - answeredCount} soal yang belum Anda jawab.
                  </span>
                )}
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowConfirmFinishModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50"
                >
                  Lanjutkan Mengerjakan
                </button>
                <button
                  onClick={handleFinishTest}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold"
                >
                  Ya, Kumpulkan Sekarang
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Question Grid Navigator */}
        {showQuestionGridModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-100 max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <h3 className="font-bold text-slate-900 text-sm">Lembar Navigasi Soal</h3>
                <button
                  onClick={() => setShowQuestionGridModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-5 sm:grid-cols-6 gap-2.5 overflow-y-auto p-1 mb-6">
                {sanitizedQuestions.map((q, idx) => {
                  const ans = userAnswers[q.id] !== undefined;
                  const isCur = currentIndex === idx;
                  const flg = !!flaggedQuestions[q.id];

                  return (
                    <button
                      key={q.id}
                      onClick={() => {
                        setCurrentIndex(idx);
                        setShowQuestionGridModal(false);
                      }}
                      className={`h-11 rounded-xl text-xs font-bold transition-all relative flex items-center justify-center ${
                        isCur
                          ? 'ring-2 ring-indigo-600 ring-offset-2'
                          : ''
                      } ${
                        ans
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {idx + 1}
                      {flg && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border border-white" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
                <div className="flex items-center space-x-3">
                  <span className="flex items-center space-x-1">
                    <span className="w-3 h-3 bg-emerald-600 rounded-xs" />
                    <span>Terjawab</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span className="w-3 h-3 bg-slate-200 rounded-xs" />
                    <span>Kosong</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span className="w-3 h-3 bg-amber-400 rounded-full" />
                    <span>Ragu</span>
                  </span>
                </div>
                <button
                  onClick={() => {
                    setShowQuestionGridModal(false);
                    setShowConfirmFinishModal(true);
                  }}
                  className="text-emerald-700 font-bold hover:underline"
                >
                  Selesai Tes &rarr;
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- RENDER STEP 3: RESULT VIEW ---
  if (step === 'result' && resultSession) {
    const levelBadgeColors: Record<SkillLevel, { bg: string; text: string; border: string; desc: string }> = {
      Basic: {
        bg: 'bg-emerald-500',
        text: 'text-white',
        border: 'border-emerald-600',
        desc: 'Kompeten pada aspek Pengumpulan & Penyiapan Data (Data Understanding & Preparation)'
      },
      Intermediate: {
        bg: 'bg-blue-600',
        text: 'text-white',
        border: 'border-blue-700',
        desc: 'Kompeten pada Pemodelan & Evaluasi Algoritma Machine Learning (Modeling & Evaluation)'
      },
      Advanced: {
        bg: 'bg-purple-600',
        text: 'text-white',
        border: 'border-purple-700',
        desc: 'Kompeten Menyeluruh hingga Pemahaman Bisnis, Arsitektur Deployment, dan MLOps'
      }
    };

    const activeBadge = levelBadgeColors[resultSession.finalLevel];

    return (
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
        {/* Hero Level Badge Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-10 mb-8 text-center relative overflow-hidden">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold mb-4">
            <Award className="w-4 h-4 text-amber-500" />
            <span>Hasil Uji Kompetensi Data Science SKKNI No. 299/2020</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">
            Selamat, {resultSession.participantName}!
          </h2>
          <p className="text-xs text-slate-600 mb-6">
            ID Peserta: {resultSession.participantId} • Selesai pada:{' '}
            {new Date(resultSession.completedAt).toLocaleTimeString('id-ID', {
              hour: '2-digit',
              minute: '2-digit'
            })}{' '}
            WIB
          </p>

          {/* Big Level Badge */}
          <div className="inline-block my-4">
            <div
              className={`px-8 py-4 sm:px-12 sm:py-6 rounded-3xl ${activeBadge.bg} ${activeBadge.text} shadow-xl transform transition-transform hover:scale-105`}
            >
              <div className="text-xs sm:text-sm font-semibold tracking-widest uppercase opacity-90 mb-1">
                Tingkat Kualifikasi Anda:
              </div>
              <div className="text-3xl sm:text-5xl font-extrabold tracking-tight">
                {resultSession.finalLevel.toUpperCase()}
              </div>
            </div>
          </div>

          <p className="max-w-xl mx-auto text-sm text-slate-600 mt-4 leading-relaxed font-medium">
            {activeBadge.desc}
          </p>

          <div className="mt-4 text-xs text-slate-600 bg-slate-50 inline-block px-4 py-2 rounded-xl border border-slate-200">
            Tolok ukur penempatan: Skor rata-rata per level minimal {settings.passingThreshold}%.
          </div>
        </div>

        {/* Score per Level (Bar Chart representation) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 mb-8">
          <h3 className="text-base font-bold text-slate-900 mb-5 flex items-center">
            <TrendingUp className="w-5 h-5 text-indigo-600 mr-2" />
            Capaian Skor Per Jenjang Level
          </h3>

          <div className="space-y-5">
            {/* Basic */}
            <div>
              <div className="flex justify-between items-center text-sm font-semibold mb-1.5">
                <span className="text-slate-800">Basic (Data Understanding & Prep)</span>
                <span className="text-emerald-600">{resultSession.scoreBasic}%</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden relative">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-700"
                  style={{ width: `${resultSession.scoreBasic}%` }}
                />
                {/* 70% threshold marker */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-slate-900/40"
                  style={{ left: `${settings.passingThreshold}%` }}
                  title={`Ambang Lulus (${settings.passingThreshold}%)`}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>0%</span>
                <span className="text-slate-500 font-medium">Ambang: {settings.passingThreshold}%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Intermediate */}
            <div>
              <div className="flex justify-between items-center text-sm font-semibold mb-1.5">
                <span className="text-slate-800">Intermediate (Modeling & Evaluation)</span>
                <span className="text-blue-600">{resultSession.scoreIntermediate}%</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden relative">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-700"
                  style={{ width: `${resultSession.scoreIntermediate}%` }}
                />
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-slate-900/40"
                  style={{ left: `${settings.passingThreshold}%` }}
                  title={`Ambang Lulus (${settings.passingThreshold}%)`}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>0%</span>
                <span className="text-slate-500 font-medium">Ambang: {settings.passingThreshold}%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Advanced */}
            <div>
              <div className="flex justify-between items-center text-sm font-semibold mb-1.5">
                <span className="text-slate-800">Advanced (Business Understanding & Deployment)</span>
                <span className="text-purple-600">{resultSession.scoreAdvanced}%</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden relative">
                <div
                  className="bg-purple-600 h-full rounded-full transition-all duration-700"
                  style={{ width: `${resultSession.scoreAdvanced}%` }}
                />
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-slate-900/40"
                  style={{ left: `${settings.passingThreshold}%` }}
                  title={`Ambang Lulus (${settings.passingThreshold}%)`}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>0%</span>
                <span className="text-slate-500 font-medium">Ambang: {settings.passingThreshold}%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Gemini AI Personalized Study Advice */}
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 mb-8 shadow-lg">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/30 flex items-center justify-center text-indigo-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Rekomendasi Belajar Personal (Gemini AI)</h3>
              <p className="text-xs text-indigo-200">
                Disusun khusus berdasarkan analisis unit kompetensi terlemah Anda
              </p>
            </div>
          </div>

          {isGeneratingRecommendation ? (
            <div className="py-6 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-7 h-7 text-indigo-400 animate-spin" />
              <p className="text-xs text-indigo-200">
                Gemini sedang menganalisis titik kompetensi yang perlu ditingkatkan...
              </p>
            </div>
          ) : resultSession.recommendation ? (
            <div className="text-sm text-indigo-50 leading-relaxed whitespace-pre-line bg-white/5 p-4 sm:p-6 rounded-2xl border border-white/10 font-normal">
              {resultSession.recommendation}
            </div>
          ) : (
            <p className="text-xs text-indigo-300 italic">
              Pertahankan kompetensi Anda dan lanjutkan eksplorasi proyek machine learning nyata.
            </p>
          )}
        </div>

        {/* Tab Review Soal & Jawaban */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">
              Review Pembahasan Soal ({sanitizedQuestions.length} Butir)
            </h3>
            <span className="text-xs text-slate-400">
              Kunci & Pembahasan resmi SKKNI
            </span>
          </div>

          <div className="space-y-4">
            {sanitizedQuestions.map((sq, sIdx) => {
              const full = rawQuestionsMap[sq.id];
              if (!full) return null;
              const userPick = userAnswers[sq.id];
              const isCorrect = userPick === full.correctAnswerIndex;

              return (
                <div
                  key={sq.id}
                  className={`p-4 rounded-xl border text-sm transition-all ${
                    isCorrect
                      ? 'border-emerald-200 bg-emerald-50/30'
                      : 'border-rose-200 bg-rose-50/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="font-bold text-slate-800">
                      Soal #{sIdx + 1} ({full.unitCode} - {full.level})
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
                        isCorrect
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {isCorrect ? '✓ Benar' : '✗ Salah'}
                    </span>
                  </div>

                  <p className="text-slate-700 font-medium mb-3">{full.stem}</p>

                  <div className="space-y-1.5 mb-3 text-xs">
                    {full.options.map((opt, oIdx) => {
                      const isUserChoice = userPick === oIdx;
                      const isRealAnswer = full.correctAnswerIndex === oIdx;

                      let optClass = 'text-slate-600 bg-white/60';
                      if (isRealAnswer) {
                        optClass = 'bg-emerald-100 text-emerald-900 font-semibold border-emerald-300';
                      } else if (isUserChoice && !isRealAnswer) {
                        optClass = 'bg-rose-100 text-rose-900 font-semibold line-through border-rose-300';
                      }

                      return (
                        <div
                          key={oIdx}
                          className={`p-2 rounded-lg border border-transparent ${optClass}`}
                        >
                          {['A', 'B', 'C', 'D'][oIdx]}. {opt}
                          {isRealAnswer && ' (Kunci Jawaban)'}
                          {isUserChoice && !isRealAnswer && ' (Jawaban Anda)'}
                        </div>
                      );
                    })}
                  </div>

                  <div className="text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-200">
                    <strong className="text-slate-800">Pembahasan SKKNI:</strong> {full.explanation}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={onBackToHome}
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            Kembali ke Beranda
          </button>

          <button
            onClick={() => {
              setStep('intro');
              setName('');
              setUserAnswers({});
              setResultSession(null);
            }}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors flex items-center justify-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Mulai Tes Baru</span>
          </button>
        </div>
      </div>
    );
  }

  return null;
};
