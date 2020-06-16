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

import tags from '../tags';

export default class StateManager {
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

    setState(stateObj) {
        this.isError = stateObj.isError;
        this.message = stateObj.message;
    }

    refreshState() {
        this.isError = false;
        this.message = "";
    }
}