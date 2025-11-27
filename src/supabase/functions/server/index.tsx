import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

app.use('*', cors());
app.use('*', logger(console.log));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Helper function to verify auth
async function verifyAuth(request: Request) {
  const accessToken = request.headers.get('Authorization')?.split(' ')[1];
  if (!accessToken) {
    return null;
  }
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  if (error || !user) {
    return null;
  }
  return user;
}

// Login endpoint (simplified for demo - creates user if not exists)
app.post('/make-server-5c8448d5/auth/login', async (c) => {
  try {
    const { name, role } = await c.req.json();
    
    if (!name || !role) {
      return c.json({ error: 'Name and role are required' }, 400);
    }

    // For demo purposes, we'll create a simple session without full auth
    // In production, you'd use proper Supabase auth
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const userData = {
      name,
      role,
      sessionId,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`user:${sessionId}`, userData);

    return c.json({ 
      success: true, 
      sessionId,
      user: userData 
    });
  } catch (error) {
    console.log('Login error:', error);
    return c.json({ error: 'Login failed', details: String(error) }, 500);
  }
});

// Get user session
app.get('/make-server-5c8448d5/auth/session', async (c) => {
  try {
    const sessionId = c.req.query('sessionId');
    if (!sessionId) {
      return c.json({ error: 'Session ID required' }, 400);
    }

    const userData = await kv.get(`user:${sessionId}`);
    if (!userData) {
      return c.json({ error: 'Session not found' }, 404);
    }

    return c.json({ success: true, user: userData });
  } catch (error) {
    console.log('Get session error:', error);
    return c.json({ error: 'Failed to get session', details: String(error) }, 500);
  }
});

// Create new order
app.post('/make-server-5c8448d5/orders', async (c) => {
  try {
    const orderData = await c.req.json();
    
    if (!orderData.tableNumber || !orderData.items || !orderData.waiterName) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const order = {
      id: orderId,
      ...orderData,
      timestamp: new Date().toISOString(),
      status: orderData.status || 'pending',
    };

    await kv.set(`order:${orderId}`, order);
    
    // Also add to orders list for quick retrieval
    const ordersList = await kv.get('orders:list') || [];
    ordersList.unshift(orderId);
    await kv.set('orders:list', ordersList);

    return c.json({ success: true, order });
  } catch (error) {
    console.log('Create order error:', error);
    return c.json({ error: 'Failed to create order', details: String(error) }, 500);
  }
});

// Get all orders
app.get('/make-server-5c8448d5/orders', async (c) => {
  try {
    const ordersList = await kv.get('orders:list') || [];
    const orders = await kv.mget(ordersList.map((id: string) => `order:${id}`));
    
    // Filter out null values and sort by timestamp
    const validOrders = orders.filter(order => order !== null)
      .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return c.json({ success: true, orders: validOrders });
  } catch (error) {
    console.log('Get orders error:', error);
    return c.json({ error: 'Failed to get orders', details: String(error) }, 500);
  }
});

// Update order status
app.put('/make-server-5c8448d5/orders/:id/status', async (c) => {
  try {
    const orderId = c.req.param('id');
    const { status } = await c.req.json();

    if (!status) {
      return c.json({ error: 'Status is required' }, 400);
    }

    const order = await kv.get(`order:${orderId}`);
    if (!order) {
      return c.json({ error: 'Order not found' }, 404);
    }

    const updatedOrder = { ...order, status };
    await kv.set(`order:${orderId}`, updatedOrder);

    return c.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.log('Update order status error:', error);
    return c.json({ error: 'Failed to update order status', details: String(error) }, 500);
  }
});

// Delete order
app.delete('/make-server-5c8448d5/orders/:id', async (c) => {
  try {
    const orderId = c.req.param('id');

    const order = await kv.get(`order:${orderId}`);
    if (!order) {
      return c.json({ error: 'Order not found' }, 404);
    }

    await kv.del(`order:${orderId}`);
    
    // Remove from orders list
    const ordersList = await kv.get('orders:list') || [];
    const updatedList = ordersList.filter((id: string) => id !== orderId);
    await kv.set('orders:list', updatedList);

    return c.json({ success: true });
  } catch (error) {
    console.log('Delete order error:', error);
    return c.json({ error: 'Failed to delete order', details: String(error) }, 500);
  }
});

// Health check
app.get('/make-server-5c8448d5/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

Deno.serve(app.fetch);
