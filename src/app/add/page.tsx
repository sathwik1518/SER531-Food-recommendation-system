"use client";
import { useCalorieContext } from "../context/CalorieContext";

const AddPage = () => {
  const { totalCalories, addCalories, removeCalories } = useCalorieContext();

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Add Calories</h1>
      
      <div className="mb-4">
        <button 
          onClick={() => addCalories(100)} 
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Add 100 Calories
        </button>
      </div>

      <div className="mb-4">
        <button 
          onClick={() => removeCalories(50)} 
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          Remove 50 Calories
        </button>
      </div>

      <div>
        <p>Total Calories: {totalCalories} kcal</p>
      </div>
    </div>
  );
};

export default AddPage;
