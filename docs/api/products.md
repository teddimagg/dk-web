# dkPlus API — Products

Base URL: https://api.dkplus.is/api/v1 — Auth: `Authorization: Bearer <token>`


---

## [Products/Barcode] Product Barcodes

`GET /api/v1/Product/:number/barcode`

You can use this method to get all barcodes for an item.  
**NOTE** : When you fetch a product the barcodes have already been returned so you might not need to call this function.

**Path variables:**

- `:number` (example: `{{Product_Number}}`) — Item Code


---

## [Products/Barcode] Product Barcode

`GET /api/v1/Product/:number/barcode/:code`

You can use this method to get all barcodes for an item.  
**NOTE** : When you fetch a product the barcodes have already been returned so you might not need to call this function.

**Path variables:**

- `:number` (example: `{{Product_Number}}`) — Item Code
- `:code` (example: `1234567890`) — Barcode


---

## [Products/Barcode] Search

`GET /api/v1/barcode/:code`

This method will return a product that the barcode belongs to.

**Path variables:**

- `:code` (example: `1234567890`) — Barcode


---

## [Products/Inventory] Journal

`POST /api/v1/product/register/journal`

# Description  
Use this method to register product(s) to the inevntory.  

## Properties  
**Date** - DateTime  
**Description** - String  
  
## Line Properties  
**ItemCode** - String  
**Text** - String  
**Reference** - String  
**Warehouse** - String  
**Date** - DateTime  
**Quantity** - Double  
**Price1** -  Double

**Request body:**

```json
{
   "Description":"Example Journal Registration",
   "Lines":[
      {
         "ItemCode":"6959271-123-1234",
         "Warehouse":"BG1",
         "Quantity" : 4
      },
      {
         "ItemCode":"7508303-254-1234",
         "Warehouse":"BG1",
         "Quantity" : 2
      }
   ]
}
```


---

## [Products/Inventory] Transfer

`POST /api/v1/Product/register/transfer`

# Description  
Use this method to transfer products from one warehouse to another.   
  
## Properties  
**ItemCode** - String  
**From** - String, _Warehouse to transfer from_  
**To** - String, _Warehouse to transfer to_   
**Comment** - String  
**Quantity** - Double

**Request body:**

```json
[
   {
      "ItemCode":"6959271-123-1234",
      "From":"BG1",
      "To":"AK",
      "Comment":"Requested by employee A",
      "Quantity":5
   },
   {
      "ItemCode":"7508303-254-1234",
      "From":"BG1",
      "To":"AK",
      "Comment":"Requested by employee B",
      "Quantity":5
   }
]
```


---

## [Products/Inventory] Inventorying

`POST /api/v1/product/register/Inventorying`

# Description  
Use this method to to correct inventory on hand for products in warehouses.  

## Properties  
**Description** - String  
  
## Line Properties  
**ItemCode** - String  
**Warehouse** - String  
**Counted** - Double

**Request body:**

```json
{
	"Description":"Counted products",
	"Lines":
	[
		{
			"ItemCode":"6959271-123-1234",
			"Warehouse":"AK",
			"Counted":10
		},
		{
			"ItemCode":"6959271-123-1234",
			"Warehouse":"BG1",
			"Counted":250
		},
		{
			"ItemCode":"6959271-123-1234",
			"Warehouse":"bg1",
			"Counted":125
		}
	]
}
```


---

## [Products/Transactions] Product Transactions

`GET /api/v1/product/transaction/:page/:count`

**Query params:**

- `modifiedAfter`=`` (optional/disabled in example)
- `modifiedBefore`=`` (optional/disabled in example)
- `createdAfter`=`` (optional/disabled in example)
- `createdBefore`=`` (optional/disabled in example)
- `dim1`=`` (optional/disabled in example)
- `itemcode`=`` (optional/disabled in example)
- `reference`=`` (optional/disabled in example)
- `include`=`ItemCode,Warehouse,Quantity` (optional/disabled in example)

**Path variables:**

- `:page` (example: `1`)
- `:count` (example: `100`)

**Example response (200 OK):**

