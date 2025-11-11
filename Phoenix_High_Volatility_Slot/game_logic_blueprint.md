# Phoenix High-Volatility Slot: Game Logic Blueprint

This document outlines the complete server-side logic and mathematical design for the Phoenix High-Volatility Slot game.

---

## Part 1: Game's Mathematical Foundation

### 1.1. Payline Definitions

The game uses a 5x3 grid with 20 fixed paylines. Paylines are evaluated from left to right, starting from the first reel. The rows are indexed 0 (top), 1 (middle), and 2 (bottom).

```json
{
  "paylines": [
    [1, 1, 1, 1, 1], // Line 1 (Middle)
    [0, 0, 0, 0, 0], // Line 2 (Top)
    [2, 2, 2, 2, 2], // Line 3 (Bottom)
    [0, 1, 2, 1, 0], // Line 4 (V-shape)
    [2, 1, 0, 1, 2], // Line 5 (Inverted V)
    [0, 0, 1, 2, 2], // Line 6
    [2, 2, 1, 0, 0], // Line 7
    [1, 0, 0, 0, 1], // Line 8
    [1, 2, 2, 2, 1], // Line 9
    [0, 1, 0, 1, 0], // Line 10
    [2, 1, 2, 1, 2], // Line 11
    [1, 0, 1, 2, 1], // Line 12
    [1, 2, 1, 0, 1], // Line 13
    [0, 1, 1, 1, 0], // Line 14
    [2, 1, 1, 1, 2], // Line 15
    [1, 1, 0, 1, 1], // Line 16
    [1, 1, 2, 1, 1], // Line 17
    [0, 0, 2, 0, 0], // Line 18
    [2, 2, 0, 2, 2], // Line 19
    [0, 2, 2, 2, 0]  // Line 20
  ]
}
```

### 1.2. Payout Table

Payouts are defined as multipliers of the `Line Bet` (Total Bet / 20). This table is designed for high volatility, with a significant jump for 5-of-a-kind premium symbols.

| Symbol      | 3 of a Kind | 4 of a Kind | 5 of a Kind |
|-------------|-------------|-------------|-------------|
| **Symbol_A**  | 5.0x        | 20.0x       | 100.0x      |
| **Symbol_B**  | 2.5x        | 10.0x       | 50.0x       |
| **Symbol_C**  | 1.5x        | 5.0x        | 25.0x       |
| **Symbol_D**  | 1.0x        | 2.5x        | 20.0x       |
| **A**         | 0.4x        | 1.0x        | 4.0x        |
| **K**         | 0.3x        | 0.8x        | 3.0x        |
| **Q**         | 0.2x        | 0.6x        | 2.0x        |
| **J**         | 0.1x        | 0.4x        | 1.0x        |
| **10**        | 0.1x        | 0.2x        | 0.5x        |

**Special Payouts (Based on Total Bet):**
*   **4 SCATTERs:** 5x Total Bet
*   **5 SCATTERs:** 20x Total Bet

### 1.3. Weighted Reel Strips (R1-R5)

The reel strips are the core of the game's math model. Each reel is an array of symbols, from which a random stop is chosen. The distribution is engineered to create a high-volatility experience, with `SCATTER` symbols being rarer on reels 1 and 5. Each reel strip has a length of 128 stops.

**Symbol Key:**
*   `SA`: Symbol_A
*   `SB`: Symbol_B
*   `SC`: Symbol_C
*   `SD`: Symbol_D
*   `LA`: A (Low Pay)
*   `LK`: K (Low Pay)
*   `LQ`: Q (Low Pay)
*   `LJ`: J (Low Pay)
*   `L10`: 10 (Low Pay)
*   `W2`: WILD_x2
*   `ST`: SCATTER
*   `CH`: CASH

