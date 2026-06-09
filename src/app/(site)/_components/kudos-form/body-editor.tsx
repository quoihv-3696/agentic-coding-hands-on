"use client";
"use no memo";

import { useState, useCallback } from "react";
import type { ReactNode } from "react";
import { useEditor, EditorContent, ReactRenderer } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Mention from "@tiptap/extension-mention";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import type { SuggestionOptions, SuggestionKeyDownProps } from "@tiptap/suggestion";
import tippy, { type Instance as TippyInstance } from "tippy.js";
import { Bold, Italic, Strikethrough, List, Link2, Quote } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/lib/i18n/i18n-context";
import { searchProfilesAction } from "@/lib/kudos/actions";
import type { Profile } from "@/lib/kudos/types";
import { LinkPopup } from "./link-popup";
import { MentionList, type MentionListRef } from "./mention-list";

// Attrs passed to command() when a mention item is selected.
// Must be assignable to TipTap's MentionNodeAttrs: id nullable, label optional.
interface MentionAttrs {
  id: string | null;
  label?: string | null;
}

function buildMentionSuggestion(
  emptyLabel: string,
): Partial<SuggestionOptions<Profile, MentionAttrs>> {
  return {
    items: async ({ query }) =>
      (await searchProfilesAction(query)).slice(0, 6),

    render: () => {
      let component: ReactRenderer;
      let popup: TippyInstance[];

      return {
        onStart(props) {
          component = new ReactRenderer(MentionList, {
            props: {
              items: props.items as Profile[],
              command: (attrs: MentionAttrs) => props.command(attrs),
              emptyLabel,
            },
            editor: props.editor,
          });

          if (!props.clientRect) return;

          popup = tippy("body", {
            getReferenceClientRect: props.clientRect as () => DOMRect,
            appendTo: () => document.body,
            content: component.element,
            showOnCreate: true,
            interactive: true,
            trigger: "manual",
            placement: "bottom-start",
          });
        },

        onUpdate(props) {
          component.updateProps({
            items: props.items as Profile[],
            command: (attrs: MentionAttrs) => props.command(attrs),
            emptyLabel,
          });

          if (!props.clientRect) return;
          popup[0]?.setProps({
            getReferenceClientRect: props.clientRect as () => DOMRect,
          });
        },

        onKeyDown({ event }: SuggestionKeyDownProps) {
          if (event.key === "Escape") {
            popup?.[0]?.hide();
            return true;
          }
          // component / its ref can be absent if a key fires before onStart
          // resolves or when the list is empty — guard both to avoid crashing.
          const ref = component?.ref as MentionListRef | null;
          return ref?.onKeyDown?.({ event }) ?? false;
        },

        onExit() {
          popup?.[0]?.destroy();
          component?.destroy();
        },
      };
    },
  };
}

interface ToolbarButton {
  label: string;
  icon: ReactNode;
  action: () => void;
  active: boolean;
}

interface BodyEditorProps {
  onChange: (html: string) => void;
  onMentionsChange?: (profileIds: string[]) => void;
}

