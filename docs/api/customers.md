# dkPlus API — Customers

Base URL: https://api.dkplus.is/api/v1 — Auth: `Authorization: Bearer <token>`


---

## [Customers/Contacts] Fetch

`GET /api/v1/customer/:number/contact`

Get all contacts for the specified customer

**Path variables:**

- `:number` (example: `{{Customer_Number}}`) — Customer Number

**Example response (200 OK):**

```json
[
 {
  "Number": "0001",
  "Name": "Þorvaldur Hafdal Jónsson",
  "Title": "",
  "Address1": "",
  "Address2": "",
  "Address3": "",
  "City": "",
  "ZipCode": "",
  "CountryCode": "",
  "Department": "",
  "SSNumber": "",
  "Phone": "",
  "PhoneLocal": "",
  "PhoneMobile": "",
  "Fax": "",
  "Telex": "",
  "Email": "",
  "URL": "",
  "JobTitleCode": "",
  "Modified": "2014-05-17T16:28:12.744Z"
 }
]
```


---

## [Customers/Contacts] Remove

`DELETE /api/v1/customer/:customer/contact/:number`

**Path variables:**

- `:customer` (example: `{{Customer_Number}}`) — Customer Number
- `:number` (example: `0002`) — Contact Number


---

## [Customers/Contacts] Create

`POST /api/v1/customer/:number/Contact`

**Path variables:**

- `:number` (example: `{{Customer_Number}}`) — Customer Number

**Request body:**

```json
    {
        "Number": "0002",
        "Name": "Inga Guðrún",
        "Title": "",
        "Address1": "",
        "Address2": "",
        "Address3": "",
        "City": "",
        "ZipCode": "",
        "CountryCode": "",
        "Department": "",
        "SSNumber": "",
        "Phone": "",
        "PhoneLocal": "",
        "PhoneMobile": "",
        "Fax": "",
        "Telex": "",
        "Email": "",
        "URL": "",
        "JobTitleCode": ""
    }
```


---

## [Customers/Contacts] Update

`PUT /api/v1/customer/:number/contact/0002`

**Path variables:**

- `:number` (example: `{{Customer_Number}}`) — Customer Number

**Request body:**

```json
    {
        "Name": "Inga Guðrún",
        "Title": "Ms"
    }
```


---

## [Customers/Phone] Find By Phone

`GET /api/v1/customer/phone/:number`

This action allow the lookup of customer by looking up phone information on customer contacts and Recivers.

**Path variables:**

- `:number` (example: `5885522`)


---

## [Customers/Phone] Display Text

`GET /api/v1/customer/phone/:number/display?format={CallerName:CallerName.ToUpper - |}{Name}({Number})\r\nStaða:{Balance:n0}`

This action allow the lookup of customer by looking up phone information on customer contacts and Recivers.
and returns a display text that can be used for example in Phone System.

## Optinal Parameters  
* **string** - format
   
Example : {Name}({Number}) - {Balance:N0}\r\nAddress:{Address1}

**Query params:**

- `format`=`{CallerName:CallerName.ToUpper - |}{Name}({Number})\r\nStaða:{Balance:n0}`

**Path variables:**

- `:number` (example: `5885522`)


---

## [Customers/Transactions] Page

`GET /api/v1/customer/:number/transaction`

**Path variables:**

- `:number` (example: `{{Customer_Number}}`) — Number of the customer


---

## [Customers/Card] Get card

`GET /api/v1/customer/:number`

Use this method to get a fetch a specified customer.

**Path variables:**

- `:number` (example: `{{Customer_Number}}`) — Number of the customer to fetch

**Example response (200 OK):**

