# dkPlus API — Sales

Base URL: https://api.dkplus.is/api/v1 — Auth: `Authorization: Bearer <token>`


---

## [Sales/Invoice/Payment Plan] Create

`POST /api/v1/sales/invoice/:number/paymentplan`

**Path variables:**

- `:number` (example: `234029`) — Number of invoice to return

**Request body:**

```json
{
  "Description": "My Payment Plan",
  "Amount": 1000,
  "Transactions": [
    {
      "Amount": 1000,
      "Date": "2020-04-01"
    }
  ],
  "Reference": "ABCD",
  "Card": {
    "Number": "12345678901235456",
    "Type": "debitcard"
  },
  "SenderId": "someid123"
}
```


---

## [Sales/Invoice/Payment Plan] Cancel

`PUT /api/v1/sales/invoice/:invoice/paymentplan/:number`

**Path variables:**

- `:invoice` (example: `1234`)
- `:number` (example: `1`)

**Request body:**

```json
{
  "User": "uID",
  "Reason": "Returned items"
}
```


---

## [Sales/Invoice] Create

`POST /api/v1/sales/invoice?post=true`

## Properties
* **Customer** Customer 
* **SaleType** SaleType ``` optional - Debit(0) ,Credit(1) Default=Debit```
* **string**  Reference 
* **string** Text1  ``` optional, max: 2000 char```
* **string** Text2  ``` optional, max: 2000 char```
* **string** Term  ``` optional, uses customer terms by default```
* **Options** Options
* **DateTime** Date  
* **DateTime** DueDate ``` optional, default uses customer payment term```
* **string** Currency ``` optional```
* **string** SalesPerson 
* **double** Exchange ``` optional```
* **string** Currency ``` optional```
* **Array Line** Lines 
* **Array Payment** Payments ``` optional```
* **File** Attachment ``` optional```

  
### Customer  
* **string** Number
* **string** Name ``` optional```  
* **string** Address1 ``` optional```  
* **string** Address2 ``` optional```
* **string** ZipCode ``` optional```
* **string** Country ``` optional
...[truncated]

**Query params:**

- `post`=`true` — Optional paramter and is default true

**Request body:**

```json
{
    "Reference": "TST-0001",
    "Customer": {
        "Number": "1710794709"
    },
    "Lines": [
        {
            "ItemCode": "0001",
            "Price": 0,
            "Quantity": 1
        }
    ],
    "Contact": {
        "Number": "ABCD",
        "Name": "Jón Hafdal"
    },
    "Receiver": {
        "Name": "Atli Hafdal",
        "Address1": "Glitvellir",
        "ZipCode": "221",
        "City": "Hafnarfjörður"
    }
}
```

**Example response (200 OK):**

```json
{
 "Number": "14656",
 "CNumber": "1710794709",
 "CName": "Þorvaldur Hafdal",
 "CAddress1": "Sommer Street",
 "CAddress2": "Hafnarfirði",
 "CZipCode": "221",
 "CCountryCode": "IS",
 "CSSNumber": "1710794709",
 "CPhone": "",
 "CContact": "",
 "RecordID": 14439,
 "OrderNumber": 0,
 "InvoiceDate": "2018-03-11T00:00:00Z",
 "DiscountPercent": 0,
 "Discount": 0,
 "TotalAmount": 1000,
 "TotalAmountWithTax": 1000,
 "Currency": "ISK",
 "Reference": "",
 "SettledType": 0,
 "SettledAmount": 0,
 "SalePerson": "001",
 "Text1": "",
 "Text2": "",
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
 "IRContact": "",
 "Lines": [
  {
   "SequenceNumber": 20000,
   "ItemCode": "00001",
   "Text": "Example Item",
   "Text2": "Extra text",
   "Warehouse": "bg1",
   "Quantity": 2,
   "UnitCode": "",
   "UnitPrice": 500,
   "UnitPriceWithTax": 500,
   "Discount": 0,
   "DiscountAmount": 0,
   "DiscountAmountWithTax": 0,
   "TotalAmount": 1000,
   "TotalAmountWithTax": 1000,
   "Dim1": "",
   "Variations": []
  }
 ]
}
```


---

## [Sales/Invoice] Calculate

`PATCH /api/v1/sales/invoice/calculate`

This method takes in a invoice model and returns it populated with prices based on product,customer and discount rules.

## Properties
* **Customer** Customer 
* **DateTime** Date  
* **string** SalesPerson 
* **double** Exchange ``` optional```
* **string** Currency ``` optional```
* **Array Line** Lines 

### Customer  
* **string** Number

### Line 
* **string** ItemCode
* **string** WareHouse ``` optional```
* **double** Quantity

**Request body:**

```json
{
    "Customer": {
        "Number": "1710794709"
    },
    "Lines": [
        {
            "ItemCode": "007059",
            "Quantity": 1
        }
    ]
}
```

**Example response (200 OK):**

```json
{
 "CNumber": "1710794709",
 "RecordID": 0,
 "OrderNumber": 0,
 "InvoiceDate": "2019-11-05T15:19:00.2076415+00:00",
 "DueDate": "0001-01-01T00:00:00",
 "DiscountPercent": 0,
 "Discount": 0,
 "TotalAmount": 744.103585657371,
 "TotalAmountWithTax": 933.85,
 "Currency": "ISK",
 "SettledType": 0,
 "SettledAmount": 0,
 "SalePerson": "web",
 "Origin": 0,
 "ClaimStatus": 0,
 "Exchange": 0,
 "SalesType": 0,
 "Version": 0,
 "IRNumber": "",
 "ExternalInvoiceNumber": 0,
 "ClaimNumber": 0,
 "ClaimDate": "0001-01-01T00:00:00",
 "PosInvoice": 0,
 "Lines": [
  {
   "SequenceNumber": 0,
   "ItemCode": "007059",
   "Quantity": 1,
   "UnitPrice": 783.266932270916,
   "UnitPriceWithTax": 983,
   "Discount": 5,
   "DiscountAmount": 37.2051792828685,
   "DiscountAmountWithTax": 46.6925,
   "TotalAmount": 744.103585657371,
   "TotalAmountWithTax": 933.85,
   "Variations": []
  }
 ]
}
```


---

## [Sales/Invoice] Reverse

`POST /api/v1/sales/invoice/:number/reverse?post=true&date=2019-11-14`

Use this method to create a credit invoice for a posted invoice.

**Query params:**

- `post`=`true` — Optional param and is default true
- `date`=`2019-11-14` — Optional - if not supplied then date from original invoice is used.

**Path variables:**

- `:number` (example: `17176`)

**Request body:**

```json
{
    "Reference": "TST-0001",
    "Customer": {
        "Number": "1710794709"
    },
    "Lines": [
        {
            "ItemCode": "00001",
            "Price": 1000,
            "Quantity": 2
        }
    ],
    "Contact": {
        "Number": "ABCD",
        "Name": "Jón Hafdal"
    },
    "Receiver": {
        "Name": "Atli Hafdal",
        "Address1": "Glitvellir",
        "ZipCode": "221",
        "City": "Hafnarfjörður"
    }
}
```

**Example response (200 OK):**

```json
{
 "Number": "19687",
 "CNumber": "1710794709",
 "CName": "Þorvaldur Hafdal",
 "CAddress1": "Glitvellir 32",
 "CAddress2": "Hafnarfirði",
 "CZipCode": "221",
 "CCountryCode": "IS",
 "CSSNumber": "1710794709",
 "CPhone": "",
 "CContact": "ABCD",
 "RecordID": 19271,
 "OrderNumber": 0,
 "InvoiceDate": "2019-11-14T00:00:00Z",
 "DueDate": "2019-12-04T00:00:00+00:00",
 "DiscountPercent": 17,
 "Discount": 0,
 "TotalAmount": -2000,
 "TotalAmountWithTax": -2000,
 "Currency": "ISK",
 "Reference": "TST-0001",
 "SettledType": 0,
 "SettledAmount": 0,
 "SalePerson": "001",
 "Text1": "",
 "Text2": "",
 "Origin": 0,
 "PaymentTerm": "d20",
 "ClaimStatus": 0,
 "Exchange": 1,
 "SalesType": 1,
 "Version": 0,
 "Project": "",
 "IRNumber": "",
 "IRName": "",
 "IRAddress1": "",
 "IRAddress2": "",
 "IRZipCode": "",
 "IRContact": "",
 "ExternalInvoiceNumber": 0,
 "ClaimNumber": 0,
 "ClaimDate": "0001-01-01T00:00:00",
 "Register": "",
 "PosInvoice": 0,
 "Lines": [
  {
   "SequenceNumber": 20000,
   "ItemCode": "00001",
   "Text": "Framrúðuskipti",
   "Text2": "Veit ekki",
   "Warehouse": "bg1",
   "Quantity": -2,
   "UnitCode": "",
   "UnitPrice": 1000,
   "UnitPriceWithTax": 1000,
   "Discount": 0,
   "DiscountAmount": 0,
   "DiscountAmountWithTax": 0,
   "TotalAmount": -2000,
   "TotalAmountWithTax": -2000,
   "Dim1": "",
   "Variations": []
  }
 ]
}
```


---

## [Sales/Invoice] Fetch One

`GET /api/v1/sales/invoice/:number`

**Path variables:**

- `:number` (example: `1000`) — Number of invoice to return

**Example response (200 OK):**

```json
{
 "Number": "1000",
 "CNumber": "5304942339",
 "CName": "Bílaþvottastöðin Laugin ehf.",
 "CAddress1": "Grundarás 17",
 "CAddress2": "",
 "CZipCode": "110",
 "CCountryCode": "",
 "CSSNumber": "5304942339",
 "CPhone": "568 8330",
 "CContact": "",
 "RecordID": 871,
 "OrderNumber": 0,
 "InvoiceDate": "2002-12-11T00:00:00Z",
 "DiscountPercent": 0,
 "Discount": 0,
 "TotalAmount": 79257,
 "TotalAmountWithTax": 98675,
 "Currency": "ISK",
 "Reference": "",
 "SettledType": 2,
 "SettledAmount": 98675,
 "SalePerson": "mf",
 "Text1": "",
 "Text2": "",
 "Dim1": null,
 "Origin": 0,
 "PaymentTerm": "",
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
 "IRContact": "",
 "Lines": [
  {
   "SequenceNumber": 0,
   "ItemCode": "dk-4000b",
   "Text": "dk Einyrki - B",
   "Text2": "",
   "Warehouse": "bg1",
   "Quantity": 1,
   "UnitCode": "",
   "UnitPrice": 64257.0281124498,
   "UnitPriceWithTax": 80000,
   "Discount": 0,
   "DiscountAmount": 0,
   "DiscountAmountWithTax": 0,
   "TotalAmount": 64257,
   "TotalAmountWithTax": 80000,
   "Dim1": "",
   "Variations": []
  },
  {
   "SequenceNumber": 0,
   "ItemCode": "106v",
   "Text": "Útseld vinna MF",
   "Text2": "",
   "Warehouse": "bg1",
   "Quantity": 2,
   "UnitCode": "",
   "UnitPrice": 7500,
   "UnitPriceWithTax": 9337.5,
   "Discount": 0,
   "DiscountAmount": 0,
   "DiscountAmountWithTax": 0,
   "TotalAmount": 15000,
   "TotalAmountWithTax": 18675,
   "Dim1": "",
   "Variations": []
  }
 ]
}
```


---

## [Sales/Invoice] Refresh

`PATCH /api/v1/sales/invoice/:number/refresh`

**Path variables:**

- `:number` (example: `234029`) — Number of invoice to return

**Example response (200 OK):**

```json
{
 "Number": "1000",
 "CNumber": "5304942339",
 "CName": "Bílaþvottastöðin Laugin ehf.",
 "CAddress1": "Grundarás 17",
 "CAddress2": "",
 "CZipCode": "110",
 "CCountryCode": "",
 "CSSNumber": "5304942339",
 "CPhone": "568 8330",
 "CContact": "",
 "RecordID": 871,
 "OrderNumber": 0,
 "InvoiceDate": "2002-12-11T00:00:00Z",
 "DiscountPercent": 0,
 "Discount": 0,
 "TotalAmount": 79257,
 "TotalAmountWithTax": 98675,
 "Currency": "ISK",
 "Reference": "",
 "SettledType": 2,
 "SettledAmount": 98675,
 "SalePerson": "mf",
 "Text1": "",
 "Text2": "",
 "Dim1": null,
 "Origin": 0,
 "PaymentTerm": "",
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
 "IRContact": "",
 "Lines": [
  {
   "SequenceNumber": 0,
   "ItemCode": "dk-4000b",
   "Text": "dk Einyrki - B",
   "Text2": "",
   "Warehouse": "bg1",
   "Quantity": 1,
   "UnitCode": "",
   "UnitPrice": 64257.0281124498,
   "UnitPriceWithTax": 80000,
   "Discount": 0,
   "DiscountAmount": 0,
   "DiscountAmountWithTax": 0,
   "TotalAmount": 64257,
   "TotalAmountWithTax": 80000,
   "Dim1": "",
   "Variations": []
  },
  {
   "SequenceNumber": 0,
   "ItemCode": "106v",
   "Text": "Útseld vinna MF",
   "Text2": "",
   "Warehouse": "bg1",
   "Quantity": 2,
   "UnitCode": "",
   "UnitPrice": 7500,
   "UnitPriceWithTax": 9337.5,
   "Discount": 0,
   "DiscountAmount": 0,
   "DiscountAmountWithTax": 0,
   "TotalAmount": 15000,
   "TotalAmountWithTax": 18675,
   "Dim1": "",
   "Variations": []
  }
 ]
}
```


---

## [Sales/Invoice] By Reference

`GET /api/v1/sales/invoice/reference/:referencenumber`

Returns all invoices that have the supplied reference assigned to them.  
**NOTE:** support paging as optional parameters /page/count .... /1/100 will return page 1 with maximum 100 invoices

**Path variables:**

- `:referencenumber` (example: `SK-12345`) — Reference assigned to invoices to return


---

## [Sales/Invoice] Invoice Date

`GET /api/v1/sales/invoice/date/:invoicedate/:page/:size`

This method returns all invoices that have a greater or equal invoice date than the supplied value  

**NOTE:** support paging as optional parameters /page/count .... /1/100 will return page 1 with maximum 100 invoices

**Path variables:**

- `:invoicedate` (example: `2018-03-01`) — Invoice Date
- `:page` (example: `1`) — Page Number
- `:size` (example: `100`) — Items on page


---

## [Sales/Invoice] Delete By Reference

`GET /api/v1/sales/invoice/reference/:referencenumber`

Returns all invoices that have the supplied reference assigned to them.  
**NOTE:** support paging as optional parameters /page/count .... /1/100 will return page 1 with maximum 100 invoices

**Path variables:**

- `:referencenumber` (example: `SK-12345`) — Reference assigned to invoices to return


---

## [Sales/Invoice] Page

`GET /api/v1/sales/invoice/page/:page/:size?createdAfter=2025-01-01`

**Query params:**

- `createdAfter`=`2025-01-01` — Invoice date equal or greater
- `includeLines`=`true` (optional/disabled in example) — Include Invoice Lines
- `salesPerson`=`vh` (optional/disabled in example) — Sales Person
- `createdBefore`=`2020-02-20` (optional/disabled in example) — Invoice date equal or less

**Path variables:**

- `:page` (example: `1`) — Page number
- `:size` (example: `5000`) — items per page

**Example response (200 OK):**

```json
[
 {
  "Number": "332",
  "CNumber": "4707882089",
  "CName": "Jöfnuður ehf",
  "CAddress1": "Skólabrú 1",
  "CAddress2": "",
  "CZipCode": "101",
  "CCountryCode": "is",
  "CSSNumber": "4707882089",
  "CPhone": "562-4455",
  "CContact": "",
  "RecordID": 203,
  "OrderNumber": 0,
  "InvoiceDate": "2002-08-07T00:00:00Z",
  "DiscountPercent": 0,
  "Discount": 0,
  "TotalAmount": 31349,
  "TotalAmountWithTax": 39030,
  "Currency": "ISK",
  "Reference": "",
  "SettledType": 2,
  "SettledAmount": 39030,
  "SalePerson": "hþ",
  "Text1": "",
  "Text2": "",
  "Dim1": null,
  "Origin": 0,
  "PaymentTerm": "",
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
  "IRContact": "",
  "Lines": null
 },
 {
  "Number": "335",
  "CNumber": "6003003180",
  "CName": "Retis ehf",
  "CAddress1": "Hlíðasmári 8",
  "CAddress2": "",
  "CZipCode": "200",
  "CCountryCode": "",
  "CSSNumber": "6003003180",
  "CPhone": "544 8855",
  "CContact": "",
  "RecordID": 206,
  "OrderNumber": 0,
  "InvoiceDate": "2002-07-11T00:00:00Z",
  "DiscountPercent": 0,
  "Discount": 0,
  "TotalAmount": 250658,
  "TotalAmountWithTax": 312069,
  "Currency": "ISK",
  "Reference": "",
  "SettledType": 2,
  "SettledAmount": 312069,
  "SalePerson": "mf",
  "Text1": "Vegna:  Brauðsalan ehf.  kt. 610602-2580  8. júlí",
  "Text2": "",
  "Dim1": null,
  "Origin": 0,
  "PaymentTerm": "D30",
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
  "IRContact": "",
  "Lines": null
 }
]
// ...array has 100 items total, showing 2
```


---

## [Sales/Invoice] PDF

`GET /api/v1/sales/invoice/:number/pdf`

**Path variables:**

- `:number` (example: `89439`) — Invoice Number


---

## [Sales/Invoice] HTML

`GET /api/v1/sales/invoice/:number/html`

**Path variables:**

- `:number` (example: `1000`) — Invoice Number

**Example response (200 OK):**

```json
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<!-- saved from url=(0016)http://localhost -->
<html>
<head>
	<title>Invoice - 1000</title>
	<meta HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=utf-8"/>
	<style type="text/css">
		.csAC6A4475 {height:0px;width:0px;overflow:hidden;font-size:0px;line-height:0px;}
	</style>
