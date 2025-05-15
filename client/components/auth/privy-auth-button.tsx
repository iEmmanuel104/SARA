// client/components/auth/PrivyAuthButton.tsx - Privy Authentication Button

"use client";

import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { authApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function PrivyAuthButton() {
    const { login, authenticated, ready, user, getAccessToken } = usePrivy();
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    // Function to handle login with Privy
    const handlePrivyLogin = async () => {
        try {
            if (!authenticated) {
                // If not authenticated with Privy, trigger Privy login
                login();
                return;
            }

            setIsLoading(true);

            // Get token from Privy
            const privyToken = await getAccessToken();

            // Send the token to our backend
            const response = await authApi.loginWithPrivy(privyToken);

            // Save auth tokens returned from our backend
            const { access_token, refresh_token, user } = response.data;
            localStorage.setItem("token", access_token);
            localStorage.setItem("refreshToken", refresh_token);
            localStorage.setItem("user", JSON.stringify(user));

            // Show success message
            toast({
                title: "Login successful",
                description: `Welcome ${user.firstName}!`,
            });

            // Redirect to dashboard
            router.push("/dashboard");
        } catch (error) {
            console.error("Privy login error:", error);
            toast({
                title: "Login failed",
                description: "Unable to authenticate with your wallet",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Don't render until Privy is ready
    if (!ready) {
        return (
            <Button disabled variant="outline" className="w-full">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Initializing...
            </Button>
        );
    }

    return (
        <Button onClick={handlePrivyLogin} disabled={isLoading} variant="outline" className="w-full">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <img src="/icons/wallet.svg" alt="Wallet" className="mr-2 h-4 w-4" />}
            {authenticated ? "Continue with Wallet" : "Connect Wallet"}
        </Button>
    );
}
