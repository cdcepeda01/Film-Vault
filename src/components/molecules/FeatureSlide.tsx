type FeatureSlideProps = {
  imageUrl: string;
  active: boolean;
  caption: string;
};

export default function FeatureSlide({ imageUrl, active, caption }: FeatureSlideProps) {
  return (
    <div
      className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
        active ? "opacity-100" : "opacity-0"
      }`}
      aria-hidden={!active}
    >
      <img
        src={imageUrl}
        alt="Escena de película"
        className="w-full h-full object-cover"
      />

      <div className="fv-hero__overlay" />

      <div className="fv-hero__content">
        <div>
          <h1 className="fv-hero__title tracking-wide">El lugar donde vive tu cine.</h1>
          <p className="fv-hero__caption">{caption}</p>
        </div>
      </div>
    </div>
  );
}
