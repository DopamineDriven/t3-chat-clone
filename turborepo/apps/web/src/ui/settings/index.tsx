"use client";

import type { ValueKeyframesDefinition } from "motion-dom";
import type { User as UserProps } from "next-auth";
import type React from "react";
import {
  ArrowLeft,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  KeyRound,
  LogOut,
  MessageCircleQuestion,
  Palette,
  PanelLeftClose,
  PanelRightClose,
  User
} from "@t3-chat-clone/ui";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { AnimatePresence, motion, MotionStyle } from "motion/react";
import { useTheme } from "next-themes";
import { useElementDimensions } from "@/hooks/use-element-dimensions";
import { useMediaQuery } from "@/hooks/use-media-query"; // Assuming you have this hook
import { cn } from "@/lib/utils";
import { MobileSettingsFAB } from "@/ui/settings/mobile-settings-fab";
import { AccountSettingsSection } from "@/ui/settings/sections/account-settings-toolbar";
// import { ApiKeysSettingsSection } from "@/ui/settings/sections/api-keys-tab";
import {ApiKeysTab} from "@/ui/api-key-settings";
import { ContactUsSettingsSection } from "@/ui/settings/sections/contact-us-settings-section";
import { CustomizationSettingsSection } from "@/ui/settings/sections/customization-settings-section";
import { SettingsNavigation } from "@/ui/settings/settings-navigation";
import { ClientWorkupProps } from "@/types/shared";

const ThemeToggle = dynamic(
  () => import("@/ui/theme-toggle").then(d => d.ThemeToggle),
  { ssr: false }
);
const settingsSectionsConfig = [
  {
    id: "account",
    title: "Account",
    icon: User,
    component: AccountSettingsSection,
    type: "section"
  },
  {
    id: "apiKeys",
    title: "API Keys",
    icon: KeyRound,
    component: ApiKeysTab,
    type: "section"
  },
  {
    id: "customization",
    title: "Customization",
    icon: Palette,
    component: CustomizationSettingsSection,
    type: "section"
  },
  {
    id: "contactUs",
    title: "Contact Us",
    icon: MessageCircleQuestion,
    component: ContactUsSettingsSection,
    type: "section"
  }
] as const;

const LEFT_COLUMN_WIDTH_DESKTOP = "20dvw";
const LEFT_COLUMN_WIDTH_COLLAPSED = "5dvw"; // approx <5dvw on mobile, e.g. 64px
const RIGHT_COLUMN_WIDTH_DESKTOP = "w-20"; // approx 80px
const TOTAL_SECTIONS = settingsSectionsConfig.length; // 7
const PERIPHERAL_TRANSITION_PERCENT = 0.05; // 5% buffer zones
const ACTIVATION_THRESHOLD = 0.3; // 30% threshold for switching sections

const SECTION_TITLES = {
  account: "Account",
  apiKeys: "API Keys",
  customization: "Customization",
  contactUs: "Contact Us"
} as const;

type SectionId = keyof typeof SECTION_TITLES;

