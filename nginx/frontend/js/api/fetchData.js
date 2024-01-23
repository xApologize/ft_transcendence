import { navigateTo } from "../router.js";
import { closeAllModals } from "../utils/utilityFunctions.js";
import interactiveSocket from '../pages/home/socket.js'
import { handleRoute } from "../router.js";
import { assembler } from "./assembler.js";
import { displayLoginError } from "../pages/login/login.js";

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

export const redirectToHome = (response) => {
    closeAllModals();
    interactiveSocket.closeSocket()
    sessionStorage.clear();
    navigateTo('/')
    setTimeout(async() => {
        const errorData = await assembler(response);
        if (errorData.error) {
            displayLoginError(errorData);
        } else {
            displayLoginError({'error': errorData})
        }
    }, 500);
    return null
};

const createOptions = (method, data) => {
    const accessTokenLive = sessionStorage.getItem('jwt');
    const isFormData = data instanceof FormData;
    const options = {
        method,
        credentials: 'include',
        headers: {
            ...(accessTokenLive ? { 'jwt': `${accessTokenLive}` } : {}),
            ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
        },
        body: isFormData ? data : (data ? JSON.stringify(data) : null),
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
    // console.log(url) JB IS HAPPY
    const options = createOptions(method, data);
    try {
        let response = await fetch(url, options);
        if (response.status === 401) {
            return redirectToHome(response);
        }
        const jwt_token = setNewToken(response);
        if (jwt_token && !response.headers.get('new')) {
            options.headers.jwt = response.headers.get('jwt');
            response = await fetch(url, options);
        }
        return response;
    } catch (error) {
        console.error("Error fetching: " + url, error);
        return null;
    }
};

const buildParams = (parameters) => {
    const params = new URLSearchParams();
    if (parameters) {
        for (const [parameterName, parameterValue] of Object.entries(parameters)) {
            if (typeof parameterValue === 'object' && parameterValue !== null) {
                for (const value of Object.values(parameterValue)) {
                    params.append(parameterName, value);
                }
            } else if (parameterValue !== null && parameterValue !== undefined) {
                params.append(parameterName, parameterValue);
            }
        }
    }
    return params.toString();
};

const buildApiUrl = (path, parameters = null) => {
    const baseUrl = "/api/";
    const paramString = buildParams(parameters);
    const queryString = paramString ? `?${paramString}` : '';
    return `${baseUrl}${path}${queryString}`;
};

export const fetchApi = async (method, path, parameters = null, data = null) => {
    const url = buildApiUrl(path, parameters);
    return await performFetch(url, method, data);
};

// Fetch other user by nickname or by status/Create user/update user by nickname.
export const fetchUser = async (method, parameters = null, data = null) => {
    return fetchApi(method, 'user/', parameters, data);
};

// Fetch login/logout/check if token
export const fetchAuth = async (method, apiPath, data = null, parameters = null) => {
    return fetchApi(method, `auth/${apiPath}`, parameters, data);
};

// Fetch own information (username, email, avatar, status, match history)
export const fetchMe = async (method, data = null) => {
    return fetchApi(method, 'user/me/', null, data);
};

// Get friend list.
export const fetchFriend = async (method, apiPath = '', data = null) => {
    return fetchApi(method, `user/friends/${apiPath}`, null, data);
};

// Upload avatar
export const fetchUpload = async (method, data = null) => {
    return fetchApi(method, 'user/upload/', null, data);
};

// Change friend status (add, remove, etc.)
export const fetchFriendChange = async (method, parameters = null, apiPath = '') => {
    return fetchApi(method, `friend/${apiPath}`, parameters);
};

// Fetch match history
export const fetchMatchHistory = async (method, data = null, parameters = null, apiPath = '') => {
    return fetchApi(method, `match/${apiPath}`, parameters, data);
};

export const fetchIsToken = async () => {
    return fetchApi('GET', 'auth/token/');
}

export const fetchGameInvite = async (method, data = null) => {
    return fetchApi(method, 'game_invite/', null, data);
}

export const fetchAllLobbies = async (method) => {
    return fetchApi(method, 'lobby/', null, null)
}

export const fetchMyLobby = async (method) => {
    return fetchApi(method, `lobby/specific/`, null, null)
}

export const fetchPlayerNbr = async (method, owner_id) => {
    return fetchApi(method, `lobby/players/${owner_id}`, null, null)
}

export const fetchInitLoginPage = () => {
    return fetchApi('GET', 'initloginpage/');
}
