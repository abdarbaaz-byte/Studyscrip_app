
import Link from "next/link";
import { Logo } from "@/components/icons";

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <Logo className="h-6 w-6" width={24} height={24} />
          <p className="text-center text-sm leading-loose md:text-left">
            Built by StudyScript. &copy; {new Date().getFullYear()}. All rights reserved.
          </p>
        </div>
         <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link>
            <Link href="/disclaimer" className="hover:text-foreground">Disclaimer</Link>
        </div>
      </div>
    </footer>
  );
}
