# dkPlus API — Vendor

Base URL: https://api.dkplus.is/api/v1 — Auth: `Authorization: Bearer <token>`


---

## [Vendor/Invoice/Processed] Fetch

`GET /api/v1/vendor/invoice/processed/page/:page/:size`

**Path variables:**

- `:page` (example: `1`) — Page number
- `:size` (example: `100`) — Number of invoices on page


---

## [Vendor/Invoice/Processed] Fetch One

`GET /api/v1/vendor/invoice/processed/:invoiceid`

**Path variables:**

- `:invoiceid` (example: `15608`) — ID of invoice to fetch


---

## [Vendor/Invoice/Processed] Attachment

`GET /api/v1/vendor/invoice/:invoiceid/attachment`

**Path variables:**

- `:invoiceid` (example: `15608`) — ID of the invoice to get attachments for


---

## [Vendor/Invoice/UnProcessed] Fetch

`GET /api/v1/vendor/invoice/unprocessed`


---

## [Vendor/Invoice/UnProcessed] Fetch One

`GET /api/v1/vendor/invoice/unprocessed/:invoiceid`

**Path variables:**

- `:invoiceid` (example: `15608`) — ID of invoice to fetch


---

## [Vendor/Invoice/UnProcessed] Attachment

`GET /api/v1/vendor/invoice/unprocessed/:invoiceid/attachment`

**Path variables:**

- `:invoiceid` (example: `36`) — ID of invoice to fetch


---

## [Vendor/Invoice/Approval] My Approved

`GET /api/v1/vendor/invoice/my/approved`


---

## [Vendor/Invoice/Approval] My Approval Pending

`GET /api/v1/vendor/invoice/my/unapproved`

## Approved Status  
Approved(**0**), UnApproved(**1**), Deny(**2**)


---

## [Vendor/Invoice/Approval] Set Approval Status

`PUT /api/v1/vendor/invoice/my/approval/:invoiceid`

## ApprovalAction  
* Approved(**0**)  
* UnApproved(**1**)  
* Denied(**2**)

**Path variables:**

- `:invoiceid` (example: `36`) — ID of invoice to change approval status for

**Request body:**

```json
{
"ApprovalAction" : 1,
"Description" : "I approve this vote",
"Reference" : null,
"Dim1":null,
"Dim2":null,
"Dim3":null
}
```


---

## [Vendor/Invoice] Create

`POST /api/v1/Vendor/1710794709/Invoice`

Use this method to create a new vendor invoice  
  
## Properties
* **string** Number 
* **string**  Reference 
* **string** Description  ``` optional, max: 2000 char```
* **string** Text  ``` optional, max: 2000 char```
* **DateTime** Date  
* **DateTime** DueDate ``` optional```
* **DateTime** ReceivedDate ``` optional - default NOW```
* **double** Amount ``` optional```
* **string** Currency ``` optional```
* **double** Exchange ``` optional```
* **Array Line** Lines 
* **File[]** Files ``` optional```
  
### Line 
* **string** Account
* **LineType** Type
* **string** Text  //optional
* **double** Amount
* **string** Reference //optional
* **string** Dim1 ``` optional - default from account```
* **string** Dim2 ``` optional - default from account```
  
  
### File  
* **string** Name
* **byte[]** Content  //Note json uses base64 array of byte  

