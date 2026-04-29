
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getInitials = (name: string) => {
  if (!name) return "";
  const nameParts = name.split(' ');
  if (nameParts.length > 1) {
    return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
  }
  return name[0].toUpperCase();
};

export const generateAverpayId = (fullName: string) => {
  if (!fullName) return "AP-00000";
  const initials = getInitials(fullName);
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `AP - ${initials}${randomNum}`;
};
