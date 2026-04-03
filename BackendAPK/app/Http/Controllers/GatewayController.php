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

    /*DJANGO   (peliculas)*/
    public function listarPeliculas()
    {
        $response = Http::withHeaders([
            'Authorization' => env('MICROSERVICES_API_KEY'),
        ])->get(env('DJANGO_SERVICE_URL') . '/api/peliculas/');

        return response()->json($response->json(), $response->status());
    }

    public function obtenerPelicula($id)
    {
        $response = Http::withHeaders([
            'Authorization' => env('MICROSERVICES_API_KEY'),
        ])->get(env('DJANGO_SERVICE_URL') . '/api/peliculas/' . $id . '/');

        return response()->json($response->json(), $response->status());
    }

    public function crearPelicula(Request $request)
    {
        $response = Http::withHeaders([
            'Authorization' => env('MICROSERVICES_API_KEY'),
        ])->post(env('DJANGO_SERVICE_URL') . '/api/peliculas/', $request->all());

        return response()->json($response->json(), $response->status());
    }

    public function actualizarPelicula(Request $request, $id)
    {
        $response = Http::withHeaders([
            'Authorization' => env('MICROSERVICES_API_KEY'),
        ])->put(env('DJANGO_SERVICE_URL') . '/api/peliculas/' . $id . '/', $request->all());

        return response()->json($response->json(), $response->status());
    }

    public function eliminarPelicula($id)
    {
        $response = Http::withHeaders([
            'Authorization' => env('MICROSERVICES_API_KEY'),
        ])->delete(env('DJANGO_SERVICE_URL') . '/api/peliculas/' . $id . '/');

        return response()->json($response->json(), $response->status());
    }
    /*FLASK   (recomendaciones)*/

    public function registrarInteraccion(Request $request)
    {
        $response = Http::withHeaders([
            'Authorization' => env('MICROSERVICES_API_KEY'),
        ])->post(env('FLASK_SERVICE_URL') . '/interactions', [
            'user_id' => auth()->id(),
            'movie_id' => $request->movie_id,
            'type' => $request->type, 
        ]);

        return response()->json($response->json(), $response->status());
    }

    public function obtenerRecomendaciones()
    {
        $userId = auth()->id();
        $response = Http::withHeaders([
            'Authorization' => env('MICROSERVICES_API_KEY'),
        ])->get(env('FLASK_SERVICE_URL') . '/recommendations/' . $userId);

        $recomendacionesIds = $response->json();

        if (!empty($recomendacionesIds) && $response->status() == 200) {
            $peliculas = [];
            foreach ($recomendacionesIds as $id) {
                $movieResponse = Http::withHeaders([
                    'Authorization' => env('MICROSERVICES_API_KEY'),
                ])->get(env('DJANGO_SERVICE_URL') . '/peliculas/' . $id . '/');

                if ($movieResponse->successful()) {
                    $peliculas[] = $movieResponse->json();
                }
            }
            return response()->json($peliculas);
        }
        return response()->json($response->json(), $response->status());
    }
}
