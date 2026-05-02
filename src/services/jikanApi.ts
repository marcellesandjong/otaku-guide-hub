const JIKAN_BASE_URL = 'https://api.jikan.moe/v4';

// ─── Core Types ───────────────────────────────────────────────────────────────

export interface JikanImage {
  jpg: {
    image_url: string;
    small_image_url: string;
    large_image_url: string;
  };
  webp?: {
    image_url: string;
    small_image_url: string;
    large_image_url: string;
  };
}

export interface JikanGenre {
  mal_id: number;
  type: string;
  name: string;
  url: string;
}

export interface JikanAnime {
  mal_id: number;
  title: string;
  title_english?: string;
  title_japanese?: string;
  images: JikanImage;
  score: number;
  scored_by?: number;
  rank?: number;
  popularity?: number;
  members?: number;
  favorites?: number;
  year: number;
  genres: JikanGenre[];
  themes?: JikanGenre[];
  demographics?: JikanGenre[];
  synopsis: string;
  episodes: number;
  status: string;
  aired: {
    from: string;
    to: string | null;
    string: string;
  };
  season?: string;
  type?: string;
  source?: string;
  duration?: string;
  rating?: string;
  studios?: Array<{ mal_id: number; name: string }>;
  producers?: Array<{ mal_id: number; name: string }>;
  broadcast?: {
    day: string;
    time: string;
    timezone: string;
    string: string;
  };
  trailer?: {
    url: string | null;
    embed_url: string | null;
    youtube_id: string | null;
    images?: {
      small_image_url: string;
      medium_image_url: string;
      large_image_url: string;
      maximum_image_url: string;
    };
  };
  next_episode?: string | null;
  background?: string | null;
  streaming?: Array<{ name: string; url: string }>;
  relations?: Array<{
    relation: string;
    entry: Array<{ mal_id: number; type: string; name: string; url: string }>;
  }>;
}

export interface JikanEpisode {
  mal_id: number;
  title: string;
  title_japanese?: string;
  title_romanji?: string;
  aired?: string;
  score?: number;
  filler: boolean;
  recap: boolean;
  forum_url?: string;
}

export interface JikanReview {
  mal_id: number;
  url?: string;
  type?: string;
  votes?: number;
  date: string;
  review: string;
  score: number;
  tags?: string[];
  is_spoiler?: boolean;
  is_preliminary?: boolean;
  user: {
    username: string;
    url?: string;
    images?: JikanImage;
  };
  reactions?: {
    overall?: number;
    nice?: number;
    love_it?: number;
    funny?: number;
    confusing?: number;
    informative?: number;
    well_written?: number;
    creative?: number;
  };
}

export interface JikanResponse<T> {
  data: T;
  pagination?: {
    has_next_page: boolean;
    current_page: number;
    last_visible_page?: number;
    items?: {
      count: number;
      total: number;
      per_page: number;
    };
  };
}

// ─── Converted Type ───────────────────────────────────────────────────────────

export interface Anime {
  id: number;
  title: string;
  rating: number;
  year: number;
  genre: string[];
  summary: string;
  image: string;
  episodes: number;
  status: 'Completed' | 'Ongoing' | 'Upcoming';
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
  for (let attempt = 0; attempt < retries; attempt++) {
    const res = await fetch(url);
    if (res.status === 429) {
      // Jikan rate-limits at ~3 req/s; back off exponentially
      await sleep(1000 * (attempt + 1));
      continue;
    }
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return res;
  }
  throw new Error(`Failed after ${retries} attempts: ${url}`);
}

async function jikanGet<T>(path: string): Promise<T> {
  const res = await fetchWithRetry(`${JIKAN_BASE_URL}${path}`);
  return res.json() as Promise<T>;
}

// ─── Genre Mapping ────────────────────────────────────────────────────────────

export const genreMapping: Record<string, number> = {
  Action: 1,
  Adventure: 2,
  Comedy: 4,
  Drama: 8,
  Fantasy: 10,
  Historical: 13,
  Horror: 14,
  Mystery: 7,
  Psychological: 40,
  Romance: 22,
  School: 23,
  Supernatural: 37,
  Thriller: 41,
  Sports: 30,
  'Slice of Life': 36,
  'Sci-Fi': 24,
};

