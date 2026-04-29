import { test, expect, vi, beforeEach } from "vitest";
import { buildStrReplaceTool } from "@/lib/tools/str-replace";
import type { VirtualFileSystem } from "@/lib/file-system";

const mockFileSystem: Partial<VirtualFileSystem> = {
  viewFile: vi.fn(),
  createFileWithParents: vi.fn(),
  replaceInFile: vi.fn(),
  insertInFile: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

// --- Metadata ---

test("returns tool with correct id", () => {
  const tool = buildStrReplaceTool(mockFileSystem as VirtualFileSystem);
  expect(tool.id).toBe("str_replace_editor");
});

test("returns tool with parameters schema", () => {
  const tool = buildStrReplaceTool(mockFileSystem as VirtualFileSystem);
  expect(tool.parameters).toBeDefined();
});

// --- view command ---

test("view command calls viewFile with path and no range", async () => {
  vi.mocked(mockFileSystem.viewFile!).mockReturnValue("1\tline one\n2\tline two");
  const tool = buildStrReplaceTool(mockFileSystem as VirtualFileSystem);

  const result = await tool.execute({ command: "view", path: "/test.txt" });

  expect(mockFileSystem.viewFile).toHaveBeenCalledWith("/test.txt", undefined);
  expect(result).toBe("1\tline one\n2\tline two");
});

test("view command calls viewFile with view_range", async () => {
  vi.mocked(mockFileSystem.viewFile!).mockReturnValue("2\tline two\n3\tline three");
  const tool = buildStrReplaceTool(mockFileSystem as VirtualFileSystem);

  const result = await tool.execute({
    command: "view",
    path: "/test.txt",
    view_range: [2, 3],
  });

  expect(mockFileSystem.viewFile).toHaveBeenCalledWith("/test.txt", [2, 3]);
  expect(result).toBe("2\tline two\n3\tline three");
});

test("view command returns directory listing for a directory path", async () => {
  vi.mocked(mockFileSystem.viewFile!).mockReturnValue("[DIR] components\n[FILE] index.ts");
  const tool = buildStrReplaceTool(mockFileSystem as VirtualFileSystem);

  const result = await tool.execute({ command: "view", path: "/src" });

  expect(mockFileSystem.viewFile).toHaveBeenCalledWith("/src", undefined);
  expect(result).toContain("[DIR]");
});

test("view command returns error for non-existent path", async () => {
  vi.mocked(mockFileSystem.viewFile!).mockReturnValue(
    "File not found: /nonexistent.txt"
  );
  const tool = buildStrReplaceTool(mockFileSystem as VirtualFileSystem);

  const result = await tool.execute({ command: "view", path: "/nonexistent.txt" });

  expect(result).toBe("File not found: /nonexistent.txt");
});

// --- create command ---

test("create command calls createFileWithParents with path and content", async () => {
  vi.mocked(mockFileSystem.createFileWithParents!).mockReturnValue(
    "File created: /src/App.tsx"
  );
  const tool = buildStrReplaceTool(mockFileSystem as VirtualFileSystem);

  const result = await tool.execute({
    command: "create",
    path: "/src/App.tsx",
    file_text: "export default function App() {}",
  });

  expect(mockFileSystem.createFileWithParents).toHaveBeenCalledWith(
    "/src/App.tsx",
    "export default function App() {}"
  );
  expect(result).toBe("File created: /src/App.tsx");
});

test("create command uses empty string when file_text is undefined", async () => {
  vi.mocked(mockFileSystem.createFileWithParents!).mockReturnValue(
    "File created: /empty.txt"
  );
  const tool = buildStrReplaceTool(mockFileSystem as VirtualFileSystem);

  await tool.execute({ command: "create", path: "/empty.txt" });

  expect(mockFileSystem.createFileWithParents).toHaveBeenCalledWith(
    "/empty.txt",
    ""
  );
});

test("create command returns error for existing file", async () => {
  vi.mocked(mockFileSystem.createFileWithParents!).mockReturnValue(
    "Error: File already exists: /test.txt"
  );
  const tool = buildStrReplaceTool(mockFileSystem as VirtualFileSystem);

  const result = await tool.execute({
    command: "create",
    path: "/test.txt",
    file_text: "content",
  });

  expect(result).toBe("Error: File already exists: /test.txt");
});

// --- str_replace command ---

test("str_replace command calls replaceInFile with correct args", async () => {
  vi.mocked(mockFileSystem.replaceInFile!).mockReturnValue(
    "Replaced 2 occurrence(s) of the string in /test.txt"
  );
  const tool = buildStrReplaceTool(mockFileSystem as VirtualFileSystem);

  const result = await tool.execute({
    command: "str_replace",
    path: "/test.txt",
    old_str: "foo",
    new_str: "bar",
  });

  expect(mockFileSystem.replaceInFile).toHaveBeenCalledWith("/test.txt", "foo", "bar");
  expect(result).toBe("Replaced 2 occurrence(s) of the string in /test.txt");
});

test("str_replace command uses empty strings when old_str and new_str are undefined", async () => {
  vi.mocked(mockFileSystem.replaceInFile!).mockReturnValue("Error: String not found");
  const tool = buildStrReplaceTool(mockFileSystem as VirtualFileSystem);

  await tool.execute({ command: "str_replace", path: "/test.txt" });

  expect(mockFileSystem.replaceInFile).toHaveBeenCalledWith("/test.txt", "", "");
});

test("str_replace command returns error when string not found", async () => {
  vi.mocked(mockFileSystem.replaceInFile!).mockReturnValue(
    'Error: String not found in file: "missing"'
  );
  const tool = buildStrReplaceTool(mockFileSystem as VirtualFileSystem);

  const result = await tool.execute({
    command: "str_replace",
    path: "/test.txt",
    old_str: "missing",
    new_str: "replacement",
  });

  expect(result).toContain("Error");
  expect(result).toContain("missing");
});

test("str_replace command returns error for non-existent file", async () => {
  vi.mocked(mockFileSystem.replaceInFile!).mockReturnValue(
    "Error: File not found: /ghost.txt"
  );
  const tool = buildStrReplaceTool(mockFileSystem as VirtualFileSystem);

  const result = await tool.execute({
    command: "str_replace",
    path: "/ghost.txt",
    old_str: "old",
    new_str: "new",
  });

  expect(result).toBe("Error: File not found: /ghost.txt");
});

// --- insert command ---

test("insert command calls insertInFile with correct args", async () => {
  vi.mocked(mockFileSystem.insertInFile!).mockReturnValue(
    "Text inserted at line 3 in /test.txt"
  );
  const tool = buildStrReplaceTool(mockFileSystem as VirtualFileSystem);

  const result = await tool.execute({
    command: "insert",
    path: "/test.txt",
    insert_line: 3,
    new_str: "inserted line",
  });

  expect(mockFileSystem.insertInFile).toHaveBeenCalledWith(
    "/test.txt",
    3,
    "inserted line"
  );
  expect(result).toBe("Text inserted at line 3 in /test.txt");
});

test("insert command uses 0 for insert_line when undefined", async () => {
  vi.mocked(mockFileSystem.insertInFile!).mockReturnValue(
    "Text inserted at line 0 in /test.txt"
  );
  const tool = buildStrReplaceTool(mockFileSystem as VirtualFileSystem);

  await tool.execute({ command: "insert", path: "/test.txt", new_str: "first line" });

  expect(mockFileSystem.insertInFile).toHaveBeenCalledWith("/test.txt", 0, "first line");
});

test("insert command uses empty string when new_str is undefined", async () => {
  vi.mocked(mockFileSystem.insertInFile!).mockReturnValue(
    "Text inserted at line 1 in /test.txt"
  );
  const tool = buildStrReplaceTool(mockFileSystem as VirtualFileSystem);

  await tool.execute({ command: "insert", path: "/test.txt", insert_line: 1 });

  expect(mockFileSystem.insertInFile).toHaveBeenCalledWith("/test.txt", 1, "");
});

test("insert command returns error for invalid line number", async () => {
  vi.mocked(mockFileSystem.insertInFile!).mockReturnValue(
    "Error: Invalid line number: 999. File has 3 lines."
  );
  const tool = buildStrReplaceTool(mockFileSystem as VirtualFileSystem);

  const result = await tool.execute({
    command: "insert",
    path: "/test.txt",
    insert_line: 999,
    new_str: "text",
  });

  expect(result).toContain("Error");
  expect(result).toContain("999");
});

// --- undo_edit command ---

test("undo_edit command returns unsupported error message", async () => {
  const tool = buildStrReplaceTool(mockFileSystem as VirtualFileSystem);

  const result = await tool.execute({ command: "undo_edit", path: "/test.txt" });

  expect(result).toContain("undo_edit");
  expect(result).toContain("not supported");
  expect(result).toContain("str_replace");
});

test("undo_edit does not call any file system methods", async () => {
  const tool = buildStrReplaceTool(mockFileSystem as VirtualFileSystem);

  await tool.execute({ command: "undo_edit", path: "/test.txt" });

  expect(mockFileSystem.viewFile).not.toHaveBeenCalled();
  expect(mockFileSystem.createFileWithParents).not.toHaveBeenCalled();
  expect(mockFileSystem.replaceInFile).not.toHaveBeenCalled();
  expect(mockFileSystem.insertInFile).not.toHaveBeenCalled();
});
