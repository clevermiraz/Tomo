"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "tomo-install-dismissed";

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone) return; // already installed
    if (localStorage.getItem(DISMISS_KEY) === "1") return;

    const ios =
      /ipad|iphone|ipod/.test(window.navigator.userAgent.toLowerCase()) &&
      !(window as unknown as { MSStream?: unknown }).MSStream;
    // Platform detection is only available on the client, after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsIOS(ios);

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    // iOS gives no event — surface the manual instructions after a short beat.
    let t: ReturnType<typeof setTimeout> | undefined;
    if (ios) t = setTimeout(() => setShow(true), 2500);

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      if (t) clearTimeout(t);
    };
  }, []);

  const dismiss = () => {
    setShow(false);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    dismiss();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] flex justify-center p-4 sm:bottom-4">
      <div className="surface flex w-full max-w-md items-center gap-3 rounded-2xl p-3.5">
        <div
          className="grid h-12 w-12 shrink-0 place-items-center rounded-xl text-2xl"
          style={{ background: "linear-gradient(180deg, var(--accent-soft), var(--accent))" }}
        >
          🍅
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold">Install Tomo</p>
          {isIOS ? (
            <p className="text-xs text-muted">
              Tap Share ⎋ then “Add to Home Screen” ➕
            </p>
          ) : (
            <p className="text-xs text-muted">
              Your focus friend, one tap away on your home screen.
            </p>
          )}
        </div>
        {isIOS ? (
          <button
            onClick={dismiss}
            className="press shrink-0 rounded-full bg-surface2 px-3 py-2 text-sm font-semibold text-muted"
          >
            Got it
          </button>
        ) : (
          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={dismiss}
              aria-label="Dismiss"
              className="rounded-full px-2 py-2 text-sm text-faint hover:text-fg"
            >
              Later
            </button>
            <button
              onClick={install}
              className="press btn-primary rounded-full px-4 py-2 text-sm font-bold"
            >
              Install
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
