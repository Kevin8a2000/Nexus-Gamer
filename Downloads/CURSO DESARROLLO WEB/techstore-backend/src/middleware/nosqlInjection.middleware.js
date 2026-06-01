// ─────────────────────────────────────────────
// MIDDLEWARE DE SANITIZACIÓN - PREVENCIÓN DE NoSQL INJECTION
// ─────────────────────────────────────────────
// Filtra caracteres y operadores peligrosos de MongoDB

/**
 * Previene inyección NoSQL eliminando operadores peligrosos
 * Ejemplo: { $gt: "", $regex: ".*" } → {} (vaciado)
 */
const sanitizarNoSQL = (obj) => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  // Operadores peligrosos de MongoDB a filtrar
  const operadoresPeligrosos = [
    '$gt', '$gte', '$lt', '$lte', '$ne', '$in', '$nin',
    '$and', '$or', '$not', '$nor', '$where', '$regex',
    '$exists', '$type', '$mod', '$text', '$geoWithin',
    '$geoIntersects', '$near', '$nearSphere', '$elemMatch',
    '$size', '$all', '$slice', '$elemMatch', '$js'
  ];

  // Procesar arrays
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizarNoSQL(item));
  }

  // Procesar objetos
  const resultado = {};
  for (const clave in obj) {
    // Rechazar claves que comiencen con $
    if (clave.startsWith('$')) {
      console.warn(`⚠️ Operador potencialmente peligroso detectado: ${clave}`);
      continue;
    }

    // Rechazar claves en la lista de operadores peligrosos
    if (operadoresPeligrosos.includes(clave)) {
      console.warn(`⚠️ Operador bloqueado: ${clave}`);
      continue;
    }

    // Procesar recursivamente objetos anidados
    if (typeof obj[clave] === 'object' && obj[clave] !== null) {
      resultado[clave] = sanitizarNoSQL(obj[clave]);
    } else {
      resultado[clave] = obj[clave];
    }
  }

  return resultado;
};

/**
 * Middleware: Sanitiza body, query y params
 * Previene inyección NoSQL
 */
const middlewareSanitizarNoSQL = (req, res, next) => {
  // Sanitizar body
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizarNoSQL(req.body);
  }

  // Sanitizar query
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizarNoSQL(req.query);
  }

  // Sanitizar params
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizarNoSQL(req.params);
  }

  next();
};

module.exports = {
  sanitizarNoSQL,
  middlewareSanitizarNoSQL
};
