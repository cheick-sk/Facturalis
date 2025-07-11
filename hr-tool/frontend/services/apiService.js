const API_GATEWAY_BASE_URL = 'http://localhost:4000/api/v1'; // Assuming API Gateway is on port 4000

async function request(endpoint, options = {}) {
  const url = `${API_GATEWAY_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  if (options.body) {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      const errorData = await response.text(); // Try to get more error info
      console.error(`API Error ${response.status} on ${url}: ${errorData}`);
      throw new Error(`API request failed with status ${response.status}: ${errorData}`);
    }
    if (response.status === 204) { // No Content
        return null;
    }
    return response.json();
  } catch (error) {
    console.error(`Request failed for ${url}:`, error);
    throw error; // Re-throw to be caught by calling function
  }
}

export const employeeService = {
  getAll: () => request('/employees'),
  getById: (id) => request(`/employees/${id}`),
  create: (employeeData) => request('/employees', { method: 'POST', body: employeeData }),
  update: (id, employeeData) => request(`/employees/${id}`, { method: 'PATCH', body: employeeData }),
  delete: (id) => request(`/employees/${id}`, { method: 'DELETE' }),
};

// We can add other services here, e.g.:
// export const departmentService = { ... };
