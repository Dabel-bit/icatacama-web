/* Contexto compartido: datos del sitio, base pública y entorno. En el navegador solo se usa `base`. */
import { createContext, useContext } from 'react';
import { withBase } from './lib/site.js';

export const SiteContext = createContext({ site: null, data: null, base: '/', env: 'production', csp: null });

export function useSite() {
  return useContext(SiteContext);
}

// Devuelve una función que antepone la base pública a rutas internas ("/equipos/x/" → "/repo/equipos/x/")
export function useHref() {
  const { base } = useSite();
  return (path) => withBase(base, path);
}
