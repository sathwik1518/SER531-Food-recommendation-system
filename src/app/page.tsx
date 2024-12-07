"use client"

import React from "react";
import { useCalorieContext } from "./context/CalorieContext";
import Link from "next/link";

const HomePage = () => {
  const { totalCalories } = useCalorieContext();

  return (
    <div className="home-container">
      <nav className="nav">
        <div className="home-text">
          <Link href="/" className="home-link">Home</Link>
        </div>
      </nav>

      <h1 className="home-title">Welcome to the Calorie Tracker</h1>

      <div className="calories-container">
        <h2>Total Calories Consumed: {totalCalories} kcal</h2>
      </div>

      <div className="add-calories-link">
        <div className="add-calories-text">
          <Link href="/add-calories" className="add-calories-link">Add Calories</Link>
        </div>
      </div>

      <style jsx>{`
        .home-container {
          padding: 2rem;
          text-align: center;
          background-color: white;
          min-height: 100vh;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          color: black;
        }

        .home-title {
          font-size: 2.5rem;
          font-weight: bold;
          color: black;
        }

        .calories-container {
          font-size: 1.5rem;
          margin-top: 2rem;
          color: black;
        }

        .add-calories-link {
          margin-top: 2rem;
        }

        .add-calories-text {
          font-size: 1.5rem;
          color: black;
        }

        .add-calories-link {
          text-decoration: none;
          color: black;
          font-size: 1.5rem;
          font-weight: bold;
        }

        .add-calories-link:hover {
          color: #0073e6;
        }

        .nav {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1rem;
        }

        .home-text {
          font-size: 1.5rem;
          color: black;
        }

        .home-link {
          text-decoration: none;
          color: black;
          font-size: 1.5rem;
          font-weight: bold;
        }

        .home-link:hover {
          color: #0073e6;
        }
      `}</style>
    </div>
  );
};

export default HomePage;

