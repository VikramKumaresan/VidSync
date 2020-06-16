export default {
    //  PopUp <--> Background Script
    "popUpBackground": {
        "update": 0,
        "getState": 1
    },
    //  PopUp <--> Content Script
    "popUpContent": {
        "videoTag": 2,
        "reloadPopUp": 3
    },
    //  Content <--> Background
    "contentBackground": {
        "windowClose": 4
    },
    "socketServerTags": {
        "update": "update",
        "seek": "seek",
        "pause": "pause",
        "play": "play",
        "syncAll": "syncAll",   //  Triggered by auto sync
        "syncAllNewJoin": "syncAllNewJoin", //  Triggered when new join. Forces all to pause
        "getTime": "getTime",   //  For syncAllNewJoin
        "getTimeAutoSync": "getTimeAutoSync",  //   For AutoSync
        "updateTime": "updateTime"
    },
    "messages": {
        "noCapturableTags": "No capturable video sources available!",
        "notReadyState": "Video is still loading. Try again after a bit!",
        "noAutoPlay": "Auto play disabled. Pls allow auto play!",
        "syncAll": "Server sync",
        "pause": "Pause - ",
        "play": "Play - ",
        "seek": "Seek - "
    },
    "states": {
        "stateTag": "stateTag",
        "connectingServer": {
            "message": "Connecting to server...",
            "isError": false
        },
        "connectionOpen": {
            "message": "Connected and syncing!",
            "isError": false
        },
        "connectionClose": {
            "message": "Connection closed from server!",
            "isError": true
        },
        "connectionError": {
            "message": "Cannot connect to server!",
            "isError": true
        },
        "updationServerFailed": {
            "message": "Sync failed! Others are watching ",
            "isError": true
        }
    }
}