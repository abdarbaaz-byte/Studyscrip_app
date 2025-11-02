
"use client";

import { useState } from "react";
import type { Game, WordMatchPair, SentenceScrambleItem } from "@/lib/data";
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
    if (newGames[gameIndex].pairs) {
      newGames[gameIndex].pairs![pairIndex][field] = value;
      setGames(newGames);
    }
  };
  
  const handleAddPair = (gameIndex: number) => {
    const newGames = [...games];
    if (!newGames[gameIndex].pairs) newGames[gameIndex].pairs = [];
    newGames[gameIndex].pairs!.push({ id: generateId('wp'), word: '', meaning: ''});
    setGames(newGames);
  };
  
  const handleRemovePair = (gameIndex: number, pairIndex: number) => {
    const newGames = [...games];
    if (newGames[gameIndex].pairs) {
      newGames[gameIndex].pairs!.splice(pairIndex, 1);
      setGames(newGames);
    }
  };

  const handleSentenceChange = (gameIndex: number, sentenceIndex: number, value: string) => {
    const newGames = [...games];
    if (newGames[gameIndex].sentences) {
        newGames[gameIndex].sentences![sentenceIndex].sentence = value;
        setGames(newGames);
    }
  };

  const handleAddSentence = (gameIndex: number) => {
    const newGames = [...games];
    if (!newGames[gameIndex].sentences) newGames[gameIndex].sentences = [];
    newGames[gameIndex].sentences!.push({ id: generateId('ss'), sentence: '' });
    setGames(newGames);
  };

  const handleRemoveSentence = (gameIndex: number, sentenceIndex: number) => {
    const newGames = [...games];
    if (newGames[gameIndex].sentences) {
        newGames[gameIndex].sentences!.splice(sentenceIndex, 1);
        setGames(newGames);
    }
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
    <Accordion type="multiple" defaultValue={games.map(g => g.id)} className="w-full space-y-4">
      {games.map((game, gameIndex) => (
        <AccordionItem value={game.id} key={game.id} className="border rounded-md px-4 bg-card">
          <AccordionTrigger className="hover:no-underline text-xl font-headline py-4">
            {game.title}
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 p-2 border-t mt-3">
              {game.type === 'WordMatch' && (
                <div className="space-y-4">
                  {(game.pairs || []).map((pair, pairIndex) => (
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
                  <Button type="button" variant="outline" onClick={() => handleAddPair(gameIndex)}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Word Pair
                  </Button>
                </div>
              )}
              {game.type === 'SentenceScramble' && (
                  <div className="space-y-4">
                    {(game.sentences || []).map((item, sentenceIndex) => (
                        <div key={item.id} className="flex items-center gap-4 p-4 border rounded-md bg-secondary/50">
                           <Label htmlFor={`sentence-${item.id}`} className="flex-shrink-0">Sentence:</Label>
                           <Input
                                id={`sentence-${item.id}`}
                                value={item.sentence}
                                onChange={(e) => handleSentenceChange(gameIndex, sentenceIndex, e.target.value)}
                                className="flex-grow"
                            />
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                onClick={() => handleRemoveSentence(gameIndex, sentenceIndex)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                     <Button type="button" variant="outline" onClick={() => handleAddSentence(gameIndex)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Sentence
                    </Button>
                  </div>
              )}
            </div>
             <div className="flex justify-end pt-4">
                <Button onClick={() => handleSaveGame(game)} disabled={isSaving === game.id}>
                    {isSaving === game.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4" />}
                    Save Changes
                </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
