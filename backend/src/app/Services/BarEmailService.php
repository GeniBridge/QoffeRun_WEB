<?php

namespace App\Services;

use App\Mail\BarLoginNotification;
use App\Mail\BarPasswordReset;
use App\Mail\BarPasswordChanged;
use Illuminate\Support\Facades\Log;

class BarEmailService
{
    /**
     * Invia notifica di login al pannello bar
     */
    public static function sendLoginNotification(array $barData, array $loginData, string $userEmail): bool
    {
        try {
            $loginEmail = new BarLoginNotification($barData, $loginData);
            $result = EmailService::sendFromNoReply($loginEmail, [$userEmail]);
            
            if ($result) {
                Log::info("Login notification sent to: {$userEmail} for bar: {$barData['nome']}");
            }
            
            return $result;
        } catch (\Exception $e) {
            Log::error("Failed to send login notification: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Invia email di reset password
     */
    public static function sendPasswordReset(array $barData, array $resetData, string $userEmail): bool
    {
        try {
            $resetEmail = new BarPasswordReset($barData, $resetData);
            $result = EmailService::sendFromNoReply($resetEmail, [$userEmail]);
            
            if ($result) {
                Log::info("Password reset email sent to: {$userEmail} for bar: {$barData['nome']}");
            }
            
            return $result;
        } catch (\Exception $e) {
            Log::error("Failed to send password reset email: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Invia notifica di password cambiata
     */
    public static function sendPasswordChanged(array $barData, array $changeData, string $userEmail): bool
    {
        try {
            $changedEmail = new BarPasswordChanged($barData, $changeData);
            $result = EmailService::sendFromNoReply($changedEmail, [$userEmail]);
            
            if ($result) {
                Log::info("Password changed notification sent to: {$userEmail} for bar: {$barData['nome']}");
            }
            
            return $result;
        } catch (\Exception $e) {
            Log::error("Failed to send password changed notification: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Genera URL di reset password
     */
    public static function generateResetUrl(string $token): string
    {
        return "https://bar.qofferun.com/reset-password?token={$token}";
    }

    /**
     * Prepara dati di login per email
     */
    public static function prepareLoginData(string $email, string $ipAddress, ?string $userAgent = null): array
    {
        return [
            'email' => $email,
            'time' => now()->format('d/m/Y H:i:s'),
            'ip' => $ipAddress,
            'user_agent' => $userAgent ?? 'Non disponibile',
        ];
    }

    /**
     * Prepara dati di reset password per email
     */
    public static function prepareResetData(string $email, string $name, string $token, int $expiresInMinutes = 60): array
    {
        return [
            'email' => $email,
            'name' => $name,
            'token' => $token,
            'url' => self::generateResetUrl($token),
            'expires_at' => now()->addMinutes($expiresInMinutes)->format('d/m/Y H:i'),
        ];
    }

    /**
     * Prepara dati di cambio password per email
     */
    public static function prepareChangeData(string $email, string $name, string $ipAddress): array
    {
        return [
            'email' => $email,
            'name' => $name,
            'time' => now()->format('d/m/Y H:i:s'),
            'ip' => $ipAddress,
        ];
    }
}