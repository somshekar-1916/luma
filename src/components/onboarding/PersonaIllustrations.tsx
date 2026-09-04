import React from 'react';

/**
 * High-fidelity 3D-styled SVGs matching the exact avatars in image.png
 */

export const StudentDevIllustration: React.FC<{ className?: string }> = ({ className = "w-44 h-44" }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 200 180" className="w-full h-full drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="hoodieGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FB923C" />
            <stop offset="60%" stopColor="#EA580C" />
            <stop offset="100%" stopColor="#C2410C" />
          </linearGradient>
          <linearGradient id="skinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FED7AA" />
            <stop offset="100%" stopColor="#FDBA74" />
          </linearGradient>
          <linearGradient id="hairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#262626" />
            <stop offset="100%" stopColor="#171717" />
          </linearGradient>
          <linearGradient id="laptopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E2E8F0" />
            <stop offset="100%" stopColor="#94A3B8" />
          </linearGradient>
          <linearGradient id="badgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF7ED" />
            <stop offset="100%" stopColor="#FFEDD5" />
          </linearGradient>
          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Ambient subtle back glow */}
        <circle cx="95" cy="85" r="60" fill="#FFEDD5" opacity="0.6" />

        {/* Floating Code Badge </> */}
        <g transform="translate(136, 52)">
          <circle cx="16" cy="16" r="16" fill="url(#badgeGrad)" stroke="#FDBA74" strokeWidth="1.5" />
          <path d="M12 11L7 16L12 21" stroke="#EA580C" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M15 21L17 11" stroke="#FB923C" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M20 11L25 16L20 21" stroke="#EA580C" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {/* Head & Neck */}
        <path d="M90 92C90 92 86 112 102 112C118 112 114 92 114 92Z" fill="url(#skinGrad)" />
        <ellipse cx="102" cy="74" rx="20" ry="24" fill="url(#skinGrad)" />

        {/* Ears */}
        <ellipse cx="82" cy="75" rx="4" ry="7" fill="url(#skinGrad)" />
        <ellipse cx="122" cy="75" rx="4" ry="7" fill="url(#skinGrad)" />

        {/* Hair - 3D textured styling */}
        <path d="M83 68C81 50 94 38 103 38C116 38 124 49 122 66C120 54 114 47 104 47C94 47 88 56 83 68Z" fill="url(#hairGrad)" />
        <path d="M81 65C83 58 87 53 96 52C88 56 84 62 82 70L81 65Z" fill="#171717" />
        <path d="M96 46C103 44 113 46 121 54C118 49 110 44 100 44C92 44 87 47 84 52C87 49 91 47 96 46Z" fill="#404040" />

        {/* Face Features: Eyebrows, Eyes, Smile */}
        <path d="M89 67C92 65 96 66 97 68" stroke="#1F2937" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M107 68C108 66 112 65 115 67" stroke="#1F2937" strokeWidth="1.8" strokeLinecap="round" />
        <ellipse cx="93" cy="73" rx="2.5" ry="3.2" fill="#1F2937" />
        <ellipse cx="111" cy="73" rx="2.5" ry="3.2" fill="#1F2937" />
        <circle cx="94" cy="72" r="0.8" fill="#FFFFFF" />
        <circle cx="112" cy="72" r="0.8" fill="#FFFFFF" />
        <path d="M102 75V79H104" stroke="#D97706" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M96 83C99 87 105 87 108 83" stroke="#9A3412" strokeWidth="1.8" strokeLinecap="round" />

        {/* Orange Hoodie Body */}
        <path d="M68 152C70 128 80 108 102 108C124 108 134 128 136 152L68 152Z" fill="url(#hoodieGrad)" />
        {/* Hoodie Strings & Collar */}
        <path d="M94 108C94 116 99 122 102 122C105 122 110 116 110 108" fill="#C2410C" />
        <path d="M97 122V136" stroke="#FED7AA" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M107 122V134" stroke="#FED7AA" strokeWidth="1.8" strokeLinecap="round" />

        {/* Arms angled to laptop */}
        <path d="M68 152C66 136 78 128 90 136L102 144" stroke="url(#hoodieGrad)" strokeWidth="16" strokeLinecap="round" />
        <path d="M136 152C138 136 126 128 114 136L104 144" stroke="url(#hoodieGrad)" strokeWidth="16" strokeLinecap="round" />

        {/* Open Laptop Screen */}
        <g transform="translate(68, 126)">
          {/* Laptop Base */}
          <path d="M10 32L62 32L68 40L4 40Z" fill="#94A3B8" />
          <path d="M12 33L60 33L64 38L8 38Z" fill="#CBD5E1" />
          {/* Laptop Screen (angled back) */}
          <path d="M18 6L54 6L60 32L12 32Z" fill="url(#laptopGrad)" stroke="#64748B" strokeWidth="1.2" />
          {/* Apple / Logo motif */}
          <ellipse cx="36" cy="18" rx="3.5" ry="4" fill="#FFFFFF" opacity="0.9" />
          <path d="M37 13.5C36.5 12.5 35 12 35 12" stroke="#FFFFFF" strokeWidth="0.8" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
};

