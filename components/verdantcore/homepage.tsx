const services = [
  {
    title: "Core Clean",
    text: "Reliable, detail-focused cleaning for everyday office environments.",
    img: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Verdant Deep Reset",
    text: "A comprehensive deep cleaning service designed to restore and refresh your space.",
    img: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "EcoShield Maintenance",
    text: "Ongoing eco-friendly maintenance programs tailored for consistency.",
    img: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "AirPure Office Care",
    text: "Health-focused cleaning designed to improve indoor air quality.",
    img: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=900&q=80",
  },
];

const industries = ["Corporate Offices", "Medical & Healthcare", "Education", "Retail Spaces", "Tech & Startups"];

export default function Homepage() {
  return (
    <main className="min-h-screen bg-[#f7f4ee] text-[#10281d]">
      <header className="absolute left-0 top-0 z-20 w-full px-6 py-5 lg:px-12">
        <div className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-white/15 bg-[#132719]/80 px-6 py-4 text-white shadow-2xl backdrop-blur">
          <div>
            <div className="text-lg font-semibold tracking-[0.22em]">VERDANTCORE</div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-white/60">Eco Cleaning Solutions</div>
          </div>

          <nav className="hidden items-center gap-8 text-sm text-white/80 lg:flex">
            <a href="#">Home</a>
            <a href="#about">About Us</a>
            <a href="#services">Services</a>
            <a href="#why">Why Eco Cleaning</a>
            <a href="#industries">Industries</a>
            <a href="#contact">Contact</a>
          </nav>

          <a href="#contact" className="rounded-full bg-[#8ba56d] px-5 py-2.5 text-sm font-semibold text-white">
            Get a Quote
          </a>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#f7f4ee_0%,#f7f4ee_42%,rgba(247,244,238,0.38)_62%,rgba(247,244,238,0)_100%)]" />
        <img
          src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1800&q=85"
          alt="Eco conscious office cleaning"
          className="absolute right-0 top-0 h-full w-full object-cover object-center"
        />

        <div className="relative z-10 mx-auto flex min-h-[760px] max-w-7xl items-center px-6 pt-32 lg:px-12">
          <div className="max-w-2xl rounded-[2rem] bg-[#f7f4ee]/72 p-8 shadow-[0_30px_90px_rgba(16,40,29,0.16)] backdrop-blur-sm lg:p-12">
            <p className="mb-5 text-xs font-bold uppercase tracking-[0.32em] text-[#6d8455]">Facility Wellness Partner</p>
            <h1 className="font-serif text-6xl leading-[0.95] tracking-[-0.04em] text-[#11170f] lg:text-8xl">
              Elevating Clean,<br />
              <span className="text-[#61784e]">Naturally.</span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-[#344336]">
              Premium eco-conscious cleaning solutions designed for healthier, high-performing workspaces.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <a href="#contact" className="rounded-full bg-[#637f4e] px-7 py-4 text-sm font-bold text-white shadow-xl">
                Get a Quote
              </a>
              <a href="#services" className="rounded-full border border-[#637f4e]/50 bg-white/50 px-7 py-4 text-sm font-bold text-[#10281d]">
                Our Services
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#062615] px-6 py-8 text-white lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-4">
          {[
            ["Eco-Friendly Products", "Non-toxic, biodegradable and safe for everyone."],
            ["Healthier Spaces", "Improves indoor air quality and reduces allergens."],
            ["Reliable & Consistent", "Trained professionals. Trusted results."],
            ["Sustainable Impact", "Low-waste practices for a greener future."],
          ].map(([title, text]) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="mb-3 text-2xl">◇</div>
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/70">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="about" className="px-6 py-24 lg:px-12">
        <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">
          <div className="overflow-hidden rounded-[2rem] shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=85"
              alt="Healthy modern workspace"
              className="h-[460px] w-full object-cover"
            />
          </div>

          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.32em] text-[#6d8455]">About VerdantCore</p>
            <h2 className="font-serif text-5xl leading-tight tracking-[-0.03em] text-[#101810]">
              More Than Clean.<br />It’s Our Core.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#485448]">
              At VerdantCore, we believe clean spaces create stronger, healthier and more productive environments. Our mission is to deliver exceptional cleaning services using sustainable products and intelligent systems that care for people and the planet.
            </p>
            <a href="#contact" className="mt-8 inline-flex rounded-full bg-[#637f4e] px-6 py-3 text-sm font-bold text-white">
              Learn More About Us
            </a>
          </div>
        </div>
      </section>

      <section id="services" className="bg-[#eef1e8] px-6 py-24 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex items-end justify-between gap-8">
            <div>
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.32em] text-[#6d8455]">Our Services</p>
              <h2 className="font-serif text-5xl leading-tight tracking-[-0.03em]">
                Cleaning Solutions<br />Tailored to You
              </h2>
            </div>
            <a className="hidden rounded-full border border-[#637f4e]/30 px-5 py-3 text-sm font-bold text-[#637f4e] md:block" href="#contact">
              View All Services
            </a>
          </div>

          <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => (
              <article key={service.title} className="overflow-hidden rounded-[1.5rem] bg-white shadow-[0_20px_60px_rgba(16,40,29,0.09)]">
                <img src={service.img} alt={service.title} className="h-44 w-full object-cover" />
                <div className="p-6">
                  <div className="-mt-12 mb-5 flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-[#f5f7f0] text-2xl shadow-lg">♧</div>
                  <h3 className="text-lg font-bold text-[#10281d]">{service.title}</h3>
                  <p className="mt-3 min-h-20 text-sm leading-6 text-[#5b665b]">{service.text}</p>
                  <a href="#contact" className="mt-5 inline-block text-sm font-bold text-[#637f4e]">Learn More ○</a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="why" className="px-6 py-24 lg:px-12">
        <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.32em] text-[#6d8455]">Why Choose Us</p>
            <h2 className="font-serif text-5xl leading-tight tracking-[-0.03em]">
              A Healthier Workspace.<br />A Greener Future.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#485448]">
              We combine eco-friendly products, modern systems, and a passion for excellence to deliver consistent cleaning experiences.
            </p>
            <div className="mt-8 space-y-4">
              {["Non-toxic, eco-conscious products", "Trained, background-checked professionals", "Customized plans for every business"].map((item) => (
                <div key={item} className="flex items-center gap-3 text-[#2e3d30]">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#dbe6cf] text-sm">✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] bg-[#092817] p-8 text-white shadow-2xl">
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/15">
              {[
                ["100%", "Eco-Friendly Products"],
                ["250+", "Happy Clients"],
                ["500+", "Spaces Cleaned"],
                ["98%", "Client Satisfaction"],
              ].map(([value, label]) => (
                <div key={label} className="bg-[#092817]/90 p-8">
                  <div className="font-serif text-5xl">{value}</div>
                  <p className="mt-2 text-sm text-white/70">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="industries" className="border-y border-[#dce2d5] bg-white/50 px-6 py-16 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.32em] text-[#6d8455]">Who We Serve</p>
            <h2 className="font-serif text-4xl leading-tight">Trusted by Businesses Across Industries</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {industries.map((industry) => (
              <div key={industry} className="rounded-2xl border border-[#dce2d5] bg-white p-5 text-center text-sm font-semibold shadow-sm">
                <div className="mb-3 text-3xl">♧</div>
                {industry}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-24 lg:px-12">
        <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">
          <img
            src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=85"
            alt="Clean office"
            className="h-[360px] w-full rounded-[2rem] object-cover shadow-2xl"
          />
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.32em] text-[#6d8455]">What Our Clients Say</p>
            <p className="font-serif text-3xl leading-snug text-[#17251a]">
              “VerdantCore has completely transformed our workspace. Their attention to detail, professionalism, and commitment to sustainability are unmatched.”
            </p>
            <div className="mt-8 font-bold">Sarah D.</div>
            <div className="text-sm text-[#667064]">Operations Manager, Brightline Solutions</div>
          </div>
        </div>
      </section>

      <section id="contact" className="relative overflow-hidden bg-[#062615] px-6 py-20 text-white lg:px-12">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div>
            <h2 className="font-serif text-4xl tracking-[-0.03em]">Ready to Elevate Your Workspace?</h2>
            <p className="mt-3 max-w-xl text-white/70">Let’s create a cleaner, healthier and more sustainable environment together.</p>
          </div>
          <a href="mailto:hello@verdantcore.com" className="rounded-full bg-[#8ba56d] px-8 py-4 text-sm font-bold text-white shadow-xl">
            Get a Free Quote
          </a>
        </div>
      </section>

      <footer className="bg-[#041b10] px-6 py-14 text-white lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-4">
          <div>
            <div className="text-lg font-semibold tracking-[0.22em]">VERDANTCORE</div>
            <p className="mt-4 max-w-xs text-sm leading-6 text-white/60">Premium eco-conscious cleaning solutions for modern workspaces.</p>
          </div>
          <div>
            <h4 className="font-bold">Quick Links</h4>
            <div className="mt-4 space-y-2 text-sm text-white/60">
              <p>Home</p><p>About Us</p><p>Services</p><p>Industries</p><p>Contact</p>
            </div>
          </div>
          <div>
            <h4 className="font-bold">Services</h4>
            <div className="mt-4 space-y-2 text-sm text-white/60">
              <p>Core Clean</p><p>Verdant Deep Reset</p><p>EcoShield Maintenance</p><p>AirPure Office Care</p>
            </div>
          </div>
          <div>
            <h4 className="font-bold">Contact Us</h4>
            <div className="mt-4 space-y-2 text-sm text-white/60">
              <p>(555) 123-4567</p>
              <p>hello@verdantcore.com</p>
              <p>123 Greenway Drive, Austin, TX 78701</p>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-12 max-w-7xl border-t border-white/10 pt-6 text-sm text-white/45">
          © 2026 VerdantCore Eco Cleaning Solutions. All Rights Reserved.
        </div>
      </footer>
    </main>
  );
}
