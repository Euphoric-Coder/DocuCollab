/*
  Working on the updates (Still in Progress)
  Still needs some Work...........

*/

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import {
  $getSelection,
  $isRangeSelection,
  $isTextNode, // Import utility to check if a node is a text node
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  CAN_UNDO_COMMAND,
  CAN_REDO_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  KEY_ENTER_COMMAND, // Import Enter key command
  COMMAND_PRIORITY_LOW,
} from "lexical";
import { $patchStyleText } from "@lexical/selection"; // Utility for patching inline styles
import { $createTextNode, $createParagraphNode } from "lexical"; // For creating text and paragraph nodes
import { useCallback, useEffect, useRef, useState } from "react";

const FONT_SIZE_OPTIONS = [
  "12px",
  "14px",
  "16px",
  "18px",
  "20px",
  "24px",
  "32px",
  "48px",
];
const FONT_STYLE_OPTIONS = [
  "Arial",
  "Times New Roman",
  "Courier New",
  "Georgia",
  "Verdana",
  "Tahoma",
];

const LowPriority = 1;

function Divider() {
  return <div className="divider" />;
}

export default function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const toolbarRef = useRef(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [fontSize, setFontSize] = useState("14px"); // Default font size
  const [fontFamily, setFontFamily] = useState("Arial"); // Default font family

  // Function to update toolbar state based on selection
  const $updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode();

      // Check if the selected node is a text node
      if ($isTextNode(anchorNode)) {
        const styles = anchorNode.getStyle();
        const selectedFontSize =
          styles.match(/font-size:\s?(\d+px)/)?.[1] || "14px";
        const selectedFontFamily =
          styles.match(/font-family:\s?([^;]+)/)?.[1] || "Arial";
        setFontSize(selectedFontSize);
        setFontFamily(selectedFontFamily);
      } else {
        setFontSize("14px");
        setFontFamily("Arial");
      }
    }
  }, []);

  // Handle Enter key and ensure that the new line retains font size and font family
  const handleEnterKey = useCallback(
    (event) => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const anchorNode = selection.anchor.getNode();

        // Only apply styles if the node is a text node
        if ($isTextNode(anchorNode)) {
          const styles = anchorNode.getStyle();
          const currentFontSize =
            styles.match(/font-size:\s?(\d+px)/)?.[1] || "14px";
          const currentFontFamily =
            styles.match(/font-family:\s?([^;]+)/)?.[1] || "Arial";

          editor.update(() => {
            // Create a new paragraph and text node
            const newParagraphNode = $createParagraphNode();
            const newTextNode = $createTextNode(); // Create a new text node

            // Apply the font size and family to the new text node
            newTextNode.setStyle(
              `font-size: ${currentFontSize}; font-family: ${currentFontFamily};`
            );

            // Append the text node to the paragraph
            newParagraphNode.append(newTextNode);

            // Insert the new paragraph into the editor
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              selection.insertNodes([newParagraphNode]);
            }
          });

          // Prevent default behavior of Enter key
          return true;
        }
      }
      return false;
    },
    [editor]
  );

  // Register update listeners and Enter key command
  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_payload, _newEditor) => {
          $updateToolbar();
          return false;
        },
        LowPriority
      ),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        LowPriority
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        LowPriority
      ),
      editor.registerCommand(
        KEY_ENTER_COMMAND, // Register the Enter key command
        handleEnterKey,
        COMMAND_PRIORITY_LOW
      )
    );
  }, [editor, $updateToolbar, handleEnterKey]);

  // Apply font size to selected text
  const applyFontSize = useCallback(
    (fontSize) => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $patchStyleText(selection, { "font-size": fontSize });
        }
      });
      setFontSize(fontSize);
    },
    [editor]
  );

  // Apply font family to selected text
  const applyFontFamily = useCallback(
    (fontFamily) => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $patchStyleText(selection, { "font-family": fontFamily });
        }
      });
      setFontFamily(fontFamily);
    },
    [editor]
  );

  return (
    <div className="toolbar" ref={toolbarRef}>
      <button
        disabled={!canUndo}
        onClick={() => {
          editor.dispatchCommand(UNDO_COMMAND, undefined);
        }}
        className="toolbar-item spaced"
        aria-label="Undo"
      >
        <i className="format undo" />
      </button>
      <button
        disabled={!canRedo}
        onClick={() => {
          editor.dispatchCommand(REDO_COMMAND, undefined);
        }}
        className="toolbar-item"
        aria-label="Redo"
      >
        <i className="format redo" />
      </button>
      <Divider />
      {/* Font Size Dropdown */}
      <select
        className="toolbar-item font-size-select"
        value={fontSize}
        onChange={(e) => applyFontSize(e.target.value)}
      >
        {FONT_SIZE_OPTIONS.map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>
      {/* Font Family Dropdown */}
      <select
        className="toolbar-item font-family-select"
        value={fontFamily}
        onChange={(e) => applyFontFamily(e.target.value)}
      >
        {FONT_STYLE_OPTIONS.map((family) => (
          <option key={family} value={family}>
            {family}
          </option>
        ))}
      </select>
      <Divider />
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
        }}
        className={"toolbar-item spaced"}
        aria-label="Format Bold"
      >
        <i className="format bold" />
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
        }}
        className={"toolbar-item spaced"}
        aria-label="Format Italics"
      >
        <i className="format italic" />
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
        }}
        className={"toolbar-item spaced"}
        aria-label="Format Underline"
      >
        <i className="format underline" />
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough");
        }}
        className={"toolbar-item spaced"}
        aria-label="Format Strikethrough"
      >
        <i className="format strikethrough" />
      </button>
      <Divider />
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left");
        }}
        className="toolbar-item spaced"
        aria-label="Left Align"
      >
        <i className="format left-align" />
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center");
        }}
        className="toolbar-item spaced"
        aria-label="Center Align"
      >
        <i className="format center-align" />
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right");
        }}
        className="toolbar-item spaced"
        aria-label="Right Align"
      >
        <i className="format right-align" />
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify");
        }}
        className="toolbar-item"
        aria-label="Justify Align"
      >
        <i className="format justify-align" />
      </button>
    </div>
  );
}
