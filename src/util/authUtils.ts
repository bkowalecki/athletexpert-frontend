
export async function loginWithAuth0Token({
    token,
    setUser,
    navigate,
    fallbackRoute = "/auth",
  }: {
    token: string;
    setUser: (user: any) => void;
    navigate: (path: string, options?: { replace?: boolean }) => void;
    fallbackRoute?: string;
  }) {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users/auth0-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token }),
      });
  
      if (!response.ok) throw new Error(`Auth0 login failed: ${response.status}`);
  
      const userData = await response.json();
      setUser({ ...userData, authProvider: "auth0" });
      navigate("/profile", { replace: true });
    } catch (error) {
      console.error("❌ Error in loginWithAuth0Token:", error);
      navigate(fallbackRoute, { replace: true });
    }
  }
  