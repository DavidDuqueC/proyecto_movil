<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserSearch extends Model
{
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function genres()
    {
        return $this->belongsToMany(Genre::class, 'search_genre');
    }

    public function referenceMovies()
    {
        return $this->belongsToMany(Movie::class, 'search_movie_ref');
    }
}
