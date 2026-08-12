// On-brand flat-vector classroom illustration for the top of a batch card.
// Recreated in our palette (NOT a competitor image): dark navy room, a
// whiteboard showing the batch's exam name in gold, a simple teacher figure,
// and small gold accents (clock, book, plant). The exam name is a prop, so
// each card's board text matches its batch. Pure SVG → scales without cropping
// the whiteboard text at any card width.
export function BatchCardArt({ examName }: { examName: string }) {
  return (
    <svg
      viewBox="0 0 400 200"
      role="img"
      aria-label={`Illustration of a classroom with a whiteboard reading ${examName}`}
      className="block h-auto w-full"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <radialGradient id="boardGlow" cx="0.5" cy="0.5" r="0.6">
          <stop offset="0" stopColor="#c5a36b" stopOpacity="0.18" />
          <stop offset="1" stopColor="#c5a36b" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0b1220" />
          <stop offset="1" stopColor="#070c16" />
        </linearGradient>
      </defs>

      {/* Room */}
      <rect width="400" height="200" fill="url(#wall)" />
      <rect y="162" width="400" height="38" fill="#030712" />
      <line x1="0" y1="162" x2="400" y2="162" stroke="#c5a36b" strokeOpacity="0.12" />

      {/* Soft gold glow behind the board */}
      <ellipse cx="150" cy="80" rx="150" ry="80" fill="url(#boardGlow)" />

      {/* Whiteboard */}
      <rect x="42" y="30" width="216" height="100" rx="8" fill="#030712" stroke="#c5a36b" strokeOpacity="0.5" />
      <rect x="42" y="30" width="216" height="100" rx="8" fill="none" stroke="#ffffff" strokeOpacity="0.05" />
      {/* board tray */}
      <rect x="70" y="132" width="160" height="4" rx="2" fill="#c5a36b" fillOpacity="0.5" />
      <text
        x="150"
        y="86"
        textAnchor="middle"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontStyle="italic"
        fontSize="30"
        fill="#c5a36b"
      >
        {examName}
      </text>
      <line x1="92" y1="102" x2="208" y2="102" stroke="#c5a36b" strokeOpacity="0.35" strokeWidth="2" />

      {/* Teacher figure */}
      <g opacity="0.9">
        <circle cx="318" cy="66" r="14" fill="#96a9ce" />
        <path d="M296 150c0-24 10-42 22-42s22 18 22 42z" fill="#96a9ce" />
        {/* pointing arm toward the board */}
        <rect x="276" y="88" width="30" height="7" rx="3.5" transform="rotate(-12 276 88)" fill="#96a9ce" />
      </g>

      {/* Accents — clock */}
      <g transform="translate(360 44)">
        <circle r="13" fill="none" stroke="#c5a36b" strokeWidth="2" />
        <line x1="0" y1="0" x2="0" y2="-7" stroke="#c5a36b" strokeWidth="2" strokeLinecap="round" />
        <line x1="0" y1="0" x2="6" y2="2" stroke="#c5a36b" strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* Accents — book on the floor */}
      <g transform="translate(40 150)">
        <rect x="-16" y="0" width="34" height="6" rx="1.5" fill="#c5a36b" fillOpacity="0.85" />
        <rect x="-13" y="-6" width="34" height="6" rx="1.5" fill="#c5a36b" fillOpacity="0.6" />
      </g>

      {/* Accents — plant */}
      <g transform="translate(372 150)">
        <path d="M-4 0h8l-1.5 12h-5z" fill="#c5a36b" fillOpacity="0.7" />
        <path d="M0 0c-6-4-8-12-3-16 2 5 5 8 3 16z" fill="#96a9ce" fillOpacity="0.8" />
        <path d="M0 0c6-4 8-12 3-16-2 5-5 8-3 16z" fill="#96a9ce" fillOpacity="0.6" />
      </g>
    </svg>
  );
}
