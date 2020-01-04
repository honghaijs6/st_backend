

const zkpush = require('./zkpush');
const iclock = require('./iclock') ;

//const mailer = require('./mailer');
//const confirm = require('./confirm');

///const edge = require('./edge')

module.exports = function (app) {


  // ICLOCK
  iclock(app) ;

  // PUSH API
  zkpush(app)  ;

  // END PUSH API
  // MAILER
  //mailer(app);
  // END MAILER
  // CONFRIM LINK
  //confirm(app);
  //edge(app);


};
