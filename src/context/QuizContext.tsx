// QuizContext.tsx - Adding Types to fix errors
import React, { createContext, useReducer, ReactNode } from 'react';

interface QuizState {
  favoriteColor: string | null;
}

interface QuizAction {
  type: 'SET_FAVORITE_COLOR';
  color: string;
  
}

const initialState: QuizState = {
  favoriteColor: null,
};

const quizReducer = (state: QuizState, action: QuizAction): QuizState => {
  switch (action.type) {
    case 'SET_FAVORITE_COLOR':
      return { ...state, favoriteColor: action.color };
    default:
      return state;
  }
};

export const QuizContext = createContext<{
  state: QuizState;
  dispatch: React.Dispatch<QuizAction>;
}>({
  state: initialState,
  dispatch: () => undefined,
});

interface QuizProviderProps {
  children: ReactNode;
}

export const QuizProvider: React.FC<QuizProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(quizReducer, initialState);

  return (
    <QuizContext.Provider value={{ state, dispatch }}>
      {children}
    </QuizContext.Provider>
  );
};

export default QuizContext;
