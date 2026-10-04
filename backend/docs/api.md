# FleetFlow API

Base API URL: `/api`

All protected routes use Laravel Sanctum session cookies. Validation errors return `422`.

Before login, request the CSRF cookie:

```http
GET /sanctum/csrf-cookie
```

## Response Shapes

Driver and vehicle lists return collection data with pagination metadata:

```json
{
    "total": 1,
    "drivers": [],
    "current_page": 1,
    "last_page": 1,
    "per_page": 15
}
```

The vehicle response uses `vehicles` instead of `drivers`.

Trip and vehicle service lists use the standard Laravel pagination shape. The
records are in `data`; pagination fields include `current_page`, `last_page`,
`per_page`, and `total`.

Most show routes return one named object. Driver and vehicle details also
include their related statistics.

```json
{
    "driver": {}
}
```

Most create, update, and action routes return a message with the changed
object:

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

| Method | Endpoint        | Response                               |
| ------ | --------------- | -------------------------------------- |
| GET    | `/drivers`      | `{ total, drivers }`                   |
| GET    | `/drivers/{id}` | `{ driver, statistics, closed_trips }` |
| POST   | `/drivers`      | `{ message, driver }`                  |
| PATCH  | `/drivers/{id}` | `{ message, driver }`                  |
| DELETE | `/drivers/{id}` | `204 No Content`                       |

List query parameters:

- `status`: `available`, `on_trip`, or `unavailable`.
- `search`: case-insensitive partial match by name or phone number; a numeric
  value also matches the driver ID.
- `page`: page number, starting from `1`.

Drivers are ordered by ID and paginated by 15 records.

Example:

```http
GET /api/drivers?status=available&search=Alex&page=2
```

Create fields: `name`, `phone_number`, `status`. The `status` field is optional.
Update fields: `name`, `phone_number`, `status`, `photo`; all are optional and
`photo` may be `null`.

Driver object includes assigned `vehicles`.

Driver details accept `from`, `to`, and `page`. Dates use `YYYY-MM-DD`, `to`
must not be earlier than `from`, and both statistics and closed trips are
filtered by trip `completed_at`. Closed trips are paginated by 5 records.

## Vehicles

| Method | Endpoint         | Response                          |
| ------ | ---------------- | --------------------------------- |
| GET    | `/vehicles`      | `{ total, vehicles }`             |
| GET    | `/vehicles/{id}` | `{ vehicle, service_statistics }` |
| POST   | `/vehicles`      | `{ message, vehicle }`            |
| PATCH  | `/vehicles/{id}` | `{ message, vehicle }`            |
| DELETE | `/vehicles/{id}` | `204 No Content`                  |

Query parameters:

- `search`: case-insensitive partial match by license plate, brand, or model; a
  numeric value also matches the vehicle ID.
- `page`: page number, starting from `1`.

Vehicles are ordered by ID and paginated by 15 records.

Example:

```http
GET /api/vehicles?search=Toyota&page=2
```

Create fields: `brand`, `model`, `license_plate`, `year`, `driver_id`.
Update fields: same fields, all optional.

Vehicle object includes assigned `driver`.
`license_plate` is converted to uppercase automatically.
Vehicle details include service count, total and average cost, and the latest
service date, cost, and mileage. Latest-service values may be `null`.

## Trips

| Method | Endpoint                 | Response                |
| ------ | ------------------------ | ----------------------- |
| GET    | `/trips`                 | paginated trips         |
| GET    | `/trips/{id}`            | `{ trip }`              |
| POST   | `/trips`                 | `{ message, trip }`     |
| PATCH  | `/trips/{id}`            | `{ message, trip }`     |
| PATCH  | `/trips/{id}/start`      | `{ message, trip }`     |
| PATCH  | `/trips/{id}/close`      | `{ message, trip }`     |
| PATCH  | `/trips/{id}/cancel`     | `{ message, trip }`     |
| DELETE | `/trips/{id}`            | `204 No Content`        |
| POST   | `/trips/calculate-price` | `{ recommended_price }` |

Frontend route `/trips/:tripId` displays a separate trip details page. It is
a client-side route, not an API endpoint, and loads its data through
`GET /api/trips/{id}`. Cancelling a trip from this page uses
`PATCH /api/trips/{id}/cancel`.

Query parameters: `status[]`, `page`, `sort`, `search`.

Sort values: `price`, `-price`, `created_at`, `-created_at`.

Search:

- `search` matches trip `title` case-insensitively.
- If `search` is a number, it also matches trip `id`.
- Search can be combined with `status`, `sort`, and `page`.

Example:

```http
GET /api/trips?search=Kyiv&status[]=planned&sort=-price&page=2
```

Frontend keeps these filters in the URL, so the Trips page can be refreshed or shared without losing the current search, status, sort, or page.

Create fields: `title`, `driver_id`, `vehicle_id`, `distance`, `price`.
`status` is assigned by the backend and is prohibited in create requests.

Update fields: `title`, `driver_id`, `vehicle_id`, `distance`, `price`; all are optional.
`status` is prohibited in update requests. Use `/start`, `/close`, and `/cancel`
to change trip lifecycle state.

Trip object includes `driver` and `vehicle`.
Closing a trip sets its `completed_at` timestamp.

Trips are paginated by 5 records.

Business rules:

