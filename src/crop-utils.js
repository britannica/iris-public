
const axios = require('axios');
const { GOOGLE_API_KEY } = process.env;

/*const visionClient = new vision.ImageAnnotatorClient({
  credentials: JSON.parse(GOOGLE_APPLICATION_CREDENTIALS),
});

visionClient.cropHints(data.Body)
  .then(results => console.log(results));*/

module.exports = {
  /**
   * Request crop hints from the Google Vision API
   *
   * @param {Buffer} buffer
   * @param {number} width
   * @param {number} height
   * @returns {Promise<*>}
   */

  async requestCropHints(buffer, width, height) {
    return axios.post(`https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_API_KEY}`, {
      requests: [{
        image: {
          content: buffer.toString('base64'),
        },
        features: [{
          type: 'CROP_HINTS'
        }],
        imageContext: {
          cropHintsParams: {
            aspectRatios: [width / height]
          }
        }
      }],
    });
  },


  /**
   * Create the options required by sharp.extract()
   * http://sharp.pixelplumbing.com/en/stable/api-operation/#extract
   *
   * @param {AnnotateImageResponse} annotateImageResponse
   * @returns {object}
   */

  getExtractOptions(annotateImageResponse) {
    const vertices = annotateImageResponse.data.responses[0].cropHintsAnnotation.cropHints[0].boundingPoly.vertices;
    const left = vertices[0].x || 0;
    const top = vertices[0].y || 0;

    return {
      left,
      top,
      width: vertices[2].x - left,
      height: vertices[2].y - top,
    };
  }
};
