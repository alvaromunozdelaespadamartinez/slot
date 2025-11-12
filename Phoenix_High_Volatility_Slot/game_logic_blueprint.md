# Phoenix High-Volatility Slot: Game Logic Blueprint

This document outlines the complete server-side logic and mathematical design for the Phoenix High-Volatility Slot game.

---

## Part 1: Game's Mathematical Foundation
(This section's content remains the same and is omitted for brevity.)

---

## Part 2: Phoenix Slot Engine V1 - Functional Pseudocode

### 2.1. RNG Manager Logic
(This section's content remains the same and is omitted for brevity.)

### 2.2. Game Evaluator: Core Data Structures & Security

This section defines the core data structures that govern the game's mathematical behavior.

**`SERVER_REEL_STRIPS`**
A constant, 2D array holding the complete, weighted symbol sequences for each of the 5 reels for the base game.

*   **Structure:** `[Reel_1_Array, Reel_2_Array, ..., Reel_5_Array]`
*   **Example:** `[["H1", "H2", "H1", "W2", "L1", ...], ["M1", "L2", "H3", ...], ...]`

**`ANTE_BET_REEL_STRIPS`**
A separate constant, 2D array used only when the Ante Bet is active, featuring a higher frequency of SCATTER_Bonus symbols.

> **SECURITY CONSTRAINT:** The `SERVER_REEL_STRIPS` and `ANTE_BET_REEL_STRIPS` data structures are the "keys to the kingdom." They **MUST NOT** be exposed to any client-side code (`game_controller.js`, `slot_renderer.js`, etc.). Their contents and the logic for stop selection must remain entirely within the secure server environment to prevent reverse-engineering of the game's RTP and volatility.

### 2.3. Main Spin Execution Loop

```pseudocode
// FUNCTION: EXECUTE_NEW_SPIN
// PURPOSE: Handles a player's spin request, ensuring a unique outcome.
FUNCTION EXECUTE_NEW_SPIN(player_id, bet_amount, ante_bet_active):
    // === STEP 1: VALIDATION & DEBIT ===
    IF NOT PlayerHasSufficientFunds(player_id, bet_amount):
        RETURN { error: "INSUFFICIENT_FUNDS" }
    DebitPlayerBalance(player_id, bet_amount)

    // === STEP 2: SELECT REEL STRIPS ===
    active_reel_strips = SERVER_REEL_STRIPS
    IF ante_bet_active:
        active_reel_strips = ANTE_BET_REEL_STRIPS

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

### 2.4. Core Logic Helper Functions

```pseudocode
// FUNCTION: CALCULATE_REEL_STOPS
// PURPOSE: Uses a seed to determine a random, weighted stop position for each of the 5 reels.
FUNCTION CALCULATE_REEL_STOPS(seed, reel_strips_data):
    // Use the single 'seed' as a basis to derive 5 separate, deterministic random numbers.
    // For each reel (i from 1 to 5):
    //   Derive a reel_specific_random_number from the seed.
    //   stop_index = reel_specific_random_number MOD (length of reel_strips_data[i])
    //   Store stop_index for the reel.
    // RETURN [stop_index_R1, stop_index_R2, stop_index_R3, stop_index_R4, stop_index_R5]

// FUNCTION: GenerateGridFromStops
// PURPOSE: Constructs the visible 5x3 grid based on the chosen stop indices.
// NOTE: This function's logic remains the same. It wraps around the reel strip array
//       to get the symbols above and below the chosen stop index.
```

(Other helper functions like `ExecuteTumbleLoop`, `EvaluateGrid`, `CountSymbolsOnGrid` remain unchanged and are omitted for brevity.)

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
