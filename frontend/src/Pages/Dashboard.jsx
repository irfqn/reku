/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable no-unused-vars */
import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const POLL_INTERVAL = 5000;

export default function Dashboard() {
  const [requests, setRequests] = useState([]);
  const [queue, setQueue] = useState([]);
  const [nowPlaying, setNowPlaying] = useState(null);
  const [highlightIds, setHighlightIds] = useState([]);

  const pollingRef = useRef(null);
  const previousRequestIds = useRef(new Set());

  /* ================= FETCHERS ================= */
  const fetchRequests = async () => {
    const res = await fetch("http://localhost:3000/api/request");
    const data = await res.json();
    const incoming = data.data || [];

    const newPendingIds = incoming
      .filter((r) => r.status === "pending")
      .map((r) => r._id)
      .filter((id) => !previousRequestIds.current.has(id));

    if (newPendingIds.length > 0) {
      setHighlightIds(newPendingIds);
      setTimeout(() => setHighlightIds([]), 3000);
    }

    previousRequestIds.current = new Set(incoming.map((r) => r._id));
    setRequests(incoming);
  };

  const fetchQueue = async () => {
    const res = await fetch("http://localhost:3000/api/request/queue");
    const data = await res.json();
    setQueue((data.data || []).filter((s) => s.status === "approved"));
  };

  const fetchAll = async () => {
    await Promise.all([fetchRequests(), fetchQueue()]);
  };

  /* ================= POLLING ================= */
  const startPolling = () => {
    if (!pollingRef.current) {
      fetchAll();
      pollingRef.current = setInterval(fetchAll, POLL_INTERVAL);
    }
  };

  const stopPolling = () => {
    clearInterval(pollingRef.current);
    pollingRef.current = null;
  };

  useEffect(() => {
    startPolling();
    const onVisibility = () =>
      document.visibilityState === "visible" ? startPolling() : stopPolling();

    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stopPolling();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  /* ================= ACTIONS ================= */
  const updateStatus = async (id, status) => {
    await fetch(`http://localhost:3000/api/request/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchAll();
  };

  const playSong = async (song) => {
    setNowPlaying(song);
    setQueue((prev) => prev.filter((q) => q._id !== song._id));

    await fetch(`http://localhost:3000/api/request/${song._id}/play`, {
      method: "PATCH",
    });

    window.open(song.spotifyUrl, "_blank");
  };

  const stopPlaying = async () => {
    if (!nowPlaying) return;
    await updateStatus(nowPlaying._id, "played");
    setNowPlaying(null);
  };

  /* ================= RENDER ================= */
  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: "#C267B4" }}>
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-[#231338]">
        {/* REQUEST */}
        <Card className="h-[500px] flex flex-col bg-white shadow-xl rounded-2xl">
          <CardHeader>
            <CardTitle>Request Lagu Masuk</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 overflow-y-auto">
            {requests.map((req) => (
              <div
                key={req._id}
                className={`border rounded-xl p-3 transition ${
                  highlightIds.includes(req._id) ? "ring-2 ring-[#231338]" : ""
                }`}
              >
                <p className="font-medium">{req.title}</p>
                <p className="text-sm text-[#231338]/70">{req.artist}</p>

                <div className="flex gap-2 text-xs mt-1">
                  <Badge>{req.status}</Badge>
                </div>

                {req.status === "pending" && (
                  <div className="flex gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-[#231338]"
                      onClick={() => updateStatus(req._id, "rejected")}
                    >
                      Tolak
                    </Button>
                    <Button
                      size="sm"
                      className="bg-[#231338] text-white hover:bg-[#2f1c4d]"
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

        {/* QUEUE */}
        <Card className="h-[500px] flex flex-col bg-white shadow-xl rounded-2xl">
          <CardHeader>
            <CardTitle>Queue Lagu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 overflow-y-auto">
            {queue.length === 0 && (
              <p className="text-sm text-[#231338]/70">
                Belum ada lagu di queue
              </p>
            )}

            {[...queue].reverse().map((song) => (
              <div
                key={song._id}
                className="flex justify-between items-center border rounded-xl p-3"
              >
                <div>
                  <p className="font-medium">{song.title}</p>
                  <p className="text-sm text-[#231338]/70">{song.artist}</p>
                </div>
                <Button
                  size="sm"
                  className="bg-[#231338] text-white hover:bg-[#2f1c4d]"
                  onClick={() => playSong(song)}
                >
                  Play
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* NOW PLAYING */}
        <Card className="self-start bg-white shadow-xl rounded-2xl">
          <CardHeader>
            <CardTitle>Now Playing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {nowPlaying ? (
              <>
                <p className="font-medium">{nowPlaying.title}</p>
                <p className="text-sm text-[#231338]/70">{nowPlaying.artist}</p>
                <Badge variant="secondary">Sedang diputar</Badge>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-[#231338]"
                  onClick={stopPlaying}
                >
                  Stop
                </Button>
              </>
            ) : (
              <p className="text-sm text-[#231338]/70">
                Belum ada lagu diputar
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
