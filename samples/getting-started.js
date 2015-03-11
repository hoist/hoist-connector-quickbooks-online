/* Just copy and paste this snippet into your code */

module.exports = function (req, res, done) {

  var QBO = Hoist.connector("<key>");

  return QBO.get('/CompanyInfo/<CompanyId>')
    .then(function (CompanyInfo) {
      return Hoist.event.raise('COMPANYINFO:FOUND', CompanyInfo);
    }).then(function () {
      done();
    });

};