```json
{
  "reel_strips": {
    "reel_1": [
      "SA", "LK", "LJ", "SD", "L10", "LQ", "SC", "LJ", "W2", "LA", "L10", "CH", "LK", "LJ", "SA", "LQ", "L10", "ST", "SD", "LJ", "LA", "LK", "LQ", "L10", "LJ", "SC", "LK", "L10", "SD", "LA", "LQ", "LJ", "LK", "L10", "CH", "SA", "LQ", "SD", "LJ", "LA", "L10", "LK", "LJ", "LQ", "L10", "SD", "LK", "LA", "LJ", "L10", "LQ", "SB", "LK", "LJ", "SD", "L10", "LA", "LQ", "LK", "SB", "L10", "LJ", "SC", "SA", "LQ", "SD", "LK", "L10", "LA", "LJ", "LQ", "L10", "SB", "LK", "SD", "LJ", "LA", "L10", "LQ", "LK", "LJ", "L10", "SD", "SA", "LK", "LQ", "LA", "LJ", "L10", "SB", "LK", "SD", "LQ", "L10", "LJ", "LA", "LK", "L10", "LQ", "SD", "LJ", "SB", "LK", "LA", "L10", "LQ", "LJ", "SD", "LK", "L10", "LA", "LQ", "LJ", "SB", "L10", "LK", "SD", "LA"
    ],
    "reel_2": [
      "SB", "LQ", "LJ", "SA", "L10", "LK", "ST", "SD", "W2", "LA", "L10", "CH", "LJ", "LQ", "SB", "LK", "L10", "ST", "SA", "LJ", "SD", "LA", "LQ", "L10", "LK", "ST", "LJ", "L10", "SA", "SD", "LQ", "LK", "LJ", "L10", "CH", "SB", "LQ", "SA", "SD", "LJ", "LA", "L10", "LK", "LQ", "L10", "SA", "LJ", "SD", "LA", "L10", "LK", "SC", "LQ", "LJ", "SA", "L10", "SD", "LA", "LK", "SC", "L10", "LQ", "ST", "SB", "LJ", "SA", "L10", "SD", "LK", "LA", "LQ", "L10", "SC", "LJ", "SA", "L10", "SD", "LK", "LQ", "LA", "LJ", "L10", "SA", "SB", "LK", "SD", "LQ", "LA", "L10", "LJ", "LK", "SA", "L10", "SD", "LQ", "LJ", "LA", "LK", "L10", "SA", "SD", "LQ", "SC", "LJ", "LK", "LA", "L10", "SA", "LQ", "SD", "LJ", "LK", "L10", "SC", "LA"
    ],
    "reel_3": [
      "SC", "L10", "LJ", "SB", "LQ", "LK", "ST", "SD", "W2", "LA", "CH", "L10", "LJ", "LQ", "SC", "LK", "L10", "ST", "SB", "LJ", "SD", "LA", "LQ", "L10", "LK", "ST", "LJ", "L10", "SB", "SD", "LQ", "LK", "LJ", "L10", "CH", "SC", "LQ", "SB", "SD", "LJ", "LA", "L10", "LK", "LQ", "L10", "SB", "LJ", "SD", "LA", "L10", "LK", "ST", "LQ", "LJ", "SB", "L10", "SD", "LA", "LK", "SA", "L10", "LQ", "ST", "SC", "LJ", "SB", "L10", "SD", "LK", "LA", "LQ", "L10", "SA", "LJ", "SB", "L10", "SD", "LK", "LQ", "LA", "LJ", "L10", "SA", "SC", "LK", "SD", "LQ", "LA", "L10", "LJ", "LK", "SB", "L10", "SD", "LQ", "LJ", "LA", "LK", "L10", "SA", "SD", "LQ", "SC", "LJ", "LK", "LA", "L10", "SB", "LQ", "SD", "LJ", "LK", "L10", "SA", "LA"
    ],
    "reel_4": [
      "SD", "LK", "LQ", "SC", "L10", "LJ", "ST", "SB", "W2", "LA", "L10", "CH", "LK", "LQ", "SD", "LJ", "L10", "ST", "SC", "LK", "SB", "LA", "LQ", "L10", "LJ", "ST", "LK", "L10", "SC", "SB", "LQ", "LJ", "LK", "L10", "CH", "SD", "LQ", "SC", "SB", "LJ", "LA", "L10", "LK", "LQ", "L10", "SC", "LJ", "SB", "LA", "L10", "LK", "SA", "LQ", "LJ", "SC", "L10", "SB", "LA", "LK", "SA", "L10", "LQ", "ST", "SD", "LJ", "SC", "L10", "SB", "LK", "LA", "LQ", "L10", "SA", "LJ", "SC", "L10", "SB", "LK", "LQ", "LA", "LJ", "L10", "SA", "SD", "LK", "SB", "LQ", "LA", "L10", "LJ", "LK", "SC", "L10", "SB", "LQ", "LJ", "LA", "LK", "L10", "SA", "SB", "LQ", "SD", "LJ", "LK", "LA", "L10", "SC", "LQ", "SB", "LJ", "LK", "L10", "SA", "LA"
    ],
    "reel_5": [
      "SA", "LJ", "L10", "SD", "LK", "LQ", "SC", "LJ", "W2", "LA", "L10", "CH", "LK", "LJ", "SA", "LQ", "L10", "ST", "SD", "LJ", "LA", "LK", "LQ", "L10", "LJ", "SC", "LK", "L10", "SD", "LA", "LQ", "LJ", "LK", "L10", "CH", "SA", "LQ", "SD", "LJ", "LA", "L10", "LK", "LJ", "LQ", "L10", "SD", "LK", "LA", "LJ", "L10", "LQ", "SB", "LK", "LJ", "SD", "L10", "LA", "LQ", "LK", "SB", "L10", "LJ", "SC", "SA", "LQ", "SD", "LK", "L10", "LA", "LJ", "LQ", "L10", "SB", "LK", "SD", "LJ", "LA", "L10", "LQ", "LK", "LJ", "L10", "SD", "SA", "LK", "LQ", "LA", "LJ", "L10", "SB", "LK", "SD", "LQ", "L10", "LJ", "LA", "LK", "L10", "LQ", "SD", "LJ", "SB", "LK", "LA", "L10", "LQ", "LJ", "SD", "LK", "L10", "LA", "LQ", "LJ", "SB", "L10", "LK", "SD", "LA"
    ]
  }
}

---

## Part 3: Free Spins Module

This section details the logic and data for the Free Spins game mode, which is triggered from the base game.

### 3.1. "Richer" Free Spins Reel Strips (FS_R1-FS_R5)

To increase excitement and win potential, the Free Spins round uses a "richer" set of reel strips with a higher frequency of `WILD_x2` and High-Pay symbols. The `SCATTER` distribution remains the same to maintain the volatility of the re-trigger.

```json
{
  "fs_reel_strips": {
    "reel_1": [
      "SA", "LK", "W2", "SD", "L10", "SA", "SC", "LJ", "W2", "LA", "L10", "CH", "LK", "SB", "SA", "LQ", "L10", "ST", "SD", "LJ", "LA", "LK", "SC", "L10", "LJ", "SC", "LK", "L10", "SD", "LA", "LQ", "SD", "W2", "L10", "CH", "SA", "LQ", "SD", "LJ", "LA", "L10", "LK", "LJ", "LQ", "SA", "SD", "LK", "LA", "LJ", "L10", "LQ", "SB", "SB", "LJ", "SD", "L10", "LA", "LQ", "LK", "SB", "SC", "LJ", "SC", "SA", "LQ", "SD", "LK", "L10", "LA", "SD", "LQ", "L10", "SB", "LK", "SD", "LJ", "LA", "L10", "LQ", "LK", "SA", "L10", "SD", "SA", "LK", "LQ", "LA", "LJ", "L10", "SB", "SB", "SD", "LQ", "L10", "LJ", "LA", "LK", "L10", "LQ", "SD", "LJ", "SB", "LK", "LA", "L10", "LQ", "LJ", "SD", "LK", "L10", "LA", "LQ", "LJ", "SB", "L10", "LK", "SD", "LA"
    ],
    "reel_2": [
      "SB", "LQ", "LJ", "SA", "W2", "LK", "ST", "SD", "W2", "LA", "L10", "CH", "LJ", "LQ", "SB", "LK", "L10", "ST", "SA", "LJ", "SD", "LA", "LQ", "SA", "LK", "ST", "LJ", "L10", "SA", "SD", "LQ", "LK", "SB", "L10", "CH", "SB", "LQ", "SA", "SD", "W2", "LA", "L10", "LK", "LQ", "L10", "SA", "LJ", "SD", "LA", "L10", "LK", "SC", "LQ", "SC", "SA", "L10", "SD", "LA", "LK", "SC", "L10", "LQ", "ST", "SB", "LJ", "SA", "L10", "SD", "LK", "LA", "LQ", "L10", "SC", "SA", "SA", "L10", "SD", "LK", "LQ", "LA", "LJ", "L10", "SA", "SB", "LK", "SD", "LQ", "LA", "L10", "SC", "LK", "SA", "L10", "SD", "LQ", "LJ", "LA", "SB", "L10", "SA", "SD", "LQ", "SC", "LJ", "LK", "LA", "L10", "SA", "LQ", "SD", "LJ", "LK", "L10", "SC", "LA"
    ],
    "reel_3": [
      "SC", "L10", "SA", "SB", "LQ", "LK", "ST", "SD", "W2", "LA", "CH", "L10", "LJ", "LQ", "SC", "LK", "L10", "ST", "SB", "W2", "SD", "LA", "LQ", "L10", "LK", "ST", "LJ", "L10", "SB", "SD", "LQ", "SA", "LJ", "L10", "CH", "SC", "LQ", "SB", "SD", "LJ", "LA", "W2", "LK", "LQ", "L10", "SB", "LJ", "SD", "LA", "L10", "LK", "ST", "LQ", "LJ", "SB", "L10", "SD", "LA", "LK", "SA", "L10", "LQ", "ST", "SC", "LJ", "SB", "L10", "SD", "LK", "LA", "LQ", "L10", "SA", "SB", "SB", "L10", "SD", "LK", "LQ", "LA", "LJ", "L10", "SA", "SC", "LK", "SD", "LQ", "LA", "L10", "SC", "LK", "SB", "L10", "SD", "LQ", "LJ", "LA", "LK", "L10", "SA", "SD", "LQ", "SC", "LJ", "LK", "LA", "L10", "SB", "LQ", "SD", "LJ", "LK", "L10", "SA", "LA"
    ],
    "reel_4": [
      "SD", "LK", "LQ", "SC", "W2", "LJ", "ST", "SB", "W2", "LA", "L10", "CH", "LK", "LQ", "SD", "LJ", "L10", "ST", "SC", "SA", "SB", "LA", "LQ", "L10", "LJ", "ST", "LK", "L10", "SC", "SB", "LQ", "SA", "LK", "L10", "CH", "SD", "LQ", "SC", "SB", "W2", "LA", "L10", "LK", "LQ", "L10", "SC", "LJ", "SB", "LA", "L10", "LK", "SA", "LQ", "LJ", "SC", "L10", "SB", "LA", "LK", "SA", "L10", "LQ", "ST", "SD", "LJ", "SC", "L10", "SB", "LK", "LA", "LQ", "L10", "SA", "LJ", "SC", "L10", "SB", "LK", "LQ", "LA", "LJ", "L10", "SA", "SD", "LK", "SB", "LQ", "LA", "L10", "SC", "LK", "SC", "L10", "SB", "LQ", "LJ", "LA", "SB", "L10", "SA", "SB", "LQ", "SD", "LJ", "LK", "LA", "L10", "SC", "LQ", "SB", "LJ", "LK", "L10", "SA", "LA"
    ],
    "reel_5": [
      "SA", "LJ", "W2", "SD", "LK", "SA", "SC", "LJ", "W2", "LA", "L10", "CH", "LK", "LJ", "SA", "LQ", "L10", "ST", "SD", "LJ", "LA", "LK", "LQ", "L10", "SB", "SC", "LK", "L10", "SD", "LA", "LQ", "LJ", "LK", "L10", "CH", "SA", "LQ", "SD", "LJ", "LA", "W2", "LK", "LJ", "LQ", "L10", "SD", "LK", "LA", "LJ", "L10", "LQ", "SB", "LK", "LJ", "SD", "L10", "LA", "LQ", "LK", "SB", "L10", "LJ", "SC", "SA", "LQ", "SD", "LK", "L10", "LA", "LJ", "LQ", "L10", "SB", "LK", "SD", "LJ", "LA", "L10", "LQ", "LK", "LJ", "L10", "SD", "SA", "LK", "LQ", "LA", "LJ", "L10", "SB", "LK", "SD", "LQ", "L10", "LJ", "LA", "LK", "L10", "LQ", "SD", "LJ", "SB", "LK", "LA", "L10", "LQ", "LJ", "SD", "LK", "L10", "LA", "LQ", "LJ", "SB", "L10", "LK", "SD", "LA"
    ]
  }
}

