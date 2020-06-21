export default class MessageBox {
    //  Instance Variables
    //      messageBox
    //      messageTag
    //      messageBoxTimeout

    constructor() {
        this.messageBox = this.createAndInjectMessageBox();
        this.messageTag = this.messageBox.firstElementChild;
        this.messageBoxTimeout = window.setTimeout(() => { this.messageBox.style.opacity = 0; }, 5000);
    }

    createAndInjectMessageBox() {
        const messageBox = document.createElement("div");
        messageBox.id = "messageBox";
        messageBox.style = "background-color: #e0e094; width: 15vw; display: inline-block; position: fixed; bottom: 2vh;  right: 2vw; overflow: auto; border-radius: 0.25em; transition: opacity 0.5s ease-in-out; opacity: 0; z-index:9999";
        messageBox.innerHTML = "<p id='message' style='margin:1em; font-size: 15px;'>Hello!</p>";
        document.body.appendChild(messageBox);

        return messageBox;
    }

    displayMessage(message, color) {
        window.clearInterval(this.messageBoxTimeout);

        this.messageTag.textContent = message;
        this.messageBox.style.backgroundColor = color;
        this.messageBox.style.opacity = 1;

        this.messageBoxTimeout = window.setTimeout(() => { this.messageBox.style.opacity = 0; }, 5000);
    }

    getColors() {
        return {
            "successColor": '#64e986',
            "failureColor": '#ff726f',
            "infoColor": '#e0e094'
        }
    }
}