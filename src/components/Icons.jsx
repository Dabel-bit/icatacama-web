/* Íconos SVG en línea (trazo con el color del texto) */
function Svg({ size, sw, children }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

export const Icons = {
  photo: () => <Svg size={32} sw={1.5}><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="10" r="1.6" /><path d="m21 16-5-5-8 8" /></Svg>,
  pin: () => <Svg size={16} sw={2}><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></Svg>,
  truckSm: () => <Svg size={16} sw={2}><path d="M2 6h11v10H2zM13 9h4l4 4v3h-8" /><circle cx="6" cy="17.5" r="1.8" /><circle cx="17" cy="17.5" r="1.8" /></Svg>,
  arrow: () => <Svg size={16} sw={2}><path d="M5 12h14M13 6l6 6-6 6" /></Svg>,
  back: () => <Svg size={16} sw={2}><path d="M19 12H5M11 18l-6-6 6-6" /></Svg>,
  search: () => <Svg size={20} sw={2}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></Svg>,
  mail: () => <Svg size={20} sw={2}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></Svg>,
  chat: () => <Svg size={20} sw={2}><path d="M21 12a8.5 8.5 0 0 1-12.4 7.6L3 21l1.5-5.3A8.5 8.5 0 1 1 21 12z" /></Svg>,
  bank: () => <Svg size={20} sw={1.8}><path d="M3 10 12 4l9 6M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18" /></Svg>,
  card: () => <Svg size={20} sw={1.8}><rect x="2.5" y="5" width="19" height="14" rx="2" /><path d="M2.5 10h19M6.5 15h4" /></Svg>,
  chart: () => <Svg size={20} sw={1.8}><path d="M4 19V9M10 19V5M16 19v-7M22 19H2" /></Svg>,
  doc: () => <Svg size={20} sw={1.8}><path d="M7 3h7l5 5v13H7z" /><path d="M14 3v5h5M10 13h6M10 17h6" /></Svg>,
  truck: () => <Svg size={20} sw={1.8}><path d="M2 6h11v10H2zM13 9h4l4 4v3h-8" /><circle cx="6" cy="17.5" r="1.8" /><circle cx="17" cy="17.5" r="1.8" /></Svg>,
  store: () => <Svg size={20} sw={1.8}><path d="M3 9 5 4h14l2 5M4 9v11h16V9M3 9h18M9 20v-6h6v6" /></Svg>,
  tools: () => <Svg size={20} sw={1.8}><path d="M14.5 6.5a4 4 0 0 0 5 5L21 13l-8 8-3-3 8-8-1.5-1.5a4 4 0 0 0-5-5l2.5 2.5-2 2-2.5-2.5" /><path d="m3 21 6-6" /></Svg>,
  import: () => <Svg size={20} sw={1.8}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></Svg>,
};

// Ícono por nombre (usado por las "ventajas" de sitio.json); si no existe, muestra el de herramientas
export function Icon({ name }) {
  const C = Icons[name] || Icons.tools;
  return <C />;
}
