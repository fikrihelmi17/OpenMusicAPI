/* eslint-disable camelcase */

exports.up = (pgm) => {
  // create authentications table
  pgm.createTable('authentications', {
    token: {
      type: 'TEXT',
      notNull: true,
    },
  });
};

exports.down = (pgm) => {
  // drop authentications table
  pgm.dropTable('authentications');
};
