import type { Metadata } from "next";
import { FadeIn } from "@/components/FadeIn";
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

export const metadata: Metadata = {
  title: "About",
  description: "Tentang saya — keahlian, pendidikan, dan pengalaman.",
};

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
    desc: "Jurusan Rekayasa Perangkat Lunak (RPL).",
  },
  {
    year: "2017 - 2019",
    title: "MTsN 2 Kota Semarang",
    desc: "Pendidikan menengah pertama.",
  },
  {
    year: "2010 - 2016",
    title: "SDN Pandean Lamper 05",
    desc: "Pendidikan dasar.",
  },
];

const jobs = [
  {
    year: "2022 - Sekarang",
    title: "ISA Grafika",
    desc: "Bekerja sebagai Staff Production.",
  },
];

const experiences = [
  {
    icon: Award,
    text: "Gemar mengikuti acara seminar atau workshop, baik secara online maupun offline.",
  },
  {
    icon: Users,
    text: "Pernah mengikuti Organisasi MPK di SMK.",
  },
  {
    icon: Briefcase,
    text: "Pernah mengikuti Program Student Company.",
  },
  {
    icon: Award,
    text: "Pernah mengikuti kontes atau lomba, baik secara online maupun offline.",
  },
  {
    icon: Code2,
    text: "Pernah mengikuti program DISNAKER Teknisi Ponsel dan Jurusan RPL.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-16 sm:py-24">
      <FadeIn>
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">
          Tentang <span className="text-foreground">Saya</span>
        </h1>
        <p className="text-muted text-lg max-w-2xl leading-relaxed">
          Nama saya Andre Kusuma Firmansah, biasa dipanggil Andre. Saya memiliki
          keahlian dalam bidang desain, terutama desain logo. Saya juga
          menguasai beberapa bahasa pemrograman di antaranya HTML, CSS, dan C++.
        </p>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card/50">
            <MapPin className="h-5 w-5 text-highlight" />
            <div>
              <p className="text-xs text-muted">Lokasi</p>
              <p className="text-sm font-medium">Semarang, Indonesia</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card/50">
            <Phone className="h-5 w-5 text-highlight" />
            <div>
              <p className="text-xs text-muted">WhatsApp</p>
              <p className="text-sm font-medium">+62 851-5859-9235</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card/50">
            <Mail className="h-5 w-5 text-highlight" />
            <div>
              <p className="text-xs text-muted">Email</p>
              <p className="text-sm font-medium break-all">work.andrefirmansah@gmail.com</p>
            </div>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.15}>
        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-6">
            <span className="text-foreground">Keahlian</span>
          </h2>
          <div className="flex flex-wrap gap-3">
            {skills.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card/50 text-sm text-muted hover:text-highlight hover:border-accent transition-all duration-200"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </div>
              );
            })}
          </div>
        </section>
      </FadeIn>

      <FadeIn delay={0.2}>
        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-6">
            <span className="text-foreground">Pendidikan</span>
          </h2>
          <div className="space-y-0">
            {education.map((item, i) => (
              <div
                key={i}
                className="relative pl-8 pb-8 border-l border-border last:pb-0"
              >
                <div className="absolute left-0 top-0 -translate-x-1/2 h-3 w-3 rounded-full bg-highlight border-2 border-background" />
                <p className="text-xs text-highlight font-medium mb-1">
                  {item.year}
                </p>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm text-muted mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </FadeIn>

      <FadeIn delay={0.25}>
        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-6">
            <span className="text-foreground">Pekerjaan</span>
          </h2>
          <div className="space-y-0">
            {jobs.map((item, i) => (
              <div
                key={i}
                className="relative pl-8 pb-8 border-l border-border last:pb-0"
              >
                <div className="absolute left-0 top-0 -translate-x-1/2 h-3 w-3 rounded-full bg-highlight border-2 border-background" />
                <p className="text-xs text-highlight font-medium mb-1">
                  {item.year}
                </p>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm text-muted mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </FadeIn>

      <FadeIn delay={0.3}>
        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-6">
            <span className="text-foreground">Pengalaman</span>
          </h2>
          <div className="space-y-3">
            {experiences.map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={i}
                  className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card/50"
                >
                  <Icon className="h-5 w-5 text-highlight mt-0.5 shrink-0" />
                  <p className="text-sm text-foreground/90 leading-relaxed">
                    {item.text}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      </FadeIn>

      <FadeIn delay={0.35}>
        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-6">
            <span className="text-foreground">Alamat</span>
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
