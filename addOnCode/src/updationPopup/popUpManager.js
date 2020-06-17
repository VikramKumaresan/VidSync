export default class PopUpManager {
    //  Instance Variables
    //      form
    //      errorArea
    //      nameTextField
    //      onClickCallback

    constructor(onClickCallback) {
        this.onClickCallback = onClickCallback;
        this.form = document.getElementById("form");
        this.errorArea = document.getElementById("errorMessage");
        this.nameTextField = document.getElementById("name");
    }

    attachUpdateButtonListener() {
        document.getElementById("updateButton").addEventListener("click", this.onClickCallback);
    }

    showMessage(message) {
        this.errorArea.textContent = message;
        this.errorArea.style.display = "block";
        this.form.style.display = "none";
    }

    getName() { return this.nameTextField.value; }
}