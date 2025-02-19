import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { SeriesDetails } from './pages/SeriesDetails';
import { ActorDetails } from './pages/ActorDetails';
import { SearchResults } from './pages/SearchResults';
import { Genres } from './pages/Genres';
import { GenreShows } from './pages/GenreShows';
import { Years } from './pages/Years';
import { YearShows } from './pages/YearShows';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/series/:id" element={<SeriesDetails />} />
          <Route path="/actor/:id" element={<ActorDetails />} />
          <Route path="/genres" element={<Genres />} />
          <Route path="/genre/:genreId" element={<GenreShows />} />
          <Route path="/years" element={<Years />} />
          <Route path="/year/:year" element={<YearShows />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;