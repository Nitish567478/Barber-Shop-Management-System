import React, { useState, useEffect } from "react";
import { servicesAPI } from "../services/api";
import { fallbackServices } from "../data/featuredServices";
import BarberShopLoader from "../components/BarberShopLoader";

const detailedServiceList = [
  {
    id: 1,
    category: "Haircut",
    name: "Executive Scissor Cut",
    detail:
      "A premium handcrafted haircut using professional scissors for clean texture, layering and face-shape styling.",
    points: [
      "Hair consultation",
      "Premium scissor cut",
      "Hair wash included",
      "Modern styling finish",
    ],
    price: 450,
    duration: "35 mins",
  },

  {
    id: 2,
    category: "Haircut",
    name: "Precision Skin Fade",
    detail:
      "Modern zero fade haircut blended with expert precision and sharp edges.",
    points: [
      "Zero fade blend",
      "Sharp hairline",
      "Texture styling",
      "Trending look",
    ],
    price: 550,
    duration: "45 mins",
  },

  {
    id: 3,
    category: "Beard",
    name: "Royal Hot Towel Shave",
    detail:
      "Traditional luxury shave using hot towels and straight razor finish.",
    points: [
      "Hot towel therapy",
      "Smooth shave",
      "Cooling balm",
      "Fresh skin finish",
    ],
    price: 350,
    duration: "30 mins",
  },

  {
    id: 4,
    category: "Beard",
    name: "Beard Sculpt & Line-up",
    detail:
      "Professional beard shaping with clipper detailing and razor edges.",
    points: [
      "Beard shaping",
      "Jawline definition",
      "Clean edges",
      "Premium trim",
    ],
    price: 300,
    duration: "25 mins",
  },

  {
    id: 5,
    category: "Face Care",
    name: "Deep Cleansing Face Wash",
    detail:
      "Refreshing skin cleanse removing dirt, oil and impurities.",
    points: [
      "Face cleansing",
      "Oil removal",
      "Skin refresh",
      "Hydration care",
    ],
    price: 400,
    duration: "30 mins",
  },

  {
    id: 6,
    category: "Face Care",
    name: "Premium Facial Glow",
    detail:
      "Luxury facial treatment for bright and healthy skin.",
    points: [
      "Steam treatment",
      "Face scrub",
      "Glow mask",
      "Face massage",
    ],
    price: 650,
    duration: "45 mins",
  },

  {
    id: 7,
    category: "Hair Care",
    name: "Anti-Dandruff Therapy",
    detail:
      "Advanced scalp treatment to reduce dandruff and dryness.",
    points: [
      "Scalp cleanse",
      "Anti-dandruff wash",
      "Itch control",
      "Hair nourishment",
    ],
    price: 500,
    duration: "40 mins",
  },

  {
    id: 8,
    category: "Hair Care",
    name: "Keratin Smoothing",
    detail:
      "Protein treatment to reduce frizz and improve softness.",
    points: [
      "Frizz control",
      "Smooth finish",
      "Protein repair",
      "Long shine effect",
    ],
    price: 1200,
    duration: "60 mins",
  },

  {
    id: 9,
    category: "Premium",
    name: "Grey Coverage Color",
    detail:
      "Professional coloring to blend grey hair naturally.",
    points: [
      "Grey coverage",
      "Natural shade",
      "Hair shine",
      "Premium color",
    ],
    price: 900,
    duration: "55 mins",
  },

  {
    id: 10,
    category: "Premium",
    name: "Creative Highlights",
    detail:
      "Modern stylish highlight service with premium shades.",
    points: [
      "Fashion look",
      "Premium shades",
      "Modern finish",
      "Professional styling",
    ],
    price: 1500,
    duration: "70 mins",
  },

  {
    id: 11,
    category: "Combo",
    name: "Head & Shoulder Relax",
    detail:
      "Stress-relief massage focused on head, neck and shoulders.",
    points: [
      "Head massage",
      "Shoulder relax",
      "Stress relief",
      "Herbal oil use",
    ],
    price: 350,
    duration: "20 mins",
  },

  {
    id: 12,
    category: "Combo",
    name: "Nose & Ear Grooming",
    detail:
      "Quick hygienic grooming for unwanted hair removal.",
    points: [
      "Clean look",
      "Quick service",
      "Safe process",
      "Professional care",
    ],
    price: 250,
    duration: "15 mins",
  },

  {
    id: 13,
    category: "Face Care",
    name: "Eyebrow Shape",
    detail:
      "Precision eyebrow shaping for balanced face styling.",
    points: [
      "Eyebrow line-up",
      "Face balance",
      "Sharp look",
      "Clean finish",
    ],
    price: 200,
    duration: "15 mins",
  },

  {
    id: 14,
    category: "Face Care",
    name: "Detox Peel Mask",
    detail:
      "Deep pore cleansing and blackhead removal treatment.",
    points: [
      "Blackhead remove",
      "Pore detox",
      "Smooth skin",
      "Fresh face look",
    ],
    price: 500,
    duration: "30 mins",
  },

  {
    id: 15,
    category: "Combo",
    name: "Signature Full Groom",
    detail:
      "Complete luxury package including haircut, beard, face wash and styling.",
    points: [
      "Haircut included",
      "Beard shaping",
      "Face cleansing",
      "Relax massage",
      "Hair styling",
      "Premium finish",
    ],
    price: 999,
    duration: "75 mins",
  },
];

