"use client";

import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export type Lang = "id" | "en";

const translations = {
  id: {
    "lang.switch": "Ganti bahasa ke English",
    "theme.dark": "Aktifkan mode gelap",
    "theme.light": "Aktifkan mode terang",
    "nav.home": "Home",
    "nav.about": "Tentang",
    "nav.portfolio": "Portofolio",
    "nav.blog": "Blog",
    "nav.toggleMenu": "Buka menu",
    "footer.madeWith": "Dibuat dengan",
    "footer.by": "oleh",
    "footer.admin": "Admin",
    "home.welcome": "Selamat datang di ruangku",
    "home.hello": "Halo, saya",
    "home.tagline":
      "Desainer yang berfokus pada desain logo dan penggemar pemrograman. Saya menguasai HTML, CSS, dan C++, serta terbiasa menggunakan Adobe Photoshop, Adobe Illustrator, dan WordPress.",
    "home.viewPortfolio": "Lihat Portfolio",
    "home.aboutMe": "Tentang Saya",
    "home.skills": "Keahlian",
    "skill.photoshop": "Desain grafis dan manipulasi gambar",
    "skill.illustrator": "Desain logo dan ilustrasi vektor",
    "skill.html": "Struktur halaman web",
    "skill.css": "Gaya dan tampilan halaman web",
    "skill.cpp": "Pemrograman dasar dan logika",
    "skill.wordpress": "Membangun dan mengelola website",
    "home.collab": "Mari Berkolaborasi",
    "home.collabDesc":
      "Punya project menarik atau sekadar ingin ngobrol? Jangan ragu untuk menghubungi saya.",
    "home.contact": "Hubungi Saya",
    "home.profileAlt": "Foto profil Andre",
    "about.title": "Tentang Saya",
    "about.intro":
      "Nama saya Andre Kusuma Firmansah, biasa dipanggil Andre. Saya memiliki keahlian dalam bidang desain, terutama desain logo. Saya juga menguasai beberapa bahasa pemrograman di antaranya HTML, CSS, dan C++.",
    "about.location": "Lokasi",
    "about.whatsapp": "WhatsApp",
    "about.email": "Email",
    "about.skills": "Keahlian",
    "about.education": "Pendidikan",
    "about.jobs": "Pekerjaan",
    "about.experience": "Pengalaman",
    "about.address": "Alamat",
    "about.present": "Sekarang",
    "edu.smk": "Jurusan Rekayasa Perangkat Lunak (RPL).",
    "edu.mts": "Pendidikan menengah pertama.",
    "edu.sd": "Pendidikan dasar.",
    "job.isagrafika": "Bekerja sebagai Staff Production.",
    "exp.seminar":
      "Gemar mengikuti acara seminar atau workshop, baik secara online maupun offline.",
    "exp.mpk": "Pernah mengikuti Organisasi MPK di SMK.",
    "exp.studentCompany": "Pernah mengikuti Program Student Company.",
    "exp.contest": "Pernah mengikuti kontes atau lomba, baik secara online maupun offline.",
    "exp.disnaker":
      "Pernah mengikuti program DISNAKER Teknisi Ponsel dan Jurusan RPL.",
    "portfolio.description":
      "Kumpulan proyek yang telah saya kerjakan. Setiap proyek merupakan pembelajaran baru dan tantangan yang menarik.",
    "portfolio.demo": "Demo",
    "portfolio.code": "Kode",
    "portfolio.back": "Kembali ke Portofolio",
    "blog.description":
      "Tulisan seputar teknologi, programming, dan pengalaman pribadi.",
    "github.title": "GitHub Stats",
    "github.repos": "Repositori",
    "github.stars": "Total Stars",
    "github.followers": "Followers",
    "github.languages": "Bahasa",
    "blog.readMore": "Baca selengkapnya",
    "blog.empty": "Belum ada artikel.",
    "blog.emptySub": "Buat artikel baru di folder content/blog/",
    "blog.searchPlaceholder": "Cari artikel…",
    "blog.searchEmpty": "Tidak ada artikel yang cocok dengan pencarian.",
    "blog.allTags": "Semua",
    "blog.back": "Kembali ke Blog",
    "blog.readingTime": "menit baca",
    "blog.reactions": "Reaksi",
    "blog.comments": "Komentar",
    "blog.commentsEmpty": "Belum ada komentar. Jadilah yang pertama!",
    "blog.commentNamePlaceholder": "Nama kamu",
    "blog.commentMessagePlaceholder": "Tulis komentarmu…",
    "blog.commentSend": "Kirim",
    "blog.commentSending": "Mengirim…",
    "blog.commentErrName": "Nama wajib diisi (maks 30 karakter).",
    "blog.commentErrMessage": "Komentar wajib diisi (maks 500 karakter).",
    "blog.commentErrSend": "Gagal mengirim komentar.",
    "music.empty": "Belum ada lagu yang diputar",
    "music.hint": "Nanti muncul di sini lewat Last.fm",
    "waifu.aria": "Chat dengan KyleBot",
    "waifu.online": "online · asisten AI",
    "waifu.delete": "Hapus chat",
    "waifu.typing": "KyleBot sedang mengetik",
    "waifu.placeholder": "Ketik pesan...",
    "waifu.send": "Kirim pesan",
    "waifu.errApi": "Gagal memanggil API",
    "waifu.errGeneric": "Terjadi kesalahan",
    "waifu.greeting.morning": "Selamat pagi",
    "waifu.greeting.noon": "Selamat siang",
    "waifu.greeting.afternoon": "Selamat sore",
    "waifu.greeting.night": "Selamat malam",
    "waifu.greeting.text":
      "{part}, aku KyleBot. Ada yang bisa aku bantu? Aku siap menemani dan bantu jawab pertanyaanmu.",
    "notfound.title": "Halaman tidak ditemukan",
    "notfound.desc":
      "Halaman yang kamu cari kayaknya tersesat, atau emang belum pernah ada di sini. Jangan khawatir, yang penting kamu ketemu.",
    "notfound.home": "Kembali ke Beranda",
    "notfound.portfolio": "Lihat Portfolio",
    "backtotop.aria": "Kembali ke atas",
  },
  en: {
    "lang.switch": "Switch to Indonesian",
    "theme.dark": "Enable dark mode",
    "theme.light": "Enable light mode",
    "nav.home": "Home",
    "nav.about": "About",
    "nav.portfolio": "Portfolio",
    "nav.blog": "Blog",
    "nav.toggleMenu": "Toggle menu",
    "footer.madeWith": "Made with",
    "footer.by": "by",
    "footer.admin": "Admin",
    "home.welcome": "Welcome to my space",
    "home.hello": "Hello, I'm",
    "home.tagline":
      "A designer focused on logo design and a programming enthusiast. I work with HTML, CSS, and C++, and I'm comfortable using Adobe Photoshop, Adobe Illustrator, and WordPress.",
    "home.viewPortfolio": "View Portfolio",
    "home.aboutMe": "About Me",
    "home.skills": "Skills",
    "skill.photoshop": "Graphic design and image editing",
    "skill.illustrator": "Logo design and vector illustration",
    "skill.html": "Web page structure",
    "skill.css": "Web page styling",
    "skill.cpp": "Basic programming and logic",
    "skill.wordpress": "Building and managing websites",
    "home.collab": "Let's Collaborate",
    "home.collabDesc":
      "Have an interesting project or just want to chat? Don't hesitate to reach out.",
    "home.contact": "Contact Me",
    "home.profileAlt": "Andre's profile photo",
    "about.title": "About Me",
    "about.intro":
      "My name is Andre Kusuma Firmansah, usually called Andre. I have skills in design, especially logo design. I also know several programming languages including HTML, CSS, and C++.",
    "about.location": "Location",
    "about.whatsapp": "WhatsApp",
    "about.email": "Email",
    "about.skills": "Skills",
    "about.education": "Education",
    "about.jobs": "Work",
    "about.experience": "Experience",
    "about.address": "Address",
    "about.present": "Present",
    "edu.smk": "Software Engineering major (RPL).",
    "edu.mts": "Junior high school.",
    "edu.sd": "Elementary school.",
    "job.isagrafika": "Working as a Production Staff member.",
    "exp.seminar":
      "Enjoys attending seminars or workshops, both online and offline.",
    "exp.mpk": "Was a member of the MPK student organization in vocational school.",
    "exp.studentCompany": "Participated in the Student Company program.",
    "exp.contest": "Has joined contests, both online and offline.",
    "exp.disnaker": "Joined the DISNAKER Mobile Technician and RPL program.",
    "portfolio.description":
      "A collection of projects I've worked on. Every project is a new learning experience and an interesting challenge.",
    "portfolio.demo": "Demo",
    "portfolio.code": "Code",
    "portfolio.back": "Back to Portfolio",
    "blog.description":
      "Posts about technology, programming, and personal experiences.",
    "github.title": "GitHub Stats",
    "github.repos": "Repositories",
    "github.stars": "Total Stars",
    "github.followers": "Followers",
    "github.languages": "Languages",
    "blog.readMore": "Read more",
    "blog.empty": "No posts yet.",
    "blog.emptySub": "Create a new post in the content/blog/ folder",
    "blog.searchPlaceholder": "Search articles…",
    "blog.searchEmpty": "No articles match your search.",
    "blog.allTags": "All",
    "blog.back": "Back to Blog",
    "blog.readingTime": "min read",
    "blog.reactions": "Reactions",
    "blog.comments": "Comments",
    "blog.commentsEmpty": "No comments yet. Be the first!",
    "blog.commentNamePlaceholder": "Your name",
    "blog.commentMessagePlaceholder": "Write your comment…",
    "blog.commentSend": "Send",
    "blog.commentSending": "Sending…",
    "blog.commentErrName": "Name is required (max 30 characters).",
    "blog.commentErrMessage": "Comment is required (max 500 characters).",
    "blog.commentErrSend": "Failed to send comment.",
    "music.empty": "No song currently playing",
    "music.hint": "It will show up here via Last.fm",
    "waifu.aria": "Chat with KyleBot",
    "waifu.online": "online · AI assistant",
    "waifu.delete": "Delete chat",
    "waifu.typing": "KyleBot is typing",
    "waifu.placeholder": "Type a message...",
    "waifu.send": "Send message",
    "waifu.errApi": "Failed to call API",
    "waifu.errGeneric": "Something went wrong",
    "waifu.greeting.morning": "Good morning",
    "waifu.greeting.noon": "Good afternoon",
    "waifu.greeting.afternoon": "Good evening",
    "waifu.greeting.night": "Good night",
    "waifu.greeting.text":
      "{part}, I'm KyleBot. Anything I can help with? I'm here to chat and answer your questions.",
    "notfound.title": "Page not found",
    "notfound.desc":
      "The page you're looking for seems lost, or never existed. Don't worry — the important thing is that you found me.",
    "notfound.home": "Back to Home",
    "notfound.portfolio": "View Portfolio",
    "backtotop.aria": "Back to top",
  },
} satisfies Record<Lang, Record<string, string>>;

interface I18nContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string, vars?: Record<string, string>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const LANG_KEY = "lang";
const LANG_EVENT = "langchange";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(LANG_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(LANG_EVENT, callback);
  };
}

function getSnapshot(): Lang {
  try {
    const saved = window.localStorage.getItem(LANG_KEY);
    if (saved === "en" || saved === "id") return saved;
  } catch {
    // ignore
  }
  return "id";
}

function getServerSnapshot(): Lang {
  return "id";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const lang = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setLang = useCallback((next: Lang) => {
    try {
      window.localStorage.setItem(LANG_KEY, next);
    } catch {
      // ignore
    }
    document.documentElement.lang = next;
    window.dispatchEvent(new Event(LANG_EVENT));
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string>) => {
      const dict = translations[lang] as Record<string, string>;
      let text = dict[key] ?? (translations.id as Record<string, string>)[key] ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          text = text.replaceAll(`{${k}}`, v);
        }
      }
      return text;
    },
    [lang]
  );

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within LanguageProvider");
  return ctx;
}

export function formatDate(date: string, lang: Lang): string {
  return new Date(date).toLocaleDateString(lang === "en" ? "en-US" : "id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
