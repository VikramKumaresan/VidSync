class WebSocketManager {
    name;
    socket;
    onErrorBackgroundListener;

    constructor(name, listener) {
        this.name = name;
        this.onErrorBackgroundListener = listener;
    }

    connectToSocketServer() {
        //  Open socket connection
        this.socket = new WebSocket(config["socketServerUrl"]);
        this.socket.onerror = () => { this.onErrorListener(this); }
    }

    onErrorListener(context) {
        //  Can't connect to server
        context.onErrorBackgroundListener("connectionError");
    }
}