</head>
<body leftMargin=10 topMargin=10 rightMargin=10 bottomMargin=10 style="background-color:#FFFFFF">
<table cellpadding="0" cellspacing="0" border="0" style="border-width:0px;empty-cells:show;width:732px;height:585px;position:relative;">
	<tr style="vertical-align:top;">
		<td style="width:0px;height:6px;"></td>
		<td style="width:1px;"></td>
		<td style="width:1px;"></td>
		<td style="width:4px;"></td>
		<td style="width:14px;"></td>
		<td style="width:97px;"></td>
		<td style="width:15px;"></td>
		<td style="width:85px;"></td>
		<td style="width:22px;"></td>
		<td style="width:40px;"></td>
		<td style="width:96px;"></td>
		<td style="width:12px;"></td>
		<td style="width:2px;"></td>
		<td style="width:21px;"></td>
		<td style="width:50px;"></td>
		<td style="width:11px;"></td>
		<td style="width:21px;"></td>
		<td style="width:22px;"></td>
		<td style="width:28px;"></td>
		<td style="width:24px;"></td>
		<td style="width:1px;"></td>
		<td style="width:27px;"></td>
		<td style="width:2px;"></td>
		<td style="width:22px;"></td>
		<td style="width:74px;"></td>
		<td style="width:5px;"></td>
		<td style="width:18px;"></td>
		<td style="width:16px;"></td>
		<td style="width:1px;"></td>
	</tr>
	<tr style="vertical-align:top;">
		<td style="width:0px;height:37px;"></td>
		<td></td>
		<td></td>
		<td></td>
		<td colspan="20" style="color:#000000;background-color:transparent;border-left-style:none;border-top-style:none;border-right-style:none;border-bottom-style:none;font-family:'Times New Roman';font-size:32px;font-weight:bold;font-style:normal;padding-left:2px;width:610px;height:37px;line-height:38px;text-align:left;vertical-align:top;"><nobr>Invoice</nobr></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
	</tr>
	<tr style="vertical-align:top;">
		<td style="width:0px;height:15px;"></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
	</tr>
	<tr style="vertical-align:top;">
		<td style="width:0px;height:2px;"></td>
		<td></td>
		<td></td>
		<td colspan="25" style="color:#000000;background-color:transparent;border-left-style:none;border-top-style:none;border-right-style:none;border-bottom-style:none;font-family:'Times New Roman';font-size:13px;font-weight:normal;font-style:normal;width:729px;height:2px;"><!--[if lte IE 7]><div class="csAC6A4475"></div><![endif]--></td>
		<td></td>
	</tr>
	<tr style="vertical-align:top;">
		<td style="width:0px;height:1px;"></td>
		<td></td>
		<td></td>
		<td colspan="25" style="color:#000000;background-color:#000000;border-left-style:none;border-top-style:none;border-right-style:none;border-bottom-style:none;font-family:'Times New Roman';font-size:13px;font-weight:normal;font-style:normal;width:729px;height:1px;"><!--[if lte IE 7]><div class="csAC6A4475"></div><![endif]--></td>
		<td></td>
	</tr>
	<tr style="vertical-align:top;">
		<td style="width:0px;height:3px;"></td>
		<td></td>
		<td></td>
		<td colspan="25" style="color:#000000;background-color:transparent;border-left-style:none;border-top-style:none;border-right-style:none;border-bottom-style:none;font-family:'Times New Roman';font-size:13px;font-weight:normal;font-style:normal;width:729px;height:3px;"><!--[if lte IE 7]><div class="csAC6A447
