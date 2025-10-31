import { useState, useEffect } from 'react';
import axios from 'axios';
import { Layout } from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { CcsRecordForm, CcsRecordData } from '../components/CcsRecordForm';

interface Section {
  id: number;
  name: string;
}

interface Shift {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
}

interface Record {
  id: number;
  crmOut: string;
  crmIn: string;
  createdAt: string;
  section: { name: string };
  shift: { name: string };
}

export default function WorkerDashboard() {
  const { user } = useAuth();
  const [sections, setSections] = useState<Section[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [records, setRecords] = useState<Record[]>([]);
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedShift, setSelectedShift] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Restore section/shift selection from localStorage on mount
  useEffect(() => {
    const savedSection = localStorage.getItem('worker-selected-section');
    const savedShift = localStorage.getItem('worker-selected-shift');
    const savedShowForm = localStorage.getItem('worker-show-form');

    if (savedSection) setSelectedSection(savedSection);
    if (savedShift) setSelectedShift(savedShift);
    if (savedShowForm === 'true') setShowForm(true);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sectionsRes, shiftsRes, recordsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/sections`),
        axios.get(`${import.meta.env.VITE_API_URL}/shifts`),
        axios.get(`${import.meta.env.VITE_API_URL}/records/my-records`),
      ]);
      setSections(sectionsRes.data);
      setShifts(shiftsRes.data);
      setRecords(recordsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleCcsSubmit = async (data: CcsRecordData) => {
    if (!selectedSection || !selectedShift) {
      alert('Please select section and shift');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/records`, {
        userId: user?.id,
        sectionId: parseInt(selectedSection),
        shiftId: parseInt(selectedShift),
        ...data,
      });
      alert('CCS record saved successfully!');
      // Clear localStorage after successful submission
      localStorage.removeItem('worker-selected-section');
      localStorage.removeItem('worker-selected-shift');
      localStorage.removeItem('worker-show-form');
      setShowForm(false);
      setSelectedSection('');
      setSelectedShift('');
      fetchData();
    } catch (error) {
      console.error('Error adding record:', error);
      alert('Failed to add record');
    } finally {
      setLoading(false);
    }
  };

  // Save section/shift/form state to localStorage when they change
  useEffect(() => {
    if (selectedSection) {
      localStorage.setItem('worker-selected-section', selectedSection);
    }
  }, [selectedSection]);

  useEffect(() => {
    if (selectedShift) {
      localStorage.setItem('worker-selected-shift', selectedShift);
    }
  }, [selectedShift]);

  useEffect(() => {
    localStorage.setItem('worker-show-form', showForm.toString());
  }, [showForm]);

  const getSelectedSectionName = () => {
    const section = sections.find((s) => s.id === parseInt(selectedSection));
    return section?.name || '';
  };

  return (
    <Layout>
      <div className="px-4 py-6 space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Worker Dashboard</h2>

        {!showForm ? (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Start New Shift Report
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Section
                </label>
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select Section</option>
                  {sections.map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Shift
                </label>
                <select
                  value={selectedShift}
                  onChange={(e) => setSelectedShift(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select Shift</option>
                  {shifts.map((shift) => (
                    <option key={shift.id} value={shift.id}>
                      {shift.name} ({shift.startTime} - {shift.endTime})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={() => {
                if (!selectedSection || !selectedShift) {
                  alert('Please select both section and shift');
                  return;
                }
                setShowForm(true);
              }}
              disabled={!selectedSection || !selectedShift}
              className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue to Form
            </button>
          </div>
        ) : (
          <div>
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Current Session:</span>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {getSelectedSectionName()} - Shift {shifts.find(s => s.id === parseInt(selectedShift))?.name}
                  </p>
                </div>
                <button
                  onClick={() => {
                    // Clear localStorage when canceling
                    localStorage.removeItem('worker-selected-section');
                    localStorage.removeItem('worker-selected-shift');
                    localStorage.removeItem('worker-show-form');
                    localStorage.removeItem(`form-draft-ccs-${selectedSection}-${selectedShift}`);
                    setShowForm(false);
                    setSelectedSection('');
                    setSelectedShift('');
                  }}
                  className="px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
                >
                  Cancel Session
                </button>
              </div>
            </div>

            {getSelectedSectionName() === 'CCS' && (
              <CcsRecordForm
                onSubmit={handleCcsSubmit}
                loading={loading}
                sessionKey={`ccs-${selectedSection}-${selectedShift}`}
              />
            )}

            {getSelectedSectionName() !== 'CCS' && (
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <p className="text-gray-600 dark:text-gray-400">
                  Form for {getSelectedSectionName()} section is not yet implemented.
                </p>
              </div>
            )}
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">My Records</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Section
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Shift
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    CRM Out
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    CRM In
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {records.map((record) => (
                  <tr key={record.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                      {new Date(record.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                      {record.section.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                      {record.shift.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                      {record.crmOut || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                      {record.crmIn || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
