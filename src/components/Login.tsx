import { useState } from 'react';
import { Coffee, User, ChefHat, Calculator, Shield } from 'lucide-react';

type Props = {
  onLogin: (user: { name: string; role: 'waiter' | 'kitchen' | 'cashier' | 'admin' }) => void;
};

export function Login({ onLogin }: Props) {
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState<'waiter' | 'kitchen' | 'cashier' | 'admin' | null>(null);
  const [loading, setLoading] = useState(false);

  const roles = [
    { id: 'waiter', label: 'Waiter', icon: User, color: 'bg-blue-500' },
    { id: 'kitchen', label: 'Dapur', icon: ChefHat, color: 'bg-orange-500' },
    { id: 'cashier', label: 'Kasir', icon: Calculator, color: 'bg-green-500' },
    { id: 'admin', label: 'Admin', icon: Shield, color: 'bg-purple-500' },
  ] as const;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && selectedRole) {
      setLoading(true);
      try {
        await onLogin({ name: name.trim(), role: selectedRole });
      } catch (error) {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-600 rounded-full mb-4">
            <Coffee className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-amber-900">Cafe Management System</h1>
          <p className="text-amber-700">Pilih role untuk melanjutkan</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-6 space-y-6">
          <div>
            <label className="block text-gray-700 mb-2">Nama</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masukkan nama Anda"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-3">Pilih Role</label>
            <div className="grid grid-cols-2 gap-3">
              {roles.map((role) => {
                const Icon = role.icon;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setSelectedRole(role.id as 'waiter' | 'kitchen' | 'cashier' | 'admin')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedRole === role.id
                        ? `${role.color} border-transparent text-white`
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-8 h-8 mx-auto mb-2" />
                    <div className="text-sm">{role.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={!name.trim() || !selectedRole || loading}
            className="w-full bg-amber-600 text-white py-3 rounded-lg hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Memuat...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
