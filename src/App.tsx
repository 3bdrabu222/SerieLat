import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { WatchLaterProvider } from './context/WatchLaterContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';
import { Home } from './pages/Home';
import { SeriesDetails } from './pages/SeriesDetails';
import { ActorDetails } from './pages/ActorDetails';
import { SearchResults } from './pages/SearchResults';
import { Genres } from './pages/Genres';
import { GenreShows } from './pages/GenreShows';
import { Years } from './pages/Years';
import { YearShows } from './pages/YearShows';
import { MovieGenres } from './pages/MovieGenres';
import { MovieYears } from './pages/MovieYears';
import { MovieGenreResults } from './pages/MovieGenreResults';
import { MovieYearResults } from './pages/MovieYearResults';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Profile } from './pages/Profile';
import { AdminDashboard } from './pages/AdminDashboard';
import { Favorites } from './pages/Favorites';
import { WatchLater } from './pages/WatchLater';
import { Best100Series } from './pages/Best100Series';
import { Best100Movies } from './pages/Best100Movies';
import { Best100Chooser } from './pages/choices/Best100Chooser';
import { GenresChooser } from './pages/choices/GenresChooser';
import { YearsChooser } from './pages/choices/YearsChooser';
import { Movies } from './pages/Movies';
import { MovieDetails } from './pages/MovieDetails';
import { DiscoverMovies } from './pages/DiscoverMovies';
import { DiscoverTV } from './pages/DiscoverTV';
import PopularPeople from './pages/PopularPeople';
import PersonDetails from './pages/PersonDetails';
import { Settings } from './pages/Settings';
import { SerieLatAI } from './pages/SerieLatAI';
import { ReleaseCalendar } from './pages/ReleaseCalendar';
import { LatestTrailers } from './pages/LatestTrailers';
import { WhatsOnTV } from './pages/WhatsOnTV';
import { BornToday } from './pages/BornToday';
import { TopBoxOffice } from './pages/TopBoxOffice';
import { TrendingThisWeek } from './pages/TrendingThisWeek';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <FavoritesProvider>
          <WatchLaterProvider>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/series/:id" element={<SeriesDetails />} />
                <Route path="/actor/:id" element={<ActorDetails />} />
                <Route path="/person/:id" element={<PersonDetails />} />
                <Route path="/popular-people" element={<PopularPeople />} />
                {/* Chooser Pages */}
                <Route path="/best-100" element={<Best100Chooser />} />
                <Route path="/genres" element={<GenresChooser />} />
                <Route path="/years" element={<YearsChooser />} />
                
                {/* Best 100 Pages */}
                <Route path="/best-tv" element={<Best100Series />} />
                <Route path="/best-movies" element={<Best100Movies />} />
                
                {/* TV Genres & Years */}
                <Route path="/genres/tv" element={<Genres />} />
                <Route path="/genre/:genreId" element={<GenreShows />} />
                <Route path="/years/tv" element={<Years />} />
                <Route path="/year/:year" element={<YearShows />} />
                
                {/* Movie Genres & Years */}
                <Route path="/genres/movies" element={<MovieGenres />} />
                <Route path="/movies/genres/:genreId" element={<MovieGenreResults />} />
                <Route path="/years/movies" element={<MovieYears />} />
                <Route path="/movies/years/:year" element={<MovieYearResults />} />
                
                {/* Content Pages */}
                <Route path="/movies" element={<Movies />} />
                <Route path="/movie/:id" element={<MovieDetails />} />
                <Route path="/discover/movies" element={<DiscoverMovies />} />
                <Route path="/discover/tv" element={<DiscoverTV />} />
                
                {/* New Feature Pages */}
                <Route path="/release-calendar" element={<ReleaseCalendar />} />
                <Route path="/latest-trailers" element={<LatestTrailers />} />
                <Route path="/whats-on-tv" element={<WhatsOnTV />} />
                <Route path="/born-today" element={<BornToday />} />
                <Route path="/top-box-office" element={<TopBoxOffice />} />
                <Route path="/trending" element={<TrendingThisWeek />} />
                
                {/* AI Assistant */}
                <Route path="/serielat-ai" element={<SerieLatAI />} />
                
                {/* Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Protected Routes */}
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/favorites"
                  element={
                    <ProtectedRoute>
                      <Favorites />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/watch-later"
                  element={
                    <ProtectedRoute>
                      <WatchLater />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  }
                />
                
                {/* Admin Routes */}
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  }
                />
              </Route>
            </Routes>
          </WatchLaterProvider>
        </FavoritesProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;