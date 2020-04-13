class WebSocketManager {
    name;
    videoSrc;
    socket;
    onMessageBackgroundListener;

    //
    //  onClose fired immediately after onError. Helps check and give meaningful error
    //
    isCannotConnect = false;

    constructor(name, src, listener) {
        this.name = name;
        this.videoSrc = src;
        this.onMessageBackgroundListener = listener;
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
                context.onMessageBackgroundListener(tags["socketServerTags"]["pause"], data["name"]);
                break;

            case tags["socketServerTags"]["play"]:
                context.onMessageBackgroundListener(tags["socketServerTags"]["play"], data["name"]);
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
                context.onMessageBackgroundListener(tags["socketServerTags"]["getTime"]);
                break;

            case tags["socketServerTags"]["getTimeAutoSync"]:
                context.onMessageBackgroundListener(tags["socketServerTags"]["getTimeAutoSync"]);
                break;

            case tags["socketServerTags"]["syncAll"]:
                context.onMessageBackgroundListener(tags["socketServerTags"]["syncAll"], data["message"]);
                break;

            case tags["socketServerTags"]["syncAllNewJoin"]:
                context.onMessageBackgroundListener(tags["socketServerTags"]["syncAllNewJoin"], data["message"]);
                break;
        }
    }

    parseServerMessage(message) {
        //  Server message present within 'data' object (Web Specification)
        return JSON.parse(message.data);
    }
}