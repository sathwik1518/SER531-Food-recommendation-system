import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CalorieContextProps {
  totalCalories: number;
  addCalories: (calories: number) => void;
  removeCalories: (calories: number) => void;
  addFoodToLog: (foodName: string) => void;
}

const CalorieContext = createContext<CalorieContextProps | undefined>(undefined);

export const useCalorieContext = () => {
  const context = useContext(CalorieContext);
  if (!context) {
    throw new Error('useCalorieContext must be used within a CalorieProvider');
  }
  return context;
};

interface CalorieProviderProps {
  children: ReactNode;
}

export const CalorieProvider: React.FC<CalorieProviderProps> = ({ children }) => {
  const [totalCalories, setTotalCalories] = useState(0);
  const [foodLog, setFoodLog] = useState<string[]>([]);

  const addCalories = (calories: number) => {
    setTotalCalories((prevCalories) => prevCalories + calories);
  };

  const removeCalories = (calories: number) => {
    setTotalCalories((prevCalories) => Math.max(prevCalories - calories, 0)); 
  };

  const addFoodToLog = (foodName: string) => {
    setFoodLog((prevLog) => [...prevLog, foodName]);
  };

  return (
    <CalorieContext.Provider value={{ totalCalories, addCalories, removeCalories, addFoodToLog }}>
      {children}
    </CalorieContext.Provider>
  );
};