```json
[
 {
  "ID": 46334,
  "Created": "2016-01-05T22:38:16.616+00:00",
  "Modified": "2016-01-05T22:38:16.616+00:00",
  "Origin": 8,
  "HeadId": 39,
  "Sequence": 10,
  "ItemCode": "em-034",
  "Warehouse": "bg1",
  "TransactionCode": 6,
  "JournalDate": "2016-01-05T00:00:00",
  "JournalType": 0,
  "Quantity": -2,
  "PurchasePrice": 0,
  "CurrencyCode": "ISK",
  "Exchange": 1,
  "CostPrice": 4750,
  "CostAmount": -9500,
  "SalesAmount": 0,
  "InventOnHand": 0,
  "Text": "Testing CostItem from Mobiz Unit test. I",
  "NetWeight": 0,
  "UnitVolume": 0,
  "NumberOfPackages": 0,
  "CountedQuantity": 0,
  "JobNumber": "1023",
  "VendorPrice": 0,
  "VendorDiscount": 0,
  "Fabrication": 0,
  "BatchExpiry": "0001-01-01T00:00:00",
  "TypeOf": 0,
  "PurchaseAmount": 0,
  "PoBatchId": 0
 },
 {
  "ID": 46340,
  "Created": "2016-01-08T11:41:06.622+00:00",
  "Modified": "2016-01-08T11:41:06.622+00:00",
  "Origin": 8,
  "HeadId": 39,
  "Sequence": 17,
  "ItemCode": "em-002",
  "Warehouse": "bg1",
  "TransactionCode": 6,
  "JournalDate": "2016-01-20T00:00:00",
  "JournalType": 0,
  "Quantity": -1,
  "PurchasePrice": 0,
  "CurrencyCode": "ISK",
  "Exchange": 1,
  "CostPrice": 0,
  "CostAmount": 0,
  "SalesAmount": 0,
  "InventOnHand": 0,
  "Text": "D-Link DI 624+",
  "NetWeight": 0,
  "UnitVolume": 0,
  "NumberOfPackages": 0,
  "CountedQuantity": 0,
  "JobNumber": "1063",
  "VendorPrice": 0,
  "VendorDiscount": 0,
  "Fabrication": 0,
  "BatchExpiry": "0001-01-01T00:00:00",
  "TypeOf": 0,
  "PurchaseAmount": 0,
  "PoBatchId": 0
 }
]
// ...array has 100 items total, showing 2
```


---

## [Products/Vendor Links] Create

`POST /api/v1/Product/:itemcode/VendorLinks`

This method is used to get one instance of a product/item  
  
# Properties  
* **string** - ItemCode
* **string** - AliasItemCode `optional`
* **string** - Group `optional`
* **string** - Description  `optional`
* **string** - Description2 `optional`
* **Price**  - Price1 `optional`
* **Price**  - Price2 `optional`
* **Price**  - Price2 `optional`
* **double** - CostPrice `optional`
* **double** - TaxPercent
* **bool**   - Inactive `optional`
* **double** - PurchacePrice `optional`
* **bool**   - AllowDiscount `optional`
* **double** - Discount `optional`
* **string** - ExtraDesc1 `optional`
* **string** - ExtraDesc2 `optional`
* **bool**   - AllowNegativeInventory `optional`
* **bool**   - ShowItemInWebShop `optional`
 
## Price  
* **double** UnitPrice `optional`
* **double** UnitPriceWithTax`optional`

**Path variables:**

- `:itemcode` (example: `0001`)

**Request body:**

```json
{
  "Vendor": "",
  "Description": "",
  "PrimarySupplier": true,
  "Price": 0
}
```

**Example response (200 OK):**

```json
{
 "RecordID": 12738,
 "ItemCode": "sndkost2",
 "Description": "Sendingar kostnaður",
 "Description2": "",
 "Inactive": false,
 "RecordCreated": "2018-05-13T21:05:09",
 "RecordModified": "2018-05-13T21:05:09",
 "AliasItemCode": "",
 "ItemClass": 0,
 "UnitCode": "",
 "Group": "",
 "UnitQuantity": 0,
 "NetWeight": 0,
 "UnitVolume": 0,
 "TotalQuantityInWarehouse": 0,
 "PurchasePrice": 0,
 "CurrencyCode": "ISK",
 "Exchange": 1,
 "UnitPrice1": 1000,
 "Purchasefactor": 0,
 "CostPrice": 0,
 "ProfitRatio1": 0,
 "UnitPrice1WithTax": 1240,
 "UnitPrice2": 0,
 "UnitPrice3WithTax": 0,
 "ShowItemInWebShop": false,
 "AllowDiscount": false,
 "Discount": 0,
 "UnitPrice2WithTax": 0,
 "UnitPrice3": 0,
 "PropositionPrice": 0,
 "PropositionDateTo": "0100-01-01T00:00:00Z",
 "ExtraDesc1": "",
 "ExtraDesc2": "",
 "IsVariation": false,
 "TaxPercent": 24,
 "SalesTaxCode": "u1",
 "AllowNegativeInventiry": false,
 "DiscountQuantity": 0,
 "MaxDiscountAllowed": 0,
 "DefaultSaleQuantity": 0,
 "CostMethod": 0,
 "HasAttachments": false,
 "HasBarcodes": false,
 "HasCurrencyPrices": false,
 "HasUnits": false,
 "HasAlternative": false,
 "Barcodes": [],
 "Attachments": [],
 "Categories": [],
 "Warehouses": [],
 "CurrencyPrices": [],
 "Units": [],
 "Alternative": [],
 "Changes": []
}
```


---

## [Products] Create

`POST /api/v1/Product`

This method is used to get one instance of a product/item  
  