```json
{
 "RecordID": 2322,
 "Number": "1710794709",
 "Name": "Valdi H.",
 "Alias": "Valdi Hafdal",
 "Address1": "Glitvellir 32",
 "Address2": "Hafnarfirði",
 "Address3": "",
 "ZipCode": "221",
 "BalanceAmount": 336745903,
 "Phone": "",
 "PhoneLocal": "",
 "PhoneMobile": "8249903",
 "PhoneFax": "",
 "CountryCode": "IS",
 "OriginCountryCode": "",
 "Email": "valdi@dk.is",
 "Password": "",
 "Group": "a1",
 "SalesPerson": "001",
 "Discount": 17,
 "UseItemRecivers": false,
 "PaymentTerm": "d20",
 "PaymentMode": "ib",
 "CurrencyCode": "",
 "NoVat": false,
 "LedgerCode": "0001",
 "Blocked": false,
 "Gender": 0,
 "PriceGroup": 0,
 "BillingFee": 0,
 "Modified": "2019-11-26T16:13:51.247Z",
 "Contacts": [
  {
   "Number": "0002",
   "Name": "Inga Guðrún",
   "Title": "Ms",
   "Address1": "",
   "Address2": "",
   "Address3": "",
   "City": "",
   "ZipCode": "",
   "CountryCode": "",
   "Department": "",
   "SSNumber": "",
   "Phone": "",
   "PhoneLocal": "",
   "PhoneMobile": "",
   "Fax": "",
   "Telex": "",
   "Email": "",
   "URL": "",
   "JobTitleCode": "",
   "Modified": "2020-03-15T23:02:21.853Z"
  },
  {
   "Number": "0006",
   "Name": "Inga Guðrún",
   "Title": "",
   "Address1": "",
   "Address2": "",
   "Address3": "",
   "City": "",
   "ZipCode": "",
   "CountryCode": "",
   "Department": "",
   "SSNumber": "",
   "Phone": "",
   "PhoneLocal": "",
   "PhoneMobile": "",
   "Fax": "",
   "Telex": "",
   "Email": "",
   "URL": "",
   "JobTitleCode": "",
   "Modified": "2020-04-01T09:44:58.008Z"
  },
  {
   "Number": "0202903749",
   "Name": "Contact",
   "Title": "",
   "Address1": "Contact 1",
   "Address2": "",
   "Address3": "",
   "City": "",
   "ZipCode": "",
   "CountryCode": "",
   "Department": "",
   "SSNumber": "",
   "Phone": "",
   "PhoneLocal": "",
   "PhoneMobile": "",
   "Fax": "",
   "Telex": "",
   "Email": "",
   "URL": "",
   "JobTitleCode": "",
   "Modified": "2018-05-31T10:05:02.33Z"
  },
  {
   "Number": "0509902499",
   "Name": "Petur",
   "Title": "",
   "Address1": "",
   "Address2": "",
   "Address3": "",
   "City": "",
   "ZipCode": "",
   "CountryCode": "",
   "Department": "",
   "SSNumber": "",
   "Phone": "",
   "PhoneLocal": "",
   "PhoneMobile": "",
   "Fax": "",
   "Telex": "",
   "Email": "",
   "URL": "",
   "JobTitleCode": "",
   "Modified": "2018-05-28T13:57:59.392Z"
  },
  {
   "Number": "123456",
   "Name": "",
   "Title": "",
   "Address1": "",
   "Address2": "",
   "Address3": "",
   "City": "",
   "ZipCode": "",
   "CountryCode": "",
   "Department": "",
   "SSNumber": "",
   "Phone": "",
   "PhoneLocal": "",
   "PhoneMobile": "",
   "Fax": "",
   "Telex": "",
   "Email": "",
   "URL": "",
   "JobTitleCode": "",
   "Modified": "2018-05-28T14:59:44.269Z"
  },
  {
   "Number": "12345643250",
   "Name": "Contact",
   "Title": "",
   "Address1": "Contact 1",
   "Address2": "",
   "Address3": "",
   "City": "",
   "ZipCode": "",
   "CountryCode": "",
   "Department": "",
   "SSNumber": "",
   "Phone": "",
   "PhoneLocal": "",
   "PhoneMobile": "",
   "Fax": "",
   "Telex": "",
   "Email": "",
   "URL": "",
   "JobTitleCode": "",
   "Modified": "2018-05-31T10:11:38.058Z"
  },
  {
   "Number": "1906083010",
   "Name": "Jón Hafdal",
   "Title": "",
   "Address1": "",
   "Address2": "",
   "Address3": "",
   "City": "",
   "ZipCode": "",
   "CountryCode": "",
   "Department": "",
   "SSNumber": "",
   "Phone": "",
   "PhoneLocal": "",
   "PhoneMobile": "",
   "Fax": "",
   "Telex": "",
   "Email": "",
   "URL": "",
   "JobTitleCode": "",
   "Modified": "2019-04-02T22:21:53.12Z"
  },
  {
   "Number": "6321423412",
   "Name": "Contact",
   "Title": "",
   "Address1": "Contact 1",
   "Address2": "",
   "Address3": "",
   "City": "",
   "ZipCode": "",
   "CountryCode": "",
   "Department": "",
   "SSNumber": "",
   "Phone": "",
   "PhoneLocal": "",
   "PhoneMobile": "",
   "Fax": "",
   "Telex": "",
   "Email": "",
   "URL": "",
   "JobTitleCode": "",
   "Modified": "2018-05-31T09:27:00.462Z"
  },
  {
   "N
...[truncated]
```


