import { base44 } from '@/base44/api/base44Client';

// Entity names for Base44
const ENTITIES = {
  C209: 'c209_entries',
  C208: 'c208_entries',
  USERS: 'users'
};

/**
 * C209 API - Complete CRUD operations for C209 entries
 */
export const c209Api = {
  /**
   * Create a new C209 entry (RAMP INPUT)
   */
  create: async (data) => {
    try {
      const entry = {
        containerCode: data.containerCode,
        pieces: data.pieces,
        flight: data.flight || '',
        signature: data.signature || '',
        c209Number: generateC209Number(),
        status: 'pending',
        dateReceived: new Date().toISOString(),
        createdBy: getCurrentUser(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const result = await base44.entity(ENTITIES.C209).create(entry);
      return { success: true, data: result, c209Number: entry.c209Number };
    } catch (error) {
      console.error('C209 creation error:', error);
      throw new Error(`Failed to create C209 entry: ${error.message}`);
    }
  },

  /**
   * Get all C209 entries with pagination
   */
  getAll: async (options = {}) => {
    try {
      const { page = 1, limit = 50, status, sortBy = 'createdAt', sortOrder = 'desc' } = options;
      
      let query = base44.entity(ENTITIES.C209).find();
      
      if (status) {
        query = query.where('status', '==', status);
      }
      
      query = query.orderBy(sortBy, sortOrder).limit(limit);
      
      const results = await query.get();
      return { success: true, data: results, count: results.length };
    } catch (error) {
      console.error('C209 fetch error:', error);
      throw new Error(`Failed to fetch C209 entries: ${error.message}`);
    }
  },

  /**
   * Get a single C209 entry by ID or C209 number
   */
  getById: async (id) => {
    try {
      const result = await base44.entity(ENTITIES.C209).findById(id).get();
      return { success: true, data: result };
    } catch (error) {
      console.error('C209 fetch error:', error);
      throw new Error(`Failed to fetch C209 entry: ${error.message}`);
    }
  },

  /**
   * Get C209 entry by C209 number
   */
  getByC209Number: async (c209Number) => {
    try {
      const results = await base44.entity(ENTITIES.C209)
        .find()
        .where('c209Number', '==', c209Number)
        .get();
      
      if (results.length === 0) {
        return { success: false, message: 'C209 entry not found' };
      }
      
      return { success: true, data: results[0] };
    } catch (error) {
      console.error('C209 lookup error:', error);
      throw new Error(`Failed to find C209 entry: ${error.message}`);
    }
  },

  /**
   * Update a C209 entry
   */
  update: async (id, data) => {
    try {
      const updateData = {
        ...data,
        updatedAt: new Date().toISOString(),
        updatedBy: getCurrentUser()
      };
      
      const result = await base44.entity(ENTITIES.C209).update(id, updateData);
      return { success: true, data: result };
    } catch (error) {
      console.error('C209 update error:', error);
      throw new Error(`Failed to update C209 entry: ${error.message}`);
    }
  },

  /**
   * Delete a C209 entry
   */
  delete: async (id) => {
    try {
      await base44.entity(ENTITIES.C209).delete(id);
      return { success: true, message: 'C209 entry deleted successfully' };
    } catch (error) {
      console.error('C209 delete error:', error);
      throw new Error(`Failed to delete C209 entry: ${error.message}`);
    }
  },

  /**
   * Check for expired C209 entries (24 hours)
   */
  getExpired: async () => {
    try {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      const results = await base44.entity(ENTITIES.C209)
        .find()
        .where('createdAt', '<', twentyFourHoursAgo)
        .where('status', '==', 'pending')
        .get();
      
      return { success: true, data: results, count: results.length };
    } catch (error) {
      console.error('Expired C209 check error:', error);
      return { success: true, data: [], count: 0 };
    }
  }
};

/**
 * C208 API - Complete CRUD operations for C208 entries (LOGISTIC INPUT)
 */
export const c208Api = {
  /**
   * Create a new C208 entry
   */
  create: async (data) => {
    try {
      const entry = {
        c209Number: data.c209Number,
        c208Number: generateC208Number(),
        destination: data.destination || '',
        weight: data.weight || 0,
        flight: data.flight || '',
        remarks: data.remarks || '',
        status: 'completed',
        completedBy: getCurrentUser(),
        completedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const result = await base44.entity(ENTITIES.C208).create(entry);
      
      // Update corresponding C209 entry status
      await c209Api.updateStatus(data.c209Id, 'completed');
      
      return { success: true, data: result, c208Number: entry.c208Number };
    } catch (error) {
      console.error('C208 creation error:', error);
      throw new Error(`Failed to create C208 entry: ${error.message}`);
    }
  },

  /**
   * Get all C208 entries
   */
  getAll: async (options = {}) => {
    try {
      const { page = 1, limit = 50, sortBy = 'createdAt', sortOrder = 'desc' } = options;
      
      const results = await base44.entity(ENTITIES.C208)
        .find()
        .orderBy(sortBy, sortOrder)
        .limit(limit)
        .get();
      
      return { success: true, data: results, count: results.length };
    } catch (error) {
      console.error('C208 fetch error:', error);
      throw new Error(`Failed to fetch C208 entries: ${error.message}`);
    }
  },

  /**
   * Get C208 entry by C209 number
   */
  getByC209Number: async (c209Number) => {
    try {
      const results = await base44.entity(ENTITIES.C208)
        .find()
        .where('c209Number', '==', c209Number)
        .get();
      
      if (results.length === 0) {
        return { success: false, message: 'C208 entry not found' };
      }
      
      return { success: true, data: results[0] };
    } catch (error) {
      console.error('C208 lookup error:', error);
      throw new Error(`Failed to find C208 entry: ${error.message}`);
    }
  },

  /**
   * Update a C208 entry
   */
  update: async (id, data) => {
    try {
      const updateData = {
        ...data,
        updatedAt: new Date().toISOString(),
        updatedBy: getCurrentUser()
      };
      
      const result = await base44.entity(ENTITIES.C208).update(id, updateData);
      return { success: true, data: result };
    } catch (error) {
      console.error('C208 update error:', error);
      throw new Error(`Failed to update C208 entry: ${error.message}`);
    }
  }
};

/**
 * Combined API for dashboard and reporting
 */
export const dashboardApi = {
  /**
   * Get dashboard statistics
   */
  getStats: async () => {
    try {
      const [c209Results, c208Results, expiredResults] = await Promise.all([
        c209Api.getAll({ limit: 1000 }),
        c208Api.getAll({ limit: 1000 }),
        c209Api.getExpired()
      ]);

      const pending = c209Results.data.filter(e => e.status === 'pending').length;
      const completed = c209Results.data.filter(e => e.status === 'completed').length;
      
      return {
        success: true,
        data: {
          totalC209: c209Results.count,
          totalC208: c208Results.count,
          pending,
          completed,
          expired: expiredResults.count,
          lastUpdated: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Dashboard stats error:', error);
      return {
        success: true,
        data: {
          totalC209: 0,
          totalC208: 0,
          pending: 0,
          completed: 0,
          expired: 0,
          lastUpdated: new Date().toISOString()
        }
      };
    }
  },

  /**
   * Get combined log of all entries
   */
  getCombinedLog: async (options = {}) => {
    try {
      const { limit = 100, sortOrder = 'desc' } = options;
      
      const [c209Results, c208Results] = await Promise.all([
        c209Api.getAll({ limit, sortOrder }),
        c208Api.getAll({ limit, sortOrder })
      ]);

      // Combine and sort by date
      const combined = [
        ...c209Results.data.map(e => ({ ...e, type: 'C209' })),
        ...c208Results.data.map(e => ({ ...e, type: 'C208' }))
      ].sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      });

      return { success: true, data: combined.slice(0, limit), count: combined.length };
    } catch (error) {
      console.error('Combined log error:', error);
      return { success: true, data: [], count: 0 };
    }
  }
};

/**
 * Helper functions
 */
function generateC209Number() {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `C209-${year}${month}-${random}`;
}

function generateC208Number() {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `C208-${year}${month}-${random}`;
}

function getCurrentUser() {
  try {
    const auth = localStorage.getItem('skyroute_auth');
    if (auth) {
      const authData = JSON.parse(auth);
      return authData.email || 'system';
    }
  } catch (error) {
    console.error('Get user error:', error);
  }
  return 'system';
}

// Update C209 status helper
c209Api.updateStatus = async (id, status) => {
  try {
    return await c209Api.update(id, { status });
  } catch (error) {
    console.error('Status update error:', error);
    return { success: false };
  }
};

export default {
  c209: c209Api,
  c208: c208Api,
  dashboard: dashboardApi
};