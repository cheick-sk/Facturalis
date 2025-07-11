import Head from 'next/head';
import { useEffect, useState } from 'react';
// import styles from '../../styles/Employees.module.css'; // We can create this later

import { employeeService } from '../../services/apiService'; // Adjusted import path
// import styles from '../../styles/Employees.module.css'; // We can create this later


export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // States for form management
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null); // null for new, object for editing
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    jobTitle: '',
    department: '',
    hireDate: '', // YYYY-MM-DD
    dateOfBirth: '', // YYYY-MM-DD
    isActive: true,
  });

  useEffect(() => {
    async function loadEmployees() {
      setIsLoading(true);
      try {
        const data = await employeeService.getAll();
        setEmployees(data);
      } catch (err) {
        console.error("Failed to load employees:", err);
        setError(err.message || 'Failed to load employees');
      } finally {
        setIsLoading(false);
      }
    }
    loadEmployees();
  }, []);

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const data = await employeeService.getAll();
      setEmployees(data);
      setError(null);
    } catch (err) {
      console.error("Failed to load employees:", err);
      setError(err.message || 'Failed to load employees');
      setEmployees([]); // Clear employees on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const resetForm = () => {
    setFormData({
      firstName: '', lastName: '', email: '', phoneNumber: '',
      jobTitle: '', department: '', hireDate: '', dateOfBirth: '', isActive: true,
    });
    setEditingEmployee(null);
    setShowForm(false);
    setError(null); // Clear previous form errors
  };

  const handleAddNew = () => {
    resetForm();
    setEditingEmployee(null); // Explicitly null for new
    setShowForm(true);
  };

  const handleEdit = (employee) => {
    resetForm();
    setEditingEmployee(employee);
    setFormData({
      firstName: employee.firstName || '',
      lastName: employee.lastName || '',
      email: employee.email || '',
      phoneNumber: employee.phoneNumber || '',
      jobTitle: employee.jobTitle || '',
      department: employee.department || '',
      hireDate: employee.hireDate ? new Date(employee.hireDate).toISOString().split('T')[0] : '',
      dateOfBirth: employee.dateOfBirth ? new Date(employee.dateOfBirth).toISOString().split('T')[0] : '',
      isActive: employee.isActive !== undefined ? employee.isActive : true,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await employeeService.delete(id);
        fetchEmployees(); // Refresh list
      } catch (err) {
        console.error("Failed to delete employee:", err);
        setError(err.message || 'Failed to delete employee');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Clear previous errors

    // Basic client-side validation example (can be expanded)
    if (!formData.firstName || !formData.lastName || !formData.email) {
        setError("First name, last name, and email are required.");
        return;
    }

    const payload = { ...formData };
    // Ensure dates are in YYYY-MM-DD or full ISO string if backend expects Date objects
    // Prisma DTOs expect strings, which service converts to Date objects.
    // Ensure isActive is boolean
    payload.isActive = Boolean(payload.isActive);

    try {
      if (editingEmployee) {
        await employeeService.update(editingEmployee.id, payload);
      } else {
        await employeeService.create(payload);
      }
      resetForm();
      fetchEmployees(); // Refresh list
    } catch (err) {
      console.error("Failed to save employee:", err);
      setError(err.message || 'Failed to save employee. Check console for details.');
    }
  };

  // Simple Form Component (can be extracted later)
  const EmployeeForm = () => (
    <div style={{ border: '1px solid #ccc', padding: '20px', margin: '20px 0' }}>
      <h3>{editingEmployee ? 'Edit Employee' : 'Add New Employee'}</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label>First Name: <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} required /></label>
        </div>
        <div>
          <label>Last Name: <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} required /></label>
        </div>
        <div>
          <label>Email: <input type="email" name="email" value={formData.email} onChange={handleInputChange} required /></label>
        </div>
        <div>
          <label>Phone: <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} /></label>
        </div>
        <div>
          <label>Job Title: <input type="text" name="jobTitle" value={formData.jobTitle} onChange={handleInputChange} /></label>
        </div>
        <div>
          <label>Department: <input type="text" name="department" value={formData.department} onChange={handleInputChange} /></label>
        </div>
        <div>
          <label>Hire Date: <input type="date" name="hireDate" value={formData.hireDate} onChange={handleInputChange} /></label>
        </div>
        <div>
          <label>Date of Birth: <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} /></label>
        </div>
        <div>
          <label>Is Active: <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleInputChange} /></label>
        </div>
        <button type="submit">{editingEmployee ? 'Update' : 'Create'}</button>
        <button type="button" onClick={resetForm} style={{ marginLeft: '10px' }}>Cancel</button>
      </form>
      {error && <p style={{ color: 'red', marginTop: '10px' }}>Form Error: {error}</p>}
    </div>
  );

  return (
    <div>
      <Head>
        <title>Manage Employees | HR Tool</title>
        <meta name="description" content="Employee Management Page" />
      </Head>

      <main /* className={styles.main} */ style={{ padding: '20px' }}>
        <h1>Employee Management</h1>

        {!showForm && <button onClick={handleAddNew}>Add New Employee</button>}

        {showForm && <EmployeeForm />}

        {isLoading && <p>Loading employees...</p>}
        {!isLoading && error && <p style={{ color: 'red' }}>Page Error: {error}</p>}

        {!isLoading && !error && employees.length === 0 && !showForm && <p>No employees found. Click "Add New Employee" to start.</p>}

        {!isLoading && !error && employees.length > 0 && (
          <table style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={tableHeaderStyle}>Name</th>
                <th style={tableHeaderStyle}>Email</th>
                <th style={tableHeaderStyle}>Job Title</th>
                <th style={tableHeaderStyle}>Hire Date</th>
                <th style={tableHeaderStyle}>Active</th>
                <th style={tableHeaderStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id}>
                  <td style={tableCellStyle}>{emp.firstName} {emp.lastName}</td>
                  <td style={tableCellStyle}>{emp.email}</td>
                  <td style={tableCellStyle}>{emp.jobTitle || 'N/A'}</td>
                  <td style={tableCellStyle}>{new Date(emp.hireDate).toLocaleDateString()}</td>
                  <td style={tableCellStyle}>{emp.isActive ? 'Yes' : 'No'}</td>
                  <td style={tableCellStyle}>
                    <button onClick={() => handleEdit(emp)} style={{ marginRight: '5px' }}>Edit</button>
                    <button onClick={() => handleDelete(emp.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}

const tableHeaderStyle = { border: '1px solid #ddd', padding: '8px', textAlign: 'left', backgroundColor: '#f2f2f2' };
const tableCellStyle = { border: '1px solid #ddd', padding: '8px', textAlign: 'left' };
}
