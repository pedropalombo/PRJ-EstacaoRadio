import React from 'react'
import { Accordion, Figure } from 'react-bootstrap'
import { Container } from 'react-bootstrap';

import { useEffect, useState } from 'react';

import styles from './Album.css';

import ImagePlaceHolder from './Filthyfrank.png';

import axios from 'axios';

import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';



const Album = (props) => {

  const [album, setAlbum] = useState([]);
  const [isLoading, setIsLoading] = useState(true)
  const { albumId } = useParams();


  //getting token + setting album info
  // |-> used for identification + requests
  useEffect(() => {
    console.log("entrou no use");

    const token = window.localStorage.getItem("token") //tries to get token from LocalStorage

    console.log("terminou o token", token);

    searchAlbum(token)

  }, [])

  //searches for album info
  const searchAlbum = async (token) => {
    console.log("entrou no search");

    //GET request to get info from related album
    const { data } = await axios.get("https://api.spotify.com/v1/albums/" + albumId, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    console.log('album:', data);
    setAlbum(data) //and setting their state
    setIsLoading(false)
  }

  //showing tracks on screen
  const renderTracks = () => {
    console.log("Album da track: ", album);

    return album.tracks.items.map((track, index) => (
      <Accordion>
        <Accordion.Item>

          <Accordion.Header>
            {/*Posição - "Nome da track"*/}
            {`${track.track_number} - ${track.name}`}
          </Accordion.Header>

          <Accordion.Body>
            {getTrackArtists(track.artists)}
          </Accordion.Body>

        </Accordion.Item>
        <br />
      </Accordion>
    ))
  }

  //getting artists for the selected track
  const getTrackArtists = (exactTrack) => {
    let artists = "";

    exactTrack.forEach((elem, idx, array) => {

      if (idx === array.length - 1) {
        artists += elem.name

      } else {
        artists += elem.name + ", "

      }
    });

    //returning artists, separated by commas (',')
    return artists;
  }

  return (
    // -| page container |-
    <div class='pageContainer'>

      <div class="backBtn">
        <Link to={{ pathname: "/" }}>
          ←
        </Link>

      </div>

      <br />
      {!isLoading && <>
        {/* -| top container / album info |- */}
        <div class="topContainer">

          {/* -| image / left |- */}
          <div class="topImage">
            <Figure>
              <Figure.Image
                rounded="true"
                width={300}
                height={300}
                src={album.images[1].url} />
            </Figure>
            {/* -| title & description / right |- */}
            <div className='topDescriptionContainer'>
              <span class="topTitle">
                {album.name}
              </span>

              <br />

              <span class="topDescription">
                by - {album.artists[0].name}<br />
                Release - {album.release_date}
              </span>
            </div>

          </div>

        </div>

        {/* -| bottom container / tracks + artists |- */}
        <div class="bottomContainer">
          <Container>
            {renderTracks()}
          </Container>
        </div> </>}
    </div>
  )
}

export default Album