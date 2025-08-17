<?php

namespace App\Http\Middleware;

use Closure;

class EnsureUserIsBarista
{
    public function handle($request, $next)
    {
        if (! $request->user()?->isBarista()) {
            return response()->json([
                'error' => 'Unauthorized. Barista access required.'
            ], 403);
        }

        return $next($request);
    }
}