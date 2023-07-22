// main.js
const { app, BrowserWindow, ipcMain } = require("electron");
const express = require("express");
const { NFC, KEY_TYPE_A, TAG_ISO_14443_3 } = require("nfc-pcsc");
const nfc = new NFC();

// Create an Express server to serve the HTML GUI
const server = express();
server.use(express.static(__dirname));

// Start the Express server
const port = 3000;
server.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});

let cardType = "new";

// Create the Electron window
app.whenReady().then(() => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.webContents.openDevTools();
  mainWindow.loadURL(`http://localhost:${port}/index.html`);

  // Close the app when the main window is closed
  mainWindow.on("closed", () => {
    app.quit();
  });

  // mainWindow.webContents.on("cardTypeChanged", (newType) => {
  //   cardType = newType;
  //   console.log("newType", newType);
  //   console.log("cardType", cardType);
  // });

  // Listen for card events
  nfc.on("reader", async (reader) => {
    console.log(`NFC reader attached: ${reader.reader.name}`);

    // Enable auto processing of the card
    reader.autoProcessing = true;

    // Wait for a card to be available
    reader.on("card", async (card) => {
      console.log("--------------------------");
      console.log(cardType);
      console.log("--------------------------");
      //  if (card.type !== TAG_ISO_14443_3) {
      //    return;
      //  }

      try {
        if (cardType === "old") {
          const key = "FFFFFFFFFFFF";
          const keyType = KEY_TYPE_A;
          await reader.authenticate(4, keyType, key);
        }
        console.log(card);

        const data = await reader.read(4, 16, 16); // blockSize=16 must specified for MIFARE Classic cards

        const payload = data.readInt32BE(0);

        mainWindow.webContents.send("cardData", payload);

        // Disconnect from the card
        // card.disconnect();
      } catch (err) {
        // if (err.contains("0x6300")) {
        //   console.log("auth err");

        console.error("Error reading card:", err);
      }
    });

    // Handle reader errors
    reader.on("error", (err) => {
      console.error("NFC reader error:", err);
    });
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// Optional: Handle any IPC events from the renderer process
ipcMain.on("someEventFromRenderer", (event, data) => {
  // Handle the event from the renderer process
  console.log("Event data from renderer:", data);
});
ipcMain.on("cardTypeChanged", (event, newType) => {
  cardType = newType;
  console.log("newType", newType);
  console.log("cardType", cardType);
});
