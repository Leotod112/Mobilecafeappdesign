import { useState } from 'react';
import { Plus, ShoppingCart, LogOut, Trash2, Clock } from 'lucide-react';
import type { User, Order } from '../utils/api';
import { menuItems } from '../data/menu';

type Props = {
  user: User;
  orders: Order[];
  onAddOrder: (order: Omit<Order, 'id' | 'timestamp'>) => void;
  onLogout: () => void;
};

type CartItem = { name: string; quantity: number; price: number };

export function WaiterDashboard({ user, orders, onAddOrder, onLogout }: Props) {
  const [tableNumber, setTableNumber] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showMenu, setShowMenu] = useState(false);

  const addToCart = (item: { name: string; price: number }) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.name === item.name);
      if (existing) {
        return prev.map((i) =>
          i.name === item.name ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (name: string) => {
    setCart((prev) => prev.filter((i) => i.name !== name));
  };

  const updateQuantity = (name: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(name);
      return;
    }
    setCart((prev) =>
      prev.map((i) => (i.name === name ? { ...i, quantity } : i))
    );
  };

  const handleSubmitOrder = () => {
    if (!tableNumber.trim() || cart.length === 0) return;

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    onAddOrder({
      tableNumber: tableNumber.trim(),
      items: cart,
      total,
      status: 'pending',
      waiterName: user.name,
    });

    setTableNumber('');
    setCart([]);
    setShowMenu(false);
  };

  const myOrders = orders.filter((o) => o.waiterName === user.name);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-blue-600 text-white p-4 sticky top-0 z-10 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1>Waiter Dashboard</h1>
            <p className="text-blue-100">{user.name}</p>
          </div>
          <button
            onClick={onLogout}
            className="p-2 bg-blue-700 rounded-lg hover:bg-blue-800"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-white rounded-xl shadow-md p-4">
          <h2 className="text-gray-800 mb-3">Pesanan Baru</h2>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Nomor Meja</label>
            <input
              type="text"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              placeholder="Contoh: 5"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={() => setShowMenu(!showMenu)}
            className="w-full bg-blue-600 text-white py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            Tambah Menu
          </button>

          {showMenu && (
            <div className="mt-4 border-t pt-4">
              <h3 className="text-gray-800 mb-3">Pilih Menu</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {menuItems.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => addToCart(item)}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                  >
                    <div className="text-left">
                      <div className="text-gray-800">{item.name}</div>
                      <div className="text-gray-500 text-sm">{item.category}</div>
                    </div>
                    <div className="text-blue-600">Rp {item.price.toLocaleString()}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {cart.length > 0 && (
            <div className="mt-4 border-t pt-4">
              <div className="flex items-center gap-2 mb-3">
                <ShoppingCart className="w-5 h-5 text-gray-600" />
                <h3 className="text-gray-800">Keranjang</h3>
              </div>
              <div className="space-y-2 mb-4">
                {cart.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="text-gray-800">{item.name}</div>
                      <div className="text-gray-500 text-sm">
                        Rp {item.price.toLocaleString()} x {item.quantity}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.name, item.quantity - 1)}
                        className="w-8 h-8 bg-gray-200 rounded-lg hover:bg-gray-300"
                      >
                        -
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.name, item.quantity + 1)}
                        className="w-8 h-8 bg-gray-200 rounded-lg hover:bg-gray-300"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeFromCart(item.name)}
                        className="ml-2 p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mb-4 p-3 bg-blue-50 rounded-lg">
                <span className="text-gray-700">Total</span>
                <span className="text-blue-600">
                  Rp {cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString()}
                </span>
              </div>
              <button
                onClick={handleSubmitOrder}
                disabled={!tableNumber.trim()}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Submit Pesanan
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-md p-4">
          <h2 className="text-gray-800 mb-3">Pesanan Saya</h2>
          {myOrders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Belum ada pesanan</p>
          ) : (
            <div className="space-y-3">
              {myOrders.map((order) => (
                <div key={order.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-800">Meja {order.tableNumber}</span>
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
                  <div className="text-sm text-gray-600 space-y-1">
                    {order.items.map((item, idx) => (
                      <div key={idx}>
                        {item.quantity}x {item.name}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t">
                    <div className="flex items-center gap-1 text-gray-500 text-sm">
                      <Clock className="w-4 h-4" />
                      {formatTime(order.timestamp)}
                    </div>
                    <span className="text-blue-600">Rp {order.total.toLocaleString()}</span>
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
