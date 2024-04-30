import mongoose, { Document, Schema, model } from "mongoose";

interface IPlaylist extends Document{
    spotifyId: string;
    name: string;
    tracks:any[];
    isDownloadStarted: boolean;
    isDownloadCompleted: boolean;
    downloads: number;
    accessed: number;
}

const PlaylistSchema = new Schema<IPlaylist>({
    spotifyId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    tracks: [{
        type: Schema.Types.ObjectId,
        ref: 'Track'
    }],
    isDownloadStarted: Boolean,
    isDownloadCompleted: Boolean,
    downloads: {
        type: Number,
        default: 0
    },
    accessed: {
        type: Number,
        default: 0
    }
}, { timestamps: true })

export default model('Playlist', PlaylistSchema);