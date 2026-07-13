# dkPlus API — Projects

Base URL: https://api.dkplus.is/api/v1 — Auth: `Authorization: Bearer <token>`


---

## [Projects] Fetch All

`GET /api/v1/project`

This method is used to get one instance of a product/item


---

## [Projects] Fetch One

`GET /api/v1/project/:number`

This method is used to get one instance of a product/item

**Path variables:**

- `:number` (example: ``) — Number assigned to the project to fetch


---

## [Projects] Create Project

`POST /api/v1/project`

This method is used to get one instance of a product/item

**Request body:**

```json
{
	"Number" : "4568877",
	"Name":"Test Job"
}
```


---

## [Projects] Invoices

`GET /api/v1/project/:number/invoice`

This method is used to get invoices that have been created for the project

**Path variables:**

- `:number` (example: `{{Project_Number}}`) — Number of the project to get invoices for


---

## [Projects] Modified

`GET /api/v1/project/modified/:modified/:page/:size`

**Path variables:**

- `:modified` (example: `2018-01-15`) — Projects changed after this date
- `:page` (example: `1`) — Page Number
- `:size` (example: `100`) — Number of projects to fit on page


---

## [Projects] Page

`GET /api/v1/project/page/:page/:size`

**Path variables:**

- `:page` (example: `2`) — Page number
- `:size` (example: `50`) — Items per page


---

## [Projects] Transactions

`GET /api/v1/project/transaction/page/:page/:count?createdAfter=2019-01-01T00:00:00.0000000`

Use this method to get project transactions pages
##  Parameters
* **string** account
* **string** dim1
* **string** voucher
* **string** reference
* **datetime** createdAfter
* **datetime** createdBefore

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
- `:count` (example: `500`)