export function BodyEditor({ onChange, onMentionsChange }: BodyEditorProps) {
  const { t } = useTranslations();
  const [linkPopupOpen, setLinkPopupOpen] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      // StarterKit (v3) bundles the Link extension — configure it here instead of
      // adding a separate Link extension (which would register 'link' twice).
      StarterKit.configure({ link: { openOnClick: false } }),
      Mention.configure({
        HTMLAttributes: { class: "font-bold text-[#FFEA9E] cursor-pointer" },
        renderHTML({ options, node }) {
          return [
            "span",
            { ...options.HTMLAttributes, "data-id": node.attrs.id as string },
            `@${node.attrs.label as string}`,
          ];
        },
        suggestion: buildMentionSuggestion(t("kudosForm.mentionEmpty")),
      }),
      Placeholder.configure({ placeholder: t("kudosForm.bodyPlaceholder") }),
      CharacterCount.configure({ limit: 1000 }),
    ],
    onUpdate({ editor: ed }) {
      onChange(ed.getHTML());
      if (onMentionsChange) {
        const ids: string[] = [];
        ed.state.doc.descendants((node) => {
          if (node.type.name === "mention") {
            ids.push(node.attrs.id as string);
          }
        });
        onMentionsChange([...new Set(ids)]);
      }
    },
  });

  const charCount =
    (editor?.storage as { characterCount?: { characters: () => number } })
      ?.characterCount?.characters() ?? 0;

  const handleLinkSave = useCallback(
    ({ text, url }: { text: string; url: string }) => {
      if (!editor) return;
      if (text) {
        editor.chain().focus().insertContent(`<a href="${url}">${text}</a>`).run();
      } else {
        editor.chain().focus().setLink({ href: url }).run();
      }
      setLinkPopupOpen(false);
    },
    [editor],
  );

  if (!editor) return null;

  const toolbarButtons: ToolbarButton[] = [
    {
      label: "Bold",
      icon: <Bold className="size-4" aria-hidden />,
      action: () => editor.chain().focus().toggleBold().run(),
      active: editor.isActive("bold"),
    },
    {
      label: "Italic",
      icon: <Italic className="size-4" aria-hidden />,
      action: () => editor.chain().focus().toggleItalic().run(),
      active: editor.isActive("italic"),
    },
    {
      label: "Strikethrough",
      icon: <Strikethrough className="size-4" aria-hidden />,
      action: () => editor.chain().focus().toggleStrike().run(),
      active: editor.isActive("strike"),
    },
    {
      label: "Ordered list",
      icon: <List className="size-4" aria-hidden />,
      action: () => editor.chain().focus().toggleOrderedList().run(),
      active: editor.isActive("orderedList"),
    },
    {
      label: "Add link",
      icon: <Link2 className="size-4" aria-hidden />,
      action: () => setLinkPopupOpen(true),
      active: editor.isActive("link"),
    },
    {
      label: "Blockquote",
      icon: <Quote className="size-4" aria-hidden />,
      action: () => editor.chain().focus().toggleBlockquote().run(),
      active: editor.isActive("blockquote"),
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Toolbar — design: row of 6 icon buttons with border, top-rounded corners */}
      <div className="flex items-center">
        {toolbarButtons.map(({ label, icon, action, active }, idx) => (
          <button
            key={label}
            type="button"
            aria-label={label}
            aria-pressed={active}
            onClick={action}
            className={cn(
              "flex h-10 w-14 items-center justify-center border border-[#998C5F]",
              idx === 0 && "rounded-tl-lg",
              idx === toolbarButtons.length - 1 && "rounded-tr-lg",
              "bg-transparent text-[#00101A] hover:bg-[rgba(255,234,158,0.15)]",
              active && "bg-[rgba(153,140,95,0.2)]",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#998C5F]",
            )}
          >
            {icon}
          </button>
        ))}
      </div>

      {/* Editor content area — design: white bg, border, bottom-rounded, min 200px */}
      <EditorContent
        editor={editor}
        className={cn(
          "min-h-[200px] rounded-b-lg border border-t-0 border-[#998C5F] bg-white px-6 py-4",
          "text-base font-bold leading-6 text-[#00101A]",
          "[&_.tiptap]:min-h-[160px] [&_.tiptap]:outline-none",
          "[&_.tiptap_p.is-editor-empty:first-child::before]:pointer-events-none",
          "[&_.tiptap_p.is-editor-empty:first-child::before]:float-left",
          "[&_.tiptap_p.is-editor-empty:first-child::before]:h-0",
          "[&_.tiptap_p.is-editor-empty:first-child::before]:text-[#999]",
          "[&_.tiptap_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]",
        )}
      />

      {/* Link popup — floats above the editor when toolbar link button clicked */}
      <LinkPopup
        open={linkPopupOpen}
        onClose={() => setLinkPopupOpen(false)}
        onSave={handleLinkSave}
      />

      {/* Char count — design shows "0/1.000" right-aligned below editor */}
      <div className="mt-1 flex justify-end">
        <span className="text-sm font-bold leading-6 tracking-[0.5px] text-[#999]">
          {charCount}/1000
        </span>
      </div>
    </div>
  );
}
