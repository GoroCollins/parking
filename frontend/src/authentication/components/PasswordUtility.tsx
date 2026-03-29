import { zxcvbn, zxcvbnOptions } from '@zxcvbn-ts/core';
import * as zxcvbnCommonPackage from '@zxcvbn-ts/language-common';
import * as zxcvbnEnPackage from '@zxcvbn-ts/language-en';

let isZxcvbnInitialized = false;

const initializeZxcvbn = () => {
  if (isZxcvbnInitialized) return;

  zxcvbnOptions.setOptions({
    translations: zxcvbnEnPackage.translations,
    graphs: zxcvbnCommonPackage.adjacencyGraphs,
    dictionary: {
      ...zxcvbnCommonPackage.dictionary,
      ...zxcvbnEnPackage.dictionary,
    },
  });

  isZxcvbnInitialized = true;
};

const PASSWORD_LABELS = ["Very Weak", "Weak", "Reasonable", "Strong", "Very Strong"] as const;

export interface PasswordAnalysis {
  score: number;
  label: string;
  suggestions: string[];
}

export const analyzePassword = (password: string): PasswordAnalysis => {
  if (!password) {
    return {
      score: 0,
      label: "Very Weak",
      suggestions: [],
    };
  }

  initializeZxcvbn();

  const result = zxcvbn(password);

  return {
    score: result.score * 25,
    label: PASSWORD_LABELS[result.score] ?? "Unknown",
    suggestions: result.feedback?.suggestions ?? [],
  };
};