<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SearchGenre extends Model
{
    public function userSearch()
    {
        return $this->belongsTo(UserSearch::class, 'search_id');
    }

    public function genre()
    {
        return $this->belongsTo(Genre::class);
    }
}
