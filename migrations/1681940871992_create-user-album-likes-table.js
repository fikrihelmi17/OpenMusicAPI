/* eslint-disable camelcase */

exports.up = (pgm) => {
  // create user_album_likes table
  pgm.createTable('user_album_likes', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    album_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
  });

  // add unique constraint for user_id and album_id column
  pgm.addConstraint('user_album_likes', 'unique_user_id_and_album_id', 'UNIQUE(user_id, album_id)');

  // add foreign key constraint to user_id column that references to id column in users table
  pgm.addConstraint('user_album_likes', 'fk_user_album_likes.user_id', 'FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE');

  // add foreign key constraint to album_id column that references to id column in albums table
  pgm.addConstraint('user_album_likes', 'fk_user_album_likes.album_id', 'FOREIGN KEY(album_id) REFERENCES albums(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  // drop the unique constraint
  pgm.dropConstraint('user_album_likes', 'unique_user_id_and_album_id');

  // drop the fk_user_album_likes.album_id constraint
  pgm.dropConstraint('user_album_likes', 'fk_user_album_likes.album_id');

  // drop the fk_user_album_likes.user_id constraint
  pgm.dropConstraint('user_album_likes', 'fk_user_album_likes.user_id');

  // drop the user_album_likes table
  pgm.dropTable('user_album_likes');
};
