export interface Anime {
  id: number;
  title: string;
  rating: number;
  year: number;
  genre: string[];
  summary: string;
  image: string;
  episodes: number;
  status: "Completed" | "Ongoing" | "Upcoming";
}

export const animeData: Anime[] = [
  {
    id: 1,
    title: "Attack on Titan",
    rating: 9.0,
    year: 2013,
    genre: ["Action", "Drama", "Fantasy"],
    summary: "Humanity fights for survival against giant humanoid Titans behind massive walls.",
    image: "/src/assets/attack-on-titan.jpg",
    episodes: 87,
    status: "Completed"
  },
  {
    id: 2,
    title: "Demon Slayer",
    rating: 8.7,
    year: 2019,
    genre: ["Action", "Supernatural", "Historical"],
    summary: "A young boy becomes a demon slayer to save his sister who was turned into a demon.",
    image: "/src/assets/demon-slayer.jpg",
    episodes: 32,
    status: "Ongoing"
  },
  {
    id: 3,
    title: "Your Name",
    rating: 8.4,
    year: 2016,
    genre: ["Romance", "Drama", "Supernatural"],
    summary: "Two teenagers share a profound, magical connection upon discovering they are swapping bodies.",
    image: "/src/assets/your-name.jpg",
    episodes: 1,
    status: "Completed"
  },
  {
    id: 4,
    title: "Spirited Away",
    rating: 9.3,
    year: 2001,
    genre: ["Adventure", "Family", "Fantasy"],
    summary: "A young girl enters a world of spirits and witches, where humans are changed into beasts.",
    image: "/src/assets/spirited-away.jpg",
    episodes: 1,
    status: "Completed"
  },
  {
    id: 5,
    title: "One Piece",
    rating: 9.1,
    year: 1999,
    genre: ["Action", "Adventure", "Comedy"],
    summary: "Monkey D. Luffy explores the Grand Line with his diverse crew of pirates, the Straw Hats.",
    image: "/src/assets/one-piece.jpg",
    episodes: 1000,
    status: "Ongoing"
  },
  {
    id: 6,
    title: "Jujutsu Kaisen",
    rating: 8.6,
    year: 2020,
    genre: ["Action", "School", "Supernatural"],
    summary: "A high school student joins a secret organization of Jujutsu Sorcerers to eliminate Cursed Spirits.",
    image: "/src/assets/jujutsu-kaisen.jpg",
    episodes: 24,
    status: "Ongoing"
  },
  {
    id: 7,
    title: "My Hero Academia",
    rating: 8.5,
    year: 2016,
    genre: ["Action", "School", "Superhero"],
    summary: "A boy born without superpowers in a superhuman society enrolls in a prestigious hero academy.",
    image: "/src/assets/my-hero-academia.jpg",
    episodes: 138,
    status: "Ongoing"
  },
  {
    id: 8,
    title: "Death Note",
    rating: 9.0,
    year: 2006,
    genre: ["Thriller", "Supernatural", "Psychological"],
    summary: "A high school student finds a supernatural notebook that can kill anyone whose name is written in it.",
    image: "/src/assets/death-note.jpg",
    episodes: 37,
    status: "Completed"
  },
  {
    id: 9,
    title: "Naruto",
    rating: 8.4,
    year: 2002,
    genre: ["Action", "Adventure", "Ninja"],
    summary: "A young ninja seeks recognition from his peers and dreams of becoming the village leader.",
    image: "/src/assets/naruto.jpg",
    episodes: 720,
    status: "Completed"
  },
  {
    id: 10,
    title: "Dragon Ball Z",
    rating: 8.8,
    year: 1989,
    genre: ["Action", "Adventure", "Martial Arts"],
    summary: "Goku and his friends defend Earth against powerful villains and otherworldly threats.",
    image: "/src/assets/dragon-ball-z.jpg",
    episodes: 291,
    status: "Completed"
  }
];

export const genres = [
  "All",
  "Action",
  "Adventure", 
  "Comedy",
  "Drama",
  "Fantasy",
  "Historical",
  "Martial Arts",
  "Ninja",
  "Psychological",
  "Romance",
  "School",
  "Superhero",
  "Supernatural",
  "Thriller"
];