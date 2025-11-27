import { useState } from 'react';
import { LogOut, TrendingUp, Clock, Trash2, BarChart3 } from 'lucide-react';
import type { User, Order } from '../utils/api';

type Props = {
  user: User;
  orders: Order[];
  onAddOrder: (order: Omit<Order, 'id' | 'timestamp'>) => void;
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
  onDeleteOrder: (orderId: string) => void;
  onLogout: () => void;
};

export function AdminDashboard({ user, orders, onUpdateOrderStatus, onDeleteOrder, onLogout }: Props) {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders'>('overview');

  const todayRevenue = orders
    .filter((o) => o.status === 'completed')
    .reduce((sum, order) => sum + order.total, 0);
  
  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const cookingCount = orders.filter((o) => o.status === 'cooking').length;
  const readyCount = orders.filter((o) => o.status === 'ready').length;
  const completedCount = orders.filter((o) => o.status === 'completed').length;

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-purple-600 text-white p-4 sticky top-0 z-10 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1>Admin Dashboard</h1>
            <p className="text-purple-100">{user.name}</p>
          </div>
          <button
            onClick={onLogout}
            className="p-2 bg-purple-700 rounded-lg hover:bg-purple-800"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex border-b bg-white sticky top-[88px] z-10">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-3 ${
            activeTab === 'overview'
              ? 'border-b-2 border-purple-600 text-purple-600'
              : 'text-gray-600'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex-1 py-3 ${
            activeTab === 'orders'
              ? 'border-b-2 border-purple-600 text-purple-600'
              : 'text-gray-600'
          }`}
        >
          Semua Pesanan
        </button>
      </div>

      <div className="p-4">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-md p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <h2 className="text-gray-800">Pendapatan Hari Ini</h2>
              </div>
              <div className="text-purple-600 text-3xl">
                Rp {todayRevenue.toLocaleString()}
              </div>
              <div className="text-gray-500 text-sm mt-1">
                Dari {completedCount} pesanan selesai
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-4">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                <h2 className="text-gray-800">Status Pesanan</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <div className="text-yellow-700 text-sm">Menunggu</div>
                  <div className="text-yellow-900 text-2xl">{pendingCount}</div>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg">
                  <div className="text-orange-700 text-sm">Dimasak</div>
                  <div className="text-orange-900 text-2xl">{cookingCount}</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-green-700 text-sm">Siap</div>
                  <div className="text-green-900 text-2xl">{readyCount}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-gray-700 text-sm">Selesai</div>
                  <div className="text-gray-900 text-2xl">{completedCount}</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-4">
              <h2 className="text-gray-800 mb-3">Total Pesanan</h2>
              <div className="text-purple-600 text-3xl">{orders.length}</div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-3">
            {orders.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Belum ada pesanan</p>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="bg-white rounded-xl shadow-md p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-gray-800">Meja {order.tableNumber}</span>
                      <div className="text-sm text-gray-600">Waiter: {order.waiterName}</div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        order.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : order.status === 'cooking'
                          ? 'bg-orange-100 text-orange-700'
                          : order.status === 'ready'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {order.status === 'pending' && 'Menunggu'}
                      {order.status === 'cooking' && 'Dimasak'}
                      {order.status === 'ready' && 'Siap'}
                      {order.status === 'completed' && 'Selesai'}
                    </span>
                  </div>
                  <div className="space-y-2 mb-3">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">
                          {item.quantity}x {item.name}
                        </span>
                        <span className="text-gray-600">
                          Rp {(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t mb-3">
                    <div className="flex items-center gap-1 text-gray-500 text-sm">
                      <Clock className="w-4 h-4" />
                      {formatTime(order.timestamp)}
                    </div>
                    <span className="text-purple-600">Rp {order.total.toLocaleString()}</span>
                  </div>
                  <div className="flex gap-2">
                    {order.status !== 'completed' && (
                      <select
                        value={order.status}
                        onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as Order['status'])}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="pending">Menunggu</option>
                        <option value="cooking">Dimasak</option>
                        <option value="ready">Siap</option>
                        <option value="completed">Selesai</option>
                      </select>
                    )}
                    <button
                      onClick={() => onDeleteOrder(order.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
