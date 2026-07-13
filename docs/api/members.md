# dkPlus API — Members

Base URL: https://api.dkplus.is/api/v1 — Auth: `Authorization: Bearer <token>`


---

## [Members/Applications] Submit Application

`POST /api/v1/member/:number/application`

**Path variables:**

- `:number` (example: `{{Customer_Number}}`)

**Request body:**

```json
{
	"Fund":"02",
	"Grant" : "vvv",
	"Description" :"Some Desc",
	"BankAccount":
	{
		"Code":"111",
		"Group":"26",
		"Account":"790"
	}
}
```


---

## [Members/Applications] Upload Application Attachment

`POST /api/v1/member/:number/application/:id/attachment`

**Path variables:**

- `:number` (example: `{{Customer_Number}}`)
- `:id` (example: `100`)


---

## [Members/Applications] Update Status

`PUT /api/v1/member/:number/application/:id?fund=abcd&status=OnHold`

## Status  
InProgress**(0)**, Accepted**(1)**, Rejected**(2)**, Expired**(3)**,PartlyPaid**(4)**, FullyPaid**(5)**, Closed**(6)**, PayedToCompany**(7)**, OnHold**(8)**, Invalid**(9)**, NotFinished**(10)**

**Query params:**

- `fund`=`abcd`
- `status`=`OnHold`

**Path variables:**

- `:number` (example: `{{Customer_Number}}`)
- `:id` (example: `100`)


---

## [Members/Applications] Application Attachments

`GET /api/v1/member/fund/:fund/application/:id/attachments`

**Path variables:**

- `:fund` (example: `02`)
- `:id` (example: `50`)


---

## [Members/Applications] Application Download  Attachment

`GET /api/v1/member/fund/:fund/application/:application/attachments/:id`

Download application attachment.

**Path variables:**

- `:fund` (example: `99`)
- `:application` (example: `10000`)
- `:id` (example: `123456`)


---

## [Members/Fee] Create

`POST /api/v1/member/:number/fee`

# Create Member Fee  
Use this methor to create a member fee that can be a one time or re-occuring.  

## Properties for assignment
* **Period** Period 
* **Discount** Discount
* **Payment** Payment ``` optional```
* **string** Interval ``` optional```
* **string** Campaign ``` optional```
* **string** FeeTypel ``` optional```
* **string** Memo ``` optional```
* **string** ContactName ``` optional```
* **string** SalesPerson ``` optional```
* **string** CreditCard ``` optional```
* **string** Amount 
* **string** ItemCode `

**Path variables:**

- `:number` (example: `{{Customer_Number}}`) — Member Number

**Request body:**

```json
{
  "Period": {
    "From": "2020-05-01"
  },
  "Payment": {
    "Mode": "GKR",
    "Term": "D20"
  },
  "Interval": "OneTime",
  "Campaign": "c2020d",
  "Memo": "This is a donation",
  "Saleperson": "WEB",
  "CreditCard": {
    "CardType": 0,
    "CardNumber": "string",
    "ExpDate": "2020-04-28T16:30:44.852Z",
    "SSNumber": "string",
    "Name": "string"
  },
  "Amount": 5000,
  "ItemCode": "D001"
}

