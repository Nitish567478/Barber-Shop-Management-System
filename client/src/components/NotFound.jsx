import React, { useEffect } from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-6 py-12 text-white">
      {/* Background Glow */}

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.15),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.12),transparent_35%)]"></div>

      {/* Floating Blur */}

      <div className="absolute left-10 top-20 h-44 w-44 rounded-full bg-amber-400/10 blur-3xl"></div>
      <div className="absolute bottom-10 right-10 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl"></div>

      {/* Card */}

      <section className="relative z-10 w-full max-w-2xl rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl md:p-12">
        {/* Icon */}

        <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-amber-400/20 to-orange-400/10 text-6xl shadow-xl">🤬
          {/* <img src="https://i.ibb.co/prB6vgwF/Whats-App-Image-2025-12-21-at-1-01-25-PM.jpg" alt="Not-Found" /> */}
        </div>

        {/* Title */}

        <div className="mt-8 text-center">
          <h1 className="mt-4 text-6xl font-black md:text-8xl">
            404
          </h1>

          <h2 className="mt-4 text-3xl font-bold md:text-4xl">
            Page Not Found
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-slate-300 md:text-lg">
            Sorry, the page you are looking for does not exist, has been moved, or the link is broken. Let’s get you back to the Barber Shop.
          </p>
        </div>

        {/* Buttons */}

        <div className="mt-10 flex justify-center">
          <Link
            to="/"
            className="rounded-2xl bg-amber-400 px-8 py-4 text-center font-semibold text-slate-950 transition hover:-translate-y-1 hover:bg-amber-300"
          >
            ← Back to Home
          </Link>
        </div>

      </section>
    </main>
  );
};

export default NotFound;