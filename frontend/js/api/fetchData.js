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
export const loadHTMLComponent = async (componentID, filePath) => {
    try {
        const response = await fetch(filePath);
        const html = await response.text();
        document.getElementById(componentID).innerHTML = html
    } catch (error) {
        console.error(`Error fetching component: ${filePath} -> `, error);
    }
}

const performFetch = async (url, method, data = null) => {
    const headers = {
      'Content-Type': 'application/json',
    };
  
    const options = {
      method,
      headers: data ? headers : {},
      body: data ? JSON.stringify(data) : null,
    };
  
    try {
        const response = await fetch(url, options);
        return response
    } catch (error) {
        return "Error fetching: " + url
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

