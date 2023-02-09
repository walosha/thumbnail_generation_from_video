const fs = require("fs");
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { createFFmpeg } = require("@ffmpeg/ffmpeg");
const { logger } = require("./config");

const ffmpegInstance = createFFmpeg({ log: true });
let ffmpegLoadingPromise = ffmpegInstance.load();

async function getFFmpeg() {
  if (ffmpegLoadingPromise) {
    await ffmpegLoadingPromise;
    ffmpegLoadingPromise = undefined;
  }

  return ffmpegInstance;
}
const app = express();
const port = 3100;

app.use(cors());

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
});

app.post("/thumbnail", upload.single("video"), async (req, res) => {
  try {
    const videoData = req.file.buffer;

    const ffmpeg = await getFFmpeg();

    const inputFileName = `input-video`;
    const outputFileName = `output-image.png`;
    let outputData = null;

    ffmpeg.FS("writeFile", inputFileName, videoData);

    await ffmpeg.run(
      "-ss",
      "00:00:01.000",
      "-i",
      inputFileName,
      "-frames:v",
      "1",
      outputFileName
    );

    outputData = ffmpeg.FS("readFile", outputFileName);
    ffmpeg.FS("unlink", inputFileName);
    ffmpeg.FS("unlink", outputFileName);

    res.writeHead(200, {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment;filename=${outputFileName}`,
      "Content-Length": outputData.length,
    });

    fs.writeFile("image.png", outputData, "binary", (err) => {
      if (err) logger.error(err);
      logger.info("The image has been saved!");
    });
    res.end(Buffer.from(outputData, "binary"));
  } catch (error) {
    logger.error(error);
    res.sendStatus(500);
  }
});

app.listen(port, () => {
  logger.info(`App listening at http://localhost:${port}`);
});
