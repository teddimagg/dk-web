# dkPlus API — Time Clock

Base URL: https://api.dkplus.is/api/v1 — Auth: `Authorization: Bearer <token>`


---

## [Time Clock] In

`GET /api/v1/timeclock/in`


---

## [Time Clock] Out

`GET /api/v1/timeclock/out`


---

## [Time Clock] Create

`POST /api/v1/timeclock/register`

**Request body:**

```json
{
	"Employee":"1710794709",
	"Start": "2018-03-11T08:55:34.8544033+00:00",
	"End": "2018-03-11T010:20:34.8544033+00:00"
}
```

