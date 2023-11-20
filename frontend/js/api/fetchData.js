import { assembleUser } from "./assembler.js";

// Load frontend page.
export const loadHTMLPage = async (filePath) => {
    try {
        const response = await fetch(filePath);
        const html = await response.text();
        document.getElementById('contentContainer').innerHTML = html;
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
    // const accessToken = "Here_is_my_token";
    var accessTokenLive = sessionStorage.getItem('access');
    const options = {
        method,
        credentials: 'include',
        headers: {
          ...(accessTokenLive ? { 'access': `${accessTokenLive}` } : {}),
          ...(data ? { 'Content-Type': 'application/json' } : {}),
        },
        body: data ? JSON.stringify(data) : null,
    };
    try {
        const response = await fetch(url, options);
        var return_access_token = response.headers.get('access')
        if (return_access_token)
            sessionStorage.setItem('access', return_access_token);
        console.log("return access Access:", return_access_token)
        console.log(sessionStorage.getItem('access'))
        // Refresh token will be check if reponse status is 401
        return response;
    } catch (error) {
        return "Error fetching: " + url;
    }
};

const buildApiUrl = (path, parameter = null) => {
    // Known issue: fetching port 52021 does not work when not at school.
    const baseUrl = "/api/";
    const queryString = parameter ? `?${parameter.toString()}` : '';
    return `${baseUrl}${path}${queryString}`;
};

const buildParams = (parameters) => {
    const params = new URLSearchParams();
    for (const [parameterName, parameterValue] of Object.entries(parameters)) {
        if (parameterValue) {
            params.append(parameterName, parameterValue);
        }
    }
    return params.toString() ? params : null;
};

export const fetchUser = async (method, parameter = null, data = null) => {
    const path = 'user/';
    const params = buildParams({"nickname": parameter});
    const url = buildApiUrl(path, params);
    try {
        var result = await performFetch(url, method, data);
    } catch (error) {
        console.log("Error: " + error)
    }
     return result
};

