# ❤️ Favorites System Documentation

Complete Favorites System has been implemented in your SerieLat project.

---

## 🎯 Features Implemented

✅ **Add to Favorites** - Users can add any TV series to their favorites  
✅ **Remove from Favorites** - Users can remove series from favorites  
✅ **Favorites Page** - Dedicated page showing all favorite series  
✅ **Instant UI Updates** - No page refresh needed  
✅ **User-Specific** - Each user has their own favorites list  
✅ **Protected Routes** - Only authenticated users can access favorites  
✅ **Beautiful UI** - Heart icons and smooth animations  

---

## 📁 Files Created/Modified

### Backend Files Created:

1. **`server/models/Favorite.js`**
   - MongoDB schema for favorites
   - Stores: movieId, title, poster, rating, etc.
   - Compound index to prevent duplicates

2. **`server/controllers/favoritesController.js`**
   - `addToFavorites` - Add movie to favorites
   - `removeFromFavorites` - Remove movie from favorites
   - `getUserFavorites` - Get all user favorites
   - `checkFavorite` - Check if movie is favorited

3. **`server/routes/favoritesRoutes.js`**
   - All routes require authentication
   - POST `/api/favorites/add`
   - DELETE `/api/favorites/remove/:movieId`
   - GET `/api/favorites`
   - GET `/api/favorites/check/:movieId`

4. **`server/server.js`** (Modified)
   - Added favorites routes to server

### Frontend Files Created:

1. **`src/context/FavoritesContext.tsx`**
   - React context for favorites state management
   - Auto-fetches favorites when user logs in
   - Provides: `favorites`, `addToFavorites`, `removeFromFavorites`, `isFavorite`

2. **`src/components/AddToFavoriteButton.tsx`**
   - Reusable favorite button component
   - Two variants: `icon` (heart icon) and `button` (full button)
   - Shows loading states and error messages
   - Only visible to authenticated users

3. **`src/pages/Favorites.tsx`**
   - Dedicated favorites page
   - Grid layout showing all favorite series
   - Empty state when no favorites
   - Remove button on hover

4. **`src/App.tsx`** (Modified)
   - Wrapped with `FavoritesProvider`
   - Added `/favorites` protected route

5. **`src/components/Layout.tsx`** (Modified)
   - Added "Favorites" button in navigation (when logged in)
   - Heart icon with red background

---

## 🚀 How to Use

### For Users:

1. **Login** to your account
2. **Browse** any TV series
3. **Click** the "Add to Favorites" button on any series card
4. **View** all favorites by clicking "Favorites" in the navigation
5. **Remove** favorites by clicking the heart icon again

### For Developers:

#### Adding Favorite Button to Movie Cards

```tsx
import { AddToFavoriteButton } from '../components/AddToFavoriteButton';

// In your movie card component:
<AddToFavoriteButton
  movieId={series.id.toString()}
  movieTitle={series.name}
  moviePoster={series.poster_path}
  movieOverview={series.overview}
  movieRating={series.vote_average}
  movieReleaseDate={series.first_air_date}
  movieType="tv"
  variant="icon" // or "button"
/>
```

#### Using Favorites Context

```tsx
import { useFavorites } from '../context/FavoritesContext';

function MyComponent() {
  const { favorites, isFavorite, addToFavorites, removeFromFavorites } = useFavorites();
  
  // Check if a movie is favorited
  const isMovieFavorited = isFavorite('12345');
  
  // Add to favorites
  await addToFavorites({
    movieId: '12345',
    movieTitle: 'Breaking Bad',
    moviePoster: '/poster.jpg',
    // ... other fields
  });
  
  // Remove from favorites
  await removeFromFavorites('12345');
}
```

---

## 🔌 API Endpoints

### 1. Add to Favorites

```http
POST /api/favorites/add
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "movieId": "1396",
  "movieTitle": "Breaking Bad",
  "moviePoster": "/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
  "movieOverview": "A high school chemistry teacher...",
  "movieRating": 8.9,
  "movieReleaseDate": "2008-01-20",
  "movieType": "tv"
}
```

**Response:**
```json
{
  "message": "Movie added to favorites",
  "favorite": {
    "id": "507f1f77bcf86cd799439011",
    "movieId": "1396",
    "movieTitle": "Breaking Bad",
    "moviePoster": "/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
    "movieRating": 8.9,
    "createdAt": "2024-11-24T19:00:00.000Z"
  }
}
```

### 2. Remove from Favorites

```http
DELETE /api/favorites/remove/1396
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response:**
```json
{
  "message": "Movie removed from favorites",
  "movieId": "1396"
}
```

### 3. Get All Favorites

```http
GET /api/favorites
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response:**
```json
{
  "count": 5,
  "favorites": [
    {
      "id": "507f1f77bcf86cd799439011",
      "movieId": "1396",
      "movieTitle": "Breaking Bad",
      "moviePoster": "/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
      "movieRating": 8.9,
      "createdAt": "2024-11-24T19:00:00.000Z"
    }
  ]
}
```

### 4. Check if Favorited

