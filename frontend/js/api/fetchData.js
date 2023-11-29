import { ConstantColorFactor } from "three";
import { navigateTo } from "../router.js";
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
};

const redirectToHome = () => {
    sessionStorage.clear();
    navigateTo('/login');
};

const createOptions = (method, data) => {
    var accessTokenLive = sessionStorage.getItem('jwt');
    var options = {
        method,
        credentials: 'include',
        headers: {
          ...(accessTokenLive ? { 'jwt': `${accessTokenLive}` } : {}),
          ...(data ? { 'Content-Type': 'application/json' } : {}),
        },
        body: data ? JSON.stringify(data) : null,
    };
    return options
};

export const setNewToken = (response) => {
    const access_token = response.headers.get('jwt')
    if (access_token) {
        sessionStorage.setItem('jwt', access_token);
        return access_token
    }
    return null
}

const performFetch = async (url, method, data = null) => {
    var options = createOptions(method, data)
    try {
        var response = await fetch(url, options);
        if (response.status == 401) {
            // console.log('401')
            redirectToHome()
            return null
        }
        const jwt_token = setNewToken(response)
        if (jwt_token) {
            console.log("New access Token!")
            const isFirstToken = response.headers.get('new')
            if (!isFirstToken) {
                console.log("second fetch!")
                const access_token = response.headers.get('jwt')
                options.headers.jwt = access_token;
                response = await fetch(url, options)
            }
        }
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
            if (typeof parameterValue === 'object') {
                for (const value of Object.values(parameterValue)) {
                    params.append(parameterName, value);
                }
            }
            else if (parameterValue) {
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
    console.log(url)
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

export const fetchMe = async(method, data = null) => {
    const path = 'user/me/'
    const url = buildApiUrl(path);
    try {
        var result = await performFetch(url, method, data);
    } catch (error) {
        console.log("Error: " + error);
    }
    return result;
}