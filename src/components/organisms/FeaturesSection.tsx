export default function FeaturesSection() {
  const items = [
    {
      title: "Califica películas",
      text: "Da medias estrellas, marca favoritas y lleva tu registro personal.",
      icon: "⭐"
    },
    {
      title: "Escribe reseñas",
      text: "Comparte tu opinión y debate con otros amantes del cine.",
      icon: "📝"
    },
    {
      title: "Crea tu Watchlist",
      text: "Guarda lo que quieres ver y organízalo como un catálogo personal.",
      icon: "🎬"
    }
  ];

  return (
    <section className="py-16 px-6 bg-gradient-to-b from-[#1b0006] to-[#000] text-white">
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10">
        {items.map((f, i) => (
          <div
            key={i}
            className="bg-black/50 border border-red-800/40 p-8 rounded-xl backdrop-blur-sm hover:border-red-600/70 transition duration-300"
          >
            <div className="text-4xl mb-4">{f.icon}</div>
            <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
            <p className="text-gray-300 text-sm">{f.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
