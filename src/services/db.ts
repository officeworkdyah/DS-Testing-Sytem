/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Question,
  SkkniUnit,
  CorrectionHistory,
  ParticipantSession,
  AgentLog,
  AppSettings
} from '../types/index.ts';
import { SKKNI_DATA_SCIENCE_UNITS } from '../data/skkniData.ts';
import { SEED_QUESTIONS } from '../data/seedQuestions.ts';

const DB_NAME = 'AgenKompetenDS_DB';
const DB_VERSION = 1;

const DEFAULT_SETTINGS: AppSettings = {
  questionsPerLevel: 5,
  passingThreshold: 70,
  autoAgentReplenishNotice: true
};

let dbPromise: Promise<IDBDatabase> | null = null;

export function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains('units')) {
        db.createObjectStore('units', { keyPath: 'code' });
      }
      if (!db.objectStoreNames.contains('questions')) {
        const qStore = db.createObjectStore('questions', { keyPath: 'id' });
        qStore.createIndex('unitCode', 'unitCode', { unique: false });
        qStore.createIndex('level', 'level', { unique: false });
        qStore.createIndex('status', 'status', { unique: false });
      }
      if (!db.objectStoreNames.contains('correctionHistory')) {
        const cStore = db.createObjectStore('correctionHistory', { keyPath: 'id' });
        cStore.createIndex('unitCode', 'unitCode', { unique: false });
      }
      if (!db.objectStoreNames.contains('sessions')) {
        const sStore = db.createObjectStore('sessions', { keyPath: 'id' });
        sStore.createIndex('completedAt', 'completedAt', { unique: false });
      }
      if (!db.objectStoreNames.contains('agentLogs')) {
        db.createObjectStore('agentLogs', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'id' });
      }
    };

    request.onsuccess = async (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      await initSeedData(db);
      resolve(db);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });

  return dbPromise;
}

async function initSeedData(db: IDBDatabase) {
  // Check units
  const countUnits = await new Promise<number>((res) => {
    const tx = db.transaction('units', 'readonly');
    const store = tx.objectStore('units');
    const req = store.count();
    req.onsuccess = () => res(req.result);
    req.onerror = () => res(0);
  });

  if (countUnits === 0) {
    const tx = db.transaction('units', 'readwrite');
    const store = tx.objectStore('units');
    for (const unit of SKKNI_DATA_SCIENCE_UNITS) {
      store.put(unit);
    }
  }

  // Check questions
  const countQuestions = await new Promise<number>((res) => {
    const tx = db.transaction('questions', 'readonly');
    const store = tx.objectStore('questions');
    const req = store.count();
    req.onsuccess = () => res(req.result);
    req.onerror = () => res(0);
  });

  if (countQuestions === 0) {
    const tx = db.transaction('questions', 'readwrite');
    const store = tx.objectStore('questions');
    for (const q of SEED_QUESTIONS) {
      store.put(q);
    }
  }

  // Check settings
  const hasSettings = await new Promise<boolean>((res) => {
    const tx = db.transaction('settings', 'readonly');
    const store = tx.objectStore('settings');
    const req = store.get('main');
    req.onsuccess = () => res(!!req.result);
    req.onerror = () => res(false);
  });

  if (!hasSettings) {
    const tx = db.transaction('settings', 'readwrite');
    const store = tx.objectStore('settings');
    store.put({ id: 'main', ...DEFAULT_SETTINGS });
  }
}

// Helper methods
export async function getAllUnits(): Promise<SkkniUnit[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('units', 'readonly');
    const store = tx.objectStore('units');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveUnits(units: SkkniUnit[]): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('units', 'readwrite');
    const store = tx.objectStore('units');
    for (const u of units) {
      store.put(u);
    }
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAllQuestions(): Promise<Question[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('questions', 'readonly');
    const store = tx.objectStore('questions');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function getApprovedQuestions(): Promise<Question[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('questions', 'readonly');
    const store = tx.objectStore('questions');
    const req = store.getAll();
    req.onsuccess = () => {
      const all: Question[] = req.result;
      resolve(all.filter((q) => q.status === 'approved'));
    };
    req.onerror = () => reject(req.error);
  });
}

export async function getPendingQuestions(): Promise<Question[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('questions', 'readonly');
    const store = tx.objectStore('questions');
    const req = store.getAll();
    req.onsuccess = () => {
      const all: Question[] = req.result;
      resolve(all.filter((q) => q.status === 'pending'));
    };
    req.onerror = () => reject(req.error);
  });
}

