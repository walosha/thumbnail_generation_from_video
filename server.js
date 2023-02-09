const express = require("express");
const cors = require("cors");
const multer = require("multer");
import { createFFmpeg } from "@ffmpeg/ffmpeg";
const { logger } = require("./config");

const app = express();
const port = 3100;

app.use(cors());

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
});

app.post("/thumbnail", upload.single("video"), async (req, res) => {
  const videoData = req.file.buffer;

  res.sendStatus(200);
});

app.listen(port, () => {
  logger.info(`App listening at http://localhost:${port}`);
});
