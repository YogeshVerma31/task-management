exports.responseMessage = (status, message, data) => {
    return {
        status: status,
        message: message,
        data: data ?? null
    }
}