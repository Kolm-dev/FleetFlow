<?php

namespace App\Enums;

enum TripStatus: string
{
    case Planned = 'planned';
    case Pending = 'pending';
    case Closed = 'closed';
}
