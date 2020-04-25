/*
 * 
 *  Class to connect, disconnect and emit messages to the websocket server.
 *
 *  New webSocketManager object required for each sync as name and video source are stored in object. They can
 *  change per sync
 * 
*/

class WebSocketManager {
    //      Instance Attributes
    //  name;
    //  videoSrc;
    //  socket;
    //  onMessageBackgroundListener;

    //  isCannotConnect

    constructor(name, src, listener) {
        this.name = name;
        this.videoSrc = src;
        this.onMessageBackgroundListener = listener;
        this.socket = null;

        //  onClose fired immediately after onError. Helps check and give meaningful error
        this.isCannotConnect = false;
    }

    connectToSocketServer() {
        //  Open socket connection
        this.socket = new WebSocket(config["socketServerUrl"]);

        //  Attach listeners
        this.socket.onerror = () => { this.onErrorListener(this); }
        this.socket.onclose = () => { this.onCloseListener(this); }
        this.socket.onopen = () => { this.onOpenListener(this); }
        this.socket.onmessage = (message) => { this.onMessageListener(this, this.parseServerMessage(message)) };

    }

    sendMessageToServer(message) {
        this.socket.send(JSON.stringify(message));
    }

    disconnectFromSocketServer() {
        this.socket.close();
    }

    //
    //  Listeners
    //
    onErrorListener(context) {
        //  Can't connect to server
        context.onMessageBackgroundListener(tags["error"]["connectionError"]);
        this.isCannotConnect = true;
    }
    onCloseListener(context) {
        if (this.isCannotConnect) {
            this.isCannotConnect = false;
            return;
        }

        //  Connection to server closed
        context.onMessageBackgroundListener(tags["error"]["connectionClose"]);
    }
    onOpenListener(context) {
        //  Send participant details
        const message = {
            "tag": tags["socketServerTags"]["update"],
            "name": this.name,
            "videoSrc": this.videoSrc
        }
        this.sendMessageToServer(message);

        context.onMessageBackgroundListener(tags["webSocketMessages"]["connectionOpen"]);
    }
    onMessageListener(context, data) {
        switch (data["tag"]) {

            //  Check if server updation failed
            case tags["socketServerTags"]["update"]:
                if (!data["message"]["isUpdate"]) {
                    context.onMessageBackgroundListener(tags["messages"]["updationServerFailed"], data["message"]["videoSrc"]);
                }
                break;

            case tags["socketServerTags"]["pause"]:
            case tags["socketServerTags"]["play"]:
                context.onMessageBackgroundListener(data["tag"], data["name"]);
                break;

            case tags["socketServerTags"]["seek"]:
                context.onMessageBackgroundListener(tags["socketServerTags"]["seek"],
                    {
                        "name": data["name"],
                        "seekTo": data["message"]
                    }
                );
                break;

            case tags["socketServerTags"]["getTime"]:
            case tags["socketServerTags"]["getTimeAutoSync"]:
            case tags["socketServerTags"]["updateTime"]:
                context.onMessageBackgroundListener(data["tag"]);
                break;


            case tags["socketServerTags"]["syncAll"]:
            case tags["socketServerTags"]["syncAllNewJoin"]:
                context.onMessageBackgroundListener(data["tag"], data["message"]);
                break;

        }
    }

    //
    //  Utility functions
    //
    parseServerMessage(message) {
        //  Server message present within 'data' object (Web Specification)
        return JSON.parse(message.data);
    }
}