---

## [Customers] Create

`POST /api/v1/customer`

# Create Customer  

## Properties for assignment
* **string** Number 
* **string** Name
* **string** Address1 ``` optional```
* **string** Address2 ``` optional```
* **string** ZipCode ``` optional```
* **string** Email ``` optional```
* **string** Phone ``` optional```
* **string** PhoneLocal ``` optional```
* **string** PhoneMobile ``` optional```

**Request body:**

```json
{
	"Number":"1906083010",
	"Name":"Jón Hafdal",
	"Address1":"Some Location"
}
```


---

## [Customers] Update

`PUT /api/v1/customer/:number`

# Create Customer  

## Properties for assignment
* **string** Number 
* **string** Name
* **string** Address1
* **string** Address2 
* **string** ZipCode
* **string** Email

**Path variables:**

- `:number` (example: `1906083010`) — Customer number to update

**Request body:**

```json
{
	"Name":"Valdi Hafdal",
	"Address1":"Some Location"
}
```


---

## [Customers] Remove

`DELETE /api/v1/customer/:number`

**Path variables:**

- `:number` (example: `1906083010`) — Number of the customer to delete


---

## [Customers] Fetch One

`GET /api/v1/customer/:number`

Use this method to get a fetch a specified customer.

**Path variables:**

- `:number` (example: `{{Customer_Number}}`) — Number of the customer to fetch

**Example response (200 OK):**

