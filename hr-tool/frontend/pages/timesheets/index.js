import Head from 'next/head';
import { useEffect, useState } from 'react';
import { timesheetEntryService, employeeService, projectService, taskService } from '../../services/apiService';

// Helper to format date to YYYY-MM-DD for input[type="date"]
const formatDateForInput = (date) => {
  if (!date) return '';
  return new Date(date).toISOString().split('T')[0];
};

export default function TimesheetsPage() {
  const [entries, setEntries] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]); // Tasks filtered by selected project

  // Filters and Form data
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState(''); // For filtering tasks and for new entry
  const [currentWeekStartDate, setCurrentWeekStartDate] = useState(getStartOfWeek(new Date()));

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form state for new/editing entry
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null); // null for new, object for editing
  const [entryFormData, setEntryFormData] = useState({
    date: formatDateForInput(new Date()),
    startTime: '', // HH:mm
    endTime: '',   // HH:mm
    duration: '',  // in hours
    notes: '',
    employeeId: '',
    projectId: '',
    taskId: '',
  });

  // Initial data loading
  useEffect(() => {
    async function loadInitialData() {
      setIsLoading(true);
      try {
        const [empData, projData] = await Promise.all([
          employeeService.getAll(),
          projectService.getAll(),
        ]);
        setEmployees(empData || []);
        setProjects(projData || []);
        if (empData && empData.length > 0) {
          // setSelectedEmployeeId(empData[0].id); // Auto-select first employee
          // entryFormData.employeeId = empData[0].id; // Pre-fill for new entry
        }
      } catch (err) {
        console.error("Failed to load initial data:", err);
        setError(err.message || "Failed to load initial data");
      } finally {
        setIsLoading(false);
      }
    }
    loadInitialData();
  }, []);

  // Load tasks when a project is selected for the form
  useEffect(() => {
    if (entryFormData.projectId) {
      taskService.getAll({ projectId: entryFormData.projectId })
        .then(data => setTasks(data || []))
        .catch(err => {
          console.error("Failed to load tasks for project:", err);
          setTasks([]);
        });
    } else {
      setTasks([]);
    }
  }, [entryFormData.projectId]);

  // Load timesheet entries when selectedEmployeeId or currentWeekStartDate changes
  useEffect(() => {
    if (selectedEmployeeId) {
      fetchTimesheetEntries();
    } else {
      setEntries([]); // Clear entries if no employee is selected
    }
  }, [selectedEmployeeId, currentWeekStartDate]);

  const fetchTimesheetEntries = async () => {
    if (!selectedEmployeeId) return;
    setIsLoading(true);
    setError(null);
    try {
      const dateFrom = formatDateForInput(currentWeekStartDate);
      const dateTo = formatDateForInput(new Date(currentWeekStartDate.getTime() + 6 * 24 * 60 * 60 * 1000)); // End of week

      const params = { employeeId: selectedEmployeeId, dateFrom, dateTo, take: 100 }; // Adjust take as needed
      const data = await timesheetEntryService.getAll(params);
      setEntries(data || []);
    } catch (err) {
      console.error("Failed to load timesheet entries:", err);
      setError(err.message || "Failed to load timesheet entries");
      setEntries([]);
    } finally {
      setIsLoading(false);
    }
  };

  function getStartOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay(); // 0 (Sun) - 6 (Sat)
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust if Sunday is first day of week
    return new Date(d.setDate(diff));
  }

  const handlePrevWeek = () => {
    setCurrentWeekStartDate(new Date(currentWeekStartDate.setDate(currentWeekStartDate.getDate() - 7)));
  };

  const handleNextWeek = () => {
    setCurrentWeekStartDate(new Date(currentWeekStartDate.setDate(currentWeekStartDate.getDate() + 7)));
  };

  const handleEntryFormInputChange = (e) => {
    const { name, value } = e.target;
    setEntryFormData(prev => ({ ...prev, [name]: value }));
    if (name === "projectId") { // Reset task if project changes
        setEntryFormData(prev => ({ ...prev, taskId: '' }));
    }
  };

  const resetEntryForm = () => {
    setEntryFormData({
      date: formatDateForInput(new Date()), startTime: '', endTime: '', duration: '', notes: '',
      employeeId: selectedEmployeeId, // Keep selected employee
      projectId: '', taskId: '',
    });
    setEditingEntry(null);
    setShowEntryForm(false);
    setError(null);
  };

  const handleAddNewEntry = () => {
    if (!selectedEmployeeId) {
        alert("Please select an employee first.");
        return;
    }
    resetEntryForm();
    setEntryFormData(prev => ({ ...prev, employeeId: selectedEmployeeId })); // Ensure employeeId is set
    setEditingEntry(null);
    setShowEntryForm(true);
  };

  const handleEditEntry = (entry) => {
    resetEntryForm();
    setEditingEntry(entry);
    setEntryFormData({
      date: formatDateForInput(entry.date),
      startTime: entry.startTime ? new Date(entry.startTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }) : '',
      endTime: entry.endTime ? new Date(entry.endTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }) : '',
      duration: entry.duration || '',
      notes: entry.notes || '',
      employeeId: entry.employeeId,
      projectId: entry.projectId || '',
      taskId: entry.taskId || '',
    });
    setShowEntryForm(true);
  };

  const handleEntryFormSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const { date, startTime, endTime, duration, employeeId, ...rest } = entryFormData;

    if (!employeeId) {
        setError("Employee ID is missing from form data.");
        return;
    }

    // Combine date with time for startTime and endTime
    const fullStartTime = startTime ? `${date}T${startTime}:00.000Z` : null; // Assuming local time, backend will parse
    const fullEndTime = endTime ? `${date}T${endTime}:00.000Z` : null;

    let payload = {
        ...rest,
        date,
        employeeId,
    };

    if (fullStartTime) payload.startTime = fullStartTime;
    if (fullEndTime) payload.endTime = fullEndTime;
    if (duration) payload.duration = parseFloat(duration);


    try {
      if (editingEntry) {
        await timesheetEntryService.update(editingEntry.id, payload);
      } else {
        await timesheetEntryService.create(payload);
      }
      resetEntryForm();
      fetchTimesheetEntries();
    } catch (err) {
      console.error("Failed to save timesheet entry:", err);
      setError(err.message || "Failed to save entry. Check console.");
    }
  };

  const handleDeleteEntry = async (id) => {
    if (window.confirm('Are you sure you want to delete this timesheet entry?')) {
      try {
        await timesheetEntryService.delete(id);
        fetchTimesheetEntries();
      } catch (err) {
        console.error("Failed to delete entry:", err);
        setError(err.message || 'Failed to delete entry');
      }
    }
  };


  // --- JSX ---
  return (
    <div style={{ padding: '20px' }}>
      <Head>
        <title>Timesheets | HR Tool</title>
      </Head>

      <h1>Timesheets</h1>

      {/* Employee Selector */}
      <div>
        <label htmlFor="employeeSelect">Select Employee: </label>
        <select
            id="employeeSelect"
            value={selectedEmployeeId}
            onChange={(e) => setSelectedEmployeeId(e.target.value)}
            style={{padding: '8px', marginRight: '10px'}}
        >
          <option value="">-- Select Employee --</option>
          {employees.map(emp => (
            <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
          ))}
        </select>
      </div>

      {selectedEmployeeId && (
        <>
          {/* Week Navigation */}
          <div style={{ margin: '20px 0' }}>
            <button onClick={handlePrevWeek}>&lt; Prev Week</button>
            <span style={{ margin: '0 10px' }}>
              Week of: {currentWeekStartDate.toLocaleDateString()}
            </span>
            <button onClick={handleNextWeek}>Next Week &gt;</button>
          </div>

          {!showEntryForm && <button onClick={handleAddNewEntry}>Add New Entry</button>}
        </>
      )}

      {showEntryForm && selectedEmployeeId && (
        <div style={{ border: '1px solid #ccc', padding: '20px', margin: '20px 0' }}>
          <h3>{editingEntry ? 'Edit Timesheet Entry' : 'Add New Timesheet Entry'}</h3>
          <form onSubmit={handleEntryFormSubmit}>
            <input type="hidden" name="employeeId" value={entryFormData.employeeId} />
            <div>
              <label>Date: <input type="date" name="date" value={entryFormData.date} onChange={handleEntryFormInputChange} required /></label>
            </div>
            <div>
              <label>Start Time (HH:MM): <input type="time" name="startTime" value={entryFormData.startTime} onChange={handleEntryFormInputChange} /></label>
            </div>
            <div>
              <label>End Time (HH:MM): <input type="time" name="endTime" value={entryFormData.endTime} onChange={handleEntryFormInputChange} /></label>
            </div>
            <div>
              <label>Duration (hours, e.g., 1.5): <input type="number" step="0.01" name="duration" value={entryFormData.duration} onChange={handleEntryFormInputChange} /></label>
              <small> (Leave blank to calculate from start/end time)</small>
            </div>
             <div>
              <label>Project:
                <select name="projectId" value={entryFormData.projectId} onChange={handleEntryFormInputChange}>
                  <option value="">-- Select Project --</option>
                  {projects.map(proj => <option key={proj.id} value={proj.id}>{proj.name}</option>)}
                </select>
              </label>
            </div>
            {entryFormData.projectId && tasks.length > 0 && (
              <div>
                <label>Task:
                  <select name="taskId" value={entryFormData.taskId} onChange={handleEntryFormInputChange}>
                    <option value="">-- Select Task --</option>
                    {tasks.map(task => <option key={task.id} value={task.id}>{task.name}</option>)}
                  </select>
                </label>
              </div>
            )}
            <div>
              <label>Notes: <textarea name="notes" value={entryFormData.notes} onChange={handleEntryFormInputChange} /></label>
            </div>
            <button type="submit">{editingEntry ? 'Update Entry' : 'Create Entry'}</button>
            <button type="button" onClick={resetEntryForm} style={{ marginLeft: '10px' }}>Cancel</button>
          </form>
          {error && <p style={{ color: 'red', marginTop: '10px' }}>Form Error: {error}</p>}
        </div>
      )}

      {isLoading && <p>Loading entries...</p>}
      {!isLoading && error && !showEntryForm && <p style={{ color: 'red' }}>Page Error: {error}</p>}

      {!isLoading && !error && entries.length === 0 && selectedEmployeeId && !showEntryForm && (
        <p>No timesheet entries found for this employee for the selected week.</p>
      )}

      {!isLoading && !error && entries.length > 0 && (
        <table style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={tableHeaderStyle}>Date</th>
              <th style={tableHeaderStyle}>Start</th>
              <th style={tableHeaderStyle}>End</th>
              <th style={tableHeaderStyle}>Duration (h)</th>
              <th style={tableHeaderStyle}>Project</th>
              <th style={tableHeaderStyle}>Task</th>
              <th style={tableHeaderStyle}>Notes</th>
              <th style={tableHeaderStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id}>
                <td style={tableCellStyle}>{formatDateForInput(entry.date)}</td>
                <td style={tableCellStyle}>{entry.startTime ? new Date(entry.startTime).toLocaleTimeString() : 'N/A'}</td>
                <td style={tableCellStyle}>{entry.endTime ? new Date(entry.endTime).toLocaleTimeString() : 'N/A'}</td>
                <td style={tableCellStyle}>{entry.duration.toFixed(2)}</td>
                <td style={tableCellStyle}>{entry.project?.name || 'N/A'}</td>
                <td style={tableCellStyle}>{entry.task?.name || 'N/A'}</td>
                <td style={tableCellStyle}>{entry.notes}</td>
                <td style={tableCellStyle}>
                  <button onClick={() => handleEditEntry(entry)} style={{ marginRight: '5px' }}>Edit</button>
                  <button onClick={() => handleDeleteEntry(entry.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const tableHeaderStyle = { border: '1px solid #ddd', padding: '8px', textAlign: 'left', backgroundColor: '#f2f2f2' };
const tableCellStyle = { border: '1px solid #ddd', padding: '8px', textAlign: 'left' };