...[truncated]
```


---

## [Sales/Invoice] Email

`POST /api/v1/sales/invoice/:number/email`

An email will be sent with the invoice in the body as HTML along with an attachment .pdf  
supply an email address and subject.  
  
## Sender Detail  
By default the email will be sent by no-reply@dkplus.is unless company email has been configured for the company in dkPlus  
then that email address will be used and and the sender display will be the dkPlus user fullname along with the company name.  
**Example : ** Test Employee - Demo Company  

## Properties  
* Priority - Enum None(**0**), Highest(**1**), High(**2**), Normal(**3**), Low(**4**), Lowest(**5**)
* To - string
* Cc - string
* Bcc - string
* Subject - string
  
**Note** : Multiple Email addressess can be specified and sepirated with , or ;

**Path variables:**

- `:number` (example: `1000`) — Invoice Number

**Request body:**

```json
{
	"To":"valdi@dk.is",
	"Subject":"Invoice email"
}
```


---

## [Sales/Order/Lines] Create

`POST /api/v1/sales/order/:id/line`

## Properties for assignment
* **int** SequenceNumber
* **string** ItemCode 
* **string** Text 
* **string** Text2 
* **string** Warehouse 
* **double** Quantity 
* **double** QuantityDelivered 
* **double** UnitPrice 
* **double** UnitPriceWithTax 
* **string** UnitCode 
* **double** Discount 
* **double** DiscountPercent 
* **double** TotalAmount 
* **double** TotalAmountWithTax 
* **string** BarCode 
* **string** Reference 
* **string** EDIOrderNumber 
* **int** UNDOrderNumber

**Path variables:**

- `:id` (example: ``) — Order Number

**Request body:**

```json
{
   "ItemCode":"0002",
   "Quantity":5
}
```


---

## [Sales/Order/Lines] Update

`PUT /api/v1/sales/order/:id/line/:lineid`

**Path variables:**

- `:id` (example: `12345`) — Order Number
- `:lineid` (example: ``) — Line ID

**Request body:**

```json
{
	"SequenceNumber":112233,
	"ItemCode":"0002",
	"Quantity":8,
	"UnitPrice" : 1240
}
```


---

## [Sales/Order/Lines] Delete

`DELETE /api/v1/sales/order/:id/line/:lineid`

**Path variables:**

- `:id` (example: `12345`) — Order Number
- `:lineid` (example: ``) — Line ID


---

## [Sales/Order] Create

`POST /api/v1/sales/order`

## Properties for assignment
* **int** Number 
* **Customer** Customer
* **ItemReciver** DeliverTo
* **int** ID
* **DateTime** OrderDate 
* **double** TotalAmount ``` optional```
* **string** Currency ``` optional```
* **string** Reference ``` optional```
* **string** SalePerson ``` optional```
* **string** Text1 ``` optional```
* **string** Text2 ``` optional```
* **string** Dim1 ``` optional```
* **string** PaymentTerm ``` optional```
* **double** Exchange ``` optional```     
* **string** Warehouse ``` optional```
* **List SalesOrderLine** Lines
  
### Customer  
* **string** Number
* **string** Name ``` optional```
* **string** Address1 ``` optional```  
* **string** Address2 ``` optional```
* **string** ZipCode ``` optional```
* **string** Country ``` optional```
  

### ItemReciver
* **string** Number
* **string** Name ``` optional```
* **string** Address1 ``` optional```  
* **str
...[truncated]

**Request body:**

```json
{
    "Customer": {
        "Number": "1710794709",
        "Name": "Þorvaldur Hafdal",
        "Address1": "Sommer town 4"
    },
    "OrderDate": "2018-03-19T11:50:07.1159084+00:00",
    "Currency": "ISK",
    "Reference": "ABCD",
    "SalePerson": "WEB",
    "PaymentTerm": "IB",
    "Lines": [
        {
            "ItemCode": "0001",
            "Quantity": 4
        }
    ]
}
```


---

## [Sales/Order] Update

`PUT /api/v1/sales/order/:id`

**Path variables:**

- `:id` (example: `12345`) — Order Number

**Request body:**

```json
{
    "Number": 12345,
    "Customer": {
        "Number": "1710794709",
        "Name": "Þorvaldur Hafdal",
        "Address1": "Sommer town 4"
    },
    "OrderDate": "2018-03-19T11:50:07.1159084+00:00",
    "Currency": "ISK",
    "Reference": "ABCD",
    "SalePerson": "WEB",
    "PaymentTerm": "IB",
    "Lines": [
        {
            "ItemCode": "0001",
            "Quantity": 6
        },
  {
            "ItemCode": "0002",
            "Quantity": 5
        }          
    ]
}
```


---

## [Sales/Order] Fetch

`GET /api/v1/sales/order/:id`

**Path variables:**

- `:id` (example: `329`) — Order Number

**Request body:**

```json
{
    "Customer": {
        "Number": "1710794709",
        "Name": "Þorvaldur Hafdal",
        "Address1": "Sommer Street"
    },
    "Date": "2018-03-11T01:55:34.8544033+00:00",
    "Currency": "ISK",
    "Exchange": 1,
    "Lines": [
        {
            "ItemCode": "0001",
            "Warehouse": "BG1",
            "Text": "Example Item",
            "Text2": "Extra text",
            "Quantity": 2,
            "Reference": "ABCD",
            "IncludingVAT": false,
            "Price": 1100,
            "Discount": 0,
            "DiscountAmount": 100,
            "Dim1": ""
        }
    ],
    "Payments": [
        {
            "ID": 14,
            "Name": "Mastercard",
            "Amount": 1000
        }
    ]
}
```


---

## [Sales/Order] Delete

`DELETE /api/v1/sales/order/:id`

**Path variables:**

- `:id` (example: `12345`) — Order Number


---

## [Sales/Order] PDF

`GET /api/v1/sales/order/:id/pdf`

**Path variables:**

- `:id` (example: `239`) — Order Number


---

## [Sales/Order] HTML

`GET /api/v1/sales/order/:id/html`

**Path variables:**

- `:id` (example: `239`) — Order Number

**Example response (200 OK):**

```json
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<!-- saved from url=(0016)http://localhost -->
<html>
<head>
	<title>Order - 239</title>
	<meta HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=utf-8"/>
	<style type="text/css">
		.csF7D3565D {height:0px;width:0px;overflow:hidden;font-size:0px;line-height:0px;}
	</style>
