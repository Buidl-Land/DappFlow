"use client";

import React, { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { hardhat } from "viem/chains";
import { Bars3Icon, BugAntIcon } from "@heroicons/react/24/outline";
import { IdeaPulseLogo } from "~~/components/assets/IdeaPulseLogo";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useOutsideClick, useTargetNetwork } from "~~/hooks/scaffold-eth";

type HeaderMenuLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

export const menuLinks: HeaderMenuLink[] = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Projects",
    href: "/projects",
  },
  {
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    label: "Debug Contracts",
    href: "/debug",
    icon: <BugAntIcon className="w-4 h-4" />,
  },
];

export const HeaderMenuLinks = () => {
  const pathname = usePathname();

  return (
    <>
      {menuLinks.map(({ label, href, icon }) => {
        const isActive = pathname === href;
        return (
          <li key={href}>
            <Link
              href={href}
              passHref
              className={`${
                isActive ? "bg-primary/20" : ""
              } hover:bg-primary/20 hover:shadow-md focus:!bg-primary/20 active:!text-neutral py-1.5 px-3 text-sm rounded-full gap-2 grid grid-flow-col transition-all duration-200`}
            >
              {icon}
              <span>{label}</span>
            </Link>
          </li>
        );
      })}
    </>
  );
};

/**
 * Site header
 */
export const Header = () => {
  const { targetNetwork } = useTargetNetwork();
  const isLocalNetwork = targetNetwork.id === hardhat.id;

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const burgerMenuRef = useRef<HTMLDivElement>(null);
  useOutsideClick(
    burgerMenuRef,
    useCallback(() => setIsDrawerOpen(false), []),
  );

  return (
    <div className="fixed top-0 z-50 w-full bg-base-100 shadow-md">
      <div className="px-4 mx-auto max-w-7xl">
        <div className="flex justify-between items-center py-3">
          <div className="flex items-center gap-4">
            <div className="lg:hidden dropdown" ref={burgerMenuRef}>
              <label
                tabIndex={0}
                className={`btn btn-ghost ${isDrawerOpen ? "hover:bg-secondary/20" : "hover:bg-transparent"}`}
                onClick={() => {
                  setIsDrawerOpen(prevIsOpenState => !prevIsOpenState);
                }}
              >
                <Bars3Icon className="w-6 h-6" />
              </label>
              {isDrawerOpen && (
                <ul
                  tabIndex={0}
                  className="p-2 mt-3 w-52 shadow-lg menu menu-compact dropdown-content bg-base-100 rounded-xl"
                  onClick={() => {
                    setIsDrawerOpen(false);
                  }}
                >
                  <HeaderMenuLinks />
                </ul>
              )}
            </div>
            <Link href="/" passHref className="flex items-center gap-2 shrink-0">
              <IdeaPulseLogo />
              <div className="flex flex-col">
                <span className="font-bold leading-tight tracking-wide">IdeaPulse</span>
                <span className="text-xs tracking-widest opacity-75">INNOVATION HUB</span>
              </div>
            </Link>
            <ul className="hidden ml-4 lg:flex items-center gap-2">
              <HeaderMenuLinks />
            </ul>
          </div>
          <div className="flex items-center gap-2">
            <RainbowKitCustomConnectButton />
          </div>
        </div>
      </div>
    </div>
  );
};
