# FleetFlow API

Base URL: `/api`

All responses are JSON. Validation errors return `422`.

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

Notes:

- `license_plate` is converted to uppercase automatically.
- `year` must be between `1900` and the current year.

## Trips

| Method | Endpoint            | Description                                     |
| ------ | ------------------- | ----------------------------------------------- |
| GET    | `/trips`            | Paginated list of trips with driver and vehicle |
| GET    | `/trips/{id}`       | Get one trip with driver and vehicle            |
| POST   | `/trips`            | Create trip                                     |
| PATCH  | `/trips/{id}`       | Update trip                                     |
| PATCH  | `/trips/{id}/close` | Close trip and make driver available            |
| DELETE | `/trips/{id}`       | Delete trip                                     |

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

Business rules:

- Trip can be created only with an `available` driver.
- Vehicle must belong to the selected driver.
- After trip creation, driver status becomes `on_trip`.
- If `driver_id` is changed during update, the new driver must be `available`.
- If trip status becomes `closed`, driver status becomes `available`.

## HTTP Status Codes

| Code | Meaning             |
| ---: | ------------------- |
|  200 | Success             |
|  201 | Created             |
|  204 | Deleted, no content |
|  404 | Not found           |
|  422 | Validation error    |