</head>
<body leftMargin=10 topMargin=10 rightMargin=10 bottomMargin=10 style="background-color:#FFFFFF">
<table cellpadding="0" cellspacing="0" border="0" style="border-width:0px;empty-cells:show;width:729px;height:641px;position:relative;">
	<tr style="vertical-align:top;">
		<td style="width:0px;height:10px;"></td>
		<td style="width:1px;"></td>
		<td style="width:1px;"></td>
		<td style="width:2px;"></td>
		<td style="width:4px;"></td>
		<td style="width:5px;"></td>
		<td style="width:7px;"></td>
		<td style="width:85px;"></td>
		<td style="width:4px;"></td>
		<td style="width:7px;"></td>
		<td style="width:63px;"></td>
		<td style="width:62px;"></td>
		<td style="width:12px;"></td>
		<td style="width:26px;"></td>
		<td style="width:4px;"></td>
		<td style="width:25px;"></td>
		<td style="width:8px;"></td>
		<td style="width:33px;"></td>
		<td style="width:15px;"></td>
		<td style="width:4px;"></td>
		<td style="width:44px;"></td>
		<td style="width:19px;"></td>
		<td style="width:4px;"></td>
		<td style="width:21px;"></td>
		<td style="width:17px;"></td>
		<td style="width:19px;"></td>
		<td style="width:22px;"></td>
		<td style="width:3px;"></td>
		<td style="width:1px;"></td>
		<td style="width:15px;"></td>
		<td style="width:69px;"></td>
		<td style="width:3px;"></td>
		<td style="width:3px;"></td>
		<td style="width:5px;"></td>
		<td style="width:7px;"></td>
		<td style="width:6px;"></td>
		<td style="width:18px;"></td>
		<td style="width:61px;"></td>
		<td style="width:11px;"></td>
		<td style="width:3px;"></td>
		<td style="width:4px;"></td>
		<td style="width:4px;"></td>
		<td style="width:1px;"></td>
		<td style="width:1px;"></td>
	</tr>
	<tr style="vertical-align:top;">
		<td style="width:0px;height:34px;"></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td colspan="21" style="color:#000000;background-color:transparent;border-left-style:none;border-top-style:none;border-right-style:none;border-bottom-style:none;font-family:'Times New Roman';font-size:29px;font-weight:bold;font-style:normal;padding-left:2px;width:482px;height:34px;line-height:35px;text-align:left;vertical-align:top;"><nobr>Prufufyrirt&#230;ki&#240;&nbsp;ehf.</nobr></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
	</tr>
	<tr style="vertical-align:top;">
		<td style="width:0px;height:10px;"></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
	</tr>
	<tr style="vertical-align:top;">
		<td style="width:0px;height:9px;"></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></t
