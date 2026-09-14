# FleetFlow API

Base URL: `/api`

All responses are JSON. Validation errors return `422`.

## Auth

Authentication uses Laravel Sanctum session cookies.

Before login, request the Sanctum CSRF cookie:

```http
GET /sanctum/csrf-cookie
```

| Method | Endpoint  | Description                    |
| ------ | --------- | ------------------------------ |
| GET    | `/user`   | Get current authenticated user |
| POST   | `/login`  | Login to account               |
| POST   | `/logout` | Logout from the account        |

Login fields:

| Field      | Required | Rules  |
| ---------- | -------: | ------ |
| `name`     |      yes | string |
| `password` |      yes | string |

## Statuses

| Entity | Values                                |
| ------ | ------------------------------------- |
| Driver | `available`, `on_trip`, `unavailable` |
| Trip   | `planned`, `pending`, `closed`        |

## Drivers

| Method | Endpoint        | Description                  |
| ------ | --------------- | ---------------------------- |
| GET    | `/drivers`      | List drivers with vehicles   |
| GET    | `/drivers/{id}` | Get one driver with vehicles |
| POST   | `/drivers`      | Create driver                |
| PATCH  | `/drivers/{id}` | Update driver                |
| DELETE | `/drivers/{id}` | Delete driver                |

Filters:

| Query    | Type   | Values                                |
| -------- | ------ | ------------------------------------- |
| `status` | string | `available`, `on_trip`, `unavailable` |

Example:

```http
GET /api/drivers?status=available
```

Create fields:

| Field          | Required | Rules           |
| -------------- | -------: | --------------- |
| `name`         |      yes | string, max 255 |
| `phone_number` |      yes | string, max 20  |
| `status`       |       no | driver status   |

Update fields: `name`, `phone_number`, `status`, `photo`.
All update fields are optional.

Show response:

```json
{
    "driver": {
        "id": 1,
        "name": "Dr. Jayden Lynch",
        "phone_number": "+1.480.475.8257",
        "status": "available",
        "photo": null,
        "vehicles": []
    }
}
```

## Stats

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| GET    | `/stats` | API summary |

Returns counters grouped by `drivers`, `vehicles`, and `trips`.

Driver stats:

- `total`
- `available`
- `on_trip`
- `unavailable`

Vehicle stats:

- `total`

Trip stats:

- `total`
- `planned`
- `pending`
- `closed`

## Vehicles

| Method | Endpoint         | Description                 |
| ------ | ---------------- | --------------------------- |
| GET    | `/vehicles`      | List vehicles with driver   |
| GET    | `/vehicles/{id}` | Get one vehicle with driver |
| POST   | `/vehicles`      | Create vehicle              |
| PATCH  | `/vehicles/{id}` | Update vehicle              |
| DELETE | `/vehicles/{id}` | Delete vehicle              |

Filters:

| Query           | Type    | Rules                      |
| --------------- | ------- | -------------------------- |
| `driver_id`     | integer | must exist in `drivers.id` |
| `license_plate` | string  | exact plate filter, max 8  |

Example:

```http
GET /api/vehicles?driver_id=1
GET /api/vehicles?license_plate=AA1234BB
```

Create fields:

| Field           | Required | Rules                      |
| --------------- | -------: | -------------------------- |
| `brand`         |      yes | string, max 255            |
| `model`         |      yes | string, max 255            |
| `license_plate` |      yes | string, unique, max 8      |
| `year`          |       no | integer, 1900-current year |
| `driver_id`     |      yes | must exist in `drivers.id` |

Update fields: `brand`, `model`, `license_plate`, `year`, `driver_id`.
All update fields are optional.

Show response:

```json
{
    "vehicle": {
        "id": 1,
        "brand": "Volvo",
        "model": "FH",
        "license_plate": "AA1234BB",
        "year": 2022,
        "driver_id": 1,
        "driver": {}
    }
}
```

Notes:

- `license_plate` is converted to uppercase automatically.
- `year` must be between `1900` and the current year.

## Trips

| Method | Endpoint                 | Description                                     |
| ------ | ------------------------ | ----------------------------------------------- |
| GET    | `/trips`                 | Paginated list of trips with driver and vehicle |
| GET    | `/trips/{id}`            | Get one trip with driver and vehicle            |
| POST   | `/trips`                 | Create trip                                     |
| PATCH  | `/trips/{id}`            | Update trip                                     |
| PATCH  | `/trips/{id}/close`      | Close trip and make driver available            |
| POST   | `/trips/calculate-price` | Calculate recommended trip price                |
| DELETE | `/trips/{id}`            | Delete trip                                     |

Filters:

| Query    | Type    | Values                                         |
| -------- | ------- | ---------------------------------------------- |
| `status` | string  | `planned`, `pending`, `closed`                 |
| `page`   | integer | pagination page                                |
| `sort`   | string  | `price`, `-price`, `created_at`, `-created_at` |

Examples:

```http
GET /api/trips?status=planned
GET /api/trips?page=2
GET /api/trips?sort=-price
```

Show response:

```json
{
    "trip": {
        "id": 1,
        "title": "Warsaw to Berlin",
        "driver_id": 1,
        "vehicle_id": 1,
        "distance": 571,
        "price": "2000.00",
        "status": "pending",
        "driver": {},
        "vehicle": {}
    }
}
```

Create fields:

| Field        | Required | Rules                       |
| ------------ | -------: | --------------------------- |
| `title`      |      yes | string, max 255             |
| `driver_id`  |      yes | must exist in `drivers.id`  |
| `vehicle_id` |      yes | must exist in `vehicles.id` |
| `distance`   |       no | integer, min 0              |
| `price`      |       no | numeric, min 0              |
| `status`     |       no | trip status                 |

Update fields: `title`, `distance`, `price`, `driver_id`, `vehicle_id`, `status`.
All update fields are optional.

Calculate price fields:

| Field      | Required | Rules                        |
| ---------- | -------: | ---------------------------- |
| `distance` |      yes | numeric, gt 0 (great than 0) |

Example:

```http
POST /api/trips/calculate-price
```

Request:

```json
{
    "distance": 571
}
```

Response:

```json
{
    "recommended_price": 7152
}
```

Business rules:

- Trip can be created only with an `available` driver.
- Vehicle must belong to the selected driver.
- After trip creation, driver status becomes `on_trip`.
- If `driver_id` is changed during update, the new driver must be `available`.
- If trip status becomes `closed`, driver status becomes `available`.

## Pricing Settings

| Method | Endpoint            | Description                  |
| ------ | ------------------- | ---------------------------- |
| GET    | `/pricing-settings` | Get current pricing settings |
| PATCH  | `/pricing-settings` | Update pricing settings      |

Response:

```json
{
    "price_per_km": "12.00",
    "base_price": "300.00",
    "minimum_price": "500.00",
    "updated_at": "2026-09-13T21:18:19.000000Z"
}
```

Update fields:

| Field           | Required | Rules          |
| --------------- | -------: | -------------- |
| `price_per_km`  |       no | numeric, min 0 |
| `base_price`    |       no | numeric, min 0 |
| `minimum_price` |       no | numeric, min 0 |

All update fields are optional.

## HTTP Status Codes

| Code | Meaning             |
| ---: | ------------------- |
|  200 | Success             |
|  201 | Created             |
|  204 | Deleted, no content |
|  404 | Not found           |
|  422 | Validation error    |
