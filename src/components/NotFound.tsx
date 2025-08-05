import { component$ } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';

export const NotFound = component$(() => {
  return (
    <div class="min-h-screen bg-white flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div class="max-w-2xl w-full text-center">
        {/* Galaxy "oops!" Text */}
        <div class="mb-8">
          <h1 class="galaxy-text text-[8rem] sm:text-[10rem] md:text-[16rem] lg:text-[20rem] xl:text-[24rem] font-bold leading-none mb-2">
            oops!
          </h1>
        </div>

        {/* 404 Page Not Found */}
        <div class="mb-8">
          <h2 class="text-2xl md:text-3xl font-semibold text-gray-800 mb-6 tracking-wide">
            404 - PAGE NOT FOUND
          </h2>
          <p class="text-gray-600 text-lg leading-relaxed max-w-md mx-auto">
            The page you are looking for might have been removed 
            had its name changed or is temporarily unavailable.
          </p>
        </div>

        {/* Go to Homepage Button */}
        <div class="mt-12">
          <Link
            href="/"
            class="inline-block px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            GO TO HOMEPAGE
          </Link>
        </div>
      </div>

      {/* CSS for Galaxy Effect */}
      <style>
        {`
          .galaxy-text {
            background: 
              /* Stars layer */
              radial-gradient(2px 2px at 20px 30px, #fff, transparent),
              radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,.8), transparent),
              radial-gradient(1px 1px at 90px 40px, #fff, transparent),
              radial-gradient(1px 1px at 130px 80px, rgba(255,255,255,.6), transparent),
              radial-gradient(2px 2px at 160px 30px, #fff, transparent),
              radial-gradient(1px 1px at 200px 60px, rgba(255,255,255,.8), transparent),
              radial-gradient(2px 2px at 240px 90px, #fff, transparent),
              radial-gradient(1px 1px at 280px 20px, rgba(255,255,255,.6), transparent),
              radial-gradient(1px 1px at 320px 70px, #fff, transparent),
              radial-gradient(2px 2px at 360px 40px, rgba(255,255,255,.8), transparent),
              radial-gradient(1px 1px at 400px 80px, #fff, transparent),
              radial-gradient(2px 2px at 440px 30px, rgba(255,255,255,.6), transparent),
              /* Galaxy nebula background */
              linear-gradient(135deg, 
                #0f1419 0%,
                #1a1f3a 15%,
                #2d1b69 30%,
                #5b2c87 45%,
                #8e44ad 60%,
                #bb6bd9 75%,
                #e67e22 85%,
                #f39c12 100%
              );
            background-size: 
              400px 400px,
              400px 400px,
              400px 400px,
              400px 400px,
              400px 400px,
              400px 400px,
              400px 400px,
              400px 400px,
              400px 400px,
              400px 400px,
              400px 400px,
              400px 400px,
              200% 200%;
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: galaxyMove 8s ease-in-out infinite, starTwinkle 4s ease-in-out infinite alternate;
            position: relative;
            filter: drop-shadow(0 0 20px rgba(138, 43, 226, 0.5));
            font-weight: 900;
            letter-spacing: -0.02em;
          }

          .galaxy-text::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: 
              /* More scattered stars */
              radial-gradient(1px 1px at 50px 50px, rgba(255,255,255,0.9), transparent),
              radial-gradient(2px 2px at 100px 100px, rgba(255,255,255,0.7), transparent),
              radial-gradient(1px 1px at 150px 25px, rgba(255,255,255,0.8), transparent),
              radial-gradient(1px 1px at 250px 75px, rgba(255,255,255,0.6), transparent),
              radial-gradient(2px 2px at 300px 125px, rgba(255,255,255,0.9), transparent),
              radial-gradient(1px 1px at 350px 50px, rgba(255,255,255,0.7), transparent),
              radial-gradient(1px 1px at 450px 100px, rgba(255,255,255,0.8), transparent);
            background-size: 500px 150px;
            animation: starsFloat 12s linear infinite;
            pointer-events: none;
            -webkit-background-clip: text;
            background-clip: text;
          }

          @keyframes galaxyMove {
            0% { 
              background-position: 0% 50%, 0% 50%, 0% 50%, 0% 50%, 0% 50%, 0% 50%, 0% 50%, 0% 50%, 0% 50%, 0% 50%, 0% 50%, 0% 50%, 0% 50%;
            }
            50% { 
              background-position: 100% 50%, 100% 50%, 100% 50%, 100% 50%, 100% 50%, 100% 50%, 100% 50%, 100% 50%, 100% 50%, 100% 50%, 100% 50%, 100% 50%, 100% 50%;
            }
            100% { 
              background-position: 0% 50%, 0% 50%, 0% 50%, 0% 50%, 0% 50%, 0% 50%, 0% 50%, 0% 50%, 0% 50%, 0% 50%, 0% 50%, 0% 50%, 0% 50%;
            }
          }

          @keyframes starTwinkle {
            0% { 
              filter: drop-shadow(0 0 20px rgba(138, 43, 226, 0.5)) brightness(1);
            }
            100% { 
              filter: drop-shadow(0 0 30px rgba(138, 43, 226, 0.8)) brightness(1.1);
            }
          }

          @keyframes starsFloat {
            0% { transform: translateX(0px); }
            100% { transform: translateX(-50px); }
          }

          /* Responsive adjustments */
          @media (max-width: 768px) {
            .galaxy-text {
              background-size: 
                300px 300px,
                300px 300px,
                300px 300px,
                300px 300px,
                300px 300px,
                300px 300px,
                300px 300px,
                300px 300px,
                300px 300px,
                300px 300px,
                300px 300px,
                300px 300px,
                150% 150%;
            }
            .galaxy-text::before {
              background-size: 400px 120px;
            }
          }

          @media (max-width: 480px) {
            .galaxy-text {
              background-size: 
                250px 250px,
                250px 250px,
                250px 250px,
                250px 250px,
                250px 250px,
                250px 250px,
                250px 250px,
                250px 250px,
                250px 250px,
                250px 250px,
                250px 250px,
                250px 250px,
                120% 120%;
            }
            .galaxy-text::before {
              background-size: 350px 100px;
            }
          }
        `}
      </style>
    </div>
  );
});

export default NotFound;