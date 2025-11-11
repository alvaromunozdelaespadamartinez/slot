# Phoenix High-Volatility Slot: Game Logic Blueprint

This document outlines the complete server-side logic and mathematical design for the Phoenix High-Volatility Slot game.

---

## Part 1: Game's Mathematical Foundation
(This section's content remains the same and is omitted for brevity.)

---

## Part 2: Phoenix Slot Engine V1 - Functional Pseudocode

### 2.1. RNG Manager Logic
(This section's content remains the same and is omitted for brevity.)

### 2.2. Main Spin Execution Loop

```pseudocode
// FUNCTION: EXECUTE_NEW_SPIN
// PURPOSE: Handles a player's spin request, ensuring a unique outcome.
FUNCTION EXECUTE_NEW_SPIN(player_id, bet_amount, ante_bet_active):
    // === STEP 1: VALIDATION & DEBIT ===
    // Note: The bet_amount passed from the client already includes the +30% Ante Bet cost.
    IF NOT PlayerHasSufficientFunds(player_id, bet_amount):
        RETURN { error: "INSUFFICIENT_FUNDS" }
    DebitPlayerBalance(player_id, bet_amount)

    // === STEP 2: SELECT REEL STRIPS ===
    active_reel_strips = reel_strips
    IF ante_bet_active:
        active_reel_strips = ante_bet_reel_strips // Use strips with +25% SCATTER_Bonus frequency

    // === STEP 3: RNG CALL ===
    spin_seed = GET_UNIQUE_SPIN_SEED(player_id)

    // === STEP 4: DETERMINE STOPS ===
    initial_reel_indices = CALCULATE_REEL_STOPS(spin_seed, active_reel_strips)
    initial_grid = GenerateGridFromStops(initial_reel_indices, active_reel_strips)

    // === STEP 5: INITIAL EVALUATION & TUMBLE LOOP ===
    tumble_result = ExecuteTumbleLoop(initial_grid, bet_amount / 20, bet_amount)
    total_win = tumble_result.total_win_for_spin
    final_grid = tumble_result.final_grid

    // === STEP 6: FEATURE CHECKS ===
    // Priority 1: Money Respin Bonus
    is_money_respin_triggered = FALSE
    initial_cash_count = CountSymbolsOnGrid(initial_grid, "CASH")
    IF initial_cash_count >= 6:
        is_money_respin_triggered = TRUE
        // Payline wins are paid out, then the bonus is initiated.

    // Priority 2: Free Spins (SCATTER_Bonus)
    is_free_spins_triggered = FALSE
    free_spins_awarded = 0
    IF NOT is_money_respin_triggered:
        initial_scatter_count = CountSymbolsOnGrid(initial_grid, "SCATTER_Bonus")
        IF initial_scatter_count >= 3:
            is_free_spins_triggered = TRUE
            free_spins_awarded = 10

    // === STEP 7: RESPONSE GENERATION ===
    CreditPlayerBalance(player_id, total_win)
    new_balance = GetPlayerBalance(player_id)

    response = {
        new_balance: new_balance,
        total_win_amount: total_win,
        initial_reel_indices: initial_reel_indices,
        final_grid: final_grid,
        is_free_spins_triggered: is_free_spins_triggered,
        free_spins_awarded: free_spins_awarded,
        is_money_respin_triggered: is_money_respin_triggered
    }
    RETURN response
```

### 2.3. Core Logic Helper Functions
(This section's content remains the same and is omitted for brevity.)

---

## Part 3: Free Spins Module
(This section's content remains the same and is omitted for brevity.)

---

## Part 4: Client Communication Update
(This section's content remains the same and is omitted for brevity.)

---

## Part 5: Money Respin Bonus (Hold & Win) Module
(This section's content remains the same and is omitted for brevity.)

---

## Part 6: Buy Feature (Direct Feature Access) Module
(This section's content remains the same and is omitted for brevity.)
