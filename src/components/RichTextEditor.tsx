"use client";

import { useEditor, EditorContent, useEditorState } from "@tiptap/react";
import type { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { Markdown } from "@tiptap/markdown";
import type { ComponentType } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Braces,
  Heading1,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Redo2,
  RemoveFormatting,
  Undo2,
  Underline,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

type ToolbarButtonProps = {
  icon: ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
};

function ToolbarButton({
  icon: Icon,
  label,
  onClick,
  active,
  disabled,
}: ToolbarButtonProps) {
  return (
    <Button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      variant="ghost"
      size="icon-sm"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(
        "text-muted",
        active && "bg-accent/20 text-accent"
      )}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );
}

const Divider = () => <span className="mx-1 h-5 w-px bg-border" />;

function setLink(editor: Editor) {
  const previous = editor.getAttributes("link").href as string | undefined;
  const url = window.prompt("Link URL", previous || "https://");
  if (url === null) return;
  if (url === "") {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    return;
  }
  editor
    .chain()
    .focus()
    .extendMarkRange("link")
    .setLink({ href: url })
    .run();
}

function setImage(editor: Editor) {
  const url = window.prompt("URL gambar", "https://");
  if (!url) return;
  editor.chain().focus().setImage({ src: url }).run();
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  className,
}: RichTextEditorProps) {
  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({
          link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
        }),
        Image.configure({ allowBase64: true }),
        Placeholder.configure({ placeholder }),
        Markdown,
      ],
      content: value,
      contentType: "markdown",
      immediatelyRender: false,
      onUpdate: ({ editor: e }) => {
        onChange(e.getMarkdown());
      },
    },
    []
  );

  const active = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e?.isActive("bold") ?? false,
      italic: e?.isActive("italic") ?? false,
      underline: e?.isActive("underline") ?? false,
      strike: e?.isActive("strike") ?? false,
      h1: e?.isActive("heading", { level: 1 }) ?? false,
      h2: e?.isActive("heading", { level: 2 }) ?? false,
      h3: e?.isActive("heading", { level: 3 }) ?? false,
      bullet: e?.isActive("bulletList") ?? false,
      ordered: e?.isActive("orderedList") ?? false,
      quote: e?.isActive("blockquote") ?? false,
      codeBlock: e?.isActive("codeBlock") ?? false,
      link: e?.isActive("link") ?? false,
    }),
  });

  if (!editor) return null;

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-background overflow-hidden focus-within:border-accent focus-within:ring-1 focus-within:ring-accent transition-colors",
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-surface/40 px-2 py-1.5">
        <ToolbarButton
          icon={Bold}
          label="Tebal (Ctrl+B)"
          active={active?.bold}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
        <ToolbarButton
          icon={Italic}
          label="Miring (Ctrl+I)"
          active={active?.italic}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />
        <ToolbarButton
          icon={Underline}
          label="Garis bawah (Ctrl+U)"
          active={active?.underline}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        />
        <Divider />
        <ToolbarButton
          icon={Heading1}
          label="Judul besar"
          active={active?.h1}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
        />
        <ToolbarButton
          icon={Heading2}
          label="Judul sedang"
          active={active?.h2}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        />
        <ToolbarButton
          icon={Heading3}
          label="Judul kecil"
          active={active?.h3}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
        />
        <Divider />
        <ToolbarButton
          icon={List}
          label="Daftar"
          active={active?.bullet}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        />
        <ToolbarButton
          icon={ListOrdered}
          label="Daftar bernomor"
          active={active?.ordered}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        />
        <ToolbarButton
          icon={Quote}
          label="Kutipan"
          active={active?.quote}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        />
        <Divider />
        <ToolbarButton
          icon={Braces}
          label="Blok kode"
          active={active?.codeBlock}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        />
        <ToolbarButton
          icon={LinkIcon}
          label="Tautan"
          active={active?.link}
          onClick={() => setLink(editor)}
        />
        <ToolbarButton
          icon={ImageIcon}
          label="Gambar"
          onClick={() => setImage(editor)}
        />
        <Divider />
        <ToolbarButton
          icon={Undo2}
          label="Urungkan"
          disabled={!editor.can().undo()}
          onClick={() => editor.chain().focus().undo().run()}
        />
        <ToolbarButton
          icon={Redo2}
          label="Ulangi"
          disabled={!editor.can().redo()}
          onClick={() => editor.chain().focus().redo().run()}
        />
        <ToolbarButton
          icon={RemoveFormatting}
          label="Bersihkan format"
          onClick={() =>
            editor.chain().focus().unsetAllMarks().clearNodes().run()
          }
        />
      </div>
      <EditorContent
        editor={editor}
        className="rich-editor min-h-64 max-h-[480px] overflow-y-auto px-4 py-3"
      />
    </div>
  );
}
