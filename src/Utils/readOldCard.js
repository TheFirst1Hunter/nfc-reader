const {
  NFC,
  TAG_ISO_14443_3,
  TAG_ISO_14443_4,
  KEY_TYPE_A,
  KEY_TYPE_B,
} = require("nfc-pcsc");

const pretty = {};

pretty.info = (msg, m, x) => {
  console.log(msg + "/" + m + "/" + x);
};
pretty.error = (msg, m) => {
  console.log(msg + "/" + m);
};

const nfc = new NFC(); // const nfc = new NFC(pretty); // optionally you can pass logger to see internal debug logs

module.exports = (setter) => {
  nfc.on("reader", async (reader) => {
    pretty.info(`device attached`, reader);

    reader.on("card", async (card) => {
      // MIFARE Classic is ISO/IEC 14443-3 tag
      // skip other standards
      if (card.type !== TAG_ISO_14443_3) {
        return;
      }

      pretty.info(`card detected`, reader, card);

      // Don't forget to fill YOUR keys and types! (default ones are stated below)
      const key = "FFFFFFFFFFFF"; // key must be a 12-chars HEX string, an instance of Buffer, or array of bytes
      const keyType = KEY_TYPE_A;

      try {
        await reader.authenticate(4, keyType, key);

        // Note: writing might require to authenticate with a different key (based on the sector access conditions)

        pretty.info(`sector 1 successfully authenticated`, reader);
      } catch (err) {
        pretty.error(
          `error when authenticating block 4 within the sector 1`,
          reader,
          err
        );
        return;
      }

      try {
        const data = await reader.read(4, 16, 16); // blockSize=16 must specified for MIFARE Classic cards

        pretty.info(`data read`, reader, data);

        const payload = data.readInt32BE(0);

        // setter(payload);

        pretty.info(`data converted`, reader, payload);
      } catch (err) {
        pretty.error(`error when reading data`, reader, err);
      }
    });

    reader.on("error", (err) => {
      pretty.error(`an error occurred`, reader, err);
    });

    reader.on("end", () => {
      pretty.info(`device removed`, reader);
    });
  });

  nfc.on("error", (err) => {
    pretty.error(`an error occurred`, err);
  });
};
