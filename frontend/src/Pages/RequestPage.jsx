/* eslint-disable no-unused-vars */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function RequestPage() {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    if (!title || !artist) {
      setMessage("Judul dan artis wajib diisi");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("http://localhost:3000/api/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, artist }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage("Request lagu berhasil dikirim 🎵");
        setTitle("");
        setArtist("");
      } else {
        setMessage("Gagal mengirim request");
      }
    } catch (error) {
      setMessage("Backend tidak dapat dihubungi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Request Lagu</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <Input
            placeholder="Judul lagu"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <Input
            placeholder="Nama artis"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
          />

          <Button className="w-full" onClick={handleSubmit} disabled={loading}>
            {loading ? "Mengirim..." : "Kirim Request"}
          </Button>

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
