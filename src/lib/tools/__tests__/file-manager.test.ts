import { test, expect, vi, beforeEach } from "vitest";
import { buildFileManagerTool } from "@/lib/tools/file-manager";
import type { VirtualFileSystem } from "@/lib/file-system";

// The `tool()` helper from `ai` is a simple passthrough for the tool definition.
vi.mock("ai", () => ({
  tool: (t: unknown) => t,
}));

const mockFileSystem: Partial<VirtualFileSystem> = {
  rename: vi.fn(),
  deleteFile: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

// --- Metadata ---

test("returns a tool object with execute and parameters", () => {
  const tool = buildFileManagerTool(mockFileSystem as VirtualFileSystem);
  expect(tool.execute).toBeDefined();
  expect(tool.parameters).toBeDefined();
  expect(tool.description).toBeDefined();
});

// --- rename command ---

test("rename command returns success when file system rename succeeds", async () => {
  vi.mocked(mockFileSystem.rename!).mockReturnValue(true);
  const tool = buildFileManagerTool(mockFileSystem as VirtualFileSystem);

  const result = await tool.execute!({
    command: "rename",
    path: "/old.txt",
    new_path: "/new.txt",
  });

  expect(mockFileSystem.rename).toHaveBeenCalledWith("/old.txt", "/new.txt");
  expect(result).toEqual({
    success: true,
    message: "Successfully renamed /old.txt to /new.txt",
  });
});

test("rename command returns error when new_path is not provided", async () => {
  const tool = buildFileManagerTool(mockFileSystem as VirtualFileSystem);

  const result = await tool.execute!({ command: "rename", path: "/old.txt" });

  expect(mockFileSystem.rename).not.toHaveBeenCalled();
  expect(result).toEqual({
    success: false,
    error: "new_path is required for rename command",
  });
});

test("rename command returns error when file system rename fails", async () => {
  vi.mocked(mockFileSystem.rename!).mockReturnValue(false);
  const tool = buildFileManagerTool(mockFileSystem as VirtualFileSystem);

  const result = await tool.execute!({
    command: "rename",
    path: "/nonexistent.txt",
    new_path: "/dest.txt",
  });

  expect(mockFileSystem.rename).toHaveBeenCalledWith("/nonexistent.txt", "/dest.txt");
  expect(result).toEqual({
    success: false,
    error: "Failed to rename /nonexistent.txt to /dest.txt",
  });
});

test("rename command can move a directory", async () => {
  vi.mocked(mockFileSystem.rename!).mockReturnValue(true);
  const tool = buildFileManagerTool(mockFileSystem as VirtualFileSystem);

  const result = await tool.execute!({
    command: "rename",
    path: "/src",
    new_path: "/app",
  });

  expect(mockFileSystem.rename).toHaveBeenCalledWith("/src", "/app");
  expect(result).toEqual({
    success: true,
    message: "Successfully renamed /src to /app",
  });
});

test("rename command returns error when destination already exists", async () => {
  vi.mocked(mockFileSystem.rename!).mockReturnValue(false);
  const tool = buildFileManagerTool(mockFileSystem as VirtualFileSystem);

  const result = await tool.execute!({
    command: "rename",
    path: "/file.txt",
    new_path: "/existing.txt",
  });

  expect(result).toMatchObject({ success: false });
});

// --- delete command ---

test("delete command returns success when file system delete succeeds", async () => {
  vi.mocked(mockFileSystem.deleteFile!).mockReturnValue(true);
  const tool = buildFileManagerTool(mockFileSystem as VirtualFileSystem);

  const result = await tool.execute!({ command: "delete", path: "/test.txt" });

  expect(mockFileSystem.deleteFile).toHaveBeenCalledWith("/test.txt");
  expect(result).toEqual({
    success: true,
    message: "Successfully deleted /test.txt",
  });
});

test("delete command returns error when file system delete fails", async () => {
  vi.mocked(mockFileSystem.deleteFile!).mockReturnValue(false);
  const tool = buildFileManagerTool(mockFileSystem as VirtualFileSystem);

  const result = await tool.execute!({
    command: "delete",
    path: "/nonexistent.txt",
  });

  expect(mockFileSystem.deleteFile).toHaveBeenCalledWith("/nonexistent.txt");
  expect(result).toEqual({
    success: false,
    error: "Failed to delete /nonexistent.txt",
  });
});

test("delete command can delete a directory", async () => {
  vi.mocked(mockFileSystem.deleteFile!).mockReturnValue(true);
  const tool = buildFileManagerTool(mockFileSystem as VirtualFileSystem);

  const result = await tool.execute!({ command: "delete", path: "/src" });

  expect(mockFileSystem.deleteFile).toHaveBeenCalledWith("/src");
  expect(result).toEqual({
    success: true,
    message: "Successfully deleted /src",
  });
});

test("delete command returns error when attempting to delete root", async () => {
  vi.mocked(mockFileSystem.deleteFile!).mockReturnValue(false);
  const tool = buildFileManagerTool(mockFileSystem as VirtualFileSystem);

  const result = await tool.execute!({ command: "delete", path: "/" });

  expect(result).toMatchObject({ success: false });
});

// --- rename does not call deleteFile, delete does not call rename ---

test("rename command does not call deleteFile", async () => {
  vi.mocked(mockFileSystem.rename!).mockReturnValue(true);
  const tool = buildFileManagerTool(mockFileSystem as VirtualFileSystem);

  await tool.execute!({ command: "rename", path: "/a.txt", new_path: "/b.txt" });

  expect(mockFileSystem.deleteFile).not.toHaveBeenCalled();
});

test("delete command does not call rename", async () => {
  vi.mocked(mockFileSystem.deleteFile!).mockReturnValue(true);
  const tool = buildFileManagerTool(mockFileSystem as VirtualFileSystem);

  await tool.execute!({ command: "delete", path: "/a.txt" });

  expect(mockFileSystem.rename).not.toHaveBeenCalled();
});
