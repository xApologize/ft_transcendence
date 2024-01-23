// Pass an optional 'filter' argument to the fonction ? for ex: filter the 'admin' field.
// Temporary? to change?
export const assembler = async (result) => {
    let contentType = result.headers.get('Content-Type');
    if (contentType && contentType.includes('application/json')) {
        let userObject = await result.json();
        return userObject.users || userObject;
    } else {
        let response = await result.text();
        return response;
    }
};