```json
{
 "RecordID": 2322,
 "Number": "1710794709",
 "Name": "Valdi H.",
 "Alias": "Valdi Hafdal",
 "Address1": "Glitvellir 32",
 "Address2": "Hafnarfirði",
 "Address3": "",
 "ZipCode": "221",
 "BalanceAmount": 336745903,
 "Phone": "",
 "PhoneLocal": "",
 "PhoneMobile": "8249903",
 "PhoneFax": "",
 "CountryCode": "IS",
 "OriginCountryCode": "",
 "Email": "valdi@dk.is",
 "Password": "",
 "Group": "a1",
 "SalesPerson": "001",
 "Discount": 17,
 "UseItemRecivers": false,
 "PaymentTerm": "d20",
 "PaymentMode": "ib",
 "CurrencyCode": "",
 "NoVat": false,
 "LedgerCode": "0001",
 "Blocked": false,
 "Gender": 0,
 "PriceGroup": 0,
 "BillingFee": 0,
 "Modified": "2019-11-26T16:13:51.247Z",
 "Contacts": [
  {
   "Number": "0002",
   "Name": "Inga Guðrún",
   "Title": "Ms",
   "Address1": "",
   "Address2": "",
   "Address3": "",
   "City": "",
   "ZipCode": "",
   "CountryCode": "",
   "Department": "",
   "SSNumber": "",
   "Phone": "",
   "PhoneLocal": "",
   "PhoneMobile": "",
   "Fax": "",
   "Telex": "",
   "Email": "",
   "URL": "",
   "JobTitleCode": "",
   "Modified": "2020-03-15T23:02:21.853Z"
  },
  {
   "Number": "0006",
   "Name": "Inga Guðrún",
   "Title": "",
   "Address1": "",
   "Address2": "",
   "Address3": "",
   "City": "",
   "ZipCode": "",
   "CountryCode": "",
   "Department": "",
   "SSNumber": "",
   "Phone": "",
   "PhoneLocal": "",
   "PhoneMobile": "",
   "Fax": "",
   "Telex": "",
   "Email": "",
   "URL": "",
   "JobTitleCode": "",
   "Modified": "2020-04-01T09:44:58.008Z"
  },
  {
   "Number": "0202903749",
   "Name": "Contact",
   "Title": "",
   "Address1": "Contact 1",
   "Address2": "",
   "Address3": "",
   "City": "",
   "ZipCode": "",
   "CountryCode": "",
   "Department": "",
   "SSNumber": "",
   "Phone": "",
   "PhoneLocal": "",
   "PhoneMobile": "",
   "Fax": "",
   "Telex": "",
   "Email": "",
   "URL": "",
   "JobTitleCode": "",
   "Modified": "2018-05-31T10:05:02.33Z"
  },
  {
   "Number": "0509902499",
   "Name": "Petur",
   "Title": "",
   "Address1": "",
   "Address2": "",
   "Address3": "",
   "City": "",
   "ZipCode": "",
   "CountryCode": "",
   "Department": "",
   "SSNumber": "",
   "Phone": "",
   "PhoneLocal": "",
   "PhoneMobile": "",
   "Fax": "",
   "Telex": "",
   "Email": "",
   "URL": "",
   "JobTitleCode": "",
   "Modified": "2018-05-28T13:57:59.392Z"
  },
  {
   "Number": "123456",
   "Name": "",
   "Title": "",
   "Address1": "",
   "Address2": "",
   "Address3": "",
   "City": "",
   "ZipCode": "",
   "CountryCode": "",
   "Department": "",
   "SSNumber": "",
   "Phone": "",
   "PhoneLocal": "",
   "PhoneMobile": "",
   "Fax": "",
   "Telex": "",
   "Email": "",
   "URL": "",
   "JobTitleCode": "",
   "Modified": "2018-05-28T14:59:44.269Z"
  },
  {
   "Number": "12345643250",
   "Name": "Contact",
   "Title": "",
   "Address1": "Contact 1",
   "Address2": "",
   "Address3": "",
   "City": "",
   "ZipCode": "",
   "CountryCode": "",
   "Department": "",
   "SSNumber": "",
   "Phone": "",
   "PhoneLocal": "",
   "PhoneMobile": "",
   "Fax": "",
   "Telex": "",
   "Email": "",
   "URL": "",
   "JobTitleCode": "",
   "Modified": "2018-05-31T10:11:38.058Z"
  },
  {
   "Number": "1906083010",
   "Name": "Jón Hafdal",
   "Title": "",
   "Address1": "",
   "Address2": "",
   "Address3": "",
   "City": "",
   "ZipCode": "",
   "CountryCode": "",
   "Department": "",
   "SSNumber": "",
   "Phone": "",
   "PhoneLocal": "",
   "PhoneMobile": "",
   "Fax": "",
   "Telex": "",
   "Email": "",
   "URL": "",
   "JobTitleCode": "",
   "Modified": "2019-04-02T22:21:53.12Z"
  },
  {
   "Number": "6321423412",
   "Name": "Contact",
   "Title": "",
   "Address1": "Contact 1",
   "Address2": "",
   "Address3": "",
   "City": "",
   "ZipCode": "",
   "CountryCode": "",
   "Department": "",
   "SSNumber": "",
   "Phone": "",
   "PhoneLocal": "",
   "PhoneMobile": "",
   "Fax": "",
   "Telex": "",
   "Email": "",
   "URL": "",
   "JobTitleCode": "",
   "Modified": "2018-05-31T09:27:00.462Z"
  },
  {
   "N
...[truncated]
```


