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
});