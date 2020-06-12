export default {
    //  PopUp <--> Background Script
    "popUpBackground": {
        "update": 0,
        "getState": 5
    },
    //  PopUp <--> Content Script
    "popUpContent": {
        "videoTag": 1,
        "reloadPopUp": 4
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
    //  When changes to tab occur
    "tabMonitorTags": {
        "tabClosed": "tabClosed",
        "tabUrlChange": "tabUrlChange"
    },
    //  When sending to server
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
        "connectingServer": "Connecting to server...",
        "cannotConnectServer": "Cannot connect to server!",
        "connectionClosedServer": "Connection closed from server!",
        "updationServerFailed": "Sync failed! Others are watching ",
        "connectedServer": "Connected and syncing!",
        "syncAll": "Server sync",
        "pause": "Pause - ",
        "play": "Play - ",
        "seek": "Seek - "
    }
}