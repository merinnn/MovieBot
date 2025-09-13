import React, { useState, useEffect } from "react";
import "./App.css";
import MovieSearch from "./components/MovieSearch";
import MovieList from "./components/MovieList";
import Chatbot from "./components/Chatbot";
import axios from "axios";

function App() {
  const [movies, setMovies] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMovie, setSelectedMovie] = useState(null);

  // Hardcoded API keys (replace with your actual keys)
  const OMDB_API_KEY = "enter ur key here";
  const GEMINI_API_KEY = "enter ur key here";

  useEffect(() => {
    // Fetch recent movies on initial load (e.g., movies from 2023)
    const fetchRecentMovies = async () => {
      try {
        const res = await axios.get(
          `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&s=2023&type=movie`
        );
        if (res.data.Response === "True") {
          setMovies(res.data.Search ? res.data.Search.filter(movie => movie.Poster && movie.Poster !== "N/A") : []);
        } else {
          setMovies([]);
        }
      } catch (error) {
        console.error("Failed to fetch recent movies:", error);
        setMovies([]);
      }
    };

    fetchRecentMovies();
  }, []);

  const handlePosterClick = async (title) => {
    setSearchQuery(title);
    try {
      const res = await axios.get(
        `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&t=${encodeURIComponent(title)}&plot=full`
      );
      if (res.data.Response === "True") {
        setSelectedMovie(res.data);
      } else {
        setSelectedMovie(null);
      }
    } catch (error) {
      console.error("Failed to fetch movie details:", error);
      setSelectedMovie(null);
    }
  };

  return (
    <div className="app-container">
      <h1>MovieBot</h1>
      <MovieSearch setMovies={setMovies} omdbApiKey={OMDB_API_KEY} query={searchQuery} />
      <MovieList movies={movies} onPosterClick={handlePosterClick} />
      {selectedMovie && (
        <div className="movie-details" style={{ marginTop: "20px", padding: "10px", border: "1px solid #ccc", borderRadius: "8px" }}>
          <h2>{selectedMovie.Title} ({selectedMovie.Year})</h2>
          <img src={selectedMovie.Poster} alt={selectedMovie.Title} style={{ maxWidth: "200px" }} />
          <p><strong>Plot:</strong> {selectedMovie.Plot}</p>
          <p><strong>Rated:</strong> {selectedMovie.Rated}</p>
          <p><strong>Released:</strong> {selectedMovie.Released}</p>
          <p><strong>Runtime:</strong> {selectedMovie.Runtime}</p>
          <p><strong>Genre:</strong> {selectedMovie.Genre}</p>
          <p><strong>Director:</strong> {selectedMovie.Director}</p>
          <p><strong>Writer:</strong> {selectedMovie.Writer}</p>
          <p><strong>Actors:</strong> {selectedMovie.Actors}</p>
          <p><strong>Language:</strong> {selectedMovie.Language}</p>
          <p><strong>Country:</strong> {selectedMovie.Country}</p>
          <p><strong>Awards:</strong> {selectedMovie.Awards}</p>
          <p><strong>Box Office:</strong> {selectedMovie.BoxOffice}</p>
          <p><strong>IMDb Rating:</strong> {selectedMovie.imdbRating}</p>
          <p><strong>Metascore:</strong> {selectedMovie.Metascore}</p>
          {selectedMovie.Ratings && (
            <div>
              <strong>Ratings:</strong>
              <ul>
                {selectedMovie.Ratings.map((rating, index) => (
                  <li key={index}>{rating.Source}: {rating.Value}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      <Chatbot omdbApiKey={OMDB_API_KEY} geminiApiKey={GEMINI_API_KEY} onPosterClick={handlePosterClick} />
    </div>
  );
}

export default App;
