/*
 * 
 *  Class to maintian global state. The main background script lives throughout the lifetime of the browser.
 *  Hence this class preserves messages (Errors and successful connection) if the user misses to see it on the 
 *  message box or browser action pop up.
 * 
 *  Also prevents input if in a syncing state => Maintains state.
 *
 *  Refreshing state brings it back to the start state.
 * 
*/

class StateManager {
    //      Instance Attributes
    //  isError;
    //  message;

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
        switch (tag) {
            case tags["messages"]["connectingServer"]:
                this.isError = false;
                this.message = tag;
                break;

            case tags["webSocketMessages"]["connectionOpen"]:
                this.isError = false;
                this.message = tags["messages"]["connectedServer"];
                break;

            case tags["error"]["connectionClose"]:
                this.isError = true;
                this.message = tags["messages"]["connectionClosedServer"];
                break;

            case tags["error"]["connectionError"]:
                this.isError = true;
                this.message = tags["messages"]["cannotConnectServer"];
                break;

            case tags["messages"]["updationServerFailed"]:
                this.isError = true;
                this.message = tags["messages"]["updationServerFailed"] + extraData;
                break;
        }

    }

    refreshState() {
        this.isError = false;
        this.message = "";
    }
}