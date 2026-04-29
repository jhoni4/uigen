import { test, expect } from "vitest";
import { cn } from "@/lib/utils";

// --- Happy paths ---

test("cn returns a single class unchanged", () => {
  expect(cn("foo")).toBe("foo");
});

test("cn merges multiple class strings", () => {
  expect(cn("foo", "bar", "baz")).toBe("foo bar baz");
});

test("cn handles object syntax — truthy keys are included", () => {
  expect(cn({ foo: true, bar: false, baz: true })).toBe("foo baz");
});

test("cn handles array syntax", () => {
  expect(cn(["foo", "bar"])).toBe("foo bar");
});

test("cn handles mixed string, object, and array inputs", () => {
  const result = cn("base", { active: true, disabled: false }, ["extra"]);
  expect(result).toBe("base active extra");
});

// --- Tailwind conflict resolution ---

test("cn resolves conflicting Tailwind padding classes — last wins", () => {
  expect(cn("p-4", "p-6")).toBe("p-6");
});

test("cn resolves conflicting Tailwind text-color classes", () => {
  expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
});

test("cn resolves conflicting margin classes", () => {
  expect(cn("m-2", "m-8")).toBe("m-8");
});

test("cn keeps non-conflicting Tailwind classes", () => {
  const result = cn("flex", "items-center", "p-4");
  expect(result).toContain("flex");
  expect(result).toContain("items-center");
  expect(result).toContain("p-4");
});

test("cn resolves responsive prefix conflicts", () => {
  expect(cn("md:p-4", "md:p-8")).toBe("md:p-8");
});

// --- Edge cases ---

test("cn returns empty string with no arguments", () => {
  expect(cn()).toBe("");
});

test("cn ignores undefined values", () => {
  expect(cn("foo", undefined, "bar")).toBe("foo bar");
});

test("cn ignores null values", () => {
  expect(cn("foo", null, "bar")).toBe("foo bar");
});

test("cn ignores empty string values", () => {
  expect(cn("foo", "", "bar")).toBe("foo bar");
});

test("cn ignores false values from conditional expressions", () => {
  const isActive = false;
  expect(cn("base", isActive && "active")).toBe("base");
});

test("cn includes class when conditional is true", () => {
  const isActive = true;
  expect(cn("base", isActive && "active")).toBe("base active");
});

test("cn handles all-falsy inputs", () => {
  expect(cn(false, null, undefined, "")).toBe("");
});

test("cn deduplicates identical classes", () => {
  // twMerge deduplicates conflicting Tailwind classes but not identical ones
  // via clsx — identical classes from separate strings are merged by twMerge
  const result = cn("p-4", "p-4");
  expect(result).toBe("p-4");
});
