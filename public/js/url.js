function encode(string) {
  return encodeURIComponent(string).replace(/%20/g, '+');
}

function decode(string) {
  return decodeURIComponent(string.replace(/\+/g, '%20'));
}

exports.updateUrlParams = (params) => {
  window.location.hash = params.map(encode).join('/');
};

exports.readUrlParams = () => {
  return window.location.hash.replace(/^#\/?|\/$/g, '').split('/').map(decode);
};