---

## [Customers] Fetch All

`GET /api/v1/customer/:objects`

**Path variables:**

- `:objects` (example: `true`) — Include attached customer objects


---

## [Customers] By Group

`GET /api/v1/customer/group/:number`

**Path variables:**

- `:number` (example: `a1`)


---

## [Customers] Groups

`GET /api/v1/customergroup`


---

## [Customers] Transactions

`GET /api/v1/customer/:number/transaction`

**Path variables:**

- `:number` (example: `{{Customer_Number}}`) — Number of the customer


---

## [Customers] Orders

`GET /api/v1/customer/:number/order`

**Path variables:**

- `:number` (example: `{{Customer_Number}}`) — Number of the customer


---

## [Customers] Quotes

`GET /api/v1/customer/:number/quote`

**Path variables:**

- `:number` (example: `{{Customer_Number}}`) — Number of the customer


---

## [Customers] Invoices

`GET /api/v1/customer/:number/invoice`

Use this method to get invoice overview for a customer.  
for more details for an invoice you can call /api/v1/invoice/ID

**Path variables:**

- `:number` (example: `{{Customer_Number}}`) — Number of the customer

**Example response (200 OK):**

```json
[
 {
  "Number": "14874",
  "CNumber": "1710794709",
  "CName": "Þorvaldur Hafdal",
  "CAddress1": "Glitvellir 32",
  "CAddress2": "Hafnarfirði",
  "CZipCode": "221",
  "CCountryCode": "IS",
  "CSSNumber": "1710794709",
  "CPhone": "",
  "CContact": "",
  "RecordID": 14657,
  "OrderNumber": 0,
  "InvoiceDate": "2018-05-14T00:00:00Z",
  "DiscountPercent": 0,
  "Discount": 722.837681531937,
  "TotalAmount": 722.58064516129,
  "TotalAmountWithTax": 896,
  "Currency": "ISK",
  "Reference": "",
  "SettledType": 0,
  "SettledAmount": 0,
  "SalePerson": "001",
  "Text1": "",
  "Text2": "City Tax of 300 ISK + VAT per room per night is included in the room rate",
  "Origin": 0,
  "PaymentTerm": "D20",
  "ClaimStatus": 0,
  "Exchange": 1,
  "SalesType": 0,
  "Version": 0,
  "Project": "vbygg",
  "IRNumber": "",
  "IRName": "",
  "IRAddress1": "",
  "IRAddress2": "",
  "IRZipCode": "",
  "IRContact": ""
 },
 {
  "Number": "14724",
  "CNumber": "1710794709",
  "CName": "Þorvaldur Hafdal",
  "CAddress1": "Glitvellir 32",
  "CAddress2": "Hafnarfirði",
  "CZipCode": "221",
  "CCountryCode": "IS",
  "CSSNumber": "1710794709",
  "CPhone": "",
  "CContact": "",
  "RecordID": 14507,
  "OrderNumber": 0,
  "InvoiceDate": "2018-04-28T00:00:00Z",
  "DiscountPercent": 0,
  "Discount": 722.837681531937,
  "TotalAmount": 1281.45161290323,
  "TotalAmountWithTax": 1589,
  "Currency": "ISK",
  "Reference": "",
  "SettledType": 0,
  "SettledAmount": 0,
  "SalePerson": "001",
  "Text1": "",
  "Text2": "City Tax of 300 ISK + VAT per room per night is included in the room rate",
  "Origin": 0,
  "PaymentTerm": "D20",
  "ClaimStatus": 0,
  "Exchange": 1,
  "SalesType": 0,
  "Version": 0,
  "Project": "",
  "IRNumber": "",
  "IRName": "",
  "IRAddress1": "",
  "IRAddress2": "",
  "IRZipCode": "",
  "IRContact": ""
 }
]
// ...array has 213 items total, showing 2
```


---

## [Customers] Project

`GET /api/v1/customer/:number/project`

