/* Just copy and paste this snippet into your code */
/* create an invoice */
module.exports = function (req, res, done) {

  var invoice = {
    "Line": [{
      "Amount": 100.00,
      "DetailType": "SalesItemLineDetail",
      "SalesItemLineDetail": {
        "ItemRef": {
          "value": "1",
          "name": "Services"
        }
      }
    }],
    "CustomerRef": {
      "value": "21"
    }
  };
  var QBO = Hoist.connector("<key>");

  //create an invoices
  return QBO.create('/invoice', invoice)
    .then(function (response) {
      Hoist.log('invoice posted');
    }).then(function () {
      done();
    });

};

/* update an invoice */
module.exports = function (req, res, done) {

  var invoice = {
    "Id": 33,
    "SyncToken": 0,
    "Line": [{
      "Amount": 100.00,
      "DetailType": "SalesItemLineDetail",
      "SalesItemLineDetail": {
        "ItemRef": {
          "value": "1",
          "name": "Services"
        }
      }
    }],
    "CustomerRef": {
      "value": "21"
    }
  };
  var QBO = Hoist.connector("<key>");

  //update the invoices
  return QBO.update('/invoice', invoice)
    .then(function (response) {
      Hoist.log('invoice posted');
    }).then(function () {
      done();
    });

};

/* get an invoice */
module.exports = function (req, res, done) {

  var QBO = Hoist.connector("<key>");

  //get the invoices
  return QBO.get('/invoice/33')
    .then(function (response) {
      Hoist.log('invoice retrieved');
    }).then(function () {
      done();
    });

};


/* delete an invoice */
module.exports = function (req, res, done) {
  var invoice = {
    "Id": 33,
    "SyncToken": 0
  };

  var QBO = Hoist.connector("<key>");

  //delete the invoices
  return QBO.delete('/invoice', invoice)
    .then(function (response) {
      Hoist.log('invoice posted');
    }).then(function () {
      done();
    });

};
