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
import { initializeDatabase, addHistoriqueEntry, upsertProfile, getDb, saveDatabase } from "@/lib/db";
import { useAuth } from "@/hooks/useAuth";

interface User {
  id: string;
  email: string;
  password: string;
  nom: string;
  ipAddress?: string;
}

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [ipAddress, setIpAddress] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { signIn } = useAuth();

  // Initialize database on mount
  // Initialize database on mount and fetch IP automatically
  useEffect(() => {
    try {
      initializeDatabase();
      console.log("Database initialized in Auth.tsx");
    } catch (e) {
      console.error("DB init error:", e);
    }

    // Fetch IP automatically without showing it to the user
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => {
        if (data.ip) {
          setIpAddress(data.ip);
        }
      })
      .catch(err => console.error("Could not fetch IP automatically:", err));
  }, []);

  // Get users from the unified database
  const getUnifiedUsers = (): any[] => {
    const db = getDb();
    return db.utilisateur || [];
  };

  // Log historique entry
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
      await new Promise(resolve => setTimeout(resolve, 800));
      const users = getUnifiedUsers();
      const user = users.find(u => u.nom_user === username && u.password === password);

      if (!user) {
        logHistorique("Tentative de connexion", username, false, "Identifiants incorrects", false);
        toast({ title: "Erreur", description: "Nom d'utilisateur ou mot de passe incorrect", variant: "destructive" });
        setLoading(false);
        return;
      }

      if (user.ip_address && user.ip_address !== ipAddress) {
        logHistorique("Alerte Sécurité", username, false, `IP non autorisé: ${ipAddress}`, true, user.id_user);
        toast({ title: "Accès Refusé", description: "Cette adresse IP n'est pas autorisée", variant: "destructive" });
        setLoading(false);
        return;
      }

      logHistorique("Connexion", username, true, "Connecté", false, user.id_user);
      const sessionUser = { id: user.id_user, nom: user.nom_user, ipAddress: user.ip_address };
      sessionStorage.setItem("currentUser", JSON.stringify(sessionUser));
      signIn(sessionUser);
      
      toast({ title: "✓ Bienvenue", description: `Ravi de vous revoir, ${user.nom_user}` });
      navigate("/dashboard");
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      const db = getDb();
      const users = db.utilisateur || [];

      if (users.find((u: any) => u.nom_user === username)) {
        toast({ title: "Erreur", description: "Ce nom d'utilisateur existe déjà", variant: "destructive" });
        setLoading(false);
        return;
      }

      const newUser = {
        id_user: Date.now(),
        nom_user: username,
        password: password,
        ip_address: ipAddress
      };

      db.utilisateur.push(newUser);
      saveDatabase(db);
      upsertProfile(String(newUser.id_user), username, ipAddress);
      
      logHistorique("Inscription", username, true, "Nouveau compte créé", false, newUser.id_user);

      toast({ title: "✓ Succès", description: "Compte créé ! Vous pouvez vous connecter." });
      setIsLogin(true);
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <>
      <AnimatedBackground />
      {/* Arabic text at the top center */}
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
      {/* Top corner decorative elements - DCC themed */}
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
      <div className="min-h-screen flex items-start justify-center p-4 relative z-10 pt-32">
        {/* DCC-style floating element */}
        {isLogin && (
          <div className="absolute -top-20 right-10 w-24 h-24 opacity-25 animate-pulse z-0">
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <rect x="15" y="15" width="70" height="70" rx="5" fill="currentColor" className="text-primary" />
              <line x1="35" y1="50" x2="65" y2="50" stroke="white" strokeWidth="3" />
              <line x1="50" y1="35" x2="50" y2="65" stroke="white" strokeWidth="3" />
              <circle cx="50" cy="50" r="15" fill="white" />
              <circle cx="50" cy="50" r="8" fill="currentColor" className="text-primary" />
            </svg>
          </div>
        )}
        <Card className="w-full max-w-lg shadow-xl border-border/50">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center shadow-inner border border-primary/20">
              <img
                src="https://www.mdn.dz/site_principal/sommaire/presentation/images/insignes/dcc.png"
                alt="DCC Logo"
                className="h-16 w-16 object-contain drop-shadow-md"
              />
            </div>
            <CardTitle className="text-3xl font-bold tracking-widest">LABO</CardTitle>
            <CardDescription>
              {isLogin ? "Connectez-vous à votre compte" : "Créez un nouveau compte"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">
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
                    placeholder="••••••••"
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
                  (isLogin ? "Se connecter" : "S'inscrire")
                )}
              </Button>
            </form>
            <div className="mt-4 text-center">
              <button
                type="button"
                className="text-sm text-primary hover:underline flex items-center gap-2 mx-auto"
                onClick={async () => {
                  setLoading(true);
                  await new Promise(resolve => setTimeout(resolve, 1000));
                  setIsLogin(!isLogin);
                  setLoading(false);
                }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <LoadingLogo size="sm" />
                    <span>Chargement...</span>
                  </>
                ) : (
                  <span>{isLogin ? "Pas de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}</span>
                )}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
