// Turns any error into a clear message in Spanish, according to its real cause.
// "resource" describes what was being loaded, e.g. "la lista de Pokémon"
export const getErrorMessage = (err, resource) => {
  switch (err?.kind) {
    case 'timeout':
      return `La API tardó demasiado en responder al cargar ${resource}. Intenta de nuevo.`;
    case 'http':
      return `El servidor respondió con un error (${err.status}) al cargar ${resource}.`;
    case 'data':
      return `La API respondió con datos incompletos al cargar ${resource}.`;
    default:
      return `No se pudo conectar para cargar ${resource}. Revisa tu internet.`;
  }
};