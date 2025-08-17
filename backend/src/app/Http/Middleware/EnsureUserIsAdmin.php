<?php

namespace App\Http\Middleware;

use Closure;

class EnsureUserIsAdmin
{
    public function handle($request, $next)
    {
        if (! $request->user()?->isAdmin()) {
            return response()->json([
                'error' => 'Unauthorized. Admin access required.'
            ], 403);
        }

        return $next($request);
    }
}