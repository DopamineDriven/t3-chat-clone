import type { BaseSVGProps } from "@/icons/index";

export function LoaderCircle({ role = "img", ...svg }: BaseSVGProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      role={role}
      {...svg}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
