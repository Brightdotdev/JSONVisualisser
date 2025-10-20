"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { FaLinkedin, FaGithub } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

type SocialLinks = "linked-in" | "twitter" | "github";

// --- Helper Component: Returns correct social icon ---
const GetSocialLinks = ({ site, className }: { site: SocialLinks; className?: string }) => {
  const baseClassName =
    "h-5 w-5 text-foreground transition-colors duration-200 group-hover:text-primary";

  if (site === "linked-in") return <FaLinkedin className={cn(baseClassName, className)} />;
  if (site === "github") return <FaGithub className={cn(baseClassName, className)} />;
  if (site === "twitter") return <FaXTwitter className={cn(baseClassName, className)} />;
};

// --- Wrapper for each icon + link ---
const SocialLink = ({
  href,
  socialLink,
  children,
}: {
  href: string;
  socialLink: SocialLinks;
  children: React.ReactNode;
}) => {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="group">
      <span className="sr-only">{children}</span>
      <GetSocialLinks site={socialLink} />
    </a>
  );
};

// --- Main Footer Component ---
const Footer = () => {
  return (
    <footer className="fixed bottom-0 w-full bg-background/60 backdrop-blur border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-3 z-50">
      <p className="text-sm text-muted-foreground">
        Built by{" "}
        <a
          href="https://brightdotdev.vercel.app"
          className="underline underline-offset-4 hover:text-primary transition-colors"
        >
          Brightdotdev
        </a>{" "}
        for everyone
      </p>

      <div className="flex gap-4">
        <SocialLink href="https://dub.sh/Brightdotdev-twitter" socialLink="twitter">
          Follow me on Twitter
        </SocialLink>
        <SocialLink href="https://dub.sh/Brightdotdev-github" socialLink="github">
          Follow me on GitHub
        </SocialLink>
        <SocialLink href="https://dub.sh/Brightdotdev-linkedin" socialLink="linked-in">
          Let's Connect On LinkedIn
        </SocialLink>
      </div>
    </footer>
  );
};

export default Footer;
