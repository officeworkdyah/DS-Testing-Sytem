/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Question, SkkniUnit, CorrectionHistory } from '../types/index.ts';

export interface AgentRunParams {
  level: 'Basic' | 'Intermediate' | 'Advanced' | 'All';
  units: SkkniUnit[];
  currentCoverage: Record<string, { approved: number; pending: number; title: string; level: string }>;
  correctionHistory: CorrectionHistory[];
  existingStems: Record<string, string[]>;
  customUnitCode?: string;
  customCount?: number;
  onStatusUpdate?: (msg: string) => void;
  onLogEvent?: (logText: string) => void;
  onQuestionCreated?: (question: Question) => void;
}

export interface AgentRunResult {
  createdQuestions: Question[];
  summary: string;
  status: 'sukses' | 'batas_tercapai' | 'gagal';
  refinementsCount: number;
  logs: string[];
}

export async function runAgentPenyusunSoal(params: AgentRunParams): Promise<AgentRunResult> {
  const {
    level,
    units,
    currentCoverage,
    correctionHistory,
    existingStems,
    customUnitCode,
    customCount,
    onStatusUpdate,
    onLogEvent,
    onQuestionCreated
  } = params;

  const logs: string[] = [];
  const createdList: Question[] = [];
  let summary = '';
  let finalStatus: 'sukses' | 'batas_tercapai' | 'gagal' = 'sukses';
  let refinements = 0;

  const payload = {
    level,
    units,
    currentCoverage,
    correctionHistory,
    existingStems,
    customUnitCode,
    customCount
  };

  const response = await fetch('/api/agent/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`Gagal menghubungi server Agent (${response.status}): ${errorText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('Streaming tidak didukung pada peramban ini');
  }

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const blocks = buffer.split('\n\n');
    buffer = blocks.pop() || '';

    for (const block of blocks) {
      if (!block.trim()) continue;

      let eventType = 'message';
      let rawData = '';

      const lines = block.split('\n');
      for (const line of lines) {
        if (line.startsWith('event:')) {
          eventType = line.slice(6).trim();
        } else if (line.startsWith('data:')) {
          rawData = line.slice(5).trim();
        }
      }

      if (rawData) {
        try {
          const parsed = JSON.parse(rawData);
          if (eventType === 'status') {
            if (parsed.message && onStatusUpdate) onStatusUpdate(parsed.message);
          } else if (eventType === 'log') {
            if (parsed.text) {
              logs.push(parsed.text);
              if (onLogEvent) onLogEvent(parsed.text);
            }
          } else if (eventType === 'question_created') {
            if (parsed.question) {
              createdList.push(parsed.question);
              if (onQuestionCreated) onQuestionCreated(parsed.question);
            }
          } else if (eventType === 'complete') {
            summary = parsed.summary || 'Proses agent selesai';
            finalStatus = parsed.status || 'sukses';
            refinements = parsed.refinementsCount || 0;
            if (Array.isArray(parsed.createdQuestions) && createdList.length === 0) {
              createdList.push(...parsed.createdQuestions);
            }
          } else if (eventType === 'error') {
            throw new Error(parsed.message || 'Terjadi kesalahan pada agent');
          }
        } catch (e: any) {
          if (eventType === 'error') throw e;
        }
      }
    }
  }

  return {
    createdQuestions: createdList,
    summary,
    status: finalStatus,
    refinementsCount: refinements,
    logs
  };
}

export async function requestStudyRecommendation(payload: {
  participantId: string;
  finalLevel: string;
  weakestUnits: Array<{ code: string; title: string; level: string; scoreRatio: string }>;
  scoreBasic: number;
  scoreIntermediate: number;
  scoreAdvanced: number;
}): Promise<string> {
  const res = await fetch('/api/recommendations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Gagal memuat saran belajar.');
  }

  const data = await res.json();
  return data.recommendation || '';
}

export async function extractKUKFromPDF(params: { pdfBase64?: string; textContent?: string }): Promise<any> {
  const res = await fetch('/api/skkni/extract-kuk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok && !data.success) {
    let msg = data.error || 'Gagal mengekstrak KUK dari dokumen.';
    if (typeof msg === 'string' && (msg.includes('503') || msg.includes('high demand'))) {
      msg = 'Layanan Gemini sedang mengalami lonjakan beban sesaat (503). Sistem telah menyediakan opsi sinkronisasi KUK standar resmi secara otomatis.';
    }
    throw new Error(msg);
  }

  return data;
}

export async function syncStandardKUK(): Promise<any> {
  const res = await fetch('/api/skkni/sync-standard-kuk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Gagal menyinkronkan KUK standar');
  }

  return data;
}
