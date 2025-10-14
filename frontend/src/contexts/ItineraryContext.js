import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { toast } from 'react-toastify';

const ItineraryContext = createContext();

// Itinerary actions
const ITINERARY_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ITINERARY_ITEMS: 'SET_ITINERARY_ITEMS',
  ADD_TO_ITINERARY: 'ADD_TO_ITINERARY',
  UPDATE_ITINERARY_ITEM: 'UPDATE_ITINERARY_ITEM',
  REMOVE_FROM_ITINERARY: 'REMOVE_FROM_ITINERARY',
  CLEAR_ITINERARY: 'CLEAR_ITINERARY',
  SET_ERROR: 'SET_ERROR',
  SET_STATS: 'SET_STATS'
};

// Itinerary reducer
const itineraryReducer = (state, action) => {
  switch (action.type) {
    case ITINERARY_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };

    case ITINERARY_ACTIONS.SET_ITINERARY_ITEMS:
      return {
        ...state,
        items: action.payload.items,
        stats: action.payload.stats || state.stats,
        loading: false,
        error: null
      };

    case ITINERARY_ACTIONS.ADD_TO_ITINERARY:
      const newItems = [...state.items, action.payload];
      const updatedStats = {
        flights: newItems.filter(item => item.item_type === 'flight').length,
        hotels: newItems.filter(item => item.item_type === 'hotel').length,
        attractions: newItems.filter(item => item.item_type === 'attraction').length,
        total: newItems.length
      };
      return {
        ...state,
        items: newItems,
        stats: updatedStats
      };

    case ITINERARY_ACTIONS.UPDATE_ITINERARY_ITEM:
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, ...action.payload.updates }
            : item
        )
      };

    case ITINERARY_ACTIONS.REMOVE_FROM_ITINERARY:
      const filteredItems = state.items.filter(item => item.id !== action.payload);
      const filteredStats = {
        flights: filteredItems.filter(item => item.item_type === 'flight').length,
        hotels: filteredItems.filter(item => item.item_type === 'hotel').length,
        attractions: filteredItems.filter(item => item.item_type === 'attraction').length,
        total: filteredItems.length
      };
      return {
        ...state,
        items: filteredItems,
        stats: filteredStats
      };

    case ITINERARY_ACTIONS.CLEAR_ITINERARY:
      return { ...state, items: [], stats: { flights: 0, hotels: 0, attractions: 0, total: 0 } };

    case ITINERARY_ACTIONS.SET_STATS:
      return { ...state, stats: action.payload };

    case ITINERARY_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };

    default:
      return state;
  }
};

// Initial state
const initialState = {
  items: [],
  stats: { flights: 0, hotels: 0, attractions: 0, total: 0 },
  loading: false,
  error: null
};

