<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MovieController;
use App\Http\Controllers\UserController;

Route::get('movies' , [MovieController::class, 'index']);
Route::post('movies', [MovieController::class, 'store']);
Route::delete('movies/{id}', [MovieController::class, 'destroy']);
Route::post('/register', [UserController::class, 'register']);
Route::post('/login', [UserController::class, 'login']);
Route::post('/logout', [UserController::class, 'logout'])->middleware("auth:sanctum");