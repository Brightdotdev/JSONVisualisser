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
import { Trash2 } from "lucide-react";
import { useJsonTabs } from "@/hooks/useJsonTabs";
import { format } from "date-fns";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion"; 

// ---- Interface Definition ----
export interface JsonTab {
  id: string;
  slug: string;
  fileName: string;
  jsonData: any;
  createdAt: Date;
}

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
      <motion.div
        {...fadeProps}
        className="min-h-screen flex flex-col items-center py-12 px-4"
      >
        <h1 className="text-2xl font-semibold mb-8 text-center">
          Your JSON Tabs
        </h1>

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
    );
  }

  // 🧩 --- EMPTY STATE --- //
  if (!isLoading && jsonTabs.length === 0) {
    return (
      <motion.div
        {...fadeProps}
        className="min-h-screen flex flex-col items-center justify-center text-center py-20 px-4"
      >
        <h1 className="text-2xl font-semibold mb-8">Your JSON Tabs</h1>
        <p className="text-sm mb-4 text-muted-foreground">
          You have no JSON tabs yet.
        </p>
        <Link href="/">
          <Button>Create a New Tab</Button>
        </Link>
      </motion.div>
    );
  }

  // 🧩 --- POPULATED STATE --- //
  return (
    <motion.div
      {...fadeProps}
      className="min-h-screen flex flex-col items-center py-12 px-4"
    >
      <h1 className="text-2xl font-semibold mb-8 text-center">Your JSON Tabs</h1>

      <AnimatePresence>
        <motion.div
          layout
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full"
        >
          {jsonTabs.map((tab) => (
            <motion.div key={tab.id} {...fadeProps}>
              <Card className="relative border shadow-sm hover:shadow-md transition-shadow duration-200">
                {/* Delete Button */}
                <Button
                  onClick={() => setSelectedTab(tab)}
                  variant="outline"
                  className="absolute top-2 right-2 transition-colors bg-transparent"
                >
                  <Trash2 size={18} />
                </Button>

                {/* Card Header */}
                <CardHeader>
                  <CardTitle className="text-lg font-semibold truncate">
                    {tab.fileName}
                  </CardTitle>
                </CardHeader>

                {/* Card Body */}
                <CardContent>
                  <p className="text-sm mb-2">
                    Slug: <span className="font-mono">{tab.slug}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Created: {format(tab.createdAt, "yyyy-MM-dd HH:mm:ss")}
                  </p>
                  <Link href={`/tabs/${tab.slug}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 w-full"
                    >
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
  );
};

export default TabsPage;
