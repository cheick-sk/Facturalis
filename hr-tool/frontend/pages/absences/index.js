import Head from 'next/head';
import { useEffect, useState, useCallback } from 'react';
import {
  absenceService,
  absenceTypeService,
  employeeService
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

// AbsenceStatus enum values - should match Prisma schema
const ABSENCE_STATUSES = ['REPORTED', 'JUSTIFIED', 'UNJUSTIFIED', 'EXCUSED'];

export default function AbsencesPage() {
  const [absences, setAbsences] = useState([]);
  const [absenceTypes, setAbsenceTypes] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);


  // Form state for new/editing absence
  const [showAbsenceForm, setShowAbsenceForm] = useState(false);
  const [editingAbsence, setEditingAbsence] = useState(null); // null for new, object for editing
  const [absenceFormData, setAbsenceFormData] = useState({
    startDate: formatDateForInput(new Date()),
    endDate: formatDateForInput(new Date()),
    absenceTypeId: '',
    reason: '',
    status: ABSENCE_STATUSES[0], // Default to 'REPORTED'
    notes: '',
  });

  // Load initial data: absence types and employees
  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [typesData, empsData] = await Promise.all([
        absenceTypeService.getAll(),
        employeeService.getAll()
      ]);
      setAbsenceTypes(typesData || []);
      setAllEmployees(empsData || []);
    } catch (err) {
      console.error("Failed to load initial data:", err);
      setError(err.message || "Failed to load initial data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Fetch absences when an employee is selected
  const fetchEmployeeAbsences = useCallback(async () => {
    if (!selectedEmployeeId) {
      setAbsences([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const params = { employeeId: selectedEmployeeId, orderBy: 'startDate_desc', take: 100 };
      const data = await absenceService.getAll(params);
      setAbsences(data || []);
    } catch (err) {
      console.error("Failed to load absences:", err);
      setError(err.message || "Failed to load absences");
      setAbsences([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedEmployeeId]);

  useEffect(() => {
    fetchEmployeeAbsences();
  }, [fetchEmployeeAbsences]);

  const handleAbsenceFormInputChange = (e) => {
    const { name, value } = e.target;
    setAbsenceFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetAbsenceForm = () => {
    setAbsenceFormData({
      startDate: formatDateForInput(new Date()),
      endDate: formatDateForInput(new Date()),
      absenceTypeId: '',
      reason: '',
      status: ABSENCE_STATUSES[0],
      notes: '',
    });
    setEditingAbsence(null);
    setShowAbsenceForm(false);
    setFormError(null);
  };

  const handleAddNewAbsence = () => {
    if (!selectedEmployeeId) {
        alert("Please select an employee first.");
        return;
    }
    resetAbsenceForm();
    setEditingAbsence(null);
    setShowAbsenceForm(true);
  };

  const handleEditAbsence = (absence) => {
    resetAbsenceForm();
    setEditingAbsence(absence);
    setAbsenceFormData({
      startDate: formatDateForInput(absence.startDate),
      endDate: formatDateForInput(absence.endDate),
      absenceTypeId: absence.absenceTypeId || '',
      reason: absence.reason || '',
      status: absence.status || ABSENCE_STATUSES[0],
      notes: absence.notes || '',
    });
    setShowAbsenceForm(true);
  };

  const handleAbsenceFormSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEmployeeId) {
        setFormError("Employee ID is missing. Please select an employee.");
        return;
    }
    setFormError(null);
    const payload = {
      ...absenceFormData,
      employeeId: selectedEmployeeId,
      // Ensure absenceTypeId is null if empty string, or backend might error on UUID validation
      absenceTypeId: absenceFormData.absenceTypeId === '' ? null : absenceFormData.absenceTypeId,
    };

    try {
      if (editingAbsence) {
        await absenceService.update(editingAbsence.id, payload);
      } else {
        await absenceService.create(payload);
      }
      resetAbsenceForm();
      fetchEmployeeAbsences();
    } catch (err) {
      console.error("Failed to save absence:", err);
      setFormError(err.message || "Failed to save absence. Check console.");
    }
  };

  const handleDeleteAbsence = async (absenceId) => {
    if (window.confirm('Are you sure you want to delete this absence record?')) {
      try {
        await absenceService.delete(absenceId);
        fetchEmployeeAbsences();
      } catch (err) {
        console.error("Failed to delete absence:", err);
        setError(err.message || 'Failed to delete absence');
      }
    }
  };

  // --- JSX ---
  return (
    <div style={{ padding: '20px' }}>
      <Head>
        <title>Absence Management | HR Tool</title>
      </Head>
      <h1>Absence Management</h1>

      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="employeeSelectAbs">Select Employee: </label>
        <select
            id="employeeSelectAbs"
            value={selectedEmployeeId}
            onChange={(e) => setSelectedEmployeeId(e.target.value)}
            style={{padding: '8px'}}
        >
          <option value="">-- Select an Employee --</option>
          {allEmployees.map(emp => (
            <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} (ID: {emp.id.substring(0,8)})</option>
          ))}
        </select>
         {!selectedEmployeeId && <p style={{color: 'orange', fontSize: '0.9em'}}>Select an employee to manage their absences.</p>}
      </div>

      {isLoading && <p>Loading data...</p>}
      {error && <p style={{ color: 'red' }}>Page Error: {error}</p>}

      {selectedEmployeeId && !isLoading && !error && (
        <>
          {!showAbsenceForm && <button onClick={handleAddNewAbsence}>Record New Absence</button>}
          {showAbsenceForm && (
            <div style={{ border: '1px solid #ccc', padding: '20px', marginTop: '10px', marginBottom: '20px' }}>
              <h3>{editingAbsence ? 'Edit Absence Record' : 'Record New Absence'}</h3>
              <form onSubmit={handleAbsenceFormSubmit}>
                <div>
                  <label>Start Date: <input type="date" name="startDate" value={absenceFormData.startDate} onChange={handleAbsenceFormInputChange} required /></label>
                </div>
                <div>
                  <label>End Date: <input type="date" name="endDate" value={absenceFormData.endDate} onChange={handleAbsenceFormInputChange} required /></label>
                </div>
                <div>
                  <label>Absence Type (optional):
                    <select name="absenceTypeId" value={absenceFormData.absenceTypeId} onChange={handleAbsenceFormInputChange}>
                      <option value="">-- Select Type --</option>
                      {absenceTypes.map(at => <option key={at.id} value={at.id}>{at.name}</option>)}
                    </select>
                  </label>
                </div>
                <div>
                  <label>Reason (if no type or more details): <textarea name="reason" value={absenceFormData.reason} onChange={handleAbsenceFormInputChange} /></label>
                </div>
                 <div>
                  <label>Status:
                    <select name="status" value={absenceFormData.status} onChange={handleAbsenceFormInputChange} required>
                      {ABSENCE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </label>
                </div>
                <div>
                  <label>Notes (optional): <textarea name="notes" value={absenceFormData.notes} onChange={handleAbsenceFormInputChange} /></label>
                </div>
                <button type="submit">{editingAbsence ? 'Update Record' : 'Save Record'}</button>
                <button type="button" onClick={resetAbsenceForm} style={{ marginLeft: '10px' }}>Cancel</button>
              </form>
              {formError && <p style={{ color: 'red', marginTop: '10px' }}>Form Error: {formError}</p>}
            </div>
          )}

          <section>
            <h2>Recorded Absences</h2>
            {absences.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={tableHeaderStyle}>Start Date</th>
                    <th style={tableHeaderStyle}>End Date</th>
                    <th style={tableHeaderStyle}>Type</th>
                    <th style={tableHeaderStyle}>Reason</th>
                    <th style={tableHeaderStyle}>Status</th>
                    <th style={tableHeaderStyle}>Notes</th>
                    <th style={tableHeaderStyle}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {absences.map(abs => (
                    <tr key={abs.id}>
                      <td style={tableCellStyle}>{formatDateForInput(abs.startDate)}</td>
                      <td style={tableCellStyle}>{formatDateForInput(abs.endDate)}</td>
                      <td style={tableCellStyle}>{abs.absenceType?.name || 'N/A'}</td>
                      <td style={tableCellStyle}>{abs.reason}</td>
                      <td style={tableCellStyle}>{abs.status}</td>
                      <td style={tableCellStyle}>{abs.notes}</td>
                      <td style={tableCellStyle}>
                        <button onClick={() => handleEditAbsence(abs)} style={{ marginRight: '5px' }}>Edit</button>
                        <button onClick={() => handleDeleteAbsence(abs.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p>No absences recorded for this employee.</p>}
          </section>
        </>
      )}
    </div>
  );
}

const tableHeaderStyle = { border: '1px solid #ddd', padding: '8px', textAlign: 'left', backgroundColor: '#f2f2f2' };
const tableCellStyle = { border: '1px solid #ddd', padding: '8px', textAlign: 'left' };
