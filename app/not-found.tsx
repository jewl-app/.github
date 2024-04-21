"use client";
import { useEffect } from "react";

export default function Redirect(): null {
  useEffect(() => {
    window.history.replaceState(null, "", "/");
    window.location.reload();
  }, []);
  return null;
}
