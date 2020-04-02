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
        //  Check if server updation failed
        if (data["tag"] == tags["socketServerTags"]["update"]) {
            if (!data["message"]["isUpdate"]) {
                context.onMessageBackgroundListener(tags["messages"]["updationServerFailed"], data["message"]["videoSrc"]);
            }
        }
        else if (data["tag"] == tags["socketServerTags"]["pause"]) {
            context.onMessageBackgroundListener(tags["socketServerTags"]["pause"], data["name"]);
        }
        else if (data["tag"] == tags["socketServerTags"]["play"]) {
            context.onMessageBackgroundListener(tags["socketServerTags"]["play"], data["name"]);
        }
        else if (data["tag"] == tags["socketServerTags"]["seek"]) {
            context.onMessageBackgroundListener(tags["socketServerTags"]["seek"],
                {
                    "name": data["name"],
                    "seekTo": data["message"]
                }
            );
        }
    }

    parseServerMessage(message) {
        //  Server message present within 'data' object (Web Specification)
        return JSON.parse(message.data);
    }
}