- A trip can be created only with an `available` driver.
- The vehicle must belong to the selected driver.
- New trips are created as `planned`; the selected driver becomes `on_trip`.
- Driver or vehicle assignment can be changed only while the trip is `planned`.
- The new vehicle must belong to the selected driver.
- The new driver must be `available`; the previous driver becomes `available`.
- Starting a trip requires a `planned` trip and its assigned driver to be `on_trip`; otherwise the response message explains the reason.
- Closing or cancelling a trip makes the driver `available`.
- A `closed` or `cancelled` trip cannot be cancelled again.

## Trip History

| Method | Endpoint              | Response          |
| ------ | --------------------- | ----------------- |
| GET    | `/trips/{id}/events`  | `{ data: [...] }` |

Events are returned oldest first: `created_at ASC`, then `id ASC`.
`user` may be `null`.

Event types include:

- `trip.created`
- `trip.updated`
- `trip.started`
- `trip.closed`
- `trip.cancelled`
- `trip.driver.changed`
- `trip.attachment.added`
- `trip.attachment.renamed`
- `trip.attachment.deleted`

`trip.created` stores the initial `title`, `distance`, `price`, `driver_id`,
`vehicle_id`, and `status`.
`trip.updated` stores changed fields under `data.fields`.
Attachment events store `attachment_id` plus display-related names, for example
`display_name`, `old_display_name`, and `new_display_name`.

## Vehicle Services

Vehicle services are nested under a vehicle. A service requested through a
vehicle URL must belong to that vehicle.

| Method | Endpoint                                 | Response               |
| ------ | ---------------------------------------- | ---------------------- |
| GET    | `/vehicles/{vehicle}/services`           | paginated services     |
| GET    | `/vehicles/{vehicle}/services/{service}` | service object         |
| POST   | `/vehicles/{vehicle}/services`           | service object         |
| PATCH  | `/vehicles/{vehicle}/services/{service}` | `{ message, service }` |
| DELETE | `/vehicles/{vehicle}/services/{service}` | `204 No Content`       |

Query parameters:

- `types[]`: filter by one or more service types.
- `sort[]`: apply one or more sorts in the provided order.
- `page`: page number, starting from `1`.

Sort values: `service_date`, `-service_date`, `mileage`, `-mileage`, `cost`,
`-cost`. A leading `-` means descending order. Without `sort[]`, services are
ordered by newest service date first. Services are paginated by 10 records.

Example:

```http
GET /api/vehicles/12/services?types[]=oil_change&types[]=inspection&sort[]=-service_date&sort[]=cost&page=1
```

Service types:

- `scheduled_maintenance`
- `oil_change`
- `inspection`
- `engine_repair`
- `transmission_repair`
- `brake_repair`
- `electrical_repair`
- `suspension_repair`
- `tire_service`
- `body_repair`
- `other`

Create fields: `service_date`, `mileage`, `cost`, `type`, `notes`.
`service_date`, `mileage`, `cost`, and `type` are required. `notes` is nullable.

Update fields: same fields, all optional.

## Pricing Settings

| Method | Endpoint            | Response                       |
| ------ | ------------------- | ------------------------------ |
| GET    | `/pricing-settings` | `{ pricing_setting }`          |
| PATCH  | `/pricing-settings` | `{ message, pricing_setting }` |

Fields: `price_per_km`, `base_price`, `minimum_price`.

All pricing fields are optional on update and must be non-negative numbers.

## Trip Price Calculation

| Method | Endpoint                 | Response                |
| ------ | ------------------------ | ----------------------- |
| POST   | `/trips/calculate-price` | `{ recommended_price }` |

Request field: `distance` is required and must be a number greater than `0`.
The recommended price is calculated from the current pricing settings:
`max(minimum_price, base_price + distance * price_per_km)`. The result is
rounded to two decimal places.

Example request:

```json
{
    "distance": 25.5
}
```

## Upload Documents/Images for Trip

```text
GET    /api/trips/{trip}/attachments
POST   /api/trips/{trip}/attachments
PATCH  /api/trips/{trip}/attachments/{attachment}
GET    /api/trips/{trip}/attachments/{attachment}/content
GET    /api/trips/{trip}/attachments/{attachment}/download
DELETE /api/trips/{trip}/attachments/{attachment}
```

- `GET .../attachments` — retrieve attachment metadata, without file contents.
- `POST .../attachments` — upload `multipart/form-data` with a `files[]` field.
- `PATCH .../attachments/{attachment}` — update attachment `display_name`.
- `GET .../content` — open a file safe for inline preview: image, PDF, or `text/plain`.
- `GET .../download` — download the file with its original name.
- `DELETE` — delete the database record and the physical file.

Uploading, renaming, and deleting attachments also create trip history events.
Saving the same `display_name` again does not create a rename event.

Response object of attachments metadata (collection):

```json
{
    "data": [
        {
            "id": 12,
            "trip_id": 36,
            "original_name": "document.pdf",
            "mime_type": "application/pdf",
            "size": 248120,
            "kind": "document",
            "can_preview": true,
            "created_at": "2024-06-05T12:00:00.000000Z",
            "display_name": "document.pdf"
        }
    ]
}
```

For uploading files, response includes a message and the list of created attachments:

```json
{
    "message": "Attachments uploaded successfully.",
    "data": [{ "id": 12, "original_name": "document.pdf", "...": "..." }]
}
```

## Stats

| Method | Endpoint | Response                       |
| ------ | -------- | ------------------------------ |
| GET    | `/stats` | `{ drivers, vehicles, trips }` |

Stats counters:

- drivers: `total`, `available`, `on_trip`, `unavailable`
- vehicles: `total`
- trips: `total`, `planned`, `pending`, `closed`, `cancelled`
