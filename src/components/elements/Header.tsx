"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FaGithub } from "react-icons/fa";
import { Menu, X } from "lucide-react";

// --- Header Component ---
const Header = () => {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // --- Toggle mobile menu visibility ---
  const toggleMenu = () => setMenuOpen((prev) => !prev);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/60 backdrop-blur">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6">
        {/* ---- Left: Brand Section ---- */}
        <Link href="/" className="flex items-center gap-2 group">
          {/* Brand Name */}
          <span className="font-semibold text-xs sm:text-sm md:text-base whitespace-nowrap">
            Brightdotdev/
            <span className="text-primary">JSONVisualiser</span>
          </span>
        </Link>

        {/* ---- Right: Desktop Buttons (hidden on mobile) ---- */}
        <div className="hidden sm:flex items-center gap-2">
          {/* Go to My Tabs */}
          {pathname !== "/tabs" && (
            <Link href="/tabs">
              <Button variant="default" className="text-sm">
                My Tabs
              </Button>
            </Link>
          )}

                {pathname !== "/" && (
            <Link href="/">
              <Button variant="default" className="text-sm">
                Create A New Tab
              </Button>
            </Link>
          )}


          {/* GitHub Button */}
          <Link
            href="https://github.com/Brightdotdev/JsonVisualizer"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="outline"
              className="flex items-center gap-2 text-sm"
            >
              <FaGithub className="h-4 w-4" />
              Star on GitHub
            </Button>
          </Link>
        </div>

        {/* ---- Right: Mobile Menu Button (hidden on desktop) ---- */}
        <button
          onClick={toggleMenu}
          className="flex sm:hidden items-center justify-center p-2 rounded-md hover:bg-muted transition-colors"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* ---- Animated Dropdown Menu (mobile only) ---- */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="border-t border-border bg-background/80 backdrop-blur-sm sm:hidden"
          >
            <div className="flex flex-col px-4 py-3 space-y-2">
              {/* Go to My Tabs */}
              {pathname !== "/tabs" && (
                <Link href="/tabs" onClick={() => setMenuOpen(false)}>
                  <Button variant="default" className="w-full text-sm">
                    My Tabs
                  </Button>
                </Link>
              )}

                    
              {pathname !== "/" && (
                <Link href="/" onClick={() => setMenuOpen(false)}>
                  <Button variant="default" className="w-full text-sm">
                    My Tabs
                  </Button>
                </Link>
              )}

                    

              {/* GitHub Button */}
              <Link
                href="https://github.com/Brightdotdev/JsonVisualizer"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMenuOpen(false)}
              >
                <Button
                  variant="outline"
                  className="w-full flex items-center gap-2 text-sm"
                >
                  <FaGithub className="h-4 w-4" />
                  Star on GitHub
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;