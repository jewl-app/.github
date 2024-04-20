import { describe, it, beforeEach, afterEach } from "mocha";
import React from "react";
import Footer from "@/app/components/footer";
import type { ReactTestRenderer } from "react-test-renderer";
import { create, act } from "react-test-renderer";
import { JSDOM } from "jsdom";
import assert from "assert";

describe("footer", () => {
  let jsdom: JSDOM = { } as JSDOM;
  let component: ReactTestRenderer = { } as ReactTestRenderer;

  beforeEach(() => {
    jsdom = new JSDOM("<!doctype html><html><body></body></html>");
    global.window = jsdom.window as never;
    component = create(<Footer />);
  });

  afterEach(() => {
    global.window = undefined as never;
  });

  it("Long footer should contain long copyright", async () => {
    await act(() => { window.innerWidth = 1024; });
    const longCopyright = component.root.findAllByProps({ children: "© 2023 jewl.app" });
    assert.strictEqual(longCopyright.length, 1);
  });

  it("Short footer should contain short copyright", async () => {
    await act(() => { window.innerWidth = 512; });
    const shortCopyright = component.root.findAllByProps({ children: "© 2023" });
    assert.strictEqual(shortCopyright.length, 1);
  });
});

