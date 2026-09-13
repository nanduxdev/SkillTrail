import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Code2,
  Folder,
  GitPullRequest,
  Lightbulb,
  Users,
  BookOpen,
  Boxes,
  CircleDot,
} from "lucide-react";

import { Separator } from "@/components/ui/separator";

import { Button } from "@/components/ui/button";
import { useLenisScrollTo, useReveal } from "@/hooks/marketingHooks";

const sources = [
  {
    label: "Commits",
    description: "feat, fix, refactor",
    icon: Code2,
    className: "left-[2%] top-[6.5%]",
  },
  {
    label: "Projects",
    description: "apps, libraries",
    icon: Folder,
    className: "left-[41%] -top-[1.5%]",
  },
  {
    label: "DSA Practice",
    description: "problems, patterns",
    icon: BarChart3,
    className: "right-[2%] top-[10%]",
  },
  {
    label: "Pull Requests",
    description: "reviews, discussions",
    icon: GitPullRequest,
    className: "left-[23%] top-[21.5%]",
  },
  {
    label: "Contributions",
    description: "open source",
    icon: Users,
    className: "-right-[2%] top-[26%]",
  },
];

function SourceCard({
  label,
  description,
  icon: Icon,
  className,
}: {
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  className: string;
}) {
  return (
    <div
      className={[
        "absolute z-10 flex w-[200px] items-center gap-4",
        "rounded-2xl border border-neutral-200/80 bg-white/75",
        "px-5 py-4 shadow-[0_10px_30px_rgba(40,25,15,0.03)]",
        "backdrop-blur-sm",
        className,
      ].join(" ")}
    >
      <div className="shrink-0">
        <Icon className="size-6 stroke-[1.8] text-neutral-900" />
      </div>

      <div>
        <p className="font-sans text-sm font-semibold text-neutral-900">
          {label}
        </p>
        <p className="mt-0.5 font-sans text-xs text-neutral-500">
          {description}
        </p>
      </div>
    </div>
  );
}

