<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Movie extends Model
{
    public function genres()
    {
        return $this->belongsToMany(Genre::class, 'movie_genre');
    }

    public function favoritedBy()
    {
        return $this->belongsToMany(User::class, 'user_favorites')
                    ->withTimestamps();
    }


    public function searchesAsReference()
    {
        return $this->belongsToMany(UserSearch::class, 'search_movie_ref');
    }
}