# Properties  
* **string** - ItemCode
* **string** - AliasItemCode `optional`
* **string** - Group `optional`
* **string** - Description  `optional`
* **string** - Description2 `optional`
* **Price**  - Price1 `optional`
* **Price**  - Price2 `optional`
* **Price**  - Price2 `optional`
* **double** - CostPrice `optional`
* **double** - TaxPercent
* **bool**   - Inactive `optional`
* **double** - PurchacePrice `optional`
* **bool**   - AllowDiscount `optional`
* **double** - Discount `optional`
* **string** - ExtraDesc1 `optional`
* **string** - ExtraDesc2 `optional`
* **bool**   - AllowNegativeInventory `optional`
* **bool**   - ShowItemInWebShop `optional`
 
## Price  
* **double** UnitPrice `optional`
* **double** UnitPriceWithTax`optional`

**Request body:**

```json
{
  "ItemCode":"sndkost",
  "Description":"Sendingar kostnaður",
  "TaxPercent":24,
  "Price1":
  {
    "UnitPriceWithTax":2500  
  }
}
```

**Example response (200 OK):**

```json
{
 "RecordID": 12738,
 "ItemCode": "sndkost2",
 "Description": "Sendingar kostnaður",
 "Description2": "",
 "Inactive": false,
 "RecordCreated": "2018-05-13T21:05:09",
 "RecordModified": "2018-05-13T21:05:09",
 "AliasItemCode": "",
 "ItemClass": 0,
 "UnitCode": "",
 "Group": "",
 "UnitQuantity": 0,
 "NetWeight": 0,
 "UnitVolume": 0,
 "TotalQuantityInWarehouse": 0,
 "PurchasePrice": 0,
 "CurrencyCode": "ISK",
 "Exchange": 1,
 "UnitPrice1": 1000,
 "Purchasefactor": 0,
 "CostPrice": 0,
 "ProfitRatio1": 0,
 "UnitPrice1WithTax": 1240,
 "UnitPrice2": 0,
 "UnitPrice3WithTax": 0,
 "ShowItemInWebShop": false,
 "AllowDiscount": false,
 "Discount": 0,
 "UnitPrice2WithTax": 0,
 "UnitPrice3": 0,
 "PropositionPrice": 0,
 "PropositionDateTo": "0100-01-01T00:00:00Z",
 "ExtraDesc1": "",
 "ExtraDesc2": "",
 "IsVariation": false,
 "TaxPercent": 24,
 "SalesTaxCode": "u1",
 "AllowNegativeInventiry": false,
 "DiscountQuantity": 0,
 "MaxDiscountAllowed": 0,
 "DefaultSaleQuantity": 0,
 "CostMethod": 0,
 "HasAttachments": false,
 "HasBarcodes": false,
 "HasCurrencyPrices": false,
 "HasUnits": false,
 "HasAlternative": false,
 "Barcodes": [],
 "Attachments": [],
 "Categories": [],
 "Warehouses": [],
 "CurrencyPrices": [],
 "Units": [],
 "Alternative": [],
 "Changes": []
}
```


---

## [Products] Update

`PUT /api/v1/Product/:itemcode`

This method is used to update a product in the dkERP System

**Path variables:**

- `:itemcode` (example: `tp5890n`) — ItemCode of the product that will be updated

**Request body:**

```json
{
	"Description":"Updated Description",
	"Price1":
	{
		"UnitPriceWithTax":1000	
	}
	
}
```

**Example response (200 OK):**

```json
{
 "RecordID": 12738,
 "ItemCode": "sndkost2",
 "Description": "Sendingar kostnaður",
 "Description2": "",
 "Inactive": false,
 "RecordCreated": "2018-05-13T21:05:09",
 "RecordModified": "2018-05-13T21:05:09",
 "AliasItemCode": "",
 "ItemClass": 0,
 "UnitCode": "",
 "Group": "",
 "UnitQuantity": 0,
 "NetWeight": 0,
 "UnitVolume": 0,
 "TotalQuantityInWarehouse": 0,
 "PurchasePrice": 0,
 "CurrencyCode": "ISK",
 "Exchange": 1,
 "UnitPrice1": 1000,
 "Purchasefactor": 0,
 "CostPrice": 0,
 "ProfitRatio1": 0,
 "UnitPrice1WithTax": 1240,
 "UnitPrice2": 0,
 "UnitPrice3WithTax": 0,
 "ShowItemInWebShop": false,
 "AllowDiscount": false,
 "Discount": 0,
 "UnitPrice2WithTax": 0,
 "UnitPrice3": 0,
 "PropositionPrice": 0,
 "PropositionDateTo": "0100-01-01T00:00:00Z",
 "ExtraDesc1": "",
 "ExtraDesc2": "",
 "IsVariation": false,
 "TaxPercent": 24,
 "SalesTaxCode": "u1",
 "AllowNegativeInventiry": false,
 "DiscountQuantity": 0,
 "MaxDiscountAllowed": 0,
 "DefaultSaleQuantity": 0,
 "CostMethod": 0,
 "HasAttachments": false,
 "HasBarcodes": false,
 "HasCurrencyPrices": false,
 "HasUnits": false,
 "HasAlternative": false,
 "Barcodes": [],
 "Attachments": [],
 "Categories": [],
 "Warehouses": [],
 "CurrencyPrices": [],
 "Units": [],
 "Alternative": [],
 "Changes": []
}
```


