nano = require("nano")("http://localhost:5984/")
// nano.db.get("catlog", function(e, body) {
//   console.log(body);
// })


db = nano.db.use("catlog")
db.insert({"_id":"_design/timeline","language":"javascript","views":{"by_timestamp":{"map":"function(doc) {\n  emit(doc.timestamp, null);\n}"}}}, function(e, resp) {
  
  console.log(e, resp);
  
});
