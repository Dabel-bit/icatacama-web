// CloudFront Function (runtime cloudfront-js-2.0) asociada al evento *viewer request*.
// Es el mismo código que incluye deploy/cloudformation.yaml (ViewerRequestFunction); si se edita
// uno, hay que actualizar el otro. Hace cuatro cosas:
//   1. www.icatacama.com (o cualquier otro alias) → https://icatacama.com (301), misma ruta y query.
//   2. Bloquea rutas con "..", "//" o archivos ocultos (salvo /.well-known/) con 404.
//   3. /equipos/torno → /equipos/torno/ (301) para que cada página tenga una sola URL.
//   4. /equipos/torno/ → /equipos/torno/index.html (lo que el bucket privado necesita para servir la página).
var CANONICAL_HOST = 'icatacama.com';

function querystring(request) {
  var q = request.querystring;
  var parts = [];
  for (var k in q) {
    var values = q[k].multiValue ? q[k].multiValue : [q[k]];
    for (var i = 0; i < values.length; i++) {
      parts.push(encodeURIComponent(k) + '=' + encodeURIComponent(values[i].value));
    }
  }
  return parts.length ? '?' + parts.join('&') : '';
}

function redirect(location) {
  return {
    statusCode: 301,
    statusDescription: 'Moved Permanently',
    headers: { location: { value: location } },
  };
}

function handler(event) {
  var request = event.request;
  var uri = request.uri;
  var host = request.headers.host ? request.headers.host.value.toLowerCase() : '';

  if (host && host !== CANONICAL_HOST) {
    return redirect('https://' + CANONICAL_HOST + uri + querystring(request));
  }
  if (uri.indexOf('..') !== -1 || uri.indexOf('//') !== -1 || (uri.indexOf('/.') !== -1 && uri.indexOf('/.well-known/') !== 0)) {
    return { statusCode: 404, statusDescription: 'Not Found' };
  }
  var hasExtension = uri.lastIndexOf('.') > uri.lastIndexOf('/');
  if (!hasExtension) {
    if (uri.charAt(uri.length - 1) !== '/') {
      return redirect('https://' + CANONICAL_HOST + uri + '/' + querystring(request));
    }
    request.uri = uri + 'index.html';
  }
  return request;
}
