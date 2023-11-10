  
const performFetch = async (url, method, data = null) => {
    const headers = {
      'Content-Type': 'application/json',
    };
  
    const options = {
      method,
      headers,
      body: data ? JSON.stringify(data) : null,
    };
  
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
};

const buildApiUrl = (path, parameter = null) => {
    const params = new URLSearchParams();
    if (parameter) {
        params.append('nickname', parameter);
    }
    // Known issue: fetching port 52021 does not work when not at school.
    const baseUrl = "https://localhost:52021/api/";
    const queryString = parameter ? `?${params.toString()}` : '';
    return `${baseUrl}${path}${queryString}`;
};

// Combine the functions for a specific use case (fetching user)
export const fetchUser = async (method, parameter = null, data = null) => {
    const path = 'user/';
    let result = null;

    const url = buildApiUrl(path, parameter);
    console.log(url);
    try {
        result = await performFetch(url, method, data);
        console.log(result);
    } catch (error) {
        console.error('Error:', error.message);
    }
    return result;
    // AssembleUser = AssemblyUser(result)
    // return AssembleUser
};
  