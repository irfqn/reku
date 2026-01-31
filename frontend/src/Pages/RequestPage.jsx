/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function RequestPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const [message, setMessage] = useState("");

  /* ================= DEBOUNCE SEARCH ================= */
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    setLoadingSearch(true);

    const timeout = setTimeout(() => {
      const mockResults = [
        {
          id: 1,
          title: "About You",
          artist: "The 1975",
          cover:
            "https://i.scdn.co/image/ab67616d00004851f7c1e7e4b8d3fbd7d4e7c3a1",
          spotifyUrl: "https://open.spotify.com",
        },
        {
          id: 2,
          title: "Something About You",
          artist: "Eyedress",
          cover:
            "https://i.scdn.co/image/ab67616d00004851c9f7c9c7f3b2c9f5c7c9f5b2",
          spotifyUrl: "https://open.spotify.com",
        },
      ];

      setResults(mockResults);
      setLoadingSearch(false);
    }, 400);

    return () => clearTimeout(timeout);
  }, [query]);

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    if (!selectedSong) {
      setMessage("Silakan pilih lagu terlebih dahulu");
      return;
    }

    try {
      await fetch("http://localhost:3000/api/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: selectedSong.title,
          artist: selectedSong.artist,
          spotifyUrl: selectedSong.spotifyUrl,
        }),
      });

      setQuery("");
      setResults([]);
      setSelectedSong(null);
      setMessage("Request lagu berhasil dikirim 🎵");
    } catch (error) {
      setMessage("Gagal mengirim request");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "#C267B4" }}
    >
      <Card className="w-full max-w-md bg-white shadow-xl rounded-2xl">
        {/* HEADER */}
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-semibold text-[#231338]">
            Request Lagu 🎵
          </CardTitle>
          <p className="text-sm text-[#231338]/70 mt-1">
            Cari lagu favoritmu, kami putarkan
          </p>
        </CardHeader>

        <CardContent className="space-y-4 relative text-[#231338]">
          {/* INPUT */}
          <Input
            placeholder="Ketik judul lagu..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedSong(null);
              setMessage("");
            }}
            className="focus-visible:ring-2 focus-visible:ring-[#C267B4]"
          />

          {/* DROPDOWN SEARCH */}
          {query.length >= 2 && results.length > 0 && !selectedSong && (
            <div className="absolute z-10 w-full bg-white border rounded-xl shadow-lg max-h-60 overflow-y-auto">
              {loadingSearch && (
                <p className="text-sm text-[#231338]/70 p-3">Mencari lagu...</p>
              )}

              {!loadingSearch &&
                results.map((song) => (
                  <div
                    key={song.id}
                    className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-100 transition"
                    onClick={() => {
                      setSelectedSong(song);
                      setResults([]);
                      setQuery(song.title);
                    }}
                  >
                    <img
                      src={song.cover}
                      alt={song.title}
                      className="w-10 h-10 rounded-md object-cover"
                    />
                    <div>
                      <p className="text-sm font-medium">{song.title}</p>
                      <p className="text-xs text-[#231338]/70">{song.artist}</p>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* SELECTED SONG */}
          {selectedSong && (
            <div className="border rounded-xl p-3 flex items-center gap-3 bg-gray-50">
              <img
                src={selectedSong.cover}
                alt={selectedSong.title}
                className="w-12 h-12 rounded-md"
              />
              <div>
                <p className="font-medium">{selectedSong.title}</p>
                <p className="text-sm text-[#231338]/70">
                  {selectedSong.artist}
                </p>
              </div>
            </div>
          )}

          {/* SUBMIT */}
          <Button
            className="w-full bg-[#231338] text-white hover:bg-[#2f1c4d] transition"
            disabled={!selectedSong}
            onClick={handleSubmit}
          >
            Kirim Request
          </Button>

          {/* MESSAGE */}
          {message && (
            <p className="text-sm text-center text-[#231338]/80">{message}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