export const BusyProIllustration: React.FC<{ className?: string }> = ({ className = "w-44 h-44" }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 200 180" className="w-full h-full drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="suitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>
          <linearGradient id="skinGradPro" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FED7AA" />
            <stop offset="100%" stopColor="#FDBA74" />
          </linearGradient>
          <linearGradient id="badgeGradPro" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF7ED" />
            <stop offset="100%" stopColor="#FED7AA" />
          </linearGradient>
        </defs>

        {/* Ambient subtle back glow */}
        <circle cx="100" cy="85" r="60" fill="#E2E8F0" opacity="0.5" />

        {/* Floating Bar Chart Badge */}
        <g transform="translate(136, 52)">
          <circle cx="16" cy="16" r="16" fill="url(#badgeGradPro)" stroke="#FDBA74" strokeWidth="1.5" />
          {/* 3 ascending bars in warm orange */}
          <rect x="9" y="18" width="3.5" height="6" rx="1" fill="#F97316" />
          <rect x="14.5" y="14" width="3.5" height="10" rx="1" fill="#EA580C" />
          <rect x="20" y="10" width="3.5" height="14" rx="1" fill="#C2410C" />
        </g>

        {/* Neck */}
        <path d="M92 92C92 92 88 112 100 112C112 112 108 92 108 92Z" fill="url(#skinGradPro)" />
        {/* Head */}
        <ellipse cx="100" cy="74" rx="19" ry="23" fill="url(#skinGradPro)" />

        {/* Ears */}
        <ellipse cx="81" cy="75" rx="3.5" ry="6" fill="url(#skinGradPro)" />
        <ellipse cx="119" cy="75" rx="3.5" ry="6" fill="url(#skinGradPro)" />

        {/* Professional Haircut */}
        <path d="M82 66C80 48 93 36 100 36C112 36 120 46 118 64C116 52 110 44 100 44C91 44 85 54 82 66Z" fill="#18181B" />
        <path d="M80 62C83 54 90 48 100 48C90 51 84 57 82 66L80 62Z" fill="#09090B" />

        {/* Glasses */}
        <rect x="85" y="68" width="12" height="10" rx="3" stroke="#0F172A" strokeWidth="2" fill="#FFFFFF" fillOpacity="0.3" />
        <rect x="103" y="68" width="12" height="10" rx="3" stroke="#0F172A" strokeWidth="2" fill="#FFFFFF" fillOpacity="0.3" />
        <path d="M97 72H103" stroke="#0F172A" strokeWidth="2" />
        <path d="M85 71L81 70" stroke="#0F172A" strokeWidth="1.5" />
        <path d="M115 71L119 70" stroke="#0F172A" strokeWidth="1.5" />

        {/* Eyes behind glasses */}
        <circle cx="91" cy="73" r="2.2" fill="#1E293B" />
        <circle cx="109" cy="73" r="2.2" fill="#1E293B" />
        <circle cx="91.8" cy="72.2" r="0.7" fill="#FFFFFF" />
        <circle cx="109.8" cy="72.2" r="0.7" fill="#FFFFFF" />

        {/* Smile */}
        <path d="M95 84C98 87 102 87 105 84" stroke="#9A3412" strokeWidth="1.8" strokeLinecap="round" />

        {/* White Shirt Collar & Tie */}
        <path d="M86 108L100 128L114 108Z" fill="#FFFFFF" />
        <path d="M97 114L100 138L103 114Z" fill="#EA580C" />

        {/* Navy Blazer / Suit */}
        <path d="M68 152C70 124 82 108 100 108C118 108 130 124 132 152L68 152Z" fill="url(#suitGrad)" />
        {/* Suit Lapels */}
        <path d="M78 114L94 136L86 152" stroke="#334155" strokeWidth="3" fill="none" />
        <path d="M122 114L106 136L114 152" stroke="#334155" strokeWidth="3" fill="none" />

        {/* Open Laptop */}
        <g transform="translate(68, 126)">
          <path d="M10 32L62 32L68 40L4 40Z" fill="#94A3B8" />
          <path d="M12 33L60 33L64 38L8 38Z" fill="#CBD5E1" />
          <path d="M18 6L54 6L60 32L12 32Z" fill="#CBD5E1" stroke="#64748B" strokeWidth="1.2" />
          <ellipse cx="36" cy="18" rx="3.5" ry="4" fill="#FFFFFF" opacity="0.9" />
          <path d="M37 13.5C36.5 12.5 35 12 35 12" stroke="#FFFFFF" strokeWidth="0.8" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
};

