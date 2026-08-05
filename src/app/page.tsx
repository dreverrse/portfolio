import Link from "next/link";
import { FadeIn } from "@/components/FadeIn";
import {
  ArrowRight,
  PenTool,
  FileCode2,
  Code2,
  Layout,
  Palette,
} from "lucide-react";

const skills = [
  { icon: Palette, label: "Adobe Photoshop", desc: "Desain grafis dan manipulasi gambar" },
  { icon: PenTool, label: "Adobe Illustrator", desc: "Desain logo dan ilustrasi vektor" },
  { icon: FileCode2, label: "HTML", desc: "Struktur halaman web" },
  { icon: Code2, label: "CSS", desc: "Gaya dan tampilan halaman web" },
  { icon: Code2, label: "C++", desc: "Pemrograman dasar dan logika" },
  { icon: Layout, label: "WordPress", desc: "Membangun dan mengelola website" },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-24">
      <section className="relative overflow-x-clip">
        <div className="hidden sm:block absolute -top-32 -left-32 h-96 w-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
        <div className="hidden sm:block absolute -bottom-32 -right-32 h-96 w-96 bg-highlight/5 rounded-full blur-3xl pointer-events-none" />

        <FadeIn>
          <div className="relative">
            <p className="text-sm font-medium text-highlight mb-4 tracking-wider uppercase">
              Welcome to my space
            </p>
            <h1 className="text-3xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
              <span className="text-foreground">Halo, saya</span>
              <br />
              <span className="text-foreground">Andre Kusuma Firmansah</span>
            </h1>
            <p className="mt-6 max-w-xl text-base sm:text-lg text-muted leading-relaxed">
              Desainer yang berfokus pada desain logo dan penggemar pemrograman.
              Saya menguasai HTML, CSS, dan C++, serta terbiasa menggunakan
              Adobe Photoshop, Adobe Illustrator, dan WordPress.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.15}>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Link
              href="/portfolio"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-accent text-white font-medium text-sm hover:bg-highlight/80 transition-all duration-200 glow-hover"
            >
              Lihat Portfolio
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-border text-foreground font-medium text-sm hover:bg-surface hover:border-accent transition-all duration-200"
            >
              Tentang Saya
            </Link>
          </div>
        </FadeIn>

      </section>

      <FadeIn delay={0.3}>
        <section className="mt-24">
          <h2 className="text-2xl font-bold mb-8">
            <span className="text-foreground">Keahlian</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {skills.map((skill) => {
              const Icon = skill.icon;
              return (
                <div
                  key={skill.label}
                  className="group p-5 rounded-xl border border-border bg-card/50 hover:bg-surface/50 hover:border-accent transition-all duration-300 glow-hover"
                >
                  <Icon className="h-8 w-8 text-highlight mb-3 group-hover:scale-110 transition-transform duration-300" />
                  <h3 className="font-semibold text-foreground">{skill.label}</h3>
                  <p className="text-sm text-muted mt-1">{skill.desc}</p>
                </div>
              );
            })}
          </div>
        </section>
      </FadeIn>

      <FadeIn delay={0.4}>
        <section className="mt-24 p-8 rounded-2xl border border-border bg-card/30 text-center">
          <h2 className="text-2xl font-bold mb-3">Mari Berkolaborasi</h2>
          <p className="text-muted mb-6 max-w-md mx-auto">
            Punya project menarik atau sekadar ingin ngobrol? Jangan ragu untuk
            menghubungi saya.
          </p>
          <Link
            href="mailto:work.andrefirmansah@gmail.com"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-white font-medium text-sm hover:bg-highlight/80 transition-all duration-200 glow-hover"
          >
            Hubungi Saya
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </FadeIn>
    </div>
  );
}
