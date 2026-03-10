<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SearchMovieRef extends Model
{
    public function userSearch()
    {
        return $this->belongsTo(UserSearch::class, 'search_id');
    }

    public function movie()
    {
        return $this->belongsTo(Movie::class);
    }
}
