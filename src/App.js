import { useEffect, useState } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Card } from 'react-bootstrap';

import './App.css';
import axios from 'axios';
import { Link } from 'react-router-dom';


//TODO: 
// -> handler for possible errors
//  |-> empty searches
//  |-> API failure
//  |-> Login failure
//  |-> track not found

// -> reformat token existance check into fuctions, so it may return the correct HTML

// -> tagging for future CSS
//  |-> turn display into GRID (DONE)
//  |-> change font
//  |-> responsive display
//  |-> API failure

// -> add playlist integration
//  |-> users don't have to be logged to listen (?)
//  |-> action to add track to playlist
//  |-> open playlist on browser/app
//  |-> MAYBE: if search matches album/artist, show those instead of related tracks

//  album interaction
//  |-> show all tracks ✓
//    \-> make it possible to add them to playlist
//  |-> enable user to add track from such screen


const App = () => {

  const CLIENT_ID = "91403a058b644c6594b085cf1dccbdc9"
  const REDIRECT_URI = "http://localhost:3000"
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize"
  const RESPONSE_TYPE = "token"

  const BACKEND_URI = "http://localhost:8000";

  const PLAYLIST_ID = "6qhHkcQxP9FspoC5v41416"

  // const [pos0, pos1] = useState(val_inicial)
  // |-> pos0 = val | pos1 = method | useState = initial val
  const [token, setToken] = useState("");
  const [searchKey, setSearchKey] = useState("");
  const [tracks, setTracks] = useState([]);
  //const [track, setTrack] = useState("");

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

  //gets which track got clicked
  const logTrack = (track) => {
    console.log("track:", track)

    const data = {
      artistName: track.artists[0].name,
      trackName: track.name
    };

    fetch("http://localhost:8000/log/selectedTrack", { 
      method: 'POST', 
      headers: 
      { 
        'Content-Type': 'application/json'
      }, 
      body: JSON.stringify(data), 
  }) .then((response) => response.json())

  }

  //gets which track was searched
  const logSearch = () => {
    var searchVal = document.getElementById("searchInput").value;

    console.log("search: ", searchVal);

    const data = {
      searchInput: searchVal
    };

    fetch("http://localhost:8000/log/search", { 
      method: 'POST', 
      headers: 
      { 
        'Content-Type': 'application/json'
      }, 
      body: JSON.stringify(data), 
  }) .then((response) => response.json())
  }

  //(not yet) adds track to playlist
  const addTrack = async (track) => {
    console.log('trigger na addTrack');

    logTrack(track);

      const data = {
        playlist_id: PLAYLIST_ID,
        position: 0,
        uris: ["spotify:track:"+track.id]
      };

      fetch("https://api.spotify.com/v1/playlists/"+PLAYLIST_ID+"/tracks", { 
        method: 'POST', 
        headers: 
        { 
          'Content-Type': 'application/json', 
          "Authorization": `Bearer ${token}` 
        }, body: JSON.stringify(data), 
    }) .then((response) => response.json())

    


    /*const {data} = await axios.post("https://api.spotify.com/v1/playlists/"+PLAYLIST_ID+"/tracks", {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: {
        playlist_id: PLAYLIST_ID,
        position: 0,
        uris: ["spotify:track:"+track.id]
      }
    }).then((res) => {
      console.log(res)
    })*/

    

    //setTrack(data)
  }

  const openAlbum = (track) => {

  }

  //showing tracks on screen
  const renderTracks = () => {
    return tracks.map(track => (
      <Card key={track.id} bg={'dark'} onClick={() => logTrack(track)}>
        <Link to={{
          pathname: "album/" + track.album.id,
          data: track
        }}>
          <Card.Img src={track.album.images[0].url}/>
            <Card.Body>
              <Card.Title>
                {track.name}
              </Card.Title>
            </Card.Body>
        </Link>
      </Card>
    ))
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Spotify React</h1>

        {/*playlist iframe*/}
        <iframe src="https://open.spotify.com/embed/playlist/6qhHkcQxP9FspoC5v41416?utm_source=generator&theme=0" width="50%" height="152" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>

        {/* ternary | checks if there's a token | if not, show login msg, otherwise a logout btn */}
        {!token ?
          <a href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}`}>Login to Spotify</a>

          : <button onClick={logout}>Logout</button>}

        {/* ternary | if there's a token, enables user to make search reqs*/}
        {token ?
          <form onSubmit={searchTracks}>
            <input id="searchInput" type="text" onChange={e => setSearchKey(e.target.value)} />

            {/* logs what's been searched, as well as sends input to API */}
            <button type={"submit"} onClick={() => logSearch()}>Search</button>
          </form>

          : <h2>Please login first</h2>}

        <Container>
          <Row className='mx-2 row row-cols-4'>
            {renderTracks()}
          </Row>
        </Container>

        
      </header>
    </div>
  );
}

export default App;
