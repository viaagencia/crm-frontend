import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import supabase from "@/lib/supabase";
import { toast } from "@/components/ui/sonner";

const GoogleCallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get("code");
        const state = searchParams.get("state");

        if (!code) {
          throw new Error("Código de autorização não recebido");
        }

        // Get the current user session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          throw new Error("Sessão não encontrada");
        }

        // Exchange the authorization code for tokens
        const response = await fetch("/api/google/exchange-token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ code, state }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Erro ao trocar token");
        }

        toast.success("Google Calendar conectado com sucesso!");
        navigate("/configuracoes");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erro ao processar callback";
        setError(message);
        toast.error(message);
        console.error("Google callback error:", err);

        // Redirect after showing error
        setTimeout(() => {
          navigate("/configuracoes");
        }, 3000);
      } finally {
        setIsLoading(false);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Processando autenticação...</CardTitle>
            <CardDescription>Por favor aguarde</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <div className="animate-spin">
                <svg className="h-8 w-8 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-red-600">Erro na autenticação</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">{error}</p>
            <p className="text-xs text-gray-500">Redirecionando para configurações...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-96">
        <CardHeader>
          <CardTitle>Autenticação bem-sucedida</CardTitle>
          <CardDescription>Redirecionando...</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
};

export default GoogleCallbackPage;
