import ratingIcon from "../../assets/icons/feature-rating.svg";
import reviewIcon from "../../assets/icons/feature-review.svg";
import watchlistIcon from "../../assets/icons/feature-watchlist.svg";

type FeatureItem = {
  title: string;
  text: string;
  icon: string;
  alt: string;
};

export default function FeaturesSection() {
  const items: FeatureItem[] = [
    {
      title: "Califica películas",
      text: "Da medias estrellas, marca favoritas y lleva tu registro personal.",
      icon: ratingIcon,
      alt: "Icono de calificación con estrella",
    },
    {
      title: "Escribe reseñas",
      text: "Comparte tu opinión y debate con otros amantes del cine.",
      icon: reviewIcon,
      alt: "Icono de reseñas",
    },
    {
      title: "Crea tu Watchlist",
      text: "Guarda lo que quieres ver y organízalo como un catálogo personal.",
      icon: watchlistIcon,
      alt: "Icono de watchlist",
    },
  ];

  return (
    <section className="landing-features">
      <div className="landing-features__inner">
        {items.map((f, i) => (
          <article
            key={i}
            className="landing-features__card cursor-default"
          >
            <div className="landing-features__icon-wrap">
              <div className="landing-features__icon-circle">
                <img
                  src={f.icon}
                  alt={f.alt}
                  className="landing-features__icon-img"
                />
              </div>
            </div>

            <h3 className="landing-features__title">{f.title}</h3>
            <p className="landing-features__text">{f.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
