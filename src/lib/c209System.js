// C209/C208 System Logic
import { format } from 'date-fns';

const STORAGE_KEY = 'c209_c208_log';
const EXPIRY_TRACKER_KEY = 'c209_expiry_tracker';
const REALLOCATION_KEY = 'reallocation_register';
const BACKUP_KEY = 'c209_backups';
const LAST_BACKUP_KEY = 'last_backup_time';

const BACKUP_INTERVAL_HOURS = 6;

// Month prefix helper
export const getMonthPrefix = (date) => {
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  return months[date.getMonth()];
};

// Get all log entries
export const getLogEntries = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

// Save log entries
export const saveLogEntries = (entries) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
};

// Get expiry tracker entries
export const getExpiryTracker = () => {
  const data = localStorage.getItem(EXPIRY_TRACKER_KEY);
  return data ? JSON.parse(data) : [];
};

// Save expiry tracker
export const saveExpiryTracker = (entries) => {
  localStorage.setItem(EXPIRY_TRACKER_KEY, JSON.stringify(entries));
};

// Get reallocation register
export const getReallocationRegister = () => {
  const data = localStorage.getItem(REALLOCATION_KEY);
  return data ? JSON.parse(data) : [];
};

// Save reallocation register
export const saveReallocationRegister = (entries) => {
  localStorage.setItem(REALLOCATION_KEY, JSON.stringify(entries));
};

// Generate next C209 number
export const getNextC209Number = (currentDate) => {
  const entries = getLogEntries();
  const monthPrefix = getMonthPrefix(currentDate);
  const year = currentDate.getFullYear().toString().slice(-2);
  
  let maxNumber = 0;
  
  entries.forEach(entry => {
    if (entry.c209Number && entry.c209Number !== 'NEW BUILD') {
      const entryPrefix = entry.c209Number.slice(0, 3);
      if (entryPrefix === monthPrefix) {
        const numberPart = parseInt(entry.c209Number.slice(3), 10);
        if (!isNaN(numberPart) && numberPart > maxNumber) {
          maxNumber = numberPart;
        }
      }
    }
  });
  
  return `${monthPrefix}${String(maxNumber + 1).padStart(4, '0')}`;
};

// Generate next C208 number
export const getNextC208Number = (currentDate) => {
  const entries = getLogEntries();
  const monthPrefix = getMonthPrefix(currentDate);
  
  let maxNumber = 0;
  
  entries.forEach(entry => {
    if (entry.c208Number && entry.c208Number !== 'RW') {
      const entryPrefix = entry.c208Number.slice(0, 3);
      if (entryPrefix === monthPrefix) {
        const numberPart = parseInt(entry.c208Number.slice(3), 10);
        if (!isNaN(numberPart) && numberPart > maxNumber) {
          maxNumber = numberPart;
        }
      }
    }
  });
  
  return `${monthPrefix}${String(maxNumber + 1).padStart(4, '0')}`;
};

// Find C209 entry
export const findC209Entry = (c209Number) => {
  const entries = getLogEntries();
  return entries.find(entry => entry.c209Number === c209Number);
};

// Find C208 data
export const findC208Data = (c208Number) => {
  const entries = getLogEntries();
  return entries.find(entry => entry.c208Number === c208Number);
};

// Check if C209 is used
export const isC209Used = (c209Number) => {
  if (c209Number === 'NEW BUILD') return true;
  
  const entries = getLogEntries();
  const entry = entries.find(e => e.c209Number === c209Number);
  
  if (!entry) return false;
  
  return !!(entry.newFlight || entry.newSignature);
};

// Get available C209 list
export const getAvailableC209List = () => {
  const entries = getLogEntries();
  return entries
    .filter(entry => 
      entry.c209Number && 
      entry.c209Number !== 'NEW BUILD' && 
      !entry.newFlight
    )
    .map(entry => entry.c209Number);
};

