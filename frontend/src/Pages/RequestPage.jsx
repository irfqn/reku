/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export default function RequestPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const [message, setMessage] = useState("");

  /* ================= DEBOUNCE SEARCH ================= */
  useEffect(() => {
    if (query.length < 2 || selectedSong) {
      setResults([]);
      setLoadingSearch(false);
      return;
    }

    setLoadingSearch(true);

    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(
          `http://localhost:3000/api/search?q=${encodeURIComponent(query)}`,
        );
        const data = await res.json();

        if (data.success) {
          setResults(data.data || []);
        } else {
          setResults([]);
        }
      } catch (error) {
        setResults([]);
      } finally {
        setLoadingSearch(false);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [query, selectedSong]);

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

      // reset
      setQuery("");
      setSelectedSong(null);
      setResults([]);
      setMessage("Request lagu berhasil dikirim 🎵");
    } catch (error) {
      setMessage("Gagal mengirim request");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Request Lagu</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4 relative">
          {/* ================= INPUT ================= */}
          <div className="relative">
            <Input
              placeholder="Cari lagu yang ingin kamu request..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedSong(null);
                setMessage("");
              }}
            />

            {/* CLEAR BUTTON */}
            {selectedSong && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setSelectedSong(null);
                  setQuery("");
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* ================= DROPDOWN ================= */}
          {!selectedSong && query.length >= 2 && (
            <div className="absolute z-10 w-full bg-background border rounded-md shadow max-h-60 overflow-y-auto">
              {loadingSearch && (
                <p className="text-sm text-muted-foreground p-3">
                  Mencari lagu...
                </p>
              )}

              {!loadingSearch && results.length === 0 && (
                <p className="text-sm text-muted-foreground p-3">
                  Lagu tidak ditemukan
                </p>
              )}

              {!loadingSearch &&
                results.map((song) => (
                  <div
                    key={song.id}
                    className="flex items-center gap-3 p-3 hover:bg-muted cursor-pointer"
                    onClick={() => {
                      setSelectedSong(song);
                      setQuery(`${song.title} - ${song.artist}`);
                      setResults([]);
                    }}
                  >
                    <img
                      src={song.cover}
                      alt={song.title}
                      className="w-10 h-10 rounded"
                    />
                    <div>
                      <p className="text-sm font-medium">{song.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {song.artist}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* ================= SUBMIT ================= */}
          <Button
            className="w-full"
            disabled={!selectedSong}
            onClick={handleSubmit}
          >
            Kirim Request
          </Button>

          {/* ================= MESSAGE ================= */}
          {message && (
            <p className="text-sm text-center text-muted-foreground">
              {message}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
