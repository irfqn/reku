import mongoose from "mongoose";

const requestSchema = new mongoose.Schema(
    {
        title: String,
        artist: String,
        spotifyUrl: String,
        status: {
            type: String,
            enum: ["pending", "approved", "playing", "played", "rejected"],
            default: "pending",
        },
    },
    { timestamps: true }
);

export default mongoose.model("Request", requestSchema);