// Itinerary provider component
export const ItineraryProvider = ({ children }) => {
  const [state, dispatch] = useReducer(itineraryReducer, initialState);

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    const token = getAuthToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      return payload.exp > now;
    } catch (error) {
      return false;
    }
  };

  // Local storage functions for offline itinerary
  const getLocalItinerary = () => {
    try {
      const localData = localStorage.getItem('localItinerary');
      return localData ? JSON.parse(localData) : [];
    } catch (error) {
      console.error('Error reading local itinerary:', error);
      return [];
    }
  };

  const saveLocalItinerary = (items) => {
    try {
      localStorage.setItem('localItinerary', JSON.stringify(items));
    } catch (error) {
      console.error('Error saving local itinerary:', error);
    }
  };

  const updateLocalStats = (items) => {
    const stats = { flights: 0, hotels: 0, attractions: 0, total: 0 };
    items.forEach(item => {
      stats[item.item_type] = (stats[item.item_type] || 0) + 1;
      stats.total += 1;
    });
    return stats;
  };

  // Fetch itinerary items from API or local storage
  const fetchItineraryItems = async () => {
    dispatch({ type: ITINERARY_ACTIONS.SET_LOADING, payload: true });

    if (!isAuthenticated()) {
      // Load from local storage when not authenticated
      const localItems = getLocalItinerary();
      const localStats = updateLocalStats(localItems);
      dispatch({ type: ITINERARY_ACTIONS.SET_ITINERARY_ITEMS, payload: { items: localItems, stats: localStats } });
      return;
    }

    try {
      const token = getAuthToken();
      const response = await fetch('/api/itinerary', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch itinerary items');
      }

      const data = await response.json();
      dispatch({ type: ITINERARY_ACTIONS.SET_ITINERARY_ITEMS, payload: data });
    } catch (error) {
      console.error('Error fetching itinerary:', error);
      dispatch({ type: ITINERARY_ACTIONS.SET_ERROR, payload: error.message });
    }
  };

  // Add item to itinerary
  const addToItinerary = async (itemData) => {
    if (!isAuthenticated()) {
      // Add to local storage when not authenticated
      const localItems = getLocalItinerary();

      // Check if item already exists
      const existingItem = localItems.find(item =>
        item.item_type === itemData.itemType && item.item_id === itemData.itemId
      );

      if (existingItem) {
        toast.warn('Item already exists in your itinerary');
        return { success: false, message: 'Item already exists' };
      }

      // Create new item with local ID
      const newItem = {
        id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_id: 'local',
        item_type: itemData.itemType,
        item_id: itemData.itemId,
        item_data: itemData.itemData,
        date: itemData.date,
        time: itemData.time,
        notes: itemData.notes || '',
        created_at: new Date().toISOString()
      };

      // Add to local storage
      const updatedItems = [...localItems, newItem];
      saveLocalItinerary(updatedItems);

      // Update local state (reducer will handle stats automatically)
      dispatch({ type: ITINERARY_ACTIONS.ADD_TO_ITINERARY, payload: newItem });

      toast.success('Item added to itinerary (local)');
      return { success: true, data: { item: newItem } };
    }

    try {
      const token = getAuthToken();
      const response = await fetch('/api/itinerary', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(itemData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add item to itinerary');
      }

      // Update local state (reducer will handle stats automatically)
      dispatch({ type: ITINERARY_ACTIONS.ADD_TO_ITINERARY, payload: data.item });

      toast.success(data.message || 'Item added to itinerary');
      return { success: true, data };
    } catch (error) {
      console.error('Error adding to itinerary:', error);
      toast.error(error.message || 'Failed to add item to itinerary');
      return { success: false, error: error.message };
    }
  };

  // Update itinerary item
  const updateItineraryItem = async (itemId, updates) => {
    if (!isAuthenticated()) {
      // Update local storage when not authenticated
      const localItems = getLocalItinerary();
      const itemIndex = localItems.findIndex(item => item.id === itemId);

      if (itemIndex === -1) {
        toast.error('Item not found');
        return { success: false, message: 'Item not found' };
      }

      // Update the item
      const updatedItems = [...localItems];
      updatedItems[itemIndex] = { ...updatedItems[itemIndex], ...updates };
      saveLocalItinerary(updatedItems);

      // Update local state
      dispatch({ type: ITINERARY_ACTIONS.UPDATE_ITINERARY_ITEM, payload: { id: itemId, updates } });
      toast.success('Itinerary item updated (local)');
      return { success: true, data: { item: updatedItems[itemIndex] } };
    }

    try {
      const token = getAuthToken();
      const response = await fetch(`/api/itinerary/${itemId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update itinerary item');
      }

      // Update local state
      dispatch({ type: ITINERARY_ACTIONS.UPDATE_ITINERARY_ITEM, payload: { id: itemId, updates } });
      toast.success(data.message || 'Itinerary item updated');
      return { success: true, data };
    } catch (error) {
      console.error('Error updating itinerary item:', error);
      toast.error(error.message || 'Failed to update itinerary item');
      return { success: false, error: error.message };
    }
  };

  // Remove item from itinerary
  const removeFromItinerary = async (itemId) => {
    if (!isAuthenticated()) {
      // Remove from local storage when not authenticated
      const localItems = getLocalItinerary();
      const itemIndex = localItems.findIndex(item => item.id === itemId);

      if (itemIndex === -1) {
        toast.error('Item not found');
        return { success: false, message: 'Item not found' };
      }

      // Remove the item
      const updatedItems = localItems.filter(item => item.id !== itemId);
      saveLocalItinerary(updatedItems);

      // Update local state (reducer will handle stats automatically)
      dispatch({ type: ITINERARY_ACTIONS.REMOVE_FROM_ITINERARY, payload: itemId });
      toast.success('Item removed from itinerary (local)');
      return { success: true, data: { message: 'Item removed' } };
    }

    try {
      const token = getAuthToken();
      const response = await fetch(`/api/itinerary/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove item');
      }

      // Update local state (reducer will handle stats automatically)
      dispatch({ type: ITINERARY_ACTIONS.REMOVE_FROM_ITINERARY, payload: itemId });
      toast.success(data.message || 'Item removed from itinerary');
      return { success: true, data };
    } catch (error) {
      console.error('Error removing from itinerary:', error);
      toast.error(error.message || 'Failed to remove item');
      return { success: false, error: error.message };
    }
  };

  // Clear entire itinerary
  const clearItinerary = async () => {
    if (!isAuthenticated()) {
      // Clear local storage when not authenticated
      saveLocalItinerary([]);
      dispatch({ type: ITINERARY_ACTIONS.CLEAR_ITINERARY });
      toast.success('Itinerary cleared (local)');
      return { success: true, data: { message: 'Itinerary cleared' } };
    }

    try {
      const token = getAuthToken();
      const response = await fetch('/api/itinerary', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to clear itinerary');
      }

      // Update local state
      dispatch({ type: ITINERARY_ACTIONS.CLEAR_ITINERARY });
      toast.success(data.message || 'Itinerary cleared');
      return { success: true, data };
    } catch (error) {
      console.error('Error clearing itinerary:', error);
      toast.error(error.message || 'Failed to clear itinerary');
      return { success: false, error: error.message };
    }
  };

  // Get total item count
  const getItemCount = () => {
    return state.items.length;
  };

  // Check if item exists in itinerary
  const isItemInItinerary = (itemType, itemId) => {
    if (!isAuthenticated()) {
      // Check local storage when not authenticated
      const localItems = getLocalItinerary();
      return localItems.some(item =>
        item.item_type === itemType && item.item_id === itemId
      );
    }
    return state.items.some(item =>
      item.item_type === itemType && item.item_id === itemId
    );
  };

  // Get items by type
  const getItemsByType = (type) => {
    return state.items.filter(item => item.item_type === type);
  };

  // Get items by date
  const getItemsByDate = (date) => {
    return state.items.filter(item => item.date === date);
  };

  // Get items grouped by date
  const getItemsGroupedByDate = () => {
    const grouped = {};
    state.items.forEach(item => {
      const date = item.date || 'No Date';
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(item);
    });
    return grouped;
  };

  // Fetch itinerary on mount and when authentication status changes
  useEffect(() => {
    fetchItineraryItems();
  }, []);

  const value = {
    // State
    items: state.items,
    stats: state.stats,
    loading: state.loading,
    error: state.error,

    // Actions
    fetchItineraryItems,
    addToItinerary,
    updateItineraryItem,
    removeFromItinerary,
    clearItinerary,

    // Utilities
    getItemCount,
    isItemInItinerary,
    getItemsByType,
    getItemsByDate,
    getItemsGroupedByDate,
    isAuthenticated
  };

  return (
    <ItineraryContext.Provider value={value}>
      {children}
    </ItineraryContext.Provider>
  );
};

// Custom hook to use itinerary context
export const useItinerary = () => {
  const context = useContext(ItineraryContext);
  if (!context) {
    throw new Error('useItinerary must be used within an ItineraryProvider');
  }
  return context;
};

export default ItineraryContext;
