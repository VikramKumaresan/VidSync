function createResponse(tag, data) {
    response = {
        tag: tag,
        message: data
    };
    return JSON.stringify(response);
}

export default createResponse;