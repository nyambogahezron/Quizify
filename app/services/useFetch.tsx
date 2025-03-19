import { useEffect, useState, useCallback } from "react";
import { fetchApi } from "./Api";

export default function useFetch(path: string, options: RequestInit = {}, autoRefresh: boolean = true) {
    const [data, setData] = useState(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await fetchApi(path, options);
            setData(result);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'An unknown error occurred');
        } finally {
            setLoading(false);
        }
    }, [path, options]);

    useEffect(() => {
        if (autoRefresh) {
            fetchData();
        }
    }, [fetchData, autoRefresh]);

    return { data, error, loading, refresh: fetchData };
}

