"use client";
import React from "react";
import { CalorieProvider } from "./context/CalorieContext";
import { metadata } from "./metadata";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <head>
        <meta name="title" content={metadata.title} />
        <meta name="description" content={metadata.description} />
      </head>
      <body>
        <CalorieProvider>
          <div className="layout">
            {children}
          </div>
        </CalorieProvider>

        <style jsx global>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: 'Arial', sans-serif;
            background-color: #f0f0f0;
            color: #333;
          }

          .layout {
            max-width: 1200px;
            margin: 0 auto;
            padding: 1rem;
          }

          h1, h2 {
            font-family: 'Arial', sans-serif;
            color: #333;
          }
        `}</style>
      </body>
    </html>
  );
};

export default Layout;

