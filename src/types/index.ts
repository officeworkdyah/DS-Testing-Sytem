/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SkillLevel = 'Basic' | 'Intermediate' | 'Advanced';

export interface SkkniUnit {
  code: string;
  title: string;
  level: SkillLevel;
  category: string;
  description: string;
  kuks: string[]; // Kriteria Unjuk Kerja
}

export interface QuestionAudit {
  clarity: number; // 1-5
  alignment: number; // 1-5
  unambiguousAnswer: number; // 1-5
  distractorQuality: number; // 1-5
  refinementCount: number;
  notes?: string;
}

export interface Question {
  id: string;
  unitCode: string;
  unitTitle: string;
  level: SkillLevel;
  stem: string; // Teks pertanyaan
  options: string[]; // 4 opsi
  correctAnswerIndex: number; // 0 - 3 (hanya diakses saat evaluasi atau di instruktur)
  explanation: string; // Pembahasan
  status: 'approved' | 'pending';
  audit?: QuestionAudit;
  createdAt: string;
  approvedAt?: string;
  source?: 'seed' | 'agent' | 'manual';
}

export interface CorrectionHistory {
  id: string;
  unitCode: string;
  unitTitle: string;
  action: 'edited' | 'deleted';
  originalStem: string;
  reason: string;
  timestamp: string;
}

export interface TestResultUnitBreakdown {
  unitCode: string;
  unitTitle: string;
  level: SkillLevel;
  total: number;
  correct: number;
  percentage: number;
}

export interface ParticipantSession {
  id: string;
  participantId: string; // Anonymous ID e.g. "DS-USR-8823"
  participantName: string;
  startedAt: string;
  completedAt: string;
  answers: Record<string, number>; // questionId -> chosenIndex
  scoreBasic: number; // persentase 0-100
  scoreIntermediate: number;
  scoreAdvanced: number;
  totalScore: number;
  finalLevel: SkillLevel;
  unitBreakdown: TestResultUnitBreakdown[];
  recommendation?: string;
}

export interface AgentLog {
  id: string;
  timestamp: string;
  levelRequested: string;
  targetUnits: string[];
  questionsCreated: number;
  refinementsCount: number;
  status: 'sukses' | 'batas_tercapai' | 'gagal';
  summary: string;
  details: string[];
}

export interface AppSettings {
  questionsPerLevel: number; // Default 5 (total 15 soal)
  passingThreshold: number; // Default 70%
  autoAgentReplenishNotice: boolean;
}

export type UserRole = 'admin' | 'instructor' | 'participant';