...[truncated]
```


---

## [Sales/Order] Email

`POST /api/v1/sales/order/:number/email`

An email will be sent with the Order in the body as HTML along with an attachment .pdf  
supply an email address and subject.  
  
## Sender Detail  
By default the email will be sent by no-reply@dkplus.is unless company email has been configured for the company in dkPlus  
then that email address will be used and and the sender display will be the dkPlus user fullname along with the company name.  
**Example : ** Test Employee - Demo Company  
  
## Properties  
* Priority - Enum None(**0**), Highest(**1**), High(**2**), Normal(**3**), Low(**4**), Lowest(**5**) ``` optional```
* To - string
* Cc - string ``` optional```
* Bcc - string ``` optional```
* Subject - string
* DisplayName - string ``` optional```
  
**Note** : Multiple Email addressess can be specified and sepirated with , or ;

**Path variables:**

- `:number` (example: `239`) — Order Number

**Request body:**

```json
{
	"To":"agust@dk.is",
	"Subject":"Order Email"
}
```


---

## [Sales/Salesperson] Fetch All

`GET /api/v1/sales/person/page/1/100`

**Example response (200 OK):**

```json
[
 {
  "Number": "010",
  "Employee": "010",
  "NameOnSalesOrders": "Hjalti",
  "Modified": "2007-06-11T14:08:50.023+00:00",
  "Created": "2006-12-19T21:16:13.609+00:00",
  "PriceGroup": 1,
  "Price1Closed": true,
  "Price2Closed": true,
  "Price3Closed": true,
  "CanChangeDueDate": false,
  "FilterOnCustomer": false
 },
 {
  "Number": "008",
  "Employee": "008",
  "NameOnSalesOrders": "Sveinn",
  "Modified": "2007-07-12T15:40:49.607+00:00",
  "Created": "2006-08-04T19:43:15.128+00:00",
  "PriceGroup": 1,
  "Price1Closed": true,
  "Price2Closed": true,
  "Price3Closed": true,
  "CanChangeDueDate": false,
  "FilterOnCustomer": false
 }
]
// ...array has 17 items total, showing 2
```


---

## [Sales/Salesperson] Fetch One

`GET /api/v1/sales/person/:number`

**Path variables:**

- `:number` (example: `web`) — Sales Person Number

**Example response (200 OK):**

```json
{
 "Number": "web",
 "Employee": "prufa",
 "NameOnSalesOrders": "Vefverslun",
 "Warehouse": "bg1",
 "Modified": "2018-03-24T11:05:34.957+00:00",
 "Created": "2015-11-13T18:30:02.958+00:00",
 "PriceGroup": 0,
 "Price1Closed": false,
 "Price2Closed": false,
 "Price3Closed": false,
 "CanChangeDueDate": false,
 "FilterOnCustomer": false
}
```


---

## [Sales/Salesperson] Page

`GET /api/v1/sales/person/page/:pageno/:size`

**Path variables:**

- `:pageno` (example: `1`) — Page Number
- `:size` (example: `10`) — Items on page

**Example response (200 OK):**

```json
[
 {
  "Number": "010",
  "Employee": "010",
  "NameOnSalesOrders": "Hjalti",
  "Modified": "2007-06-11T14:08:50.023+00:00",
  "Created": "2006-12-19T21:16:13.609+00:00",
  "PriceGroup": 1,
  "Price1Closed": true,
  "Price2Closed": true,
  "Price3Closed": true,
  "CanChangeDueDate": false,
  "FilterOnCustomer": false
 },
 {
  "Number": "008",
  "Employee": "008",
  "NameOnSalesOrders": "Sveinn",
  "Modified": "2007-07-12T15:40:49.607+00:00",
  "Created": "2006-08-04T19:43:15.128+00:00",
  "PriceGroup": 1,
  "Price1Closed": true,
  "Price2Closed": true,
  "Price3Closed": true,
  "CanChangeDueDate": false,
  "FilterOnCustomer": false
 }
]
// ...array has 10 items total, showing 2
```


---

## [Sales/Salesperson] Update

`PUT /api/v1/sales/person/:number`

**Path variables:**

- `:number` (example: `webster`) — Sales Person Number

**Request body:**

```json
{
    "Employee": "1710794709",
    "NameOnSalesOrders": "Vefverslunin ehf",
    "Warehouse": "bg1",
    "PriceGroup": 0,
    "Price1Closed": false,
    "Price2Closed": false,
    "Price3Closed": false,
    "CanChangeDueDate": false,
    "FilterOnCustomer": false
}
```


---

## [Sales/Salesperson] Create

`POST /api/v1/sales/person`

**Request body:**

```json
{
    "Number": "webster",
    "Employee": "1710794709",
    "NameOnSalesOrders": "Vefverslunar notandi",
    "Warehouse": "bg1"
}
```


---

## [Sales/Salesperson] Delete

`DELETE /api/v1/sales/person/:number`

**Path variables:**

- `:number` (example: `web`) — Sales Person Number

**Example response (200 OK):**

```json
{
 "Deleted": 1
}
```


---

## [Sales/Quote] Fetch

`GET /api/v1/sales/order/:id`

**Path variables:**

- `:id` (example: `329`) — Order Number

**Request body:**

```json
{
    "Customer": {
        "Number": "1710794709",
        "Name": "Þorvaldur Hafdal",
        "Address1": "Sommer Street"
    },
    "Date": "2018-03-11T01:55:34.8544033+00:00",
    "Currency": "ISK",
    "Exchange": 1,
    "Lines": [
        {
            "ItemCode": "0001",
            "Warehouse": "BG1",
            "Text": "Example Item",
            "Text2": "Extra text",
            "Quantity": 2,
            "Reference": "ABCD",
            "IncludingVAT": false,
            "Price": 1100,
            "Discount": 0,
            "DiscountAmount": 100,
            "Dim1": ""
        }
    ],
    "Payments": [
        {
            "ID": 14,
            "Name": "Mastercard",
            "Amount": 1000
        }
    ]
}
```


---

## [Sales/Quote] Create

`POST /api/v1/sales/quote`

## Properties for assignment
* **int** Number 
* **Customer** Customer
* **ItemReciver** DeliverTo
* **DateTime** Date 
* **double** TotalAmount 
* **string** Currency 
* **string** Reference 
* **string** SalePerson 
* **string** Text1 
* **string** Text2 
* **string** Dim1 
* **string** PaymentTerm
* **double** Exchange      
* **string** Warehouse
* **List QuoteLine** Lines
  
### Customer  
* **string** Number
* **string** Name //optional
* **string** Address1 //optional  
* **string** Address2 //optional
* **string** ZipCode //optional
* **string** Country //optional
  

### ItemReciver
* **string** Number
* **string** Name //optional
* **string** Address1 //optional  
* **string** Address2 //optional

**Request body:**

```json
{
    "Customer": {
        "Number": "1710794709",
        "Name": "Þorvaldur Hafdal",
        "Address1": "Sommer town 4"
    },
    "Date": "2018-03-19T11:50:07.1159084+00:00",
    "Currency": "ISK",
    "Reference": "ABCD",
    "SalePerson": "WEB",
    "Lines": [
        {
            "ItemCode": "0001",
            "Quantity": 4
        }
    ]
}
```


---

## [Sales/Quote] PDF

`GET /api/v1/sales/quote/:id/pdf`

**Path variables:**

- `:id` (example: `1080`) — Order Number


---

## [Sales/Quote] HTML

`GET /api/v1/sales/quote/:id/html`

**Path variables:**

- `:id` (example: `1012`) — Quote Number

**Example response (200 OK):**

```json
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<!-- saved from url=(0016)http://localhost -->
<html>
<head>
	<title>Order - 239</title>
	<meta HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=utf-8"/>
	<style type="text/css">
		.csF7D3565D {height:0px;width:0px;overflow:hidden;font-size:0px;line-height:0px;}
	</style>
