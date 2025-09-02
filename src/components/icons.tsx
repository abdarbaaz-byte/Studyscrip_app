
import type { SVGProps } from "react";
import Image from "next/image";

export function Logo(props: React.ComponentProps<typeof Image>) {
  return (
    <Image
      src="/logo-icon.svg"
      alt="StudyScript Logo"
      width={props.width || 32}
      height={props.height || 32}
      {...props}
    />
  );
}


export function WhatsAppIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
        <path d="M16.75 13.96c.25.13.41.2.52.34.11.14.15.42.06.79a2.38 2.38 0 0 1-1.09 1.25c-.28.16-.62.23-1.74.08-.9-.12-1.61-.33-2.2-.55a7.35 7.35 0 0 1-2.9-2.58c-.6-.85-1-1.85-1.02-2.83-.02-.9.23-1.63.7-2.12.5-.52 1.14-.65 1.66-.65H11.4c.25 0 .43.08.57.23.13.15.18.33.16.54l-.27 1.25a.86.86 0 0 1-.18.42c-.09.13-.2.24-.34.33a.45.45 0 0 0-.2.33l-.06.27c.02.07.06.14.13.23.28.32.6.66.98 1.03.46.43.83.74 1.11.93.12.08.23.12.33.12.14 0 .26-.06.37-.18l.16-.18c.11-.13.24-.2.4-.2h.42c.16 0 .3.04.42.12l1.1.66c.17.1.3.2.4.34.1.13.12.28.08.45l-.2 1.03zM12 2a10 10 0 0 0-10 10 10 10 0 0 0 10 10c.3 0 .6-.02.88-.06L20 22l-1.06-7.12A10 10 0 0 0 12 2z"/>
    </svg>
  );
}
