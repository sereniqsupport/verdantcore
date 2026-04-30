export default function Homepage() {
  return (
    <main className="bg-[#F8F6F2] text-[#0F2A1D]">

      {/* HERO */}
      <section className="min-h-screen flex items-center px-8 lg:px-20 py-20">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          
          <div>
            <h1 className="text-5xl lg:text-7xl font-serif leading-tight">
              Elevating Clean,<br />
              <span className="text-green-700">Naturally.</span>
            </h1>

            <p className="mt-6 text-lg text-gray-700 max-w-lg">
              Premium eco-conscious cleaning solutions designed for healthier,
              high-performing workspaces.
            </p>

            <div className="mt-8 flex gap-4">
              <button className="bg-green-800 text-white px-6 py-3 rounded-full">
                Get a Quote
              </button>
              <button className="border border-green-800 px-6 py-3 rounded-full">
                Book Consultation
              </button>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden shadow-lg">
            <img
              src="https://images.unsplash.com/photo-1581578731548-c64695cc6952"
              alt="Office cleaning"
              className="w-full h-full object-cover"
            />
          </div>

        </div>
      </section>

      {/* TRUST BAR */}
      <section className="bg-[#0F2A1D] text-white py-10">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-6 text-center text-sm px-6">
          <div>Eco-Friendly Products</div>
          <div>Healthier Spaces</div>
          <div>Reliable & Consistent</div>
          <div>Sustainable Impact</div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="py-24 px-8 lg:px-20">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c"
            className="rounded-2xl shadow-lg"
          />

          <div>
            <h2 className="text-4xl font-serif mb-6">
              More Than Clean.<br />It’s Our Core.
            </h2>

            <p className="text-gray-700 leading-relaxed">
              At VerdantCore, we believe clean spaces create stronger, healthier
              and more productive environments. Our mission is to deliver
              exceptional cleaning services using sustainable products and
              intelligent systems.
            </p>
          </div>

        </div>
      </section>

      {/* SERVICES */}
      <section className="py-24 px-8 lg:px-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-serif mb-12 text-center">
            Cleaning Solutions Tailored to You
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              "Core Clean",
              "Verdant Deep Reset",
              "EcoShield Maintenance",
              "AirPure Office Care"
            ].map((service) => (
              <div key={service} className="bg-white rounded-2xl p-6 shadow-md">
                <h3 className="font-semibold mb-2">{service}</h3>
                <p className="text-sm text-gray-600">
                  Premium eco-conscious cleaning tailored to your workspace.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-green-900 text-white py-20 text-center">
        <h2 className="text-4xl font-serif mb-4">
          Ready to Elevate Your Workspace?
        </h2>
        <p className="mb-6">
          Experience a cleaner, healthier and more sustainable environment.
        </p>
        <button className="bg-white text-green-900 px-6 py-3 rounded-full">
          Get a Free Quote
        </button>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0F2A1D] text-white py-12 text-center text-sm">
        © 2026 VerdantCore. All Rights Reserved.
      </footer>

    </main>
  );
}