// ─── Converter ────────────────────────────────────────────────────────────────

export const convertJikanToAnime = (a: JikanAnime): Anime => ({
  id: a.mal_id,
  title: a.title_english || a.title,
  rating: a.score || 0,
  year: a.year || (a.aired?.from ? new Date(a.aired.from).getFullYear() : 0),
  genre: a.genres?.map((g) => g.name) ?? [],
  summary: a.synopsis || 'No summary available.',
  image:
    a.images?.jpg?.large_image_url ||
    a.images?.jpg?.image_url ||
    '/placeholder.svg',
  episodes: a.episodes || 0,
  status:
    a.status === 'Currently Airing'
      ? 'Ongoing'
      : a.status === 'Finished Airing'
      ? 'Completed'
      : 'Upcoming',
});

// ─── API Functions ────────────────────────────────────────────────────────────

export async function fetchTopAnime(limit = 25): Promise<JikanAnime[]> {
  const data = await jikanGet<JikanResponse<JikanAnime[]>>(
    `/top/anime?limit=${limit}`
  );
  return data.data;
}

export async function fetchAnimeByGenre(
  genreId: number,
  limit = 25
): Promise<JikanAnime[]> {
  const data = await jikanGet<JikanResponse<JikanAnime[]>>(
    `/anime?genres=${genreId}&limit=${limit}&order_by=score&sort=desc`
  );
  return data.data;
}

export async function searchAnime(
  query: string,
  limit = 25
): Promise<JikanAnime[]> {
  const data = await jikanGet<JikanResponse<JikanAnime[]>>(
    `/anime?q=${encodeURIComponent(query)}&limit=${limit}&order_by=score&sort=desc`
  );
  return data.data;
}

export async function fetchAnimeById(id: number): Promise<JikanAnime | null> {
  try {
    const data = await jikanGet<JikanResponse<JikanAnime>>(`/anime/${id}/full`);
    return data.data;
  } catch {
    return null;
  }
}

export async function fetchAnimeEpisodes(
  id: number,
  page = 1
): Promise<{ episodes: JikanEpisode[]; hasNextPage: boolean }> {
  try {
    const data = await jikanGet<JikanResponse<JikanEpisode[]>>(
      `/anime/${id}/episodes?page=${page}`
    );
    return {
      episodes: data.data,
      hasNextPage: data.pagination?.has_next_page ?? false,
    };
  } catch {
    return { episodes: [], hasNextPage: false };
  }
}

export async function fetchAnimeReviews(id: number): Promise<JikanReview[]> {
  try {
    const data = await jikanGet<JikanResponse<JikanReview[]>>(
      `/anime/${id}/reviews`
    );
    return data.data;
  } catch {
    return [];
  }
}

export async function fetchSeasonalAnime(limit = 24): Promise<JikanAnime[]> {
  try {
    const data = await jikanGet<JikanResponse<JikanAnime[]>>(
      `/seasons/now?limit=${limit}`
    );
    return data.data.slice(0, limit);
  } catch {
    return [];
  }
}

export type ScheduleDay =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export async function fetchScheduleByDay(
  day: ScheduleDay
): Promise<JikanAnime[]> {
  try {
    const data = await jikanGet<JikanResponse<JikanAnime[]>>(
      `/schedules?filter=${day}&limit=25`
    );
    return data.data;
  } catch {
    return [];
  }
}

export async function fetchFullSchedule(): Promise<
  Record<ScheduleDay, JikanAnime[]>
> {
  const days: ScheduleDay[] = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ];

  const results = await Promise.allSettled(days.map(fetchScheduleByDay));

  return Object.fromEntries(
    days.map((day, i) => [
      day,
      results[i].status === 'fulfilled' ? results[i].value : [],
    ])
  ) as Record<ScheduleDay, JikanAnime[]>;
}
