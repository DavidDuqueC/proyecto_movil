<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\GatewayController;

Route::post('/register', [UserController::class, 'register']);
Route::post('/login', [UserController::class, 'login']);
Route::post('/logout', [UserController::class, 'logout'])->middleware("auth:sanctum");
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/saved-searches', [GatewayController::class, 'getSavedSearches']);
    Route::get('/saved-searches/{id}', [GatewayController::class, 'getSavedSearchById']);
    Route::post('/saved-searches', [GatewayController::class, 'saveSearch']);
    Route::delete('/saved-searches/{id}', [GatewayController::class, 'deleteSavedSearch']);
    Route::get('/peliculas', [GatewayController::class, 'listarPeliculas']);
    Route::get('/peliculas/{id}', [GatewayController::class, 'obtenerPelicula']);
    Route::post('/peliculas', [GatewayController::class, 'crearPelicula']);      // admin(hacer middleware despues)
    Route::put('/peliculas/{id}', [GatewayController::class, 'actualizarPelicula']); //  admin
    Route::delete('/peliculas/{id}', [GatewayController::class, 'eliminarPelicula']); //  admin
    Route::post('/interactions', [GatewayController::class, 'registrarInteraccion']);
    Route::get('/recommendations', [GatewayController::class, 'obtenerRecomendaciones']);
    // Favoritos
    Route::post('/favorites', [GatewayController::class, 'agregarFavorito']);
    Route::delete('/favorites/{movieId}', [GatewayController::class, 'eliminarFavorito']);
    Route::get('/favorites', [GatewayController::class, 'listarFavoritos']);
    
    // Listas personalizadas
    Route::post('/lists', [GatewayController::class, 'crearLista']);
    Route::get('/lists', [GatewayController::class, 'obtenerListas']);
    Route::post('/lists/{listId}/movies', [GatewayController::class, 'agregarPeliculaALista']);
    Route::delete('/lists/{listId}/movies/{movieId}', [GatewayController::class, 'eliminarPeliculaDeLista']);
    Route::get('/lists/{listId}/movies', [GatewayController::class, 'obtenerPeliculasDeLista']);
    Route::delete('/lists/{listId}', [GatewayController::class, 'eliminarLista']);
});