### LineType
Expenses(**0**), Payment(*
...[truncated]

**Request body:**

```json
{
    "Number": "SR-12345",
    "Date": "2019-01-16T21:10:59.6747851+00:00",
    "Description": "This is a new vendor invoice",
    "Reference": "F96354-ABCD",
    "Text":"Something to describe the invoice content",
    "Lines":
    [
    	{
    		"Type":"Expenses",
    		"Account":"1100",
    		"Amount":1000
    	}
    ],
    "Files":[
    {
    	"Name":"attachment.xml",
    	"Content":"PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48c29hcDpFbnZlbG9wZSB4bWxuczpzb2FwPSJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy9zb2FwL2VudmVsb3BlLyIgeG1sbnM6c29hcGVuYz0iaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvc29hcC9lbmNvZGluZy8iIHhtbG5zOnRucz0iaHR0cDovL3RlbXB1cmkub3JnLyIgeG1sbnM6dHlwZXM9Imh0dHA6Ly90ZW1wdXJpLm9yZy9lbmNvZGVkVHlwZXMiIHhtbG5zOnhzaT0iaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEtaW5zdGFuY2UiIHhtbG5zOnhzZD0iaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEiPjxzb2FwOkhlYWRlcj48cTE6VG9rZW5TZWN1cml0eSBpZD0iaF9pZDEiIHhtbG5zOnExPSJ1cm46ZGtXU1ZhbHVlT2JqZWN0cyI+PFRva2VuIHhzaTp0eXBlPSJ4c2Q6c3RyaW5nIj5hYWIzMTQ3OS1mYjZlLTQzMTMtYTI5OC1jMjQ4M2Q4ZWE0NjY8L1Rva2VuPjxBcHBJRCB4c2k6dHlwZT0ieHNkOnN0cmluZyI+dmg8L0FwcElEPjwvcTE6VG9rZW5TZWN1cml0eT48L3NvYXA6SGVhZGVyPjxzb2FwOkJvZHkgc29hcDplbmNvZGluZ1N0eWxlPSJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy9zb2FwL2VuY29kaW5nLyI+PHExOkNyZWF0ZVRpbWVDbG9ja1RyYW5zYWN0aW9uIHhtbG5zOnExPSJ1cm46SXRlbXNTZXJ2aWNlSW50Zi1JSXRlbVNlcnZpY2UiPjxvYmogaHJlZj0iI2lkMSIgLz48L3ExOkNyZWF0ZVRpbWVDbG9ja1RyYW5zYWN0aW9uPjxxMjpUVGltZUNsb2NrVHJhbnNhY3Rpb24gaWQ9ImlkMSIgeHNpOnR5cGU9InEyOlRUaW1lQ2xvY2tUcmFuc2FjdGlvbiIgeG1sbnM6cTI9InVybjpka1dTVmFsdWVPYmplY3RzIj48SUQgeHNpOnR5cGU9InhzZDppbnQiPjA8L0lEPjxFbXBsb3llZSB4c2k6dHlwZT0ieHNkOnN0cmluZyI+MTcxMDc5NDcwOTwvRW1wbG95ZWU+PFN0YXJ0IHhzaTp0eXBlPSJ4c2Q6ZGF0ZVRpbWUiPjIwMTgtMDQtMDJUMDk6MDA6NTguNzA1PC9TdGFydD48RmluaXNoIHhzaTp0eXBlPSJ4c2Q6ZGF0ZVRpbWUiPjIwMTgtMDQtMDJUMTU6MjI6MDA8L0ZpbmlzaD48RXh0cmFQcm9wZXJ0aWVzIGhyZWY9IiNpZDIiIC8+PC9xMjpUVGltZUNsb2NrVHJhbnNhY3Rpb24+PHNvYXBlbmM6QXJyYXkgaWQ9ImlkMiIgeG1sbnM6cTM9InVybjpka1dTVmFsdWVPYmplY3RzIiBzb2FwZW5jOmFycmF5VHlwZT0icTM6VEV4dHJhUHJvcGVydHlbM10iPjxJdGVtIGhyZWY9IiNpZDMiIC8+PEl0ZW0gaHJlZj0iI2lkNCIgLz48SXRlbSBocmVmPSIjaWQ1IiAvPjwvc29hcGVuYzpBcnJheT48cTQ6VEV4dHJhUHJvcGVydHkgaWQ9ImlkMyIgeHNpOnR5cGU9InE0OlRFeHRyYVByb3BlcnR5IiB4bWxuczpxND0idXJuOmRrV1NWYWx1ZU9iamVjdHMiPjxOYW1lIHhzaTp0eXBlPSJ4c2Q6c3RyaW5nIj5UZXh0PC9OYW1lPjxWYWx1ZSB4c2k6dHlwZT0ieHNkOnN0cmluZyI+SGVsbG8gV29ybGQ8L1ZhbHVlPjwvcTQ6VEV4dHJhUHJvcGVydHk+PHE1OlRFeHRyYVByb3BlcnR5IGlkPSJpZDQiIHhzaTp0eXBlPSJxNTpURXh0cmFQcm9wZXJ0eSIgeG1sbnM6cTU9InVybjpka1dTVmFsdWVPYmplY
...[truncated]
```


---

## [Vendor/Transactions] Paged

`GET /api/v1/vendor/transaction/:page/:size`

Use this method to get vednor transactions pages
##  Parameters

* **string** dim1
* **string** voucher
* **string** reference
* **datetime** createdAfter
* **datetime** createdBefore
* **datetime** dueAfter
* **datetime** ModifiedAfter

**Query params:**

- `ModifiedAfter`=`2020-03-01` (optional/disabled in example)
- `CreatedAfter`=`2020-03-01` (optional/disabled in example)
- `CreatedBefore`=`` (optional/disabled in example)
- `Dim1`=`` (optional/disabled in example)
- `DueAfter`=`` (optional/disabled in example)
- `Reference`=`` (optional/disabled in example)
- `Voucher`=`gr0108` (optional/disabled in example)

**Path variables:**

- `:page` (example: `1`)
- `:size` (example: `200`)


---

## [Vendor/Purchase] Create

`POST /api/v1/purchase`

This method allows you to get purchase orders that have been created and or modified after the supplied date
  
## Head  
* **string** Reference - Optional
* **object** Vendor
* **DateTime** OrderDate - Optional, default to today
 
## Line
* **string** Warehouse - Optional, default to company default warehouse
* **string** Code
* **enum** CodeType - ItemCode(**0**), Barcode(**1**), VendorItemCode(**2**)
* **double** Quantity
 
### Object Vendor
* **string** Number - Manditoty
* **string** Name - optional
* **string** Address1 - optional
* **string** Address2 - optional

**Request body:**

```json
[
	{
		"Reference": "LDR-14143",
		"Vendor":
		{
			"Number":"6611982499"
		},
		"OrderDate":"2018-06-26T00:00:00.0000000+00:00",
		"Lines":
		[
			{
				"Warehouse":"bg1",
				"Code":"00001",
				"CodeType":"ItemCode",
				"Reference":"ITM1234567",
				"Quantity":4
			}
		]
	}
]
```


---

## [Vendor/Purchase] Update

`PATCH /api/v1/purchase/:id`

This method allows you to get purchase orders that have been created and or modified after the supplied date

**Path variables:**

- `:id` (example: `3`) — Order record ID

**Request body:**

```json
{
	"Vendor":
	{
		"Number":"6611982499"
	},
	"Lines":
	[
		{
			"ID" : 20000,
			"Quantity":5
		}
	]
}

```


---

## [Vendor/Purchase] Remove

`DELETE /api/v1/purchase/:id`

This method allows you to get purchase orders that have been created and or modified after the supplied date

**Path variables:**

- `:id` (example: `6`) — Record ID of the order


---

## [Vendor/Purchase] Modified

`GET /api/v1/purchase?modified=2018-06-25T00:00:00.0000000`

This method allows you to get purchase orders that have been created and or modified after the supplied date

**Query params:**

- `modified`=`2018-06-25T00:00:00.0000000`


---

## [Vendor/Purchase] By ID

`GET /api/v1/purchase/id/:id`

This method allows you to get purchase orders that have been created and or modified after the supplied date

**Path variables:**

- `:id` (example: `3`) — Record ID of the purchase order


---

## [Vendor/Purchase] By Number

`GET /api/v1/purchase/number/:number`

This method allows you to get purchase orders that have been created and or modified after the supplied date

**Path variables:**

- `:number` (example: `asd`) — Number assigned to the order


---

## [Vendor/Purchase] By Reference

`GET /api/v1/purchase/reference/:ref`

This method allows you to get purchase orders that have been created and or modified after the supplied date

**Path variables:**

- `:ref` (example: `ABCD1234`) — Reference assigned to the order


---

## [Vendor/Purchase] Update Line

`PATCH /api/v1/purchase/:id/line/:seq`

This method allows you to get purchase orders that have been created and or modified after the supplied date

**Path variables:**

- `:id` (example: ``) — Order record id
- `:seq` (example: ``) — Line sequence id

**Request body:**

```json
{
	"Warehouse":"bg1",
	"ItemCode":"00001",
	"ExternalCode":"AB4312X",
	"Reference":"ITM1234567",
	"Quantity":5
}


```


---

## [Vendor/Purchase] Remove Line

`DELETE /api/v1/purchase/:id/line/:sequence`

This method allows you to get purchase orders that have been created and or modified after the supplied date

**Path variables:**

- `:id` (example: `6`) — Record ID of the order
- `:sequence` (example: `3000`) — Sequence id of order line


---

## [Vendor] Fetch

`GET /api/v1/vendor`


---

## [Vendor] Fetch One

`GET /api/v1/vendor/:number`

**Path variables:**

- `:number` (example: `{{Vendor_Number}}`) — Vendor Number


---

## [Vendor] Create

`POST /api/v1/vendor`

**Request body:**

```json
    {
        "Number": "2510793319",
        "SSNumber": "2510793319",
        "Name": "Inga Guðrún",
        "PaymentMode": "BM",
        "LedgerCode": "0001"
    }
```


---

## [Vendor] Update

`PUT /api/v1/vendor/:number`

**Path variables:**

- `:number` (example: `{{Vendor_Number}}`) — Vendor Number

**Request body:**

```json
    {
        "Address1": "Some Address"
    }
```


---

## [Vendor] Page

`GET /api/v1/vendor/page/:page/:size`

**Path variables:**

- `:page` (example: `3`) — Page to lookup
- `:size` (example: `10`) — Number of items on page


---

## [Vendor] Search

`GET /api/v1/vendor/search/:searchstring`

**Path variables:**

- `:searchstring` (example: `{{ExampleSearch}}`) — Text to search for


---

## [Vendor] Transactions

`GET /api/v1/vendor/:number/transaction/:page/:size`

**Path variables:**

- `:number` (example: `4709051740`) — Vendor Number
- `:page` (example: `1`)
- `:size` (example: `200`)

