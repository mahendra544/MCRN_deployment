import React from "react";

function App() {
  return (
    <>
      <style>
        {`
          body {
            margin: 0;
            font-family: Arial, sans-serif;
            background-color: #f2f2f2;
          }

          .container {
            text-align: center;
            padding-top: 150px;
          }

          h1 {
            color: #333;
            font-size: 40px;
          }

          p {
            color: #666;
            font-size: 20px;
          }

          button {
            background-color: #646cff;
            color: white;
            border: none;
            padding: 12px 25px;
            font-size: 16px;
            border-radius: 6px;
            cursor: pointer;
          }

          button:hover {
            background-color: #4f55d9;
          }
        `}
      </style>

      <div className="container">
        <h1>Welcome to My React Page</h1>
        <p>This is my first React webpage.</p>
        <button>Click Me</button>
      </div>
    </>
  );
}

export default App;