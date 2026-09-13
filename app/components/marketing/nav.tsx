import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Nav() {
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <nav
        className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between"
        aria-label="SkillTrail navigation"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center" aria-label="SkillTrail home">
          <Image
            src="/brand/skilltrail-logo.svg"
            alt="SkillTrail"
            width={120}
            height={28}
            priority
            className="h-7 w-auto"
          />
        </Link>

        {/* Nav links — hidden on small screens */}
        <div className="hidden md:flex items-center gap-8 text-sm font-sans text-muted-foreground">
          <a
            href="#why"
            className="hover:text-foreground transition-colors duration-150"
          >
            Why
          </a>
          <a
            href="#how-it-works"
            className="hover:text-foreground transition-colors duration-150"
          >
            How it works
          </a>
          <a
            href="#story"
            className="hover:text-foreground transition-colors duration-150"
          >
            The story
          </a>
        </div>

        {/* CTA */}
        <Button variant="outline" size="sm">
          <a href="#signup" id="nav-cta">
            Become a founding user
          </a>
        </Button>
      </nav>
    </header>
  );
}
