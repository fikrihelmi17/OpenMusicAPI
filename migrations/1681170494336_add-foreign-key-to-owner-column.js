/* eslint-disable camelcase */

exports.up = (pgm) => {
  // insert value of old_playlist to users table
  pgm.sql("INSERT INTO users(id, username, password, fullname) VALUES ('old_playlist', 'old_playlist', 'old_playlist', 'old_playlist')");

  // update value of old_playlist to owner column in playlists table
  pgm.sql("UPDATE playlists SET owner = 'old_playlist' WHERE owner IS NULL");

  // add foreign key constraint for owner that references to id column in users table
  pgm.addConstraint('playlists', 'fk_playlists.owner_users.id', 'FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  // drop the foreign key constraint in playlists table
  pgm.dropConstraint('playlists', 'fk_playlists.owner_users.id');

  // update value if NULL to owner column in playlists table
  pgm.sql("UPDATE playlists SET owner = NULL WHERE owner = 'old_playlists'");

  // delete rows that contains id of old_playlist
  pgm.sql("DELETE FROM users WHERE id = 'old_playlist'");
};
