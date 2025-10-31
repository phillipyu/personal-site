import Image from "next/image";
import type { ReactNode } from "react";
import { SmiskiAnimation } from "../components/SmiskiAnimation";

type Highlight = {
  icon: string;
  content: ReactNode;
};

const inlineLinkClass =
  "underline underline-offset-4 decoration-1 hover:no-underline";

const highlights: readonly Highlight[] = [
  {
    icon: "💻",
    content: (
      <>
        was an early engineer at{" "}
        <a href="https://merge.dev" className={inlineLinkClass}>
          Merge
        </a>
        , where I built and scaled Merge&apos;s core distributed syncing engine
      </>
    ),
  },
  {
    icon: "🤖",
    content: (
      <>
        was an early-ish engineer at{" "}
        <a href="https://asana.com" className={inlineLinkClass}>
          Asana
        </a>
        , where I built product features across web, mobile, and our API
      </>
    ),
  },
  {
    icon: "📚",
    content: (
      <>
        studied computer science and statistics at Harvard, where I was a top teaching fellow for{" "}
        <a href="https://cs50.harvard.edu" className={inlineLinkClass}>
          CS50
        </a>{" "}
        and interned at Biogen and Microsoft
      </>
    ),
  },
  {
    icon: "🧬",
    content: (
      <>
        researched{" "}
        <a
          href="https://en.wikipedia.org/wiki/Inflammatory_pathway"
          className={inlineLinkClass}
        >
          inflammatory pathways
        </a>{" "}
        involved in frontotemporal dementia at UT Southwestern
      </>
    ),
  },
] as const;

const socialLinks = [
  { label: "linkedin", href: "https://www.linkedin.com/in/phillip-yu/" },
  { label: "github", href: "https://github.com/phillipyu" },
  { label: "email", href: "mailto:phillip.yu.1@gmail.com" },
  { label: "x", href: "https://twitter.com/yu_phillip" },
] as const;

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f4f8ed] text-[#1d1d1d]">
      <div className="mx-auto flex w-full max-w-5xl flex-col px-6 pb-14 pt-8 sm:px-10 lg:px-16 lg:pb-20 lg:pt-12">
        <header className="flex flex-col gap-2">
          <div className="flex items-end justify-between gap-6">
            <h1 className="text-3xl font-light tracking-wide text-[#0f0f0f] sm:text-4xl lg:text-5xl">
              Phillip Yu
            </h1>
            <SmiskiAnimation className="translate-y-6" showCaption={false} />
          </div>
        </header>

        <main className="mt-12 flex flex-col gap-12 lg:mt-16 lg:flex-row lg:items-start lg:gap-20">
          <div className="flex w-full flex-col items-center gap-6 lg:w-auto lg:pt-4">
            <div className="relative h-72 w-56 overflow-hidden rounded-[160px] bg-white shadow-[0_28px_60px_rgba(15,15,15,0.08)] sm:h-80 sm:w-64 lg:h-96 lg:w-72">
              <Image
                src="/profile.jpeg"
                alt="Phillip Yu"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="flex flex-wrap justify-center gap-x-2 gap-y-1 text-center text-[#1f1f1f]">
              {socialLinks.map((link, index) => (
                <span key={link.label} className="flex items-center gap-2">
                  <a href={link.href} className={inlineLinkClass}>
                    {link.label}
                  </a>
                  {index < socialLinks.length - 1 ? <span>|</span> : null}
                </span>
              ))}
            </div>
          </div>

          <section className="flex-1 space-y-5 leading-6 tracking-[0.01em] text-[#262626]">
            <p>
              I am a full-stack software engineer based out of NYC. Most
              recently, I&apos;ve been tinkering around in AI ×
              life sciences.
            </p>

            <div className="space-y-3">
              <p className="text-[#1d1d1d]">Previously, I:</p>
              <ul className="space-y-3 list-outside list-disc pl-6 marker:text-[#1a1a1a]">
                {highlights.map((highlight, index) => (
                  <li
                    key={`${highlight.icon}-${index}`}
                  >
                    <span className="mr-2">
                      {highlight.icon}
                    </span>
                    {highlight.content}
                  </li>
                ))}
              </ul>
            </div>

            <p>
              My hobbies include teaching, racket sports, hiking, reading,
              history, and new languages.
            </p>

            <section
              id="writing"
              className="space-y-4 border-t border-[#dbe2cf] pt-12"
            >
              <h2 className="text-2xl font-normal tracking-wide text-[#1d1d1d]">
                Writing
              </h2>
              <ul className="space-y-3 text-[#3f3f3f]">
                <li>
                  <a href="https://phillipyu.substack.com/p/canada" className={inlineLinkClass}>
                    On people-pleasing
                  </a>
                  <span className="ml-4 uppercase tracking-wide text-[#7a7a7a]">
                    2022
                  </span>
                </li>
              </ul>
            </section>

            <section
              id="projects"
              className="space-y-4 border-t border-[#dbe2cf] pt-12"
            >
              <h2 className="text-2xl font-normal tracking-wide text-[#1d1d1d]">
                Projects
              </h2>
              <p className="text-[#2f2f2f]">
                Coming soon
              </p>
            </section>

          </section>
        </main>
      </div>
    </div>
  );
}
