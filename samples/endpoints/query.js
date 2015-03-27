/* Just copy and paste this snippet into your code */

module.exports = function (req, res, done) {

  var QBO = Hoist.connector("<key>");

  //select all invoices
  return QBO.get('/query?query="select * from invoice"')
    .then(function (response) {
      //loop through each invoice and raise an event
      response.QueryResponse.Invoice.forEach(function (invoice) {
        return Hoist.event.raise('INVOICE:FOUND', invoice);
      });
    }).then(function () {
      done();
    });

};
