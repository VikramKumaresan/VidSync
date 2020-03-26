var express = require('express')
var app = express()

var config = require("./config.json");

//Server Initialization
app.listen(config["serverPort"], () => {
    console.log("Listening on port " + config["serverPort"] + "...");
})