// Add to expiry tracker
export const addToExpiryTracker = (c209Number, creationDate) => {
  if (c209Number === 'NEW BUILD') return;
  
  const tracker = getExpiryTracker();
  tracker.push({
    c209Number,
    creationDate: creationDate.toISOString(),
    lastChecked: new Date().toISOString(),
    status: 'Active'
  });
  saveExpiryTracker(tracker);
};

// Remove from expiry tracker
export const removeFromExpiryTracker = (c209Number) => {
  if (c209Number === 'NEW BUILD') return;
  
  const tracker = getExpiryTracker();
  const filtered = tracker.filter(entry => entry.c209Number !== c209Number);
  saveExpiryTracker(filtered);
};

// Check expired C209 numbers
export const checkExpiredC209Numbers = () => {
  const tracker = getExpiryTracker();
  const now = new Date();
  const expiredNumbers = [];
  
  const updated = tracker.map(entry => {
    if (entry.status === 'Active') {
      const creationDate = new Date(entry.creationDate);
      const hoursDiff = (now - creationDate) / (1000 * 60 * 60);
      
      if (hoursDiff >= 48) {
        if (!isC209Used(entry.c209Number)) {
          expiredNumbers.push(entry.c209Number);
          return { ...entry, status: 'Expired', lastChecked: now.toISOString() };
        } else {
          return null; // Will be filtered out
        }
      }
    }
    return { ...entry, lastChecked: now.toISOString() };
  }).filter(Boolean);
  
  saveExpiryTracker(updated);
  return expiredNumbers;
};

// Create ramp entry
export const createRampEntry = (data) => {
  const entries = getLogEntries();
  const currentDate = new Date();
  const c209Number = getNextC209Number(currentDate);
  
  const newEntry = {
    id: Date.now(),
    c209Number,
    date: format(currentDate, 'yyyy-MM-dd'),
    time: format(currentDate, 'HH:mm:ss'),
    monthYear: format(currentDate, 'MMM-yy'),
    barNumber: data.containerCode,
    pieces: data.pieces,
    flight: data.flight,
    signature: data.signature,
    c208Number: '',
    newDate: '',
    newTime: '',
    newMonthYear: '',
    newFlight: '',
    newBarNumber: '',
    newPieces: '',
    newSignature: ''
  };
  
  entries.push(newEntry);
  saveLogEntries(entries);
  addToExpiryTracker(c209Number, currentDate);
  checkAndCreateBackup();
  
  return { success: true, c209Number, entry: newEntry };
};

// Create logistic entry
export const createLogisticEntry = (data) => {
  const entries = getLogEntries();
  const currentDate = new Date(data.date || new Date());
  const currentTime = format(new Date(), 'HH:mm:ss');
  
  // Check if NEW BUILD
  if (data.c209Number.toUpperCase() === 'NEW BUILD') {
    const c208Number = getNextC208Number(currentDate);
    
    const newEntry = {
      id: Date.now(),
      c209Number: 'NEW BUILD',
      date: format(currentDate, 'yyyy-MM-dd'),
      time: currentTime,
      monthYear: format(currentDate, 'MMM-yy'),
      barNumber: data.barNumber || '',
      pieces: data.pieces || '',
      flight: data.flight,
      signature: data.signature,
      c208Number,
      newDate: format(currentDate, 'yyyy-MM-dd'),
      newTime: currentTime,
      newMonthYear: format(currentDate, 'MMM-yy'),
      newFlight: data.flight,
      newBarNumber: data.barNumber || '',
      newPieces: data.pieces || '',
      newSignature: data.signature
    };
    
    entries.push(newEntry);
    saveLogEntries(entries);
    updateReallocationRegister();
    checkAndCreateBackup();
    
    return { success: true, c209Number: 'NEW BUILD', c208Number, entry: newEntry };
  }
  
  // Find existing C209
  const entryIndex = entries.findIndex(e => e.c209Number === data.c209Number);
  
  if (entryIndex === -1) {
    const available = getAvailableC209List();
    return { 
      success: false, 
      error: `C209 ${data.c209Number} not found. Available: ${available.join(', ')}` 
    };
  }
  
  const entry = entries[entryIndex];
  
  // Check if RW flight
  const isRWFlight = data.flight.toUpperCase().startsWith('RW');
  const c208Number = isRWFlight ? 'RW' : (entry.c208Number || getNextC208Number(currentDate));
  
  // Update entry
  entries[entryIndex] = {
    ...entry,
    c208Number,
    newDate: format(currentDate, 'yyyy-MM-dd'),
    newTime: currentTime,
    newMonthYear: format(currentDate, 'MMM-yy'),
    newFlight: data.flight,
    newBarNumber: data.barNumber || entry.barNumber,
    newPieces: data.pieces || entry.pieces,
    newSignature: data.signature
  };
  
  saveLogEntries(entries);
  removeFromExpiryTracker(data.c209Number);
  updateReallocationRegister();
  checkAndCreateBackup();
  
  return { success: true, c209Number: data.c209Number, c208Number, entry: entries[entryIndex] };
};

