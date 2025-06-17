import React, { createContext, useReducer, ReactNode } from "react";

interface QuizState {
  favoriteColor: string | null;
}

type QuizAction = { type: "SET_FAVORITE_COLOR"; color: string };

const initialState: QuizState = { favoriteColor: null };

const quizReducer = (state: QuizState, action: QuizAction): QuizState =>
  action.type === "SET_FAVORITE_COLOR"
    ? { ...state, favoriteColor: action.color }
    : state;

export const QuizContext = createContext<{
  state: QuizState;
  dispatch: React.Dispatch<QuizAction>;
}>({
  state: initialState,
  dispatch: () => undefined,
});

export const QuizProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(quizReducer, initialState);

  return (
    <QuizContext.Provider value={{ state, dispatch }}>
      {children}
    </QuizContext.Provider>
  );
};