</head>
<body leftMargin=10 topMargin=10 rightMargin=10 bottomMargin=10 style="background-color:#FFFFFF">
<table cellpadding="0" cellspacing="0" border="0" style="border-width:0px;empty-cells:show;width:729px;height:641px;position:relative;">
	<tr style="vertical-align:top;">
		<td style="width:0px;height:10px;"></td>
		<td style="width:1px;"></td>
		<td style="width:1px;"></td>
		<td style="width:2px;"></td>
		<td style="width:4px;"></td>
		<td style="width:5px;"></td>
		<td style="width:7px;"></td>
		<td style="width:85px;"></td>
		<td style="width:4px;"></td>
		<td style="width:7px;"></td>
		<td style="width:63px;"></td>
		<td style="width:62px;"></td>
		<td style="width:12px;"></td>
		<td style="width:26px;"></td>
		<td style="width:4px;"></td>
		<td style="width:25px;"></td>
		<td style="width:8px;"></td>
		<td style="width:33px;"></td>
		<td style="width:15px;"></td>
		<td style="width:4px;"></td>
		<td style="width:44px;"></td>
		<td style="width:19px;"></td>
		<td style="width:4px;"></td>
		<td style="width:21px;"></td>
		<td style="width:17px;"></td>
		<td style="width:19px;"></td>
		<td style="width:22px;"></td>
		<td style="width:3px;"></td>
		<td style="width:1px;"></td>
		<td style="width:15px;"></td>
		<td style="width:69px;"></td>
		<td style="width:3px;"></td>
		<td style="width:3px;"></td>
		<td style="width:5px;"></td>
		<td style="width:7px;"></td>
		<td style="width:6px;"></td>
		<td style="width:18px;"></td>
		<td style="width:61px;"></td>
		<td style="width:11px;"></td>
		<td style="width:3px;"></td>
		<td style="width:4px;"></td>
		<td style="width:4px;"></td>
		<td style="width:1px;"></td>
		<td style="width:1px;"></td>
	</tr>
	<tr style="vertical-align:top;">
		<td style="width:0px;height:34px;"></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td colspan="21" style="color:#000000;background-color:transparent;border-left-style:none;border-top-style:none;border-right-style:none;border-bottom-style:none;font-family:'Times New Roman';font-size:29px;font-weight:bold;font-style:normal;padding-left:2px;width:482px;height:34px;line-height:35px;text-align:left;vertical-align:top;"><nobr>Prufufyrirt&#230;ki&#240;&nbsp;ehf.</nobr></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
	</tr>
	<tr style="vertical-align:top;">
		<td style="width:0px;height:10px;"></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
	</tr>
	<tr style="vertical-align:top;">
		<td style="width:0px;height:9px;"></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></td>
		<td></t