export const PersonalGrowthIllustration: React.FC<{ className?: string }> = ({ className = "w-44 h-44" }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 200 180" className="w-full h-full drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="womanHair" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#291A14" />
            <stop offset="100%" stopColor="#1C110C" />
          </linearGradient>
          <linearGradient id="womanSkin" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FED7AA" />
            <stop offset="100%" stopColor="#FDBA74" />
          </linearGradient>
          <linearGradient id="womanTop" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FB923C" />
            <stop offset="100%" stopColor="#EA580C" />
          </linearGradient>
          <linearGradient id="badgeGradLeaf" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF7ED" />
            <stop offset="100%" stopColor="#FFEDD5" />
          </linearGradient>
        </defs>

        {/* Ambient subtle back glow */}
        <circle cx="100" cy="85" r="60" fill="#FFEDD5" opacity="0.6" />

        {/* Floating Leaf / Wellness Badge */}
        <g transform="translate(136, 52)">
          <circle cx="16" cy="16" r="16" fill="url(#badgeGradLeaf)" stroke="#FDBA74" strokeWidth="1.5" />
          {/* Stylized golden/orange leaves */}
          <path d="M12 21C12 15 17 12 22 12C22 17 19 21 12 21Z" fill="#F97316" />
          <path d="M12 21C15 17 18 16 22 12" stroke="#EA580C" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M16 13C16 10 19 8 22 8C22 11 20 13 16 13Z" fill="#FB923C" />
        </g>

        {/* Back Hair falling over shoulders */}
        <path d="M72 80C70 110 74 138 82 152L118 152C126 138 130 110 128 80Z" fill="url(#womanHair)" />

        {/* Neck */}
        <path d="M92 92C92 92 88 112 100 112C112 112 108 92 108 92Z" fill="url(#womanSkin)" />
        {/* Head */}
        <ellipse cx="100" cy="74" rx="19" ry="22" fill="url(#womanSkin)" />

        {/* Ears */}
        <ellipse cx="81" cy="75" rx="3.5" ry="6" fill="url(#womanSkin)" />
        <ellipse cx="119" cy="75" rx="3.5" ry="6" fill="url(#womanSkin)" />

        {/* Front Long Hair Framing Face */}
        <path d="M81 68C78 48 92 36 100 36C112 36 122 46 119 68C117 56 112 46 100 46C88 46 84 56 81 68Z" fill="url(#womanHair)" />
        <path d="M78 68C76 90 79 116 84 136C87 116 84 88 84 72L78 68Z" fill="#1C110C" />
        <path d="M122 68C124 90 121 116 116 136C113 116 116 88 116 72L122 68Z" fill="#1C110C" />

        {/* Mindful Serene Face: Closed Eyelids, Gentle Smile */}
        <path d="M89 67C92 65 96 66 97 68" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M103 68C104 66 108 65 111 67" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" />
        {/* Serene curved closed lashes */}
        <path d="M89 74C91 77 95 77 97 74" stroke="#1F2937" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M103 74C105 77 109 77 111 74" stroke="#1F2937" strokeWidth="2.2" strokeLinecap="round" />

        <path d="M100 76V80H102" stroke="#D97706" strokeWidth="1.2" strokeLinecap="round" />
        {/* Peaceful soft smile */}
        <path d="M94 84C97 88 103 88 106 84" stroke="#9A3412" strokeWidth="1.8" strokeLinecap="round" />

        {/* Terracotta/Peach Top */}
        <path d="M70 152C72 126 84 110 100 110C116 110 128 126 130 152L70 152Z" fill="url(#womanTop)" />
        <path d="M88 110C92 120 100 124 100 124C100 124 108 120 112 110" stroke="#FDBA74" strokeWidth="2" fill="none" />
      </svg>
    </div>
  );
};

