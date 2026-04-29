import Link from "next/link";

const creators = [
  {
    name: "Ananya Rao",
    category: "Fashion",
    followers: "214K followers",
    avatar: "https://i.pravatar.cc/150?img=47",
  },
  {
    name: "Kabir Sethi",
    category: "Food",
    followers: "118K followers",
    avatar: "https://i.pravatar.cc/150?img=12",
  },
  {
    name: "Meera Nair",
    category: "Travel",
    followers: "306K followers",
    avatar: "https://i.pravatar.cc/150?img=32",
  },
  {
    name: "Rohan Malhotra",
    category: "Fitness",
    followers: "192K followers",
    avatar: "https://i.pravatar.cc/150?img=60",
  },
  {
    name: "Ishita Kapoor",
    category: "Beauty",
    followers: "164K followers",
    avatar: "https://i.pravatar.cc/150?img=44",
  },
  {
    name: "Aarav Mehta",
    category: "Tech",
    followers: "89K followers",
    avatar: "https://i.pravatar.cc/150?img=15",
  },
];

export default function FeaturedInfluencer() {
  return (
    <section id="featured-influencer" className="bg-white px-5 py-20 sm:px-8 lg:px-[5%] lg:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="max-w-2xl">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-yellow-500">
            Local creator network
          </p>
          <h2 className="mt-5 text-[clamp(3rem,9vw,7rem)] font-black leading-[0.86] tracking-[-0.08em] text-zinc-950">
            Hire Influencers
            <br />
            Locally
          </h2>
          <p className="mt-6 max-w-md text-lg leading-8 text-zinc-500">
            Connect with authentic local creators who know your audience.
          </p>
          <Link
            href="/register"
            className="mt-8 inline-flex rounded-full bg-zinc-950 px-7 py-3.5 text-xs font-black uppercase tracking-[0.18em] text-white shadow-[0_18px_50px_rgba(15,23,42,0.18)]"
          >
            Get Started
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:gap-5">
          {creators.map((creator, index) => (
            <div
              key={creator.name}
              className={`rounded-2xl border border-zinc-100 bg-white p-5 shadow-[0_18px_55px_rgba(15,23,42,0.08)] ${
                index % 2 === 1 ? "lg:translate-y-8" : ""
              }`}
            >
              <div className="flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={creator.avatar}
                  alt={creator.name}
                  className="h-20 w-20 rounded-full object-cover ring-4 ring-yellow-100"
                />
                <div>
                  <h3 className="text-lg font-black tracking-[-0.04em] text-zinc-950">{creator.name}</h3>
                  <p className="mt-1 text-sm font-semibold text-zinc-400">{creator.followers}</p>
                </div>
              </div>
              <span className="mt-5 inline-flex rounded-full bg-yellow-100 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-yellow-700">
                {creator.category}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
