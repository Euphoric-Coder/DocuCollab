import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  CAN_UNDO_COMMAND,
  CAN_REDO_COMMAND,
  $isTextNode,
} from "lexical";
import { $createParagraphNode } from "lexical";
import { $setBlocksType } from "@lexical/selection";
import React, { useEffect, useState, useCallback } from "react";

function Divider() {
  return <div className="w-px bg-[#0f1c34] mx-1"></div>;
}

export default function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [alignment, setAlignment] = useState<
    "left" | "center" | "right" | "justify"
  >("left");
  const [fontSize, setFontSize] = useState("text-base");
  const [fontStyle, setFontStyle] = useState("font-sans");

  const updateToolbar = useCallback(() => {
    editor.getEditorState().read(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        setIsBold(selection.hasFormat("bold"));
        setIsItalic(selection.hasFormat("italic"));
        setIsUnderline(selection.hasFormat("underline"));
      }
    });
  }, [editor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateToolbar();
          return true;
        },
        1
      ),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return true;
        },
        1
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return true;
        },
        1
      )
    );
  }, [editor, updateToolbar]);

  const formatText = (command: string) => {
    editor.update(() => {
      editor.dispatchCommand(FORMAT_TEXT_COMMAND, command);
    });
  };

  const applyTailwindStyle = (styleClass: string) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        selection.getNodes().forEach((node) => {
          if ($isTextNode(node)) {
            node.setStyle(`class`, styleClass);
          }
        });
      }
    });
  };

  const changeFontSize = (size: string) => {
    setFontSize(size);
    applyTailwindStyle(size);
  };

  const changeFontStyle = (style: string) => {
    setFontStyle(style);
    applyTailwindStyle(style);
  };

  const setTextAlignment = (
    alignment: "left" | "center" | "right" | "justify"
  ) => {
    editor.update(() => {
      editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, alignment);
    });
    setAlignment(alignment);
  };

  return (
    <div className="flex mb-1 bg-[#09111f] p-1 rounded-t-lg align-middle">
      {/* Undo Button */}
      <button
        disabled={!canUndo}
        onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
        className="toolbar-item border-0 flex bg-transparent rounded-none p-2 cursor-pointer align-middle active:bg-[#0f1c34] hover:bg-[#0f1c34] disabled:cursor-not-allowed"
      >
        <i className="undo h-[18px] w-[18px] mt-[2px] flex opacity-60 disabled:opacity-20">
          ⟲
        </i>
      </button>

      {/* Redo Button */}
      <button
        disabled={!canRedo}
        onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
        className="toolbar-item border-0 flex bg-transparent rounded-none p-2 cursor-pointer align-middle active:bg-[#0f1c34] hover:bg-[#0f1c34] disabled:cursor-not-allowed"
      >
        <i className="redo h-[18px] w-[18px] mt-[2px] flex opacity-60 disabled:opacity-20">
          ⟳
        </i>
      </button>

      <Divider />

      {/* Bold Button */}
      <button
        onClick={() => formatText("bold")}
        className={`toolbar-item border-0 flex bg-transparent rounded-none p-2 cursor-pointer align-middle active:bg-[#0f1c34] hover:bg-[#0f1c34] ${
          isBold ? "bg-[#0f1c34]" : ""
        }`}
      >
        <i className="bold h-[18px] w-[18px] mt-[2px] flex opacity-60">B</i>
      </button>

      {/* Italic Button */}
      <button
        onClick={() => formatText("italic")}
        className={`toolbar-item border-0 flex bg-transparent rounded-none p-2 cursor-pointer align-middle active:bg-[#0f1c34] hover:bg-[#0f1c34] ${
          isItalic ? "bg-[#0f1c34]" : ""
        }`}
      >
        <i className="italic h-[18px] w-[18px] mt-[2px] flex opacity-60">I</i>
      </button>

      {/* Underline Button */}
      <button
        onClick={() => formatText("underline")}
        className={`toolbar-item border-0 flex bg-transparent rounded-none p-2 cursor-pointer align-middle active:bg-[#0f1c34] hover:bg-[#0f1c34] ${
          isUnderline ? "bg-[#0f1c34]" : ""
        }`}
      >
        <i className="underline h-[18px] w-[18px] mt-[2px] flex opacity-60">
          U
        </i>
      </button>

      <Divider />

      {/* Alignment Buttons */}
      <button
        onClick={() => setTextAlignment("left")}
        className={`toolbar-item border-0 flex bg-transparent rounded-none p-2 cursor-pointer align-middle active:bg-[#0f1c34] hover:bg-[#0f1c34] ${
          alignment === "left" ? "bg-[#0f1c34]" : ""
        }`}
      >
        <i className="left-align h-[18px] w-[18px] mt-[2px] flex opacity-60">
          ⯇
        </i>
      </button>

      <button
        onClick={() => setTextAlignment("center")}
        className={`toolbar-item border-0 flex bg-transparent rounded-none p-2 cursor-pointer align-middle active:bg-[#0f1c34] hover:bg-[#0f1c34] ${
          alignment === "center" ? "bg-[#0f1c34]" : ""
        }`}
      >
        <i className="center-align h-[18px] w-[18px] mt-[2px] flex opacity-60">
          ⊙
        </i>
      </button>

      <button
        onClick={() => setTextAlignment("right")}
        className={`toolbar-item border-0 flex bg-transparent rounded-none p-2 cursor-pointer align-middle active:bg-[#0f1c34] hover:bg-[#0f1c34] ${
          alignment === "right" ? "bg-[#0f1c34]" : ""
        }`}
      >
        <i className="right-align h-[18px] w-[18px] mt-[2px] flex opacity-60">
          ⯈
        </i>
      </button>

      <button
        onClick={() => setTextAlignment("justify")}
        className={`toolbar-item border-0 flex bg-transparent rounded-none p-2 cursor-pointer align-middle active:bg-[#0f1c34] hover:bg-[#0f1c34] ${
          alignment === "justify" ? "bg-[#0f1c34]" : ""
        }`}
      >
        <i className="justify-align h-[18px] w-[18px] mt-[2px] flex opacity-60">
          ↔
        </i>
      </button>

      <Divider />

      {/* Font Size Selector */}
      <select
        value={fontSize}
        onChange={(e) => changeFontSize(e.target.value)}
        className="border rounded p-1 text-black"
      >
        <option value="text-sm">Small</option>
        <option value="text-base">Base</option>
        <option value="text-lg">Large</option>
        <option value="text-xl">Extra Large</option>
        <option value="text-2xl">2X Large</option>
      </select>

      {/* Font Style Selector */}
      <select
        value={fontStyle}
        onChange={(e) => changeFontStyle(e.target.value)}
        className="border rounded p-1 text-black ml-2"
      >
        <option value="font-sans">Sans-serif</option>
        <option value="font-serif">Serif</option>
        <option value="font-mono">Monospace</option>
        <option value="font-cursive">Cursive</option>
      </select>
    </div>
  );
}