const serviceImages = [
  "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1503951458645-643d53bfd90f?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1517832606299-7ae9b720a186?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1593702288056-fb0563d3e0db?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1605497788044-5a32c7078486?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1582095133179-bfd08e2fc6b3?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&w=1200&q=80",
];

function ServicesPage() {
  const [search, setSearch] = useState("");

  const [category, setCategory] = useState("All");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () =>
      clearTimeout(timer);
  }, []);

  const categories = [
    "All",
    "Haircut",
    "Beard",
    "Hair Care",
    "Face Care",
    "Combo",
    "Premium",
  ];

  const filteredServices =
    detailedServiceList.filter(
      (item) => {
        const matchSearch =
          item.name
            .toLowerCase()
            .includes(
              search.toLowerCase()
            ) ||
          item.detail
            .toLowerCase()
            .includes(
              search.toLowerCase()
            );

        const matchCategory =
          category === "All" ||
          item.category ===
            category;

        return (
          matchSearch &&
          matchCategory
        );
      }
    );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
        <div className="flex flex-col items-center text-center">
          <BarberShopLoader />

          <h1 className="text-3xl font-semibold">
            Loading Services...
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* HERO */}

      <header className="border-b border-white/10 bg-gradient-to-r from-slate-950 via-slate-900 to-black">
        <div className="mx-auto max-w-7xl px-6 py-20 text-center">
          <p className="text-sm uppercase tracking-[0.4em] text-amber-400">
            Premium Grooming
          </p>

          <h1 className="mt-4 text-5xl font-light md:text-7xl">
            Service{" "}
            <span className="italic text-amber-400">
              Catalogue
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-lg text-slate-300">
            Discover advanced
            grooming solutions,
            premium styling and
            personalized care.
          </p>

          {/* SEARCH */}

          <input
            type="text"
            placeholder="Search service..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            className="mx-auto mt-8 w-full max-w-3xl rounded-2xl bg-white/5 px-5 py-4 outline-none"
          />

          {/* FILTER */}

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {categories.map(
              (btn) => (
                <button
                  key={btn}
                  onClick={() =>
                    setCategory(
                      btn
                    )
                  }
                  className={`rounded-full px-5 py-2 text-sm transition ${
                    category ===
                    btn
                      ? "bg-amber-400 text-black"
                      : "bg-white/5 hover:bg-white/10"
                  }`}
                >
                  {btn}
                </button>
              )
            )}
          </div>
        </div>
      </header>

      {/* MAIN */}

      <main className="mx-auto max-w-7xl px-6 py-16">
        {/* TOP STATS */}

        <div className="mb-12 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-white/5 p-6">
            <p>Total Services</p>
            <h2 className="mt-2 text-3xl font-bold">
              15
            </h2>
          </div>

          <div className="rounded-3xl bg-white/5 p-6">
            <p>Quality</p>
            <h2 className="mt-2 text-3xl font-bold">
              Premium
            </h2>
          </div>

          <div className="rounded-3xl bg-white/5 p-6">
            <p>Support</p>
            <h2 className="mt-2 text-3xl font-bold">
              Daily
            </h2>
          </div>
        </div>

        {/* GRID */}

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {filteredServices.map(
            (
              item,
              index,
              points
            ) => (
              <div
                key={item.id}
                className="overflow-hidden rounded-[2rem] bg-slate-900 transition hover:-translate-y-1"
              >
                <img
                  src={
                    serviceImages[
                      index
                    ]
                  }
                  alt={
                    item.name
                  }
                  className="h-60 w-full object-cover"
                />

                <div className="p-6">
                  <span className="rounded-full bg-amber-400 px-3 py-1 text-xs font-semibold text-black">
                    {
                      item.category
                    }
                  </span>

                  <h2 className="mt-4 text-2xl font-light">
                    {item.name}
                  </h2>

                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    {
                      item.detail
                    }
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    {item.points.map(
                      (point, idx) => (
                        <li
                          key={
                            idx
                          }
                          className="mt-2 flex items-center gap-2 text-sm text-slate-400"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="h-4 w-4 flex-shrink-0 text-amber-400"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          {point}
                        </li>
                      )
                    )}
                  </p>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-white/5 p-4">
                      <p className="text-xs text-slate-400">
                        Duration
                      </p>
                      <p className="font-semibold">
                        {
                          item.duration
                        }
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white/5 p-4">
                      <p className="text-xs text-slate-400">
                        Price
                      </p>
                      <p className="font-semibold text-amber-300">
                        ₹
                        {item.price}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </main>
    </div>
  );
}

export default ServicesPage;