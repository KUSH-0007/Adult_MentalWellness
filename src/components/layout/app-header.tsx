'use client';

import Link from 'next/link';
import { Logo } from '@/components/icons/logo';
import { useAuth, useUser } from '@/firebase';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { LogOut, MapPin, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { useToast } from '@/hooks/use-toast';


const FindDoctorLink = () => {
  const { toast } = useToast();

  const handleFindDoctor = () => {
    if (!navigator.geolocation) {
      toast({
        variant: 'destructive',
        title: 'Geolocation Not Supported',
        description: 'Your browser does not support geolocation.',
      });
      window.open(`https://www.google.com/maps/search/mental+health+doctor/`, '_blank');
      return;
    }

    toast({
      title: 'Finding Your Location',
      description: 'Please allow location access to find doctors near you.',
    });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        window.open(
          `https://www.google.com/maps/search/mental+health+doctor/@${latitude},${longitude},14z`,
          '_blank'
        );
      },
      () => {
        toast({
          variant: 'destructive',
          title: 'Location Access Denied',
          description: 'Searching for doctors without your precise location.',
        });
        window.open(`https://www.google.com/maps/search/mental+health+doctor/`, '_blank');
      }
    );
  };

  return (
    <button onClick={handleFindDoctor} className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
      <MapPin className="mr-2 h-4 w-4" />
      Find a Doctor
    </button>
  );
};


const NavLinks = () => (
    <>
        <Link href="/" className="text-sm font-medium text-slate-700 underline-offset-4 underline transition-colors hover:text-indigo-600">Home</Link>
        <Link href="#about" className="text-sm font-medium text-slate-600 transition-colors hover:text-indigo-600 transition-calm">About Us</Link>
        <Link href="/journal" className="text-sm font-medium text-slate-600 transition-colors hover:text-indigo-600 transition-calm">Services</Link>
        <FindDoctorLink />
        <Link href="#contact" className="text-sm font-medium text-slate-600 transition-colors hover:text-indigo-600 transition-calm">Contact Us</Link>
    </>
)

function UserNav() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();

  if (isUserLoading) {
    return <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />;
  }

  if (user && !user.isAnonymous) {
    const initial = user.email ? user.email.charAt(0).toUpperCase() : '?';
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{initial}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">My Account</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => auth.signOut()}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button asChild variant="outline">
      <Link href="/login">Login</Link>
    </Button>
  );
}

export function AppHeader() {
  return (
    <header className="px-4 py-3 sm:px-6 lg:px-8 bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 transition-calm hover:opacity-80">
          <Logo />
          <h1 className="text-2xl font-semibold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            SentiHeal
          </h1>
        </Link>
        <nav className="hidden md:flex gap-6 items-center">
            <NavLinks />
        </nav>
        <div className="flex items-center gap-4">
             <UserNav />
             <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <nav className="grid gap-6 text-lg font-medium mt-10">
                    <NavLinks />
                </nav>
              </SheetContent>
            </Sheet>
        </div>
      </div>
    </header>
  );
}
