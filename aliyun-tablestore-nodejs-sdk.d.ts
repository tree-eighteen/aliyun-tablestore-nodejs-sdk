/// <reference types="node" />

declare namespace TableStore {
  // helper
  type EnumValues<T> = T[keyof T]
  type EnumValuesOrKeys<T> = T[keyof T] | keyof T

  // ---------- metadata ----------
  const Direction: {
    FORWARD: 'FORWARD'
    BACKWARD: 'BACKWARD'
  }

  const UpdateType: {
    PUT: 'PUT'
    DELETE: 'DELETE'
    DELETE_ALL: 'DELETE_ALL'
    INCREMENT: 'INCREMENT'
  }

  const BatchWriteType: {
    PUT: 1
    UPDATE: 2
    DELETE: 3
  }

  const ReturnType: {
    NONE: 0
    Primarykey: 1
    AfterModify: 2
  }

  const DefinedColumnType: {
    DCT_INTEGER: 1
    DCT_DOUBLE: 2
    DCT_BOOLEAN: 3
    DCT_STRING: 4
  }

  const PrimaryKeyType: {
    INTEGER: 1
    STRING: 2
    BINARY: 3
  }

  const PrimaryKeyOption: {
    AUTO_INCREMENT: 1
  }

  const IndexUpdateMode: {
    IUM_ASYNC_INDEX: 0
    IUM_SYNC_INDEX: 1
  }

  const IndexType: {
    IT_GLOBAL_INDEX: 0
    IT_LOCAL_INDEX: 1
  }

  const INF_MIN: unique symbol
  const INF_MAX: unique symbol
  const PK_AUTO_INCR: unique symbol
  type VirtualData = typeof INF_MIN | typeof INF_MAX | typeof PK_AUTO_INCR

  // ---------- long ----------
  interface int64 {
    toBuffer: () => Buffer
    toNumber: () => number
  }
  const Long: {
    fromNumber: (num: number) => int64
    fromString: (str: string) => int64
  }

  // ---------- protocol ----------
  type CellValue = string | Buffer | int64 | boolean | number | null

  type PrimaryKeyInput = Array<{ [name: string]: CellValue | VirtualData }>
  type PrimaryKeyOutput = Array<{ name: string; value: CellValue }>
  type AttributesInput = Array<{
    [name: string]: CellValue | undefined
    timestamp?: number
  }>
  type AttributesOutput = Array<{
    columnName: string
    columnValue: CellValue
    timestamp: int64 | number
  }>

  interface Row {
    primaryKey: PrimaryKeyOutput | null
    attributes: AttributesOutput | null
  }

  interface RowInBatch extends Row, Consumed {
    isOk: boolean
    errorCode: string | null
    errorMessage: string | null
    tableName: string
  }

  type TimeRange = Partial<{
    startTime: number
    endTime: number
    specificTime: number
  }>

  type FilterParams = Partial<{
    columnsToGet: string[]
    columnFilter: ColumnCondition
    timeRange: TimeRange
    maxVersions: number
    startColumn: string
    endColumn: string
  }>

  type RowParamsInBatchGet = FilterParams & {
    tableName: string
    primaryKey: PrimaryKeyInput[]
  }

  interface TableMeta {
    tableName: string
    primaryKey: Array<{
      name: string
      type: EnumValuesOrKeys<typeof PrimaryKeyType>
      option?: EnumValuesOrKeys<typeof PrimaryKeyOption>
    }>
    definedColumn?: Array<{
      name: string
      type: EnumValuesOrKeys<typeof DefinedColumnType>
    }>
  }

  interface TableOptions {
    timeToLive: number
    maxVersions: number
    maxTimeDeviation?: number
  }

  interface ReservedThroughput {
    capacityUnit: {
      read: number
      write: number
    }
  }

  interface StreamSpecification {
    enableStream: boolean
    expirationTime?: number
  }

  interface IndexMeta {
    name: string
    primaryKey: string[]
    definedColumn: string[]
    indexUpdateMode?: EnumValues<typeof IndexUpdateMode>
    indexType?: EnumValues<typeof IndexType>
  }

  interface ReturnContent {
    returnType: EnumValues<typeof ReturnType>
    returnColumns?: string[]
  }

  interface JustTableName {
    tableName: string
  }

  interface FieldSchemas {
    fieldName: string
    fieldType: EnumValues<typeof FieldType>
    index?: boolean
    analyzer?: string
    enableSortAndAgg?: boolean
    store?: boolean
    isAnArray?: boolean
    fieldSchemas?: FieldSchemas[]
    dateFormats?: string
  }

