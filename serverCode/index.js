//
//  Imports
//

import express from 'express';
const app = express()
import { Server } from 'ws';
const wss = new Server({ app })

import config from "./config.json";

import roomClass from "./src/room";
const room = new roomClass(wss);

//
//  WebSocket Events
// 

//
//  WebServer Routes
//

//Server Initialization
app.listen(config["serverPort"], () => {
    console.log("Listening on port " + config["serverPort"] + "...");
})