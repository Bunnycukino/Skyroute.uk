import { useState, useEffect } from 'react';
import './App.css'
import Pages from "@/pages/index.jsx"
import Login from "@/pages/Login.jsx"
import { Toaster } from "@/components/ui/sonner"
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    // Check if user is already logged in
    const auth = localStorage.getItem('skyroute_auth');
    if (auth) {
      try {
        const authData = JSON.parse(auth);
        if (authData.loggedIn) {
          setIsAuthenticated(true);
          setUserEmail(authData.email);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      }
    }
  }, []);

  const handleLogin = () => {
    const auth = localStorage.getItem('skyroute_auth');
    if (auth) {
      const authData = JSON.parse(auth);
      setIsAuthenticated(true);
      setUserEmail(authData.email);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('skyroute_auth');
    setIsAuthenticated(false);
    setUserEmail('');
  };

  if (!isAuthenticated) {
    return (
      <>
        <Login onLogin={handleLogin} />
        <Toaster />
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen">
        <header className="border-b bg-white shadow-sm">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-blue-600">SkyRoute UK</h1>
              <p className="text-xs text-muted-foreground">Logged in as: {userEmail}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </header>
        <Pages />
      </div>
      <Toaster />
    </>
  )
}

export default App