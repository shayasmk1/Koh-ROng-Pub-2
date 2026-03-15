import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { motion } from 'motion/react';
import { Users, Ticket, DollarSign, Calendar } from 'lucide-react';

export default function AdminDashboard() {
  const { userData } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userData?.role !== 'admin') return;

    const fetchData = async () => {
      try {
        const ordersSnapshot = await getDocs(query(collection(db, 'orders'), orderBy('created_at', 'desc')));
        const ticketsSnapshot = await getDocs(query(collection(db, 'tickets'), orderBy('created_at', 'desc')));
        
        setOrders(ordersSnapshot.docs.map(doc => doc.data()));
        setTickets(ticketsSnapshot.docs.map(doc => doc.data()));
      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userData]);

  if (userData?.role !== 'admin') {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-500 mb-4">Access Denied</h1>
          <p className="text-gray-400">You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff6a00]"></div>
      </div>
    );
  }

  const totalRevenue = orders.filter(o => o.status === 'paid').reduce((sum, order) => sum + order.amount, 0);
  const totalTicketsSold = tickets.length;
  const checkedInTickets = tickets.filter(t => t.checked_in).length;

  return (
    <div className="pt-24 pb-12 min-h-screen bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Overview of sales and check-ins.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900 p-6 rounded-2xl border border-white/5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400 font-medium">Total Revenue</h3>
              <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
            <p className="text-3xl font-bold">${totalRevenue.toFixed(2)}</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-zinc-900 p-6 rounded-2xl border border-white/5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400 font-medium">Tickets Sold</h3>
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                <Ticket className="w-6 h-6" />
              </div>
            </div>
            <p className="text-3xl font-bold">{totalTicketsSold}</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-zinc-900 p-6 rounded-2xl border border-white/5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400 font-medium">Checked In</h3>
              <div className="p-2 bg-[#ff6a00]/10 rounded-lg text-[#ff6a00]">
                <Users className="w-6 h-6" />
              </div>
            </div>
            <p className="text-3xl font-bold">{checkedInTickets} <span className="text-sm text-gray-500 font-normal">/ {totalTicketsSold}</span></p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-zinc-900 p-6 rounded-2xl border border-white/5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400 font-medium">Upcoming Events</h3>
              <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                <Calendar className="w-6 h-6" />
              </div>
            </div>
            <p className="text-3xl font-bold">3</p>
          </motion.div>
        </div>

        {/* Recent Orders Table */}
        <div className="bg-zinc-900 rounded-2xl border border-white/5 overflow-hidden">
          <div className="px-6 py-5 border-b border-white/5">
            <h3 className="text-xl font-bold">Recent Orders</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-black/50 text-gray-400 text-sm uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-medium">Order ID</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Event Date</th>
                  <th className="px-6 py-4 font-medium">Qty</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.slice(0, 10).map((order) => (
                  <tr key={order.order_id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-mono text-sm text-gray-300">{order.order_id}</td>
                    <td className="px-6 py-4 text-sm text-gray-400">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm">{order.event_date}</td>
                    <td className="px-6 py-4 text-sm">{order.quantity}</td>
                    <td className="px-6 py-4 text-sm font-medium">${order.amount.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'paid' ? 'bg-green-500/10 text-green-500' : 
                        order.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' : 
                        'bg-red-500/10 text-red-500'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No orders found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
