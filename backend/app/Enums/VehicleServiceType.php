<?php

namespace App\Enums;

enum VehicleServiceType: string
{
    case ScheduledMaintenance = 'scheduled_maintenance';
    case OilChange = 'oil_change';
    case Inspection = 'inspection';
    case EngineRepair = 'engine_repair';
    case TransmissionRepair = 'transmission_repair';
    case BrakeRepair = 'brake_repair';
    case ElectricalRepair = 'electrical_repair';
    case SuspensionRepair = 'suspension_repair';
    case TireService = 'tire_service';
    case BodyRepair = 'body_repair';
    case Other = 'other';

}
