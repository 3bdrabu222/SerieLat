import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { FavoritesProvider } from './context/FavoritesContext';
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
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Profile } from './pages/Profile';
import { AdminDashboard } from './pages/AdminDashboard';
import { Favorites } from './pages/Favorites';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <FavoritesProvider>
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
        </FavoritesProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;