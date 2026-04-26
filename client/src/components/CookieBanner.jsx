import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Link } from "react-router-dom";

function CookieBanner() {
  const [showBanner, setShowBanner] =
    useState(false);

  const [animate, setAnimate] =
    useState(false);

  useEffect(() => {
    const consent =
      Cookies.get("cookie_consent");

    if (!consent) {
      setShowBanner(true);

      setTimeout(() => {
        setAnimate(true);
      }, 100);
    }
  }, []);

  const closeBanner = () => {
    setAnimate(false);

    setTimeout(() => {
      setShowBanner(false);
    }, 300);
  };

  const handleAcceptAll = () => {
    Cookies.set("cookie_consent", "all", {
      expires: 365,
    });

    Cookies.set("cookie_preferences", "yes", {
      expires: 365,
    });

    Cookies.set("cookie_analytics", "yes", {
      expires: 365,
    });

    closeBanner();
  };

  const handleAcceptNecessary = () => {
    Cookies.set(
      "cookie_consent",
      "necessary",
      {
        expires: 365,
      }
    );

    closeBanner();
  };

  const handleReject = () => {
    Cookies.set(
      "cookie_consent",
      "rejected",
      {
        expires: 365,
      }
    );

    closeBanner();
  };


  if (!showBanner) return null;

  return (
    <div className="fixed bottom-5 left-1/2 z-[9999] w-[95%] max-w-5xl -translate-x-1/2">
      <div
        className={`rounded-3xl border border-white/10 bg-slate-950/95 p-6 shadow-2xl backdrop-blur-xl transition-all duration-300 ${
          animate
            ? "translate-y-0 opacity-100"
            : "translate-y-10 opacity-0"
        }`}
      >
        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr] lg:items-center">
          {/* LEFT SIDE */}

          <div>
            <p className="text-xs uppercase tracking-[0.45em] text-amber-400">
              Barber Shop Management
            </p>

            <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
              We Value Your Privacy
            </h2>

            <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-base">
              We use cookies to keep your login
              secure, remember booking choices,
              improve website performance and
              provide a better experience.
            </p>

            <div className="mt-5 flex flex-wrap gap-4 text-sm">
              <Link
                to="/privacy"
                className="text-amber-300 transition hover:text-amber-200"
              >
                Privacy Policy
              </Link>

              <Link
                to="/terms"
                className="text-amber-300 transition hover:text-amber-200"
              >
                Terms & Conditions
              </Link>
            </div>
          </div>

          {/* RIGHT SIDE */}

          <div className="grid gap-3">
            <button
              onClick={handleAcceptAll}
              className="rounded-2xl bg-amber-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-amber-300"
            >
              Accept All
            </button>

            <button
              onClick={
                handleAcceptNecessary
              }
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-medium text-white transition hover:bg-white/10"
            >
              Accept Necessary
            </button>

            <button
              onClick={handleReject}
              className="rounded-2xl border border-red-400/20 bg-red-500/10 px-5 py-3 font-medium text-red-200 transition hover:bg-red-500/20"
            >
              Reject
            </button>
          </div>
        </div>

        {/* BOTTOM SMALL TEXT */}

        <div className="mt-6 border-t border-white/10 pt-4 text-xs leading-6 text-slate-500">
          Necessary cookies help secure login,
          appointment booking and website
          functionality.
        </div>
      </div>
    </div>
  );
}

export default CookieBanner;