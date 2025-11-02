
"use client";

import { useState } from "react";
import type { Game, WordMatchPair } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, PlusCircle, Save, Loader2 } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";

interface AdminGamesFormProps {
  initialGames: Game[];
  onSave: (game: Game) => Promise<void>;
}

const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

export function AdminGamesForm({ initialGames, onSave }: AdminGamesFormProps) {
  const [games, setGames] = useState<Game[]>(initialGames);
  const [isSaving, setIsSaving] = useState<string | null>(null); // Store ID of game being saved
  const { toast } = useToast();

  const handleWordPairChange = (gameIndex: number, pairIndex: number, field: 'word' | 'meaning', value: string) => {
    const newGames = [...games];
    newGames[gameIndex].pairs[pairIndex][field] = value;
    setGames(newGames);
  };
  
  const handleAddPair = (gameIndex: number) => {
    const newGames = [...games];
    newGames[gameIndex].pairs.push({ id: generateId('wp'), word: '', meaning: ''});
    setGames(newGames);
  };
  
  const handleRemovePair = (gameIndex: number, pairIndex: number) => {
    const newGames = [...games];
    newGames[gameIndex].pairs.splice(pairIndex, 1);
    setGames(newGames);
  };

  const handleSaveGame = async (game: Game) => {
    setIsSaving(game.id);
    await onSave(game);
    setIsSaving(null);
    toast({ title: `Game "${game.title}" saved!` });
  };
  
  if (!games.length) {
    return <p className="text-muted-foreground text-center py-8">No games found. The first game will be created automatically.</p>;
  }

  return (
    <Accordion type="single" collapsible className="w-full space-y-4">
      {games.map((game, gameIndex) => (
        <AccordionItem value={game.id} key={game.id} className="border rounded-md px-4 bg-card">
          <AccordionTrigger className="hover:no-underline text-xl font-headline py-4">
            {game.title}
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 p-2 border-t mt-3">
              {game.type === 'WordMatch' && (
                <div className="space-y-4">
                  {game.pairs.map((pair, pairIndex) => (
                    <div key={pair.id} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4 items-end p-4 border rounded-md bg-secondary/50">
                        <div className="space-y-1.5">
                            <Label htmlFor={`word-${pair.id}`}>English Word</Label>
                            <Input
                                id={`word-${pair.id}`}
                                value={pair.word}
                                onChange={(e) => handleWordPairChange(gameIndex, pairIndex, 'word', e.target.value)}
                            />
                        </div>
                        <div className="space-y-1.5">
                             <Label htmlFor={`meaning-${pair.id}`}>Hindi Meaning</Label>
                            <Input
                                id={`meaning-${pair.id}`}
                                value={pair.meaning}
                                onChange={(e) => handleWordPairChange(gameIndex, pairIndex, 'meaning', e.target.value)}
                            />
                        </div>
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => handleRemovePair(gameIndex, pairIndex)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-4">
                    <Button type="button" variant="outline" onClick={() => handleAddPair(gameIndex)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Word Pair
                    </Button>
                     <Button onClick={() => handleSaveGame(game)} disabled={isSaving === game.id}>
                        {isSaving === game.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4" />}
                        Save Changes
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
