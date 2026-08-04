const LASTFM_API_KEY = process.env.LASTFM_API_KEY || "";
const LASTFM_USERNAME = process.env.LASTFM_USERNAME || "";

const API_ENDPOINT = "https://ws.audioscrobbler.com/2.0/";

export interface LastfmTrack {
  name: string;
  artist: string;
  album: string;
  image: string;
  url: string;
  is_playing: boolean;
  progress_ms: number;
  duration_ms: number;
}

interface LastfmImage {
  size: string;
  "#text": string;
}

interface LastfmTrackData {
  name: string;
  artist: string | { name: string };
  album?: { "#text": string };
  url?: string;
  image?: LastfmImage[];
  "@attr"?: { nowplaying?: string };
}

export async function getLastTrack(): Promise<LastfmTrack | null> {
  if (!LASTFM_API_KEY || !LASTFM_USERNAME) return null;

  try {
    const params = new URLSearchParams({
      method: "user.getrecenttracks",
      user: LASTFM_USERNAME,
      api_key: LASTFM_API_KEY,
      format: "json",
      limit: "1",
    });

    const response = await fetch(`${API_ENDPOINT}?${params}`, {
      cache: "no-store",
    });
    if (!response.ok) return null;

    const data = await response.json();
    const track: LastfmTrackData | undefined = data?.recenttracks?.track?.[0];
    if (!track) return null;

    const images: LastfmImage[] = Array.isArray(track.image) ? track.image : [];
    const bestImage =
      images.find((i) => i.size === "extralarge") || images[images.length - 1];

    return {
      name: track.name || "Unknown",
      artist:
        typeof track.artist === "string" ? track.artist : track.artist?.name || "",
      album: track.album?.["#text"] || "",
      image: bestImage?.["#text"] || "",
      url: track.url || "",
      is_playing: track["@attr"]?.nowplaying === "true",
      progress_ms: 0,
      duration_ms: 0,
    };
  } catch {
    return null;
  }
}
