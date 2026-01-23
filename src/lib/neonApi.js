/**
 * Neon PostgreSQL API Client
 * Handles all API calls to /api/entries/* endpoints
 */

const API_BASE = '/api/entries';

/**
 * Fetch all entries from Neon database
 */
export const getEntries = async () => {
  try {
    console.log('[NeonAPI] Fetching entries from', `${API_BASE}/list`);
    const response = await fetch(`${API_BASE}/list`);
    
    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }
    
    const result = await response.json();
    console.log('[NeonAPI] Received entries:', result);
    
    // Handle both array and object responses
    if (Array.isArray(result)) {
      return { success: true, entries: result };
    } else if (result.success && Array.isArray(result.entries)) {
      return result;
    } else {
      console.warn('[NeonAPI] Unexpected response format:', result);
      return { success: false, entries: [] };
    }
  } catch (error) {
    console.error('[NeonAPI] Error fetching entries:', error);
    return { success: false, entries: [], error: error.message };
  }
};

/**
 * Create a new entry in Neon database
 */
export const createEntry = async (data) => {
  try {
    console.log('[NeonAPI] Creating entry:', data);
    
    const response = await fetch(`${API_BASE}/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API returned status ${response.status}: ${errorText}`);
    }
    
    const result = await response.json();
    console.log('[NeonAPI] Entry created:', result);
    
    return result;
  } catch (error) {
    console.error('[NeonAPI] Error creating entry:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update an existing entry in Neon database
 */
export const updateEntry = async (id, data) => {
  try {
    console.log('[NeonAPI] Updating entry:', id, data);
    
    const response = await fetch(`${API_BASE}/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, ...data })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API returned status ${response.status}: ${errorText}`);
    }
    
    const result = await response.json();
    console.log('[NeonAPI] Entry updated:', result);
    
    return result;
  } catch (error) {
    console.error('[NeonAPI] Error updating entry:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Delete an entry from Neon database
 */
export const deleteEntry = async (id) => {
  try {
    console.log('[NeonAPI] Deleting entry:', id);
    
    const response = await fetch(`${API_BASE}/delete`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API returned status ${response.status}: ${errorText}`);
    }
    
    const result = await response.json();
    console.log('[NeonAPI] Entry deleted:', result);
    
    return result;
  } catch (error) {
    console.error('[NeonAPI] Error deleting entry:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Helper function to generate next C209 number
 */
export const generateC209Number = async () => {
  try {
    const { entries } = await getEntries();
    
    const date = new Date();
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const monthPrefix = months[date.getMonth()];
    
    let maxNumber = 0;
    
    entries.forEach(entry => {
      const c209 = entry.c209Number || entry.c209_number || '';
      if (c209 && c209 !== 'NEW BUILD' && c209.startsWith(monthPrefix)) {
        const numberPart = parseInt(c209.slice(3), 10);
        if (!isNaN(numberPart) && numberPart > maxNumber) {
          maxNumber = numberPart;
        }
      }
    });
    
    return `${monthPrefix}${String(maxNumber + 1).padStart(4, '0')}`;
  } catch (error) {
    console.error('[NeonAPI] Error generating C209 number:', error);
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const monthPrefix = months[new Date().getMonth()];
    return `${monthPrefix}0001`;
  }
};

/**
 * Helper function to generate next C208 number
 */
export const generateC208Number = async () => {
  try {
    const { entries } = await getEntries();
    
    const date = new Date();
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const monthPrefix = months[date.getMonth()];
    
    let maxNumber = 0;
    
    entries.forEach(entry => {
      const c208 = entry.c208Number || entry.c208_number || '';
      if (c208 && c208 !== 'RW' && c208.startsWith(monthPrefix)) {
        const numberPart = parseInt(c208.slice(3), 10);
        if (!isNaN(numberPart) && numberPart > maxNumber) {
          maxNumber = numberPart;
        }
      }
    });
    
    return `${monthPrefix}${String(maxNumber + 1).padStart(4, '0')}`;
  } catch (error) {
    console.error('[NeonAPI] Error generating C208 number:', error);
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const monthPrefix = months[new Date().getMonth()];
    return `${monthPrefix}0001`;
  }
};

export default {
  getEntries,
  createEntry,
  updateEntry,
  deleteEntry,
  generateC209Number,
  generateC208Number
};