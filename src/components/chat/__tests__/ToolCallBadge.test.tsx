import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolCallBadge } from "../ToolCallBadge";
import type { ToolInvocation } from "ai";

afterEach(() => {
  cleanup();
});

// Helper to build a ToolInvocation fixture
function makeInvocation(
  toolName: string,
  args: Record<string, unknown>,
  state: "partial-call" | "call" | "result",
  result?: unknown
): ToolInvocation {
  if (state === "result") {
    return { toolCallId: "test-id", toolName, args, state, result } as ToolInvocation;
  }
  return { toolCallId: "test-id", toolName, args, state } as ToolInvocation;
}

// --- Label tests ---

test("str_replace_editor create shows Creating <filename>", () => {
  render(
    <ToolCallBadge
      toolInvocation={makeInvocation(
        "str_replace_editor",
        { command: "create", path: "src/components/Card.jsx" },
        "result",
        "ok"
      )}
    />
  );
  expect(screen.getByText("Creating Card.jsx")).toBeDefined();
});

test("str_replace_editor str_replace shows Editing <filename>", () => {
  render(
    <ToolCallBadge
      toolInvocation={makeInvocation(
        "str_replace_editor",
        { command: "str_replace", path: "src/App.tsx" },
        "result",
        "ok"
      )}
    />
  );
  expect(screen.getByText("Editing App.tsx")).toBeDefined();
});

test("str_replace_editor insert shows Editing <filename>", () => {
  render(
    <ToolCallBadge
      toolInvocation={makeInvocation(
        "str_replace_editor",
        { command: "insert", path: "src/index.ts" },
        "result",
        "ok"
      )}
    />
  );
  expect(screen.getByText("Editing index.ts")).toBeDefined();
});

test("str_replace_editor view shows Viewing <filename>", () => {
  render(
    <ToolCallBadge
      toolInvocation={makeInvocation(
        "str_replace_editor",
        { command: "view", path: "src/Button.tsx" },
        "result",
        "ok"
      )}
    />
  );
  expect(screen.getByText("Viewing Button.tsx")).toBeDefined();
});

test("str_replace_editor undo_edit shows Undoing edit on <filename>", () => {
  render(
    <ToolCallBadge
      toolInvocation={makeInvocation(
        "str_replace_editor",
        { command: "undo_edit", path: "src/utils.ts" },
        "result",
        "ok"
      )}
    />
  );
  expect(screen.getByText("Undoing edit on utils.ts")).toBeDefined();
});

test("file_manager rename shows Renaming <filename>", () => {
  render(
    <ToolCallBadge
      toolInvocation={makeInvocation(
        "file_manager",
        { command: "rename", path: "src/OldName.tsx" },
        "result",
        "ok"
      )}
    />
  );
  expect(screen.getByText("Renaming OldName.tsx")).toBeDefined();
});

test("file_manager delete shows Deleting <filename>", () => {
  render(
    <ToolCallBadge
      toolInvocation={makeInvocation(
        "file_manager",
        { command: "delete", path: "src/Obsolete.tsx" },
        "result",
        "ok"
      )}
    />
  );
  expect(screen.getByText("Deleting Obsolete.tsx")).toBeDefined();
});

// --- State / spinner tests ---

test("partial-call state shows spinner, no green dot", () => {
  const { container } = render(
    <ToolCallBadge
      toolInvocation={makeInvocation(
        "str_replace_editor",
        { command: "create", path: "App.tsx" },
        "partial-call"
      )}
    />
  );
  expect(container.querySelector(".animate-spin")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

test("call state shows spinner, no green dot", () => {
  const { container } = render(
    <ToolCallBadge
      toolInvocation={makeInvocation(
        "str_replace_editor",
        { command: "create", path: "App.tsx" },
        "call"
      )}
    />
  );
  expect(container.querySelector(".animate-spin")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

test("result state with result shows green dot, no spinner", () => {
  const { container } = render(
    <ToolCallBadge
      toolInvocation={makeInvocation(
        "str_replace_editor",
        { command: "create", path: "App.tsx" },
        "result",
        "Success"
      )}
    />
  );
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
  expect(container.querySelector(".animate-spin")).toBeNull();
});

test("result state without result shows spinner", () => {
  const { container } = render(
    <ToolCallBadge
      toolInvocation={makeInvocation(
        "str_replace_editor",
        { command: "create", path: "App.tsx" },
        "result",
        undefined
      )}
    />
  );
  expect(container.querySelector(".animate-spin")).toBeDefined();
});

// --- Edge-case label tests ---

test("missing path shows generic label", () => {
  render(
    <ToolCallBadge
      toolInvocation={makeInvocation(
        "str_replace_editor",
        { command: "create" },
        "call"
      )}
    />
  );
  expect(screen.getByText("Creating file")).toBeDefined();
});

test("empty path shows generic label", () => {
  render(
    <ToolCallBadge
      toolInvocation={makeInvocation(
        "str_replace_editor",
        { command: "str_replace", path: "" },
        "call"
      )}
    />
  );
  expect(screen.getByText("Editing file")).toBeDefined();
});

test("unknown toolName falls back to raw toolName", () => {
  render(
    <ToolCallBadge
      toolInvocation={makeInvocation("my_custom_tool", {}, "call")}
    />
  );
  expect(screen.getByText("my_custom_tool")).toBeDefined();
});

test("deeply nested path shows only basename", () => {
  render(
    <ToolCallBadge
      toolInvocation={makeInvocation(
        "str_replace_editor",
        { command: "create", path: "a/b/c/d/Deep.tsx" },
        "call"
      )}
    />
  );
  expect(screen.getByText("Creating Deep.tsx")).toBeDefined();
});

// --- Styling test ---

test("badge has expected styling classes", () => {
  const { container } = render(
    <ToolCallBadge
      toolInvocation={makeInvocation(
        "str_replace_editor",
        { command: "create", path: "App.tsx" },
        "call"
      )}
    />
  );
  const badge = container.firstElementChild;
  expect(badge?.className).toContain("inline-flex");
  expect(badge?.className).toContain("font-mono");
  expect(badge?.className).toContain("border-neutral-200");
});
