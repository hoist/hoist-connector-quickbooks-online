/* Just copy and paste this snippet into your code */
/* create a payment */
module.exports = function (req, res, done) {

  var payment = {
    "CustomerRef": {
      "value": "20",
      "name": "Red Rock Diner"
    },
    "TotalAmt": 55.00,
    "Line": [{
      "Amount": 55.00,
      "LinkedTxn": [{
        "TxnId": "69",
        "TxnType": "Invoice"
      }]
    }]
  };
  var QBO = Hoist.connector("<key>");

  //create a payment,
  return QBO.create('/payment', payment)
    .then(function (response) {
      Hoist.log('payment posted', response);
    }).then(function () {
      done();
    });

};

/* update an payment */
module.exports = function (req, res, done) {

  var payment = {
    "CustomerRef": {
      "value": "16"
    },
    "PaymentMethodRef": {
      "value": "16"
    },
    "PaymentRefNum": "123456",
    "sparse": false,
    "Id": "69",
    "SyncToken": "0",
    "MetaData": {
      "CreateTime": "2013-03-13T14:49:21-07:00",
      "LastUpdatedTime": "2013-03-13T14:49:21-07:00"
    },
    "Line": [{
      "Amount": 300,
      "LinkedTxn": [{
        "TxnId": "67",
        "TxnType": "Invoice"
      }]
    }, {
      "Amount": 300,
      "LinkedTxn": [{
        "TxnId": "68",
        "TxnType": "CreditMemo"
      }]
    }]
  };
  var QBO = Hoist.connector("<key>");

  //update the payment
  return QBO.update('/payment', payment)
    .then(function (response) {
      Hoist.log('payment posted', response);
    }).then(function () {
      done();
    });

};

/* get a payment */
module.exports = function (req, res, done) {

  var QBO = Hoist.connector("<key>");

  //get the paymentm
  return QBO.get('/payment/69')
    .then(function (response) {
      Hoist.log('payment retrieved', response);
    }).then(function () {
      done();
    });

};


/* delete a payment */
module.exports = function (req, res, done) {
  var payment = {
    "Id": 33,
    "SyncToken": 0
  };

  var QBO = Hoist.connector("<key>");

  //delete the payment
  return QBO.delete('/payment', payment)
    .then(function (response) {
      Hoist.log('payment deleted', response);
    }).then(function () {
      done();
    });

};
