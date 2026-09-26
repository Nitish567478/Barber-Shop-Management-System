import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { servicesAPI } from "../services/api";
import { fallbackServices } from "../data/featuredServices";
import BarberShopLoader from "../components/BarberShopLoader";

// Category Icons & Metadata
const CATEGORY_META = {
  All: {
    label: "All Services",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
      </svg>
    ),
  },
  Haircut: {
    label: "Haircut",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879a3 3 0 11-4.242-4.242L12 12m0 0l-2.879-2.879a3 3 0 114.242-4.242L12 12z" />
      </svg>
    ),
  },
  Beard: {
    label: "Beard",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  "Hair Care": {
    label: "Hair Care",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
  },
  "Face Care": {
    label: "Face Care",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  Combo: {
    label: "Combo",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  Premium: {
    label: "Premium",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
  },
};

const CATEGORIES = ["All", "Haircut", "Beard", "Hair Care", "Face Care", "Combo", "Premium"];

// Fallback images map by category in case API has missing image
const CATEGORY_DEFAULT_IMAGES = {
  Haircut: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=800&q=80",
  Beard: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
  "Hair Care": "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=800&q=80",
  "Face Care": "https://images.unsplash.com/photo-1570554520913-ce2192a74574?auto=format&fit=crop&w=800&q=80",
  Combo: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80",
  Premium: "https://images.unsplash.com/photo-1593702275687-f8b402bf1fb5?auto=format&fit=crop&w=800&q=80",
};

function normalizeCategoryName(raw) {
  if (!raw) return "Haircut";
  const lower = raw.toLowerCase().trim();
  if (lower === "haircut" || lower === "haircuts") return "Haircut";
  if (lower === "beard" || lower === "shaving") return "Beard";
  if (lower === "hair care" || lower === "haircare" || lower === "treatment") return "Hair Care";
  if (lower === "face care" || lower === "facecare" || lower === "facial") return "Face Care";
  if (lower === "combo" || lower === "package" || lower === "grooming") return "Combo";
  if (lower === "premium" || lower === "vip" || lower === "coloring") return "Premium";
  return "Haircut";
}

function ServicesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("default");
  const [loading, setLoading] = useState(true);
  const [servicesList, setServicesList] = useState([]);
  const [selectedServiceModal, setSelectedServiceModal] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchServices = async () => {
      try {
        const res = await servicesAPI.getAll();
        const apiServices = res.data?.services || [];

        if (apiServices.length > 0 && isMounted) {
          // Format API services
          const formatted = apiServices.map((s, idx) => {
            const cat = normalizeCategoryName(s.category);
            return {
              _id: s._id,
              id: s._id || `api-service-${idx + 1}`,
              barberId: s.barberId,
              category: cat,
              name: s.name,
              description:
                s.description ||
                "Expert grooming service crafted with luxury techniques and sterile equipment.",
              points:
                Array.isArray(s.points) && s.points.length > 0
                  ? s.points
                  : [
                      "Professional personalized styling",
                      "Sanitized premium tools & equipment",
                      "Scalp or skin nourishment finish",
                      "Long-lasting polished results",
                    ],
              price: Number(s.price || 400),
              duration:
                typeof s.duration === "number"
                  ? `${s.duration} mins`
                  : s.duration || "30 mins",
              durationMinutes: typeof s.duration === "number" ? s.duration : 30,
              image: s.image || CATEGORY_DEFAULT_IMAGES[cat] || CATEGORY_DEFAULT_IMAGES.Haircut,
              badge: s.price > 1500 ? "Luxury" : s.price < 350 ? "Value" : "Popular",
            };
          });

          // Check if all 6 categories have at least 3 items. If not, supplement from fallbackServices
          const finalServices = [...formatted];
          const targetCategories = ["Haircut", "Beard", "Hair Care", "Face Care", "Combo", "Premium"];
          
          targetCategories.forEach((cat) => {
            const countInCat = finalServices.filter((s) => s.category === cat).length;
            if (countInCat < 3) {
              const missing = fallbackServices.filter(
                (fs) => fs.category === cat && !finalServices.some((s) => s.name === fs.name)
              );
              finalServices.push(...missing.slice(0, 3 - countInCat));
            }
          });

          setServicesList(finalServices);
        } else if (isMounted) {
          setServicesList(fallbackServices);
        }
      } catch (err) {
        console.warn("Could not load services from API, using curated catalog:", err.message);
        if (isMounted) {
          setServicesList(fallbackServices);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchServices();
    return () => {
      isMounted = false;
    };
  }, []);

  const activeCatalogue = servicesList.length > 0 ? servicesList : fallbackServices;

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts = { All: activeCatalogue.length };
    CATEGORIES.slice(1).forEach((cat) => {
      counts[cat] = activeCatalogue.filter((item) => item.category === cat).length;
    });
    return counts;
  }, [activeCatalogue]);

  // Filter & Sort services
  const filteredServices = useMemo(() => {
    let result = activeCatalogue.filter((item) => {
      const query = search.toLowerCase().trim();
      const matchSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        (item.description && item.description.toLowerCase().includes(query)) ||
        item.category.toLowerCase().includes(query) ||
        (item.points && item.points.some((p) => p.toLowerCase().includes(query)));

      const matchCategory = category === "All" || item.category === category;
      return matchSearch && matchCategory;
    });

    if (sortBy === "price-low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "duration-short") {
      result.sort((a, b) => (a.durationMinutes || 30) - (b.durationMinutes || 30));
    }

    return result;
  }, [activeCatalogue, search, category, sortBy]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
        <div className="flex flex-col items-center text-center">
          <BarberShopLoader />
          <h1 className="mt-4 text-2xl font-semibold tracking-wide text-amber-300">
            Loading Service Catalog...
          </h1>
          <p className="mt-2 text-sm text-slate-400">Curating luxury grooming experiences</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-amber-400 selection:text-black">
      {/* HERO SECTION */}
      <header className="relative overflow-hidden border-b border-white/10 bg-gradient-to-b from-slate-900 via-slate-950 to-black py-16 lg:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(217,119,6,0.15),rgba(255,255,255,0))]" />
        
        <div className="relative mx-auto w-full max-w-[1720px] px-4 sm:px-8 lg:px-12 xl:px-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-amber-400 backdrop-blur-md">
            <svg className="h-3.5 w-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <span>Master Barber Services & Spa</span>
          </div>

          <h1 className="mt-6 text-4xl font-extralight tracking-tight sm:text-6xl lg:text-7xl">
            Signature <span className="font-serif italic text-amber-400 font-normal">Grooming</span> Rituals
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base sm:text-lg text-slate-300 leading-relaxed">
            Choose from precision haircuts, luxury beard grooming, hair treatments, and VIP packages delivered by top stylists.
          </p>

          {/* SEARCH & SORT BAR */}
          <div className="mx-auto mt-10 max-w-3xl flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search by service name, treatment, or keyword..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 pl-11 pr-10 py-3.5 text-sm text-white placeholder-slate-400 backdrop-blur-md focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 transition"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-white"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            <div className="relative sm:w-56">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort services by price or duration"
                className="w-full appearance-none rounded-2xl border border-white/10 bg-slate-900 px-4 py-3.5 text-sm text-slate-200 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 transition"
              >
                <option value="default">Sort: Recommended</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="duration-short">Duration: Quickest</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* CATEGORY TABS */}
          <div className="mt-8 flex flex-wrap justify-center gap-2 sm:gap-3">
            {CATEGORIES.map((catName) => {
              const meta = CATEGORY_META[catName] || CATEGORY_META.All;
              const count = categoryCounts[catName] ?? 0;
              const isSelected = category === catName;

              return (
                <button
                  key={catName}
                  onClick={() => setCategory(catName)}
                  className={`group inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-xs sm:text-sm font-medium transition duration-200 ${
                    isSelected
                      ? "bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/25 ring-2 ring-amber-400/50 scale-105"
                      : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span className={isSelected ? "text-slate-950" : "text-amber-400"}>
                    {meta.icon}
                  </span>
                  <span>{catName}</span>
                  <span
                    className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                      isSelected ? "bg-slate-950 text-amber-300" : "bg-white/10 text-slate-400"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="mx-auto w-full max-w-[1720px] px-4 py-12 sm:px-8 lg:px-12 xl:px-16">
        {/* STATS STRIP */}
        <div className="mb-12 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-white/5 bg-gradient-to-br from-white/5 to-transparent p-5 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-wider text-slate-400">Available Services</p>
            <p className="mt-2 text-2xl sm:text-3xl font-bold text-white">{filteredServices.length}</p>
            <p className="mt-1 text-xs text-amber-400/80">Across {CATEGORIES.length - 1} categories</p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-gradient-to-br from-white/5 to-transparent p-5 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-wider text-slate-400">Grooming Standards</p>
            <p className="mt-2 text-2xl sm:text-3xl font-bold text-amber-400">100%</p>
            <p className="mt-1 text-xs text-slate-400">Sterilized tools & premium care</p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-gradient-to-br from-white/5 to-transparent p-5 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-wider text-slate-400">Starting Price</p>
            <p className="mt-2 text-2xl sm:text-3xl font-bold text-white">₹200</p>
            <p className="mt-1 text-xs text-slate-400">Affordable luxury grooming</p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-gradient-to-br from-white/5 to-transparent p-5 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-wider text-slate-400">Styling Booking</p>
            <p className="mt-2 text-2xl sm:text-3xl font-bold text-white">Instant</p>
            <p className="mt-1 text-xs text-slate-400">Confirmed via SMS & email</p>
          </div>
        </div>

        {/* RESULTS BAR */}
        <div className="mb-8 flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h2 className="text-lg font-semibold text-white">
              {category === "All" ? "All Grooming Services" : `${category} Services`}
            </h2>
            <p className="text-xs text-slate-400">
              Showing {filteredServices.length} {filteredServices.length === 1 ? "result" : "results"}
              {search && ` for "${search}"`}
            </p>
          </div>

          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-xs text-amber-400 hover:underline"
            >
              Clear filter
            </button>
          )}
        </div>

        {/* EMPTY STATE */}
        {filteredServices.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-400/10 text-amber-400">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="mt-4 text-xl font-semibold text-white">No services found</h3>
            <p className="mt-2 text-sm text-slate-400 max-w-sm mx-auto">
              We couldn't find any services matching &ldquo;{search}&rdquo;. Try another search term or reset category filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCategory("All");
              }}
              className="mt-6 rounded-full bg-amber-400 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-950 transition hover:bg-amber-300"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          /* SERVICE CARDS GRID */
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredServices.map((item) => (
              <div
                key={item._id || item.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-amber-400/40 hover:shadow-2xl hover:shadow-amber-500/10"
              >
                <div>
                  {/* IMAGE HEADER */}
                  <div className="relative h-60 w-full overflow-hidden bg-slate-800">
                    <img
                      src={item.image || CATEGORY_DEFAULT_IMAGES[item.category] || CATEGORY_DEFAULT_IMAGES.Haircut}
                      alt={item.name}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src =
                          CATEGORY_DEFAULT_IMAGES[item.category] || CATEGORY_DEFAULT_IMAGES.Haircut;
                      }}
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-black/30" />

                    {/* TOP BADGES */}
                    <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between">
                      <span className="rounded-full bg-slate-950/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-amber-300 backdrop-blur-md border border-white/10">
                        {item.category}
                      </span>

                      {item.badge && (
                        <span className="rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-3 py-1 text-[11px] font-bold text-slate-950 shadow-md">
                          {item.badge}
                        </span>
                      )}
                    </div>

                    {/* DURATION OVERLAY */}
                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-lg bg-slate-950/75 px-2.5 py-1 text-xs text-slate-200 backdrop-blur-md border border-white/5">
                      <svg className="h-3.5 w-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{item.duration}</span>
                    </div>

                    {/* PRICE BADGE */}
                    <div className="absolute bottom-3 right-3 rounded-lg bg-amber-400/90 px-3 py-1 text-sm font-bold text-slate-950 backdrop-blur-md shadow">
                      ₹{item.price}
                    </div>
                  </div>

                  {/* BODY CONTENT */}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-white group-hover:text-amber-300 transition-colors">
                      {item.name}
                    </h3>

                    <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-300 line-clamp-2">
                      {item.description}
                    </p>

                    {/* BULLET POINTS */}
                    {Array.isArray(item.points) && item.points.length > 0 && (
                      <ul className="mt-4 space-y-2 border-t border-white/10 pt-4">
                        {item.points.slice(0, 4).map((point, pIdx) => (
                          <li key={pIdx} className="flex items-start gap-2 text-xs text-slate-300">
                            <span className="mt-0.5 flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center rounded-full bg-amber-400/20 text-amber-400">
                              <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* ACTION BUTTON */}
                <div className="p-6 pt-0">
                  <button
                    type="button"
                    onClick={() => setSelectedServiceModal(item)}
                    className="w-full flex items-center justify-center gap-2 rounded-xl border border-amber-400/30 bg-amber-400/10 py-3 text-xs sm:text-sm font-semibold text-amber-300 hover:bg-amber-400 hover:text-slate-950 transition duration-200"
                  >
                    <span>View Details & Highlights</span>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* QUICK DETAILS MODAL */}
      {selectedServiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/20 bg-slate-900 p-6 text-white shadow-2xl">
            <button
              onClick={() => setSelectedServiceModal(null)}
              className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-slate-300 hover:text-white transition"
            >
              ✕
            </button>

            <div className="relative h-48 -mx-6 -mt-6 mb-6 overflow-hidden">
              <img
                src={
                  selectedServiceModal.image ||
                  CATEGORY_DEFAULT_IMAGES[selectedServiceModal.category]
                }
                alt={selectedServiceModal.name}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-6">
                <span className="rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-slate-950">
                  {selectedServiceModal.category}
                </span>
              </div>
            </div>

            <h3 className="text-2xl font-bold">{selectedServiceModal.name}</h3>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              {selectedServiceModal.description}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-xs text-slate-400">Duration</p>
                <p className="font-semibold text-white">{selectedServiceModal.duration}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-xs text-slate-400">Price (INR)</p>
                <p className="font-semibold text-amber-400">₹{selectedServiceModal.price}</p>
              </div>
            </div>

            {Array.isArray(selectedServiceModal.points) && (
              <div className="mt-4">
                <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">
                  What is included:
                </p>
                <ul className="space-y-1.5">
                  {selectedServiceModal.points.map((p) => (
                    <li key={p} className="flex items-center gap-2 text-xs text-slate-200">
                      <span className="text-amber-400">✓</span> {p}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-6">
              <button
                type="button"
                onClick={() => setSelectedServiceModal(null)}
                className="w-full rounded-xl border border-white/15 bg-white/10 py-3 text-sm font-semibold text-white hover:bg-white/20 transition"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ServicesPage;