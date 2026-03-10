<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Movie;

class MovieController extends Controller
{
    function index(){
        $movies = Movie::all();
        return response()->json($movies);
    }
    public function store(Request $request){
        $movie = new Movie();
        $movie->title = $request->title;
        $movie->director = $request->director;
        $movie->save();
    }
    public function destroy($id){
        $movie= Movie::find($id);
        $movie->delete();
        return response()->json("pelicula eliminada");
    }
}