```http
GET /api/favorites/check/1396
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response:**
```json
{
  "isFavorite": true,
  "favoriteId": "507f1f77bcf86cd799439011"
}
```

---

## 🧪 Testing with Postman

### Step 1: Login First

```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Copy the `accessToken` from the response.

### Step 2: Add to Favorites

```http
POST http://localhost:5000/api/favorites/add
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
Content-Type: application/json

{
  "movieId": "1396",
  "movieTitle": "Breaking Bad",
  "moviePoster": "/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
  "movieOverview": "A high school chemistry teacher diagnosed with inoperable lung cancer...",
  "movieRating": 8.9,
  "movieReleaseDate": "2008-01-20",
  "movieType": "tv"
}
```

### Step 3: Get Favorites

```http
GET http://localhost:5000/api/favorites
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
```

### Step 4: Remove from Favorites

```http
DELETE http://localhost:5000/api/favorites/remove/1396
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
```

---

## 🎨 UI Components

### AddToFavoriteButton Variants

#### Icon Variant (for movie cards)
```tsx
<AddToFavoriteButton
  movieId="1396"
  movieTitle="Breaking Bad"
  variant="icon"
/>
```
- Shows heart icon only
- Perfect for movie card overlays
- Compact design

#### Button Variant (for detail pages)
```tsx
<AddToFavoriteButton
  movieId="1396"
  movieTitle="Breaking Bad"
  variant="button"
/>
```
- Shows heart icon + text
- "Add to Favorites" or "Remove from Favorites"
- More prominent

---

## 📊 Database Schema

### Favorite Model

```javascript
{
  user: ObjectId,           // Reference to User
  movieId: String,          // TMDB movie/series ID
  movieTitle: String,       // Title of the movie/series
  moviePoster: String,      // Poster path
  movieOverview: String,    // Description
  movieRating: Number,      // Rating (0-10)
  movieReleaseDate: String, // Release date
  movieType: String,        // 'tv' or 'movie'
  createdAt: Date,          // Auto-generated
  updatedAt: Date           // Auto-generated
}
```

**Indexes:**
- Compound index on `(user, movieId)` - prevents duplicates
- Ensures each user can only favorite a movie once

---

## 🔐 Security Features

✅ **Authentication Required** - All endpoints require valid JWT  
✅ **User Isolation** - Users can only see/modify their own favorites  
✅ **Duplicate Prevention** - Database index prevents duplicate favorites  
✅ **Input Validation** - Required fields are validated  
✅ **Error Handling** - Proper error messages for all cases  

---

## 🎯 Integration with Existing Pages

### Where to Add Favorite Buttons:

1. **Home Page** - On each series card
2. **Series Details Page** - Prominent button at the top
3. **Search Results** - On each result card
4. **Genre Pages** - On each series card
5. **Year Pages** - On each series card

### Example Integration:

```tsx
// In your SeriesCard component
import { AddToFavoriteButton } from '../components/AddToFavoriteButton';

function SeriesCard({ series }) {
  return (
    <div className="relative group">
      <img src={series.poster} alt={series.title} />
      
      {/* Add this */}
      <div className="absolute top-2 right-2">
        <AddToFavoriteButton
          movieId={series.id.toString()}
          movieTitle={series.name}
          moviePoster={series.poster_path}
          movieOverview={series.overview}
          movieRating={series.vote_average}
          movieReleaseDate={series.first_air_date}
          variant="icon"
        />
      </div>
    </div>
  );
}
```

---

## 🐛 Troubleshooting

### "Please login to add favorites" Error

**Cause:** User is not authenticated  
**Solution:** Login first, then try adding to favorites

### Favorites Not Loading

**Cause:** Backend server not running or MongoDB connection issue  
**Solution:**
1. Check if backend server is running on port 5000
2. Check MongoDB connection
3. Check browser console for errors

### Duplicate Favorite Error

**Cause:** Trying to add the same movie twice  
**Solution:** This is expected behavior - each movie can only be favorited once

### Button Not Showing

**Cause:** User not logged in  
**Solution:** The button only shows for authenticated users (by design)

---

## 📝 Next Steps & Enhancements

### Possible Future Features:

1. **Favorite Categories** - Organize favorites into lists
2. **Share Favorites** - Share favorite list with friends
3. **Export Favorites** - Download favorites as JSON/CSV
4. **Favorite Statistics** - Show favorite genres, ratings, etc.
5. **Recommendations** - Suggest series based on favorites
6. **Notifications** - Alert when favorited series has new episodes

---

## 🔄 How It Works

### Flow Diagram:

```
User clicks "Add to Favorites"
    ↓
Check if user is authenticated
    ↓
Send POST request to /api/favorites/add
    ↓
Backend validates JWT token
    ↓
Check if already favorited (database)
    ↓
Save to database
    ↓
Return success response
    ↓
Update frontend state (no refresh needed)
    ↓
UI updates instantly (heart fills in)
```

---

## 📧 Support

For issues or questions:
- Check server logs: `cd server && npm run dev`
- Check browser console for frontend errors
- Verify MongoDB is running
- Ensure JWT token is valid

---

**Favorites System is ready to use! ❤️**

Start adding your favorite TV series now!
