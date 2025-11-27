import { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { WaiterDashboard } from './components/WaiterDashboard';
import { KitchenDashboard } from './components/KitchenDashboard';
import { CashierDashboard } from './components/CashierDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import type { User, Order } from './utils/api';
import * as api from './utils/api';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(true);

  // Check for existing session
  useEffect(() => {
    const sessionId = localStorage.getItem('cafe_session_id');
    if (sessionId) {
      api.getSession(sessionId)
        .then((userData) => {
          setUser(userData);
        })
        .catch((error) => {
          console.log('Session expired:', error);
          localStorage.removeItem('cafe_session_id');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  // Poll for orders every 2 seconds for real-time updates
  useEffect(() => {
    if (!user || !polling) return;

    const fetchOrders = async () => {
      try {
        const fetchedOrders = await api.getOrders();
        setOrders(fetchedOrders);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      }
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 2000);

    return () => clearInterval(interval);
  }, [user, polling]);

  const handleLogin = async (userData: { name: string; role: User['role'] }) => {
    try {
      const result = await api.login(userData.name, userData.role);
      localStorage.setItem('cafe_session_id', result.sessionId);
      setUser(result.user);
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login gagal. Silakan coba lagi.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('cafe_session_id');
    setUser(null);
    setOrders([]);
  };

  const handleAddOrder = async (orderData: Omit<Order, 'id' | 'timestamp'>) => {
    try {
      setPolling(false);
      const newOrder = await api.createOrder(orderData);
      setOrders((prev) => [newOrder, ...prev]);
      setPolling(true);
    } catch (error) {
      console.error('Failed to create order:', error);
      alert('Gagal membuat pesanan. Silakan coba lagi.');
      setPolling(true);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      setPolling(false);
      const updatedOrder = await api.updateOrderStatus(orderId, status);
      setOrders((prev) =>
        prev.map((order) => (order.id === orderId ? updatedOrder : order))
      );
      setPolling(true);
    } catch (error) {
      console.error('Failed to update order status:', error);
      alert('Gagal mengubah status pesanan. Silakan coba lagi.');
      setPolling(true);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      setPolling(false);
      await api.deleteOrder(orderId);
      setOrders((prev) => prev.filter((order) => order.id !== orderId));
      setPolling(true);
    } catch (error) {
      console.error('Failed to delete order:', error);
      alert('Gagal menghapus pesanan. Silakan coba lagi.');
      setPolling(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {user.role === 'waiter' && (
        <WaiterDashboard
          user={user}
          orders={orders}
          onAddOrder={handleAddOrder}
          onLogout={handleLogout}
        />
      )}
      {user.role === 'kitchen' && (
        <KitchenDashboard
          user={user}
          orders={orders}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onLogout={handleLogout}
        />
      )}
      {user.role === 'cashier' && (
        <CashierDashboard
          user={user}
          orders={orders}
          onAddOrder={handleAddOrder}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onLogout={handleLogout}
        />
      )}
      {user.role === 'admin' && (
        <AdminDashboard
          user={user}
          orders={orders}
          onAddOrder={handleAddOrder}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onDeleteOrder={handleDeleteOrder}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}
