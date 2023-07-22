import React, { useState } from "react";
import { ipcRenderer } from "electron";
import "./App.css";
// import CardType from "./Components/Sections/CardType";
// import { readOld } from "./Utils/readOldCard";

function App() {
  const [cardType, setCardType] = useState("oldCard");
  const [cardInfo, setCardInfo] = useState(null);
  ipcRenderer.send("cardTypeChanged", "old");
  // readOld(cardInfo);
  return <di>app</di>;
}

export default App;
