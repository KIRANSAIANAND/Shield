import { useNavigate } from 'react-router-dom'

function ShieldLogo({ size = 32 }) {
     return (
          <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
               <path d="M20 2L36 9V21C36 30 28 37 20 39C12 37 4 30 4 21V9L20 2Z" fill="#1d6ff3" />
               <path d="M20 2L36 9V21C36 30 28 37 20 39C12 37 4 30 4 21V9L20 2Z" fill="url(#shield-grad)" />
               <text x="50%" y="58%" textAnchor="middle" fill="white" fontSize="16" fontWeight="800" fontFamily="Inter" dy=".1em">S</text>
               <defs>
                    <linearGradient id="shield-grad" x1="20" y1="2" x2="20" y2="39" gradientUnits="userSpaceOnUse">
                         <stop stopColor="#1d6ff3" />
                         <stop offset="1" stopColor="#00d4ff" />
                    </linearGradient>
               </defs>
          </svg>
     )
}

export default ShieldLogo
