import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const ItineraryContext = createContext(null);

const STORAGE_KEY = "itinerary_items_v1";

export function ItineraryProvider({ children }) {
    const [items, setItems] = useState([]);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) setItems(JSON.parse(raw));
        } catch {}
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        } catch {}
    }, [items]);

    const addToItinerary = useCallback(async (payload) => {
        const id = `${payload.itemType}-${payload.itemId || crypto.randomUUID()}`;
        const item = {
            id,
            item_type: payload.itemType,
            item_data: payload.itemData || {},
            date: payload.date || null,
            time: payload.time || null,
            notes: payload.notes || "",
        };
        setItems((prev) => (prev.find((x) => x.id === id) ? prev : [...prev, item]));
        return id;
    }, []);

    const removeFromItinerary = useCallback(async (id) => {
        setItems((prev) => prev.filter((x) => x.id !== id));
    }, []);

    const updateItineraryItem = useCallback(async (id, patch) => {
        setItems((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)));
    }, []);

    const clearItinerary = useCallback(async () => {
        setItems([]);
    }, []);

    const isItemInItinerary = useCallback((type, id) => {
        return items.some((x) => x.id === `${type}-${id}`);
    }, [items]);

    const getItemsGroupedByDate = useCallback(() => {
        const groups = {};
        for (const it of items) {
            const key = it.date || "No Date";
            if (!groups[key]) groups[key] = [];
            groups[key].push(it);
        }
        return groups;
    }, [items]);

    const stats = useMemo(() => ({
        flights: items.filter((x) => x.item_type === "flight").length,
        hotels: items.filter((x) => x.item_type === "hotel").length,
        attractions: items.filter((x) => x.item_type === "attraction").length,
        total: items.length,
    }), [items]);

    const value = {
        items,
        stats,
        addToItinerary,
        removeFromItinerary,
        updateItineraryItem,
        clearItinerary,
        getItemsGroupedByDate,
        isItemInItinerary,
        isAuthenticated: () => false,
    };

    return <ItineraryContext.Provider value={value}>{children}</ItineraryContext.Provider>;
}

export function useItinerary() {
    const ctx = useContext(ItineraryContext);
    if (!ctx) throw new Error("useItinerary must be used within ItineraryProvider");
    return ctx;
}


