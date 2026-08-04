import type { Metadata } from "next";
import { FadeIn } from "@/components/FadeIn";
import {
  Code2,
  Coffee,
  Gamepad2,
  Music,
  BookOpen,
  MapPin,
  GraduationCap,
  Mail,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About",
  description: "Tentang saya — pengalaman, minat, dan perjalanan saya.",
};

const timeline = [
  {
    year: "2024 - Sekarang",
    title: "Full-Stack Developer",
    desc: "Mengembangkan aplikasi web dan mobile dengan teknologi modern.",
  },
  {
    year: "2022 - 2024",
    title: "Frontend Developer",
    desc: "Membangun antarmuka web yang responsif dan interaktif.",
  },
  {
    year: "2020 - 2022",
    title: "Junior Developer",
    desc: "Memulai perjalanan di dunia pengembangan web.",
  },
  {
    year: "SMK Negeri 9 Semarang",
    title: "Rekayasa Perangkat Lunak (RPL)",
    desc: "Lulusan jurusan Rekayasa Perangkat Lunak, mendalami pemrograman dasar hingga pengembangan aplikasi web dan mobile.",
  },
];

const interests = [
  { icon: Code2, label: "Coding" },
  { icon: Music, label: "Music" },
  { icon: Gamepad2, label: "Gaming" },
  { icon: BookOpen, label: "Reading" },
  { icon: Coffee, label: "Coffee" },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-16 sm:py-24">
      <FadeIn>
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">
          Tentang <span className="text-foreground">Saya</span>
        </h1>
        <p className="text-muted text-lg max-w-2xl leading-relaxed">
          Halo, saya Andre Kusuma Firmansah — full-stack developer dan lulusan
          SMK Negeri 9 Semarang jurusan Rekayasa Perangkat Lunak (RPL). Saya
          percaya bahwa kode yang bersih dan desain yang baik dapat mengubah
          dunia, dan saya selalu berusaha belajar hal baru untuk menghadirkan
          solusi terbaik.
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
            <GraduationCap className="h-5 w-5 text-highlight" />
            <div>
              <p className="text-xs text-muted">Pendidikan</p>
              <p className="text-sm font-medium">SMKN 9 Semarang · RPL</p>
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

      <FadeIn delay={0.2}>
        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-6">
            <span className="text-foreground">Perjalanan</span>
          </h2>
          <div className="space-y-0">
            {timeline.map((item, i) => (
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
            <span className="text-foreground">Minat</span>
          </h2>
          <div className="flex flex-wrap gap-3">
            {interests.map((item) => {
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
    </div>
  );
}