  interface Sorter {
    primaryKeySort?: {
      order: EnumValues<typeof SortOrder>
    }
    fieldSort?: {
      fieldName: string
      order: EnumValues<typeof SortOrder>
      mode?: EnumValues<typeof SortMode>
    }
    scoreSort?: {
      order: EnumValues<typeof SortOrder>
    }
    geoDistanceSort?: {
      fieldName: string
      points: string[]
      order: EnumValues<typeof SortOrder>
    }
  }

  type WithTransactionId = Partial<{
    transactionId: string
  }>

  // ---------- protocol: pramas ----------
  interface CreateTableParams {
    tableMeta: TableMeta
    tableOptions: TableOptions
    reservedThroughput: ReservedThroughput
    streamSpecification?: StreamSpecification
    indexMetas?: IndexMeta[]
  }

  interface UpdateTableParams {
    tableName: string
    tableOptions: Partial<TableOptions>
    reservedThroughput?: ReservedThroughput
    streamSpecification?: StreamSpecification
  }

  type DescribeTableParams = JustTableName

  type DeleteTableParams = JustTableName

  type GetRowParams = FilterParams &
    WithTransactionId & {
      tableName: string
      primaryKey: PrimaryKeyInput
    }
  type PutRowParams = WithTransactionId & {
    tableName: string
    primaryKey: PrimaryKeyInput
    condition: Condition
    attributeColumns: AttributesInput
    returnContent?: ReturnContent
  }
  type UpdateRowParams = WithTransactionId & {
    tableName: string
    primaryKey: PrimaryKeyInput
    condition: Condition
    updateOfAttributeColumns: Array<{
      PUT?: AttributesInput
      DELETE?: Array<{ [name: string]: int64 }>
      DELETE_ALL?: string[]
      INCREMENT?: Array<{ [name: string]: int64 }>
    }>
    returnContent?: ReturnContent
  }
  type DeleteRowParams = WithTransactionId & {
    tableName: string
    primaryKey: PrimaryKeyInput
    condition: Condition
  }
  type GetRangeParams = FilterParams &
    WithTransactionId & {
      tableName: string
      direction: EnumValues<typeof Direction>
      inclusiveStartPrimaryKey: PrimaryKeyInput
      exclusiveEndPrimaryKey: PrimaryKeyInput
      limit?: number
    }
  type BatchGetRowParams = WithTransactionId & {
    tables: RowParamsInBatchGet[]
  }
  type BatchWriteRowParams = WithTransactionId & {
    tables: Array<{
      tableName: string
      rows: Array<
        | {
            type: 'UPDATE'
            condition: Condition
            primaryKey: PrimaryKeyInput
            attributeColumns: Array<{
              PUT?: AttributesInput
              DELETE?: Array<{ [name: string]: int64 }>
              DELETE_ALL?: string[]
            }>
            returnContent?: ReturnContent
          }
        | {
            type: 'PUT'
            condition: Condition
            primaryKey: PrimaryKeyInput
            attributeColumns?: AttributesInput
            returnContent?: ReturnContent
          }
        | {
            type: 'DELETE'
            condition: Condition
            primaryKey: PrimaryKeyInput
          }
      >
    }>
  }

  type ListSearchIndexParams = JustTableName
  type DescribeSearchIndexParams = JustTableName & {
    indexName: string
  }
  interface CreateSearchIndexParams {
    tableName: string
    indexName: string
    schema: {
      fieldSchemas: FieldSchemas[]
      indexSetting?: {
        routingFields?: string[]
        routingPartitionSize?: unknown
      }
      indexSort?: {
        sorters: Sorter[]
      }
    }
  }
  type DeleteSearchIndexParams = DescribeSearchIndexParams

  interface SearchParams {
    tableName: string
    indexName: string
    searchQuery: {
      offset: number
      limit: number
      query: {
        queryType: EnumValues<typeof QueryType>
        query?: unknown
      }
      getTotalCount?: boolean
      token?: Buffer | null
    }
    columnToGet: {
      returnType: EnumValues<typeof ColumnReturnType>
      returnNames?: string[]
    }
    timeoutMs?: number
  }

  interface CreateIndexParams {
    mainTableName: string
    indexMeta: {
      name: string
      primaryKey: string[]
      definedColumn: string[]
      includeBaseData: boolean
      indexType?: EnumValues<typeof IndexType>
      indexUpdateMode?: EnumValues<typeof IndexUpdateMode>
    }
  }

  interface DropIndexParams {
    mainTableName: string
    indexName: string
  }

  interface StartLocalTransactionParams {
    tableName: string
    primaryKey: PrimaryKeyInput
  }

  interface CommitLocalTransactionParams {
    transactionId: string
  }

  type AbortLocalTransactionParams = CommitLocalTransactionParams

  // ---------- protocol: results ----------
  interface ListTableResult {
    tableNames: string[]
  }

