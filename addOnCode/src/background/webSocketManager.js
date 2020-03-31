class WebSocketManager {
    name;
    socket;
    onMessageBackgroundListener;

    //
    //  onClose fired immediately after onError. Helps check and give meaningful error
    //
    isCannotConnect = false;

    constructor(name, listener) {
        this.name = name;
        this.onMessageBackgroundListener = listener;
    }

    connectToSocketServer() {
        //  Open socket connection
        this.socket = new WebSocket(config["socketServerUrl"]);
        this.socket.onerror = () => { this.onErrorListener(this); }
        this.socket.onclose = () => { this.onCloseListener(this); }
        this.socket.onopen = () => { this.onOpenListener(this); }

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
        //  Connection established to server
        context.onMessageBackgroundListener(tags["webSocketMessages"]["connectionOpen"]);
    }
}