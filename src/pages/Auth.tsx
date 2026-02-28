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
import { initializeDatabase, addHistoriqueEntry, upsertProfile } from "@/lib/db";
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
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [ipAddress, setIpAddress] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { signIn } = useAuth();

  // Initialize database on mount
  useEffect(() => {
    try {
      initializeDatabase();
      console.log("Database initialized in Auth.tsx");
    } catch (e) {
      console.error("DB init error:", e);
    }
  }, []);

  // Get users from localStorage
  const getUsers = (): User[] => {
    const users = localStorage.getItem("dcc_users");
    return users ? JSON.parse(users) : [];
  };

  // Get user by IP address
  const getUserByIp = (ip: string): User | undefined => {
    const users = getUsers();
    return users.find(u => u.ipAddress === ip);
  };

  // Save users to localStorage
  const saveUsers = (users: User[]) => {
    localStorage.setItem("dcc_users", JSON.stringify(users));
  };

  // Log historique entry
  const logHistorique = (action: string, email: string, success: boolean, message: string, isAlert: boolean = false, userId?: string) => {
    try {
      console.log("Logging to historique:", { action, email, success, message, ipAddress, userId });
      addHistoriqueEntry(
        userId || null,
        action,
        new Date().toISOString(),
        ipAddress,
        email,
        success,
        message,
        isAlert
      );
      console.log("Historique logged successfully");
    } catch (error) {
      console.error("Error logging historique:", error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate loading
      await new Promise(resolve => setTimeout(resolve, 1000));

      const users = getUsers();
      const user = users.find(u => u.email === email && u.password === password);
      const userByEmail = users.find(u => u.email === email);

      if (!user) {
        // Log failed login attempt to historique
        logHistorique("Tentative de connexion", email, false, `Tentative de connexion échouée - Email ou mot de passe incorrect - IP: ${ipAddress}`, false, userByEmail?.id);
        toast({ title: "Erreur", description: "Email ou mot de passe incorrect", variant: "destructive" });
        setLoading(false);
        return;
      }

      // Check if user has an IP address assigned
      if (user.ipAddress && user.ipAddress !== ipAddress) {
        // Log IP mismatch to historique
        logHistorique("Tentative de connexion", email, false, `Connexion refusée - IP non autorisé (Enregistré: ${user.ipAddress}, Actuel: ${ipAddress})`, true, user.id);
        toast({ title: "Erreur", description: "Cette adresse IP n'est pas autorisée pour ce compte", variant: "destructive" });
        setLoading(false);
        return;
      }

      // If user has no IP assigned, assign current IP
      if (!user.ipAddress) {
        user.ipAddress = ipAddress;
        saveUsers(users);
      }

      // Log successful login to historique
      logHistorique("Connexion", email, true, `Connexion réussie - IP: ${ipAddress}`, false, user.id);

      // Store current user in session (without password)
      const sessionUser = { id: user.id, email: user.email, nom: user.nom };
      sessionStorage.setItem("currentUser", JSON.stringify(sessionUser));

      // Update auth context
      signIn(sessionUser);

      // Small delay to ensure session is saved
      await new Promise(resolve => setTimeout(resolve, 200));

      toast({
        title: "✓ Connexion réussie",
        description: "Bienvenue dans votre compte!",
        variant: "success"
      });

      // Navigate to dashboard
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);
      logHistorique("Login", email, false, error.message);
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Show loading for at least 1 second
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      const users = getUsers();

      // Check if IP already has a user assigned
      const existingUserByIp = getUserByIp(ipAddress);
      if (existingUserByIp) {
        toast({ title: "Erreur", description: "Cette adresse IP est déjà utilisée par un autre compte", variant: "destructive" });
        logHistorique("Inscription Échouée", email, false, `Inscription refusée - IP déjà utilisée: ${ipAddress}`);
        setLoading(false);
        return;
      }

      // Check if user already exists
      if (users.find(u => u.email === email)) {
        toast({ title: "Erreur", description: "Cet email est déjà utilisé", variant: "destructive" });
        setLoading(false);
        return;
      }

      // Create new user with IP address
      const newUser: User = {
        id: "user_" + Date.now(),
        email,
        password,
        nom,
        ipAddress: ipAddress
      };

      users.push(newUser);
      saveUsers(users);

      // Log successful registration to historique
      logHistorique("Inscription Réussie", email, true, `Nouveau utilisateur enregistré - IP: ${ipAddress}`, false, newUser.id);

      // Store user's IP address in profiles table
      try {
        upsertProfile(newUser.id, nom, ipAddress);
      } catch (err) {
        console.error("Error updating profile:", err);
      }

      // Log successful registration
      logHistorique("Register", email, true, "Inscription réussie", false, newUser.id);

      toast({
        title: "✓ Inscription réussie",
        description: "Votre compte a été créé avec succès!",
        variant: "success"
      });
      setIsLogin(true);
    } catch (error: any) {
      logHistorique("Register", email, false, error.message);
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <>
      <AnimatedBackground />
      {/* Arabic text at the top center */}
      <div className="fixed top-8 left-0 right-0 text-center z-10">
        <div className="text-2xl font-bold text-primary mb-2" dir="rtl">
          الجمهورية الجزائرية الديمقراطية الشعبية
        </div>
        <div className="text-lg font-medium text-muted-foreground" dir="rtl">
          وزارة الدفاع الوطني
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
            <CardTitle className="text-2xl font-bold">{isLogin ? "DCC CENTER" : "DCC CENTER"}</CardTitle>
            <CardDescription>
              {isLogin ? "Connectez-vous à votre compte" : "Créez un nouveau compte"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">
              {/* IP Address Display */}
              <div className="space-y-2">
                <Label htmlFor="ipAddress">Adresse IP</Label>
                <Input
                  id="ipAddress"
                  type="text"
                  value={ipAddress}
                  onChange={(e) => setIpAddress(e.target.value)}
                  placeholder="L'adresse IP (ex: 192.168.1.1)"
                  required
                />
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="nom">Nom d'utilisateur</Label>
                  <Input id="nom" value={nom} onChange={(e) => setNom(e.target.value)} required placeholder="Votre nom" />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="email@exemple.com" />
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
