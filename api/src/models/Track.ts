import mongoose, { Schema, model } from "mongoose";

const TrackSchema = new Schema<any>({
    spotifyId: {
        type: String,
        required: true,
        unique:  true
    },
    name: {
        type: String,
        required: true
    },
    artists: [String],
    previewUrl: String,
    album: {
        spotifyId: String,
        name: String
    },
    ytVideoLink: String,
    awsKey: String,
    errorsReported: {
        type: Number,
        default: 0
    },
    popularity: Number,
    downloads: {
        type: Number,
        default: 0
    }
})

export default model('Track', TrackSchema)