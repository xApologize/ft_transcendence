import { assembleUser } from "./assembler.js";

// Load frontend page.
export const loadHTMLPage = async (filePath) => {
    try {
        const response = await fetch(filePath);
        const html = await response.text();
        let container = document.getElementById('contentContainer')
        container.innerHTML = ''
        container.innerHTML = html
    } catch (error) {
        console.error(`Error fetching page: ${filePath} -> `, error);
    }
}

// Load frontend components
export const loadHTMLComponent = async (filePath) => {
    try {
        const response = await fetch(filePath);
        const html = await response.text();
        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = html;
        return tempContainer.children.length === 1
            ? tempContainer.children[0]
            : tempContainer.children;
    } catch (error) {
        console.error(`Error fetching component: ${filePath} -> `, error);
    }
}

const performFetch = async (url, method, data = null) => {
    var accessTokenLive = sessionStorage.getItem('jwt');
    const options = {
        method,
        credentials: 'include',
        headers: {
          ...(accessTokenLive ? { 'jwt': `${accessTokenLive}` } : {}),
          ...(data ? { 'Content-Type': 'application/json' } : {}),
        },
        body: data ? JSON.stringify(data) : null,
    };
    try {
        const response = await fetch(url, options);
        var return_access_token = response.headers.get('jwt')
        // console.log("Token", return_access_token)
        if (return_access_token)
            sessionStorage.setItem('jwt', return_access_token);
        // console.log("return access Access:", return_access_token)
        // console.log(sessionStorage.getItem('jwt'))
        // Refresh token will be check if reponse status is 401
        return response;
    } catch (error) {
        return "Error fetching: " + url;
    }
};

const buildApiUrl = (path, parameter = null) => {
    const baseUrl = "/api/";
    const queryString = parameter ? `?${parameter.toString()}` : '';
    return `${baseUrl}${path}${queryString}`;
};

const buildParams = (parameters) => {
    const params = new URLSearchParams();
    if (parameters) {
        for (const [parameterName, parameterValue] of Object.entries(parameters)) {
            if (parameterValue) {
                params.append(parameterName, parameterValue);
            }
        }
    }
    return params.toString() ? params : null;
};

export const fetchUser = async (method, parameters = null, data = null) => {
    const path = 'user/';
    const params = buildParams(parameters);
    const url = buildApiUrl(path, params);
    try {
        var result = await performFetch(url, method, data);
    } catch (error) {
        console.log("Error: " + error);
    }
    return result;
};

export const fetchAuth = async (method, apiPath, data = null) => {
    const path = 'auth/' + apiPath
    const url = buildApiUrl(path)
    try {
        var result = await performFetch(url, method, data);
    } catch (error) {
        console.log("Error: " + error);
    }
    return result;
};