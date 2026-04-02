<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GatewayController extends Controller
{
    public function getSavedSearches()
    {
        $userId = auth()->id(); 

        $response = Http::withHeaders([
            'Authorization' => env('MICROSERVICES_API_KEY'),
        ])->get(env('EXPRESS_SERVICE_URL') . '/saved-searches/' . $userId);

        return response()->json(
            $response->json(),
            $response->status()
        );
    }

    public function getSavedSearchById($id)
    {
        $response = Http::withHeaders([
            'Authorization' => env('MICROSERVICES_API_KEY'),
        ])->get(env('EXPRESS_SERVICE_URL') . '/saved-searches/details/' . $id);

        return response()->json(
            $response->json(),
            $response->status()
        );
    }

    public function saveSearch(Request $request)
    {
        $userId = auth()->id();

        $response = Http::withHeaders([
            'Authorization' => env('MICROSERVICES_API_KEY'),
        ])->post(env('EXPRESS_SERVICE_URL') . '/saved-searches', [
            'userId'      => $userId,
            'name'        => $request->name,
            'searchType'  => $request->searchType,
            'filters'     => $request->filters,
            'movieRefs'   => $request->movieRefs ?? [],
        ]);

        return response()->json(
            $response->json(),
            $response->status()
        );
    }

    public function deleteSavedSearch($id)
    {
        $response = Http::withHeaders([
            'Authorization' => env('MICROSERVICES_API_KEY'),
        ])->delete(env('EXPRESS_SERVICE_URL') . '/saved-searches/' . $id);

        return response()->json(
            $response->json(),
            $response->status()
        );
    }
}
