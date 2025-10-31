import { useState, useEffect } from 'react';
import axios from 'axios';
import { Layout } from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Section {
  id: number;
  name: string;
}

interface Shift {
  id: number;
  name: string;
}

interface Record {
  id: number;
  createdAt: string;
  section: { id: number; name: string };
  shift: { id: number; name: string };
  user: { username: string };
  ccsDetails?: {
    bafIn: number;
    bafOut: number;
    crmIn: number;
    crmOut: number;
    shippedOut: number;
    totalTrucksIn: number;
    totalTrucksOut: number;
    totalMovements: number;
    downTime: number;
  };
}

interface DailyStats {
  date: string;
  totalRecords: number;
  totalMovements: number;
  avgDownTime: number;
  totalTrucksIn: number;
  totalTrucksOut: number;
}

export default function Reports() {
  const { user } = useAuth();
  const [sections, setSections] = useState<Section[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [records, setRecords] = useState<Record[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<Record[]>([]);
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [selectedShift, setSelectedShift] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const isAdmin = user?.role?.name === 'Admin' || user?.role?.name === 'SuperAdmin';

  // Restore filters from localStorage on mount
  useEffect(() => {
    const savedFilters = localStorage.getItem('reports-filters');
    if (savedFilters) {
      const filters = JSON.parse(savedFilters);
      if (filters.selectedSection) setSelectedSection(filters.selectedSection);
      if (filters.selectedShift) setSelectedShift(filters.selectedShift);
      if (filters.startDate) setStartDate(filters.startDate);
      if (filters.endDate) setEndDate(filters.endDate);
    }
    fetchData();
  }, []);

  // Save filters to localStorage when they change
  useEffect(() => {
    localStorage.setItem(
      'reports-filters',
      JSON.stringify({ selectedSection, selectedShift, startDate, endDate })
    );
  }, [selectedSection, selectedShift, startDate, endDate]);

  useEffect(() => {
    applyFilters();
  }, [records, selectedSection, selectedShift, startDate, endDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sectionsRes, shiftsRes, recordsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/sections`),
        axios.get(`${import.meta.env.VITE_API_URL}/shifts`),
        isAdmin
          ? axios.get(`${import.meta.env.VITE_API_URL}/records`)
          : axios.get(`${import.meta.env.VITE_API_URL}/records/my-records`),
      ]);
      setSections(sectionsRes.data);
      setShifts(shiftsRes.data);
      setRecords(recordsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...records];

    // Filter by section
    if (selectedSection !== 'all') {
      filtered = filtered.filter((r) => r.section.id === parseInt(selectedSection));
    }

    // Filter by shift
    if (selectedShift !== 'all') {
      filtered = filtered.filter((r) => r.shift.id === parseInt(selectedShift));
    }

    // Filter by date range
    if (startDate) {
      filtered = filtered.filter((r) => new Date(r.createdAt) >= new Date(startDate));
    }
    if (endDate) {
      filtered = filtered.filter((r) => new Date(r.createdAt) <= new Date(endDate + 'T23:59:59'));
    }

    setFilteredRecords(filtered);
  };

  // Calculate daily statistics
  const getDailyStats = (): DailyStats[] => {
    const statsMap = new Map<string, DailyStats>();

    filteredRecords.forEach((record) => {
      const date = new Date(record.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const existing = statsMap.get(date) || {
        date,
        totalRecords: 0,
        totalMovements: 0,
        avgDownTime: 0,
        totalTrucksIn: 0,
        totalTrucksOut: 0,
      };

      existing.totalRecords += 1;
      if (record.ccsDetails) {
        existing.totalMovements += record.ccsDetails.totalMovements || 0;
        existing.avgDownTime += record.ccsDetails.downTime || 0;
        existing.totalTrucksIn += record.ccsDetails.totalTrucksIn || 0;
        existing.totalTrucksOut += record.ccsDetails.totalTrucksOut || 0;
      }

      statsMap.set(date, existing);
    });

    // Calculate averages
    const stats = Array.from(statsMap.values());
    stats.forEach((stat) => {
      if (stat.totalRecords > 0) {
        stat.avgDownTime = Number((stat.avgDownTime / stat.totalRecords).toFixed(1));
      }
    });

    return stats.sort((a, b) => {
      const dateA = new Date(a.date + ', 2025');
      const dateB = new Date(b.date + ', 2025');
      return dateA.getTime() - dateB.getTime();
    });
  };

  const dailyStats = getDailyStats();

  // Calculate summary statistics
  const summaryStats = {
    totalRecords: filteredRecords.length,
    totalMovements: filteredRecords.reduce((sum, r) => sum + (r.ccsDetails?.totalMovements || 0), 0),
    avgDownTime: filteredRecords.length > 0
      ? filteredRecords.reduce((sum, r) => sum + (r.ccsDetails?.downTime || 0), 0) / filteredRecords.length
      : 0,
    totalTrucksIn: filteredRecords.reduce((sum, r) => sum + (r.ccsDetails?.totalTrucksIn || 0), 0),
    totalTrucksOut: filteredRecords.reduce((sum, r) => sum + (r.ccsDetails?.totalTrucksOut || 0), 0),
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Reports & Analytics
          </h2>
          <button
            onClick={fetchData}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm font-medium"
          >
            {loading ? 'Loading...' : 'Refresh Data'}
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 md:p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Filters</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {isAdmin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Section
                </label>
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Sections</option>
                  {sections.map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Shift
              </label>
              <select
                value={selectedShift}
                onChange={(e) => setSelectedShift(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Shifts</option>
                {shifts.map((shift) => (
                  <option key={shift.id} value={shift.id}>
                    {shift.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg rounded-lg p-4 md:p-6 text-white">
            <h4 className="text-xs md:text-sm font-medium opacity-90">Total Records</h4>
            <p className="text-2xl md:text-3xl font-bold mt-2">{summaryStats.totalRecords}</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 shadow-lg rounded-lg p-4 md:p-6 text-white">
            <h4 className="text-xs md:text-sm font-medium opacity-90">Total Movements</h4>
            <p className="text-2xl md:text-3xl font-bold mt-2">{summaryStats.totalMovements}</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-lg rounded-lg p-4 md:p-6 text-white">
            <h4 className="text-xs md:text-sm font-medium opacity-90">Avg Down Time</h4>
            <p className="text-2xl md:text-3xl font-bold mt-2">
              {summaryStats.avgDownTime.toFixed(1)}h
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg rounded-lg p-4 md:p-6 text-white">
            <h4 className="text-xs md:text-sm font-medium opacity-90">Total Trucks</h4>
            <p className="text-2xl md:text-3xl font-bold mt-2">
              {summaryStats.totalTrucksIn} / {summaryStats.totalTrucksOut}
            </p>
            <p className="text-xs mt-1 opacity-90">In / Out</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Line Chart - Movements Over Time */}
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 md:p-6">
            <h3 className="text-base md:text-lg font-medium text-gray-900 dark:text-white mb-4">
              Movements Over Time
            </h3>
            <div className="w-full h-64 md:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyStats} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis
                    dataKey="date"
                    stroke="#9CA3AF"
                    style={{ fontSize: '12px' }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F3F4F6'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Line
                    type="monotone"
                    dataKey="totalMovements"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    name="Total Movements"
                    dot={{ fill: '#3B82F6', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart - Trucks In/Out */}
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 md:p-6">
            <h3 className="text-base md:text-lg font-medium text-gray-900 dark:text-white mb-4">
              Trucks In/Out Per Day
            </h3>
            <div className="w-full h-64 md:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyStats} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis
                    dataKey="date"
                    stroke="#9CA3AF"
                    style={{ fontSize: '12px' }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F3F4F6'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="totalTrucksIn" fill="#10B981" name="Trucks In" />
                  <Bar dataKey="totalTrucksOut" fill="#EF4444" name="Trucks Out" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Line Chart - Down Time */}
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 md:p-6">
            <h3 className="text-base md:text-lg font-medium text-gray-900 dark:text-white mb-4">
              Average Down Time Per Day
            </h3>
            <div className="w-full h-64 md:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyStats} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis
                    dataKey="date"
                    stroke="#9CA3AF"
                    style={{ fontSize: '12px' }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F3F4F6'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Line
                    type="monotone"
                    dataKey="avgDownTime"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    name="Avg Down Time (h)"
                    dot={{ fill: '#F59E0B', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart - Records Per Day */}
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 md:p-6">
            <h3 className="text-base md:text-lg font-medium text-gray-900 dark:text-white mb-4">
              Records Submitted Per Day
            </h3>
            <div className="w-full h-64 md:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyStats} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis
                    dataKey="date"
                    stroke="#9CA3AF"
                    style={{ fontSize: '12px' }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F3F4F6'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="totalRecords" fill="#8B5CF6" name="Records" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Records Table */}
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 md:p-6">
          <h3 className="text-base md:text-lg font-medium text-gray-900 dark:text-white mb-4">
            Detailed Records ({filteredRecords.length})
          </h3>
          <div className="overflow-x-auto -mx-4 md:mx-0">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Date
                    </th>
                    {isAdmin && (
                      <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        User
                      </th>
                    )}
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Section
                    </th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Shift
                    </th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Movements
                    </th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Down Time
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={isAdmin ? 6 : 5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                        No records found
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                          {new Date(record.createdAt).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        {isAdmin && (
                          <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                            {record.user.username}
                          </td>
                        )}
                        <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                            {record.section.name}
                          </span>
                        </td>
                        <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                          {record.shift.name}
                        </td>
                        <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-300">
                          {record.ccsDetails?.totalMovements || '-'}
                        </td>
                        <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                          {record.ccsDetails?.downTime ? `${record.ccsDetails.downTime}h` : '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
