import { Buffer } from "buffer"
import axios from "axios"

// export default async () => {
//     const clientId = process.env.SPOTIPY_CLIENT_ID;
//     const secretId = process.env.SPOTIPY_CLIENT_SECRET;
//     const combinedString = clientId + ":" + secretId;
//     const base64Encoded = Buffer.from(combinedString, 'utf-8').toString('base64');
//     const res = await axios.post("https://accounts.spotify.com/api/token/", {
//         grant_type: "client_credentials"
//     }, {
//         headers: {
//             Authorization: "Basic " + base64Encoded,
//             "Content-Type": "application/x-www-form-urlencoded"
//         }
//     })

//     const data = res.data
//     return data.access_token
// }


class TokenService {
    token = "";
    expiration= 0;

    generateToken = async () => {
        const clientId = process.env.SPOTIPY_CLIENT_ID;
        const secretId = process.env.SPOTIPY_CLIENT_SECRET;
        const combinedString = clientId + ":" + secretId;
        const base64Encoded = Buffer.from(combinedString, 'utf-8').toString('base64');
        const res = await axios.post("https://accounts.spotify.com/api/token/", {
            grant_type: "client_credentials"
        }, {
            headers: {
                Authorization: "Basic " + base64Encoded,
                "Content-Type": "application/x-www-form-urlencoded"
            }
        })
    
        const data = res.data        
        this.token = data.access_token
        this.expiration = Date.now() + data.expires_in * 1000
    }

    async getToken() {
        const currentTime = Date.now();
        const threshold = 5 * 60 * 1000; // Regenerate if expiring within 5 minutes

        if (this.expiration - currentTime < threshold) {
            console.log('Token is expiring soon, renewing...');
            await this.generateToken();
        }
        

        return this.token;
    }
}

export default new TokenService();