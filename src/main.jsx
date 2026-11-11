/* IC Atacama — entrada del navegador: estilos e hidratación de las islas interactivas */
import '@fontsource-variable/archivo/wdth.css';
import './css/styles.css';
import { hydrateRoot } from 'react-dom/client';
import { SiteContext } from './context.jsx';
import { ISLANDS } from './islands.js';

for (const el of document.querySelectorAll('[data-island]')) {
  const Component = ISLANDS[el.dataset.island];
  const script = document.querySelector(`script[data-island-props="${CSS.escape(el.id)}"]`);
  if (!Component || !script) continue;
  let props;
  try {
    props = JSON.parse(script.textContent);
  } catch {
    continue; // HTML alterado: se deja el contenido estático tal cual
  }
  hydrateRoot(el, (
    <SiteContext.Provider value={{ base: props.base || '/' }}>
      <Component {...props} />
    </SiteContext.Provider>
  ));
}
