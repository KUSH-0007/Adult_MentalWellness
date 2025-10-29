import { cn } from '@/lib/utils';
import React from 'react';

export const BandageIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14.121 14.121a3 3 0 1 0-4.242-4.242l.53-.53a3 3 0 0 0-4.243-4.243l-1.06 1.06a3 3 0 0 0 0 4.242l4.242 4.242" />
    <path d="M9.879 9.879a3 3 0 1 0 4.242 4.242l-.53.53a3 3 0 0 0 4.243 4.243l1.06-1.06a3 3 0 0 0 0-4.242l-4.242-4.242" />
    <path d="m15 9-1-1" />
    <path d="m10 14-1-1" />
    <path d="m18 6-1-1" />
    <path d="m6 18-1-1" />
  </svg>
);


export const MoonZzzIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg 
     {...props}
     xmlns="http://www.w3.org/2000/svg" 
     width="24" 
     height="24" 
     viewBox="0 0 24 24" 
     fill="none" 
     stroke="currentColor" 
     strokeWidth="2" 
     strokeLinecap="round" 
     strokeLinejoin="round"
    >
        <path d="M12 3a9 9 0 0 0 9 9c0 1.44-.34 2.8-.93 4.07" />
        <path d="M12 3a9 9 0 0 1 0 18A9 9 0 0 1 3.93 7.93" />
        <path d="M17 16a2 2 0 1 1-4 0" />
        <path d="M15 12h.01" />
        <path d="M19 12h.01" />
    </svg>
);
