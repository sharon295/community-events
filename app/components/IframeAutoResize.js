"use client";

import { useEffect } from "react";

// When embedded in an iframe (e.g. on the GoHighLevel page), report the
// page's content height to the parent window so it can size the iframe to
// fit instead of showing a scroll bar inside it. A no-op when not framed.
export default function IframeAutoResize() {
  useEffect(() => {
    if (window.parent === window) return;

    const report = () => {
      const height = Math.ceil(document.body.getBoundingClientRect().height);
      window.parent.postMessage({ type: "collective-events:resize", height }, "*");
    };

    const observer = new ResizeObserver(report);
    observer.observe(document.body);
    report();

    return () => observer.disconnect();
  }, []);

  return null;
}
