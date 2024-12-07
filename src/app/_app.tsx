"use client";

import React from "react";
import { CalorieProvider } from "./context/CalorieContext";
import HomePage from "./page";

const App = () => {
  return (
    <CalorieProvider>
      <HomePage />
    </CalorieProvider>
  );
};

export default App;
