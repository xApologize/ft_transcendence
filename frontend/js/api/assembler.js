
// Pass an optional 'filter' argument to the fonction ? for ex: filter the 'admin' field.
// Temporary? to change?
export const assembleUser = async (result) => {
    let contentType = result.headers.get('Content-Type');
    if (contentType && contentType.includes('application/json')) {
        let userObject = await result.json()
        // console.log(userObject)
        return userObject.users
    } else {
        let response = await result.text()
        // console.log(response)
        return response;
      }
}