import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

// Favorite Button Component


// MoviesList Component
const MovieCard = ({ movie }) => {
  const [favorites, setFavorites] = useState([]);

  // Fetch favorite movies from cookies or API on component mount
  useEffect(() => {
    // If logged in, fetch favorites from API
    const token = Cookies.get('token');
    if (token) {
      // Fetch favorites from the API
      axios.get('http://127.0.0.1:8000/api/favorites', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(response => {
        const favoriteMovies = response.data.data.map(fav => fav.movie_id);
        setFavorites(favoriteMovies);

        // After logging in, send cookies' favorites to the database
        const storedFavorites = Cookies.get('favorites') ? JSON.parse(Cookies.get('favorites')) : [];
        if (storedFavorites.length > 0) {
          storedFavorites.forEach(movieId => {
            axios.post(`http://127.0.0.1:8000/api/add-favorite/${movieId}`, {}, {
              headers: { Authorization: `Bearer ${token}` }
            })
            .catch(error => console.error('Error adding favorite from cookies to API:', error));
          });
          // After sending favorites to the API, remove them from cookies
          Cookies.remove('favorites');
        }
      })
      .catch(error => console.error('Error fetching favorites from API:', error));
    } else {
      // If not logged in, fetch favorites from cookies
      const storedFavorites = Cookies.get('favorites') ? JSON.parse(Cookies.get('favorites')) : [];
      setFavorites(storedFavorites);
    }
  }, []);

  // Handle favorite click (add/remove favorite)
  const handleFavoriteClick = (movieId) => {
    let updatedFavorites;

    if (favorites.includes(movieId)) {
      // Remove from favorites
      updatedFavorites = favorites.filter((id) => id !== movieId);
      if (Cookies.get('token')) {
        // If logged in, remove from DB
        axios.post(`http://127.0.0.1:8000/api/remove-favorite/${movieId}`, {}, {
          headers: { Authorization: `Bearer ${Cookies.get('token')}` }
        })
        .catch(error => console.error('Error removing favorite from API:', error));
      }
    } else {
      // Add to favorites
      updatedFavorites = [...favorites, movieId];
      if (Cookies.get('token')) {
        // If logged in, add to DB
        axios.post(`http://127.0.0.1:8000/api/add-favorite/${movieId}`, {}, {
          headers: { Authorization: `Bearer ${Cookies.get('token')}` }
        })
        .catch(error => console.error('Error adding favorite to API:', error));
      }
    }

    // Save updated favorites to cookies (for both logged-in and logged-out users)
    if (!Cookies.get('token')) {
      Cookies.set('favorites', JSON.stringify(updatedFavorites), { expires: 365 });
    }

    // Update state
    setFavorites(updatedFavorites);
  };

  return (
    <div className="movies-list">
      <div key={movie.id} className="movie-card">
        {/* Movie Poster */}
        <figure className="poster-box card-banner">
          <a href={`/movie/${movie.id}`} title={movie.title}>
            <img
              src={`https://image.tmdb.org/t/p/w500${movie.poster_url}`}
              alt={movie.title}
              className="img-cover"
              height="100%"
              width="80%"
              loading="lazy"
            />
          </a>
        </figure>

        {/* Movie Title */}
        <a
          className="link-light"
          href={`/movie/${movie.id}`}
          title={movie.title}
          style={{
            textDecoration: 'none',
          }}
        >
          <h4 className="title">{movie.title}</h4>
        </a>

        {/* Favorite Button */}
        <FavoriteButton
          isFavorited={favorites.includes(movie.id)}
          onClick={() => handleFavoriteClick(movie.id)}
        />

        {/* Movie Meta Information */}
        <div className="meta-list">
          <div className="card-badge">{movie.release_year}</div>
          <div className="card-badge">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="gold"
              className="bi bi-star-fill star-icon"
              viewBox="0 0 16 16"
              style={{ paddingBottom: '1px' }}
            >
              <path d="M3.612 15.443c-.394.212-.866-.198-.793-.627l1.365-4.494-3.711-2.815c-.373-.28-.18-.854.312-.854h4.57l1.438-4.464c.1-.32.52-.32.618 0l1.438 4.464h4.57c.492 0 .685.574.312.854l-3.711 2.815 1.365 4.494c.073.43-.399.84-.793.627l-4.249-2.549-3.75 2.495z" />
            </svg>
            {movie.vote ? movie.vote.toFixed(1) : ' '}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;