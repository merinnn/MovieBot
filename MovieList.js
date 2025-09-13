import React from "react";

function MovieList({ movies, onPosterClick }) {
  if (movies.length === 0) {
    return <p style={{ textAlign: "center", color: "#666" }}>No movies to display. Try searching for some!</p>;
  }

  return (
    <div className="movie-list">
      {movies.map((movie) => (
        <div key={movie.imdbID} className="movie-card">
          {movie.Poster !== "N/A" ? (
            <img
              src={movie.Poster}
              alt={movie.Title}
              className="movie-poster"
              onClick={() => onPosterClick && onPosterClick(movie.Title)}
              style={{ cursor: onPosterClick ? "pointer" : "default" }}
            />
          ) : (
            <div
              className="movie-poster"
              style={{ background: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", color: "#999" }}
            >
              No Image
            </div>
          )}
          <div className="movie-title">{movie.Title} ({movie.Year})</div>
        </div>
      ))}
    </div>
  );
}

export default MovieList;