### 3.2. Free Spins Loop Pseudocode

This pseudocode outlines the execution flow for the entire Free Spins bonus round, including the progressive multiplier logic.

```pseudocode
// Main function to manage the Free Spins session.
FUNCTION HandleFreeSpinsModule(player_id, total_bet):
    // 1. INITIALIZATION
    FreeSpinsState = {
        total_spins: 10,
        spins_remaining: 10,
        total_fs_win: 0,
        spin_history: [] // To log the results of each free spin
    }

    // 2. MAIN FREE SPINS LOOP
    // Loop continues as long as there are spins remaining.
    LOOP while FreeSpinsState.spins_remaining > 0:
        FreeSpinsState.spins_remaining -= 1

        // Execute a single free spin using the richer FS reels.
        // This function encapsulates the entire tumble and multiplier logic for one spin.
        single_spin_result = ExecuteSingleFreeSpin(fs_reel_strips, total_bet)

        // Aggregate the results from the completed spin.
        FreeSpinsState.total_fs_win += single_spin_result.total_win_for_spin
        FreeSpinsState.spin_history.push(single_spin_result)

        // Check for a re-trigger from the spin's initial grid.
        IF single_spin_result.is_retrigger:
            FreeSpinsState.total_spins += 5
            FreeSpinsState.spins_remaining += 5

    // 3. FINALIZE AND RETURN
    // Return the complete results of the Free Spins module.
    RETURN FreeSpinsState

// Function to execute one complete free spin, including all tumbles.
FUNCTION ExecuteSingleFreeSpin(reels, total_bet):
    // 1. INITIALIZE SPIN-SPECIFIC VARIABLES
    // *** PROGRESSIVE MULTIPLIER LOGIC ***
    // The multiplier starts at x1 for EACH new free spin.
    fs_progressive_multiplier = 1
    total_win_for_spin = 0
    tumble_sequence = []
    line_bet = total_bet / 20

    // 2. GENERATE INITIAL GRID
    // Use the richer "fs_reel_strips" for this spin.
    current_grid = GenerateInitialGrid(reels)
    initial_grid_for_retrigger_check = current_grid

    // 3. MODIFIED TUMBLE LOOP FOR FREE SPINS
    LOOP while TRUE:
        // Evaluate the grid for wins. Scatter payouts (5x/20x) are still valid here.
        evaluation_result = EvaluateGridForWins(current_grid, line_bet, total_bet, is_first_evaluation)

        IF evaluation_result.total_win_this_tumble == 0:
            BREAK LOOP // No more wins, exit the tumble loop.

        // Aggregate wins from this tumble (pre-multiplier).
        total_win_for_spin += evaluation_result.total_win_this_tumble
        tumble_sequence.push(evaluation_result)

        // *** PROGRESSIVE MULTIPLIER INCREASE RULE ***
        // For every successful tumble that results in a win, increment the multiplier.
        fs_progressive_multiplier += 1

        // Prepare for the next tumble.
        grid_with_gaps = RemoveWinningSymbols(current_grid, evaluation_result.winning_symbol_coords)
        current_grid = GenerateTumbleDownGrid(grid_with_gaps, reels)

    // 4. APPLY FINAL MULTIPLIER
    // *** MULTIPLIER APPLICATION RULE ***
    // The final accumulated multiplier is applied to the total win from all tumbles in this spin.
    final_win_for_spin = total_win_for_spin * fs_progressive_multiplier

    // 5. CHECK FOR RE-TRIGGER
    is_retrigger = FALSE
    scatter_count = CountSymbolsOnGrid(initial_grid_for_retrigger_check, "SCATTER")
    IF scatter_count >= 3:
        is_retrigger = TRUE

    // 6. RETURN SPIN RESULTS
    RETURN {
        total_win_for_spin: final_win_for_spin,
        initial_grid: initial_grid_for_retrigger_check,
        final_grid: current_grid,
        tumble_sequence: tumble_sequence,
        fs_multiplier_reached: fs_progressive_multiplier,
        is_retrigger: is_retrigger
    }
```

