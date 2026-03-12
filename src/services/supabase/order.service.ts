import { supabase, Database } from '../../config/supabase';

type Order = Database['public']['Tables']['orders']['Row'];
type OrderInsert = Database['public']['Tables']['orders']['Insert'];
type OrderUpdate = Database['public']['Tables']['orders']['Update'];

class OrderService {
  /**
   * Get all orders with optional filters
   */
  async getOrders(filters?: {
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    let query = supabase
      .from('orders')
      .select('*', { count: 'exact' });

    // Apply filters
    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    if (filters?.search) {
      query = query.or(`customer_name.ilike.%${filters.search}%,customer_email.ilike.%${filters.search}%`);
    }

    // Apply pagination
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }

    const { data, error, count } = await query.order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return { data, count };
  }

  /**
   * Get order by ID
   */
  async getOrderById(id: string) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  /**
   * Create new order
   */
  async createOrder(order: OrderInsert) {
    const { data, error } = await supabase
      .from('orders')
      .insert(order)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  /**
   * Update order
   */
  async updateOrder(id: string, updates: OrderUpdate) {
    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  /**
   * Delete order
   */
  async deleteOrder(id: string) {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Get recent orders
   */
  async getRecentOrders(limit: number = 10) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  /**
   * Get order statistics
   */
  async getOrderStats() {
    // Get total orders
    const { count: totalOrders, error: totalError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    if (totalError) {
      throw new Error(totalError.message);
    }

    // Get pending orders
    const { count: pendingOrders, error: pendingError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    if (pendingError) {
      throw new Error(pendingError.message);
    }

    // Get total revenue
    const { data: revenueData, error: revenueError } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('status', 'completed');

    if (revenueError) {
      throw new Error(revenueError.message);
    }

    const totalRevenue = revenueData?.reduce((sum, order) => sum + order.total_amount, 0) || 0;

    return {
      totalOrders: totalOrders || 0,
      pendingOrders: pendingOrders || 0,
      totalRevenue,
    };
  }
}

export const orderService = new OrderService();
