import type Anthropic from "@anthropic-ai/sdk";
import { describe, expect, test } from "vitest";
import { extractToolInput } from "@/lib/jd-prompts";

// ─── Helpers ───────────────────────────────────────────────────────────────

function buildToolUseMessage(opts: {
  toolName: string;
  input: unknown;
  stopReason?: Anthropic.StopReason | null;
  extraContent?: Anthropic.ContentBlock[];
}): Anthropic.Message {
  return {
    id: "msg_test",
    type: "message",
    role: "assistant",
    model: "claude-sonnet-4-6",
    content: [
      ...(opts.extraContent ?? []),
      {
        type: "tool_use",
        id: "toolu_test",
        name: opts.toolName,
        input: opts.input,
      } as Anthropic.ToolUseBlock,
    ],
    stop_reason: opts.stopReason ?? "tool_use",
    stop_sequence: null,
    usage: {
      input_tokens: 100,
      output_tokens: 50,
      cache_creation_input_tokens: 0,
      cache_read_input_tokens: 0,
      server_tool_use: null,
      service_tier: null,
    },
  } as unknown as Anthropic.Message;
}

function buildTextOnlyMessage(stopReason: Anthropic.StopReason | null): Anthropic.Message {
  return {
    id: "msg_test",
    type: "message",
    role: "assistant",
    model: "claude-sonnet-4-6",
    content: [
      {
        type: "text",
        text: "I'm sorry I can't do that.",
        citations: null,
      } as Anthropic.TextBlock,
    ],
    stop_reason: stopReason,
    stop_sequence: null,
    usage: {
      input_tokens: 100,
      output_tokens: 50,
      cache_creation_input_tokens: 0,
      cache_read_input_tokens: 0,
      server_tool_use: null,
      service_tier: null,
    },
  } as unknown as Anthropic.Message;
}

// ─── Tests ─────────────────────────────────────────────────────────────────

describe("extractToolInput", () => {
  test("happy path — returns the tool input for the named tool", () => {
    const msg = buildToolUseMessage({
      toolName: "submit_matches",
      input: { matches: [{ requirementId: "r1", baseStatus: "hit" }] },
    });
    const out = extractToolInput<{ matches: unknown }>(msg, "submit_matches");
    expect(out).toEqual({ matches: [{ requirementId: "r1", baseStatus: "hit" }] });
  });

  test("throws when no tool_use block is present (text-only with end_turn)", () => {
    const msg = buildTextOnlyMessage("end_turn");
    expect(() => extractToolInput(msg, "submit_matches")).toThrow(
      /stop_reason="tool_use" got "end_turn"/,
    );
  });

  test("throws when the tool name doesn't match", () => {
    const msg = buildToolUseMessage({
      toolName: "some_other_tool",
      input: { x: 1 },
    });
    // stop_reason is "tool_use" so it passes the truncation guard, then falls
    // through to the name mismatch branch.
    expect(() => extractToolInput(msg, "submit_matches")).toThrow(/Expected tool_use/);
    expect(() => extractToolInput(msg, "submit_matches")).toThrow(/submit_matches/);
  });

  test("throws on stop_reason=max_tokens even when a tool_use block is present", () => {
    // max_tokens during a tool_use means the input JSON is partial — accepting
    // it would surface as a confusing zod error downstream.
    const msg = buildToolUseMessage({
      toolName: "submit_matches",
      input: { matches: [] }, // shape is irrelevant — guard fires before reading
      stopReason: "max_tokens",
    });
    expect(() => extractToolInput(msg, "submit_matches")).toThrow(
      /stop_reason="tool_use" got "max_tokens" while extracting submit_matches/,
    );
  });

  test("throws on stop_reason=refusal", () => {
    const msg = buildTextOnlyMessage("refusal");
    expect(() => extractToolInput(msg, "submit_requirements")).toThrow(
      /stop_reason="tool_use" got "refusal" while extracting submit_requirements/,
    );
  });
});
