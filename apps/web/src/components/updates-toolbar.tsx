"use client";

import { useCallback, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, ExternalLink, Share2 } from "lucide-react";
import { Button } from "@plop/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@plop/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@plop/ui/tooltip";
import { cn } from "@plop/ui/cn";
import { CopyInput } from "@/components/copy-input";
import { siteConfig } from "@/lib/site";

interface Post {
  slug: string;
  title: string;
}

interface PopupCenterProps {
  url: string;
  title: string;
  w: number;
  h: number;
}

interface NavigationButtonProps {
  direction: "prev" | "next";
  onClick: () => void;
  disabled: boolean;
  isMobile?: boolean;
}

const HEADER_SCROLL_OFFSET = 24;
const POPUP_DIMENSIONS = { width: 800, height: 480 };

const popupCenter = ({ url, title, w, h }: PopupCenterProps) => {
  const dualScreenLeft = window.screenLeft ?? window.screenX;
  const dualScreenTop = window.screenTop ?? window.screenY;

  const width =
    window.innerWidth || document.documentElement.clientWidth || screen.width;
  const height =
    window.innerHeight ||
    document.documentElement.clientHeight ||
    screen.height;

  const systemZoom = width / window.screen.availWidth;
  const left = (width - w) / 2 / systemZoom + dualScreenLeft;
  const top = (height - h) / 2 / systemZoom + dualScreenTop;

  return window.open(
    url,
    title,
    `scrollbars=yes,width=${w / systemZoom},height=${h / systemZoom},top=${top},left=${left}`,
  );
};

function NavigationButton({
  direction,
  onClick,
  disabled,
  isMobile,
}: NavigationButtonProps) {
  const Icon = direction === "prev" ? ArrowUp : ArrowDown;
  const label = direction === "prev" ? "Previous post" : "Next post";

  if (isMobile) {
    return (
      <button
        type="button"
        className={cn(
          "flex items-center space-x-1.5 px-3 py-1.5  border border-white/12 bg-[#0B0D0F]/80",
          disabled && "opacity-50",
        )}
        onClick={onClick}
        disabled={disabled}
      >
        {direction === "prev" && <Icon className="h-4 w-4" />}
        <span className="text-xs">
          {direction === "prev" ? "Previous" : "Next"}
        </span>
        {direction === "next" && <Icon className="h-4 w-4" />}
      </button>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={cn("p-1", disabled && "opacity-50")}
          onClick={onClick}
          disabled={disabled}
        >
          <Icon className="h-5 w-5" />
        </button>
      </TooltipTrigger>
      <TooltipContent className="py-1 px-3" sideOffset={16} side="right">
        <span className="text-xs">{label}</span>
      </TooltipContent>
    </Tooltip>
  );
}

export function UpdatesToolbar({ posts }: { posts: Post[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const hasPosts = posts.length > 0;
  const currentIndex = Math.max(
    0,
    posts.findIndex((post) => pathname.endsWith(post.slug)),
  );
  const isDetailView = pathname.split("/").length > 2;
  const currentPost = hasPosts ? posts[currentIndex] : undefined;

  const scrollToPost = useCallback((postSlug: string) => {
    const element = document.getElementById(postSlug);
    if (!element) return;

    const header = document.querySelector("header");
    const headerHeight = header?.offsetHeight || 0;
    const elementPosition =
      element.getBoundingClientRect().top + window.scrollY;

    window.scrollTo({
      top: elementPosition - headerHeight - HEADER_SCROLL_OFFSET,
      behavior: "smooth",
    });
  }, []);

  const handleNavigation = useCallback(
    (direction: "prev" | "next") => {
      if (!hasPosts) return;
      const targetIndex =
        direction === "prev" ? currentIndex - 1 : currentIndex + 1;
      const targetPost = posts[targetIndex];
      if (!targetPost) return;

      if (isDetailView) {
        router.push(`/updates/${targetPost.slug}`);
      } else {
        scrollToPost(targetPost.slug);
      }
    },
    [currentIndex, hasPosts, isDetailView, posts, router, scrollToPost],
  );

  const handlePrev = useCallback(
    () => handleNavigation("prev"),
    [handleNavigation],
  );
  const handleNext = useCallback(
    () => handleNavigation("next"),
    [handleNavigation],
  );

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
        handlePrev();
      }
      if (event.key === "ArrowDown" || event.key === "ArrowRight") {
        handleNext();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleNext, handlePrev]);

  const handleShare = () => {
    if (!currentPost) return;
    const shareUrl = `${siteConfig.url}${pathname}`;
    const tweet = `https://x.com/intent/tweet?text=${encodeURIComponent(
      `${currentPost.title} ${shareUrl}`,
    )}`;
    const popup = popupCenter({
      url: tweet,
      title: currentPost.title,
      w: POPUP_DIMENSIONS.width,
      h: POPUP_DIMENSIONS.height,
    });
    popup?.focus();
  };

  if (!hasPosts) {
    return null;
  }

  return (
    <Dialog>
      <div className="fixed right-4 bottom-0 top-0 hidden md:flex flex-col items-center justify-center">
        <TooltipProvider delayDuration={50}>
          <div className="flex flex-col items-center backdrop-blur-xl bg-[#0B0D0F]/80 p-2 border border-white/12 space-y-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <DialogTrigger className="p-1">
                  <Share2 size={18} className="text-white/60" />
                </DialogTrigger>
              </TooltipTrigger>
              <TooltipContent
                className="py-1 px-3"
                sideOffset={16}
                side="right"
              >
                <span className="text-xs">Share</span>
              </TooltipContent>
            </Tooltip>

            <div className="flex flex-col items-center border-t border-white/12 space-y-2 pt-2">
              <NavigationButton
                direction="prev"
                onClick={handlePrev}
                disabled={currentIndex === 0}
              />
              <NavigationButton
                direction="next"
                onClick={handleNext}
                disabled={currentIndex === posts.length - 1}
              />
            </div>
          </div>
        </TooltipProvider>
      </div>

      <div className="fixed bottom-0 left-0 right-0 md:hidden">
        <div className="flex items-center justify-between backdrop-blur-xl bg-[#0B0D0F]/90 px-4 py-3 border-t border-white/12">
          <NavigationButton
            direction="prev"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            isMobile
          />

          <DialogTrigger asChild>
            <button
              type="button"
              className="p-1.5 border border-white/12 bg-[#0B0D0F]/80"
            >
              <Share2 size={16} className="text-white/60" />
            </button>
          </DialogTrigger>

          <NavigationButton
            direction="next"
            onClick={handleNext}
            disabled={currentIndex === posts.length - 1}
            isMobile
          />
        </div>
      </div>

      <DialogContent className="sm:max-w-[460px] bg-[#0B0D0F] border-white/12">
        <DialogHeader>
          <DialogTitle className="text-white">Share this update</DialogTitle>
        </DialogHeader>
        <div className="grid gap-5 py-2">
          <CopyInput value={`${siteConfig.url}${pathname}`} />
          <Button
            className="w-full flex items-center justify-center gap-2 h-10 border border-white/12 bg-transparent text-white hover:bg-white/20 hover:border-white/30"
            onClick={handleShare}
          >
            Share on X
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
