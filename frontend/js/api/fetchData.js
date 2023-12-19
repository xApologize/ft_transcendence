import { navigateTo } from '../router.js';
import { closeAllModals } from '../utils/utilityFunctions.js';

// Load frontend page.
export const loadHTMLPage = async (filePath) => {
    try {
        const response = await fetch(filePath);
        const html = await response.text();
        let container = document.getElementById('contentContainer');
        container.innerHTML = '';
        container.innerHTML = html;
    } catch (error) {
        console.error(`Error fetching page: ${filePath} -> `, error);
    }
};

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
    closeAllModals();
    sessionStorage.clear();
    navigateTo('/');
    return null;
};

const createOptions = (method, data) => {
    const accessTokenLive = sessionStorage.getItem('jwt');
    const isFormData = data instanceof FormData;
    const options = {
        method,
        credentials: 'include',
        headers: {
            ...(accessTokenLive ? { jwt: `${accessTokenLive}` } : {}),
            ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
        },
        body: isFormData ? data : data ? JSON.stringify(data) : null,
    };
    return options;
};

export const setNewToken = (response) => {
    const access_token = response.headers.get('jwt');
    if (access_token) {
        sessionStorage.setItem('jwt', access_token);
        return access_token;
    }
    return null;
};

const performFetch = async (url, method, data = null) => {
    const options = createOptions(method, data);
    try {
        console.log(url);
        // var bc breaking without it
        const response = await fetch(url, options);
        if (response.status == 401) {
            return redirectToHome();
        }
        const jwt_token = setNewToken(response);
        if (jwt_token) {
            const isFirstToken = response.headers.get('new');
            if (!isFirstToken) {
                const access_token = response.headers.get('jwt');
                options.headers.jwt = access_token;
                response = await fetch(url, options);
            }
        }
        return response;
    } catch (error) {
        console.log('Error fetching: ' + url);
    }
    return null;
};

const buildApiUrl = (path, parameter = null) => {
    const baseUrl = '/api/';
    const queryString = parameter ? `?${parameter.toString()}` : '';
    return `${baseUrl}${path}${queryString}`;
};

const buildParams = (parameters) => {
    const params = new URLSearchParams();
    if (parameters) {
        for (const [parameterName, parameterValue] of Object.entries(
            parameters
        )) {
            if (typeof parameterValue === 'object') {
                for (const value of Object.values(parameterValue)) {
                    params.append(parameterName, value);
                }
            } else if (parameterValue) {
                params.append(parameterName, parameterValue);
            }
        }
    }
    return params.toString() ? params : null;
};

// Fetch other user by nickname or by status/Create user/update user by nickanme/.
export const fetchUser = async (method, parameters = null, data = null) => {
    const path = 'user/';
    const params = buildParams(parameters);
    const url = buildApiUrl(path, params);
    let result = await performFetch(url, method, data);
    return result;
};

// fetch login/logout/check if token
export const fetchAuth = async (method, apiPath, data = null) => {
    const path = 'auth/' + apiPath;
    const url = buildApiUrl(path);
    let result = await performFetch(url, method, data);
    return result;
};

// Fetch own information (username, email, avatar, status, match history)
export const fetchMe = async (method, data = null) => {
    const path = 'user/me/';
    const url = buildApiUrl(path);
    let result = await performFetch(url, method, data);
    return result;
};

// Get friend, remove and add friend,
export const fetchFriend = async (method, apiPath = '', data = null) => {
    const path = 'user/friends/' + apiPath;
    const url = buildApiUrl(path);
    let result = await performFetch(url, method, data);
    return result;
};

// Upload avatar
export const fetchUpload = async (method, data = null) => {
    const path = 'user/upload/';
    const url = buildApiUrl(path);
    let result = await performFetch(url, method, data);
    return result;
};