### 3.3. Multiplier Application Example

This example demonstrates the calculation flow for a single Free Spin that includes a `WILD_x2` and multiple tumbles, showing how the final win is calculated.

**Assumptions:**
*   `Total Bet` = 20 credits
*   `Line Bet` = 1 credit (20 / 20)

**Sequence of Events:**

1.  **Initial Spin State:**
    *   `FS_Progressive_Multiplier` starts at **x1**.
    *   `Total_Win_For_Spin` (pre-multiplier) starts at **0**.

2.  **Tumble 1 (Initial Grid):**
    *   A 4-of-a-kind win of `Symbol_B` occurs on a payline. One of the symbols is a `WILD_x2`.
    *   **Payline Win Calculation:** `Payout(Symbol_B, 4)` is 10.0x. So, `10.0 * Line Bet (1)` = 10 credits.
    *   **WILD_x2 Application:** The win involved a `WILD_x2`, so it's doubled: `10 * 2` = 20 credits.
    *   **State Update:**
        *   `Total_Win_For_Spin` becomes `0 + 20` = **20 credits**.
        *   A win occurred, so `FS_Progressive_Multiplier` increments by 1, becoming **x2**.

3.  **Tumble 2:**
    *   The winning `Symbol_B`s are removed, and new symbols fall into place.
    *   A new 3-of-a-kind win of `Symbol_D` occurs on a different payline (no `WILD_x2`).
    *   **Payline Win Calculation:** `Payout(Symbol_D, 3)` is 1.0x. So, `1.0 * Line Bet (1)` = 1 credit.
    *   **State Update:**
        *   `Total_Win_For_Spin` becomes `20 + 1` = **21 credits**.
        *   A win occurred, so `FS_Progressive_Multiplier` increments by 1, becoming **x3**.

4.  **Tumble 3:**
    *   The winning `Symbol_D`s are removed, and new symbols fall.
    *   No new winning combinations are formed. The tumble loop ends.

5.  **Final Win Calculation:**
    *   The total accumulated win from all tumbles is `Total_Win_For_Spin` = **21 credits**.
    *   The final accumulated multiplier is `FS_Progressive_Multiplier` = **x3**.
    *   The final win for the entire spin is calculated by applying the final multiplier to the total accumulated win:
    *   `Final Win = 21 credits * 3 = 63 credits`.
