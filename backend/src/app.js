import express from "express";
import cors from "cors";

import healthRoute from "./routes/health.js";
import requestRoute from "./routes/request.js";
import spotifyRoute from "./routes/spotify.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/health", healthRoute);
app.use("/api/request", requestRoute);
app.use("/api", spotifyRoute);

export default app;
