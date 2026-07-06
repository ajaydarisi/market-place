import { describe, expect, it } from "vitest";

import { redactContactInfo, REDACTION_PLACEHOLDER } from "@shared/redact";

describe("redactContactInfo", () => {
  it("masks email addresses", () => {
    const { text, redacted } = redactContactInfo("reach me at jane.doe@example.com please");
    expect(text).toContain(REDACTION_PLACEHOLDER);
    expect(text).not.toContain("@example.com");
    expect(redacted).toBe(true);
  });

  it("masks phone numbers with separators or +", () => {
    expect(redactContactInfo("call +1 (415) 555-2671").text).toContain(REDACTION_PLACEHOLDER);
    expect(redactContactInfo("my number is 415-555-2671").text).toContain(REDACTION_PLACEHOLDER);
  });

  it("does not mask plain budget figures", () => {
    const { text, redacted } = redactContactInfo("my budget is 80000 for this");
    expect(text).toBe("my budget is 80000 for this");
    expect(redacted).toBe(false);
  });

  it("does not mask ISO dates, date ranges, or IP addresses", () => {
    const dates = "I can start 2026-07-10 and deliver by 2026-08-15";
    expect(redactContactInfo(dates)).toEqual({ text: dates, redacted: false });
    const ip = "the server is at 192.168.1.100";
    expect(redactContactInfo(ip)).toEqual({ text: ip, redacted: false });
    const version = "we run on 1.2.3 of the lib";
    expect(redactContactInfo(version)).toEqual({ text: version, redacted: false });
  });

  it("leaves normal text and links untouched", () => {
    const { text, redacted } = redactContactInfo("see my work at github.com/jane");
    expect(text).toBe("see my work at github.com/jane");
    expect(redacted).toBe(false);
  });
});
