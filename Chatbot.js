import React, { useState } from "react";
import axios from "axios";
import "./../Chatbot.css";

function Chatbot({ omdbApiKey, geminiApiKey, onPosterClick }) {
  const [input, setInput] = useState("");
  const [chat, setChat] = useState([]);
  const [error, setError] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);

  const sendMessage = async () => {
    if (!input) return;

    const newChat = [...chat, { role: "user", content: input }];
    setChat(newChat);
    setSelectedMovie(null);

    try {
      // Step 1: Ask Gemini for movie explanation and user review summary
      const res = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
        {
          contents: [
            {
              parts: [
                {
                  text: `Please provide a detailed explanation and user review summary for the movie titled "${input}".`,
                },
              ],
            },
          ],
        },
        { headers: { "Content-Type": "application/json" } }
      );

      const replyText = res.data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, no information available.";

      // Step 2: Fetch OMDb details for the movie to get poster and info
      const omdbRes = await axios.get(
        `https://www.omdbapi.com/?apikey=${omdbApiKey}&t=${encodeURIComponent(input)}&type=movie&plot=full`
      );

      const movieData = omdbRes.data.Response === "True" ? omdbRes.data : null;

      let finalReply = replyText;
      if (movieData) {
        // Format movie details line by line with bold labels and lighter value text
        const formatLine = (label, value) => `<strong>${label}:</strong> <span style="color:#555;">${value}</span><br/>`;

        finalReply += "<br/>" +
          (movieData.Poster && movieData.Poster !== "N/A" ? `<img src="${movieData.Poster}" alt="Movie Poster" style="max-width: 150px; margin-top: 5px; margin-bottom: 10px;" /><br/>` : "") +
          formatLine("Year", movieData.Year) +
          formatLine("Plot", movieData.Plot) +
          formatLine("Rated", movieData.Rated) +
          formatLine("Released", movieData.Released) +
          formatLine("Runtime", movieData.Runtime) +
          formatLine("Genre", movieData.Genre) +
          formatLine("Director", movieData.Director) +
          formatLine("Writer", movieData.Writer) +
          formatLine("Actors", movieData.Actors) +
          formatLine("Language", movieData.Language) +
          formatLine("Country", movieData.Country) +
          formatLine("Awards", movieData.Awards) +
          formatLine("BoxOffice", movieData.BoxOffice) +
          formatLine("IMDb Rating", `${movieData.imdbRating} (${movieData.imdbVotes} votes)`) +
          formatLine("Metascore", movieData.Metascore);
      }

      setChat([...newChat, { role: "bot", content: finalReply }]);
      setError(null);
    } catch (err) {
      console.error("Chatbot API error:", err.response ? err.response.data : err.message);
      setChat([...newChat, { role: "bot", content: "Error contacting chatbot." }]);
      setError(err.response && err.response.data && err.response.data.error && err.response.data.error.message
        ? `Chatbot error: ${err.response.data.error.message}`
        : "Error contacting chatbot. Please check your API key or try again.");
    }

    setInput("");
  };

  // eslint-disable-next-line no-unused-vars
  const handlePosterClick = (movie) => {
    setSelectedMovie(movie);
    if (onPosterClick) {
      onPosterClick(movie.Title);
    }
  };

  return (
    <div style={{ marginTop: "30px" }}>
      <h2>🎬 Movie Chatbot</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div style={{ minHeight: "150px", border: "1px solid #ccc", padding: "10px", overflowY: "auto" }}>
        {chat.map((msg, i) => {
          if (msg.role === "bot") {
            return (
              <div key={i} style={{ marginBottom: "15px" }}>
                <strong>Bot:</strong> <div dangerouslySetInnerHTML={{ __html: msg.content }} />
              </div>
            );
          } else {
            return <p key={i}><strong>You:</strong> {msg.content}</p>;
          }
        })}
      </div>
      {selectedMovie && (
        <div style={{ marginTop: "20px", padding: "10px", border: "1px solid #ccc", borderRadius: "5px", backgroundColor: "#fafafa" }}>
          <h3>{selectedMovie.Title} ({selectedMovie.Year})</h3>
          {selectedMovie.Poster && selectedMovie.Poster !== "N/A" && (
            <img src={selectedMovie.Poster} alt={selectedMovie.Title} style={{ maxWidth: "200px", marginTop: "10px", marginBottom: "10px" }} />
          )}
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
          <p><strong>BoxOffice:</strong> {selectedMovie.BoxOffice}</p>
          <p><strong>IMDb Rating:</strong> {selectedMovie.imdbRating} ({selectedMovie.imdbVotes} votes)</p>
          <p><strong>Metascore:</strong> {selectedMovie.Metascore}</p>
          {selectedMovie.Ratings && selectedMovie.Ratings.length > 0 && (
            <div>
              <strong>Ratings:</strong>
              <ul>
                {selectedMovie.Ratings.map((rating, idx) => (
                  <li key={idx}>{rating.Source}: {rating.Value}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask me about movies..."
        style={{ padding: "6px", width: "250px", marginRight: "10px", marginTop: "10px" }}
        onKeyPress={(e) => { if (e.key === "Enter") sendMessage(); }}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default Chatbot;
