<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MovieGenre extends Model
{
    public function movie()
    {
        return $this->belongsTo(Movie::class);
    }

    public function genre()
    {
        return $this->belongsTo(Genre::class);
    }
}
