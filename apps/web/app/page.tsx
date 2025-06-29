"use client";

import { useState, useEffect, useCallback } from "react";
import type React from "react";

import {
  Cell,
  CellStatus,
  Game,
  GameConfig,
  GameStatus,
} from "@/types/minesweeper";
import {
  createGame as apiCreateGame,
  revealCell as apiRevealCell,
  flagCell as apiFlagCell,
  getGame as apiGetGame,
} from "@/lib/minesweeperApi";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Bomb, Flag, RotateCcw, Timer, Trophy } from "lucide-react";

const DIFFICULTY_PRESETS: GameConfig[] = [
  { name: "Beginner", rows: 9, cols: 9, mines: 10 },
  { name: "Intermediate", rows: 16, cols: 16, mines: 40 },
  { name: "Expert", rows: 16, cols: 30, mines: 99 },
];

export default function MineSweeper() {
  const [game, setGame] = useState<Game | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<string>("Beginner");
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(0);

  /*──── Client Timer ────*/
  useEffect(() => {
    let iv: NodeJS.Timeout | undefined;
    if (game?.status === GameStatus.IN_PROGRESS) {
      iv = setInterval(() => setTimer((t) => t + 1), 1_000);
    }
    return () => clearInterval(iv);
  }, [game?.status]);

  /*──── Persist/restore current game ────*/
  const saveCurrentId = (id?: string) =>
    id
      ? localStorage.setItem("minesweeperCurrentGame", id)
      : localStorage.removeItem("minesweeperCurrentGame");

  const resumeIfPossible = useCallback(async () => {
    const id = localStorage.getItem("minesweeperCurrentGame");
    if (!id) return false;

    try {
      const g = await apiGetGame(id);
      if (g.status === GameStatus.IN_PROGRESS) {
        setGame(g);
        const elapsed = (Date.now() - new Date(g.createdAt).getTime()) / 1000;
        setTimer(Math.floor(elapsed));
        return true;
      }
    } catch {
      /* ignore – fall through to new game */
    }
    saveCurrentId();
    return false;
  }, []);

  /*──── Create new game ────*/
  const createNewGame = useCallback(async () => {
    setIsLoading(true);
    try {
      const preset =
        DIFFICULTY_PRESETS.find((p) => p.name === selectedDifficulty) ??
        DIFFICULTY_PRESETS[0];

      const { rows, cols, mines } = preset;
      const g = await apiCreateGame({ rows, cols, mines });

      setGame(g);
      setTimer(0);
      saveCurrentId(g.id);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDifficulty]);

  const handleCellClick = useCallback(
    async (row: number, col: number) => {
      if (!game || game.status !== GameStatus.IN_PROGRESS) return;
      try {
        const updated = await apiRevealCell(game.id, row, col);
        setGame(updated);
        if (updated.status !== GameStatus.IN_PROGRESS) saveCurrentId();
      } catch (err) {
        console.error(err);
      }
    },
    [game]
  );

  const handleCellRightClick = useCallback(
    async (e: React.MouseEvent, row: number, col: number) => {
      e.preventDefault();
      if (!game || game.status !== GameStatus.IN_PROGRESS) return;
      try {
        const updated = await apiFlagCell(game.id, row, col);
        setGame(updated);
        if (updated.status !== GameStatus.IN_PROGRESS) saveCurrentId();
      } catch (err) {
        console.error(err);
      }
    },
    [game]
  );

  useEffect(() => {
    (async () => {
      if (!(await resumeIfPossible())) {
        await createNewGame();
      }
    })();
  }, []);

  const getCellContent = (c: Cell) => {
    switch (c.status) {
      case CellStatus.FLAGGED:
        return <Flag className="w-4 h-4 text-red-500" />;
      case CellStatus.DETONATED:
        return <Bomb className="w-4 h-4 text-black" />;
      case CellStatus.REVEALED:
        if (c.isMine) return <Bomb className="w-4 h-4 text-gray-600" />;
        return c.neighboringBombCount ? c.neighboringBombCount : null;
      default:
        return null;
    }
  };

  const numberColor = (n: number) =>
    [
      "",
      "text-blue-600",
      "text-green-600",
      "text-red-600",
      "text-purple-600",
      "text-yellow-600",
      "text-pink-600",
      "text-gray-600",
      "text-black",
    ][n] ?? "";

  const cellClass = (c: Cell) => {
    const base =
      "w-8 h-8 border border-gray-300 flex items-center justify-center text-sm font-bold cursor-pointer transition-all duration-150";
    switch (c.status) {
      case CellStatus.REVEALED:
        if (c.isMine) return `${base} bg-red-500 text-white`;
        return `${base} bg-gray-100 ${
          c.neighboringBombCount ? numberColor(c.neighboringBombCount) : ""
        }`;
      case CellStatus.FLAGGED:
        return `${base} bg-yellow-100`;
      case CellStatus.DETONATED:
        return `${base} bg-red-600 text-white`;
      default:
        return `${base} bg-gray-200 hover:bg-gray-300`;
    }
  };

  const statusIcon =
    game?.status === GameStatus.WON ? (
      <Trophy className="w-5 h-5 text-yellow-500" />
    ) : game?.status === GameStatus.LOST ? (
      <Bomb className="w-5 h-5 text-red-500" />
    ) : (
      <Timer className="w-5 h-5 text-blue-500" />
    );

  const fmt = (s: number) =>
    `${Math.floor(s / 60)
      .toString()
      .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center text-slate-800 flex items-center justify-center gap-2">
              <Bomb className="w-8 h-8" /> MineSweeper
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
              {/* Difficulty & New game */}
              <div className="flex items-center gap-4">
                <Select
                  value={selectedDifficulty}
                  onValueChange={setSelectedDifficulty}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTY_PRESETS.map((p) => (
                      <SelectItem key={p.name} value={p.name}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={createNewGame}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" /> New Game
                </Button>
              </div>

              {game && (
                <div className="flex items-center gap-4">
                  {game.mines !== undefined && (
                    <Badge
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Flag className="w-4 h-4" />
                      {game.mines - (game.flagsUsed ?? 0)}
                    </Badge>
                  )}
                  <Badge variant="outline" className="flex items-center gap-2">
                    {statusIcon} {fmt(timer)}
                  </Badge>
                  <Badge
                    variant={
                      game.status === GameStatus.WON
                        ? "default"
                        : game.status === GameStatus.LOST
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {game.status.replace("_", " ")}
                  </Badge>
                </div>
              )}
            </div>

            {/* Board */}
            {game && (
              <div className="flex justify-center">
                <div
                  className="inline-grid gap-0 border-2 border-gray-400 bg-white rounded-lg overflow-hidden shadow-lg"
                  style={{ gridTemplateColumns: `repeat(${game.cols}, 1fr)` }}
                >
                  {game.board.flat().map((c) => (
                    <div
                      key={`${c.x}-${c.y}`}
                      className={cellClass(c)}
                      onClick={() => handleCellClick(c.y, c.x)}
                      onContextMenu={(e) => handleCellRightClick(e, c.y, c.x)}
                    >
                      {getCellContent(c)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Loading spinner */}
            {!game && isLoading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600 mx-auto" />
                <p className="mt-2 text-slate-600">Creating new game…</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* How-to card */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-sm text-slate-600">
              <p className="mb-2">
                <strong>How to play:</strong>
              </p>
              <p>
                Left-click to reveal • Right-click to flag • Clear all non-mine
                cells to win
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