---

## [Products] Fetch All

`GET /api/v1/Product`

This method is used to get one instance of a product/item  
  
# Query string parameters
* **string** group `optional`
* **bool** inactive `optional`
* **bool** onweb `optional`
* **string** warehouse `optional`

**Query params:**

- `inactive`=`true` (optional/disabled in example) — If this option is enabled and set to true only products set to Inactive false will be returned.  
false then disbaled products will be returned
- `onweb`=`true` (optional/disabled in example) — Only return products that have the property ShowOnWeb set to true or false
- `group`=`00889` (optional/disabled in example) — Return products that belong to the supplied group number
- `warehouse`=`ak` (optional/disabled in example) — Return only products that belong to the supplied warehouse


---

## [Products] Fetch One

`GET /api/v1/Product/:itemcode?isBase64=false`

This method is used to get one instance of a product/item

**Query params:**

- `isBase64`=`false` — Use this option to enaable bas64 string in the itemcode variable

**Path variables:**

- `:itemcode` (example: `{{Product_Number}}`)


---

## [Products] Download Attachment

`GET /api/v1/Product/:itemcode/attachment/:id`

## Description
Using this function allows you to retrive an attachment that has been assigned to a product  
  
### Usage  
Supply the item code and id of the attachment in the URL  
this will return a status OK along with the attachment data
* ContentType - Mime Type
* ContentDisposition - FileName
* Byte content of the file

**Query params:**

- ``=`` (optional/disabled in example)

**Path variables:**

- `:itemcode` (example: `{{Product_Number}}`)
- `:id` (example: `168`)


---

## [Products] Groups

`GET /api/v1/productgroup`

This method is used to get one instance of a product/item


---

## [Products] Search

`GET /api/v1/Product/search/:searchstring`

**Path variables:**

- `:searchstring` (example: `{{ExampleSearch}}`)

**Example response (200 OK):**

