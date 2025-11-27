import { LogOut, Clock, CheckCircle } from 'lucide-react';
import type { User, Order } from '../utils/api';

type Props = {
  user: User;
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
  onLogout: () => void;
};

export function KitchenDashboard({ user, orders, onUpdateOrderStatus, onLogout }: Props) {
  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const cookingOrders = orders.filter((o) => o.status === 'cooking');
  const readyOrders = orders.filter((o) => o.status === 'ready');

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-orange-600 text-white p-4 sticky top-0 z-10 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1>Dapur</h1>
            <p className="text-orange-100">{user.name}</p>
          </div>
          <button
            onClick={onLogout}
            className="p-2 bg-orange-700 rounded-lg hover:bg-orange-800"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-gray-800">Pesanan Baru</h2>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full">
              {pendingOrders.length}
            </span>
          </div>
          {pendingOrders.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Tidak ada pesanan baru</p>
          ) : (
            <div className="space-y-3">
              {pendingOrders.map((order) => (
                <div key={order.id} className="border-2 border-yellow-300 rounded-lg p-4 bg-yellow-50">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-gray-800">Meja {order.tableNumber}</span>
                      <div className="text-sm text-gray-600">Waiter: {order.waiterName}</div>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500 text-sm">
                      <Clock className="w-4 h-4" />
                      {formatTime(order.timestamp)}
                    </div>
                  </div>
                  <div className="space-y-2 mb-3">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-white p-2 rounded">
                        <span className="text-gray-800">{item.name}</span>
                        <span className="px-2 py-1 bg-gray-100 rounded">x{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => onUpdateOrderStatus(order.id, 'cooking')}
                    className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700"
                  >
                    Mulai Masak
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-gray-800">Sedang Dimasak</h2>
            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full">
              {cookingOrders.length}
            </span>
          </div>
          {cookingOrders.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Tidak ada pesanan yang sedang dimasak</p>
          ) : (
            <div className="space-y-3">
              {cookingOrders.map((order) => (
                <div key={order.id} className="border-2 border-orange-300 rounded-lg p-4 bg-orange-50">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-gray-800">Meja {order.tableNumber}</span>
                      <div className="text-sm text-gray-600">Waiter: {order.waiterName}</div>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500 text-sm">
                      <Clock className="w-4 h-4" />
                      {formatTime(order.timestamp)}
                    </div>
                  </div>
                  <div className="space-y-2 mb-3">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-white p-2 rounded">
                        <span className="text-gray-800">{item.name}</span>
                        <span className="px-2 py-1 bg-gray-100 rounded">x{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => onUpdateOrderStatus(order.id, 'ready')}
                    className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Selesai
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-gray-800">Siap Diantar</h2>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full">
              {readyOrders.length}
            </span>
          </div>
          {readyOrders.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Tidak ada pesanan yang siap</p>
          ) : (
            <div className="space-y-3">
              {readyOrders.map((order) => (
                <div key={order.id} className="border-2 border-green-300 rounded-lg p-4 bg-green-50">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-gray-800">Meja {order.tableNumber}</span>
                      <div className="text-sm text-gray-600">Waiter: {order.waiterName}</div>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500 text-sm">
                      <Clock className="w-4 h-4" />
                      {formatTime(order.timestamp)}
                    </div>
                  </div>
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-white p-2 rounded">
                        <span className="text-gray-800">{item.name}</span>
                        <span className="px-2 py-1 bg-gray-100 rounded">x{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