// Update reallocation register
export const updateReallocationRegister = () => {
  const entries = getLogEntries();
  const reallocation = getReallocationRegister();
  
  const updated = reallocation.map(item => {
    if (item.c208 && !item.barNumber) {
      const logEntry = entries.find(e => e.c208Number === item.c208);
      if (logEntry) {
        return {
          ...item,
          barNumber: logEntry.newBarNumber || logEntry.barNumber,
          c209: logEntry.c209Number,
          flight: logEntry.newFlight || logEntry.flight,
          date: logEntry.newDate || logEntry.date
        };
      }
    }
    return item;
  });
  
  saveReallocationRegister(updated);
};

// Backup system
export const createBackup = () => {
  const entries = getLogEntries();
  const backups = JSON.parse(localStorage.getItem(BACKUP_KEY) || '[]');
  
  const backup = {
    timestamp: new Date().toISOString(),
    entries,
    totalRecords: entries.length
  };
  
  backups.push(backup);
  
  // Keep only last 10 backups
  if (backups.length > 10) {
    backups.shift();
  }
  
  localStorage.setItem(BACKUP_KEY, JSON.stringify(backups));
  localStorage.setItem(LAST_BACKUP_KEY, new Date().toISOString());
  
  return backup;
};

// Check and create backup if needed
export const checkAndCreateBackup = () => {
  const lastBackup = localStorage.getItem(LAST_BACKUP_KEY);
  
  if (!lastBackup) {
    return createBackup();
  }
  
  const lastBackupDate = new Date(lastBackup);
  const now = new Date();
  const hoursDiff = (now - lastBackupDate) / (1000 * 60 * 60);
  
  if (hoursDiff >= BACKUP_INTERVAL_HOURS) {
    return createBackup();
  }
  
  return null;
};

// Export to CSV
export const exportToCSV = () => {
  const entries = getLogEntries();
  
  const headers = [
    'C209 Number', 'Date', 'Time', 'Month-Year', 'Bar Number', 'Pieces', 
    'Flight Number', 'Signature', 'C208 Number', 'Flight Date', 'Time', 
    'Month-Year', 'Flight Number', 'Bar Number', 'Pieces', 'Signature'
  ];
  
  const rows = entries.map(entry => [
    entry.c209Number,
    entry.date,
    entry.time,
    entry.monthYear,
    entry.barNumber,
    entry.pieces,
    entry.flight,
    entry.signature,
    entry.c208Number,
    entry.newDate,
    entry.newTime,
    entry.newMonthYear,
    entry.newFlight,
    entry.newBarNumber,
    entry.newPieces,
    entry.newSignature
  ]);
  
  const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `C209_C208_LOG_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
};