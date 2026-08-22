<?php

namespace Tests\Feature;

use Tests\TestCase;

class TripController extends TestCase
{
    public function test_example(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
    }
}