```json
[
 {
  "RecordID": 32,
  "ItemCode": "dk-2220",
  "Description": "dk Lánardrottnagreining",
  "Description2": "",
  "Inactive": false,
  "RecordCreated": "2002-06-19T09:28:06",
  "RecordModified": "2015-08-06T11:22:57",
  "AliasItemCode": "",
  "ItemClass": 1,
  "UnitCode": "stk",
  "Group": "dk1",
  "UnitQuantity": 0,
  "NetWeight": 0,
  "UnitVolume": 0,
  "TotalQuantityInWarehouse": 0,
  "PurchasePrice": 0,
  "CurrencyCode": "ISK",
  "Exchange": 1,
  "UnitPrice1": 91088.7096774193,
  "Purchasefactor": 0,
  "CostPrice": 0,
  "ProfitRatio1": 0,
  "UnitPrice1WithTax": 112950,
  "UnitPrice2": 36435.4838709677,
  "UnitPrice3WithTax": 0,
  "ShowItemInWebShop": false,
  "AllowDiscount": true,
  "Discount": 0,
  "UnitPrice2WithTax": 45180,
  "UnitPrice3": 0,
  "PropositionPrice": 0,
  "PropositionDateTo": "1899-12-30T00:00:00Z",
  "ExtraDesc1": "",
  "ExtraDesc2": "",
  "IsVariation": false,
  "TaxPercent": 24,
  "SalesTaxCode": "u1",
  "SalesLedgerCode": "s003",
  "PurchaseTaxCode": "",
  "PurchaseLedgerCode": "",
  "AllowNegativeInventiry": true,
  "DiscountQuantity": 0,
  "MaxDiscountAllowed": 0,
  "DefaultSaleQuantity": 1,
  "ExtraFeeItemCode": "",
  "CostMethod": 0,
  "Dim1": "",
  "Dim2": null,
  "Dim3": null,
  "HasAttachments": false,
  "HasBarcodes": false,
  "HasCurrencyPrices": false,
  "HasUnits": false,
  "HasAlternative": false,
  "Barcodes": [],
  "Attachments": [],
  "Categories": [],
  "Warehouses": [
   {
    "Warehouse": "bg1",
    "SubGroup1": "",
    "SubGroup2": "",
    "SubGroup3": "",
    "SubGroup4": "",
    "QuantityInStock": 0,
    "MinimumStock": 0,
    "MaximumStock": 0,
    "LocationInWarehouse": "",
    "QuantityOnBackOrders": 0,
    "QuantityPoOrders": 0,
    "Modified": "2016-02-19T15:21:31.954Z",
    "Variations": []
   }
  ],
  "CurrencyPrices": [],
  "Units": [],
  "Alternative": [],
  "Changes": []
 },
 {
  "RecordID": 26,
  "ItemCode": "dk-2160",
  "Description": "dk Skuldunautagreining",
  "Description2": "",
  "Inactive": false,
  "RecordCreated": "2002-06-19T09:28:06",
  "RecordModified": "2015-08-06T11:22:56",
  "AliasItemCode": "",
  "ItemClass": 1,
  "UnitCode": "stk",
  "Group": "dk1",
  "UnitQuantity": 0,
  "NetWeight": 0,
  "UnitVolume": 0,
  "TotalQuantityInWarehouse": 0,
  "PurchasePrice": 0,
  "CurrencyCode": "ISK",
  "Exchange": 1,
  "UnitPrice1": 91088.7096774193,
  "Purchasefactor": 0,
  "CostPrice": 0,
  "ProfitRatio1": 0,
  "UnitPrice1WithTax": 112950,
  "UnitPrice2": 36435.4838709677,
  "UnitPrice3WithTax": 0,
  "ShowItemInWebShop": false,
  "AllowDiscount": true,
  "Discount": 0,
  "UnitPrice2WithTax": 45180,
  "UnitPrice3": 0,
  "PropositionPrice": 0,
  "PropositionDateTo": "1899-12-30T00:00:00Z",
  "ExtraDesc1": "",
  "ExtraDesc2": "",
  "IsVariation": false,
  "TaxPercent": 24,
  "SalesTaxCode": "u1",
  "SalesLedgerCode": "s003",
  "PurchaseTaxCode": "",
  "PurchaseLedgerCode": "",
  "AllowNegativeInventiry": true,
  "DiscountQuantity": 0,
  "MaxDiscountAllowed": 0,
  "DefaultSaleQuantity": 1,
  "ExtraFeeItemCode": "",
  "CostMethod": 0,
  "Dim1": "",
  "Dim2": "",
  "Dim3": "",
  "HasAttachments": false,
  "HasBarcodes": false,
  "HasCurrencyPrices": false,
  "HasUnits": false,
  "HasAlternative": false,
  "Barcodes": [],
  "Attachments": [],
  "Categories": [],
  "Warehouses": [
   {
    "Warehouse": "bg1",
    "SubGroup1": "",
    "SubGroup2": "",
    "SubGroup3": "",
    "SubGroup4": "",
    "QuantityInStock": 0,
    "MinimumStock": 0,
    "MaximumStock": 0,
    "LocationInWarehouse": "",
    "QuantityOnBackOrders": 0,
    "QuantityPoOrders": 0,
    "Modified": "2016-02-19T15:21:31.852Z",
    "Variations": []
   }
  ],
  "CurrencyPrices": [],
  "Units": [],
  "Alternative": [],
  "Changes": []
 }
]
// ...array has 20 items total, showing 2
```


---

## [Products] Page

`GET /api/v1/Product/page/:page/:count`

# Query string parameters
* **string** group `optional`
* **bool** inactive `optional`
* **bool** onweb `optional`
* **string** warehouse `optional`
* **DateTime** modified `optional`

**Query params:**

- `inactive`=`false` (optional/disabled in example) — If this option is enabled and set to true only products set to Inactive false will be returned.  
false then disbaled products will be returned
- `group`=`007` (optional/disabled in example) — Return products that belong to the supplied group number
- `onweb`=`true` (optional/disabled in example) — Only return products that have the property ShowOnWeb set to true or false
- `warehouse`=`ak` (optional/disabled in example) — Return only products that belong to the supplied warehouse
- `modified`=`2019-05-13T00:40:00.0000000` (optional/disabled in example)

**Path variables:**

- `:page` (example: `1`)
- `:count` (example: `1000`)

**Example response (200 OK):**

