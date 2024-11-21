// QR Code Mappings from an integer to a URL
// Allows us to put up physical QR codes with short links like
// map.tahoebike.org/qr/1
// and redirect to arbitrary specific links from there.

function lookupQRIndex(idx) {
    mapping = {
        '1': '/#1705+lake+tahoe+blvd/1705+lake+tahoe+blvd/1',
        '2': '/#1706+lake+tahoe+blvd/1706+lake+tahoe+blvd/1',
        '3': '/#1000+Emerald+Bay+Rd/1000+Emerald+Bay+Rd/1',
    }
    return mapping[idx] || '/';
}

module.exports = { lookupQRIndex };
