/* Just copy and paste this snippet into your code */
/* create a credit memo */
module.exports = function (req, res, done) {

  var creditMemo = {
    "Line": [{
      "Amount": 50,
      "DetailType": "SalesItemLineDetail",
      "SalesItemLineDetail": {
        "ItemRef": {
          "value": "3",
          "name": "Concrete"
        }
      }
    }],
    "CustomerRef": {
      "value": "3",
      "name": "CoolCars"
    }
  };
  var QBO = Hoist.connector("<key>");

  //create a credit memo,
  return QBO.create('/creditmemo', creditMemo)
    .then(function (response) {
      Hoist.log('credit memo posted', response);
    }).then(function () {
      done();
    });

};

/* update an credit memo */
module.exports = function (req, res, done) {

  var creditMemo = {
    "Id": 33,
    "SyncToken": 0,
    "Line": [{
      "Amount": 50,
      "DetailType": "SalesItemLineDetail",
      "SalesItemLineDetail": {
        "ItemRef": {
          "value": "3",
          "name": "Concrete"
        }
      }
    }],
    "CustomerRef": {
      "value": "3",
      "name": "CoolCars"
    }
  };
  var QBO = Hoist.connector("<key>");

  //update the credit memo
  return QBO.update('/creditmemo', creditMemo)
    .then(function (response) {
      Hoist.log('credit memo posted', response);
    }).then(function () {
      done();
    });

};

/* get a credit memo */
module.exports = function (req, res, done) {

  var QBO = Hoist.connector("<key>");

  //get the credit memom
  return QBO.get('/creditmemo/33')
    .then(function (response) {
      Hoist.log('credit memo retrieved', response);
    }).then(function () {
      done();
    });

};


/* delete a credit memo */
module.exports = function (req, res, done) {
  var creditMemo = {
    "Id": 33,
    "SyncToken": 0
  };

  var QBO = Hoist.connector("<key>");

  //delete the credit memo
  return QBO.delete('/creditmemo', creditMemo)
    .then(function (response) {
      Hoist.log('credit memo deleted', response);
    }).then(function () {
      done();
    });

};
