"use client";

import type { PublicQuiz } from "@enem-quiz/shared/types";
import { useCallback, useEffect, useReducer } from "react";
import { initialQuizState, quizReducer, reconcile, type QuizState } from "./quiz-state";

const storageKey = (slug: string) => `quiz:${slug}:progress`;

function restore(quiz: PublicQuiz): QuizState {
  try {
    const raw = sessionStorage.getItem(storageKey(quiz.slug));
    return raw ? reconcile(JSON.parse(raw) as QuizState, quiz.questions) : initialQuizState;
  } catch {
    return initialQuizState;
  }
}

/**
 * Quiz progress that survives a refresh (sessionStorage), reconciled with the content currently
 * served. Only mount it on the client once the quiz is loaded.
 */
export function usePersistedQuiz(quiz: PublicQuiz) {
  const [state, dispatch] = useReducer(quizReducer, quiz, restore);

  useEffect(() => {
    try {
      sessionStorage.setItem(storageKey(quiz.slug), JSON.stringify(state));
    } catch {
      // Private mode or quota: progress just won't survive a refresh.
    }
  }, [quiz.slug, state]);

  const clear = useCallback(() => {
    try {
      sessionStorage.removeItem(storageKey(quiz.slug));
    } catch {
      // ignore
    }
  }, [quiz.slug]);

  return { state, dispatch, clear };
}
