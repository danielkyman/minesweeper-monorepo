<!--
Describe implementation below.

Feel free to add any relevant info on what packages you may have added, the directory structure you chose, the tests you added etc. Is there anything you would have done differently with more time and or resources?
-->

## Overview

This implementation delivers a complete backend and frontend system for playing Minesweeper. The backend is built on NestJS with TypeORM and PostgreSQL, while the frontend is implemented using Next.js within a full-stack monorepo.

## Tech Stack

- **Backend:** NestJS, TypeORM, PostgreSQL
- **Frontend:** Next.js

## Key Features & Endpoints

### 1. **Create a Game** (`POST /game`)

- Accepts validated input via `CreateGameDto` (`rows`, `cols`, `mines`)
- Validates bounds on grid dimensions and mine count
- Generates a board using `MinesweeperEngine.createBoard`
- Persists `Game` and `GameCell` records
- Returns a masked view of the board (only exposed fields necessary to client)

### 2. **List Games** (`GET /game`)

- Supports pagination (`limit`, `offset`) and filtering by game status
- Eager loads cells to support status summary and view transformation

### 3. **Get Game by ID** (`GET /game/:id`)

- Fetches full game state
- Transforms output to mask unrevealed/flagged cells appropriately

### 4. **Reveal Cell** (`PATCH /game/:id/reveal`)

- Updates game state by revealing a cell and handling auto-reveal (flood fill)
- Checks win/loss conditions post-reveal
- Returns updated masked board

### 5. **Flag Cell** (`PATCH /game/:id/flag`)

- Toggles a flag on a hidden cell
- No-op for already revealed or detonated cells

### 6. **Delete Game** (`DELETE /game/:id`)

- Deletes a game and its associated cells

## Architecture & Design

### Entities

- **Game:** Contains metadata about the session (grid size, number of mines, status)
- **GameCell:** Individual grid cells with coordinates, mine flag, neighboring count, and status

### `MinesweeperEngine`

Encapsulates core game logic in a pure class:

- Random mine placement with collision avoidance
- Neighbor count calculation
- Flood-reveal algorithm
- Game status detection (win/loss/in-progress)
- Flag toggling

This separation allows unit testing and deterministic behavior without database dependency.

### Data Transformation

`GameViewTransformer` masks internal fields and reshapes the flat cell array into a matrix for frontend display. This keeps business logic and view logic isolated.

## Validation & Safety

- Input validation is enforced via `class-validator` on DTOs
- Defensive checks (e.g. bounds, mine count limits) are in place to prevent invalid board generation
- Domain errors (e.g. out-of-bounds reveals, illegal flags) are handled gracefully

## Trade-Offs & Decisions

- **Monorepo Architecture:** Included a Next.js client for self-verification of APIs.
- **Game State Exposure:** Chose to always return a masked version of the board to prevent exposing mine locations unless revealed. This keeps the API consumer honest and the game fair.
- **Atomic Operations:** Game and cell creation are split into discrete DB calls instead of using nested inserts for clarity and debuggability, at the cost of slightly more DB overhead.
- **Engine Reusability:** Pure logic layer (`MinesweeperEngine`) was created to allow deterministic testing and future extensibility.

## Testing & Extensibility

While formal tests were not included due to time constraints, the architecture supports modular unit testing:

- `MinesweeperEngine` is stateless and easily testable
- DTOs and transformers provide clear boundaries for input/output shape
- Service methods are transactional and deterministic
