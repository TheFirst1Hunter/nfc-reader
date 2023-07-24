// main.js
const { app, BrowserWindow, ipcMain } = require("electron");
const { NFC, KEY_TYPE_A, TAG_ISO_14443_3 } = require("nfc-pcsc");
const nfc = new NFC();
const path = require("path");

let cardData = null;
let readOrRight = "read";

const availableSectors = [
  4, 5, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 18, 19, 20, 21, 22, 23, 24, 25, 26,
  27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45,
  46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64,
  65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83,
  84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102,
  103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117,
  118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132,
  133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147,
  148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162,
  163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177,
  178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192,
  193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207,
  208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220, 221, 222,
  223,
];

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
  mainWindow.loadFile(path.resolve(__dirname, "index.html"));

  // Close the app when the main window is closed
  mainWindow.on("closed", () => {
    app.quit();
  });

  // Listen for card events
  nfc.on("reader", async (reader) => {
    reader.on("end", () => {
      mainWindow.webContents.send("readerDisconnected");
    });
    mainWindow.webContents.send("readerConnected");
    console.log(`NFC reader attached: ${reader.reader.name}`);

    // Enable auto processing of the card
    reader.autoProcessing = true;

    // Wait for a card to be available
    reader.on("card", async (card) => {
      try {
        const finalString = [];
        if (readOrRight === "read") {
          console.log(card);

          const blockSize = 4;
          // const totalReads = 16;

          mainWindow.webContents.send("busyStatus", true);
          try {
            for (let i = 0; i < availableSectors.length; i++) {
              const data = await reader.read(
                availableSectors[i],
                blockSize,
                blockSize
              );
              const payload = data.toString();
              if (payload === "    " || payload.includes("]")) {
                break;
              }
              finalString.push(payload);
              console.log(`payload${availableSectors[i]}`, payload);
            }

            console.log("reading");
          } catch (error) {
            mainWindow.webContents.send("error");
            console.error("Error reading data:", error);
          }

          const finalStringFiltered = finalString.join("").split("]")[0];
          console.log("final string:", finalStringFiltered);

          const finalArray = finalStringFiltered.split(",");

          mainWindow.webContents.send("busyStatus", false);
          mainWindow.webContents.send("cardData", finalArray);
        }
        if (readOrRight === "write") {
          const data = Buffer.allocUnsafe(4);

          // data.fill(0);

          console.log(card);
          console.log("writing");

          // const sampleData =
          cardData = divideStringIntoArray(cardData);
          console.log(cardData);

          // // Convert string data to a byte array
          // const dataAsBytes = Buffer.from(sampleData, "utf-8");
          const arrayOfPromises = [];
          mainWindow.webContents.send("busyStatus", true);
          for (let index = 0; index < availableSectors.length; index++) {
            try {
              if (cardData[index] === undefined) {
                continue;
              }
              data.write(padStringWithSpaces(cardData[index], 4));
              arrayOfPromises.push(reader.write(availableSectors[index], data));
            } catch (error) {
              mainWindow.webContents.send("error");
              console.log(
                `index {${availableSectors[index]} is a NOT valid index}`
              );
            }
          }

          await Promise.all(arrayOfPromises);

          readOrRight = "read";
          mainWindow.webContents.send("busyStatus", false);

          console.log("finished writing");
        }

        mainWindow.webContents.send("readOrWrite", readOrRight);
      } catch (err) {
        // if (err.contains("0x6300")) {
        //   console.log("auth err");
        mainWindow.webContents.send("error");

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
  // cardType = newType;
  // console.log("newType", newType);
  // console.log("cardType", cardType);
});

ipcMain.on("writeCard", (event, _data) => {
  cardData = JSON.stringify(_data);

  readOrRight = "write";
});

function divideStringIntoArray(inputString) {
  const maxLength = 4;
  const outputArray = [];

  for (let i = 1; i < inputString.length; i += maxLength) {
    const substring = inputString.substr(i, maxLength);
    outputArray.push(substring);
  }

  return outputArray;
}

function padStringWithSpaces(str, desiredLength) {
  const currentLength = str.length;

  if (currentLength >= desiredLength) {
    return str; // No need to pad, return the original string
  }

  const paddingLength = desiredLength - currentLength;
  const spaces = " ".repeat(paddingLength);

  return str + spaces;
}
