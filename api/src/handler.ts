import app from "./index"
import serverless from "serverless-http"
module.exports.hello = serverless(app)