```json
[
 {
  "RecordID": 638,
  "ItemCode": "obi-195-3-080",
  "Description": "Drapp netsnúra CAT-5e 8m",
  "Description2": "",
  "Inactive": false,
  "RecordCreated": "2011-01-25T17:45:11",
  "RecordModified": "2015-08-06T11:23:10",
  "AliasItemCode": "",
  "ItemClass": 0,
  "UnitCode": "stk",
  "Group": "obi",
  "UnitQuantity": 1,
  "NetWeight": 0,
  "UnitVolume": 0,
  "TotalQuantityInWarehouse": 1,
  "PurchasePrice": 1402,
  "CurrencyCode": "ISK",
  "Exchange": 1,
  "UnitPrice1": 1774.1935483871,
  "Purchasefactor": 1,
  "CostPrice": 1402,
  "ProfitRatio1": 26.5473287009342,
  "UnitPrice1WithTax": 2200,
  "UnitPrice2": 0,
  "UnitPrice3WithTax": 0,
  "ShowItemInWebShop": false,
  "AllowDiscount": true,
  "Discount": 0,
  "UnitPrice2WithTax": 0,
  "UnitPrice3": 0,
  "PropositionPrice": 0,
  "PropositionDateTo": "1899-12-30T00:00:00Z",
  "ExtraDesc1": "",
  "ExtraDesc2": "",
  "IsVariation": false,
  "TaxPercent": 24,
  "SalesTaxCode": "u1",
  "SalesLedgerCode": "s006",
  "PurchaseTaxCode": "i3",
  "PurchaseLedgerCode": "i001",
  "AllowNegativeInventiry": true,
  "DiscountQuantity": 0,
  "MaxDiscountAllowed": 0,
  "DefaultSaleQuantity": 1,
  "ExtraFeeItemCode": "",
  "CostMethod": 2,
  "Dim1": "",
  "Dim2": null,
  "Dim3": null,
  "HasAttachments": false,
  "HasBarcodes": false,
  "HasCurrencyPrices": false,
  "HasUnits": false,
  "HasAlternative": false,
  "Barcodes": [],
  "Attachments": [],
  "Categories": [],
  "Warehouses": [
   {
    "Warehouse": "bg1",
    "SubGroup1": "",
    "SubGroup2": "",
    "SubGroup3": "",
    "SubGroup4": "",
    "QuantityInStock": 1,
    "MinimumStock": 0,
    "MaximumStock": 0,
    "LocationInWarehouse": "",
    "QuantityOnBackOrders": 0,
    "QuantityPoOrders": 0,
    "Modified": "2016-02-19T15:21:40.216Z",
    "Variations": []
   }
  ],
  "CurrencyPrices": [],
  "Units": [],
  "Alternative": [],
  "Changes": []
 },
 {
  "RecordID": 645,
  "ItemCode": "nes-ubl um-pk5",
  "Description": "Rafræn viðskipti: 1 - 1250 skjöl",
  "Description2": "Unimaze",
  "Inactive": true,
  "RecordCreated": "2011-02-09T12:43:58",
  "RecordModified": "2015-08-06T11:23:08",
  "AliasItemCode": "",
  "ItemClass": 1,
  "UnitCode": "pakk",
  "Group": "nesubl",
  "UnitQuantity": 0,
  "NetWeight": 0,
  "UnitVolume": 0,
  "TotalQuantityInWarehouse": 0,
  "PurchasePrice": 0,
  "CurrencyCode": "ISK",
  "Exchange": 1,
  "UnitPrice1": 65000,
  "Purchasefactor": 0,
  "CostPrice": 0,
  "ProfitRatio1": 0,
  "UnitPrice1WithTax": 81575,
  "UnitPrice2": 0,
  "UnitPrice3WithTax": 0,
  "ShowItemInWebShop": false,
  "AllowDiscount": false,
  "Discount": 0,
  "UnitPrice2WithTax": 0,
  "UnitPrice3": 0,
  "PropositionPrice": 0,
  "PropositionDateTo": "1899-12-30T00:00:00Z",
  "ExtraDesc1": "",
  "ExtraDesc2": "",
  "IsVariation": false,
  "TaxPercent": 24,
  "SalesTaxCode": "u1",
  "SalesLedgerCode": "s002",
  "PurchaseTaxCode": "i3",
  "PurchaseLedgerCode": "i001",
  "AllowNegativeInventiry": false,
  "DiscountQuantity": 0,
  "MaxDiscountAllowed": 0,
  "DefaultSaleQuantity": 0,
  "ExtraFeeItemCode": "",
  "CostMethod": 0,
  "Dim1": "",
  "Dim2": null,
  "Dim3": null,
  "HasAttachments": false,
  "HasBarcodes": false,
  "HasCurrencyPrices": false,
  "HasUnits": false,
  "HasAlternative": false,
  "Barcodes": [],
  "Attachments": [],
  "Categories": [],
  "Warehouses": [
   {
    "Warehouse": "bg1",
    "SubGroup1": "",
    "SubGroup2": "",
    "SubGroup3": "",
    "SubGroup4": "",
    "QuantityInStock": 0,
    "MinimumStock": 0,
    "MaximumStock": 0,
    "LocationInWarehouse": "",
    "QuantityOnBackOrders": 0,
    "QuantityPoOrders": 0,
    "Modified": "2016-02-19T15:21:33.324Z",
    "Variations": []
   }
  ],
  "CurrencyPrices": [],
  "Units": [],
  "Alternative": [],
  "Changes": []
 }
]
// ...array has 10 items total, showing 2
```


---

## [Products] Modified

`GET /api/v1/Product/modified/:modifieddate/:page/:size?detailed=2020-04-01T00:40:00.0000000&include=ItemCode,Description`

## Get Modified Products  
use this method to get modified products  
**NOTE:** Page and Size parameters are optional and will default to page 1 and size 100  
  
# Modified properties
> The following properties are evaluated and determin if a product will be part of the result  
>   `Product - RecordModified`, `Barcodes - Modified`, `Warehouses - Modified`, `Attachments - Linked`
 