```


---

## [Members] Members

`GET /api/v1/member/:page/:count?modified=2019-01-1`

**Query params:**

- `group`=`dkbokv` (optional/disabled in example)
- `zipcode`=`780` (optional/disabled in example)
- `country`=`gb` (optional/disabled in example)
- `salesperson`=`dp` (optional/disabled in example)
- `paymentmode`=`bm` (optional/disabled in example)
- `novat`=`true` (optional/disabled in example)
- `blocked`=`true` (optional/disabled in example)
- `modified`=`2019-01-1`

**Path variables:**

- `:page` (example: `1`) — Page number
- `:count` (example: `100`) — Max objects to return


---

## [Members] Member

`GET /api/v1/member/:number`

**Path variables:**

- `:number` (example: `{{Customer_Number}}`)

**Example response (200 OK):**

```json
{
 "ID": 2322,
 "Created": "2013-09-13T16:25:57.817Z",
 "Modified": "2019-01-23T19:35:01.681Z",
 "Number": "1710794709",
 "Name": "Þorvaldur Hafdal",
 "SSNumber": "1710794709",
 "Address": {
  "Address1": "Glitvellir 32",
  "Address2": "Hafnarfirði",
  "Address3": "",
  "Address4": "",
  "ZipCode": "221",
  "City": "Hafnarfirði",
  "CountryCode": "",
  "CountryName": "Ísland",
  "CountyCode": ""
 },
 "ContactDetail": {
  "Phone": "",
  "Direct": "",
  "Mobile": "",
  "Fax": "",
  "Telex": "",
  "Email": "valdi@dk.is",
  "URL": ""
 },
 "Password": "",
 "Group": "a1",
 "Tag": "m",
 "SalesPerson": "001",
 "Discount": 0,
 "PaymentType": "",
 "CurrencyCode": "",
 "NoVat": false,
 "LedgerCode": "0001",
 "Points": 0,
 "Statistics": {
  "MemberAge": 14.08,
  "CareerAge": 2.07
 },
 "Status": {
  "Blocked": false,
  "Dead": false,
  "Retired": false,
  "Disabled": false
 },
 "Gender": 0,
 "PaymentMode": "",
 "HasConfirmedTerms": false,
 "ConfirmedTermId": 0,
 "ExtraProperties": {}
}
```


---

## [Members] Applications

`GET /api/v1/member/:number/application`

**Path variables:**

- `:number` (example: `{{Customer_Number}}`)


---

## [Members] SubGroups

`GET /api/v1/member/:number/subgroup`

**Path variables:**

- `:number` (example: `{{Customer_Number}}`)


---

## [Members] Career

`GET /api/v1/member/:number/Career`

**Path variables:**

- `:number` (example: `{{Customer_Number}}`)

**Example response (200 OK):**

```json
[
 {
  "ID": 1,
  "Company": "0001",
  "JobTitleCode": "",
  "JobTitle": "",
  "Period": {
   "From": "2009-12-13T00:00:00Z",
   "To": "2012-05-13T00:00:00Z"
  },
  "WorkPercentage": 100,
  "Description": "Týndur á þessum tíma",
  "Workplace": "",
  "WorkplaceName": "",
  "CompanyName": "Staðgreitt"
 },
 {
  "ID": 2,
  "Company": "5805051200",
  "JobTitleCode": "",
  "JobTitle": "",
  "Period": {
   "From": "2013-07-13T00:00:00Z",
   "To": "2013-09-13T00:00:00Z"
  },
  "WorkPercentage": 100,
  "Description": "Var að finnast",
  "Workplace": "",
  "WorkplaceName": "",
  "CompanyName": "C&C ehf"
 }
]
```


---

## [Members] Fund

`GET /api/v1/member/:number/fund`

**Path variables:**

- `:number` (example: `{{Customer_Number}}`)


---

## [Members] Education

`GET /api/v1/member/:number/education`

**Path variables:**

- `:number` (example: `{{Customer_Number}}`)

**Example response (200 OK):**

```json
[
 {
  "ID": 1,
  "Member": "1710794709",
  "Institution": "0001",
  "Period": {
   "From": "1995-09-01T00:00:00Z",
   "To": "1995-12-31T00:00:00Z"
  },
  "Course": {
   "Code": "0004",
   "Text": "",
   "Description": "Vélstjórn"
  },
  "Description": "1. Stýrimaður",
  "Reference": "",
  "ZipCode": "",
  "CountryCode": "IS",
  "MasterSSNumber": "",
  "MasterName": "",
  "CompanySSNumber": "",
  "CompanyName": "",
  "InstitutionDesc": "Vélskóli Íslands"
 },
 {
  "ID": 2,
  "Member": "1710794709",
  "Institution": "0002",
  "Period": {
   "From": "1996-09-01T00:00:00Z",
   "To": "1996-12-31T00:00:00Z"
  },
  "Course": {
   "Code": "0005",
   "Text": "",
   "Description": "Skiptsjórn"
  },
  "Description": "1. Skiptsjóri",
  "Reference": "",
  "ZipCode": "",
  "CountryCode": "",
  "MasterSSNumber": "",
  "MasterName": "",
  "CompanySSNumber": "",
  "CompanyName": "",
  "InstitutionDesc": "Stýrimannaskóli"
 }
]
// ...array has 5 items total, showing 2
```


---

## [Members] Membership

`GET /api/v1/member/:number/membership`

**Path variables:**

- `:number` (example: `{{Customer_Number}}`)


---

## [Members] Create

`POST /api/v1/member`

**Request body:**

```json
{
	"Number":"1122334455",
	"Name" : "New Member",
	"Address":
	{
		"Address1" : "Black street 5",
		"Address2" : "red house",
		"ZipCode" : "101",
		"City" : "Reykjavik",
		"CountryCode" : "IS"
	},
	"ContactDetail":
	{
		"Phone" : "1234567",
		"Mobile" : "9875643",
		"Email" : "123456@domain.com"
	},
	"Tag" : "IKE"
}
```

**Example response (200 OK):**

```json
{
 "ID": 6783,
 "Created": "2019-01-23T19:09:03.77Z",
 "Modified": "2019-01-23T19:09:03.77Z",
 "Number": "prufa3",
 "Name": "New Member",
 "SSNumber": "",
 "Address": {
  "Address1": "Black street 5",
  "Address2": "red house",
  "Address3": "",
  "Address4": "",
  "ZipCode": "101",
  "City": "Reykjavík",
  "CountryCode": "",
  "CountryName": "Ísland",
  "CountyCode": ""
 },
 "ContactDetail": {
  "Phone": "1234567",
  "Direct": "",
  "Mobile": "9875643",
  "Fax": "",
  "Telex": "",
  "Email": "123456@domain.com",
  "URL": ""
 },
 "Password": "",
 "Group": "a1",
 "Tag": "m",
 "SalesPerson": "001",
 "Discount": 0,
 "PaymentType": "",
 "CurrencyCode": "",
 "NoVat": false,
 "LedgerCode": "0001",
 "Points": 0,
 "Statistics": {
  "MemberAge": 0,
  "CareerAge": 0
 },
 "Status": {
  "Blocked": false,
  "Dead": false,
  "Retired": false,
  "Disabled": false
 },
 "Gender": 0,
 "PaymentMode": "",
 "HasConfirmedTerms": false,
 "ConfirmedTermId": 0,
 "ExtraProperties": {}
}
```


---

## [Members] Update

`PUT /api/v1/member/:number`

**Path variables:**

- `:number` (example: `{{Customer_Number}}`)

**Request body:**

```json
{
	"Name" : "Updated Member",
	"ContactDetail":
	{
		"Email" : "name@domain.com"
	}
}
```

**Example response (200 OK):**

```json
{
 "ID": 6783,
 "Created": "2019-01-23T19:09:03.77Z",
 "Modified": "2019-01-23T19:18:13.783Z",
 "Number": "prufa3",
 "Name": "Updated Member",
 "SSNumber": "",
 "Address": {
  "Address1": "Black street 5",
  "Address2": "red house",
  "Address3": "",
  "Address4": "",
  "ZipCode": "101",
  "City": "Reykjavík",
  "CountryCode": "",
  "CountryName": "Ísland",
  "CountyCode": ""
 },
 "ContactDetail": {
  "Phone": "1234567",
  "Direct": "",
  "Mobile": "9875643",
  "Fax": "",
  "Telex": "",
  "Email": "name@domain.com",
  "URL": ""
 },
 "Password": "",
 "Group": "a1",
 "Tag": "m",
 "SalesPerson": "001",
 "Discount": 0,
 "PaymentType": "",
 "CurrencyCode": "",
 "NoVat": false,
 "LedgerCode": "0001",
 "Points": 0,
 "Statistics": {
  "MemberAge": 0,
  "CareerAge": 0
 },
 "Status": {
  "Blocked": false,
  "Dead": false,
  "Retired": false,
  "Disabled": false
 },
 "Gender": 0,
 "PaymentMode": "",
 "HasConfirmedTerms": false,
 "ConfirmedTermId": 0,
 "ExtraProperties": {}
}
```

