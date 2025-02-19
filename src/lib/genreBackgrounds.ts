// Map of genre IDs to related genres for fallback
export const relatedGenres: Record<number, number[]> = {
  10759: [28, 12], // Action & Adventure -> Action, Adventure
  16: [10751, 35], // Animation -> Family, Comedy
  35: [10767, 10764], // Comedy -> Talk, Reality
  80: [9648, 18], // Crime -> Mystery, Drama
  99: [10763, 10768], // Documentary -> News, War & Politics
  18: [10766, 10751], // Drama -> Soap, Family
  10751: [16, 35], // Family -> Animation, Comedy
  27: [9648, 53], // Horror -> Mystery, Thriller
  10762: [10751, 16], // Kids -> Family, Animation
  9648: [80, 18], // Mystery -> Crime, Drama
  10763: [99, 10768], // News -> Documentary, War & Politics
  10764: [10767, 35], // Reality -> Talk, Comedy
  10765: [878, 14], // Sci-Fi & Fantasy -> Science Fiction, Fantasy
  10766: [18, 10751], // Soap -> Drama, Family
  10767: [35, 10764], // Talk -> Comedy, Reality
  10768: [10763, 99], // War & Politics -> News, Documentary
  37: [10759, 18], // Western -> Action & Adventure, Drama
};

// Default high-quality background images for each genre
export const defaultBackgrounds: Record<number, string> = {
  10759: "https://image.tmdb.org/t/p/original/uDgy6hyPd82kOHh6I95FLtLnj6p.jpg", // The Last of Us
  16: "https://image.tmdb.org/t/p/original/q54qEgagGOYCq5D1903eBVMNkbo.jpg", // Arcane
  35: "https://image.tmdb.org/t/p/original/7q448EVOnuE3gVAx24krzO7SNXM.jpg", // The Office
  80: "https://image.tmdb.org/t/p/original/ggFHVNu6YYI5L9pCfOacjizRGt.jpg", // Breaking Bad
  99: "https://image.tmdb.org/t/p/original/8L2lH2qfTX3PqcRsGUlZ3Ds8KqJ.jpg", // Planet Earth
  18: "https://image.tmdb.org/t/p/original/2OMB0ynKlyIenMJWI2Dy9IWT4c.jpg", // Game of Thrones
  10751: "https://image.tmdb.org/t/p/original/9PFonBhy4cQy7Jz20NpMygczOkv.jpg", // Stranger Things
  27: "https://image.tmdb.org/t/p/original/xf9wuDcqlUPWABZNeDKPbZUjWx0.jpg", // The Walking Dead
  10762: "https://image.tmdb.org/t/p/original/wXSnajAZ5ppTKa8Z5zzWGOK85YH.jpg", // Avatar: The Last Airbender
  9648: "https://image.tmdb.org/t/p/original/reEMJA1uzscCbkpeRJeTT2bjqUp.jpg", // True Detective
  10763: "https://image.tmdb.org/t/p/original/6LyXv6MX8nTKf3Gj6yErAQmRKRG.jpg", // 60 Minutes
  10764: "https://image.tmdb.org/t/p/original/1lk7QISmTam2iOzzUAQYs6voeFg.jpg", // Top Chef
  10765: "https://image.tmdb.org/t/p/original/56v2KjBlU4XaOv9rVYEQypROD7P.jpg", // Black Mirror
  10766: "https://image.tmdb.org/t/p/original/gKG5QGz5Ngf8fgWpBsWtlg5L2SF.jpg", // The Crown
  10767: "https://image.tmdb.org/t/p/original/ucw71LfqZmJmGgJjk8V5MyfXNlt.jpg", // Last Week Tonight
  10768: "https://image.tmdb.org/t/p/original/5R1yhRKTQXKz0PZbx3KXt0WqHUe.jpg", // Band of Brothers
  37: "https://image.tmdb.org/t/p/original/aq2yEMgRQBPfRkrO0Repo2qhUAT.jpg", // Yellowstone
};
