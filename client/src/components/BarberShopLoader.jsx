import React from 'react';

const BarberShopLoader = () => {
  return (
    <div className="barber-loader-container">
      <style>
        {`
          .barber-loader-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-family: 'Comic Sans MS', 'Chalkboard SE', cursive, sans-serif;
            position: relative;
            overflow: hidden;
          }

          .man-figure-container {
            position: relative;
            width: 180px;
            height: 220px;
            margin-bottom: 15px;
            display: flex;
            justify-content: center;
            align-items: flex-start;
          }

          .scissors-container {
            position: absolute;
            top: 0px;
            left: 50%;
            transform: translateX(-50%);
            width: 100px;
            height: 100px;
            z-index: 10;
          }

          .blade {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 80px;
            height: 20px;
            background: transparent;
            transform-origin: 20px 10px;
          }

          .blade-top { animation: snapTop 0.5s ease-in-out infinite alternate; }
          .blade-bottom { animation: snapBottom 0.5s ease-in-out infinite alternate; }

          @keyframes snapTop {
            0% { transform: translate(-50%, -50%) rotate(-20deg); }
            100% { transform: translate(-50%, -50%) rotate(5deg); }
          }

          @keyframes snapBottom {
            0% { transform: translate(-50%, -50%) rotate(20deg); }
            100% { transform: translate(-50%, -50%) rotate(-5deg); }
          }

          .hair-clipping {
            position: absolute;
            width: 12px;
            height: 5px;
            border-bottom: 3px solid #4a3018;
            border-radius: 50%;
            opacity: 0;
            animation: fall linear infinite;
            z-index: 5;
          }

          .hair-1 { left: 45%; top: 50px; animation-duration: 1.2s; animation-delay: 0s; }
          .hair-2 { left: 60%; top: 60px; animation-duration: 1.5s; animation-delay: 0.3s; }
          .hair-3 { left: 50%; top: 45px; animation-duration: 1.1s; animation-delay: 0.6s; }
          .hair-4 { left: 65%; top: 55px; animation-duration: 1.4s; animation-delay: 0.2s; }
          .hair-5 { left: 55%; top: 65px; animation-duration: 1.6s; animation-delay: 0.8s; }

          @keyframes fall {
            0% { transform: translateY(0px) rotate(0deg) scale(1); opacity: 1; }
            80% { opacity: 1; }
            100% { transform: translateY(180px) rotate(200deg) scale(0.5); opacity: 0; }
          }

          .barber-pole-wrapper {
            width: 250px;
            height: 30px;
            border: 3px solid #3a2e28;
            border-radius: 15px;
            position: relative;
            background-color: #ddd;
            overflow: hidden;
            box-shadow: 2px 2px 5px rgba(0,0,0,0.3);
            margin-top: 15px;
          }

          .barber-pole-wrapper::before,
          .barber-pole-wrapper::after {
            content: '';
            position: absolute;
            top: 0;
            width: 20px;
            height: 100%;
            background: linear-gradient(to bottom, #ccc, #fff, #999);
            z-index: 2;
          }
          .barber-pole-wrapper::before { left: 0; border-right: 2px solid #3a2e28; }
          .barber-pole-wrapper::after { right: 0; border-left: 2px solid #3a2e28; }

          .barber-pole-stripes {
            width: 200%;
            height: 100%;
            background: repeating-linear-gradient(
              -45deg,
              #d32f2f,
              #d32f2f 15px,
              #ffffff 15px,
              #ffffff 30px,
              #1976d2 30px,
              #1976d2 45px,
              #ffffff 45px,
              #ffffff 60px
            );
            background-size: 85px 100%;
            animation: moveStripes 1s linear infinite;
          }

          @keyframes moveStripes {
            0% { transform: translateX(0); }
            100% { transform: translateX(-85px); }
          }
          
          .loading-text-overlay {
            position: absolute;
            z-index: 5;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #000;
            font-weight: bold;
            font-size: 14px;
            letter-spacing: 2px;
            text-shadow: 1px 1px 2px #fff, -1px -1px 2px #fff, 1px -1px 2px #fff, -1px 1px 2px #fff; 
          }
        `}
      </style>

      <div className="man-figure-container">
        <svg viewBox="0 0 180 220" width="180" height="220" style={{position: 'relative', top: '20px', zIndex: 1}}>
          <defs>
            <pattern id="cape-stripes" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="10" stroke="#555" strokeWidth="2" />
            </pattern>
          </defs>

          <path d="M40 120 L140 120 L130 220 L50 220 Z" fill="#6b3e2e" stroke="#3a2e28" strokeWidth="3" strokeLinejoin="round" />
          <path d="M45 110 L135 110 L140 130 L40 130 Z" fill="#8c5642" stroke="#3a2e28" strokeWidth="3" strokeLinejoin="round" />

          <path d="M50 140 Q 90 120 130 140 L 160 220 L 20 220 Z" fill="#eee" stroke="#3a2e28" strokeWidth="3" strokeLinejoin="round"/>
          <path d="M50 140 Q 90 120 130 140 L 160 220 L 20 220 Z" fill="url(#cape-stripes)" />
          
          <path d="M70 125 Q 90 140 110 125 L 115 130 Q 90 145 65 130 Z" fill="#fff" stroke="#3a2e28" strokeWidth="2" />

          <rect x="78" y="105" width="24" height="25" fill="#f1c27d" stroke="#3a2e28" strokeWidth="2" />

          <circle cx="65" cy="85" r="8" fill="#e0ad68" stroke="#3a2e28" strokeWidth="2" />
          <circle cx="115" cy="85" r="8" fill="#e0ad68" stroke="#3a2e28" strokeWidth="2" />

          <ellipse cx="90" cy="80" rx="28" ry="35" fill="#f1c27d" stroke="#3a2e28" strokeWidth="2.5" />

          <path d="M62 70 Q 62 45 90 40 Q 118 45 118 70 Q 115 55 90 50 Q 65 55 62 70 Z" fill="#4a3018" />
          <path d="M65 55 L 68 40 L 75 48 L 80 32 L 88 45 L 95 30 L 102 45 L 108 35 L 112 50 L 115 65 Q 90 45 65 55 Z" fill="#4a3018" stroke="#3a2e28" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>

          <path d="M72 68 Q 78 65 84 68" fill="none" stroke="#3a2e28" strokeWidth="2" strokeLinecap="round" />
          <path d="M96 68 Q 102 65 108 68" fill="none" stroke="#3a2e28" strokeWidth="2" strokeLinecap="round" />
          <circle cx="78" cy="75" r="3" fill="#fff" stroke="#3a2e28" strokeWidth="1.5" />
          <circle cx="78" cy="75" r="1.5" fill="#3a2e28" />
          <circle cx="102" cy="75" r="3" fill="#fff" stroke="#3a2e28" strokeWidth="1.5" />
          <circle cx="102" cy="75" r="1.5" fill="#3a2e28" />
          <path d="M90 80 L 88 88 L 92 88" fill="none" stroke="#d49a5b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M82 98 Q 90 105 98 98" fill="none" stroke="#3a2e28" strokeWidth="2" strokeLinecap="round" />
        </svg>

        <div className="scissors-container">
          <div className="blade blade-top">
            <svg viewBox="0 0 100 30" width="70" height="20">
              <path d="M20 15 L90 5 L95 10 L20 15" fill="#ccc" stroke="#666" strokeWidth="2" />
              <circle cx="20" cy="15" r="8" fill="none" stroke="#666" strokeWidth="3" />
            </svg>
          </div>
          <div className="blade blade-bottom">
            <svg viewBox="0 0 100 30" width="70" height="20">
              <path d="M20 15 L90 25 L95 20 L20 15" fill="#ccc" stroke="#666" strokeWidth="2" />
              <circle cx="20" cy="15" r="8" fill="none" stroke="#666" strokeWidth="3" />
              <circle cx="20" cy="15" r="3" fill="#333" />
            </svg>
          </div>
        </div>

        <div className="hair-clipping hair-1"></div>
        <div className="hair-clipping hair-2"></div>
        <div className="hair-clipping hair-3"></div>
        <div className="hair-clipping hair-4"></div>
        <div className="hair-clipping hair-5"></div>
      </div>

      <div className="barber-pole-wrapper">
        <div className="barber-pole-stripes"></div>
        <div className="loading-text-overlay">LOADING...</div>
      </div>
    </div>
  );
};

export default BarberShopLoader;