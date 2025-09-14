
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


export function WhatsAppIcon(props: Omit<React.ComponentProps<typeof Image>, 'src' | 'alt'>) {
  return (
    <Image
      src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
      alt="WhatsApp Icon"
      width={24}
      height={24}
      {...props}
    />
  );
}