# Query string parameters
* **DateTime** detailed `optional - more accurate results` 
* **string** group `optional`
* **bool** inactive `optional`
* **bool** onweb `optional`
* **string** warehouse `optional`

**Query params:**

- `detailed`=`2020-04-01T00:40:00.0000000` — This option **overrides** the modifieddate with a detailed date along with time  
for acurate filtering of modified products.
- `group`=`ua2` (optional/disabled in example) — Return products that belong to the supplied group number
- `inactive`=`false` (optional/disabled in example) — If this option is enabled and set to true only products set to Inactive false will be returned.  
false then disbaled products will be returned
- `onweb`=`true` (optional/disabled in example) — Only return products that have the property ShowOnWeb set to true or false
- `warehouse`=`ak` (optional/disabled in example) — Return only products that belong to the supplied warehouse
- `include`=`ItemCode,Description`

**Path variables:**

- `:modifieddate` (example: `2020-04-01`)
- `:page` (example: `1`)
- `:size` (example: `100`)

**Example response (200 OK):**

```json
[
 {
  "RecordID": 12704,
  "ItemCode": "tp5890h",
  "Description": "CustomerDiscount",
  "Description2": "",
  "Inactive": false,
  "RecordCreated": "2018-05-02T10:02:25",
  "RecordModified": "2018-05-02T10:47:37",
  "AliasItemCode": "",
  "ItemClass": 0,
  "UnitCode": "",
  "Group": "",
  "UnitQuantity": 0,
  "NetWeight": 0,
  "UnitVolume": 0,
  "TotalQuantityInWarehouse": -2,
  "PurchasePrice": 0,
  "CurrencyCode": "ISK",
  "Exchange": 1,
  "UnitPrice1": 4321,
  "Purchasefactor": 0,
  "CostPrice": 0,
  "ProfitRatio1": 0,
  "UnitPrice1WithTax": 5358,
  "UnitPrice2": 5432,
  "UnitPrice3WithTax": 0,
  "ShowItemInWebShop": false,
  "AllowDiscount": true,
  "Discount": 0,
  "UnitPrice2WithTax": 6736,
  "UnitPrice3": 0,
  "PropositionPrice": 0,
  "PropositionDateTo": "0100-01-01T00:00:00Z",
  "ExtraDesc1": "",
  "ExtraDesc2": "",
  "IsVariation": false,
  "TaxPercent": 24,
  "SalesTaxCode": "u1",
  "SalesLedgerCode": "s001",
  "PurchaseTaxCode": "i3",
  "PurchaseLedgerCode": "i001",
  "AllowNegativeInventiry": true,
  "DiscountQuantity": 0,
  "MaxDiscountAllowed": 0,
  "DefaultSaleQuantity": 0,
  "ExtraFeeItemCode": "",
  "CostMethod": 2,
  "Dim1": "",
  "Dim2": "",
  "Dim3": "",
  "HasAttachments": false,
  "HasBarcodes": false,
  "HasCurrencyPrices": false,
  "HasUnits": false,
  "HasAlternative": false,
  "Barcodes": [],
  "Attachments": [],
  "Categories": [],
  "Warehouses": [
   {
    "Warehouse": "1",
    "SubGroup1": "",
    "SubGroup2": "",
    "SubGroup3": "",
    "SubGroup4": "",
    "QuantityInStock": 0,
    "MinimumStock": 0,
    "MaximumStock": 0,
    "LocationInWarehouse": "",
    "QuantityOnBackOrders": 0,
    "QuantityPoOrders": 0,
    "Modified": "2018-05-02T10:02:25.63Z",
    "Variations": []
   },
   {
    "Warehouse": "ak",
    "SubGroup1": "",
    "SubGroup2": "",
    "SubGroup3": "",
    "SubGroup4": "",
    "QuantityInStock": 0,
    "MinimumStock": 0,
    "MaximumStock": 0,
    "LocationInWarehouse": "",
    "QuantityOnBackOrders": 0,
    "QuantityPoOrders": 0,
    "Modified": "2018-05-02T10:02:25.63Z",
    "Variations": []
   },
   {
    "Warehouse": "bg1",
    "SubGroup1": "",
    "SubGroup2": "",
    "SubGroup3": "",
    "SubGroup4": "",
    "QuantityInStock": -2,
    "MinimumStock": 0,
    "MaximumStock": 0,
    "LocationInWarehouse": "",
    "QuantityOnBackOrders": 0,
    "QuantityPoOrders": 0,
    "Modified": "2018-05-04T12:31:04.111Z",
    "Variations": []
   }
  ],
  "CurrencyPrices": [],
  "Units": [],
  "Alternative": [],
  "Changes": []
 },
 {
  "RecordID": 12710,
  "ItemCode": "tp5890n",
  "Description": "SpecialLockPriceAndDiscount",
  "Description2": "",
  "Inactive": false,
  "RecordCreated": "2018-05-02T12:37:06",
  "RecordModified": "2018-05-02T12:43:43",
  "AliasItemCode": "",
  "ItemClass": 0,
  "UnitCode": "",
  "Group": "",
  "UnitQuantity": 0,
  "NetWeight": 0,
  "UnitVolume": 0,
  "TotalQuantityInWarehouse": -2,
  "PurchasePrice": 0,
  "CurrencyCode": "ISK",
  "Exchange": 1,
  "UnitPrice1": 0,
  "Purchasefactor": 0,
  "CostPrice": 0,
  "ProfitRatio1": 0,
  "UnitPrice1WithTax": 0,
  "UnitPrice2": 0,
  "UnitPrice3WithTax": 0,
  "ShowItemInWebShop": false,
  "AllowDiscount": true,
  "Discount": 0,
  "UnitPrice2WithTax": 0,
  "UnitPrice3": 0,
  "PropositionPrice": 0,
  "PropositionDateTo": "0100-01-01T00:00:00Z",
  "ExtraDesc1": "",
  "ExtraDesc2": "",
  "IsVariation": false,
  "TaxPercent": 24,
  "SalesTaxCode": "u1",
  "SalesLedgerCode": "s001",
  "PurchaseTaxCode": "i3",
  "PurchaseLedgerCode": "i001",
  "AllowNegativeInventiry": true,
  "DiscountQuantity": 0,
  "MaxDiscountAllowed": 0,
  "DefaultSaleQuantity": 0,
  "ExtraFeeItemCode": "",
  "CostMethod": 2,
  "Dim1": "",
  "Dim2": "",
  "Dim3": "",
  "HasAttachments": false,
  "HasBarcodes": false,
  "HasCurrencyPrices": false,
  "HasUnits": false,
  "HasAlternative": false,
  "Barcodes": [],
  "Attachments": [],
  "Categories": [],
  "Warehouses": [
   {
    "Warehouse": "1",
    "SubGroup1": "",
    "SubGroup2": "",
    "SubGroup3"
...[truncated]
```


