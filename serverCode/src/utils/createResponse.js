function createResponse(tag, data, participantName = "") {
    response = {
        tag: tag,
        message: data,
        name: participantName
    };
    return JSON.stringify(response);
}

module.exports = createResponse;