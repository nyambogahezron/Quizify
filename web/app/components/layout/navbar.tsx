import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { SoundSettingsToggle } from "@/components/ui/sound-settings";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Home, 
  Trophy, 
  Award, 
  ChevronDown, 
  User, 
  Settings, 
  LogOut,
  Menu
} from "lucide-react";
import { SoundSettingsButton } from "@/components/ui/sound-settings";

export default function Navbar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleToggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const navItems = [
    { path: "/", label: "Home", icon: <Home className="h-4 w-4 mr-2" /> },
    { path: "/categories", label: "Categories", icon: null },
    { path: "/leaderboard", label: "Leaderboard", icon: <Trophy className="h-4 w-4 mr-2" /> },
    { path: "/achievements", label: "Achievements", icon: <Award className="h-4 w-4 mr-2" /> },
  ];

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/">
          <a className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-md bg-primary flex items-center justify-center text-white font-poppins font-bold text-lg">
              QM
            </div>
            <span className="font-poppins font-bold text-xl text-text">QuizMaster</span>
          </a>
        </Link>
        
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="block md:hidden"
          onClick={handleToggleMobileMenu}
        >
          <Menu />
        </Button>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          {navItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <a 
                className={`flex items-center text-${isActive(item.path) ? 'primary' : 'text'} font-medium px-3 py-2 rounded-md hover:bg-primary/5`}
              >
                {item.icon}
                {item.label}
              </a>
            </Link>
          ))}
          
          {/* Sound settings button */}
          <SoundSettingsButton />
          
          {user && (
            <div className="ml-4 relative">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                      <User className="h-4 w-4" />
                    </div>
                    <span>{user.displayName || user.username}</span>
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => { 
                    window.location.href = "/profile";
                  }}>
                    <User className="h-4 w-4 mr-2" />
                    My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { 
                    window.location.href = "/profile";
                  }}>
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-2 space-y-1">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <a 
                  className={`block px-3 py-2 rounded-md text-${isActive(item.path) ? 'primary' : 'text'} font-medium hover:bg-primary/5`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </a>
              </Link>
            ))}
            <Link href="/profile">
              <a 
                className="block px-3 py-2 rounded-md text-text font-medium hover:bg-primary/5"
                onClick={() => setMobileMenuOpen(false)}
              >
                My Profile
              </a>
            </Link>
            
            <div className="px-3 py-2">
              <SoundSettingsToggle />
            </div>
            
            <a 
              href="#" 
              className="block px-3 py-2 rounded-md text-secondary font-medium hover:bg-secondary/5"
              onClick={(e) => {
                e.preventDefault();
                handleLogout();
                setMobileMenuOpen(false);
              }}
            >
              Logout
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
