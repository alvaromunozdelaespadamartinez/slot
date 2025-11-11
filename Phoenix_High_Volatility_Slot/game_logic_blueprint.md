# Phoenix High-Volatility Slot: Game Logic Blueprint

This document outlines the complete server-side logic and mathematical design for the Phoenix High-Volatility Slot game.

---

## Part 1: Game's Mathematical Foundation
(This section's content remains the same and is omitted for brevity.)

---

## Part 2: Phoenix Slot Engine V1 - Functional Pseudocode
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

This section details the server-side logic for allowing players to purchase direct entry into the main bonus features, bypassing the standard base game spin.

### 6.1. Module Overview

The Buy Feature provides players with immediate access to the game's high-volatility bonus rounds for a fixed premium cost. This mechanism offers two distinct purchase options: one for the Free Spins module and one for the Money Respin Bonus.

### 6.2. Buy Feature Pseudocode

```pseudocode
// FUNCTION: EXECUTE_BUY_FREE_SPINS
// PURPOSE: Handles the purchase and direct trigger of the Free Spins module.
FUNCTION EXECUTE_BUY_FREE_SPINS(player_id, total_bet):
    // === STEP 1: VALIDATION & DEBIT ===
    feature_cost = 100 * total_bet
    IF NOT PlayerHasSufficientFunds(player_id, feature_cost):
        RETURN { error: "INSUFFICIENT_FUNDS_FOR_BUY_FEATURE" }
    DebitPlayerBalance(player_id, feature_cost)

    // === STEP 2: FORCE TRIGGER & EXECUTE ===
    // Bypass the entire base game spin cycle.
    // Directly call the Free Spins module logic.
    free_spins_result = EXECUTE_FREE_SPINS_MODULE(player_id, total_bet)

    // === STEP 3: RESPONSE GENERATION ===
    // The EXECUTE_FREE_SPINS_MODULE is assumed to handle crediting the player's winnings.
    new_balance = GetPlayerBalance(player_id)

    RETURN {
        feature_purchased: "Free_Spins",
        cost: feature_cost,
        total_win: free_spins_result.total_fs_win,
        new_balance: new_balance,
        spin_history: free_spins_result.spin_history
    }

// FUNCTION: EXECUTE_BUY_MONEY_RESPIN
// PURPOSE: Handles the purchase and direct trigger of the Money Respin bonus.
FUNCTION EXECUTE_BUY_MONEY_RESPIN(player_id, total_bet):
    // === STEP 1: VALIDATION & DEBIT ===
    feature_cost = 80 * total_bet
    IF NOT PlayerHasSufficientFunds(player_id, feature_cost):
        RETURN { error: "INSUFFICIENT_FUNDS_FOR_BUY_FEATURE" }
    DebitPlayerBalance(player_id, feature_cost)

    // === STEP 2: FORCE TRIGGER & EXECUTE ===
    // Bypass the base game spin. Generate a pre-determined grid that satisfies
    // the trigger condition (6+ CASH symbols) to start the feature.
    triggering_grid = GenerateGuaranteedBonusGrid("CASH", 6)

    // Directly call the Money Respin bonus module logic.
    money_respin_result = EXECUTE_MONEY_RESPIN_BONUS(player_id, total_bet, triggering_grid)

    // === STEP 3: RESPONSE GENERATION ===
    // The EXECUTE_MONEY_RESPIN_BONUS handles crediting the player's winnings.
    new_balance = GetPlayerBalance(player_id)

    RETURN {
        feature_purchased: "Money_Respin",
        cost: feature_cost,
        total_win: money_respin_result.total_bonus_win,
        new_balance: new_balance,
        final_board_state: money_respin_result.final_board_state,
        jackpots_won: money_respin_result.jackpots_won
    }
```
