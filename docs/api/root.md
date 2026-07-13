# dkPlus API — Root

Base URL: https://api.dkplus.is/api/v1 — Auth: `Authorization: Bearer <token>`


---

## [Root] Search

`GET /api/v1/search/:searchstring`

using this request allows you to search for example customers,vendors,products...
## Type  
* 0 = Customer
* 1 = Vendor
* 2 = Product
* 3 = Employee

**Path variables:**

- `:searchstring` (example: `software`) — Input the string to search for

**Example response (200 OK):**

```json
[
 {
  "Type": 0,
  "ID": "50000",
  "Name": "dk software ltd",
  "Url": "/api/v1/customer/50000"
 },
 {
  "Type": 0,
  "ID": "5104130670",
  "Name": "Overcast Software ehf.",
  "Url": "/api/v1/customer/5104130670"
 }
]
// ...array has 15 items total, showing 2
```


---

## [Root] Information

`GET /api/v1/company`

using this request retuns information regarding the company and settings

**Example response (200 OK):**

```json
{
 "Information": {
  "Owner": "DemoDev",
  "OwnerName": "Aðgangur- external Developers",
  "License": "001-4881-07DD-090C",
  "Company": {
   "Number": "DEV",
   "Name": "Prufufyrirtækið ehf",
   "SSNumber": "1231231239",
   "Address1": "Öskubakka 144",
   "Address2": "DEV-Address2",
   "Address3": "DEV-Address3",
   "ZipCode": "1122",
   "Country": "IS",
   "BankCode": "0313",
   "BankAccGroup": "26",
   "BankAccount": "018959",
   "VATNumber": "123456",
   "Phone": "555-5555",
   "Mobile": "",
   "Fax": "666-6666",
   "Email": "jonas@dk.is",
   "Url": "",
   "Swift": "",
   "IBAN": "",
   "City": ""
  }
 },
 "Customer": {
  "Enabled": true
 },
 "Product": {
  "Enabled": true,
  "Warehouse": {
   "Enabled": true,
   "Default": "BG1"
  },
  "Categories": true
 },
 "Vendor": {
  "Enabled": true,
  "Confirmation": true
 },
 "Sale": {
  "Enabled": true
 },
 "Project": {
  "Enabled": true,
  "PhaseEnabled": true,
  "TaskEnabled": true,
  "EnterDriveInJournal": true,
  "DefaultDriveUnit": 1
 },
 "Dimmension": {
  "Dim1Enabled": false,
  "Dim2Enabled": false,
  "Dim3Enabled": true
 },
 "General": {
  "CurrencyEnabled": true,
  "DefaultCurrency": "ISK",
  "Attachments": true
 },
 "Member": {
  "Enabled": true
 }
}
```


---

## [Root] Permission

`GET /api/v1/permission`

using this request allows you to search for example customers,vendors,products...
## Enabled  
* Enabled,
* Disabled,
* Blocked  

## Permission Options  
* Full
* View
* Modify
* None
* Deny


---

## [Root] Test Connection

`GET /api/v1/company/connection`

using this request allows you to search for example customers,vendors,products...
## Enabled  
* Enabled,
* Disabled,
* Blocked  

## Permission Options  
* Full
* View
* Modify
* None
* Deny

**Example response (200 OK):**

```json
true
```

