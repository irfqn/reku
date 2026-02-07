/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import RequestChart from "@/components/RequestChart";

const POLL_INTERVAL = 5000;

/* 🎨 CARD THEME */
const CARD_BG = "#231338";
const CARD_BORDER = "#3E1F5C";

const SONG_CARD =
  "border rounded-2xl p-4 transition-all duration-200 shadow-md bg-gradient-to-br from-[#2B1745] to-[#341B55] border-[#6D3FA5] hover:shadow-xl hover:-translate-y-[1px]";

export default function Dashboard() {
  const [requests, setRequests] = useState([]);
  const [queue, setQueue] = useState([]);
  const [nowPlaying, setNowPlaying] = useState(null);
  const [highlightIds, setHighlightIds] = useState([]);

  const pollingRef = useRef(null);
  const previousRequestIds = useRef(new Set());

  /* ================= FETCH ================= */
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

  /* ================= ACTION ================= */
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

    await fetchAll();
    window.open(song.spotifyUrl, "_blank");
  };

  const stopPlaying = async () => {
    if (!nowPlaying) return;
    await updateStatus(nowPlaying._id, "played");
    setNowPlaying(null);
  };

  /* ================= UI ================= */
  /* ================= UI ================= */
  return (
    <div className="relative min-h-screen p-8 bg-gradient-to-br from-[#1B0F2B] via-[#2A1545] to-[#5B2A6E]">
      {/* ambient glow layer */}
      <div className="absolute inset-0 bg-purple-600/20 blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-white">
        {/* REQUESTS */}
        <Card
          className="h-[520px] flex flex-col rounded-3xl shadow-2xl border"
          style={{ background: CARD_BG, borderColor: CARD_BORDER }}
        >
          <CardHeader>
            <CardTitle className="text-white">Incoming Requests</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3 overflow-y-auto pr-2">
            {requests.map((req) => (
              <div
                key={req._id}
                className={`${SONG_CARD} ${
                  highlightIds.includes(req._id)
                    ? "shadow-[0_0_0_2px_rgba(196,181,253,0.9)] animate-pulse"
                    : ""
                }`}
              >
                <p className="text-white font-semibold">{req.title}</p>
                <p className="text-sm text-white/80">{req.artist}</p>

                <div className="flex gap-2 text-xs mt-2">
                  <Badge
                    className={`px-3 py-1 text-xs font-medium rounded-full border ${
                      req.status === "pending"
                        ? "bg-amber-100 text-amber-700 border-amber-400"
                        : req.status === "approved"
                          ? "bg-emerald-100 text-emerald-700 border-emerald-400"
                          : "bg-slate-200 text-slate-700 border-slate-400"
                    }`}
                  >
                    {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                  </Badge>
                </div>

                {req.status === "pending" && (
                  <div className="flex gap-2 mt-3 justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-white text-[#231338]"
                      onClick={() => updateStatus(req._id, "rejected")}
                    >
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      className="bg-[#231338] text-white hover:bg-[#3E1F5C]"
                      onClick={() => updateStatus(req._id, "approved")}
                    >
                      Approve
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* QUEUE */}
        <Card
          className="h-[520px] flex flex-col rounded-3xl shadow-2xl border"
          style={{ background: CARD_BG, borderColor: CARD_BORDER }}
        >
          <CardHeader>
            <CardTitle className="text-white">Song Queue</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3 overflow-y-auto pr-2">
            {queue.length === 0 && (
              <div className="flex flex-col items-center justify-center text-white/50 py-10">
                <p className="text-3xl">🎵</p>
                <p className="text-sm mt-2">Queue is empty</p>
              </div>
            )}

            {[...queue].reverse().map((song) => (
              <div
                key={song._id}
                className={`${SONG_CARD} flex items-center gap-4`}
              >
                <img
                  src={song.cover || "https://via.placeholder.com/60"}
                  className="w-14 h-14 rounded-lg object-cover"
                />

                <div className="flex-1">
                  <p className="text-white font-semibold">{song.title}</p>
                  <p className="text-sm text-white/70">{song.artist}</p>
                </div>

                <Button
                  size="sm"
                  className="bg-[#231338] text-white hover:bg-[#3E1F5C]"
                  onClick={() => playSong(song)}
                >
                  ▶ Play
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* RIGHT COLUMN STACK */}
        <div className="flex flex-col gap-8 h-[520px]">
          {/* NOW PLAYING */}
          <Card
            className="flex-[0.8] rounded-3xl shadow-2xl border"
            style={{ background: CARD_BG, borderColor: CARD_BORDER }}
          >
            <CardHeader>
              <CardTitle className="text-white">Now Playing</CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
              {nowPlaying ? (
                <div className={`${SONG_CARD} flex gap-5 items-center`}>
                  <img
                    src={nowPlaying.cover || "https://via.placeholder.com/120"}
                    className="w-24 h-24 rounded-xl object-cover"
                  />

                  <div className="flex-1">
                    <p className="text-white font-semibold text-lg">
                      {nowPlaying.title}
                    </p>
                    <p className="text-white/70">{nowPlaying.artist}</p>

                    <div className="flex items-center gap-3 mt-3">
                      <Badge className="animate-pulse bg-emerald-100 text-emerald-700 border border-emerald-400 px-3 py-1 rounded-full">
                        ● Playing
                      </Badge>

                      <Button
                        size="sm"
                        variant="ghost"
                        className="px-4 text-white/80 hover:text-white hover:bg-white/10 border border-white/20"
                        onClick={stopPlaying}
                      >
                        ⏹ Stop
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-white/70">Nothing is playing</p>
              )}
            </CardContent>
          </Card>

          {/* CHART CARD */}
          <Card
            className="flex-[1.2] rounded-3xl shadow-2xl border"
            style={{ background: CARD_BG, borderColor: CARD_BORDER }}
          >
            <CardHeader>
              <CardTitle className="text-white">Requests Activity</CardTitle>
            </CardHeader>

            <CardContent className="h-full">
              <RequestChart />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
