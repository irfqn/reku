/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const [requests, setRequests] = useState([]);
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nowPlaying, setNowPlaying] = useState(null);

  const fetchRequests = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/request");
      const data = await res.json();
      setRequests(data.data || []);
    } catch (error) {
      console.error("Gagal mengambil data request");
    } finally {
      setLoading(false);
    }
  };

  const fetchQueue = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/request/queue");
      const data = await res.json();
      setQueue(data.data || []);
    } catch (error) {
      console.error("Gagal mengambil queue lagu");
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchQueue();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await fetch(`http://localhost:3000/api/request/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      fetchRequests();
      fetchQueue();
    } catch (error) {
      console.error("Gagal update status");
    }
  };

  const handlePlaySong = async (song) => {
    await fetch(`http://localhost:3000/api/request/${song._id}/play`, {
      method: "PATCH",
    });

    setNowPlaying(song);
    fetchQueue();
    window.open(song.spotifyUrl, "_blank");
  };

  const handleStopSong = async () => {
    if (!nowPlaying) return;

    await fetch(`http://localhost:3000/api/request/${nowPlaying._id}/stop`, {
      method: "PATCH",
    });

    setNowPlaying(null);
    fetchRequests();
  };

  const formatTime = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / 60000);
    if (diff < 1) return "baru saja";
    if (diff < 60) return `${diff} menit lalu`;
    return `${Math.floor(diff / 60)} jam lalu`;
  };

  const statusBadge = (status) => {
    if (status === "approved") return <Badge>Approved</Badge>;
    if (status === "playing") return <Badge variant="secondary">Playing</Badge>;
    if (status === "played") return <Badge variant="outline">Played</Badge>;
    if (status === "rejected")
      return <Badge variant="destructive">Rejected</Badge>;
    return <Badge variant="outline">Pending</Badge>;
  };

  const sortedQueue = [...queue].reverse();

  return (
    <div className="min-h-screen bg-muted p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Dashboard Cafe</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* ================= REQUEST ================= */}
          <Card>
            <CardHeader>
              <CardTitle>Request Lagu Masuk</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[520px] overflow-y-auto">
              {requests.map((req) => (
                <div key={req._id} className="border rounded-lg p-4 space-y-2">
                  <p className="font-medium">{req.title}</p>
                  <p className="text-sm text-muted-foreground">{req.artist}</p>

                  <div className="flex items-center gap-2 text-xs">
                    {statusBadge(req.status)}
                    <span className="text-muted-foreground">
                      {formatTime(req.createdAt)}
                    </span>
                  </div>

                  {req.status === "pending" && (
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatus(req._id, "rejected")}
                      >
                        Tolak
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => updateStatus(req._id, "approved")}
                      >
                        Setujui
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* ================= QUEUE ================= */}
          <Card>
            <CardHeader>
              <CardTitle>Queue Lagu</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 max-h-[520px] overflow-y-auto">
              {sortedQueue.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-10">
                  Belum ada lagu di queue
                </p>
              ) : (
                sortedQueue.map((song, index) => (
                  <div
                    key={song._id}
                    className="flex items-center justify-between border rounded-lg p-4"
                  >
                    <div>
                      <p className="font-medium">
                        {sortedQueue.length - index}. {song.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {song.artist}
                      </p>
                    </div>

                    <Button size="sm" onClick={() => handlePlaySong(song)}>
                      Play
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* ================= NOW PLAYING ================= */}
          <Card className="self-start">
            <CardHeader>
              <CardTitle>Now Playing</CardTitle>
            </CardHeader>
            <CardContent>
              {nowPlaying ? (
                <div className="space-y-2">
                  <p className="font-medium">{nowPlaying.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {nowPlaying.artist}
                  </p>

                  <Badge variant="secondary">Sedang diputar</Badge>

                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2"
                    onClick={handleStopSong}
                  >
                    Stop
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Belum ada lagu diputar
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