---

## [Products] Transactions

`GET /api/v1/product/:number/transaction/:page/:count`

**Path variables:**

- `:number` (example: `{{Product_Number}}`) — Number of the customer
- `:page` (example: `1`) — Page number
- `:count` (example: `100`) — transactions per page

**Example response (200 OK):**

```json
[
 {
  "ID": 46334,
  "Created": "2016-01-05T22:38:16.616+00:00",
  "Modified": "2016-01-05T22:38:16.616+00:00",
  "Origin": 8,
  "HeadId": 39,
  "Sequence": 10,
  "ItemCode": "em-034",
  "Warehouse": "bg1",
  "TransactionCode": 6,
  "JournalDate": "2016-01-05T00:00:00",
  "JournalType": 0,
  "Quantity": -2,
  "PurchasePrice": 0,
  "CurrencyCode": "ISK",
  "Exchange": 1,
  "CostPrice": 4750,
  "CostAmount": -9500,
  "SalesAmount": 0,
  "InventOnHand": 0,
  "Text": "Testing CostItem from Mobiz Unit test. I",
  "NetWeight": 0,
  "UnitVolume": 0,
  "NumberOfPackages": 0,
  "CountedQuantity": 0,
  "JobNumber": "1023",
  "VendorPrice": 0,
  "VendorDiscount": 0,
  "Fabrication": 0,
  "BatchExpiry": "0001-01-01T00:00:00",
  "TypeOf": 0,
  "PurchaseAmount": 0,
  "PoBatchId": 0
 },
 {
  "ID": 46340,
  "Created": "2016-01-08T11:41:06.622+00:00",
  "Modified": "2016-01-08T11:41:06.622+00:00",
  "Origin": 8,
  "HeadId": 39,
  "Sequence": 17,
  "ItemCode": "em-002",
  "Warehouse": "bg1",
  "TransactionCode": 6,
  "JournalDate": "2016-01-20T00:00:00",
  "JournalType": 0,
  "Quantity": -1,
  "PurchasePrice": 0,
  "CurrencyCode": "ISK",
  "Exchange": 1,
  "CostPrice": 0,
  "CostAmount": 0,
  "SalesAmount": 0,
  "InventOnHand": 0,
  "Text": "D-Link DI 624+",
  "NetWeight": 0,
  "UnitVolume": 0,
  "NumberOfPackages": 0,
  "CountedQuantity": 0,
  "JobNumber": "1063",
  "VendorPrice": 0,
  "VendorDiscount": 0,
  "Fabrication": 0,
  "BatchExpiry": "0001-01-01T00:00:00",
  "TypeOf": 0,
  "PurchaseAmount": 0,
  "PoBatchId": 0
 }
]
// ...array has 10 items total, showing 2
```


---

## [Products] Warehouses

`GET /api/v1/productwarehouse`

This method is used to get one instance of a product/item

