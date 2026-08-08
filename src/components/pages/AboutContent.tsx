"use client";

import { FadeIn } from "@/components/FadeIn";
import { Stagger, StaggerItem } from "@/components/Stagger";
import { useI18n } from "@/lib/i18n";
import {
  Code2,
  PenTool,
  FileCode2,
  Layout,
  MapPin,
  Mail,
  Phone,
  Award,
  Users,
  Briefcase,
  Home,
  Palette,
} from "lucide-react";

const skills = [
  { icon: Palette, label: "Adobe Photoshop" },
  { icon: PenTool, label: "Adobe Illustrator" },
  { icon: FileCode2, label: "HTML" },
  { icon: Code2, label: "CSS" },
  { icon: Code2, label: "C++" },
  { icon: Layout, label: "WordPress" },
];

const education = [
  {
    year: "2020 - 2022",
    title: "SMKN 9 Kota Semarang",
    descKey: "edu.smk",
  },
  {
    year: "2017 - 2019",
    title: "MTsN 2 Kota Semarang",
    descKey: "edu.mts",
  },
  {
    year: "2010 - 2016",
    title: "SDN Pandean Lamper 05",
    descKey: "edu.sd",
  },
];

const jobs = [
  {
    yearKey: "2022 - {present}",
    title: "ISA Grafika",
    descKey: "job.isagrafika",
  },
];

const experiences = [
  { icon: Award, textKey: "exp.seminar" },
  { icon: Users, textKey: "exp.mpk" },
  { icon: Briefcase, textKey: "exp.studentCompany" },
  { icon: Award, textKey: "exp.contest" },
  { icon: Code2, textKey: "exp.disnaker" },
];

export function AboutContent() {
  const { t } = useI18n();

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-16 sm:py-24">
      <FadeIn>
        <div className="flex flex-col items-center text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/avatars/profile-placeholder.png"
            alt={t("home.profileAlt")}
            className="h-28 w-28 sm:h-32 sm:w-32 rounded-full object-cover border-2 border-accent/30 shadow-lg mb-6"
          />
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">
            {t("about.title")}
          </h1>
          <p className="text-muted text-lg max-w-2xl leading-relaxed">
            {t("about.intro")}
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <Stagger className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StaggerItem className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card/50">
            <MapPin className="h-5 w-5 text-highlight" />
            <div>
              <p className="text-xs text-muted">{t("about.location")}</p>
              <p className="text-sm font-medium">Semarang, Indonesia</p>
            </div>
          </StaggerItem>
          <StaggerItem className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card/50">
            <Phone className="h-5 w-5 text-highlight" />
            <div>
              <p className="text-xs text-muted">{t("about.whatsapp")}</p>
              <p className="text-sm font-medium">+62 851-5859-9235</p>
            </div>
          </StaggerItem>
          <StaggerItem className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card/50">
            <Mail className="h-5 w-5 text-highlight" />
            <div>
              <p className="text-xs text-muted">{t("about.email")}</p>
              <p className="text-sm font-medium break-all">work.andrefirmansah@gmail.com</p>
            </div>
          </StaggerItem>
        </Stagger>
      </FadeIn>

      <FadeIn delay={0.15}>
        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-6">
            <span className="text-foreground">{t("about.skills")}</span>
          </h2>
          <Stagger className="flex flex-wrap gap-3">
            {skills.map((item) => {
              const Icon = item.icon;
              return (
                <StaggerItem
                  key={item.label}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card/50 text-sm text-muted hover:text-highlight hover:border-accent transition-all duration-200"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </StaggerItem>
              );
            })}
          </Stagger>
        </section>
      </FadeIn>

      <FadeIn delay={0.2}>
        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-6">
            <span className="text-foreground">{t("about.education")}</span>
          </h2>
          <Stagger className="space-y-0">
            {education.map((item, i) => (
              <StaggerItem key={i} className="relative pl-8 pb-8 border-l border-border last:pb-0">
                <div className="absolute left-0 top-0 -translate-x-1/2 h-3 w-3 rounded-full bg-highlight border-2 border-background" />
                <p className="text-xs text-highlight font-medium mb-1">
                  {item.year}
                </p>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm text-muted mt-1">{t(item.descKey)}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </section>
      </FadeIn>

      <FadeIn delay={0.25}>
        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-6">
            <span className="text-foreground">{t("about.jobs")}</span>
          </h2>
          <Stagger className="space-y-0">
            {jobs.map((item, i) => (
              <StaggerItem key={i} className="relative pl-8 pb-8 border-l border-border last:pb-0">
                <div className="absolute left-0 top-0 -translate-x-1/2 h-3 w-3 rounded-full bg-highlight border-2 border-background" />
                <p className="text-xs text-highlight font-medium mb-1">
                  {item.yearKey.replace("{present}", t("about.present"))}
                </p>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm text-muted mt-1">{t(item.descKey)}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </section>
      </FadeIn>

      <FadeIn delay={0.3}>
        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-6">
            <span className="text-foreground">{t("about.experience")}</span>
          </h2>
          <Stagger className="space-y-3">
            {experiences.map((item, i) => {
              const Icon = item.icon;
              return (
                <StaggerItem key={i} className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card/50">
                  <Icon className="h-5 w-5 text-highlight mt-0.5 shrink-0" />
                  <p className="text-sm text-foreground/90 leading-relaxed">
                    {t(item.textKey)}
                  </p>
                </StaggerItem>
              );
            })}
          </Stagger>
        </section>
      </FadeIn>

      <FadeIn delay={0.35}>
        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-6">
            <span className="text-foreground">{t("about.address")}</span>
          </h2>
          <div className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card/50">
            <Home className="h-5 w-5 text-highlight mt-0.5 shrink-0" />
            <p className="text-sm text-foreground/90 leading-relaxed">
              Jl. Gajah Barat IV, RT 04 RW IX, Kel. Pandean Lamper, Kec.
              Gayamsari, Kota Semarang.
            </p>
          </div>
        </section>
      </FadeIn>
    </div>
  );
}
