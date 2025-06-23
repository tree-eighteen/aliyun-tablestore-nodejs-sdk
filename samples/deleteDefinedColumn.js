var client = require('./client');

var params = {
    tableName: 'sampleTable',
    columns: ['col1', 'col2', 'col3']
};

client.deleteDefinedColumn(params, function (err, data) {
    if (err) {
        console.log('error:', err);
        return;
    }
    console.log('success:', data);
});