function StoryCard() {
  const storyItems = [
    {
      label: "What you built",
      icon: Boxes,
    },
    {
      label: "What you learnt",
      icon: BookOpen,
    },
    {
      label: "Why it matters",
      icon: CircleDot,
    },
  ];

  return (
    <div className="absolute -bottom-[13%] left-1/2 z-20 w-[330px] -translate-x-1/2">
      {/* Backing cards */}
      <div className="absolute inset-x-8 -bottom-1 h-[145px] rotate-2 rounded-2xl bg-orange-100/40" />
      <div className="absolute inset-x-5 bottom-0 h-[145px] -rotate-2 rounded-2xl bg-orange-50/70" />

      {/* Main card */}
      <div className="relative overflow-hidden rounded-2xl border border-orange-200/80 bg-white/95 shadow-[0_18px_50px_rgba(120,55,20,0.08)] backdrop-blur-sm">
        <div className="px-7 py-2">
          {/* Header */}
          <div className="flex items-center gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-orange-50">
              <Lightbulb className="size-6 text-orange-600" strokeWidth={1.8} />
            </div>

            <div>
              <h3 className="font-sans text-xl font-semibold tracking-tight text-neutral-900">
                Your Story
              </h3>

              <p className="mt-0.5 text-xs text-neutral-500">
                The story inside your work
              </p>
            </div>
          </div>
        </div>

        <Separator className="bg-orange-100/80" />

        {/* Story points */}
        <div className="px-7">
          {storyItems.map((item, index) => {
            const Icon = item.icon;

            return (
              <div key={item.label}>
                <div className="flex items-center gap-3 py-3">
                  {/* Icon */}
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-orange-50">
                    <Icon
                      className="size-[15px] text-orange-700"
                      strokeWidth={1.7}
                    />
                  </div>

                  {/* Label */}
                  <span className="whitespace-nowrap text-sm font-medium text-neutral-800">
                    {item.label}
                  </span>

                  {/* Content placeholder */}
                  <div className="ml-auto h-1.5 w-[54px] rounded-full bg-[#F0EDE7]" />
                </div>

                {index < storyItems.length - 1 && (
                  <Separator className="bg-neutral-100" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
function NetworkLines() {
  return (
    <svg
      aria-hidden="true"
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 800 520"
      fill="none"
      preserveAspectRatio="none"
    >
      {/* Commits → Story */}
      <path
        d="M115 105 C120 205 285 205 390 385"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeDasharray="7 7"
        className="text-neutral-400"
      />

      {/* Projects → Story */}
      <path
        d="M450 65 C510 190 420 155 410 385"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeDasharray="7 7"
        className="text-neutral-400"
      />

      {/* DSA → Story */}
      <path
        d="M650 125 C650 230 520 235 430 385"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeDasharray="7 7"
        className="text-neutral-400"
      />

      {/* PR → Story */}
      <path
        d="M300 185 C345 270 350 275 400 385"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeDasharray="7 7"
        className="text-neutral-400"
      />

      {/* Contributions → Story */}
      <path
        d="M700 210 C700 315 500 275 435 385"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeDasharray="7 7"
        className="text-neutral-400"
      />

      {/* Connection dots */}
      <circle
        cx="115"
        cy="105"
        r="5"
        fill="currentColor"
        className="text-orange-600"
      />
      <circle
        cx="450"
        cy="65"
        r="5"
        fill="currentColor"
        className="text-orange-600"
      />
      <circle
        cx="650"
        cy="125"
        r="5"
        fill="currentColor"
        className="text-orange-600"
      />
      <circle
        cx="300"
        cy="185"
        r="5"
        fill="currentColor"
        className="text-orange-600"
      />
      <circle
        cx="700"
        cy="210"
        r="5"
        fill="currentColor"
        className="text-orange-600"
      />
    </svg>
  );
}

function DecorativeSquares() {
  const squares = [
    "left-[26%] top-[0%]",
    "right-[30%] top-[0%]",
    "right-[6%] top-[9%]",
    "left-[8%] top-[42%]",
    "left-[18%] top-[55%]",
    "right-[20%] top-[42%]",
    "right-[1%] top-[55%]",
    "left-[51%] top-[37%]",
  ];

  return (
    <>
      {squares.map((position, index) => (
        <span
          key={index}
          className={[
            "absolute size-5 rounded-[3px] bg-orange-100/80",
            position,
            index % 3 === 0 && "bg-orange-200/60",
          ]
            .filter(Boolean)
            .join(" ")}
        />
      ))}
    </>
  );
}

export function Hero() {
  const scrollTo = useLenisScrollTo();
  const onJoinClick = scrollTo("#join");
   const { ref, visible } = useReveal();
  return (
    <section 
     ref={ref}
    className={ `reveal ${visible ? "in" : ""} relative overflow-hidden bg-[#faf9f6]`}>
      <div className="mx-auto flex min-h-[720px] max-w-[1440px] items-center px-6 py-20 sm:px-10 lg:px-16">
        <div className="grid w-full items-center gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-8">
          {/* Left */}
          <div className="relative z-30 max-w-[590px]">
            <p className="mb-10 font-mono text-xs font-medium uppercase tracking-[0.22em] text-neutral-500">
              Built for developers
            </p>

            <h1
              className="
                        font-serif
                        font-semibold
                        leading-[0.92]
                        tracking-[-0.055em]
                        text-[#111417]

                        text-[3.5rem]
                        sm:text-[4.5rem]

                        md:max-w-[700px]

                        lg:max-w-[590px]
                        lg:text-[clamp(3.8rem,6vw,6rem)]
                    "
            >
              <span className="block">You already did the work.</span>

              <span className="block italic text-[#c94d20]">
                Now tell the story.
              </span>
            </h1>

            <p className="mt-10 max-w-[540px] font-sans text-lg leading-8 text-neutral-500 sm:text-xl">
              SkillTrail helps developers find the story inside the work
              they&apos;ve already done — and turn it into something worth
              sharing.
            </p>

            <div className="mt-10">
              <Button className="h-16 rounded-lg bg-[#c94d20] px-9 text-base font-semibold text-white shadow-none hover:bg-[#b8441b]">
                <Link
                  href="#join"
                  onClick={onJoinClick}
                  className="flex items-center"
                >
                  Join the first developers
                  <ArrowRight className="ml-3 size-5" />
                </Link>
              </Button>

              <p className="mt-4 font-sans text-sm text-neutral-500">
                Help shape what gets built next.
              </p>
            </div>
          </div>

          {/* Right visual */}
          <div className="relative illustration-float hidden h-[560px] lg:block">

            <DecorativeSquares />

            <NetworkLines />

            {sources.map((source) => (
              <SourceCard key={source.label} {...source} />
            ))}

            <StoryCard />

            {/* Small accent strokes */}
            <span className="absolute bottom-[26%] left-[28%] h-8 w-px rotate-[-38deg] bg-orange-500" />
            <span className="absolute bottom-[24%] left-[31%] h-5 w-px rotate-[-72deg] bg-orange-500" />

            <span className="absolute bottom-[26%] right-[27%] h-8 w-px rotate-[38deg] bg-orange-500" />
            <span className="absolute bottom-[24%] right-[31%] h-5 w-px rotate-[72deg] bg-orange-500" />
          </div>
        </div>
      </div>
    </section>
  );
}
