import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { LoadingLogo } from "@/components/LoadingLogo";
import { initSqlDatabase, addHistoriqueEntry, getAll, updateRecord } from "@/lib/db";
import { useAuth } from "@/hooks/useAuth";

export default function Auth() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [ipAddress, setIpAddress] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { signIn } = useAuth();

  useEffect(() => {
    initSqlDatabase()
      .then(() => {
        console.log("Database ready");
        // Pre-fill fields from the first user in the database
        const users = getAll("utilisateur");
        if (users && users.length > 0) {
          // Auto-fill removed per user request
          // setUsername(users[0].nom_user || "");
          // setPassword(users[0].password || "");
        }
      })
      .catch(err => {
        console.error("DB init error:", err);
      });

    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => { if (data.ip) setIpAddress(data.ip); })
      .catch(err => console.error("Could not fetch IP automatically:", err));
  }, []);

  const getUnifiedUsers = (): any[] => {
    const users = getAll("utilisateur");
    console.log("getAll result:", users);
    if (!users || users.length === 0) {
      console.log("Using fallback initialData users");
      return [
        { id_user: 1, nom_user: "salay", password: "123456", ip_address: null }
      ];
    }
    return users;
  };

  const logHistorique = (action: string, username_val: string, success: boolean, message: string, isAlert: boolean = false, userId?: any) => {
    try {
      addHistoriqueEntry(
        userId || null,
        action,
        new Date().toISOString(),
        ipAddress,
        username_val,
        success,
        message,
        isAlert
      );
    } catch (error) {
      console.error("Error logging historique:", error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const users = getUnifiedUsers();
      
      console.log("Login attempt - username:", username, "password:", password);
      console.log("Users from DB:", users);
      
      const user = users.find(u => u.nom_user && u.nom_user.trim().toLowerCase() === username.trim().toLowerCase());
      console.log("Found user:", user);

      if (!user) {
        console.log("User not found for:", username);
        logHistorique("Tentative de connexion", username, false, "Identifiants incorrects", false);
        toast({ title: "Erreur", description: "Nom d'utilisateur incorrect", variant: "destructive" });
        setLoading(false);
        return;
      }

      console.log("Password check - input:", password, "stored:", user.password, "match:", user.password === password);
      
      if (user.password !== password) {
        logHistorique("Tentative de connexion", username, false, "Mot de passe incorrect", false);
        toast({ title: "Erreur", description: "Mot de passe incorrect", variant: "destructive" });
        setLoading(false);
        return;
      }

      console.log("Login successful for:", user.nom_user);

      // IP binding - only lock to IP if the user has an IP set and IP is available
      if (user.ip_address && ipAddress && user.ip_address !== ipAddress) {
        logHistorique("Alerte Sécurité", username, false, `IP non autorisé: ${ipAddress}`, true, user.id_user);
        toast({ title: "Accès Refusé", description: "Ce compte est lié à un autre appareil (IP: " + user.ip_address + ")", variant: "destructive" });
        setLoading(false);
        return;
      }

      // First login - bind to current IP
      let userIp = user.ip_address;
      if (!user.ip_address && ipAddress) {
        updateRecord("utilisateur", "id_user", user.id_user, { ip_address: ipAddress });
        userIp = ipAddress;
      }

      logHistorique("Connexion", username, true, "Connecté", false, user.id_user);
      const sessionUser = { id: String(user.id_user), nom: user.nom_user, ipAddress: userIp };
      sessionStorage.setItem("currentUser", JSON.stringify(sessionUser));
      signIn(sessionUser);
      
      toast({ title: "✓ Bienvenue", description: `Ravi de vous revoir, ${user.nom_user}` });
      navigate("/dashboard");
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <>
      <AnimatedBackground />
      <div className="fixed top-8 left-0 right-0 text-center z-10">
        <div className="text-2xl font-bold text-primary mb-2">
          République Algérienne Démocratique et Populaire
        </div>
        <div className="text-lg font-medium text-muted-foreground mb-1">
          Ministère de la Défense Nationale
        </div>
        <div className="text-md font-semibold text-primary/80 uppercase tracking-wider">
          Direction Centrale des Carburants
        </div>
      </div>
      <div className="fixed top-0 left-0 w-32 h-32 z-10">
        <img
          src="https://www.mdn.dz/site_principal/sommaire/presentation/images/insignes/dcc.png"
          alt="DCC Logo"
          className="w-full h-full object-contain drop-shadow-sm"
          style={{ filter: 'none', opacity: '1' }}
        />
      </div>
      <div className="fixed top-0 right-0 w-32 h-32 z-10">
        <img
          src="https://www.mdn.dz/site_principal/sommaire/presentation/images/insignes/dcc.png"
          alt="DCC Logo"
          className="w-full h-full object-contain drop-shadow-sm"
          style={{ filter: 'none', opacity: '1' }}
        />
      </div>
      <div className="min-h-screen flex items-start justify-center p-4 relative z-10 pt-48">
        <Card className="w-full max-w-lg shadow-xl border-border/50">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center shadow-inner border border-primary/20">
              <img
                src="https://www.mdn.dz/site_principal/sommaire/presentation/images/insignes/dcc.png"
                alt="DCC Logo"
                className="h-16 w-16 object-contain drop-shadow-md"
              />
            </div>
            <CardTitle className="text-3xl font-bold tracking-widest">LABORATOIRES DES CARBURANTS</CardTitle>
            <CardDescription>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Nom d'utilisateur</Label>
                <Input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required placeholder="Nom d'utilisateur" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="mot de passe"
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <div className="flex items-center gap-2">
                    <LoadingLogo size="sm" />
                    <span>Chargement...</span>
                  </div>
                ) : (
                  "Connexion"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}