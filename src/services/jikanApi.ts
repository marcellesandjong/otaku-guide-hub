// Jikan API service for fetching real anime data
const JIKAN_BASE_URL = 'https://api.jikan.moe/v4';

export interface JikanAnime {
  mal_id: number;
  title: string;
  title_english?: string;
  images: {
    jpg: {
      image_url: string;
      small_image_url: string;
      large_image_url: string;
    };
  };
  score: number;
  year: number;
  genres: Array<{
    mal_id: number;
    name: string;
  }>;
  synopsis: string;
  episodes: number;
  status: string;
  aired: {
    from: string;
  };
}

export interface JikanResponse {
  data: JikanAnime[];
  pagination: {
    has_next_page: boolean;
    current_page: number;
  };
}

// Fetch top anime
export const fetchTopAnime = async (limit: number = 25): Promise<JikanAnime[]> => {
  try {
    const response = await fetch(`${JIKAN_BASE_URL}/top/anime?limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch top anime');
    const data: JikanResponse = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching top anime:', error);
    return [];
  }
};

// Fetch anime by genre
export const fetchAnimeByGenre = async (genreId: number, limit: number = 25): Promise<JikanAnime[]> => {
  try {
    const response = await fetch(`${JIKAN_BASE_URL}/anime?genres=${genreId}&limit=${limit}&order_by=score&sort=desc`);
    if (!response.ok) throw new Error('Failed to fetch anime by genre');
    const data: JikanResponse = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching anime by genre:', error);
    return [];
  }
};

// Search anime
export const searchAnime = async (query: string, limit: number = 25): Promise<JikanAnime[]> => {
  try {
    const response = await fetch(`${JIKAN_BASE_URL}/anime?q=${encodeURIComponent(query)}&limit=${limit}&order_by=score&sort=desc`);
    if (!response.ok) throw new Error('Failed to search anime');
    const data: JikanResponse = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error searching anime:', error);
    return [];
  }
};

// Genre mapping for Jikan API
export const genreMapping: Record<string, number> = {
  "Action": 1,
  "Adventure": 2,
  "Comedy": 4,
  "Drama": 8,
  "Fantasy": 10,
  "Historical": 13,
  "Horror": 14,
  "Mystery": 7,
  "Psychological": 40,
  "Romance": 22,
  "School": 23,
  "Supernatural": 37,
  "Thriller": 41,
  "Sports": 30,
  "Slice of Life": 36,
  "Sci-Fi": 24
};

// Convert Jikan anime to our Anime interface
export const convertJikanToAnime = (jikanAnime: JikanAnime) => ({
  id: jikanAnime.mal_id,
  title: jikanAnime.title_english || jikanAnime.title,
  rating: jikanAnime.score || 0,
  year: jikanAnime.year || new Date(jikanAnime.aired?.from).getFullYear() || 0,
  genre: jikanAnime.genres?.map(g => g.name) || [],
  summary: jikanAnime.synopsis || "No summary available.",
  image: jikanAnime.images?.jpg?.large_image_url || jikanAnime.images?.jpg?.image_url || "/placeholder.svg",
  episodes: jikanAnime.episodes || 0,
  status: jikanAnime.status === "Currently Airing" ? "Ongoing" as const : 
          jikanAnime.status === "Finished Airing" ? "Completed" as const : 
          "Upcoming" as const
});