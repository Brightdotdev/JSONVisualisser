"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FaGithub } from "react-icons/fa";
import { SiJson } from "react-icons/si";

// --- Header Component ---
const Header = () => {
  const pathname = usePathname();

  // --- Define nav links for quick access ---
  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/tabs", label: "Your Tabs" },
    { href: "/about", label: "About" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/60 backdrop-blur">
      <div className="flex h-14 items-center justify-between px-6">
        {/* ---- Left: Brand Section ---- */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex items-center justify-center w-6 h-6 rounded bg-primary/10">
            <SiJson className="text-primary w-4 h-4 group-hover:scale-110 transition-transform" />
          </div>
          <span className="font-semibold text-sm sm:text-base">
            Brightdotdev / <span className="text-primary">JSON Visualizer</span>
          </span>
        </Link>

        {/* ---- Middle: Navigation ---- */}
        <nav className="hidden sm:flex gap-6">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm transition-colors hover:text-primary",
                  isActive ? "text-primary font-medium" : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* ---- Right: Actions ---- */}
        <div className="flex items-center gap-3">
          <Link
            href="https://github.com/Brightdotdev/JsonVisualizer"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="ghost" size="icon" title="View on GitHub">
              <FaGithub className="h-4 w-4" />
            </Button>
          </Link>

          <Link href="/">
            <Button variant="default" size="sm" className="hidden sm:inline-flex">
              New Visualizer
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
