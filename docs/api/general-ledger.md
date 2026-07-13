# dkPlus API — General Ledger

Base URL: https://api.dkplus.is/api/v1 — Auth: `Authorization: Bearer <token>`


---

## [General Ledger/Account] Fetch All

`GET /api/v1/generalLedger/account`

Use this method to get general ledger accounts.


---

## [General Ledger/Account] Transactions

`GET /api/v1/generalledger/account/:number/transaction/:page/:count`

Use this method to get transactions pages for a specified General Ledger Account  
## Optional Url Parameters
* **int** Page - default 1
* **int** Count - default 100

##  Query Parameters
* **string** dim1
* **string** voucher
* **string** reference
* **datetime** createdAfter
* **datetime** createdBefore
* **datetime** dueAfter

**Path variables:**

- `:number` (example: `7810`) — Ledger Account Number
- `:page` (example: `1`) — Page number
- `:count` (example: `100`) — Max objects to return


---

## [General Ledger/Journal] Create

`POST /api/v1/generalledger/journal`

## Properties
* **string** Code 
* **string** Description
* **int** Period - //optional default to this year
* **options** Options //Optional
* **Array Line** Lines 
  
### Options  
* **bool** Post //optional - default false
* **bool** GenerateVoucher //optional - default true
  
### Line 
* **string** Account
* **double** Amount
* **string** Currency  //optional - default company currency
* **DateTime** Date //optional - default today
* **DateTime** DueDate //optional
* **string** Dim1 //optional if company settings do not enforce
* **string** Reference //optional
* **string** Text //optional
* **string** Voucher //optional
* **JournalType** Type
  
### JournalType  
This property can be set as the integer value or name as string  
"Type":1 or "Type":"Customer"
* GeneralLedger (**0**)
* Customer (**1**)
* Vendor (**2**)
* Project (**3**)
* Payroll (**4**)
* FixedAssets (**5**)
* Member
...[truncated]

**Request body:**

```json
{
	"Code" : "ABCD",
	"Description": "This is a test Journal",
	"Lines":
	[
		{
			"Account": "1710794709",
			"Amount":1000,
			"Type":"AccountsReceivable"
		}
	]
	
}
```


---

## [General Ledger/Transaction] Page

`GET /api/v1/generalledger/transaction/page/:page/:count?createdAfter=2019-01-01T00:00:00.0000000`

Use this method to get transactions pages
##  Parameters
* **string** account
* **string** dim1
* **string** voucher
* **string** reference
* **datetime** createdAfter
* **datetime** createdBefore
* **datetime** dueAfter

**Query params:**

- `createdAfter`=`2019-01-01T00:00:00.0000000`
- `dueAfter`=`2018-08-15` (optional/disabled in example)
- `reference`=`` (optional/disabled in example)
- `dim1`=`` (optional/disabled in example)
- `voucher`=`` (optional/disabled in example)
- `account`=`` (optional/disabled in example)
- `createdBefore`=`` (optional/disabled in example)
- `include`=`Account,Text` (optional/disabled in example)

**Path variables:**

- `:page` (example: `1`)
- `:count` (example: `50000`)

**Example response (200 OK):**

```json
[
 {
  "ID": 17337,
  "Account": "1150",
  "Created": "2019-03-15T13:57:02.835+00:00",
  "Modified": "2019-03-15T13:57:02.882+00:00",
  "DueDate": "0001-01-01T00:00:00",
  "Text": "Bókun söludagbókar",
  "Reference": "S001",
  "JournalDate": "2019-03-15T00:00:00",
  "Origin": 0,
  "Voucher": "s21",
  "JournalType": 0,
  "Code": 0,
  "Currency": "ISK",
  "Exchange": 1,
  "Amount": -484200,
  "InputAmount": -484200,
  "TaxCode": "u0",
  "TaxGroup": 2,
  "TaxPercent": 0,
  "HCode": "sb",
  "HType": 0,
  "IsCredit": false,
  "PeriodId": 2019,
  "Quantity": 0,
  "NumberOfQuantity": 0,
  "PercentageOfVATUsed": 0,
  "VATReportID": 0
 },
 {
  "ID": 17338,
  "Account": "1000",
  "Created": "2019-03-15T13:57:02.913+00:00",
  "Modified": "2019-03-15T13:57:02.913+00:00",
  "DueDate": "0001-01-01T00:00:00",
  "Text": "Bókun söludagbókar",
  "Reference": "S001",
  "JournalDate": "2019-03-15T00:00:00",
  "Origin": 0,
  "Voucher": "s21",
  "JournalType": 0,
  "Code": 1,
  "Currency": "ISK",
  "Exchange": 1,
  "Amount": -1050,
  "InputAmount": -1302,
  "TaxCode": "u1",
  "TaxGroup": 2,
  "TaxPercent": 24,
  "HCode": "sb",
  "HType": 0,
  "IsCredit": false,
  "PeriodId": 2019,
  "Quantity": 0,
  "NumberOfQuantity": 0,
  "PercentageOfVATUsed": 0,
  "VATReportID": 0
 }
]
// ...array has 10 items total, showing 2
```

