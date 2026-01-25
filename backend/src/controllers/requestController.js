import SongRequest from "../models/SongRequest.js";

// CREATE request lagu
export const createRequest = async (req, res) => {
    try {
        const { title, artist } = req.body;

        const newRequest = await SongRequest.create({
            title,
            artist,
        });

        res.json({
            success: true,
            data: newRequest,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Gagal membuat request",
        });
    }
};

// GET semua request (dashboard)
export const getAllRequests = async (req, res) => {
    try {
        const requests = await SongRequest.find().sort({ createdAt: -1 });

        res.json({
            success: true,
            data: requests,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Gagal mengambil data request",
        });
    }
};

// UPDATE status request (approve / reject)
export const updateRequestStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updated = await SongRequest.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        res.json({
            success: true,
            data: updated,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Gagal update status",
        });
    }
};

export const getQueue = async (req, res) => {
    try {
        const queue = await SongRequest.find({ status: "approved" })
            .sort({ updatedAt: 1 })
            .lean();

        const enrichedQueue = queue.map((song) => ({
            ...song,
            spotifyUrl: generateSpotifySearchUrl(song.title, song.artist),
        }));

        res.json({
            success: true,
            data: enrichedQueue,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Gagal mengambil queue lagu",
        });
    }
};

export const playSong = async (req, res) => {
    try {
        const { id } = req.params;

        // 1️⃣ kalau ada lagu yang sedang playing → jadikan played
        await Request.updateMany(
            { status: "playing" },
            { status: "played" }
        );

        // 2️⃣ set lagu ini jadi playing
        const song = await Request.findByIdAndUpdate(
            id,
            { status: "playing" },
            { new: true }
        );

        res.json({
            success: true,
            data: song,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Gagal memutar lagu",
        });
    }
};

export const stopSong = async (req, res) => {
    try {
        const { id } = req.params;

        const song = await SongRequest.findByIdAndUpdate(
            id,
            { status: "played" },
            { new: true }
        );

        res.json({
            success: true,
            data: song,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Gagal menghentikan lagu",
        });
    }
};


const generateSpotifySearchUrl = (title, artist) => {
    const query = encodeURIComponent(`${title} ${artist}`);
    return `https://open.spotify.com/search/${query}`;
};
