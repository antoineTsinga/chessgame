import React, { useEffect, useState } from "react";

import "./App.css";

import Layout from "./components/Layout/Layout.jsx";
import { Analytics } from "@vercel/analytics/react";

function App() {
  return (
    <div className="App">
      <Analytics />
      <Layout />
    </div>
  );
}

export default App;
