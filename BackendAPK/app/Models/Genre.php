<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Genre extends Model
{
    public function movies()
    {
        return $this->belongsToMany(Movie::class, 'movie_genre');
    }
    public function searches()
    {
        return $this->belongsToMany(UserSearch::class, 'search_genre');
    }
}
