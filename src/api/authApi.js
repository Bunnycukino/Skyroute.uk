import { base44 } from '@/base44/api/base44Client';

const USERS_ENTITY = 'users';

/**
 * Authentication API
 */
export const authApi = {
  /**
   * Register a new user
   */
  register: async (userData) => {
    try {
      const { email, password, fullName } = userData;

      // Check if user already exists
      const existingUser = await authApi.getUserByEmail(email);
      if (existingUser.success && existingUser.data) {
        throw new Error('User already exists with this email');
      }

      // Hash password (in production, use proper encryption)
      const hashedPassword = btoa(password); // Basic encoding - replace with proper hashing

      const newUser = {
        email,
        password: hashedPassword,
        fullName: fullName || '',
        role: 'user',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLogin: null
      };

      const result = await base44.entity(USERS_ENTITY).create(newUser);
      
      // Remove password from response
      delete result.password;
      
      return { success: true, data: result };
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error(`Failed to register user: ${error.message}`);
    }
  },

  /**
   * Login user
   */
  login: async (email, password) => {
    try {
      const userResult = await authApi.getUserByEmail(email);
      
      if (!userResult.success || !userResult.data) {
        throw new Error('Invalid email or password');
      }

      const user = userResult.data;

      // Verify password
      const hashedPassword = btoa(password);
      if (user.password !== hashedPassword) {
        throw new Error('Invalid email or password');
      }

      if (user.status !== 'active') {
        throw new Error('Account is inactive. Please contact administrator.');
      }

      // Update last login
      await base44.entity(USERS_ENTITY).update(user.id, {
        lastLogin: new Date().toISOString()
      });

      // Create session
      const session = {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        loggedIn: true,
        timestamp: Date.now()
      };

      // Store in localStorage
      localStorage.setItem('skyroute_auth', JSON.stringify(session));

      return { success: true, data: session };
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed');
    }
  },

  /**
   * Logout user
   */
  logout: () => {
    try {
      localStorage.removeItem('skyroute_auth');
      return { success: true, message: 'Logged out successfully' };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, message: 'Logout failed' };
    }
  },

  /**
   * Get current session
   */
  getCurrentSession: () => {
    try {
      const auth = localStorage.getItem('skyroute_auth');
      if (auth) {
        const session = JSON.parse(auth);
        return { success: true, data: session };
      }
      return { success: false, data: null };
    } catch (error) {
      console.error('Session check error:', error);
      return { success: false, data: null };
    }
  },

  /**
   * Get user by email
   */
  getUserByEmail: async (email) => {
    try {
      const results = await base44.entity(USERS_ENTITY)
        .find()
        .where('email', '==', email)
        .get();
      
      if (results.length === 0) {
        return { success: false, data: null };
      }
      
      return { success: true, data: results[0] };
    } catch (error) {
      console.error('User lookup error:', error);
      return { success: false, data: null };
    }
  },

  /**
   * Request password reset
   */
  requestPasswordReset: async (email) => {
    try {
      const userResult = await authApi.getUserByEmail(email);
      
      if (!userResult.success || !userResult.data) {
        // Don't reveal if user exists for security
        return { success: true, message: 'If the email exists, reset instructions have been sent' };
      }

      const user = userResult.data;
      
      // Generate reset token (in production, use proper token generation)
      const resetToken = generateResetToken();
      const resetExpiry = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

      // Store reset token
      await base44.entity(USERS_ENTITY).update(user.id, {
        resetToken,
        resetExpiry,
        updatedAt: new Date().toISOString()
      });

      // In production, send email with reset link
      console.log(`Password reset requested for ${email}`);
      console.log(`Reset token: ${resetToken}`);

      return { 
        success: true, 
        message: 'If the email exists, reset instructions have been sent',
        // For development only - remove in production
        devToken: resetToken
      };
    } catch (error) {
      console.error('Password reset error:', error);
      return { success: true, message: 'If the email exists, reset instructions have been sent' };
    }
  },

  /**
   * Reset password with token
   */
  resetPassword: async (email, token, newPassword) => {
    try {
      const userResult = await authApi.getUserByEmail(email);
      
      if (!userResult.success || !userResult.data) {
        throw new Error('Invalid reset token');
      }

      const user = userResult.data;

      // Verify token
      if (user.resetToken !== token) {
        throw new Error('Invalid reset token');
      }

      // Check if token expired
      if (new Date() > new Date(user.resetExpiry)) {
        throw new Error('Reset token has expired');
      }

      // Update password
      const hashedPassword = btoa(newPassword);
      await base44.entity(USERS_ENTITY).update(user.id, {
        password: hashedPassword,
        resetToken: null,
        resetExpiry: null,
        updatedAt: new Date().toISOString()
      });

      return { success: true, message: 'Password reset successfully' };
    } catch (error) {
      console.error('Password reset error:', error);
      throw new Error(error.message || 'Failed to reset password');
    }
  },

  /**
   * Change password (for logged in user)
   */
  changePassword: async (userId, currentPassword, newPassword) => {
    try {
      const user = await base44.entity(USERS_ENTITY).findById(userId).get();
      
      // Verify current password
      const currentHashed = btoa(currentPassword);
      if (user.password !== currentHashed) {
        throw new Error('Current password is incorrect');
      }

      // Update to new password
      const newHashed = btoa(newPassword);
      await base44.entity(USERS_ENTITY).update(userId, {
        password: newHashed,
        updatedAt: new Date().toISOString()
      });

      return { success: true, message: 'Password changed successfully' };
    } catch (error) {
      console.error('Password change error:', error);
      throw new Error(error.message || 'Failed to change password');
    }
  },

  /**
   * Get all users (admin only)
   */
  getAllUsers: async () => {
    try {
      const results = await base44.entity(USERS_ENTITY)
        .find()
        .orderBy('createdAt', 'desc')
        .get();
      
      // Remove passwords from response
      const users = results.map(user => {
        const { password, resetToken, ...userData } = user;
        return userData;
      });

      return { success: true, data: users, count: users.length };
    } catch (error) {
      console.error('Get users error:', error);
      return { success: true, data: [], count: 0 };
    }
  },

  /**
   * Update user status (admin only)
   */
  updateUserStatus: async (userId, status) => {
    try {
      await base44.entity(USERS_ENTITY).update(userId, {
        status,
        updatedAt: new Date().toISOString()
      });

      return { success: true, message: 'User status updated' };
    } catch (error) {
      console.error('Update status error:', error);
      throw new Error('Failed to update user status');
    }
  }
};

/**
 * Helper function to generate reset token
 */
function generateResetToken() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15) +
         Date.now().toString(36);
}

export default authApi;