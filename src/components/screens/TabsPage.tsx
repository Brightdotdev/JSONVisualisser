"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, ArrowLeft } from "lucide-react";
import { useJsonTabs } from "@/hooks/Reactflow/useJsonTabs";
import { format } from "date-fns";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { FaLinkedin, FaGithub } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { JsonTab } from "@/types/JsonTypes";
import Header from "../elements/Header";



// --- Minimal Footer Component ---
type SocialLinks = "linked-in" | "twitter" | "github";

const GetSocialLinks = ({ site, className }: { site: SocialLinks; className?: string }) => {
  const baseClassName = "h-4 w-4 text-muted-foreground transition-colors duration-200 hover:text-foreground";
  if (site === "linked-in") return <FaLinkedin className={cn(baseClassName, className)} />;
  if (site === "github") return <FaGithub className={cn(baseClassName, className)} />;
  if (site === "twitter") return <FaXTwitter className={cn(baseClassName, className)} />;
};

const SocialLink = ({ href, socialLink, children }: { href: string; socialLink: SocialLinks; children: React.ReactNode }) => {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="flex items-center justify-center p-2 rounded-md hover:bg-muted transition-colors">
      <span className="sr-only">{children}</span>
      <GetSocialLinks site={socialLink} />
    </a>
  );
};

const TabsFooter = () => {
  return (
    <footer className="w-full border-t border-border bg-background/60 backdrop-blur mt-auto">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4">
        <p className="text-sm text-muted-foreground text-center sm:text-left">
          Built by{" "}
          <a
            href="https://brightdotdev.vercel.app"
            className="underline underline-offset-4 hover:text-primary transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            Brightdotdev
          </a>
        </p>

        <div className="flex gap-1">
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
      </div>
    </footer>
  );
};




// ---- Page Component ----
const TabsPage: React.FC = () => {
  const { jsonTabs, removeTab, isLoading } = useJsonTabs();
  const [selectedTab, setSelectedTab] = useState<JsonTab | null>(null);
  const [confirmSlug, setConfirmSlug] = useState("");

  // --- Delete Confirmation Handler ---
  const handleDelete = () => {
    if (selectedTab && confirmSlug === `delete ${selectedTab.slug}`) {
      removeTab(selectedTab.slug);
      toast.success(`Deleted ${selectedTab.slug}`);
      setSelectedTab(null);
      setConfirmSlug("");
    } else {
      toast.error("Slug does not match. Deletion cancelled.");
      setSelectedTab(null);
      setConfirmSlug("");
    }
  };

  // --- Fade Animation Config ---
  const fadeProps = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 10 },
    transition: { duration: 0.3 },
  };

  // 🧩 --- LOADING STATE --- //
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col w-screen">
        <Header />
        <motion.div
          {...fadeProps}
          className="flex-1 flex flex-col items-center py-12 px-4"
        >
          <h1 className="text-2xl font-semibold mb-8 text-center">Your JSON Tabs</h1>
          <div className="w-full grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="p-4 border shadow-sm flex flex-col gap-4">
                <Skeleton className="h-5 w-3/4 rounded" />
                <Skeleton className="h-4 w-1/2 rounded" />
                <Skeleton className="h-8 w-full rounded" />
              </Card>
            ))}
          </div>
        </motion.div>
        <TabsFooter />
      </div>
    );
  }

  // 🧩 --- EMPTY STATE --- //
  if (!isLoading && jsonTabs.length === 0) {
    return (
      <div className="min-h-screen flex flex-col w-screen">
        <Header />
        <motion.div
          {...fadeProps}
          className="flex-1 flex flex-col items-center justify-center text-center py-20 px-4"
        >
          <h1 className="text-2xl font-semibold mb-8">You have No Json Tab(s)</h1>
          <p className="text-sm mb-4 text-muted-foreground">
            You have no JSON tabs yet.
          </p>
          <Link href="/">
            <Button>Create a New Tab</Button>
          </Link>
        </motion.div>
        <TabsFooter />
      </div>
    );
  }

  // 🧩 --- POPULATED STATE --- //
  return (
    <div className="h-screen flex flex-col w-screen">
      <Header />
      <motion.div
        {...fadeProps}
        className="flex-1 w-full flex flex-col items-center py-8 px-4"
      >

        <AnimatePresence>
          <motion.div layout className="w-full max-w-4xl mx-auto flex flex-col gap-4 py-2">
            {jsonTabs.reverse().map((tab) => (
              <motion.div key={tab.id} {...fadeProps}>
                <Card className="relative border shadow-sm hover:shadow-md transition-shadow duration-200">
                  {/* Delete Button */}
                  <Button
                    onClick={() => setSelectedTab(tab)}
                    variant="outline"
                    size="sm"
                    className="absolute top-3 right-3 transition-colors bg-background/80 backdrop-blur-sm"
                  >
                    <Trash2 size={16} />
                  </Button>

                  {/* Card Header */}
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold truncate pr-16">
                      {tab.fileName}
                    </CardTitle>
                  </CardHeader>

                  {/* Card Body */}
                  <CardContent className="pt-0">
                    <p className="text-sm mb-2">
                      Slug: <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{tab.slug}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mb-3">
                      Created: {format(tab.createdAt, "yyyy-MM-dd HH:mm:ss")}
                    </p>
                    <Link href={`/tabs/${tab.slug}`}>
                      <Button variant="default" size="sm" className="w-full">
                        View Tab
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* --- Delete Confirmation Modal --- */}
        <Dialog open={!!selectedTab} onOpenChange={() => setSelectedTab(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Confirm Delete</DialogTitle>
            </DialogHeader>

            {selectedTab && (
              <div className="space-y-3">
                <p className="text-sm">
                  To delete <b>{selectedTab.fileName}</b>, type{" "}
                  <code className="bg-accent/90 px-1 rounded text-sm">
                    delete {selectedTab.slug}
                  </code>{" "}
                  below:
                </p>

                <Input
                  placeholder="Type slug here..."
                  value={confirmSlug}
                  onChange={(e) => setConfirmSlug(e.target.value)}
                />
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedTab(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={confirmSlug !== `delete ${selectedTab?.slug}`}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
      <TabsFooter />
    </div>
  );
};

export default TabsPage;