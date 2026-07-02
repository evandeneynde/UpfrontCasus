<?php

namespace App\Http\Responses;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;
use Symfony\Component\HttpFoundation\Response;

class LoginResponse implements LoginResponseContract
{
    public function toResponse($request): Response
    {
        $user = $request->user();

        if (! $user instanceof User) {
            return redirect()->intended(config('fortify.home'));
        }

        if ($user->is_admin) {
            return redirect()->intended(route('dashboard'));
        }

        if ($user->training_passed_at !== null) {
            return redirect()->intended(route('production.index'));
        }

        return redirect()->route('training.index');
    }
}
