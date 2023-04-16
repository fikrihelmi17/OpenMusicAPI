const Joi = require('joi');

const PlaylistPayloadScema = Joi.object({
  name: Joi.string().required(),
});

const SongOnPlaylistSchema = Joi.object({
  songId: Joi.string().required(),
});

module.exports = { PlaylistPayloadScema, SongOnPlaylistSchema };
