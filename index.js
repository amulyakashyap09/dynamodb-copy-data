const AWS = require('aws-sdk');
const Promise = require('bluebird');
AWS.config.setPromisesDependency(Promise);

const scan = (source, dynamoClient)=> {
    return Promise.coroutine(
        function *() {
            let data = yield dynamoClient.scan({
                TableName: source
            }).promise();

            data = data.Items;
            return data;
        }
    )().catch((ex)=> {
        return ex;
    });
};

const bulkWrite = (dynamoClient, destination, itemsToWrite)=> {
    
    let ctr=0;

    let batchRequest = {};

    batchRequest["RequestItems"] = {};
    batchRequest["RequestItems"][destination] = itemsToWrite;

    try {
        dynamoClient.batchWrite(batchRequest).promise();
    } catch (err) {
        console.error("Bulk Write Error : ", err);
    }
};

const createBatch = (bulkData, destination, dynamoClient)=> {

    return Promise.coroutine(
        function *() {

            let items = [];

            for (let j in bulkData) {

                items.push({
                    PutRequest: {Item: bulkData[j]}
                });

                if (items.length == 25) {

                    bulkWrite(dynamoClient, destination, items);
                    items = [];
                }
            }

            if (items.length <= 25) {
                bulkWrite(dynamoClient, destination, items);
            }
            
            return true;
        }
    )().catch((ex)=> {
        return ex;
    });
};

exports.copy = (source, destination, credentials)=> {

    return Promise.coroutine(
        function *() {

            AWS.config.update({
                accessKeyId: credentials.accessKeyId,
                secretAccessKey: credentials.secretAccessKey,
                region: credentials.region
            });

            const dynamoClient = new AWS.DynamoDB.DocumentClient();

            let data;

            try {
                data = yield scan(source, dynamoClient);
            } catch (ex) {
                return {
                    status: false,
                    message: ex,
                    type: "ERROR"
                };
            }

            if (data && data.length > 0) {
                try {
                    yield createBatch(data, destination, dynamoClient);
                    return {
                        status: true,
                        message: "Data copied!!!",
                        type: "SUCCESS"
                    }
                } catch (ex) {
                    return {
                        status: false,
                        message: ex,
                        type: "ERROR"
                    };
                }

            } else {
                return {
                    status: false,
                    message: "No data to copy!",
                    type: "ERROR"
                };
            }
        }
    )().catch((err)=> {
        return {
            status: false,
            message: err,
            type: "ERROR"
        };
    });

};
