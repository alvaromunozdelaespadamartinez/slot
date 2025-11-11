# Phoenix High-Volatility Slot: Game Logic Blueprint

This document outlines the complete server-side logic and mathematical design for the Phoenix High-Volatility Slot game.

---

## Part 1: Game's Mathematical Foundation

### 1.1. Payline Definitions

The game uses a 5x3 grid with 20 fixed paylines. Paylines are evaluated from left to right, starting from the first reel. The rows are indexed 0 (top), 1 (middle), and 2 (bottom).

```json
{
  "paylines": [
    [1, 1, 1, 1, 1], [0, 0, 0, 0, 0], [2, 2, 2, 2, 2], [0, 1, 2, 1, 0], [2, 1, 0, 1, 2],
    [0, 0, 1, 2, 2], [2, 2, 1, 0, 0], [1, 0, 0, 0, 1], [1, 2, 2, 2, 1], [0, 1, 0, 1, 0],
    [2, 1, 2, 1, 2], [1, 0, 1, 2, 1], [1, 2, 1, 0, 1], [0, 1, 1, 1, 0], [2, 1, 1, 1, 2],
    [1, 1, 0, 1, 1], [1, 1, 2, 1, 1], [0, 0, 2, 0, 0], [2, 2, 0, 2, 2], [0, 2, 2, 2, 0]
  ]
}
```

### 1.2. Payout Table

Payouts are defined as multipliers of the `Line Bet` (Total Bet / 20).

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
(The JSON for reel strips remains the same and is omitted for brevity in this view, but is present in the file.)

---

## Part 2: Phoenix Slot Engine V1 - Functional Pseudocode

This section provides a complete overhaul of the server-side logic to ensure the integrity of the Random Number Generator (RNG) and the proper execution of the spin cycle.

### 2.1. RNG Manager Logic

The integrity of each spin depends on a unique and unpredictable seed.

```pseudocode
// FUNCTION: GET_UNIQUE_SPIN_SEED
// PURPOSE: Generates a verifiable and unique seed for a single game round.
// This function MUST be called once at the beginning of every new spin.
FUNCTION GET_UNIQUE_SPIN_SEED(player_id):
    // 1. GATHER ENTROPY SOURCES
    // Combine multiple volatile data points to create a high-entropy base.
    current_server_time = GetNanosecondsTimestamp() // High-resolution timestamp
    high_entropy_random = GetCryptographicallySecureRandom() // OS-level random source
    spin_request_id = GenerateUUID() // A unique ID for this specific transaction

    // 2. CREATE SEED STRING
    // Concatenate the sources into a single string.
    seed_string = player_id + ":" + current_server_time + ":" + high_entropy_random + ":" + spin_request_id

    // 3. HASH THE STRING
    // Use a fast, non-cryptographic hash function to convert the string into a 64-bit integer.
    spin_seed = HashTo64BitInteger(seed_string)

    // 4. RETURN THE SEED
    RETURN spin_seed
```

### 2.2. Main Spin Execution Loop

This is the primary server function that orchestrates the entire spin process from request to response.

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

    // === STEP 6: FEATURE CHECK ===
    is_free_spins_triggered = FALSE
    free_spins_awarded = 0
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
        initial_reel_indices: initial_reel_indices, // ** CRITICAL FOR CLIENT ANIMATION **
        final_grid: final_grid,
        is_free_spins_triggered: is_free_spins_triggered,
        free_spins_awarded: free_spins_awarded,
        tumble_sequence: tumble_result.win_sequence
    }
    RETURN response
```

### 2.3. Core Logic Helper Functions

```pseudocode
// FUNCTION: CALCULATE_REEL_STOPS
// PURPOSE: Converts a single seed into five deterministic reel stop indices.
FUNCTION CALCULATE_REEL_STOPS(seed, reel_strips):
    reel_stops = []
    current_seed = seed
    FOR i FROM 1 TO 5:
        current_seed = (current_seed * 48271) % 2147483647 // LCG PRNG
        reel_length = length(reel_strips["reel_" + i])
        stop_index = current_seed % reel_length
        reel_stops.push(stop_index)
    RETURN reel_stops // e.g., [5, 72, 31, 110, 8]

// FUNCTION: GenerateGridFromStops
// PURPOSE: Creates the 5x3 visible grid from the reel strips and stop indices.
FUNCTION GenerateGridFromStops(stop_indices, reel_strips):
    grid = create_5x3_array()
    FOR reel_index FROM 0 TO 4:
        stop = stop_indices[reel_index]
        reel = reel_strips["reel_" + (reel_index + 1)]
        reel_len = length(reel)
        grid[1][reel_index] = reel[stop] // Middle row
        grid[0][reel_index] = reel[(stop - 1 + reel_len) % reel_len] // Top row
        grid[2][reel_index] = reel[(stop + 1) % reel_len] // Bottom row
    RETURN grid

// FUNCTION: ExecuteTumbleLoop (Integrated from previous version)
FUNCTION ExecuteTumbleLoop(current_grid, line_bet, total_bet):
    total_win_for_spin = 0
    win_sequence = []
    is_first_evaluation = TRUE
    LOOP while TRUE:
        evaluation_result = EvaluateGridForWins(current_grid, line_bet, total_bet, is_first_evaluation)
        IF evaluation_result.total_win_this_tumble == 0:
            BREAK LOOP
        total_win_for_spin += evaluation_result.total_win_this_tumble
        win_sequence.push(evaluation_result)
        is_first_evaluation = FALSE
        grid_with_gaps = RemoveWinningSymbols(current_grid, evaluation_result.winning_symbol_coords)
        current_grid = GenerateTumbleDownGrid(grid_with_gaps, reel_strips)
    RETURN { total_win_for_spin, win_sequence, final_grid: current_grid }

// FUNCTION: EvaluateGridForWins (Integrated from previous version)
// (This function's detailed pseudocode remains the same and is omitted for brevity)
```

---

## Part 3: Free Spins Module
(This section's content, including FS reel strips and pseudocode, remains the same.)

---

## Part 4: Client Communication Update

This section details the critical change required on the client-side to synchronize with the overhauled server logic.

### 4.1. Client Update Instruction

The server's JSON response for a spin now includes a new key: `initial_reel_indices`. This is an array of 5 integers representing the exact stop position for each reel (e.g., `[5, 72, 31, 110, 8]`).

The client-side `game_controller.js` **must** use this array to drive its spin animation. Instead of generating random outcomes locally, the client will:
1.  Receive the `initial_reel_indices` from the server.
2.  Instruct the `slot_renderer.js` to animate the reels spinning and landing on these specific indices.
3.  Display the initial grid calculated from these stops.
4.  Animate the tumbles and wins as described in the `tumble_sequence` provided by the server.

This ensures that the client's visual representation is a direct and accurate reflection of the server's verifiable and authoritative outcome.