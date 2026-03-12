import { supabase } from '../../config/supabase';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

class AuthService {
  /**
   * Login with email and password
   */
  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  /**
   * Logout current user
   */
  async logout() {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw new Error(error.message);
    }
    
    localStorage.removeItem('adminUser');
  }

  /**
   * Get current session
   */
  async getCurrentSession() {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data.session;
  }

  /**
   * Get current user
   */
  async getCurrentUser() {
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data.user;
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const session = await this.getCurrentSession();
    return !!session;
  }

  /**
   * Sign up new admin user (usually restricted)
   */
  async signUp(email: string, password: string, metadata?: { name?: string }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  /**
   * Reset password
   */
  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    
    if (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Check user role (requires RLS policies or custom claims)
   */
  async checkAdminRole(): Promise<boolean> {
    const user = await this.getCurrentUser();
    
    if (!user) return false;
    
    // Check if user has admin role in metadata
    return user.user_metadata?.role === 'admin';
  }
}

export const authService = new AuthService();
