import Link from "next/link";
import { Logo } from "../icons/logo";

export function Footer() {
    return (
        <footer className="w-full py-12 bg-secondary/20">
            <div className="container grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="flex flex-col gap-4 col-span-2 md:col-span-1">
                     <Link href="/" className="flex items-center gap-3">
                        <Logo />
                        <h1 className="text-2xl font-bold tracking-tighter text-foreground">
                            Sentiheal
                        </h1>
                    </Link>
                    <p className="text-muted-foreground text-sm">
                        Your personal guide to emotional wellness.
                    </p>
                </div>
                <div className="grid gap-1">
                    <h3 className="font-semibold">Company</h3>
                    <Link href="#" className="text-muted-foreground hover:text-foreground text-sm">About Us</Link>
                    <Link href="#" className="text-muted-foreground hover:text-foreground text-sm">Services</Link>
                    <Link href="#" className="text-muted-foreground hover:text-foreground text-sm">Contact Us</Link>
                </div>
                <div className="grid gap-1">
                    <h3 className="font-semibold">Resources</h3>
                    <Link href="#" className="text-muted-foreground hover:text-foreground text-sm">Blog</Link>
                    <Link href="#" className="text-muted-foreground hover:text-foreground text-sm">FAQ</Link>
                    <Link href="#" className="text-muted-foreground hover:text-foreground text-sm">Help Center</Link>
                </div>
                 <div className="grid gap-1">
                    <h3 className="font-semibold">Legal</h3>
                    <Link href="#" className="text-muted-foreground hover:text-foreground text-sm">Privacy Policy</Link>
                    <Link href="#" className="text-muted-foreground hover:text-foreground text-sm">Terms of Service</Link>
                </div>
            </div>
             <div className="container mt-8 text-center text-xs text-muted-foreground">
                © {new Date().getFullYear()} SentiHeal. All rights reserved.
            </div>
        </footer>
    )
}
