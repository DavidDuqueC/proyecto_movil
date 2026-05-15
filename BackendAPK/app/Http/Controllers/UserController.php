<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;


class UserController extends Controller
{
    public function register(Request $request){
    $user = User::create([
        'name'=>$request->name,
        'email'=>$request->email,
        'password'=>Hash::make($request->password),
    ]);return response()->json([
        'ok'=> true,
        'message'=>'Usuario registrado'
    ], 201);
    }
    public function login(Request $request){
    $user= User::where('email', $request->email)->first();
    if (! $user || !Hash::check(
            $request->password,
            $user->password,
        ) ){
    return response()->json([
        'message'=>'Credenciales invalidas'
        ], 401);
        }
    $token = $user->createToken('auth_token')->plainTextToken;
    return response()->json([
        'token'=>$token,
        'type'=>'Bearer',
        'user_id' => $user->id 
    ]);

    }
    public function logout(Request $request){
        $request->user()->
        currentAccessToken()->
        delete();
        return response()->json(['ok' => true]);
    }
}
