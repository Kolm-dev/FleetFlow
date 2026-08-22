<?php

namespace App\Http\Controllers\Api;

use App\Enums\DriverStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDriverRequest;
use App\Http\Requests\UpdateDriverRequest;
use App\Models\Driver;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class DriverController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'status' => ['sometimes', Rule::enum(DriverStatus::class)],
        ]);

        $query = Driver::with('vehicles');

        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        $drivers = $query->get();

        return response()->json([
            'total' => $drivers->count(),
            'drivers' => $drivers,
        ]);
    }

    public function show(int $id)
    {
        return response()->json(Driver::with('vehicles')->findOrFail($id));
    }

    public function destroy(int $id)
    {
        Driver::findOrFail($id)->delete();

        return response()->json(null, 204);
    }

    public function update(UpdateDriverRequest $request, int $id)
    {
        $driver = Driver::findOrFail($id);

        $driver->update($request->validated());

        return response()->json($driver, 200);
    }

    public function store(StoreDriverRequest $request)
    {
        $driver = Driver::create($request->validated());

        return response()->json($driver, 201);
    }
}
