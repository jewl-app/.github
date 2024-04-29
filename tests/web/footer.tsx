import { describe, it, beforeEach } from "mocha";
import React from "react";
import Footer from "@/app/components/footer";
import { startTestRender, context } from "@/tests/web";
import assert from "assert";

describe("footer", () => {

  beforeEach(() => {
    startTestRender(<Footer />);
  });

  it("Footer should contain copyright", async () => {
    const copyright = await context.findByText("Copyright © 2024 jewl");
    assert.ok(copyright);
  });

  it("Footer should contain social links", async () => {
    const links = await context.findAllByRole("link") as Array<HTMLAnchorElement>;
    assert.strictEqual(links.length, 3);
    assert.strictEqual(links[0].href, "https://twitter.com/jewl_app");
    assert.strictEqual(links[1].href, "https://discord.gg/w9DpyG6ddG");
    assert.strictEqual(links[2].href, "https://github.com/jewl-app");
  });
});