export default function SettingsScaffold({ user, initialData }: { user?: UserProps;   initialData?: ClientWorkupProps }) {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const prefersDark =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    // Apply theme based on system preference during initial load
    if (!resolvedTheme) {
      if (prefersDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } else {
      // Apply theme based on resolvedTheme once it's available
      if (resolvedTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [resolvedTheme]);

  const [activeSection, setActiveSection] = useState<SectionId>("account");

  const sectionRefs = useRef<Record<SectionId, HTMLDivElement | null>>({
    account: null,
    apiKeys: null,
    customization: null,
    contactUs: null
  });
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isNavigatingRef = useRef(false);
  const lastActiveSection = useRef<SectionId>("account");

  const isSmallScreen = !useMediaQuery("(min-width: 640px)");

  const [isLeftSidebarManuallyCollapsed, setIsLeftSidebarManuallyCollapsed] =
    useState(false);

  const [scrollContainerDimensions] = useElementDimensions(scrollContainerRef);

  const scrollMetrics = useMemo(() => {
    if (!scrollContainerRef.current || scrollContainerDimensions.height === 0) {
      return {
        totalScrollHeight: 0,
        sectionHeight: 0,
        bufferZone: 0,
        rootMargin: "0px"
      };
    }

    // Get the total scrollable content height
    const totalScrollHeight = scrollContainerRef.current.scrollHeight;
    const containerHeight = scrollContainerDimensions.height;

    // Calculate section allocation based on actual scroll content
    const sectionHeight = totalScrollHeight / TOTAL_SECTIONS;
    const bufferZone = sectionHeight * PERIPHERAL_TRANSITION_PERCENT;

    // Create pixel-based root margin for intersection observer
    const rootMargin = `-${Math.round(bufferZone)}px 0px -${Math.round(bufferZone)}px 0px`;

    return {
      totalScrollHeight,
      sectionHeight,
      bufferZone,
      rootMargin,
      containerHeight
    };
  }, [scrollContainerDimensions.height]);

  useEffect(() => {
    settingsSectionsConfig.forEach(section => {
      let refRef = sectionRefs?.current?.[section.id];
      if (refRef) {
        refRef = null;
      }
    });
  }, []);

  const createSectionRef = useCallback((sectionId: SectionId) => {
    return (el: HTMLDivElement | null) => {
      let refRef = sectionRefs?.current?.[sectionId];
      if (refRef) {
        refRef = el;
      }
    };
  }, []);

  // Determine actual collapsed state based on screen size and manual toggle
  const isLeftSidebarEffectivelyCollapsed = useMemo(
    () => isSmallScreen || isLeftSidebarManuallyCollapsed,
    [isSmallScreen, isLeftSidebarManuallyCollapsed]
  );

  const activeSectionTitle = SECTION_TITLES[activeSection] || "Settings";

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    // Only create observer if we have valid scroll metrics
    if (scrollMetrics.totalScrollHeight === 0) return;

    // Optimized intersection observer with precise pixel-based buffer zones
    observerRef.current = new IntersectionObserver(
      entries => {
        if (isNavigatingRef.current) return;

        // Sort entries by their position for consistent behavior
        const sortedEntries = entries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (sortedEntries.length === 0) return;

        // Find the section that's most prominently visible (accounting for buffer zones)
        let bestCandidate: IntersectionObserverEntry | null = null;
        let bestScore = 0;

        for (const entry of sortedEntries) {
          const rect = entry.boundingClientRect;
          const containerHeight = scrollMetrics.containerHeight ?? 0;

          // Calculate how much of the section is in the "core" viewing area (excluding buffer zones)
          const coreTop = scrollMetrics.bufferZone;
          const coreBottom = containerHeight - scrollMetrics.bufferZone;

          const visibleTop = Math.max(rect.top, coreTop);
          const visibleBottom = Math.min(rect.bottom, coreBottom);
          const coreVisibleHeight = Math.max(0, visibleBottom - visibleTop);

          // Score based on how much core area is visible
          const score = coreVisibleHeight / (coreBottom - coreTop);

          if (score > bestScore && score > ACTIVATION_THRESHOLD) {
            bestScore = score;
            bestCandidate = entry;
          }
        }

        if (bestCandidate) {
          const newActiveSection = bestCandidate.target.id as SectionId;
          if (newActiveSection !== lastActiveSection.current) {
            setActiveSection(newActiveSection);
            lastActiveSection.current = newActiveSection;
          }
        }
      },
      {
        root: scrollContainerRef.current,
        // Optimized thresholds with buffer consideration
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
        // Pixel-based root margin to account for buffer zones
        rootMargin: scrollMetrics.rootMargin
      }
    );

    const currentObserver = observerRef.current;

    // Observe all sections
    Object.values(sectionRefs.current).forEach(ref => {
      if (ref) currentObserver.observe(ref);
    });

    return () => {
      if (currentObserver) currentObserver.disconnect();
    };
  }, [scrollMetrics]);

  const styleMemo = useMemo(
    () => ({
      widthAnimation: (isLeftSidebarEffectivelyCollapsed
        ? LEFT_COLUMN_WIDTH_COLLAPSED
        : `var(--left-sidebar-width, ${LEFT_COLUMN_WIDTH_DESKTOP})`) satisfies ValueKeyframesDefinition,
      widthInitial: (isLeftSidebarEffectivelyCollapsed
        ? LEFT_COLUMN_WIDTH_COLLAPSED
        : LEFT_COLUMN_WIDTH_DESKTOP) satisfies MotionStyle["width"],
      justifyContent: (isLeftSidebarEffectivelyCollapsed
        ? "center"
        : "space-between") satisfies MotionStyle["justifyContent"]
    }),
    [isLeftSidebarEffectivelyCollapsed]
  );

  const handleNavigation = useCallback((sectionId: string) => {
    const typedSectionId = sectionId as SectionId;
    setActiveSection(typedSectionId);
    isNavigatingRef.current = true;
    if (!sectionRefs.current) return;
    // Smooth scroll with optimized timing
    sectionRefs.current?.[typedSectionId]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "nearest"
    });

    // Shorter timeout for better responsiveness
    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 800);
  }, []);

  const navSideBarCb = useCallback(() => {
    return setIsLeftSidebarManuallyCollapsed(!isLeftSidebarManuallyCollapsed);
  }, [isLeftSidebarManuallyCollapsed]);

  return (
    <div className="bg-brand-background text-brand-text flex h-screen overflow-hidden">
      {isSmallScreen && (
        <MobileSettingsFAB
          sections={settingsSectionsConfig}
          activeSection={activeSection}
          user={user}
          onNavigate={handleNavigation}
        />
      )}
      <AnimatePresence>
        {(!isSmallScreen ||
          (isSmallScreen && isLeftSidebarManuallyCollapsed)) && (
          <motion.div
            key="left-sidebar"
            initial={{
              width: styleMemo.widthInitial,
              "--left-sidebar-width": LEFT_COLUMN_WIDTH_COLLAPSED
            }}
            animate={{
              width: styleMemo.widthAnimation,
              "--left-sidebar-width": LEFT_COLUMN_WIDTH_DESKTOP
            }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={cn(
              "bg-brand-sidebar border-brand-border z-20 flex h-full shrink-0 flex-col border-r p-3 sm:p-4 transition-all ease-in-out",
              isSmallScreen ? "fixed" : "relative", // Fixed on small screens to overlay
              isLeftSidebarEffectivelyCollapsed
                ? "w-[5dvw]"
                : "w-[20dvw]"
            )}>
            <div
              className="mb-4 flex items-center"
              style={{
                justifyContent: styleMemo.justifyContent
              }}>
              {!isLeftSidebarEffectivelyCollapsed && (
                <Button
                  variant="ghost"
                  asChild
                  className="text-brand-text-muted hover:text-brand-text hover:bg-brand-component self-start">
                  <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Link>
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={navSideBarCb}
                className="text-brand-text-muted hover:text-brand-text hover:bg-brand-component">
                {isLeftSidebarManuallyCollapsed ? (
                  <PanelRightClose />
                ) : (
                  <PanelLeftClose />
                )}
              </Button>
            </div>
            <SettingsNavigation
              sections={settingsSectionsConfig}
              activeSection={activeSection}
              onNavigate={handleNavigation}
              isCollapsed={isLeftSidebarEffectivelyCollapsed}
              className="flex-grow overflow-y-auto"
            />
            <div
              className={cn(
                "border-brand-border mt-auto border-t pt-4",
                isLeftSidebarEffectivelyCollapsed ? "flex justify-center" : ""
              )}>
              <Avatar className="size-10">
                <AvatarImage
                  src={user?.image ?? "/user.svg?width=40&height=40&query=AR"}
                  alt={user?.name ?? "username"}
                />
                <AvatarFallback>
                  {user?.name?.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {!isLeftSidebarEffectivelyCollapsed && (
                <div className="ml-3">
                  <p className="text-brand-text-emphasis text-sm font-medium">
                    {user?.name}
                  </p>
                  <p className="text-brand-text-muted text-xs">Free Plan</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Center Content Column */}
      <div
        className={cn(
          "flex flex-1 flex-col overflow-hidden sm:mx-[5dvw] sm:max-w-full"
        )}>
        {/* Header for mobile */}
        {isSmallScreen && (
          <header className="border-brand-border bg-brand-background sticky top-0 z-10 flex h-14 items-center justify-between border-b p-3">
            <h1 className="text-brand-text-emphasis flex-1 text-center text-lg font-semibold">
              {activeSectionTitle}
            </h1>
            <div className="flex flex-1 justify-end">
              <ThemeToggle />
            </div>
          </header>
        )}

        <main
          ref={scrollContainerRef}
          className="relative flex-1 space-y-8 overflow-y-auto p-2 sm:space-y-10 sm:p-6 mx-auto sm:max-w-8xl">
          {settingsSectionsConfig.map(section => {
            const SectionComponent = section.component;
            return (
              <div
                key={section.id}
                id={section.id}
                ref={createSectionRef(section.id)}
                // Conditional padding/margin for sections
                className="min-h-fit py-8">
                <h2 className="text-brand-text-emphasis mb-4 text-2xl font-semibold sm:mb-6 sm:text-3xl">
                  {section.title}
                </h2>
                {section.title === "API Keys" ? <SectionComponent user={user} initialData={initialData} />  : <SectionComponent user={user} />}
              </div>
            );
          })}
        </main>
      </div>

      {/* Right Sidebar - hidden on small screens */}
      {!isSmallScreen && (
        <motion.div
          key="right-sidebar"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className={cn(
            "bg-brand-sidebar border-brand-border z-20 hidden h-full shrink-0 flex-col items-center border-l p-4 sm:flex",
            RIGHT_COLUMN_WIDTH_DESKTOP
          )}>
          <div className="mb-6">
            <Avatar className="size-10">
              <AvatarImage
                src={user?.image ?? "/user.svg"}
                width={24}
                height={24}
                alt={user?.name ?? "username"}
                className="text-brand-text-muted h-8 w-8"
              />
            </Avatar>
          </div>
          <ThemeToggle className="text-brand-text-muted hover:text-brand-text hover:bg-brand-component mb-auto" />
          <Button
            asChild
            variant="ghost"
            className="flex h-auto w-full flex-col items-center py-2 text-red-400 hover:bg-red-400/10 hover:text-red-300">
            <Link href="/api/auth/signout" className="appearance-none">
              <LogOut className="mb-1 h-5 w-5" />
              <span className="text-xs">Sign Out</span>
            </Link>
          </Button>
        </motion.div>
      )}
    </div>
  );
}
