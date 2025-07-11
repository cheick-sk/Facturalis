import Head from 'next/head';
import { useEffect, useState, useCallback } from 'react';
import {
  leaveRequestService,
  leaveBalanceService,
  leaveTypeService,
  employeeService // To select an employee
} from '../../services/apiService';

// Helper to format date to YYYY-MM-DD for input[type="date"]
const formatDateForInput = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Mock current user ID - replace with actual auth logic
const MOCK_CURRENT_EMPLOYEE_ID = "cuid_placeholder_mock_user_id";
// In a real app, you'd get this from a global state/context after login.
// For testing, ensure an employee with this ID exists, or allow selection.


export default function LeaveManagementPage() {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);

  const [allEmployees, setAllEmployees] = useState([]); // For employee selection dropdown
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(''); // Simulate selecting/being a user

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form state for new leave request
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestFormData, setRequestFormData] = useState({
    leaveTypeId: '',
    startDate: '',
    endDate: '',
    reason: '',
    comments: '',
  });

  const currentYear = new Date().getFullYear();

  // Load initial data: leave types and employees (for selection)
  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [typesData, empsData] = await Promise.all([
        leaveTypeService.getAll(),
        employeeService.getAll() // For employee selection
      ]);
      setLeaveTypes(typesData || []);
      setAllEmployees(empsData || []);
      if (empsData && empsData.length > 0 && !selectedEmployeeId) {
        // setSelectedEmployeeId(empsData[0].id); // Auto-select first for demo
      }
    } catch (err) {
      console.error("Failed to load initial data:", err);
      setError(err.message || "Failed to load initial data");
    } finally {
      setIsLoading(false);
    }
  }, [selectedEmployeeId]); // Added selectedEmployeeId to avoid re-running if it's set by user

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Fetch balances and requests when an employee is selected or year changes
  const fetchEmployeeLeaveData = useCallback(async () => {
    if (!selectedEmployeeId) {
      setLeaveBalances([]);
      setLeaveRequests([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const [balancesData, requestsData] = await Promise.all([
        leaveBalanceService.getForEmployeeYear(selectedEmployeeId, currentYear),
        leaveRequestService.getAll({ employeeId: selectedEmployeeId, orderBy: 'requestedAt_desc' })
      ]);
      setLeaveBalances(balancesData || []);
      setLeaveRequests(requestsData || []);
    } catch (err) {
      console.error("Failed to load employee leave data:", err);
      setError(err.message || "Failed to load employee leave data");
      setLeaveBalances([]);
      setLeaveRequests([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedEmployeeId, currentYear]);

  useEffect(() => {
    fetchEmployeeLeaveData();
  }, [fetchEmployeeLeaveData]);


  const handleRequestFormInputChange = (e) => {
    const { name, value } = e.target;
    setRequestFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetRequestForm = () => {
    setRequestFormData({ leaveTypeId: '', startDate: '', endDate: '', reason: '', comments: '' });
    setShowRequestForm(false);
    setError(null);
  };

  const handleRequestFormSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEmployeeId) {
        setError("Please select an employee before submitting a leave request.");
        return;
    }
    setError(null);
    const payload = {
      ...requestFormData,
      employeeId: selectedEmployeeId, // Employee making the request
    };

    try {
      await leaveRequestService.create(payload);
      resetRequestForm();
      fetchEmployeeLeaveData(); // Refresh balances and requests
    } catch (err) {
      console.error("Failed to submit leave request:", err);
      setError(err.message || "Failed to submit leave request. Check console.");
    }
  };

  const handleCancelRequest = async (requestId) => {
    if (window.confirm('Are you sure you want to cancel this leave request?')) {
      try {
        // The backend's cancel endpoint uses the authenticated user's ID.
        // Here, we're not passing it explicitly as the mock GetCurrentUserId in backend will be used.
        // In a real app, the apiService.cancel might take the user ID or rely on auth headers.
        await leaveRequestService.cancel(requestId);
        fetchEmployeeLeaveData(); // Refresh list
      } catch (err) {
        console.error("Failed to cancel leave request:", err);
        setError(err.message || 'Failed to cancel request');
      }
    }
  };

  // --- JSX ---
  return (
    <div style={{ padding: '20px' }}>
      <Head>
        <title>Leave Management | HR Tool</title>
      </Head>
      <h1>Leave Management</h1>

      {/* Employee Selector for Demo Purposes */}
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="employeeSelect">Select Employee: </label>
        <select
            id="employeeSelect"
            value={selectedEmployeeId}
            onChange={(e) => setSelectedEmployeeId(e.target.value)}
            style={{padding: '8px'}}
        >
          <option value="">-- Select an Employee --</option>
          {allEmployees.map(emp => (
            <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} (ID: {emp.id.substring(0,8)})</option>
          ))}
        </select>
         {!selectedEmployeeId && <p style={{color: 'orange', fontSize: '0.9em'}}>Select an employee to see their leave balances and requests.</p>}
      </div>


      {isLoading && <p>Loading data...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {selectedEmployeeId && !isLoading && !error && (
        <>
          {/* Leave Balances Section */}
          <section>
            <h2>Leave Balances for {currentYear}</h2>
            {leaveBalances.length > 0 ? (
              <table style={{ width: 'auto', borderCollapse: 'collapse', marginBottom: '20px' }}>
                <thead>
                  <tr>
                    <th style={tableHeaderStyle}>Leave Type</th>
                    <th style={tableHeaderStyle}>Allowed</th>
                    <th style={tableHeaderStyle}>Taken</th>
                    <th style={tableHeaderStyle}>Remaining</th>
                  </tr>
                </thead>
                <tbody>
                  {leaveBalances.map(balance => (
                    <tr key={balance.id}>
                      <td style={tableCellStyle}>{balance.leaveType?.name || 'N/A'}</td>
                      <td style={tableCellStyle}>{balance.totalDaysAllowed}</td>
                      <td style={tableCellStyle}>{balance.daysTaken}</td>
                      <td style={tableCellStyle}>{(balance.totalDaysAllowed - balance.daysTaken).toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p>No leave balances found for this employee for {currentYear}.</p>}
          </section>

          {/* New Leave Request Section */}
          <section style={{ marginBottom: '20px' }}>
            {!showRequestForm && <button onClick={() => setShowRequestForm(true)}>Request New Leave</button>}
            {showRequestForm && (
              <div style={{ border: '1px solid #ccc', padding: '20px', marginTop: '10px' }}>
                <h3>New Leave Request</h3>
                <form onSubmit={handleRequestFormSubmit}>
                  <div>
                    <label>Leave Type:
                      <select name="leaveTypeId" value={requestFormData.leaveTypeId} onChange={handleRequestFormInputChange} required>
                        <option value="">-- Select Type --</option>
                        {leaveTypes.map(lt => <option key={lt.id} value={lt.id}>{lt.name}</option>)}
                      </select>
                    </label>
                  </div>
                  <div>
                    <label>Start Date: <input type="date" name="startDate" value={requestFormData.startDate} onChange={handleRequestFormInputChange} required /></label>
                  </div>
                  <div>
                    <label>End Date: <input type="date" name="endDate" value={requestFormData.endDate} onChange={handleRequestFormInputChange} required /></label>
                  </div>
                  <div>
                    <label>Reason (optional): <textarea name="reason" value={requestFormData.reason} onChange={handleRequestFormInputChange} /></label>
                  </div>
                   <div>
                    <label>Comments (optional): <textarea name="comments" value={requestFormData.comments} onChange={handleRequestFormInputChange} /></label>
                  </div>
                  <button type="submit">Submit Request</button>
                  <button type="button" onClick={resetRequestForm} style={{ marginLeft: '10px' }}>Cancel</button>
                </form>
                {error && <p style={{ color: 'red', marginTop: '10px' }}>Form Error: {error}</p>}
              </div>
            )}
          </section>

          {/* Leave Requests History Section */}
          <section>
            <h2>Leave Request History</h2>
            {leaveRequests.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={tableHeaderStyle}>Type</th>
                    <th style={tableHeaderStyle}>Start Date</th>
                    <th style={tableHeaderStyle}>End Date</th>
                    <th style={tableHeaderStyle}>Reason</th>
                    <th style={tableHeaderStyle}>Status</th>
                    <th style={tableHeaderStyle}>Requested At</th>
                    <th style={tableHeaderStyle}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leaveRequests.map(req => (
                    <tr key={req.id}>
                      <td style={tableCellStyle}>{req.leaveType?.name || 'N/A'}</td>
                      <td style={tableCellStyle}>{formatDateForInput(req.startDate)}</td>
                      <td style={tableCellStyle}>{formatDateForInput(req.endDate)}</td>
                      <td style={tableCellStyle}>{req.reason}</td>
                      <td style={tableCellStyle}>{req.status}</td>
                      <td style={tableCellStyle}>{new Date(req.requestedAt).toLocaleString()}</td>
                      <td style={tableCellStyle}>
                        {req.status === 'PENDING' && (
                          <button onClick={() => handleCancelRequest(req.id)}>Cancel</button>
                        )}
                        {/* TODO: View details, manager actions (approve/reject) */}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p>No leave requests found for this employee.</p>}
          </section>
        </>
      )}
    </div>
  );
}

const tableHeaderStyle = { border: '1px solid #ddd', padding: '8px', textAlign: 'left', backgroundColor: '#f2f2f2' };
const tableCellStyle = { border: '1px solid #ddd', padding: '8px', textAlign: 'left' };
