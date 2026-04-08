import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { appointmentsAPI, invoicesAPI, barbersAPI } from '../services/api';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalAppointments: 0,
    totalBarbers: 0,
    totalCustomers: 0,
    completedAppointments: 0,
    pendingPayments: 0,
    revenueThisMonth: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [barberStats, setBarberStats] = useState([]);
  const [pendingBarbers, setPendingBarbers] = useState([]);
  const [approvingBarber, setApprovingBarber] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [appointmentsRes, invoicesRes, barbersRes, pendingBarbersRes] = await Promise.all([
          appointmentsAPI.getAll(),
          invoicesAPI.getAll(),
          barbersAPI.getAll(),
          barbersAPI.getPending(),
        ]);

        const appointments = appointmentsRes.data.appointments || [];
        const invoices = invoicesRes.data.invoices || [];
        const barbers = barbersRes.data.barbers || [];
        const pending = pendingBarbersRes.data.pendingBarbers || [];

        // Calculate statistics
        const totalRevenue = invoices
          .filter((inv) => inv.paymentStatus === 'paid')
          .reduce((sum, inv) => sum + (inv.amount || 0), 0);

        const pendingPayments = invoices
          .filter((inv) => inv.paymentStatus === 'pending')
          .reduce((sum, inv) => sum + (inv.amount || 0), 0);

        const completed = appointments.filter(
          (apt) => apt.status === 'completed'
        ).length;

        // Calculate revenue for current month
        const now = new Date();
        const currentMonth = now.toLocaleString('default', { month: 'numeric', year: 'numeric' });
        const revenueThisMonth = invoices
          .filter((inv) => {
            const invDate = new Date(inv.createdAt);
            const invMonth = invDate.toLocaleString('default', { month: 'numeric', year: 'numeric' });
            return invMonth === currentMonth && inv.paymentStatus === 'paid';
          })
          .reduce((sum, inv) => sum + (inv.amount || 0), 0);

        setStats({
          totalRevenue,
          totalAppointments: appointments.length,
          totalBarbers: barbers.length,
          totalCustomers: 3, // You'd get this from user count
          completedAppointments: completed,
          pendingPayments,
          revenueThisMonth,
        });

        // Group revenue by barber
        const barberRevenue = {};
        invoices.forEach((inv) => {
          const barberId = inv.barberId;
          if (!barberRevenue[barberId]) {
            barberRevenue[barberId] = 0;
          }
          if (inv.paymentStatus === 'paid') {
            barberRevenue[barberId] += inv.amount || 0;
          }
        });

        // Match barber data with revenue
        const barberWithRevenue = barbers
          .map((barber) => ({
            ...barber,
            revenue: barberRevenue[barber._id] || 0,
          }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5);

        setBarberStats(barberWithRevenue);
        setPendingBarbers(pending);
      } catch (err) {
        setError('Failed to load dashboard statistics');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleApproveBarber = async (barberId) => {
    try {
      setApprovingBarber(barberId);
      await barbersAPI.approve(barberId);
      // Refresh pending barbers list
      const res = await barbersAPI.getPending();
      setPendingBarbers(res.data.pendingBarbers || []);
    } catch (err) {
      setError('Failed to approve barber');
      console.error(err);
    } finally {
      setApprovingBarber(null);
    }
  };

  const handleRejectBarber = async (barberId) => {
    try {
      setApprovingBarber(barberId);
      await barbersAPI.reject(barberId);
      // Refresh pending barbers list
      const res = await barbersAPI.getPending();
      setPendingBarbers(res.data.pendingBarbers || []);
    } catch (err) {
      setError('Failed to reject barber');
      console.error(err);
    } finally {
      setApprovingBarber(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg"></div>
          <p className="mt-4">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <main className="container mx-auto px-6 py-8">
        {error && <div className="alert alert-error mb-6">{error}</div>}

        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg p-6 mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back, {user?.name}! 👋</h2>
          <p>Monitor your barber shop operations and business metrics</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Total Revenue */}
          <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl transition">
            <div className="card-body">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-medium opacity-90">Total Revenue</h3>
                  <p className="text-3xl font-bold mt-2">Rs. {stats.totalRevenue}</p>
                </div>
                <span className="text-3xl">💰</span>
              </div>
            </div>
          </div>

          {/* Total Appointments */}
          <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl transition">
            <div className="card-body">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-medium opacity-90">Total Appointments</h3>
                  <p className="text-4xl font-bold mt-2">{stats.totalAppointments}</p>
                </div>
                <span className="text-3xl">📅</span>
              </div>
            </div>
          </div>

          {/* Total Barbers */}
          <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition">
            <div className="card-body">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-medium opacity-90">Active Barbers</h3>
                  <p className="text-4xl font-bold mt-2">{stats.totalBarbers}</p>
                </div>
                <span className="text-3xl">👨‍💼</span>
              </div>
            </div>
          </div>

          {/* This Month Revenue */}
          <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg hover:shadow-xl transition">
            <div className="card-body">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-medium opacity-90">This Month</h3>
                  <p className="text-3xl font-bold mt-2">Rs. {stats.revenueThisMonth}</p>
                </div>
                <span className="text-3xl">📊</span>
              </div>
            </div>
          </div>
        </div>

        {/* Management Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="card shadow-lg">
            <h2 className="text-xl font-bold mb-6 border-b pb-4">Management</h2>
            <div className="space-y-3">
              <button className="btn btn-primary w-full justify-start">
                👤 Manage Barbers
              </button>
              <button className="btn btn-secondary w-full justify-start">
                👥 Manage Customers
              </button>
              <button className="btn btn-secondary w-full justify-start">
                ✂️ Manage Services
              </button>
              <button className="btn btn-secondary w-full justify-start">
                💰 Financial Reports
              </button>
              <button className="btn btn-secondary w-full justify-start">
                📊 Analytics
              </button>
              <button className="btn btn-secondary w-full justify-start">
                ⚙️ Settings
              </button>
            </div>
          </div>

          {/* Business Summary */}
          <div className="lg:col-span-2 card shadow-lg">
            <h2 className="text-xl font-bold mb-6 border-b pb-4">Business Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-gray-600 text-sm">Completed Appointments</p>
                <p className="text-4xl font-bold text-green-600 mt-2">
                  {stats.completedAppointments}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Successful services
                </p>
              </div>

              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-gray-600 text-sm">Pending Payments</p>
                <p className="text-4xl font-bold text-orange-600 mt-2">
                  Rs. {stats.pendingPayments}
                </p>
                <p className="text-xs text-gray-500 mt-2">Awaiting clearance</p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-gray-600 text-sm">Total Customers</p>
                <p className="text-4xl font-bold text-blue-600 mt-2">
                  {stats.totalCustomers}
                </p>
                <p className="text-xs text-gray-500 mt-2">Registered users</p>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-gray-600 text-sm">Collection Rate</p>
                <p className="text-4xl font-bold text-purple-600 mt-2">
                  {stats.totalRevenue > 0
                    ? Math.round((stats.totalRevenue / (stats.totalRevenue + stats.pendingPayments)) * 100)
                    : 0}
                  %
                </p>
                <p className="text-xs text-gray-500 mt-2">Payment success</p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Earning Barbers */}
        <div className="mt-8 card shadow-lg">
          <h2 className="text-xl font-bold mb-6 border-b pb-4">Top Earning Barbers 🏆</h2>

          {barberStats.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No barber data available</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Rank</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Experience
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Rating
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Earnings (Rs.)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {barberStats.map((barber, index) => (
                    <tr
                      key={barber._id}
                      className="border-b hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-4">
                        <span className="badge badge-primary">#{index + 1}</span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-800">
                        {barber.userId?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {barber.experience || 0} years
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        ⭐ {barber.rating || 0}
                      </td>
                      <td className="px-6 py-4 font-bold text-green-600">
                        Rs. {barber.revenue}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pending Barber Approvals */}
        <div className="mt-8 card shadow-lg">
          <h2 className="text-xl font-bold mb-6 border-b pb-4">Pending Barber Approvals ⏳</h2>

          {pendingBarbers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No pending barber applications</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Shop Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Experience
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Specialization
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pendingBarbers.map((barber) => (
                    <tr
                      key={barber._id}
                      className="border-b hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-4 font-semibold text-gray-800">
                        {barber.userId?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {barber.shopName || 'Not specified'}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {barber.experience || 0} years
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {barber.specialization?.join(', ') || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {barber.userId?.email || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApproveBarber(barber._id)}
                            disabled={approvingBarber === barber._id}
                            className="btn btn-sm btn-success text-white"
                          >
                            {approvingBarber === barber._id ? (
                              <span className="loading loading-spinner loading-sm"></span>
                            ) : (
                              '✓ Approve'
                            )}
                          </button>
                          <button
                            onClick={() => handleRejectBarber(barber._id)}
                            disabled={approvingBarber === barber._id}
                            className="btn btn-sm btn-error text-white"
                          >
                            {approvingBarber === barber._id ? (
                              <span className="loading loading-spinner loading-sm"></span>
                            ) : (
                              '✕ Reject'
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
