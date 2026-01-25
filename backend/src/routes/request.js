import express from "express";
import {
    getAllRequests,
    createRequest,
    updateRequestStatus,
    getQueue,
    playSong,
    stopSong,
} from "../controllers/requestController.js";


const router = express.Router();

router.get("/", getAllRequests);
router.post("/", createRequest);
router.patch("/:id", updateRequestStatus);
router.patch("/:id/stop", stopSong);

router.patch("/:id/play", playSong);

router.get("/queue", getQueue);

export default router;