export const BotanicalBranch3D: React.FC<{ className?: string }> = ({ className = "w-44 h-44" }) => {
  return (
    <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="stemCopper" x1="100%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#8D3818" />
          <stop offset="100%" stopColor="#C4734D" />
        </linearGradient>
        <linearGradient id="leafGrad1" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#B3522C" />
          <stop offset="50%" stopColor="#D97F56" />
          <stop offset="100%" stopColor="#F5A882" />
        </linearGradient>
        <linearGradient id="leafGrad2" x1="100%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#9C3F1B" />
          <stop offset="60%" stopColor="#CC6D45" />
          <stop offset="100%" stopColor="#EDB093" />
        </linearGradient>
        <filter id="leafShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#7C2D12" floodOpacity="0.2" />
        </filter>
      </defs>
      
      {/* Central Curved Stem */}
      <path d="M195 195 Q 145 135 110 55" stroke="url(#stemCopper)" strokeWidth="4" strokeLinecap="round" />
      
      {/* Top Center Leaf */}
      <g filter="url(#leafShadow)">
        <path d="M110 55 C 105 25 120 10 135 20 C 150 30 140 50 110 55 Z" fill="url(#leafGrad1)" />
        <path d="M110 55 Q 125 35 135 20" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.4" />
      </g>
      
      {/* Top Left Leaf */}
      <g filter="url(#leafShadow)">
        <path d="M130 90 C 85 70 70 90 75 110 C 80 130 110 120 130 90 Z" fill="url(#leafGrad2)" />
        <path d="M130 90 Q 100 100 75 110" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.4" />
      </g>
      
      {/* Mid Left Leaf */}
      <g filter="url(#leafShadow)">
        <path d="M150 130 C 95 130 80 155 95 175 C 110 190 140 160 150 130 Z" fill="url(#leafGrad1)" />
        <path d="M150 130 Q 115 150 95 175" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.4" />
      </g>
      
      {/* Mid Right Leaf */}
      <g filter="url(#leafShadow)">
        <path d="M135 80 C 165 55 185 70 185 90 C 185 110 155 105 135 80 Z" fill="url(#leafGrad1)" />
        <path d="M135 80 Q 165 80 185 90" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.4" />
      </g>
      
      {/* Bottom Right Leaf */}
      <g filter="url(#leafShadow)">
        <path d="M160 120 C 190 100 205 120 200 140 C 195 160 170 150 160 120 Z" fill="url(#leafGrad2)" />
        <path d="M160 120 Q 185 130 200 140" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.4" />
      </g>
    </svg>
  );
};

export const BotanicalDeco: React.FC<{ className?: string }> = ({ className = "w-48 h-48" }) => {
  return <BotanicalBranch3D className={className} />;
};