export async function saveQuestion(question: Question): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('questions', 'readwrite');
    const store = tx.objectStore('questions');
    store.put(question);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function saveMultipleQuestions(questions: Question[]): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('questions', 'readwrite');
    const store = tx.objectStore('questions');
    for (const q of questions) {
      store.put(q);
    }
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function approveQuestion(id: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('questions', 'readwrite');
    const store = tx.objectStore('questions');
    const req = store.get(id);
    req.onsuccess = () => {
      const q: Question = req.result;
      if (q) {
        q.status = 'approved';
        q.approvedAt = new Date().toISOString();
        store.put(q);
      }
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function deleteQuestion(id: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('questions', 'readwrite');
    const store = tx.objectStore('questions');
    store.delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function addCorrectionHistory(entry: CorrectionHistory): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('correctionHistory', 'readwrite');
    const store = tx.objectStore('correctionHistory');
    store.put(entry);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAllCorrectionHistory(): Promise<CorrectionHistory[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('correctionHistory', 'readonly');
    const store = tx.objectStore('correctionHistory');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function getCorrectionHistoryByUnit(unitCode: string): Promise<CorrectionHistory[]> {
  const all = await getAllCorrectionHistory();
  return all.filter((c) => c.unitCode === unitCode);
}

export async function saveParticipantSession(session: ParticipantSession): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('sessions', 'readwrite');
    const store = tx.objectStore('sessions');
    store.put(session);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAllSessions(): Promise<ParticipantSession[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('sessions', 'readonly');
    const store = tx.objectStore('sessions');
    const req = store.getAll();
    req.onsuccess = () => {
      const list: ParticipantSession[] = req.result || [];
      list.sort((a, b) => new Date(b.completedAt || b.startedAt).getTime() - new Date(a.completedAt || a.startedAt).getTime());
      resolve(list);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function deleteSession(id: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('sessions', 'readwrite');
    const store = tx.objectStore('sessions');
    store.delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function saveAgentLog(log: AgentLog): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('agentLogs', 'readwrite');
    const store = tx.objectStore('agentLogs');
    store.put(log);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAllAgentLogs(): Promise<AgentLog[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('agentLogs', 'readonly');
    const store = tx.objectStore('agentLogs');
    const req = store.getAll();
    req.onsuccess = () => {
      const list: AgentLog[] = req.result || [];
      list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      resolve(list);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function getSettings(): Promise<AppSettings> {
  const db = await getDB();
  return new Promise((resolve) => {
    const tx = db.transaction('settings', 'readonly');
    const store = tx.objectStore('settings');
    const req = store.get('main');
    req.onsuccess = () => {
      if (req.result) {
        const { id, ...settings } = req.result;
        resolve(settings);
      } else {
        resolve(DEFAULT_SETTINGS);
      }
    };
    req.onerror = () => resolve(DEFAULT_SETTINGS);
  });
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('settings', 'readwrite');
    const store = tx.objectStore('settings');
    store.put({ id: 'main', ...settings });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Backup & Restore
export async function exportFullDatabaseJSON(): Promise<string> {
  const [units, questions, correctionHistory, sessions, agentLogs, settings] = await Promise.all([
    getAllUnits(),
    getAllQuestions(),
    getAllCorrectionHistory(),
    getAllSessions(),
    getAllAgentLogs(),
    getSettings()
  ]);

  const backupData = {
    app: 'AgenKompeten DS',
    version: DB_VERSION,
    exportedAt: new Date().toISOString(),
    data: {
      units,
      questions,
      correctionHistory,
      sessions,
      agentLogs,
      settings
    }
  };

  return JSON.stringify(backupData, null, 2);
}

export async function importFullDatabaseJSON(jsonStr: string): Promise<boolean> {
  try {
    const parsed = JSON.parse(jsonStr);
    if (!parsed || !parsed.data) {
      throw new Error('Format JSON cadangan tidak valid');
    }

    const { units, questions, correctionHistory, sessions, agentLogs, settings } = parsed.data;
    const db = await getDB();

    const tx = db.transaction(
      ['units', 'questions', 'correctionHistory', 'sessions', 'agentLogs', 'settings'],
      'readwrite'
    );

    if (Array.isArray(units)) {
      const uStore = tx.objectStore('units');
      uStore.clear();
      for (const u of units) uStore.put(u);
    }
    if (Array.isArray(questions)) {
      const qStore = tx.objectStore('questions');
      qStore.clear();
      for (const q of questions) qStore.put(q);
    }
    if (Array.isArray(correctionHistory)) {
      const cStore = tx.objectStore('correctionHistory');
      cStore.clear();
      for (const c of correctionHistory) cStore.put(c);
    }
    if (Array.isArray(sessions)) {
      const sStore = tx.objectStore('sessions');
      sStore.clear();
      for (const s of sessions) sStore.put(s);
    }
    if (Array.isArray(agentLogs)) {
      const aStore = tx.objectStore('agentLogs');
      aStore.clear();
      for (const a of agentLogs) aStore.put(a);
    }
    if (settings) {
      const setStore = tx.objectStore('settings');
      setStore.put({ id: 'main', ...settings });
    }

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('Gagal mengimpor database:', err);
    throw err;
  }
}

export async function resetDatabaseToDefaults(): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(
    ['units', 'questions', 'correctionHistory', 'sessions', 'agentLogs', 'settings'],
    'readwrite'
  );

  tx.objectStore('units').clear();
  tx.objectStore('questions').clear();
  tx.objectStore('correctionHistory').clear();
  tx.objectStore('sessions').clear();
  tx.objectStore('agentLogs').clear();
  tx.objectStore('settings').clear();

  for (const u of SKKNI_DATA_SCIENCE_UNITS) {
    tx.objectStore('units').put(u);
  }
  for (const q of SEED_QUESTIONS) {
    tx.objectStore('questions').put(q);
  }
  tx.objectStore('settings').put({ id: 'main', ...DEFAULT_SETTINGS });

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