This method returns all projects where the customer is the owner of the projects.

**Path variables:**

- `:number` (example: `{{Customer_Number}}`) — Customer number



---

## [Customers] Download Attachment

`GET /api/v1/customer/:number/attachment/:id`

## Description
Using this function allows you to retrive an attachment that has been assigned to a customer  
  
### Usage  
Supply the customer number and id of the attachment in the URL  
this will return a status OK along with the attachment data
* ContentType - Mime Type
* ContentDisposition - FileName
* Byte content of the file

**Path variables:**

- `:number` (example: `{{Customer_Number}}`)
- `:id` (example: `169`)


---

## [Customers] Search

`GET /api/v1/customer/search/:searchstring`

**Path variables:**

- `:searchstring` (example: `{{ExampleSearch}}`) — A string to search for a customer


---

## [Customers] Page

`GET /api/v1/customer/page/:page/:count`

**Query params:**

- `group`=`a1` (optional/disabled in example)
- `zipcode`=`780` (optional/disabled in example)
- `attribute`=`` (optional/disabled in example)
- `attributeoption`=`Akurey` (optional/disabled in example)
- `country`=`gb` (optional/disabled in example)
- `salesperson`=`dp` (optional/disabled in example)
- `paymentmode`=`bm` (optional/disabled in example)
- `paymentterm`=`` (optional/disabled in example)
- `novat`=`true` (optional/disabled in example)
- `blocked`=`false` (optional/disabled in example)
- `include`=`Number,Name,Group` (optional/disabled in example)

**Path variables:**

- `:page` (example: `1`)
- `:count` (example: `1000`)

**Example response (200 OK):**

```json
[
 {
  "RecordID": 2475,
  "Number": "9846382268",
  "Name": "Marjo Välkkynen",
  "Alias": "",
  "Address1": "03874 ???????? Terrace Suite 3",
  "Address2": "",
  "Address3": "",
  "ZipCode": "188",
  "BalanceAmount": 0,
  "Phone": "0",
  "PhoneLocal": "",
  "PhoneMobile": "",
  "PhoneFax": "",
  "CountryCode": "IS",
  "OriginCountryCode": "",
  "Email": "k@.biz",
  "Password": "",
  "Group": "",
  "SalesPerson": "",
  "Discount": 0,
  "UseItemRecivers": false,
  "PaymentTerm": "stgr",
  "PaymentMode": "rafr",
  "CurrencyCode": "",
  "NoVat": false,
  "LedgerCode": "0001",
  "Blocked": false,
  "Gender": 0,
  "PriceGroup": 0,
  "BillingFee": 0,
  "Modified": "2015-10-20T19:43:09.279Z",
  "Contacts": [],
  "Recivers": [],
  "Memos": [],
  "Properties": [],
  "Changes": [],
  "Attachments": []
 },
 {
  "RecordID": 2477,
  "Number": "0356305030",
  "Name": "Magdalena Fras",
  "Alias": "",
  "Address1": "Vožarski pot 3\n6930 Kocevje",
  "Address2": "",
  "Address3": "",
  "ZipCode": "196",
  "BalanceAmount": 0,
  "Phone": "0",
  "PhoneLocal": "",
  "PhoneMobile": "",
  "PhoneFax": "",
  "CountryCode": "IS",
  "OriginCountryCode": "",
  "Email": "de-rosa.kristel@yahoo.com",
  "Password": "",
  "Group": "",
  "SalesPerson": "",
  "Discount": 0,
  "UseItemRecivers": false,
  "PaymentTerm": "stgr",
  "PaymentMode": "rafr",
  "CurrencyCode": "",
  "NoVat": false,
  "LedgerCode": "0001",
  "Blocked": false,
  "Gender": 0,
  "PriceGroup": 0,
  "BillingFee": 0,
  "Modified": "2015-10-20T19:44:41.455Z",
  "Contacts": [],
  "Recivers": [],
  "Memos": [],
  "Properties": [],
  "Changes": [],
  "Attachments": []
 }
]
// ...array has 100 items total, showing 2
```

