import { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;
const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
};

export const IconGrid = (p: P) => (
  <svg {...base} {...p}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

export const IconUsers = (p: P) => (
  <svg {...base} {...p}>
    <path d="M16 19v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 17.5V19" />
    <circle cx="10" cy="8" r="3" />
    <path d="M20 19v-1.4a3.5 3.5 0 0 0-2.6-3.4M15.5 5.2a3 3 0 0 1 0 5.6" />
  </svg>
);

export const IconInbox = (p: P) => (
  <svg {...base} {...p}>
    <path d="M3 12h4l1.5 3h7l1.5-3h4" />
    <path d="M5 5h14l2 7v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5z" />
  </svg>
);

export const IconUpload = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 16V4M12 4l-4 4M12 4l4 4" />
    <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
  </svg>
);

export const IconSearch = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3" />
  </svg>
);

export const IconClose = (p: P) => (
  <svg {...base} {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export const IconCheck = (p: P) => (
  <svg {...base} {...p}>
    <path d="M5 12.5l4.5 4.5L19 7" />
  </svg>
);

export const IconChevron = (p: P) => (
  <svg {...base} {...p}>
    <path d="M9 6l6 6-6 6" />
  </svg>
);

export const IconArrowRight = (p: P) => (
  <svg {...base} {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const IconEdit = (p: P) => (
  <svg {...base} {...p}>
    <path d="M4 20h4l10-10-4-4L4 16v4z" />
    <path d="M13.5 6.5l4 4" />
  </svg>
);

export const IconSettings = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 6.7 19l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 3 13.4H3a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 4.6 6.7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9.3A1.6 1.6 0 0 0 10.4 3V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8v.1a1.6 1.6 0 0 0 1.4 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z" />
  </svg>
);

export const IconShield = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

export const IconSpark = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M18 6l-2.5 2.5M8.5 15.5L6 18" />
  </svg>
);

export const IconWarn = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 4l9 16H3z" />
    <path d="M12 10v4M12 17h.01" />
  </svg>
);

export const IconDoc = (p: P) => (
  <svg {...base} {...p}>
    <path d="M6 3h8l4 4v14a0 0 0 0 1 0 0H6a0 0 0 0 1 0 0z" />
    <path d="M14 3v4h4M8 13h8M8 17h6" />
  </svg>
);

export const IconTrash = (p: P) => (
  <svg {...base} {...p}>
    <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" />
  </svg>
);

export const IconStar = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 3l2.6 5.6 6 .8-4.4 4.2 1.1 6L12 17.8 6.7 19.6l1.1-6L3.4 9.4l6-.8z" />
  </svg>
);

export const IconBuilding = (p: P) => (
  <svg {...base} {...p}>
    <path d="M4 21V5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v16M13 21V9h6a1 1 0 0 1 1 1v11M4 21h17" />
    <path d="M7 8h3M7 12h3M16 13h1M16 17h1" />
  </svg>
);

export const IconBolt = (p: P) => (
  <svg {...base} {...p}>
    <path d="M13 3L4 14h7l-1 7 9-11h-7z" />
  </svg>
);
