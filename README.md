# dynamodb-copy-data

copies data from one dynamodb table to another in same region.

---

```npm install dynamodb-copy-data --save```

---
    const Promise = require('bluebird');

    const custom = require('dynamodb-copy-data');

    Promise.coroutine(
        function*() {
            let credentials = {
                accessKeyId: "xxxxxxxxxxxxxxxxxxxx",
                secretAccessKey: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
                region: "us-east-1"
            };

            let result = yield custom.copy("sourceTableName", "destinationTableName", credentials);
            console.log(result);
        }
    )().catch((ex)=> {
        console.log("FINAL EXCEPTION : ", ex);
    });
