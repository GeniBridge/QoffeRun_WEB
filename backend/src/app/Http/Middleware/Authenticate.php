<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;

class Authenticate extends Middleware
{
    /**
     * Get the path the user should be redirected to when they are not authenticated.
     */
    protected function redirectTo(Request $request): ?string
    {
        // For API requests (and requests explicitly asking JSON) we should not
        // attempt to redirect to a web 'login' route because it may not exist
        // and would throw a RouteNotFoundException. Instead return null so
        // the framework responds with a 401 JSON response.
        if ($request->expectsJson()
            || $request->wantsJson()
            || $request->is('api/*')
            || $request->header('Authorization')) {
            return null;
        }

        return route('login');
    }
}
