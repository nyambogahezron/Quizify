import { AuthProvider } from "./AuthContext";

export const ContextProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <AuthProvider>{children}</AuthProvider>
    )
}