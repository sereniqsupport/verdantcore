const services = [
  {
    title: "Core Clean",
    text: "Reliable, detail-focused cleaning for everyday office environments.",
    img: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Verdant Deep Reset",
    text: "Deep cleaning designed to restore and reset your workspace.",
    img: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "EcoShield Maintenance",
    text: "Consistent eco-friendly cleaning programs.",
    img: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "AirPure Office Care",
    text: "Improve indoor air quality and reduce contaminants.",
    img: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=900&q=80",
  },
];

export default function Homepage() {
  return (
    <main className="bg-[#f7f4ee] text-[#10281d]">

      {/* HERO */}
      <section className="relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1800&q=85"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="relative z-10 mx-auto max-w-7xl px-6 py-32 lg:px-12">
          <div className="max-w-2xl rounded-3xl bg-white/80 p-10 backdrop-blur shadow-2xl">
            
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#6d8455]">
              Facility Wellness Partner
            </p>

            <h1 className="mt-4 font-serif text-6xl leading-tight">
              A cleaner office.<br />
              A healthier team.
            </h1>

            <p className="mt-6 text-lg text-[#4c584f]">
              Eco-conscious cleaning designed for modern workplaces.  
              Improve air quality, reduce exposure to toxins, and elevate performance.
            </p>

            <div className="mt-8 flex gap-4">
              <a href="/contact" className="rounded-full bg-[#637f4e] px-7 py-4 text-white font-bold">
                Get a Quote
              </a>
              <a href="/contact" className="rounded-full border border-[#637f4e] px-7 py-4 font-bold">
                Schedule Walkthrough
              </a>
            </div>

            <p className="mt-6 text-sm text-[#6b766c]">
              Typical plans range from $300 to $1,200 per month depending on size and frequency.
            </p>

          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="bg-[#062615] text-white py-10 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm text-white/70">
            Trusted by modern offices across Austin and growing teams nationwide
          </p>
        </div>
      </section>

      {/* SERVICES */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="font-serif text-4xl">Cleaning Solutions Tailored to You</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
            {services.map((s) => (
              <div key={s.title} className="bg-white rounded-2xl overflow-hidden shadow-lg">
                <img src={s.img} className="h-40 w-full object-cover"/>
                <div className="p-5">
                  <h3 className="font-bold">{s.title}</h3>
                  <p className="text-sm mt-2 text-[#5c675c]">{s.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12">
            <a href="/contact" className="bg-[#637f4e] text-white px-8 py-4 rounded-full font-bold">
              Get a Custom Plan
            </a>
          </div>

        </div>
      </section>

      {/* WHY */}
      <section className="py-24 px-6 bg-[#eef1e8]">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-serif text-4xl text-center">
            Why Businesses Choose VerdantCore
          </h2>

          <div className="grid md:grid-cols-3 gap-8 mt-12 text-center">
            <div>
              <h3 className="font-bold">Non-toxic cleaning</h3>
              <p className="text-sm mt-2">No harmful chemicals for your team</p>
            </div>
            <div>
              <h3 className="font-bold">Consistent results</h3>
              <p className="text-sm mt-2">Process-driven cleaning systems</p>
            </div>
            <div>
              <h3 className="font-bold">Health-focused</h3>
              <p className="text-sm mt-2">Improve air quality and workplace wellness</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#062615] text-white py-20 text-center">
        <h2 className="text-4xl font-serif">Ready to upgrade your workspace?</h2>
        <p className="mt-4 text-white/70">
          Get a tailored cleaning plan in less than 24 hours.
        </p>

        <a href="/contact" className="mt-6 inline-block bg-[#8ba56d] px-8 py-4 rounded-full font-bold">
          Request My Quote
        </a>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#041b10] text-white py-12 text-center">
        © 2026 VerdantCore. All Rights Reserved.
      </footer>

    </main>
  );
}
