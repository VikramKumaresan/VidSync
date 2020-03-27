function createResponse(tag, data) {
    response = {
        tag: tag,
        message: data
    };
    return JSON.stringify(response);
}

module.exports = createResponse;