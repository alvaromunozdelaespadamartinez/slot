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
```

---

## Part 2: Server-Side Pseudocode

This pseudocode details the state machine and logic for handling a single, complete game round, including all subsequent tumbles.

### 2.1. Main Spin Cycle (State Machine)

This function is the main entry point for a player's spin request. It manages the entire game round from start to finish.

```pseudocode
FUNCTION HandleSpinRequest(player_id, total_bet):
    // 1. INITIALIZATION
    // Create a state object to hold all data for this spin.
    GameState = {
        total_bet: total_bet,
        line_bet: total_bet / 20,
        total_win: 0,
        tumble_sequence: [], // An array to log each tumble event
        is_free_spins_triggered: FALSE,
        free_spins_awarded: 0,
        initial_grid: null,
        final_grid: null
    }

    // 2. GENERATE INITIAL GRID
    // Use a secure Random Number Generator (RNG) to pick a stop position for each reel.
    // The visible grid is a 5x3 slice of the reel strips based on these stops.
    initial_grid = GenerateInitialGrid(reel_strips)
    GameState.initial_grid = initial_grid

    // 3. EXECUTE TUMBLE LOOP
    // This function handles the entire cascade process and returns the aggregated results.
    tumble_result = ExecuteTumbleLoop(initial_grid, GameState.line_bet, GameState.total_bet)

    // 4. AGGREGATE RESULTS
    // Update the main GameState with the results from the tumble loop.
    GameState.total_win = tumble_result.total_win_for_spin
    GameState.tumble_sequence = tumble_result.win_sequence
    GameState.final_grid = tumble_result.final_grid

    // 5. CHECK FOR FREE SPINS TRIGGER
    // This check is performed ONLY on the initial grid, after all tumbles are complete.
    initial_scatter_count = CountSymbolsOnGrid(GameState.initial_grid, "SCATTER")
    IF initial_scatter_count >= 3:
        GameState.is_free_spins_triggered = TRUE
        GameState.free_spins_awarded = 10
        // NOTE: The SCATTER payout (5x/20x) is already calculated and included
        // within the first step of the ExecuteTumbleLoop. This step only handles
        // the awarding of the Free Spins feature itself.

    // 6. FINALIZE AND RETURN RESPONSE
    // Format the GameState into a response object for the client.
    response = FormatClientResponse(GameState)
    RETURN response
```

### 2.2. Tumble Loop Logic

This function is the core of the cascade mechanic. It repeatedly evaluates the grid for wins and processes tumbles until no new wins are found.

```pseudocode
FUNCTION ExecuteTumbleLoop(current_grid, line_bet, total_bet):
    // Initialize trackers for the entire spin's tumble sequence.
    total_win_for_spin = 0
    win_sequence = []
    is_first_evaluation = TRUE

    // This loop continues as long as new wins are created.
    LOOP while TRUE:
        // 1. EVALUATE CURRENT GRID FOR WINS
        // The is_first_evaluation flag is crucial for handling SCATTER payouts correctly.
        evaluation_result = EvaluateGridForWins(current_grid, line_bet, total_bet, is_first_evaluation)

        // If there are no wins in the current grid state, the tumble sequence is over.
        IF evaluation_result.total_win_this_tumble == 0:
            BREAK LOOP

        // 2. AGGREGATE WIN DATA
        total_win_for_spin += evaluation_result.total_win_this_tumble
        win_sequence.push(evaluation_result) // Logs the details of this specific tumble
        is_first_evaluation = FALSE // All subsequent evaluations in this loop are not the first.

        // 3. PREPARE FOR NEXT TUMBLE
        // Remove the symbols that formed winning combinations, leaving empty spaces.
        grid_with_gaps = RemoveWinningSymbols(current_grid, evaluation_result.winning_symbol_coords)

        // Generate new symbols to "fall" from the top of the reels to fill the gaps.
        new_grid = GenerateTumbleDownGrid(grid_with_gaps, reel_strips)

        // The newly formed grid becomes the grid for the next iteration.
        current_grid = new_grid

    // Once the loop breaks, return all results from the completed sequence.
    RETURN {
        total_win_for_spin: total_win_for_spin,
        win_sequence: win_sequence,
        final_grid: current_grid
    }
```

### 2.3. Grid Evaluation Logic (Payline, Wild, and Scatter)

This helper function is called by the Tumble Loop. It finds all winning combinations on the grid and calculates their value.

```pseudocode
FUNCTION EvaluateGridForWins(grid, line_bet, total_bet, is_first_evaluation):
    total_win_this_tumble = 0
    winning_lines = []
    scatter_win = { payout: 0, count: 0 }
    winning_symbol_coords = new Set() // Using a Set prevents duplicate coordinates.

    // A. EVALUATE 20 PAYLINES FOR WINS
    FOR each payline in PAYLINE_DEFINITIONS:
        // CheckPayline walks the payline path to find the winning symbol, its length,
        // the coordinates of the winning symbols, and if a WILD_x2 was used.
        line_eval = CheckPayline(grid, payline, "WILD_x2") // Returns {symbol, length, coords, has_wild_x2}

        IF line_eval.length >= 3:
            // Fetch the payout multiplier from the Payout Table.
            payout_multiplier = GetPayout(line_eval.symbol, line_eval.length)
            win_amount = payout_multiplier * line_bet

            // *** WILD_x2 MULTIPLIER LOGIC ***
            // If a WILD_x2 was part of the win, double the line's payout.
            // Rule: Multiplier is capped at x2 per line, not additive.
            IF line_eval.has_wild_x2:
                win_amount *= 2

            total_win_this_tumble += win_amount
            winning_lines.push({ line_id, symbol, length, win_amount })
            line_eval.coords.forEach(coord => winning_symbol_coords.add(coord))

    // B. EVALUATE SCATTER PAYOUT
    // *** SCATTER PAYOUT LOGIC ***
    // This is only ever checked on the very first grid presented in a game round.
    IF is_first_evaluation:
        scatter_coords = GetSymbolCoordsOnGrid(grid, "SCATTER")
        scatter_count = scatter_coords.length

        IF scatter_count == 4:
            scatter_win.payout = 5 * total_bet
        ELSE IF scatter_count >= 5: // Handles 5 or more gracefully.
            scatter_win.payout = 20 * total_bet

        IF scatter_win.payout > 0:
            scatter_win.count = scatter_count
            total_win_this_tumble += scatter_win.payout
            // Add SCATTER symbols to the set of symbols to be removed for the tumble.
            scatter_coords.forEach(coord => winning_symbol_coords.add(coord))

    RETURN {
        total_win_this_tumble: total_win_this_tumble,
        winning_lines: winning_lines,
        scatter_win: scatter_win,
        winning_symbol_coords: convertSetToArray(winning_symbol_coords)
    }
```
