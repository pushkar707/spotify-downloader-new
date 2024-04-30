import express, { Request, Response } from "express"
import cors from "cors"
import axios from "axios"
import mongoose from "mongoose";
import dotenv from "dotenv"
import getSpotifyToken from "./utils/getSpotifyToken";
import Playlist from "./models/Playlist";
import Track from "./models/Track";
dotenv.config()

const app = express();

app.use(express.json())
app.use(cors({
    origin: "http://localhost:3000"
}))

mongoose.connect("mongodb://localhost:27017/spotify-downloader")
    .then(() => {
        console.log("Connected to database successfully")
    })
    .catch(() => {
        console.log("Could not connect");
    })

app.get("/test", (req: Request, res: Response) => {

    return res.json({ status: true, message: "API Working nicely", key: process.env.SPOTIPY_CLIENT_ID });
})

app.get("/playlist/:id", async (req: Request, res: Response) => {
    const { id } = req.params
    let playlistName;
    let tracks;
    const start = Date.now()
    const savedPlaylist = await Playlist.findOneAndUpdate({ spotifyId: id }, { $inc: { accessed: 1 } }).populate("tracks")
    if (savedPlaylist) {
        playlistName = savedPlaylist.name
        tracks = savedPlaylist.tracks
    }
    else {
        const token = await getSpotifyToken.getToken()
        console.log('Using token:', token);

        const newRes = await axios.get(`https://api.spotify.com/v1/playlists/${id}`, {
            headers: {
                Authorization: "Bearer " + token
            }
        })
        const apiData = newRes.data
        tracks = apiData['tracks']['items']

        if (apiData.tracks.next) {
            let i = 1;
            while (true) {
                const newRes = await axios.get(`https://api.spotify.com/v1/playlists/${id}/tracks?offset=${i * 100}&limit=100`, {
                    headers: {
                        Authorization: "Bearer " + token
                    }
                })
                const apiData = newRes.data
                tracks.push(...apiData['items'])
                i++;
                if (!apiData.next)
                    break;
            }
        }

        playlistName = apiData['name']

        tracks = tracks.map((item: any, index: number) => {
            const { track } = item
            return { spotifyId: track.uri.split(":").pop(), name: track.name, previewUrl: track.preview_url, popularity: track.popularity, artists: track.artists.map((artist: any) => artist.name), album: { spotifyId: track.album.id, name: track.album.name } }
        })
        // Todo: check which tracks are already there in db, and also check for repeated tracks in current playlist
        // Push all the trackIds, which already exists to the playlist, then create new tracks and push them to the playlist.
        const dbTracks = await Track.insertMany(tracks)
        await Playlist.create({ name: playlistName, spotifyId: id, tracks: dbTracks.map(track => track._id) })
    }
    console.log(Date.now() - start);
    return res.json({
        status: true, data: {
            playlistName, tracks
        }
    });
})

app.get("/delay", async (req: Request, res: Response) => {
    await new Promise(r => setTimeout(r, 4500))
    return res.send("deleyed route")
})

module.exports = app
app.listen(8000, () => {
    console.log("running of 8000");
})

export default app