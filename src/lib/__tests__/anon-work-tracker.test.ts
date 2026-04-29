import { test, expect, beforeEach } from "vitest";
import {
  setHasAnonWork,
  getHasAnonWork,
  getAnonWorkData,
  clearAnonWork,
} from "@/lib/anon-work-tracker";

const STORAGE_KEY = "uigen_has_anon_work";
const DATA_KEY = "uigen_anon_data";

beforeEach(() => {
  sessionStorage.clear();
});

// --- setHasAnonWork ---

test("setHasAnonWork stores flag and data when messages exist", () => {
  const messages = [{ id: "1", role: "user", content: "Hello" }];
  const fileSystemData = { "/": { type: "directory" } };

  setHasAnonWork(messages, fileSystemData);

  expect(sessionStorage.getItem(STORAGE_KEY)).toBe("true");
  const stored = JSON.parse(sessionStorage.getItem(DATA_KEY)!);
  expect(stored.messages).toEqual(messages);
  expect(stored.fileSystemData).toEqual(fileSystemData);
});

test("setHasAnonWork stores data when fileSystemData has files beyond root", () => {
  setHasAnonWork([], {
    "/": { type: "directory" },
    "/App.jsx": { type: "file", content: "export default function App() {}" },
  });

  expect(sessionStorage.getItem(STORAGE_KEY)).toBe("true");
});

test("setHasAnonWork does not store when messages are empty and only root exists", () => {
  setHasAnonWork([], { "/": { type: "directory" } });

  expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
  expect(sessionStorage.getItem(DATA_KEY)).toBeNull();
});

test("setHasAnonWork does not store when both messages and fileSystemData are empty", () => {
  setHasAnonWork([], {});

  expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
});

test("setHasAnonWork overwrites previous data on subsequent calls", () => {
  const first = [{ id: "1", role: "user", content: "First" }];
  const second = [
    { id: "1", role: "user", content: "First" },
    { id: "2", role: "assistant", content: "Response" },
  ];

  setHasAnonWork(first, { "/": { type: "directory" } });
  setHasAnonWork(second, {
    "/": { type: "directory" },
    "/App.jsx": { type: "file" },
  });

  const stored = JSON.parse(sessionStorage.getItem(DATA_KEY)!);
  expect(stored.messages).toEqual(second);
});

// --- getHasAnonWork ---

test("getHasAnonWork returns false when nothing is stored", () => {
  expect(getHasAnonWork()).toBe(false);
});

test("getHasAnonWork returns true after setHasAnonWork stores data", () => {
  const messages = [{ id: "1", role: "user", content: "Hello" }];
  setHasAnonWork(messages, { "/": {} });

  expect(getHasAnonWork()).toBe(true);
});

test("getHasAnonWork returns false after clearAnonWork is called", () => {
  const messages = [{ id: "1", role: "user", content: "Hello" }];
  setHasAnonWork(messages, { "/": {} });
  clearAnonWork();

  expect(getHasAnonWork()).toBe(false);
});

test("getHasAnonWork returns false when storage key has non-true value", () => {
  sessionStorage.setItem(STORAGE_KEY, "false");
  expect(getHasAnonWork()).toBe(false);
});

// --- getAnonWorkData ---

test("getAnonWorkData returns null when nothing is stored", () => {
  expect(getAnonWorkData()).toBeNull();
});

test("getAnonWorkData returns stored messages and fileSystemData", () => {
  const messages = [
    { id: "1", role: "user", content: "Hello" },
    { id: "2", role: "assistant", content: "Hi there" },
  ];
  const fileSystemData = {
    "/": { type: "directory" },
    "/App.jsx": { type: "file", content: "code" },
  };

  setHasAnonWork(messages, fileSystemData);
  const result = getAnonWorkData();

  expect(result).not.toBeNull();
  expect(result!.messages).toEqual(messages);
  expect(result!.fileSystemData).toEqual(fileSystemData);
});

test("getAnonWorkData returns null when stored JSON is invalid", () => {
  sessionStorage.setItem(DATA_KEY, "{ invalid json }");

  const result = getAnonWorkData();

  expect(result).toBeNull();
});

test("getAnonWorkData returns null after clearAnonWork", () => {
  const messages = [{ id: "1", role: "user", content: "Hi" }];
  setHasAnonWork(messages, { "/": {} });
  clearAnonWork();

  expect(getAnonWorkData()).toBeNull();
});

// --- clearAnonWork ---

test("clearAnonWork removes both storage keys", () => {
  const messages = [{ id: "1", role: "user", content: "Hello" }];
  setHasAnonWork(messages, { "/": {}, "/file.txt": {} });

  clearAnonWork();

  expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
  expect(sessionStorage.getItem(DATA_KEY)).toBeNull();
});

test("clearAnonWork is safe to call when nothing is stored", () => {
  expect(() => clearAnonWork()).not.toThrow();
  expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
  expect(sessionStorage.getItem(DATA_KEY)).toBeNull();
});

test("clearAnonWork allows fresh data to be stored afterwards", () => {
  const first = [{ id: "1", role: "user", content: "Old" }];
  setHasAnonWork(first, { "/": {}, "/old.txt": {} });
  clearAnonWork();

  const second = [{ id: "2", role: "user", content: "New" }];
  setHasAnonWork(second, { "/": {}, "/new.txt": {} });

  expect(getHasAnonWork()).toBe(true);
  const data = getAnonWorkData();
  expect(data!.messages).toEqual(second);
});
