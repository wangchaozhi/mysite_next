"use client";

import { useCallback, useEffect, useRef, useState, type ChangeEvent } from "react";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import StarterKit from "@tiptap/starter-kit";
import { EditorContent, useEditor } from "@tiptap/react";

type Props = {
  name: string;
  defaultValue?: string;
};

function toolbarButtonClassName(active = false) {
  return `inline-flex shrink-0 items-center justify-center rounded-full border px-3 py-2 text-sm transition ${
    active
      ? "border-[rgba(31,26,23,0.82)] bg-[rgba(31,26,23,0.9)] text-[var(--paper-50)]"
      : "border-[rgba(83,72,56,0.14)] bg-white/90 text-[var(--ink-700)] hover:bg-white hover:text-[var(--ink-950)]"
  }`;
}

function getUploadErrorMessage(error?: string): string {
  switch (error) {
    case "Unauthorized":
      return "请先登录后台后再上传图片。";
    case "Unsupported type":
      return "仅支持 JPG、PNG、WEBP 或 GIF 图片。";
    case "File too large":
      return "图片大小不能超过 5MB。";
    case "Missing file":
      return "没有读取到图片文件，请重试。";
    default:
      return "图片上传失败，请稍后重试。";
  }
}

function normalizeUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  return `https://${url}`;
}

export default function RichTextEditor({ name, defaultValue = "" }: Props) {
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const syncHiddenInput = useCallback((html: string) => {
    if (hiddenInputRef.current) {
      hiddenInputRef.current.value = html;
    }
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
        HTMLAttributes: {
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Placeholder.configure({
        placeholder: "写下正文，可以插入图片、链接、引用、代码块...",
      }),
    ],
    content: defaultValue || "<p></p>",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "tiptap min-h-[220px] rounded-[1.5rem] border border-[rgba(83,72,56,0.12)] bg-white/85 p-5 text-base leading-8 text-[var(--ink-700)] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] prose prose-sm max-w-none sm:prose-base",
      },
    },
    onUpdate: ({ editor }) => {
      syncHiddenInput(editor.getHTML());
    },
  });

  useEffect(() => {
    const input = hiddenInputRef.current;
    const form = input?.form;

    if (!form || !editor) {
      return;
    }

    const currentEditor = editor;

    function handleSubmit() {
      syncHiddenInput(currentEditor.getHTML());
    }

    function handleFormData(event: Event) {
      const formDataEvent = event as Event & { formData: FormData };
      formDataEvent.formData.set(name, currentEditor.getHTML());
    }

    form.addEventListener("submit", handleSubmit);
    form.addEventListener("formdata", handleFormData);

    return () => {
      form.removeEventListener("submit", handleSubmit);
      form.removeEventListener("formdata", handleFormData);
    };
  }, [editor, name, syncHiddenInput]);

  function setLink() {
    if (!editor) {
      return;
    }

    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("请输入链接地址", previousUrl ?? "");

    if (url === null) {
      return;
    }

    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: normalizeUrl(url.trim()) }).run();
  }

  async function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !editor) {
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json().catch(() => ({}))) as { error?: string; url?: string };

      if (!response.ok) {
        setUploadError(getUploadErrorMessage(data.error));
        return;
      }

      if (!data.url) {
        setUploadError("上传成功，但没有拿到图片地址。");
        return;
      }

      editor.chain().focus().setImage({ src: data.url }).run();
      syncHiddenInput(editor.getHTML());
    } catch {
      setUploadError("网络异常，图片上传失败，请稍后重试。");
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  }

  return (
    <div className="editor-surface w-full min-w-0">
      <input ref={hiddenInputRef} type="hidden" name={name} defaultValue={defaultValue} />
      <div className="mb-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className={toolbarButtonClassName(editor?.isActive("bold"))}
        >
          加粗
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={toolbarButtonClassName(editor?.isActive("italic"))}
        >
          斜体
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
          className={toolbarButtonClassName(editor?.isActive("underline"))}
        >
          下划线
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleStrike().run()}
          className={toolbarButtonClassName(editor?.isActive("strike"))}
        >
          删除线
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          className={toolbarButtonClassName(editor?.isActive("heading", { level: 2 }))}
        >
          小标题
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          className={toolbarButtonClassName(editor?.isActive("bulletList"))}
        >
          列表
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          className={toolbarButtonClassName(editor?.isActive("blockquote"))}
        >
          引用
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
          className={toolbarButtonClassName(editor?.isActive("codeBlock"))}
        >
          代码块
        </button>
        <button type="button" onClick={setLink} className={toolbarButtonClassName(editor?.isActive("link"))}>
          链接
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().setTextAlign("left").run()}
          className={toolbarButtonClassName(editor?.isActive({ textAlign: "left" }))}
        >
          左对齐
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().setTextAlign("center").run()}
          className={toolbarButtonClassName(editor?.isActive({ textAlign: "center" }))}
        >
          居中
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().setTextAlign("right").run()}
          className={toolbarButtonClassName(editor?.isActive({ textAlign: "right" }))}
        >
          右对齐
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().setHorizontalRule().run()}
          className={toolbarButtonClassName()}
        >
          分割线
        </button>
        <label className={toolbarButtonClassName()}>
          {isUploading ? "上传中..." : "插入图片"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleImageUpload}
            disabled={isUploading}
          />
        </label>
      </div>
      {uploadError ? <p className="mb-3 text-sm text-[var(--accent-600)]">{uploadError}</p> : null}
      <EditorContent editor={editor} />
    </div>
  );
}
