tags = {
    //  PopUp <--> Background Script
    "popUpBackground": {
        "update": 0
    },
    //  PopUp <--> Content Script
    "popUpContent": {
        "videoTag": 1
    },
    //  Content <--> Background
    "contentBackground": {
        "windowClose": 2
    },
    "error": {
        "connectionError": -1,
        "connectionClose": -2
    },
    "webSocketMessages": {
        "connectionOpen": 3
    },
    //  When sending to server
    "socketServerTags": {
        "update": "update",
        "seek": "seek",
        "pause": "pause",
        "play": "play"
    },
    "messages": {
        "noCapturableTags": "No capturable video sources available!",
        "notReadyState": "Video is still loading. Try again after a bit!",
        "noAutoPlay": "Auto play disabled. Pls allow auto play!",
        "connectingServer": "Connecting to server...",
        "cannotConnectServer": "Cannot connect to server!",
        "connectionClosedServer": "Connection closed from server!",
        "connectedServer": "Connected and syncing!"
    }
}