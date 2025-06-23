var TableStore = require('../index.js');
var client = require('./client');

var params = {
    tableName: 'sampleTable',
    columns: [
        {
            name: 'col1',
            type: TableStore.DefinedColumnType.DCT_STRING
        },
        {
            name: 'col2', 
            type: TableStore.DefinedColumnType.DCT_INTEGER
        },
        {
            name: 'col3',
            type: TableStore.DefinedColumnType.DCT_DOUBLE
        },
        {
            name: 'col4',
            type: TableStore.DefinedColumnType.DCT_BOOLEAN
        }
    ]
};

client.addDefinedColumn(params, function (err, data) {
    if (err) {
        console.log('error:', err);
        return;
    }
    console.log('success:', data);
});
