const API_GATEWAY_BASE_URL = 'http://localhost:4000/api/v1'; // Assuming API Gateway is on port 4000

async function request(endpoint, options = {}) {
  let url = `${API_GATEWAY_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const config = {
    method: options.method || 'GET', // Default to GET
    headers,
  };

  if (options.body) {
    config.body = JSON.stringify(options.body);
  }

  // If there are params for a GET request, append them to the URL
  if (options.params && config.method === 'GET') {
    const queryParams = new URLSearchParams(options.params).toString();
    if (queryParams) {
      url += `?${queryParams}`;
    }
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

export const projectService = {
  getAll: (params) => request('/projects', { params }), // params for potential query string like name
  getById: (id) => request(`/projects/${id}`),
  create: (projectData) => request('/projects', { method: 'POST', body: projectData }),
  update: (id, projectData) => request(`/projects/${id}`, { method: 'PATCH', body: projectData }),
  delete: (id) => request(`/projects/${id}`, { method: 'DELETE' }),
};

export const taskService = {
  getAll: (params) => request('/tasks', { params }), // params for potential query string like projectId
  getById: (id) => request(`/tasks/${id}`),
  create: (taskData) => request('/tasks', { method: 'POST', body: taskData }),
  update: (id, taskData) => request(`/tasks/${id}`, { method: 'PATCH', body: taskData }),
  delete: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),
};

export const timesheetEntryService = {
  getAll: (params) => request('/timesheet-entries', { params }),
  getById: (id) => request(`/timesheet-entries/${id}`),
  create: (entryData) => request('/timesheet-entries', { method: 'POST', body: entryData }),
  update: (id, entryData) => request(`/timesheet-entries/${id}`, { method: 'PATCH', body: entryData }),
  delete: (id) => request(`/timesheet-entries/${id}`, { method: 'DELETE' }),
};

export const leaveTypeService = {
  getAll: (params) => request('/leave-types', { params }),
  getById: (id) => request(`/leave-types/${id}`),
  create: (data) => request('/leave-types', { method: 'POST', body: data }),
  update: (id, data) => request(`/leave-types/${id}`, { method: 'PATCH', body: data }),
  delete: (id) => request(`/leave-types/${id}`, { method: 'DELETE' }),
};

export const leaveRequestService = {
  getAll: (params) => request('/leave-requests', { params }),
  getById: (id) => request(`/leave-requests/${id}`),
  create: (data) => request('/leave-requests', { method: 'POST', body: data }),
  updateStatus: (id, data) => request(`/leave-requests/${id}/status`, { method: 'PATCH', body: data }),
  cancel: (id) => request(`/leave-requests/${id}/cancel`, { method: 'PATCH' }),
  // delete: (id) => request(`/leave-requests/${id}`, { method: 'DELETE' }), // Usually not directly deleted
};

export const leaveBalanceService = {
  getAll: (params) => request('/leave-balances', { params }),
  getForEmployeeYear: (employeeId, year) => request(`/leave-balances/employee/${employeeId}/year/${year}`),
  getById: (id) => request(`/leave-balances/${id}`),
  create: (data) => request('/leave-balances', { method: 'POST', body: data }),
  update: (id, data) => request(`/leave-balances/${id}`, { method: 'PATCH', body: data }),
  // delete: (id) => request(`/leave-balances/${id}`, { method: 'DELETE' }), // Usually not directly deleted
};

export const absenceTypeService = {
  getAll: (params) => request('/absence-types', { params }),
  getById: (id) => request(`/absence-types/${id}`),
  create: (data) => request('/absence-types', { method: 'POST', body: data }),
  update: (id, data) => request(`/absence-types/${id}`, { method: 'PATCH', body: data }),
  delete: (id) => request(`/absence-types/${id}`, { method: 'DELETE' }),
};

export const absenceService = {
  getAll: (params) => request('/absences', { params }),
  getById: (id) => request(`/absences/${id}`),
  create: (data) => request('/absences', { method: 'POST', body: data }),
  update: (id, data) => request(`/absences/${id}`, { method: 'PATCH', body: data }),
  delete: (id) => request(`/absences/${id}`, { method: 'DELETE' }),
};
