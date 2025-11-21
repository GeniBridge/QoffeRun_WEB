    /**
     * Create test Stripe Connect simulation
     */
    public function createTestConnect(Request $request, $branchId): JsonResponse
    {
        try {
            $branch = Branch::findOrFail($branchId);
            
            // Simulate Stripe Connect for testing
            $testAccountId = 'acct_test_' . uniqid();
            
            // Save test account ID to branch
            $branch->update(['stripe_account_id' => $testAccountId]);
            
            return response()->json([
                'success' => true,
                'message' => 'Account Stripe Connect simulato creato per testing',
                'account_id' => $testAccountId,
                'test_mode' => true,
                'next_steps' => [
                    'message' => 'Questo è un account di test. Per produzione serve il vero Client ID da Stripe Connect.',
                    'get_real_client_id' => 'https://dashboard.stripe.com/test/connect/settings'
                ]
            ]);
            
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Errore simulazione: ' . $e->getMessage()
            ], 500);
        }
    }