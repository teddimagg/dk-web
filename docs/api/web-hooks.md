# dkPlus API — Web Hooks

Base URL: https://api.dkplus.is/api/v1 — Auth: `Authorization: Bearer <token>`


---

## [Web Hooks] Get Subscriptions

`GET /api/v1/admin/webhook`

## List  
Use this method to get all web hook subscriptions for the company assiged to your API Token

**Request body:**

```json
{
	"Description" : "Update Webpage",
	"Url":"https://www.dk.is",
	"Options":
	{
		"Product":true,
		"Customer":true,
		"Vendor":false
	}
	
}
```

**Example response (200 OK):**

```json
[
 {
  "ID": "07bbbac4-78ad-4f81-81a9-51821c6acedf",
  "Description": "Update Webpage",
  "Url": "https://www.dk.is",
  "Options": {
   "Enabled": false,
   "Product": true,
   "Customer": true,
   "Vendor": false,
   "Project": false
  }
 },
 {
  "ID": "1126ce39-9fd2-4964-b4b7-d1ce900a1c80",
  "Description": "Founders App Subscription",
  "AuthorizationScheme": "Bearer",
  "AuthorizationValue": "AxyCbF8",
  "Url": "https://www.dk.is/hooks",
  "Options": {
   "Enabled": true,
   "Product": true,
   "Customer": true,
   "Vendor": false,
   "Project": false
  }
 }
]
```


---

## [Web Hooks] Subscribe

`POST /api/v1/admin/webhook`

Use this method to create a new web hook subscription

**Request body:**

```json
{
	"Description" : "Update Webpage",
	"Url":"https://www.dk.is",
	"Options":
	{
		"Enabled" : true,
		"Product":true,
		"Customer":true,
		"Vendor":false
	}
	
}
```

**Example response (200 OK):**

```json
{
 "ID": "96ea8f4c-1f69-4e3c-a292-e1c0a9f15165",
 "Description": "Update Webpage",
 "Url": "https://www.dk.is",
 "Options": {
  "Product": true,
  "Customer": true,
  "Vendor": false,
  "Project": false
 }
}
```


---

## [Web Hooks] Un-Subscribe

`DELETE /api/v1/admin/webhook/:id`

Use this method to remove a active web hook subscription

**Path variables:**

- `:id` (example: `96ea8f4c-1f69-4e3c-a292-e1c0a9f15165`)


---

## [Web Hooks] Manage Subscription

`PUT /api/v1/admin/webhook/:id`

User this method to update and existing web hook subscription

**Path variables:**

- `:id` (example: `1126ce39-9fd2-4964-b4b7-d1ce900a1c80`)

**Request body:**

```json
    {
        "Description": "Founders App Subscription",
        "Url": "https://www.dk.is/hooks",
        "AuthorizationScheme":"Bearer",
        "AuthorizationValue":"AxyCbF8",
        "Options": {
        	"Enabled" : true,
            "Product": true,
            "Customer": true,
            "Vendor": false,
            "Project": false
        }
   }
```

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

## [Web Hooks] Test

`POST /api/v1/admin/webhook/action/test`

Use this method to post to your page that will process the webhook.
Leave Authorization Scheme and Value empty to disable Authentication in the Authorization Header of the request
  
## Authorization  
enter scheme to use for example "Bearer" or "Basic"  
if basic is used store the username and password encoded

**Request body:**

```json
{
 "Description" : "Update Webpage",
 "Url":"http://wwww.dk.is/hooktest",
 "Options":
 {
  "Enabled" : true,
  "Product":false,
  "Customer":true,
  "Vendor":false
 }
}
```