...[truncated]
```


---

## [Sales/Quote] Email

`POST /api/v1/sales/quote/:number/email`

An email will be sent with the Order in the body as HTML along with an attachment .pdf  
supply an email address and subject.  
  
## Sender Detail  
By default the email will be sent by no-reply@dkplus.is unless company email has been configured for the company in dkPlus  
then that email address will be used and and the sender display will be the dkPlus user fullname along with the company name.  
**Example : ** Test Employee - Demo Company  
  
## Properties  
* Priority - Enum None(**0**), Highest(**1**), High(**2**), Normal(**3**), Low(**4**), Lowest(**5**)
* To - string
* Cc - string
* Bcc - string
* Subject - string
  
**Note** : Multiple Email addressess can be specified and sepirated with , or ;

**Path variables:**

- `:number` (example: `1080`) — Qoute Number

**Request body:**

```json
{
	"To":"lovisa@dk.is",
	"Subject":"Special Price for you my friend"
}
```


---

## [Sales] Payment Types

`GET /api/v1/sales/payment/type/`

**Example response (200 OK):**

```json
[
 {
  "PaymentId": 14,
  "Name": "Mastercard",
  "Type": 2,
  "GLAccountNumber": "7641",
  "Active": false,
  "Modified": "2007-03-17T12:38:36.859Z"
 },
 {
  "PaymentId": 8,
  "Name": "Viðskiptafært",
  "Type": 5,
  "GLAccountNumber": "7620",
  "Active": false,
  "Modified": "2003-12-01T11:06:08.853Z"
 }
]
// ...array has 14 items total, showing 2
```


---

## [Sales] Payment Type

`GET /api/v1/sales/payment/type/:typeid`

**Path variables:**

- `:typeid` (example: `14`) — Id of the payment type

