# dkPlus API — General

Base URL: https://api.dkplus.is/api/v1 — Auth: `Authorization: Bearer <token>`


---

## [General/Payment] Modes

`GET /api/v1/general/payment/mode`


---

## [General/Payment] Mode

`GET /api/v1/general/payment/mode/eu`


---

## [General/Payment] Terms

`GET /api/v1/general/payment/term`


---

## [General/Payment] Term

`GET /api/v1/general/payment/term/m30`

**Example response (200 OK):**

```json
{
 "Number": "m30",
 "Description": "Líðandi mánuður + 30 dagar"
}
```


---

## [General/Employee/TimeClock] Fetch Entries

`GET /api/v1/general/employee/:number/timeclock/page/:page/:count`

Get time entires for employee paged

**Path variables:**

- `:number` (example: `{{Employee_Number}}`) — Employee number
- `:page` (example: `1`)
- `:count` (example: `50`)

**Example response (200 OK):**

```json
[
 {
  "Number": "0223",
  "Name": "Mobiz verkefnið",
  "Group": "hugb",
  "MasterJobNumber": "",
  "QuotationNumber": 0,
  "CustomerToBill": "6611982499",
  "CustomerNameToBill": "dk hugbúnaður ehf.",
  "CustomerToRecieve": "0202805659",
  "Founder": "0202805659",
  "Owner": "",
  "Supervisor": "0202805659",
  "Worker": "1710794709",
  "Dim1": "",
  "Dim2": "",
  "Dim3": "",
  "Dim1Required": false,
  "Dim2Required": false,
  "Dim3Required": false,
  "FoundingDate": "2015-12-03T00:00:00Z",
  "EstimatedBeginingDate": "2015-12-03T00:00:00Z",
  "EstimatedFinishDate": "1899-12-30T00:00:00Z",
  "ActualBeginingDate": "2015-01-24T00:00:00Z",
  "ActualFinishDate": "1899-12-30T00:00:00Z",
  "OptimistDate": "1899-12-30T00:00:00Z",
  "PessimistDate": "1899-12-30T00:00:00Z",
  "JobType": 3,
  "JobStatus": 1,
  "JobBillingMode": 0,
  "PhaseId": "",
  "PhaseRequired": false,
  "TaskId": "",
  "TaskRequired": false,
  "ForeignName": "",
  "JobContactName": "",
  "QuotationAmount": 0,
  "Serialnumber": "",
  "QuotationAmountWithVAT": false,
  "LedgerCode": "",
  "DiscountType": 0,
  "JobDiscountPercent": 0,
  "DiscountOfTime": false,
  "DiscountOfDriveTime": false,
  "DiscountOfCost": false,
  "ForeignPriceForWork": 0,
  "SkipTaxOnInvoice": false,
  "QuotationCurrencyCode": "",
  "QuotationWorkingHours": 0,
  "QuotationWorkingAmount": 0,
  "QuotationCostAmount": 0,
  "QuotationLicenceAmount": 0,
  "Modified": "2017-06-22T15:29:39.592Z",
  "LinkedPhases": [],
  "LinkedTasks": []
 },
 {
  "Number": "13299",
  "Name": "dk-Cloud Forritun",
  "Group": "hugb",
  "MasterJobNumber": "",
  "QuotationNumber": 0,
  "CustomerToBill": "6611982499",
  "CustomerNameToBill": "dk hugbúnaður ehf.",
  "CustomerToRecieve": "1710794709",
  "Founder": "1710794709",
  "Owner": "1710794709",
  "Supervisor": "1710794709",
  "Worker": "1710794709",
  "Dim1": "",
  "Dim2": "",
  "Dim3": "",
  "Dim1Required": false,
  "Dim2Required": false,
  "Dim3Required": false,
  "FoundingDate": "2016-12-07T00:00:00Z",
  "EstimatedBeginingDate": "2016-12-07T00:00:00Z",
  "EstimatedFinishDate": "1899-12-30T00:00:00Z",
  "ActualBeginingDate": "2006-10-02T00:00:00Z",
  "ActualFinishDate": "1899-12-30T00:00:00Z",
  "OptimistDate": "1899-12-30T00:00:00Z",
  "PessimistDate": "1899-12-30T00:00:00Z",
  "JobType": 3,
  "JobStatus": 1,
  "JobBillingMode": 3,
  "PhaseId": "",
  "PhaseRequired": false,
  "TaskId": "",
  "TaskRequired": false,
  "ForeignName": "",
  "JobContactName": "",
  "QuotationAmount": 0,
  "Serialnumber": "",
  "QuotationAmountWithVAT": false,
  "LedgerCode": "",
  "DiscountType": 0,
  "JobDiscountPercent": 0,
  "DiscountOfTime": true,
  "DiscountOfDriveTime": false,
  "DiscountOfCost": false,
  "ForeignPriceForWork": 0,
  "SkipTaxOnInvoice": false,
  "QuotationCurrencyCode": "",
  "QuotationWorkingHours": 0,
  "QuotationWorkingAmount": 0,
  "QuotationCostAmount": 0,
  "QuotationLicenceAmount": 0,
  "Modified": "2017-01-03T23:55:29.952Z",
  "LinkedPhases": [
   {
    "PhaseID": "004",
    "Description": "Þróunarvinna"
   },
   {
    "PhaseID": "005",
    "Description": "Vinna vegna villna (bug fix)"
   },
   {
    "PhaseID": "011",
    "Description": "Bakvakt, útkall"
   },
   {
    "PhaseID": "012",
    "Description": "Bakvakt, fjartenging"
   },
   {
    "PhaseID": "015",
    "Description": "Yfirvinna"
   },
   {
    "PhaseID": "050",
    "Description": "Lagfæring"
   }
  ],
  "LinkedTasks": []
 }
]
// ...array has 3 items total, showing 2
```


