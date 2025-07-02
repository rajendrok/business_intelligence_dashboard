``/multi-join``
```
{
  "sources": [
    {
      "source_id": "db1_users",
      "type": "database",
      "table": "users",
      "credentials": {
        "username": "user1",
        "password": "pass1",
        "host": "127.0.0.1",
        "port": 5432,
        "database": "db1",
        "driver": "postgres",
        "limit": 0,
        "offset": 0,
        "query": "",
        "tables": {}
      }
    },
    {
      "source_id": "db2_orders",
      "type": "database",
      "table": "orders",
      "credentials": {
        "username": "user2",
        "password": "pass2",
        "host": "127.0.0.1",
        "port": 3306,
        "database": "db2",
        "driver": "mysql",
        "limit": 0,
        "offset": 0,
        "query": "",
        "tables": {}
      }
    },
    {
      "source_id": "excel_loyalty",
      "type": "excel",
      "file_id": "loyalty_2024_sheet"
    }
  ],
  "joins": [
    {
      "left": "db1_users",
      "right": "db2_orders",
      "left_column": "user_id",
      "right_column": "user_id",
      "type": "INNER"
    },
    {
      "left": "db1_users",
      "right": "excel_loyalty",
      "left_column": "email",
      "right_column": "email",
      "type": "LEFT"
    }
  ]
}

```

```
{
  "sources": [
    {
      "source_id": "db1_users",
      "type": "database",
      "table": "User_Birth_Place",
      "credentials": {
        "username": "root",
        "password": "Kush@789#",
        "host": "dev.myluckydays.ai",
        "port": 31346,
        "database": "MLD",
        "driver": "mysql",
        "limit": 0,
        "offset": 0,
        "query": "",
        "tables": {}
      }
    },
    {
      "source_id": "db2_orders",
      "type": "database",
      "table": "users_profession_details",
      "credentials": {
        "username": "postgres",
        "password": "Kush@789#",
        "host": "dev.mynetworth.pro",
        "port": 31348,
        "database": "testdb",
        "driver": "postgres",
        "limit": 0,
        "offset": 0,
        "query": "",
        "tables": {}
      }
    }
    // {
    //   "source_id": "excel_loyalty",
    //   "type": "excel",
    //   "file_id": "loyalty_2024_sheet"
    // }
  ],
  "joins": [
    {
      "left": "db1_users",
      "right": "db2_orders",
      "left_column": "User ID",
      "right_column": "user_id",
      "type": "RIGHT"
    }
    // {
    //   "left": "db1_users",
    //   "right": "excel_loyalty",
    //   "left_column": "email",
    //   "right_column": "email",
    //   "type": "LEFT"
    // }
  ]
}
```