export type DictionaryEntry = {
  id: string;
  word: string;
  context?: string;
  addedAt: number;
  correct: number;
  incorrect: number;
};

export const MASTERY_THRESHOLD = 3;

const KEY = "autentico-dictionary";

function save(entries: DictionaryEntry[]) {
  localStorage.setItem(KEY, JSON.stringify(entries));
}

export function getEntries(): DictionaryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function addEntry(word: string, context?: string): boolean {
  const entries = getEntries();
  if (entries.some((e) => e.word.toLowerCase() === word.toLowerCase())) return false;
  save([
    ...entries,
    {
      id: crypto.randomUUID(),
      word,
      context,
      addedAt: Date.now(),
      correct: 0,
      incorrect: 0,
    },
  ]);
  return true;
}

export function recordResult(id: string, correct: boolean) {
  save(
    getEntries().map((e) =>
      e.id === id
        ? {
            ...e,
            correct: e.correct + (correct ? 1 : 0),
            incorrect: e.incorrect + (correct ? 0 : 1),
          }
        : e,
    ),
  );
}

export function removeEntry(id: string) {
  save(getEntries().filter((e) => e.id !== id));
}
