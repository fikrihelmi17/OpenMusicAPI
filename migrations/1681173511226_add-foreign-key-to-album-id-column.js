/* eslint-disable camelcase */

exports.up = (pgm) => {
  // insert value of old_album and 2023 to albums table
  pgm.sql("INSERT INTO albums(id, name, year) VALUES ('old_album', 'old_album', 2023)");

  // update value of old_album to album_id column in songs table
  pgm.sql("UPDATE songs SET album_id = 'old_album' WHERE album_id IS NULL");

  // add foreign key constraint for album_id that references to id column in albums table
  pgm.addConstraint('songs', 'fk_songs.album_id_albums.id', 'FOREIGN KEY(album_id) REFERENCES albums(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  // drop the foreign key constraint
  pgm.dropConstraint('songs', 'fk_songs.album_id_albums.id');

  // update value of NULL to album_id column in songs table
  pgm.sql("UPDATE songs SET album_id = NULL WHERE album_id = 'old_album'");

  // delete rows that contains id of old album
  pgm.sql("DELETE FROM albums WHERE id = 'old_album'");
};
