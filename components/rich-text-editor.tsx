"use client";

import { useRef, type ChangeEvent } from "react";
import Image from "@tiptap/extension-image";
import StarterKit from "@tiptap/starter-kit";
import { EditorContent, useEditor } from "@tiptap/react";

type Props = {
  name: string;
  defaultValue?: string;
};

function toolbarButtonClassName() {
  return "inline-flex shrink-0 items-center justify-center rounded-full border border-[rgba(83,72,56,0.14)] bg-white/90 px-3 py-2 text-sm text-[var(--ink-700)] hover:bg-white hover:text-[var(--ink-950)]";
}

export default function RichTextEditor({ name, defaultValue = "" }: Props) {
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [StarterKit, Image],
    content: defaultValue || "<p></p>",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "tiptap min-h-[220px] rounded-[1.5rem] border border-[rgba(83,72,56,0.12)] bg-white/85 p-5 text-base leading-8 text-[var(--ink-700)] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] prose prose-sm max-w-none sm:prose-base",
      },
    },
    onUpdate: ({ editor }) => {
      if (hiddenInputRef.current) {
        hiddenInputRef.current.value = editor.getHTML();
      }
    },
  });

  async function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !editor) {
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      return;
    }

    const data = (await response.json()) as { url?: string };
    if (data.url) {
      editor.chain().focus().setImage({ src: data.url }).run();
    }

    event.target.value = "";
  }

  return (
    <div className="editor-surface w-full min-w-0">
      <input ref={hiddenInputRef} type="hidden" name={name} defaultValue={defaultValue} />
      <div className="mb-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className={toolbarButtonClassName()}
        >
          加粗
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={toolbarButtonClassName()}
        >
          斜体
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          className={toolbarButtonClassName()}
        >
          小标题
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          className={toolbarButtonClassName()}
        >
          列表
        </button>
        <label className={toolbarButtonClassName()}>
          插入图片
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleImageUpload}
          />
        </label>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