  interface DescribeTableResult {
    tableMeta: TableMeta
    reservedThroughputDetails: ReservedThroughput
    tableOptions: TableOptions
    streamDetails: StreamSpecification
    shard_splits: any
  }

  interface Consumed {
    capacityUnit: {
      read: number
      write: number
    }
  }
  interface SingleRowResult {
    consumed: Consumed
    row?: Row
    RequestId: string
  }
  interface GetRangeResult {
    consumed: Consumed
    rows: Row[]
    nextStartPrimaryKey?: PrimaryKeyOutput
    compressType?: number
    dataBlockType?: number
    nextToken?: Buffer
    RequestId: string
  }
  interface BatchGetRowResult {
    tables: RowInBatch[][]
    RequestId: string
  }
  interface BatchWriteRowResult {
    tables: RowInBatch[]
    RequestId: string
  }
  interface StartLocalTransactionResult {
    transactionId: string
  }

  interface SearchResult {
    totalCounts: string
    isAllSucceeded: boolean
    nextToken: Buffer
    rows: Array<{
      primaryKey: Array<{
        name: string
        value: number
      }>
      attributes: Array<{
        columnName: string
        columnValue: string | number
        timestamp: number
      }>
    }>
    searchHits: Array<{
      row: {
        primaryKey: Array<{
          name: string
          value: number
        }>
        attributes: Array<{
          columnName: string
          columnValue: string | number
          timestamp: number
        }>
      }
      highlightResultItem: {
        highlightFields: Record<string, any>
      }
      searchInnerHits: Record<string, any>
    }>
    consumed: {
      capacityUnit: {
        read: number
        write: number
      }
    }
    reservedConsumed: {
      capacityUnit: {
        read: number
        write: number
      }
    }
    RequestId: string
  }

  // ---------- filter ----------
  const LogicalOperator: {
    NOT: 1
    AND: 2
    OR: 3
  }

  const ColumnConditionType: {
    COMPOSITE_COLUMN_CONDITION: 0
    SINGLE_COLUMN_CONDITION: 1
  }

  const ComparatorType: {
    EQUAL: 1
    NOT_EQUAL: 2
    GREATER_THAN: 3
    GREATER_EQUAL: 4
    LESS_THAN: 5
    LESS_EQUAL: 6
  }

  const RowExistenceExpectation: {
    IGNORE: 0
    EXPECT_EXIST: 1
    EXPECT_NOT_EXIST: 2
  }

  class ColumnCondition {}
  class CompositeCondition extends ColumnCondition {
    constructor(combinator: EnumValues<typeof LogicalOperator>)
    addSubCondition: (condition: ColumnCondition) => void
    sub_conditions: ColumnCondition[]
  }
  class SingleColumnCondition extends ColumnCondition {
    constructor(
      columnName: string,
      columnValue: CellValue,
      comparator: EnumValues<typeof ComparatorType>,
      passIfMissing?: boolean,
      latestVersionOnly?: boolean
    )
    columnName: string
    columnValue: CellValue
    comparator: EnumValues<typeof ComparatorType>
    passIfMissing?: boolean
    latestVersionOnly?: boolean
  }
  class Condition {
    constructor(
      rowExistenceExpectation: EnumValues<typeof RowExistenceExpectation>,
      columnCondition: ColumnCondition | null
    )
    columnCondition: ColumnCondition
  }
  class ColumnPaginationFilter {
    constructor(limit: number, offset: number)
    getType(): number
  }

  // ---------- config ----------
  type ConfigOptions = Partial<{
    accessKeyId: string
    secretAccessKey: string
    accessKeySecret: string
    stsToken: string
    securityToken: string
    logger: unknown
    endpoint: string
    httpOptions: {
      timeout: number
      maxSockets: number
    }
    maxRetries: number
    instancename: string
    computeChecksums: boolean
  }>

  // ---------- events ----------
  class SequentialExecutor {
    constructor()
    on(eventName: string, listener: () => void): SequentialExecutor
    onAsync(eventName: string, listener: () => void): SequentialExecutor
    removeListener(eventName: string, listener: () => void): SequentialExecutor
    removeAllListeners(eventName: string): SequentialExecutor
  }

  const events: SequentialExecutor

