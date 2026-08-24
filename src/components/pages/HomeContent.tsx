"use client";

import Link from "next/link";
import { FadeIn } from "@/components/FadeIn";
import { ShinyButton } from "@/components/ui/shiny-button";
import { GitHubStats } from "@/components/GitHubStats";
import { Stagger, StaggerItem } from "@/components/Stagger";
import { formatDate, useI18n } from "@/lib/i18n";
import { SOCIAL } from "@/lib/site";
import {
  FaGithub,
  FaInstagram,
  FaWhatsapp,
  FaXTwitter,
} from "react-icons/fa6";
import { PiArrowRightBold as ArrowRight, PiCodeBold as Code2, PiFileCodeBold as FileCode2, PiLayoutBold as Layout, PiPaletteBold as Palette, PiPenNibBold as PenTool } from "react-icons/pi";

interface LatestPost {
  slug: string;
  title: string;
  date: string;
  readingTime: number;
}

const socialLinks = [
  { href: SOCIAL.github, label: "GitHub", Icon: FaGithub },
  { href: SOCIAL.twitter, label: "Twitter/X", Icon: FaXTwitter },
  { href: SOCIAL.instagram, label: "Instagram", Icon: FaInstagram },
  { href: SOCIAL.whatsapp, label: "WhatsApp", Icon: FaWhatsapp },
];

const skills = [
  { icon: Palette, label: "Adobe Photoshop", descKey: "skill.photoshop" },
  { icon: PenTool, label: "Adobe Illustrator", descKey: "skill.illustrator" },
  { icon: FileCode2, label: "HTML", descKey: "skill.html" },
  { icon: Code2, label: "CSS", descKey: "skill.css" },
  { icon: Code2, label: "C++", descKey: "skill.cpp" },
  { icon: Layout, label: "WordPress", descKey: "skill.wordpress" },
];

export function HomeContent({
  latestPosts = [],
}: {
  latestPosts?: LatestPost[];
}) {
  const { t, lang } = useI18n();

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-24">
      <section className="relative overflow-x-clip">
        <div className="hidden sm:block absolute -top-32 -left-32 h-96 w-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
        <div className="hidden sm:block absolute -bottom-32 -right-32 h-96 w-96 bg-highlight/5 rounded-full blur-3xl pointer-events-none" />

        <FadeIn>
          <div className="relative">
            <div>
              <p className="text-sm font-medium text-highlight mb-4 tracking-wider uppercase">
                {t("home.welcome")}
              </p>
              <h1 className="text-3xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
                <span className="text-foreground">{t("home.hello")}</span>
                <br />
                <span className="text-foreground">Andre Kusuma Firmansah</span>
              </h1>
              <p className="mt-6 max-w-xl text-base sm:text-lg text-muted leading-relaxed">
                {t("home.tagline")}
              </p>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.15}>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center">
            <Link
              href="/portfolio"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-all duration-200 glow-hover"
            >
              {t("home.viewPortfolio")}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-border text-foreground font-medium text-sm hover:bg-surface hover:border-accent transition-all duration-200"
            >
              {t("home.aboutMe")}
            </Link>
          </div>

          <div className="mt-6 flex items-center gap-2">
            {socialLinks.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                title={label}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted hover:text-foreground hover:border-accent transition-colors"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </FadeIn>

      </section>

      <FadeIn delay={0.3}>
        <section className="mt-24">
          <h2 className="text-2xl font-bold mb-8">
            <span className="text-foreground">{t("home.skills")}</span>
          </h2>
          <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {skills.map((skill) => {
              const Icon = skill.icon;
              return (
                <StaggerItem
                  key={skill.label}
                  className="group p-5 rounded-xl border border-border bg-card/50 hover:bg-surface/50 hover:border-accent transition-all duration-300 glow-hover"
                >
                  <Icon className="h-8 w-8 text-highlight mb-3 group-hover:scale-110 transition-transform duration-300" />
                  <h3 className="font-semibold text-foreground">{skill.label}</h3>
                  <p className="text-sm text-muted mt-1">{t(skill.descKey)}</p>
                </StaggerItem>
              );
            })}
          </Stagger>
        </section>
      </FadeIn>

      <FadeIn delay={0.35}>
        <section className="mt-24">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              <span className="text-foreground">{t("home.latestTitle")}</span>
            </h2>
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-foreground"
            >
              {t("home.viewAll")}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {latestPosts.map((post) => (
              <StaggerItem key={post.slug} className="h-full">
                <Link
                  href={`/blog/${post.slug}`}
                  className="block h-full p-5 rounded-xl border border-border bg-card/50 hover:bg-surface/50 hover:border-accent transition-all duration-300 glow-hover"
                >
                  <p className="text-xs text-muted mb-2">
                    {formatDate(post.date, lang)} · {post.readingTime}{" "}
                    {t("blog.readingTime")}
                  </p>
                  <h3 className="font-semibold text-foreground leading-snug">
                    {post.title}
                  </h3>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </section>
      </FadeIn>

      <div className="mt-24">
        <GitHubStats />
      </div>

      <FadeIn delay={0.4}>
        <section className="mt-24 p-8 rounded-2xl border border-border bg-card/30 text-center">
          <h2 className="text-2xl font-bold mb-3">{t("home.collab")}</h2>
          <p className="text-muted mb-6 max-w-md mx-auto">
            {t("home.collabDesc")}
          </p>
          <ShinyButton
            onClick={() =>
              (window.location.href = "mailto:work.andrefirmansah@gmail.com")
            }
          >
            {t("home.contact")}
          </ShinyButton>
        </section>
      </FadeIn>
    </div>
  );
}
