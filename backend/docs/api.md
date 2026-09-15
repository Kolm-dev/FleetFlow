# FleetFlow API

Base API URL: `/api`

All protected routes use Laravel Sanctum session cookies. Validation errors return `422`.

Before login, request the CSRF cookie:

```http
GET /sanctum/csrf-cookie
```

## Response Shape

Lists return collection data:

```json
{
    "total": 1,
    "drivers": []
}
```

Show routes return one named object:

```json
{
    "driver": {}
}
```

Create, update, and action routes return a message with the changed object:

```json
{
    "message": "Driver updated successfully.",
    "driver": {}
}
```

Delete routes return `204 No Content`.

## Auth

| Method | Endpoint    | Description                    |
| ------ | ----------- | ------------------------------ |
| GET    | `/user`     | Get current authenticated user |
| POST   | `/login`    | Login                          |
| POST   | `/logout`   | Logout                         |
| POST   | `/register` | Register                       |

Login fields: `name`, `password`.
Register fields: `name`, `password`, `password_confirmation`.

## Statuses

| Entity | Values                                      |
| ------ | ------------------------------------------- |
| Driver | `available`, `on_trip`, `unavailable`       |
| Trip   | `planned`, `pending`, `closed`, `cancelled` |

## Drivers

| Method | Endpoint        | Response              |
| ------ | --------------- | --------------------- |
| GET    | `/drivers`      | `{ total, drivers }`  |
| GET    | `/drivers/{id}` | `{ driver }`          |
| POST   | `/drivers`      | `{ message, driver }` |
| PATCH  | `/drivers/{id}` | `{ message, driver }` |
| DELETE | `/drivers/{id}` | `204 No Content`      |

Filter: `status`.

Create fields: `name`, `phone_number`, `status`, `photo`.
Update fields: same fields, all optional.

Driver object includes assigned `vehicles`.

## Vehicles

| Method | Endpoint         | Response               |
| ------ | ---------------- | ---------------------- |
| GET    | `/vehicles`      | `{ total, vehicles }`  |
| GET    | `/vehicles/{id}` | `{ vehicle }`          |
| POST   | `/vehicles`      | `{ message, vehicle }` |
| PATCH  | `/vehicles/{id}` | `{ message, vehicle }` |
| DELETE | `/vehicles/{id}` | `204 No Content`       |

Filters: `driver_id`, `license_plate`.

Create fields: `brand`, `model`, `license_plate`, `year`, `driver_id`.
Update fields: same fields, all optional.

Vehicle object includes assigned `driver`.
`license_plate` is converted to uppercase automatically.

## Trips

| Method | Endpoint                 | Response                |
| ------ | ------------------------ | ----------------------- |
| GET    | `/trips`                 | paginated trips         |
| GET    | `/trips/{id}`            | `{ trip }`              |
| POST   | `/trips`                 | `{ message, trip }`     |
| PATCH  | `/trips/{id}`            | `{ message, trip }`     |
| PATCH  | `/trips/{id}/close`      | `{ message, trip }`     |
| PATCH  | `/trips/{id}/cancel`     | `{ message, trip }`     |
| DELETE | `/trips/{id}`            | `204 No Content`        |
| POST   | `/trips/calculate-price` | `{ recommended_price }` |

Filters: `status`, `page`, `sort`.

Sort values: `price`, `-price`, `created_at`, `-created_at`.

Create fields: `title`, `driver_id`, `vehicle_id`, `distance`, `price`, `status`.
Update fields: same fields, all optional.

Trip object includes `driver` and `vehicle`.

Business rules:

- A trip can be created only with an `available` driver.
- The vehicle must belong to the selected driver.
- Closing or cancelling a trip makes the driver `available`.
- A `closed` or `cancelled` trip cannot be cancelled again.

## Pricing Settings

| Method | Endpoint            | Response                       |
| ------ | ------------------- | ------------------------------ |
| GET    | `/pricing-settings` | `{ pricing_setting }`          |
| PATCH  | `/pricing-settings` | `{ message, pricing_setting }` |

Fields: `price_per_km`, `base_price`, `minimum_price`.

## Stats

| Method | Endpoint | Response                       |
| ------ | -------- | ------------------------------ |
| GET    | `/stats` | `{ drivers, vehicles, trips }` |

Stats counters:

- drivers: `total`, `available`, `on_trip`, `unavailable`
- vehicles: `total`
- trips: `total`, `planned`, `pending`, `closed`, `cancelled`
