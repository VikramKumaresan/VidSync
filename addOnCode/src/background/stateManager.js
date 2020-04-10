//  
//  Class to preserve messages if browser action popup not present
//

class StateManager {
    isError;
    message;

    constructor() {
        this.refreshState();
    }

    getState() {
        const returnIsError = this.isError;
        const returnMessage = this.message;

        //  Refresh state once error has been displayed [This method is called before displaying]
        if (this.isError) {
            this.refreshState();
        }

        return ({
            "isError": returnIsError,
            "stateMessage": returnMessage
        });
    }

    setState(tag, extraData = "") {

        //  All possible states
        if (tag == tags["messages"]["connectingServer"]) {
            this.isError = false;
            this.message = tag;
        }
        else if (tag == tags["webSocketMessages"]["connectionOpen"]) {
            this.isError = false;
            this.message = tags["messages"]["connectedServer"];
        }
        else if (tag == tags["error"]["connectionClose"]) {
            this.isError = true;
            this.message = tags["messages"]["connectionClosedServer"];
        }
        else if (tag == tags["error"]["connectionError"]) {
            this.isError = true;
            this.message = tags["messages"]["cannotConnectServer"];
        }
        else if (tag == tags["messages"]["updationServerFailed"]) {
            this.isError = true;
            this.message = tags["messages"]["updationServerFailed"] + extraData;
        }
    }

    refreshState() {
        this.isError = false;
        this.message = "";
    }
}