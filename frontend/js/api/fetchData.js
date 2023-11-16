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
    // const accessToken = localStorage.getItem('access_token');
    const accessToken = null;

    const options = {
        method,
        credentials: 'include',
        headers: {
          ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
          ...(data ? { 'Content-Type': 'application/json' } : {}),
        },
        body: data ? JSON.stringify(data) : null,
    };

    try {
        const response = await fetch(url, options);
        // Set the access token in localStorage.
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

