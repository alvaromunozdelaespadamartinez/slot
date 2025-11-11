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
FUNCTION EXECUTE_NEW_SPIN(player_id, bet_amount):
    // === STEP 1: VALIDATION & DEBIT ===
    IF NOT PlayerHasSufficientFunds(player_id, bet_amount):
        RETURN { error: "INSUFFICIENT_FUNDS" }
    DebitPlayerBalance(player_id, bet_amount)

    // === STEP 2: RNG CALL ===
    spin_seed = GET_UNIQUE_SPIN_SEED(player_id)

    // === STEP 3: DETERMINE STOPS ===
    initial_reel_indices = CALCULATE_REEL_STOPS(spin_seed, reel_strips)
    initial_grid = GenerateGridFromStops(initial_reel_indices, reel_strips)

    // === STEP 4 & 5: INITIAL EVALUATION & TUMBLE LOOP ===
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
        // The bonus module handles its own payout logic.

    // Priority 2: Free Spins
    is_free_spins_triggered = FALSE
    free_spins_awarded = 0
    IF NOT is_money_respin_triggered: // Free spins cannot trigger if Money Respin is active
        initial_scatter_count = CountSymbolsOnGrid(initial_grid, "SCATTER")
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

This section details the logic for the "Hold & Win" style bonus feature, triggered by CASH symbols.

### 5.1. Module Overview

The Money Respin Bonus is a secondary feature designed to provide a high-volatility path to instant wins. It is a standalone game mode that takes place on a special set of reels containing only CASH, Jackpot, or blank symbols.

**Symbol Key:**
*   `CASH`: A symbol with a random or fixed credit value.
*   `MINI`: Mini Jackpot symbol.
*   `MAJOR`: Major Jackpot symbol.
*   `(blank)`: An empty space.

### 5.2. Money Respin Pseudocode

```pseudocode
// FUNCTION: EXECUTE_MONEY_RESPIN_BONUS
// PURPOSE: Manages the entire Hold & Win feature from start to finish.
FUNCTION EXECUTE_MONEY_RESPIN_BONUS(player_id, bet_amount, triggering_grid):
    // === STEP 1: INITIALIZATION ===
    RespinState = {
        respins_remaining: 3,
        total_bonus_win: 0,
        held_symbols: GetCashSymbolsFromGrid(triggering_grid), // Extract CASH symbols and their positions
        board: CreateEmptyGrid(),
        jackpots_won: []
    }
    PopulateBoardWithHeldSymbols(RespinState.board, RespinState.held_symbols)

    // === STEP 2: RESPIN LOOP ===
    LOOP while RespinState.respins_remaining > 0:
        RespinState.respins_remaining -= 1

        // Generate a new set of symbols for the empty positions
        new_symbols = SpinRespinReels(RespinState.board) // Returns symbols for empty slots

        IF NewCashOrJackpotLanded(new_symbols):
            // Add new symbols to the board and reset the respin counter
            AddNewSymbolsToBoard(RespinState.board, new_symbols)
            RespinState.respins_remaining = 3

        IF IsBoardFull(RespinState.board):
            BREAK LOOP

    // === STEP 3: FINAL PAYOUT CALCULATION ===
    // Sum the values of all CASH symbols on the final board
    cash_total = SumCashSymbolValues(RespinState.board)
    RespinState.total_bonus_win += cash_total

    // Check for fixed Jackpots landed during the feature
    FOR each symbol in RespinState.board:
        IF symbol.type == "MINI":
            RespinState.total_bonus_win += 25 * bet_amount
            RespinState.jackpots_won.push("Mini")
        IF symbol.type == "MAJOR":
            RespinState.total_bonus_win += 100 * bet_amount
            RespinState.jackpots_won.push("Major")

    // Check for the Grand Jackpot (full board)
    IF IsBoardFull(RespinState.board):
        RespinState.total_bonus_win += 1000 * bet_amount
        RespinState.jackpots_won.push("Grand")

    // === STEP 4: FINALIZE AND RETURN ===
    CreditPlayerBalance(player_id, RespinState.total_bonus_win)

    RETURN {
        total_bonus_win: RespinState.total_bonus_win,
        final_board_state: RespinState.board,
        jackpots_won: RespinState.jackpots_won
    }
```
