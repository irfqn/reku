export const searchTracks = async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || q.length < 2) {
            return res.json({ success: true, data: [] });
        }

        // 🎵 MOCK DATA (sementara Spotify maintenance)
        const mockTracks = [
            {
                id: "1",
                title: "About You",
                artist: "The 1975",
                cover:
                    "https://i.scdn.co/image/ab67616d00004851f7c1e7e4b8d3fbd7d4e7c3a1",
                spotifyUrl: "https://open.spotify.com/track/3CYH422oy1cZNoo0GTG1TK",
            },
            {
                id: "2",
                title: "Something About You",
                artist: "Eyedress",
                cover:
                    "https://i.scdn.co/image/ab67616d00004851c9f7c9c7f3b2c9f5c7c9f5b2",
                spotifyUrl: "https://open.spotify.com/track/2uIX8YMNjGMD7441kqJH0L",
            },
            {
                id: "3",
                title: "They Don't Know About Us",
                artist: "One Direction",
                cover:
                    "https://i.scdn.co/image/ab67616d000048512fae2f1c29e0a2d6a1e3d7c0",
                spotifyUrl: "https://open.spotify.com/track/4a9P5zT2ZxCzvYtU3b6v4a",
            },
        ];

        // 🔍 simple filter biar realistis
        const filtered = mockTracks.filter((track) =>
            track.title.toLowerCase().includes(q.toLowerCase())
        );

        res.json({
            success: true,
            data: filtered,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Mock Spotify error",
        });
    }
};
