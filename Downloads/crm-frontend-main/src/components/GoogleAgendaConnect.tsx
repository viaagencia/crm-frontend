import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuthContext } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/sonner";
import supabase from "@/lib/supabase";

interface GoogleConnectionStatus {
  isConnected: boolean;
  email?: string;
  connectedAt?: string;
}

export const GoogleAgendaConnect = () => {
  const { user } = useAuthContext();
  const [status, setStatus] = useState<GoogleConnectionStatus>({ isConnected: false });
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Check connection status on mount
  useEffect(() => {
    checkConnectionStatus();
  }, [user]);

  const checkConnectionStatus = async () => {
    try {
      setIsChecking(true);
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setStatus({ isConnected: false });
        return;
      }

      const response = await fetch("/api/google/check-connection", {
        headers: {
          "Authorization": `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStatus({
          isConnected: data.isConnected,
          email: data.email,
          connectedAt: data.connectedAt,
        });
      }
    } catch (error) {
      console.error("Error checking connection status:", error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleConnect = async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        toast.error("Você precisa estar autenticado");
        return;
      }

      // Google OAuth parameters
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      const redirectUri = `${window.location.origin}/google-callback`;
      const scope = "https://www.googleapis.com/auth/calendar";

      const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
      authUrl.searchParams.append("client_id", clientId);
      authUrl.searchParams.append("redirect_uri", redirectUri);
      authUrl.searchParams.append("response_type", "code");
      authUrl.searchParams.append("scope", scope);
      authUrl.searchParams.append("access_type", "offline");
      authUrl.searchParams.append("prompt", "consent");

      window.location.href = authUrl.toString();
    } catch (error) {
      console.error("Error starting Google OAuth:", error);
      toast.error("Erro ao conectar com Google");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        toast.error("Você precisa estar autenticado");
        return;
      }

      const response = await fetch("/api/google/disconnect", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        setStatus({ isConnected: false });
        toast.success("Google Calendar desconectado");
      } else {
        throw new Error("Erro ao desconectar");
      }
    } catch (error) {
      console.error("Error disconnecting Google:", error);
      toast.error("Erro ao desconectar Google Calendar");
    } finally {
      setIsLoading(false);
    }
  };

  if (isChecking) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin">
          <svg className="h-6 w-6 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {status.isConnected ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
            <div>
              <p className="font-semibold text-green-900">✓ Conectado</p>
              {status.email && <p className="text-sm text-green-700">{status.email}</p>}
              {status.connectedAt && (
                <p className="text-xs text-green-600">
                  Conectado em {new Date(status.connectedAt).toLocaleDateString("pt-BR")}
                </p>
              )}
            </div>
            <Badge variant="outline" className="bg-green-100">Ativo</Badge>
          </div>
          <Button
            onClick={handleDisconnect}
            disabled={isLoading}
            variant="destructive"
            className="w-full"
          >
            {isLoading ? "Desconectando..." : "Desconectar Google Calendar"}
          </Button>
        </div>
      ) : (
        <Button
          onClick={handleConnect}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {isLoading ? "Conectando..." : "Conectar com Google Calendar"}
        </Button>
      )}
    </div>
  );
};
