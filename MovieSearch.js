import React, { useState } from "react";
import axios from "axios";

function MovieSearch({ setMovies }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Hardcoded API key (replace with your actual key)
  const OMDB_API_KEY = "ac9c6468";

  const searchMovies = async (searchQuery) => {
    if (!searchQuery || typeof searchQuery !== "string" || !searchQuery.trim()) return;
    setLoading(true);
    setError("");
    try {
      // Use 't' parameter for exact title search if query looks like a full title
      // Use exact title search for queries longer than 3 characters or specific known titles
      const isExactTitleSearch = searchQuery.trim().length > 3 || ["Guardians of the galaxy vol 2", "blade runner"].some(title => searchQuery.trim().toLowerCase().startsWith(title));
      const url = isExactTitleSearch
        ? `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&t=${encodeURIComponent(searchQuery.trim())}&type=movie&plot=full`
        : `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&s=${encodeURIComponent(searchQuery.trim())}&type=movie`;

      const res = await axios.get(url);

      if (res.data.Response === "True") {
        // If exact title search, wrap single movie in array
        if (res.data.Title) {
          setMovies([res.data]);
        } else {
          setMovies(res.data.Search || []);
        }
      } else {
        setMovies([]);
        setError(res.data.Error || "No movies found.");
      }
    } catch (err) {
      console.error(err);
      setMovies([]);
      setError("Failed to fetch movies. Please check your API key or try again later.");
    }
    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      searchMovies(query);
    }
  };

  return (
    <div className="search-section">
      <input
        type="text"
        className="search-input"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Search movies..."
        disabled={loading}
      />
      <button className="search-button" onClick={() => searchMovies(query)} disabled={loading || !query.trim()}>
        {loading ? "Searching..." : "Search"}
      </button>
      {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
    </div>
  );
}

export default MovieSearch;
