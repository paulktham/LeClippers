const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const os = require("os"); // Import the os module
const fetch = require("node-fetch");
const serviceAccount = require("./assets/leclippers1-firebase-adminsdk-7l1br-c93d999ed1.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "leclippers1.appspot.com",
  });
}

const app = express();
const port = process.env.PORT || 5000;

const corsOptions = {
  origin: "https://leclippers.vercel.app",
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("/process-video", cors());
app.use(express.urlencoded({ extended: true })); // Add this line to parse URL-encoded bodies

app.use("/videos", express.static(path.join(__dirname, "videos")));
const bucket = admin.storage().bucket();

app.get("/", (req, res) => {
  res.send("Hello from Express!");
});

app.post("/verifyToken", async (req, res) => {
  const idToken = req.body.token;
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    res.json({ uid: decodedToken.uid });
  } catch (error) {
    res.status(401).json({ error: "Unauthorized" });
  }
});

const upload = multer();

app.post("/process-video", upload.none(), async (req, res) => {
  try {
    const { videoURL, start, end, uid } = req.body;

    console.log("Server side video with start:", start, "and end:", end); // Log inputs

    const startParts = start.split(":").map(Number);
    const endParts = end.split(":").map(Number);

    const startSeconds = startParts[0] * 60 + (startParts[1] || 0);
    const endSeconds = endParts[0] * 60 + (endParts[1] || 0);

    const duration = endSeconds - startSeconds;

    if (duration <= 0) {
      return res
        .status(400)
        .json({ error: "End time must be greater than start time" });
    }

    const tempDir = os.tmpdir(); // Get the OS-specific temporary directory
    const video1Path = path.join(tempDir, "input.mp4");

    // Video 1 processing
    const video1Response = await fetch(videoURL);
    const video1Buffer = await video1Response.buffer();
    await fs.promises.writeFile(video1Path, video1Buffer);

    const video2Path = path.join(__dirname, "videos", "video2.mp4");
    const outputPath = path.join(tempDir, "output1.mp4");

    // Example ffmpeg command
    ffmpeg(video1Path)
      .inputOptions([`-ss ${startSeconds}`, `-t ${duration}`])
      .input(video2Path)
      .complexFilter([
        "[0:v]scale=1080:-1[v1]",
        "[1:v]scale=-1:1920/2[v2scaled]",
        "[v2scaled]crop=1080:1920/2[v2cropped]",
        "[v1][v2cropped]vstack=inputs=2,scale=1080:1920[vid];[0:a]anull[a]",
      ])
      .map("[vid]")
      .map("[a]")
      .outputOptions([
        "-c:v libx264",
        "-crf 23",
        "-preset veryfast",
        "-shortest",
      ])
      .on("start", (commandLine) => {
        console.log("Spawned FFmpeg with command: " + commandLine);
      })
      .on("end", async () => {
        try {
          // Upload the output file to Firebase Storage
          const destination = `${uid}.output.mp4`;
          await bucket.upload(outputPath, { destination });

          // Clean up temporary files
          fs.unlinkSync(video1Path);
          fs.unlinkSync(outputPath);

          res.json({
            message: "Processing complete",
            outputPath: destination,
          });
        } catch (error) {
          console.error("Error uploading to Firebase:", error);
          res.status(500).json({ error: "Failed to upload video to Firebase" });
        }
      })
      .on("error", (err) => {
        console.error("Error processing video:", err);
        fs.unlinkSync(video1Path); // Ensure to delete the uploaded file in case of error
        res.status(500).json({ error: "Video processing failed" });
      })
      .save(outputPath);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

const server = app.listen(port, () => {});

server.setTimeout(600000); // Set timeout to 10 minutes
