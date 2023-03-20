import { useEffect, useState } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';

import './App.css';
import axios from 'axios';

//TODO: 
// -> handler for possible errors
//  |-> empty searches
//  |-> API failure
//  |-> Login failure
//  |-> track not found

// -> tagging for future CSS
//  |-> turn display into GRID
//  |-> change font
//  |-> API failure

// -> add playlist integration
//  |-> action to add track to playlist
//  |-> open playlist on browser/app
//  |-> MAYBE: if search matches album/artist, show those instead of related tracks

//  album interaction
//  |-> show all tracks
//    \-> make it possible to add them to playlist
//  |-> enable user to add track from such screen


function App() {

  const CLIENT_ID = "91403a058b644c6594b085cf1dccbdc9"
  const REDIRECT_URI = "http://localhost:3000"
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize"
  const RESPONSE_TYPE = "token"

  const [token, setToken] = useState("");
  const [searchKey, setSearchKey] = useState("");
  const [tracks, setTracks] = useState([]);

  //token criation
  // |-> used for identification
  useEffect(() => {
    const hash = window.location.hash
    let token = window.localStorage.getItem("token") //tries to get token from LocalStorage

    //if token doesn't exist yet
    if(!token && hash) {
      //gets it from URL "access_token" ..
      token = hash.substring(1).split("&").find(elem => elem.startsWith("access_token")).split("=")[1]

      //console.log(token)

      window.location.hash = ""

      window.localStorage.setItem("token", token) //.. and sets token on LocalStorage
    }

    setToken(token)

  }, [])

  //clears LocalStorage and resets token
  const logout = () => {
    setToken("")

    window.localStorage.removeItem("token")
  }

  //searches for tracks
  const searchTracks = async (e) => {
    e.preventDefault(); //prevents from reloading browser when forms 'Search' is submitted

    //GET request to get all tracks related to search
    const {data} = await axios.get("https://api.spotify.com/v1/search", {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: {
        q: searchKey,
        type: "track"
      }
    })

    //console.log(data);
    setTracks(data.tracks.items) //and setting their state

  }

  //showing tracks on screen
  const renderTracks = () => {
    return tracks.map(track => (
      <div key={track.id}>
        {track.album.images.length ? <img width="100%" src={track.album.images[0].url} alt=""/> : <div>No Image</div>}
        <br/>
        {track.name}
      </div>
    ))
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Spotify React</h1>

        {/* ternary | checks if there's a token | if not, show login msg, otherwise a logout btn */}
        {!token ?
        <a href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}`}>Login to Spotify</a>
        
        : <button onClick={logout}>Logout</button>}

        {/* ternary | if there's a token, enables user to make search reqs*/}
        {token ?
          <form onSubmit={searchTracks}>
            <input type="text" onChange={e => setSearchKey(e.target.value)}/>
            <button type={"submit"}>Search</button>
          </form>  

        : <h2>Please login first</h2>}

        {renderTracks()}
      </header>
    </div>
  );
}

export default App;
