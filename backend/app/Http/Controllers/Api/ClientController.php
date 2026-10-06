<?php

namespace App\Http\Controllers\Api;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Arr;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreClientRequest;
use App\Http\Resources\ClientResource;
use App\Models\Client;
use App\Enums\ClientType;
use App\Http\Requests\UpdateClientRequest;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ClientController extends Controller
{
    public function index(Request $request)
    {

        $q = Client::query()->with('phones');

        $validated = $request->validate([
            'name' => ['nullable', 'string'],
            'type' => ['nullable', Rule::enum(ClientType::class)],
        ]);

        if (!empty($validated['name'])) {
            $q->where('name', 'ILIKE', '%' . $validated['name'] . '%');
        }

        if (!empty($validated['type'])) {
            $q->where('type', $validated['type']);
        }

        return ClientResource::collection($q->get());
    }

    public function store(StoreClientRequest $request)
    {
        $validated = $request->validated();
        $clientData = Arr::except($validated, ['phones']);
        $phones = $validated['phones'];

        $client = DB::transaction(function () use ($clientData, $phones) {

            $client = Client::create($clientData);

            foreach ($phones as $phone) {
                $client->phones()->create([
                    'client_id' => $client->id,
                    'phone' => $phone['phone_number'],
                    'label' => $phone['label'] ?? null,
                ]);
            }

            return $client;
        });



        return new ClientResource($client->load('phones'));
    }


    public function update(UpdateClientRequest $request, Client $client)
    {
        $validated = $request->validated();
        $clientData = Arr::except($validated, ['phones']);
        $phones = $validated['phones'];

        $client = DB::transaction(function () use ($client, $clientData, $phones) {
            $client->update($clientData);

            $client->phones()->delete();
            foreach ($phones as $phone) {
                $client->phones()->create([
                    'client_id' => $client->id,
                    'phone' => $phone['phone_number'],
                    'label' => $phone['label'] ?? null,
                ]);
            }

            return $client;
        });

        return new ClientResource($client->load('phones'));
    }

    public function show(Client $client)
    {
        return new ClientResource($client->load('phones'));
    }

    public function destroy(Client $client) {
        if ($client->trips()->exists()) {
            return response()->json(['message' => 'Cannot delete client with associated trips.'], 409);
        }
        $client->delete();
        return response()->noContent();
    }
}
