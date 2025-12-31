import React, {
  createContext,
  useReducer,
  useContext,
  useMemo,
  ReactNode,
} from "react";

interface QuizState {
  favoriteColor: string | null;
}

type QuizAction = {
  type: "SET_FAVORITE_COLOR";
  color: string;
};

const initialState: QuizState = {
  favoriteColor: null,
};

function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case "SET_FAVORITE_COLOR":
      return { ...state, favoriteColor: action.color };
    default:
      return state;
  }
}

interface QuizContextValue {
  state: QuizState;
  dispatch: React.Dispatch<QuizAction>;
}

const QuizContext = createContext<QuizContextValue | undefined>(undefined);

export const QuizProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(quizReducer, initialState);

  const value = useMemo(
    () => ({ state, dispatch }),
    [state]
  );

  return (
    <QuizContext.Provider value={value}>
      {children}
    </QuizContext.Provider>
  );
};

export function useQuiz(): QuizContextValue {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error("useQuiz must be used within a QuizProvider");
  }
  return context;
}
