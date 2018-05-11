
const { getExtractOptions } = require('./crop-utils');

const annotateImageResponse = {
  data: {
    responses: [{
      cropHintsAnnotation: {
        cropHints: [{
          boundingPoly: {
            vertices: [
              { y: 15 },
              { x: 1078, y: 15 },
              { x: 1078, y: 1103 },
              { y: 1103 },
            ],
          },
        }],
      },
    }],
  },
};

describe('crop-utils', () => {
  describe('#getExtractOptions', () => {
    test('passing an `AnnotateImageResponse` outputs a Sharp#extract options object', () => {
      expect(getExtractOptions(annotateImageResponse)).toEqual({
        left: 0,
        top: 15,
        width: 1078,
        height: 1088,
      });
    });
  });
});
