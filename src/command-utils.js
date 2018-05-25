
const sharp = require('sharp');
const { Command } = require('./constants');
const { requestCropHints, getExtractOptions } = require('./crop-utils');

module.exports = {
  /**
   * Manipulate the image based on the image config
   *
   * @param {Buffer} buffer
   * @param {object} imageConfig
   * @returns {Promise<Buffer>}
   */

  async performCommand(buffer, imageConfig) {
    const image = sharp(buffer);
    const { height, width, command, quality } = imageConfig;

    image.withoutEnlargement();

    switch (command) {
      case Command.CROP:
        // No need to request crop vertices if no dimensions were specified

        if (height === null && width === null) {
          break;
        }


        // Get crop vertices from Google and transform the response into values that Sharp can use

        const annotateImageResponse = await requestCropHints(buffer, width, height);
        const extractOptions = getExtractOptions(annotateImageResponse);

        image.extract(extractOptions);

        break;

      case Command.DEFAULT:
      default:
        image.max();
    }

    if (height && width) {
      image.resize(width, height);
    }

    return image
      .toFormat('jpg')
      .jpeg({ quality })
      .toBuffer();
  },
};