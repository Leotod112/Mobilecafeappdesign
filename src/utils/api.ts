import { projectId, publicAnonKey } from './supabase/info';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-5c8448d5`;

export type Order = {
  id: string;
  tableNumber: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  status: 'pending' | 'cooking' | 'ready' | 'completed';
  waiterName: string;
  timestamp: string;
};

export type User = {
  name: string;
  role: 'waiter' | 'kitchen' | 'cashier' | 'admin';
  sessionId: string;
};

export async function login(name: string, role: string): Promise<{ sessionId: string; user: User }> {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${publicAnonKey}`,
    },
    body: JSON.stringify({ name, role }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }

  return response.json();
}

export async function getSession(sessionId: string): Promise<User> {
  const response = await fetch(`${BASE_URL}/auth/session?sessionId=${sessionId}`, {
    headers: {
      Authorization: `Bearer ${publicAnonKey}`,
    },
  });

  if (!response.ok) {
    throw new Error('Session not found');
  }

  const data = await response.json();
  return data.user;
}

export async function createOrder(orderData: Omit<Order, 'id' | 'timestamp'>): Promise<Order> {
  const response = await fetch(`${BASE_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${publicAnonKey}`,
    },
    body: JSON.stringify(orderData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create order');
  }

  const data = await response.json();
  return data.order;
}

export async function getOrders(): Promise<Order[]> {
  const response = await fetch(`${BASE_URL}/orders`, {
    headers: {
      Authorization: `Bearer ${publicAnonKey}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get orders');
  }

  const data = await response.json();
  return data.orders;
}

export async function updateOrderStatus(orderId: string, status: Order['status']): Promise<Order> {
  const response = await fetch(`${BASE_URL}/orders/${orderId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${publicAnonKey}`,
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update order status');
  }

  const data = await response.json();
  return data.order;
}

export async function deleteOrder(orderId: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/orders/${orderId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${publicAnonKey}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete order');
  }
}
