import useSWR from "swr";

const fetcher = (...url: Parameters<typeof fetch>) => fetch(...url).then((r) => r.json())

export function useUserData(){
    const { data, error, isLoading, mutate } = useSWR('/api/user/me', fetcher);
    return {
        userData: data,
        isLoading,
        isError: error,
        mutate,
    };
}

// export function logoutUser(){
//     const {  error, isLoading, mutate } = useSWR('/api/auth/getAuthUrl', fetcher);
//     return {
//         isLoading,
//         isError: error,
//         mutate,
//     };
// }

export function useConfigData(){
    const { data, error, isLoading, mutate } = useSWR('/api/config',fetcher);
    return {
        configData: data,
        isLoading,
        isError: error,
        mutate,
    };
}
