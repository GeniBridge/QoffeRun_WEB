<?php

namespace App\Http\Middleware;

use Closure;

class EnsureUserIsCustomer
{
    public function handle($request, $next)
    {
        if (! $request->user()?->isCustomer()) {
            return response()->json([
                'error' => 'Unauthorized. Customer access required.'
            ], 403);
        }

        return $next($request);
    }
}