  // ---------- client ----------
  class Client {
    constructor(config: ConfigOptions)
    createTable(
      params: CreateTableParams,
      callback?: (err: Error | null, data: unknown) => void
    ): Promise<unknown>
    updateTable(
      params: UpdateTableParams,
      callback?: (err: Error | null, data: unknown) => void
    ): Promise<unknown>
    listTable(
      params: unknown,
      callback?: (err: Error | null, data: ListTableResult) => void
    ): Promise<ListTableResult>
    describeTable(
      params: DescribeTableParams,
      callback?: (err: Error | null, data: DescribeTableResult) => void
    ): Promise<DescribeTableResult>
    deleteTable(
      params: DeleteTableParams,
      callback?: (error: Error | null, data: unknown) => void
    ): Promise<unknown>
    getRow(
      params: GetRowParams,
      callback?: (error: Error | null, result: SingleRowResult) => void
    ): Promise<SingleRowResult>
    putRow(
      params: PutRowParams,
      callback?: (error: Error | null, result: SingleRowResult) => void
    ): Promise<SingleRowResult>
    updateRow(
      params: UpdateRowParams,
      callback?: (error: Error | null, result: SingleRowResult) => void
    ): Promise<SingleRowResult>
    deleteRow(
      params: DeleteRowParams,
      callback?: (error: Error | null, result: SingleRowResult) => void
    ): Promise<SingleRowResult>
    getRange(
      params: GetRangeParams,
      callback?: (error: Error | null, result: GetRangeResult) => void
    ): Promise<GetRangeResult>
    batchGetRow(
      params: BatchGetRowParams,
      callback?: (error: Error | null, result: BatchGetRowResult) => void
    ): Promise<BatchGetRowResult>
    batchWriteRow(
      params: BatchWriteRowParams,
      callback?: (error: Error | null, result: BatchWriteRowResult) => void
    ): Promise<BatchWriteRowResult>
    listSearchIndex(
      params: ListSearchIndexParams,
      callback?: (error: Error | null, result: unknown) => void
    ): Promise<unknown>
    describeSearchIndex(
      params: DescribeSearchIndexParams,
      callback?: (error: Error | null, result: unknown) => void
    ): Promise<unknown>
    createSearchIndex(
      params: CreateSearchIndexParams,
      callback?: (error: Error | null, result: unknown) => void
    ): Promise<unknown>
    deleteSearchIndex(
      params: DeleteSearchIndexParams,
      callback?: (error: Error | null, result: unknown) => void
    ): Promise<unknown>
    search(
      params: SearchParams,
      callback?: (error: Error | null, result: SearchResult) => void
    ): Promise<SearchResult>
    createIndex(
      params: CreateIndexParams,
      callback?: (error: Error | null, result: unknown) => void
    ): Promise<unknown>
    dropIndex(
      params: DropIndexParams,
      callback?: (error: Error | null, result: unknown) => void
    ): Promise<unknown>
    startLocalTransaction(
      params: StartLocalTransactionParams,
      callback?: (error: Error | null, result: StartLocalTransactionResult) => void
    ): Promise<StartLocalTransactionResult>
    commitTransaction(
      params: CommitLocalTransactionParams,
      callback?: (error: Error | null, result: unknown) => void
    ): Promise<unknown>
    abortTransaction(
      params: AbortLocalTransactionParams,
      callback?: (error: Error | null, result: unknown) => void
    ): Promise<unknown>
  }

  // ---------- search ----------
  const QueryType: {
    MATCH_QUERY: 1
    MATCH_PHRASE_QUERY: 2
    TERM_QUERY: 3
    RANGE_QUERY: 4
    PREFIX_QUERY: 5
    BOOL_QUERY: 6
    CONST_SCORE_QUERY: 7
    FUNCTION_SCORE_QUERY: 8
    NESTED_QUERY: 9
    WILDCARD_QUERY: 10
    MATCH_ALL_QUERY: 11
    GEO_BOUNDING_BOX_QUERY: 12
    GEO_DISTANCE_QUERY: 13
    GEO_POLYGON_QUERY: 14
    TERMS_QUERY: 15
    EXISTS_QUERY: 16
  }

  const ScoreMode: {
    SCORE_MODE_NONE: 1
    SCORE_MODE_AVG: 2
    SCORE_MODE_MAX: 3
    SCORE_MODE_TOTAL: 4
    SCORE_MODE_MIN: 5
  }

  const SortOrder: {
    SORT_ORDER_ASC: 0
    SORT_ORDER_DESC: 1
  }

  const SortMode: {
    SORT_MODE_MIN: 0
    SORT_MODE_MAX: 1
    SORT_MODE_AVG: 2
  }

  const FieldType: {
    LONG: 1
    DOUBLE: 2
    BOOLEAN: 3
    KEYWORD: 4
    TEXT: 5
    NESTED: 6
    GEO_POINT: 7
    DATE: 8
  }

  const ColumnReturnType: {
    RETURN_ALL: 1
    RETURN_SPECIFIED: 2
    RETURN_NONE: 3
  }

  const GeoDistanceType: {
    GEO_DISTANCE_ARC: 0
    GEO_DISTANCE_PLANE: 1
  }

  const IndexOptions: {
    DOCS: 1
    FREQS: 2
    POSITIONS: 3
    OFFSETS: 4
  }

  const QueryOperator: {
    OR: 1
    AND: 2
  }
}

export = TableStore;
