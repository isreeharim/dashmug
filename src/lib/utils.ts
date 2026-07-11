import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
export const menuOrigin = () => process.env.NEXT_PUBLIC_MENU_URL ?? "http://menu.localhost:3000";
