export default (stateObject, messageToAppend) => {
    return {
        "isError": stateObject.isError,
        "message": stateObject.message + messageToAppend
    }
}