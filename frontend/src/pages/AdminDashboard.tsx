import { useState, useEffect } from 'react';
import axios from 'axios';
import { Layout } from '../components/Layout';
import { useAuth } from '../context/AuthContext';

interface User {
  id: number;
  username: string;
  roleId: number;
  role: {
    id: number;
    name: string;
  };
  sectionId?: number;
  section?: {
    id: number;
    name: string;
  };
}

interface Role {
  id: number;
  name: string;
}

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
  user: { username: string };
  section: { name: string };
  shift: { name: string };
  crmOut: string;
  crmIn: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'users' | 'sections' | 'shifts' | 'records'>('records');
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [records, setRecords] = useState<Record[]>([]);

  // Create User Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', password: '', roleId: 3, sectionId: 0 });
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');

  // Edit User Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editSectionId, setEditSectionId] = useState<number>(0);
  const [editRoleId, setEditRoleId] = useState<number>(3);

  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchData();
    fetchRolesAndSections();
  }, [activeTab]);

  const fetchRolesAndSections = async () => {
    try {
      const [rolesRes, sectionsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/sections`), // We'll use sections
        axios.get(`${import.meta.env.VITE_API_URL}/sections`)
      ]);
      setSections(sectionsRes.data);
      // Mock roles since we don't have a roles endpoint
      setRoles([
        { id: 1, name: 'SuperAdmin' },
        { id: 2, name: 'Admin' },
        { id: 3, name: 'User' }
      ]);
    } catch (error) {
      console.error('Error fetching roles/sections:', error);
    }
  };

  const fetchData = async () => {
    try {
      if (activeTab === 'users') {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/users`);
        setUsers(res.data);
      } else if (activeTab === 'sections') {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/sections`);
        setSections(res.data);
      } else if (activeTab === 'shifts') {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/shifts`);
        setShifts(res.data);
      } else if (activeTab === 'records') {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/records`);
        setRecords(res.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    setCreateSuccess('');

    try {
      const userData: any = {
        username: newUser.username,
        password: newUser.password,
        roleId: newUser.roleId
      };

      if (newUser.sectionId && newUser.sectionId > 0) {
        userData.sectionId = newUser.sectionId;
      }

      await axios.post(`${import.meta.env.VITE_API_URL}/users`, userData);
      setCreateSuccess('User created successfully!');
      setNewUser({ username: '', password: '', roleId: 3, sectionId: 0 });
      fetchData();
      setTimeout(() => {
        setShowCreateModal(false);
        setCreateSuccess('');
      }, 1500);
    } catch (error: any) {
      setCreateError(error.response?.data?.message || 'Failed to create user');
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const updateData: any = {};

      // Only SuperAdmin can change roles
      if (currentUser?.role?.name === 'SuperAdmin' && editRoleId !== editingUser.roleId) {
        updateData.roleId = editRoleId;
      }

      if (editSectionId > 0) {
        updateData.sectionId = editSectionId;
      } else if (editSectionId === 0 && editingUser.sectionId) {
        // Clear section if set to "No Section"
        updateData.sectionId = null;
      }

      await axios.patch(`${import.meta.env.VITE_API_URL}/users/${editingUser.id}`, updateData);
      setShowEditModal(false);
      setEditingUser(null);
      fetchData();
    } catch (error: any) {
      console.error('Error updating user:', error);
      alert(error.response?.data?.message || 'Failed to update user');
    }
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setEditSectionId(user.sectionId || 0);
    setEditRoleId(user.roleId);
    setShowEditModal(true);
  };

  return (
    <Layout>
      <div className="px-4 py-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Admin Dashboard</h2>

        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8">
            {['records', 'users', 'sections', 'shifts'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          {activeTab === 'records' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Section</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Shift</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">CRM Out</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">CRM In</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {records.map((record) => (
                    <tr key={record.id}>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">{record.user.username}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">{record.section.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">{record.shift.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">{record.crmOut || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">{record.crmIn || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">
                        {new Date(record.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  Create User
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Username</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Section</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">{user.username}</td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">{user.role.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">{user.section?.name || '-'}</td>
                        <td className="px-6 py-4 text-sm">
                          <button
                            onClick={() => openEditModal(user)}
                            className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                          >
                            Edit Section
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'sections' && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sections.map((section) => (
                  <div key={section.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">{section.name}</h3>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'shifts' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Start Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">End Time</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {shifts.map((shift) => (
                    <tr key={shift.id}>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">{shift.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">{shift.startTime}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">{shift.endTime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create User Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Create New User</h3>
              <form onSubmit={handleCreateUser}>
                {createError && (
                  <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-400 text-red-700 dark:text-red-400 px-4 py-3 rounded">
                    {createError}
                  </div>
                )}
                {createSuccess && (
                  <div className="mb-4 bg-green-50 dark:bg-green-900/20 border border-green-400 text-green-700 dark:text-green-400 px-4 py-3 rounded">
                    {createSuccess}
                  </div>
                )}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      required
                      value={newUser.username}
                      onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Role
                    </label>
                    <select
                      value={newUser.roleId}
                      onChange={(e) => setNewUser({ ...newUser, roleId: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                    >
                      {roles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Section (Optional)
                    </label>
                    <select
                      value={newUser.sectionId}
                      onChange={(e) => setNewUser({ ...newUser, sectionId: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                    >
                      <option value={0}>No Section</option>
                      {sections.map((section) => (
                        <option key={section.id} value={section.id}>
                          {section.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex space-x-3 mt-6">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                  >
                    Create User
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setCreateError('');
                      setCreateSuccess('');
                      setNewUser({ username: '', password: '', roleId: 3, sectionId: 0 });
                    }}
                    className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {showEditModal && editingUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Edit User: {editingUser.username}
              </h3>
              <form onSubmit={handleEditUser}>
                <div className="space-y-4">
                  {currentUser?.role?.name === 'SuperAdmin' ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Change Role
                      </label>
                      <select
                        value={editRoleId}
                        onChange={(e) => setEditRoleId(parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                      >
                        {roles.map((role) => (
                          <option key={role.id} value={role.id}>
                            {role.name}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Current: {editingUser.role.name}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Current Role: {editingUser.role.name}
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Only SuperAdmin can change roles
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Assign Section
                    </label>
                    <select
                      value={editSectionId}
                      onChange={(e) => setEditSectionId(parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                    >
                      <option value={0}>No Section</option>
                      {sections.map((section) => (
                        <option key={section.id} value={section.id}>
                          {section.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex space-x-3 mt-6">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                  >
                    Update User
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingUser(null);
                    }}
                    className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
