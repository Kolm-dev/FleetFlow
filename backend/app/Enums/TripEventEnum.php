<?php

namespace App\Enums;

enum TripEventEnum: string
{
    case CREATED = 'trip.created';
    case UPDATED = 'trip.updated';
    case STARTED = 'trip.started';
    case CLOSED = 'trip.closed';
    case CANCELLED = 'trip.cancelled';
    case ATTACHMENT_UPLOADED = 'trip.attachment.added';
    case ATTACHMENT_DELETED = 'trip.attachment.deleted';
    case ATTACHMENT_RENAMED = 'trip.attachment.renamed';
    case DRIVER_CHANGED = 'trip.driver.changed';
}
