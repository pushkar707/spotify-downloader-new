import express, { Request, Response } from "express"
import cors from "cors"
import axios from "axios"
import mongoose from "mongoose";
import dotenv from "dotenv"
import getSpotifyToken from "./utils/getSpotifyToken";
import Playlist from "./models/Playlist";
import Track from "./models/Track";
import puppeteer from "puppeteer"
import getYtUrl from "./utils/getYtUrl";
import ytUrlToS3 from "./utils/ytUrlToS3";
dotenv.config()

const app = express();

app.use(express.json())
app.use(cors({
    origin: "http://localhost:3000"
}))

// mongoose.connect("mongodb://localhost:27017/spotify-downloader")
const mongoDBSrv = "mongodb+srv://pushkar123:ur1OV5wCtkmJk8VZ@cluster0.uh53sw1.mongodb.net/spotify-downloader"
mongoose.connect(mongoDBSrv)
    .then(() => {
        console.log("Connected to database successfully: " + mongoDBSrv)
    })
    .catch((e) => {
        console.log(e);
        console.log("Could not connect to" + mongoDBSrv);
    })

app.get("/test", (req: Request, res: Response) => {

    return res.json({ status: true, message: "API Working nicely" });
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

        const spotifyIds = new Set();
        const repeatedTracks = new Array()
        tracks = tracks.map((item: any, index: number) => {
            const { track } = item
            const spotifyId = track.uri.split(":").pop()
            if (spotifyIds.has(spotifyId)) {
                repeatedTracks.push(spotifyId)
                return null
            }
            else
                spotifyIds.add(spotifyId);
            return { spotifyId, name: track.name, previewUrl: track.preview_url, popularity: track.popularity, artists: track.artists.map((artist: any) => artist.name), album: { spotifyId: track.album.id, name: track.album.name } }
        }).filter(Boolean)

        const existingTracks = await Track.find({
            spotifyId: { $in: Array.from(spotifyIds) },
        });
        const existingDbIds = existingTracks.map((track) => track.spotifyId)
        const newTracks: any[] = tracks.filter((track: any) => !existingDbIds.includes(track.spotifyId))

        const repeatedTracksInCurrentPlaylist = [...existingTracks, ...newTracks].filter(item => {
            return repeatedTracks.includes(item.spotifyId)
        })


        const newTrackRecords = await Track.insertMany(newTracks);
        await Playlist.create({ name: playlistName, spotifyId: id, tracks: [...existingTracks, ...newTrackRecords, ...repeatedTracksInCurrentPlaylist].map(track => track._id) })
    }
    return res.json({
        status: true, data: {
            playlistName, tracks
        }
    });
})

app.get("/playlist/:id/fetch-links", async (req: Request, res: Response) => {
    const { id } = req.params
    const offset = parseInt(req.query.offset as string, 10) || 0; // Default to 0 if invalid
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const playlist = await Playlist.findOne({ spotifyId: id }).select({ tracks: { $slice: [offset * limit, limit] } })
    if (!playlist)
        return res.status(404).json("Playlist not found");

    const tracks = await Track.find({ _id: { $in: playlist.tracks } })
    const browser = await puppeteer.launch();
    const promises = tracks.map(track => getYtUrl(browser, track))
    const ytUrls: string[] = await Promise.all(promises) // a multithread approach can be used using workers_threads, but it would require eaach thread to have their own pupetter and thus require lot more resources
    await browser.close()
    return res.json({ ytUrls })
})


app.get("/playlist/:id/download", async (req: Request, res: Response) => {
    const { id } = req.params
    const offset = parseInt(req.query.offset as string, 10) || 0; // Default to 0 if invalid
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const playlist = await Playlist.findOne({ spotifyId: id }).select({ tracks: { $slice: [offset * limit, limit] } })
    if (!playlist)
        return res.status(404).json("Playlist not found");

    const tracks: any[] = await Track.find({ _id: { $in: playlist.tracks } })
    const promises = tracks.map((track: any) => ytUrlToS3(track.ytVideoLink, track.spotifyId))
    const awsKeys = await Promise.all(promises)
    return res.json({ awsKeys })
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