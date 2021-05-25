

function decodePolygon(coordinate, encodeOffsets, encodeScale) {
  var result = [];
  var prevX = encodeOffsets[0];
  var prevY = encodeOffsets[1];

  for (var i = 0; i < coordinate.length; i += 2) {
    var x = coordinate.charCodeAt(i) - 64;
    var y = coordinate.charCodeAt(i + 1) - 64;
    // ZigZag decoding
    x = (x >> 1) ^ -(x & 1);
    y = (y >> 1) ^ -(y & 1);
    // Delta deocding
    x += prevX;
    y += prevY;

    prevX = x;
    prevY = y;
    // Dequantize
    result.push([x / encodeScale, y / encodeScale]);
  }

  return result;
}

function decodeGeo(jsonCompressed) {
  if (!jsonCompressed.UTF8Encoding) {
    return jsonCompressed;
  }
  const encodeScale = jsonCompressed.UTF8Scale || 1024;
  const features = jsonCompressed.features;

  for (let f = 0; f < features.length; f++) {
    const feature = features[f];
    const geometry = feature.geometry;

    if (geometry.type === 'Polygon') {
      const coordinates = geometry.coordinates;
      for (let c = 0; c < coordinates.length; c++) {
        coordinates[c] = decodePolygon(coordinates[c], geometry.encodeOffsets[c], encodeScale);
      }
    } else if (geometry.type === 'MultiPolygon') {
      const coordinates = geometry.coordinates;
      for (let c = 0; c < coordinates.length; c++) {
        const coordinate = coordinates[c];
        for (let c2 = 0; c2 < coordinate.length; c2++) {
          coordinate[c2] = decodePolygon(
            coordinate[c2],
            geometry.encodeOffsets[c][c2],
            encodeScale
          );
        }
      }
    }
  }
  // Has been decoded
  jsonCompressed.UTF8Encoding = false;

  return jsonCompressed;
}


export {
  decodeGeo
}
