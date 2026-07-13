# dkPlus API — Tokens

Base URL: https://api.dkplus.is/api/v1 — Auth: `Authorization: Bearer <token>`


---

## [Tokens/Report] Email Usage

`POST /api/v1/token/report/usage/email?from=2018-12-01&to=2019-01-01`

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

**Query params:**

- `from`=`2018-12-01`
- `to`=`2019-01-01`

**Request body:**

```json
{
	"To":"valdi@dk.is",
	"Subject":"Token Usage Report"
}
```


---

## [Tokens/Report] Download Usage(PDF)

`GET /api/v1/token/report/usage/pdf?from=2018-12-01&to=2019-01-01`

This action returns a Usage report in a pdf format  
containing usage statistics per day

**Query params:**

- `from`=`2018-12-01` — Report from date
- `to`=`2019-01-01` — Report to date

**Example response (200 OK):**

```json
[
 {
  "ID": "a89e47c2-5baa-48ff-8da9-3ab512274d19",
  "Name": "Prufufyrirtækið ehf."
 }
]
```


---

## [Tokens] Company List

`GET /api/v1/token/companies`

This method retrives companies a user has access to  
when creating a token you need to supply an ID of a company that the token will be assigned to.
  
## Autorization 
Basic Auth

**Example response (200 OK):**

```json
[
 {
  "ID": "a89e47c2-5baa-48ff-8da9-3ab512274d19",
  "Name": "Prufufyrirtækið ehf."
 }
]
```


---

## [Tokens] Create

`POST /api/v1/token`

Use this function to create a token for a user connected to a specific company
to get a list of companies that a user can request a token for user the api/v1/token/companies method

## Authentication  
Basic Auth 

## Body  
* **Guid** company `optional`
* **string** Description

**Request body:**

```json
{ 
  "Company": "a89e47c2-5baa-48ff-8da9-3ab512274d19",
  "Description": "Test Application Token"
}
```


---

## [Tokens] Remove

`DELETE /api/v1/token/{{API_Token}}`

Use this function to remove token access to company

