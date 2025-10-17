import React from 'react';

interface ClientLogo {
  name: string;
  src: string;
  url?: string;
}

interface ClientLogosMarqueeProps {
  logos: ClientLogo[];
  speed?: number;
  isDark: boolean;
}

export const ClientLogosMarquee: React.FC<ClientLogosMarqueeProps> = ({
  logos,
  speed = 25,
  isDark
}) => {
  const duplicatedLogos = [...logos, ...logos];

  return (
    <section
      className="mx-auto max-w-6xl px-6 py-16 md:py-24"
      aria-labelledby="client-logos-heading"
    >
      <h2
        id="client-logos-heading"
        className={`text-4xl md:text-5xl font-normal font-bold text-center mb-12 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}
      >
        Onze vertrouwde klanten
      </h2>

      <div className="relative overflow-hidden">
        <div
          className="flex gap-12 animate-marquee motion-reduce:animate-none hover:pause-animation"
          style={{
            animationDuration: `${speed}s`,
          }}
        >
          {duplicatedLogos.map((logo, index) => (
            <div
              key={`${logo.name}-${index}`}
              className="flex-shrink-0 flex items-center justify-center"
            >
              {logo.url ? (
                <a
                  href={logo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`transition-opacity ${
                    isDark ? 'opacity-90' : 'opacity-80'
                  } hover:opacity-100`}
                >
                  <img
                    src={logo.src}
                    alt={logo.name}
                    className="h-16 md:h-20 lg:h-24 w-auto object-contain"
                    loading="lazy"
                  />
                </a>
              ) : (
                <img
                  src={logo.src}
                  alt={logo.name}
                  className={`h-10 md:h-12 lg:h-14 w-auto object-contain transition-opacity ${
                    isDark ? 'opacity-90' : 'opacity-80'
                  } hover:opacity-100`}
                  loading="lazy"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
