
const Command = {
  CROP: 'crop',
  DEFAULT: 'max',
};

const MimeType = {
  GIF: 'image/gif',
  JPEG: 'image/jpeg',
  PNG: 'image/png',
};

const Param = {
  COMMAND: 'c',
  SIZE: 's',
  TYPE: 't',
};

const ImageType = {
  MAP: 'map',
};

const ImageQuality = {
  DEFAULT: 60,
  [ImageType.MAP]: 75,
};

module.exports = {
  Command,
  MimeType,
  Param,
  ImageType,
  ImageQuality
};
