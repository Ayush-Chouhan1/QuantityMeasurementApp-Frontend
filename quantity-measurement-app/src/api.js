const RAW_BASE_URL = (process.env.REACT_APP_API_BASE_URL || '').replace(/\/$/, '');
const BASE_URL = process.env.NODE_ENV === 'development' ? '' : RAW_BASE_URL;

function buildUrl(path) {
  if (!BASE_URL) {
    return path;
  }

  return BASE_URL + path;
}

export async function loginApi(email, password) {
  const response = await safeFetch('/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email: email, password: password })
  });

  if (!response.ok) {
    throw new Error(await parseErrorResponse(response, 'Login failed'));
  }

  return response.json();
}

export async function registerApi(name, email, password, mobileNumber) {
  const response = await safeFetch('/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: name,
      email: email,
      password: password,
      mobileNumber: mobileNumber
    })
  });

  if (!response.ok) {
    throw new Error(await parseErrorResponse(response, 'Registration failed'));
  }

  return response.text();
}

export async function compareApi(payload) {
  return quantityRequest('/api/v1/quantities/compare', payload);
}

export async function convertApi(payload) {
  return quantityRequest('/api/v1/quantities/convert', payload);
}

export async function addApi(payload) {
  return quantityRequest('/api/v1/quantities/add', payload);
}

export async function subtractApi(payload) {
  return quantityRequest('/api/v1/quantities/subtract', payload);
}

export async function multiplyApi(payload) {
  return quantityRequest('/api/v1/quantities/multiply', payload);
}

export async function divideApi(payload) {
  return quantityRequest('/api/v1/quantities/divide', payload);
}

export async function getHistoryApi() {
  const token = getValidTokenOrThrow();
  const response = await safeFetch('/api/v1/quantities/history/operation/compare', {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + token
    }
  });

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('qm_token');
      localStorage.removeItem('qm_user');
      throw new Error('Session expired or unauthorized. Please log in again.');
    }
    throw new Error(await parseErrorResponse(response, 'Failed to fetch history'));
  }

  return response.json();
}

async function quantityRequest(endpoint, payload) {
  const token = getValidTokenOrThrow();
  const response = await safeFetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('qm_token');
      localStorage.removeItem('qm_user');
      throw new Error('Session expired or unauthorized. Please log in again.');
    }
    throw new Error(await parseErrorResponse(response, 'Request failed'));
  }

  return response.json();
}

async function safeFetch(path, options) {
  try {
    return await fetch(buildUrl(path), options);
  } catch (e) {
    throw new Error('Cannot reach backend. Ensure API Gateway is running on http://localhost:8080, then restart frontend.');
  }
}

async function parseErrorResponse(response, fallbackMessage) {
  const rawBody = await response.text();

  if (!rawBody) {
    return fallbackMessage;
  }

  try {
    const parsed = JSON.parse(rawBody);
    if (parsed.message) {
      return parsed.message;
    }
    if (parsed.error) {
      return parsed.error;
    }
  } catch (e) {
    return rawBody;
  }

  return fallbackMessage;
}

function getValidTokenOrThrow() {
  const token = localStorage.getItem('qm_token');
  const invalid = !token || token === 'undefined' || token.split('.').length !== 3;
  if (invalid) {
    throw new Error('Session token is invalid. Please log in again.');
  }
  return token;
}
