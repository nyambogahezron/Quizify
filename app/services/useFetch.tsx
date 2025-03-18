import { useEffect, useState } from "react";
import { fetchApi } from "./Api";

export default function useFetch(path: string, options: RequestInit = {}, autoRefresh:boolean) {
    const [data, setData] = useState(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetchApi(path, options);
                setData(data);
            } catch (error) {
                setError(error instanceof Error ? error.message : 'An unknown error occurred');
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    return { data, error, loading };
}

