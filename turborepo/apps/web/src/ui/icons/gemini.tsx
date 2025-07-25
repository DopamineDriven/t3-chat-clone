import type { ComponentPropsWithRef } from "react";

export const GeminiIcon = ({
  ...svg
}: Omit<
  ComponentPropsWithRef<"svg">,
  "viewBox" | "fill" | "xmlns" | "role"
>) => (
  <svg
    viewBox="0 0 20 20"
    fill="none"
    role="img"
    xmlns="http://www.w3.org/2000/svg"
    {...svg}>
    <path
      d="M10 20C9.61883 17.4841 8.44253 15.1561 6.6432 13.3568C4.84386 11.5575 2.51593 10.3812 0 10C2.51593 9.61883 4.84386 8.44253 6.6432 6.6432C8.44253 4.84386 9.61883 2.51593 10 0C10.3813 2.51588 11.5576 4.84374 13.3569 6.64306C15.1563 8.44237 17.4841 9.61871 20 10C17.4841 10.3813 15.1563 11.5576 13.3569 13.3569C11.5576 15.1563 10.3813 17.4841 10 20Z"
      fill="currentColor"
    />
  </svg>
);

GeminiIcon.displayName = "GeminiIcon";
