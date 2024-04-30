import express, { Request, Response } from "express"
import cors from "cors"
import axios from "axios"
import mongoose from "mongoose";
import dotenv from "dotenv"
import getSpotifyToken from "./utils/getSpotifyToken";
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
    return res.json({ status: true, message: "API Working nicely" });
})

app.get("/playlist/:id", async (req: Request, res: Response) => {
    const { id } = req.params

    const token = await getSpotifyToken.getToken()
    console.log('Using token:', token);

    const newRes = await axios.get(`https://api.spotify.com/v1/playlists/${id}`, {
        headers: {
            Authorization: "Bearer " + token
        }
    })
    const data = newRes.data
    let tracks = data['tracks']['items']

    if (data.tracks.next) {
        let i = 1;
        while (true) {
            const newRes = await axios.get(`https://api.spotify.com/v1/playlists/${id}/tracks?offset=${i * 100}&limit=100`, {
                headers: {
                    Authorization: "Bearer " + token
                }
            })
            const data = newRes.data
            tracks.push(...data['items'])
            i++;
            if (!data.next)
                break;
        }
    }

    const playlistName = data['name']
    tracks = tracks.map((item: any) => {
        const { track } = item
        return { image: track.preview_url, name: track.name, id: track.id, album: { id: track.album.id, name: track.album.name }, artists: [track.artists.map((artist: any) => artist.name)] }
    })

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