---

## [General/Employee] Create

`POST /api/v1/General/Employee`

**Request body:**

```json
{
	"Number": "starfsm1",
	"Name" : "Starfsmaður test"
}
```

**Example response (200 OK):**

```json
{
 "Number": "starfsm1",
 "Name": "Starfsmaður test",
 "StampStatus": 0,
 "StampType": 0,
 "Status": 0,
 "Gender": 0,
 "Modified": "2018-12-11T15:24:28.7629731+00:00",
 "Created": "2018-12-11T15:24:28.7629731+00:00"
}
```


---

## [General/Employee] Work Entry

`POST /api/v1/General/Employee/:employee/work?post=false`

# Add Employee Work Journal  

## Properties for Work Line
* **DateTime** Date 
* **string** Text
* **string** Project
* **string** Phase ``` optional - if project does not enforce```
* **string** Task ``` optional```
* **double** DayTime
* **double** OverTime
* **bool** Billable ``` optional```

[Details](https://api.dkplus.is/swagger/ui/index#!/Employee/EmployeeWork_CreateEmployeeWork)

**Query params:**

- `post`=`false`

**Path variables:**

- `:employee` (example: `{{Employee_Number}}`)

**Request body:**

```json
[{
    "Date" : "2020-09-09",
	"DayTime": 4,
	"Text" : "Did Some stuff",
    "Project" : "0035"
}]
```

**Example response (409 Conflict):**

```json
{
 "Message": "Employee exists with this Number."
}
```


---

## [General/Employee] Update

`PUT /api/v1/General/Employee/:number`

**Path variables:**

- `:number` (example: `starfsm1`) — The employee's identifier

**Request body:**

```json
{
	"Gender" : "1",
	"Address1" : "Dúfnahólar 10",
	"Phone" : "5105801"
}
```

**Example response (200 OK):**

```json
{
 "Number": "starfsm1",
 "Name": "Starfsmaður test",
 "Address1": "Dúfnahólar 10",
 "Address2": "",
 "Address3": "",
 "ZipCode": "",
 "City": "",
 "CountryCode": "",
 "SSNumber": "",
 "StampStatus": -1,
 "StampType": 1,
 "Phone": "5105800",
 "PhoneLocal": "",
 "PhoneMobile": "",
 "Fax": "",
 "Email": "",
 "Url": "",
 "Tag": "",
 "Status": 0,
 "Supervisor": "",
 "Dim1": "",
 "Dim2": "",
 "Dim3": "",
 "Gender": 1,
 "Group": "",
 "SpouseName": "",
 "ShortName": "",
 "Modified": "2018-12-11T16:49:10.033Z",
 "Created": "2018-12-11T15:24:34.063Z"
}
```


---

## [General/Employee] All

`GET /api/v1/general/employee`


---

## [General/Employee] One

`GET /api/v1/general/employee/:number`

**Path variables:**

- `:number` (example: `{{Employee_Number}}`) — Number of the employee to fetch

**Example response (200 OK):**

```json
{
 "Number": "1710794709",
 "Name": "Þorvaldur Hafdal Jónsson",
 "Address1": "Glitvöllum 32",
 "Address2": "",
 "Address3": "",
 "ZipCode": "221",
 "City": "",
 "CountryCode": "IS",
 "SSNumber": "1710794709",
 "Comment": "[phone]",
 "StampStatus": 0,
 "StampType": 0,
 "Phone": "557 6963",
 "PhoneLocal": "510 5803",
 "PhoneMobile": "824 9903",
 "Fax": "",
 "Email": "valdi@dk.is",
 "Url": "www.dk.is",
 "Tag": "dkvistun",
 "Status": 0,
 "Supervisor": "",
 "Dim1": "",
 "Dim2": "",
 "Dim3": "",
 "Gender": 0,
 "Group": "VIST",
 "SpouseName": "Inga Guðrún Arnþórsdóttir",
 "ShortName": "Valdi",
 "Modified": "2017-08-21T11:52:20.013Z",
 "Created": "2004-04-21T13:18:48.765Z",
 "BankAccount": {
  "Code": "0172",
  "Owner": "",
  "OwnerName": "",
  "AccountType": "",
  "AccountGroup": "26",
  "Account": "170"
 }
}
```


---

## [General/Employee] Project Worker

`GET /api/v1/general/employee/:number/worker`

Get all projects that the specified employee is registerd as a worker

**Path variables:**

- `:number` (example: `{{Employee_Number}}`) — Employee Number


**Example response (200 OK):**

```json
[
 {
  "Number": "0223",
  "Name": "Mobiz verkefnið",
  "Group": "hugb",
  "MasterJobNumber": "",
  "QuotationNumber": 0,
  "CustomerToBill": "6611982499",
  "CustomerNameToBill": "dk hugbúnaður ehf.",
  "CustomerToRecieve": "0202805659",
  "Founder": "0202805659",
  "Owner": "",
  "Supervisor": "0202805659",
  "Worker": "1710794709",
  "Dim1": "",
  "Dim2": "",
  "Dim3": "",
  "Dim1Required": false,
  "Dim2Required": false,
  "Dim3Required": false,
  "FoundingDate": "2015-12-03T00:00:00Z",
  "EstimatedBeginingDate": "2015-12-03T00:00:00Z",
  "EstimatedFinishDate": "1899-12-30T00:00:00Z",
  "ActualBeginingDate": "2015-01-24T00:00:00Z",
  "ActualFinishDate": "1899-12-30T00:00:00Z",
  "OptimistDate": "1899-12-30T00:00:00Z",
  "PessimistDate": "1899-12-30T00:00:00Z",
  "JobType": 3,
  "JobStatus": 1,
  "JobBillingMode": 0,
  "PhaseId": "",
  "PhaseRequired": false,
  "TaskId": "",
  "TaskRequired": false,
  "ForeignName": "",
  "JobContactName": "",
  "QuotationAmount": 0,
  "Serialnumber": "",
  "QuotationAmountWithVAT": false,
  "LedgerCode": "",
  "DiscountType": 0,
  "JobDiscountPercent": 0,
  "DiscountOfTime": false,
  "DiscountOfDriveTime": false,
  "DiscountOfCost": false,
  "ForeignPriceForWork": 0,
  "SkipTaxOnInvoice": false,
  "QuotationCurrencyCode": "",
  "QuotationWorkingHours": 0,
  "QuotationWorkingAmount": 0,
  "QuotationCostAmount": 0,
  "QuotationLicenceAmount": 0,
  "Modified": "2017-06-22T15:29:39.592Z",
  "LinkedPhases": [],
  "LinkedTasks": []
 },
 {
  "Number": "13299",
  "Name": "dk-Cloud Forritun",
  "Group": "hugb",
  "MasterJobNumber": "",
  "QuotationNumber": 0,
  "CustomerToBill": "6611982499",
  "CustomerNameToBill": "dk hugbúnaður ehf.",
  "CustomerToRecieve": "1710794709",
  "Founder": "1710794709",
  "Owner": "1710794709",
  "Supervisor": "1710794709",
  "Worker": "1710794709",
  "Dim1": "",
  "Dim2": "",
  "Dim3": "",
  "Dim1Required": false,
  "Dim2Required": false,
  "Dim3Required": false,
  "FoundingDate": "2016-12-07T00:00:00Z",
  "EstimatedBeginingDate": "2016-12-07T00:00:00Z",
  "EstimatedFinishDate": "1899-12-30T00:00:00Z",
  "ActualBeginingDate": "2006-10-02T00:00:00Z",
  "ActualFinishDate": "1899-12-30T00:00:00Z",
  "OptimistDate": "1899-12-30T00:00:00Z",
  "PessimistDate": "1899-12-30T00:00:00Z",
  "JobType": 3,
  "JobStatus": 1,
  "JobBillingMode": 3,
  "PhaseId": "",
  "PhaseRequired": false,
  "TaskId": "",
  "TaskRequired": false,
  "ForeignName": "",
  "JobContactName": "",
  "QuotationAmount": 0,
  "Serialnumber": "",
  "QuotationAmountWithVAT": false,
  "LedgerCode": "",
  "DiscountType": 0,
  "JobDiscountPercent": 0,
  "DiscountOfTime": true,
  "DiscountOfDriveTime": false,
  "DiscountOfCost": false,
  "ForeignPriceForWork": 0,
  "SkipTaxOnInvoice": false,
  "QuotationCurrencyCode": "",
  "QuotationWorkingHours": 0,
  "QuotationWorkingAmount": 0,
  "QuotationCostAmount": 0,
  "QuotationLicenceAmount": 0,
  "Modified": "2017-01-03T23:55:29.952Z",
  "LinkedPhases": [
   {
    "PhaseID": "004",
    "Description": "Þróunarvinna"
   },
   {
    "PhaseID": "005",
    "Description": "Vinna vegna villna (bug fix)"
   },
   {
    "PhaseID": "011",
    "Description": "Bakvakt, útkall"
   },
   {
    "PhaseID": "012",
    "Description": "Bakvakt, fjartenging"
   },
   {
    "PhaseID": "015",
    "Description": "Yfirvinna"
   },
   {
    "PhaseID": "050",
    "Description": "Lagfæring"
   }
  ],
  "LinkedTasks": []
 }
]
// ...array has 3 items total, showing 2
```


---

## [General/Employee] Project Supervisor

`GET /api/v1/general/employee/{{Employee_Number}}/supervisor`

Get all projects where the specified employee is registered as a supervisor

**Example response (200 OK):**

```json
[
 {
  "Number": "13299",
  "Name": "dk-Cloud Forritun",
  "Group": "hugb",
  "MasterJobNumber": "",
  "QuotationNumber": 0,
  "CustomerToBill": "6611982499",
  "CustomerNameToBill": "dk hugbúnaður ehf.",
  "CustomerToRecieve": "1710794709",
  "Founder": "1710794709",
  "Owner": "1710794709",
  "Supervisor": "1710794709",
  "Worker": "1710794709",
  "Dim1": "",
  "Dim2": "",
  "Dim3": "",
  "Dim1Required": false,
  "Dim2Required": false,
  "Dim3Required": false,
  "FoundingDate": "2016-12-07T00:00:00Z",
  "EstimatedBeginingDate": "2016-12-07T00:00:00Z",
  "EstimatedFinishDate": "1899-12-30T00:00:00Z",
  "ActualBeginingDate": "2006-10-02T00:00:00Z",
  "ActualFinishDate": "1899-12-30T00:00:00Z",
  "OptimistDate": "1899-12-30T00:00:00Z",
  "PessimistDate": "1899-12-30T00:00:00Z",
  "JobType": 3,
  "JobStatus": 1,
  "JobBillingMode": 3,
  "PhaseId": "",
  "PhaseRequired": false,
  "TaskId": "",
  "TaskRequired": false,
  "ForeignName": "",
  "JobContactName": "",
  "QuotationAmount": 0,
  "Serialnumber": "",
  "QuotationAmountWithVAT": false,
  "LedgerCode": "",
  "DiscountType": 0,
  "JobDiscountPercent": 0,
  "DiscountOfTime": true,
  "DiscountOfDriveTime": false,
  "DiscountOfCost": false,
  "ForeignPriceForWork": 0,
  "SkipTaxOnInvoice": false,
  "QuotationCurrencyCode": "",
  "QuotationWorkingHours": 0,
  "QuotationWorkingAmount": 0,
  "QuotationCostAmount": 0,
  "QuotationLicenceAmount": 0,
  "Modified": "2017-01-03T23:55:29.952Z",
  "LinkedPhases": [
   {
    "PhaseID": "004",
    "Description": "Þróunarvinna"
   },
   {
    "PhaseID": "005",
    "Description": "Vinna vegna villna (bug fix)"
   },
   {
    "PhaseID": "011",
    "Description": "Bakvakt, útkall"
   },
   {
    "PhaseID": "012",
    "Description": "Bakvakt, fjartenging"
   },
   {
    "PhaseID": "015",
    "Description": "Yfirvinna"
   },
   {
    "PhaseID": "050",
    "Description": "Lagfæring"
   }
  ],
  "LinkedTasks": []
 },
 {
  "Number": "0210",
  "Name": "Forritun dk Vefþjónusta",
  "Group": "hugb",
  "MasterJobNumber": "",
  "QuotationNumber": 0,
  "CustomerToBill": "6611982499",
  "CustomerNameToBill": "dk hugbúnaður ehf.",
  "CustomerToRecieve": "1705642439",
  "Founder": "1705642439",
  "Owner": "",
  "Supervisor": "1710794709",
  "Worker": "1710794709",
  "Dim1": "",
  "Dim2": "",
  "Dim3": "",
  "Dim1Required": false,
  "Dim2Required": false,
  "Dim3Required": false,
  "FoundingDate": "2014-02-03T00:00:00Z",
  "EstimatedBeginingDate": "2014-02-03T00:00:00Z",
  "EstimatedFinishDate": "1899-12-30T00:00:00Z",
  "ActualBeginingDate": "2006-10-02T00:00:00Z",
  "ActualFinishDate": "1899-12-30T00:00:00Z",
  "OptimistDate": "1899-12-30T00:00:00Z",
  "PessimistDate": "1899-12-30T00:00:00Z",
  "JobType": 3,
  "JobStatus": 1,
  "JobBillingMode": 3,
  "PhaseId": "",
  "PhaseRequired": false,
  "TaskId": "",
  "TaskRequired": false,
  "ForeignName": "",
  "JobContactName": "",
  "QuotationAmount": 0,
  "Serialnumber": "",
  "QuotationAmountWithVAT": false,
  "LedgerCode": "",
  "DiscountType": 0,
  "JobDiscountPercent": 0,
  "DiscountOfTime": true,
  "DiscountOfDriveTime": false,
  "DiscountOfCost": false,
  "ForeignPriceForWork": 0,
  "SkipTaxOnInvoice": false,
  "QuotationCurrencyCode": "",
  "QuotationWorkingHours": 0,
  "QuotationWorkingAmount": 0,
  "QuotationCostAmount": 0,
  "QuotationLicenceAmount": 0,
  "Modified": "2017-06-22T15:34:30.768Z",
  "LinkedPhases": [],
  "LinkedTasks": []
 }
]
```


---

## [General/Table] Records

`GET 000`

This method allow direct polling into the dkSystem and bypasses all cache layers.

## Query Parameters
* **enum** output `optional - Legacy(0), KeyValue(1)`
* **datetime** modified `optional - default:1.1.1900`
* **string** fields `seperated by ,`
* **int** count - `optional - default 200`

**Query params:**

- `output`=`Legacy` (optional/disabled in example) — Type of result
Legacy (**0**), KeyValue (**1**)
- `count`=`10` (optional/disabled in example) — Maximum number of records to return from the table  
> if more records have changed they will be returned as well
> so the returned count may be greater if more records have changed in the same millis

**Example response (200 OK):**

```json
[
 {
  "ITEMCODE": "vode-42182",
  "DESCRIPTION": "Samsung Galaxy S9 Svartur",
  "UNITPRICE1": "70961,2903225807",
  "RECORDMODIFIED": "2018-06-28T15:09:15.333Z"
 }
]
```


---

## [General/Table] Update Record

`PUT /api/v1/general/table/:name/:key`

This allows to update a record directly in the dkSystem  
*WARNING* : using this method needs to be fully tested before entering into production data

## Query Parameters
* **string** name - Table Name
* **key** key - the Id of the record to be updated

**Query params:**

- `output`=`Legacy` (optional/disabled in example) — Type of result
Legacy (**0**), KeyValue (**1**)
- `count`=`10` (optional/disabled in example) — Maximum number of records to return from the table  
> if more records have changed they will be returned as well
> so the returned count may be greater if more records have changed in the same millis

**Path variables:**

- `:name` (example: `pjjob`)
- `:key` (example: `Number`)

**Request body:**

```json
{
"Number":"0001",
"Name":"TEST UPDATE",
"JobDescription":"THIS IS A JOB DESCRIPTION"
}
```


---

## [General/Table] Record Delete

`DELETE /api/v1/general/table/:name?key=RecordId&value=6241`

This method allow direct polling into the dkSystem and bypasses all cache layers.

## Query Parameters
* **string** key
* **int** value

**Query params:**

- `key`=`RecordId`
- `value`=`6241`

**Path variables:**

- `:name` (example: `sohead`)

**Example response (400 Bad Request):**

```json
{
 "Message": "Cannot be deleted!"
}
```


---

## [General/Table] Fields

`GET /api/v1/general/table/:name/fields`

This method gets all field names availible for the table.

**Path variables:**

- `:name` (example: `initems`) — Table name


---

## [General/Table] Deleted

`GET /api/v1/general/table/:name/deleted`

This method returns information regarding records that have been deleted from the dkERP system  
and allow 3. party systems to remove for example products from their system.

## Query Paramenters
* **datetime** from `optional - default 15 days`

**Query params:**

- `from`=`2018-06-28T00:40:00.0000000` (optional/disabled in example)

**Path variables:**

- `:name` (example: `initems`) — Table name

**Example response (200 OK):**

```json
[
 {
  "Id": "mobiz52 tö-032",
  "Name": "Test item",
  "Created": "2018-06-19T15:42:28.838Z",
  "UniqeId": 12775
 },
 {
  "Id": "mobiz111 tö-032",
  "Name": "Test item",
  "Created": "2018-06-20T11:05:50.134Z",
  "UniqeId": 12949
 }
]
// ...array has 10 items total, showing 2
```


---

## [General/Table] Count

`GET /api/v1/general/table/:name/changes?modified=2018-06-28T00:40:00.0000000`

This method return the number of records that have been inserted or updated from the supplied date time

**Query params:**

- `modified`=`2018-06-28T00:40:00.0000000`

**Path variables:**

- `:name` (example: `initems`) — Table name

**Example response (200 OK):**

```json
{
 "Count": 4
}
```


---

## [General/Nation] Fetch

`GET /api/v1/nation/entry/:id`

**Path variables:**

- `:id` (example: `1710794709`)

**Example response (200 OK):**

```json
{
 "Number": "1710794709",
 "Name": "Þorvaldur Hafdal Jónsson",
 "Address": {
  "Address1": "Glitvöllum 32",
  "ZipCode": "221"
 }
}
```


---

## [General] Currencies

`GET /api/v1/general/currency`


---

## [General] Dimension

`GET /api/v1/general/dimension`

