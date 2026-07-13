# dkPlus API — My Pages

Base URL: https://api.dkplus.is/api/v1 — Auth: `Authorization: Bearer <token>`


---

## [My Pages/Invites] Fetch

`GET /api/v1/mypages/invites?customer=1710794709`

**Query params:**

- `customer`=`1710794709`


---

## [My Pages/Invites] Create

`POST /api/v1/mypages/invites`

**Request body:**

```json
{
	"Email":"valdi@dk.is",
	"Customer":"1710794709",
	"Role":"Admin"
}
```


---

## [My Pages/Invites] Revoke

`DELETE /api/v1/mypages/invites/:id`

**Path variables:**

- `:id` (example: `08bf1b69-ab26-43c2-8583-708fb79ca6ef`)

