class WebSocketManager {
    name;
    socket;
    onErrorBackgroundListener;

    //
    //  onClose fired immediately after onError. Helps check and give meaningful error
    //
    isCannotConnect = false;

    constructor(name, listener) {
        this.name = name;
        this.onErrorBackgroundListener = listener;
    }

    connectToSocketServer() {
        //  Open socket connection
        this.socket = new WebSocket(config["socketServerUrl"]);
        this.socket.onerror = () => { this.onErrorListener(this); }
        this.socket.onclose = () => { this.onCloseListener(this); }
    }

    onErrorListener(context) {
        //  Can't connect to server
        context.onErrorBackgroundListener(tags["error"]["connectionError"]);
        this.isCannotConnect = true;
    }

    onCloseListener(context) {
        if (this.isCannotConnect) {
            this.isCannotConnect = false;
            return;
        }

        //  Connection to server closed
        context.onErrorBackgroundListener(tags["error"]["connectionClose"]);
    }
}