

"use client";

import { useState } from "react";
import type { Game, WordMatchPair, SentenceScrambleItem, MathProblem, PatternDetectiveItem } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, PlusCircle, Save, Loader2 } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AdminGamesFormProps {
  initialGames: Game[];
  onSave: (game: Game) => Promise<void>;
}

const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

export function AdminGamesForm({ initialGames, onSave }: AdminGamesFormProps) {
  const [games, setGames] = useState<Game[]>(initialGames);
  const [isSaving, setIsSaving] = useState<string | null>(null);
  const { toast } = useToast();

  const handleAddNewGame = (type: 'WordMatch' | 'SentenceScramble' | 'MathRunner' | 'PatternDetective') => {
    let newGame: Game;
    switch(type) {
        case 'WordMatch':
            newGame = { id: generateId('game'), title: 'New Word Match Topic', description: 'Match the words to their meanings.', type, pairs: [] };
            break;
        case 'SentenceScramble':
            newGame = { id: generateId('game'), title: 'New Sentence Scramble', description: 'Unscramble the words.', type, sentences: [] };
            break;
        case 'MathRunner':
            newGame = { id: generateId('game'), title: 'New Math Runner Level', description: 'Solve math problems.', type, problems: [] };
            break;
        case 'PatternDetective':
            newGame = { id: generateId('game'), title: 'New Pattern', description: 'Find the next item in the sequence.', type, patterns: [] };
            break;
    }
    setGames(prev => [...prev, newGame]);
  };
  
  const handleGameFieldChange = (gameIndex: number, field: 'title' | 'description', value: string) => {
    const newGames = [...games];
    newGames[gameIndex][field] = value;
    setGames(newGames);
  }

  // Word Match Handlers
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

  // Sentence Scramble Handlers
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
  
  // Math Runner Handlers
    const handleProblemChange = (gameIndex: number, problemIndex: number, field: 'question' | 'answer', value: string) => {
        const newGames = [...games];
        if (newGames[gameIndex].problems) {
            if (field === 'answer') {
                 newGames[gameIndex].problems![problemIndex][field] = Number(value);
            } else {
                 newGames[gameIndex].problems![problemIndex][field] = value;
            }
            setGames(newGames);
        }
    };
    
    const handleAddProblem = (gameIndex: number) => {
        const newGames = [...games];
        if (!newGames[gameIndex].problems) newGames[gameIndex].problems = [];
        newGames[gameIndex].problems!.push({ id: generateId('mp'), question: '', answer: 0});
        setGames(newGames);
    };

    const handleRemoveProblem = (gameIndex: number, problemIndex: number) => {
        const newGames = [...games];
        if (newGames[gameIndex].problems) {
            newGames[gameIndex].problems!.splice(problemIndex, 1);
            setGames(newGames);
        }
    };

    // Pattern Detective Handlers
    const handlePatternChange = (gameIndex: number, patternIndex: number, field: 'sequence' | 'options' | 'correctAnswer', value: string) => {
        const newGames = [...games];
        const game = newGames[gameIndex];
        if (game.patterns) {
            if (field === 'sequence' || field === 'options') {
                game.patterns[patternIndex][field] = value.split(',').map(s => s.trim());
            } else {
                game.patterns[patternIndex][field] = value;
            }
            setGames(newGames);
        }
    };

    const handleAddPattern = (gameIndex: number) => {
        const newGames = [...games];
        if (!newGames[gameIndex].patterns) newGames[gameIndex].patterns = [];
        newGames[gameIndex].patterns!.push({ id: generateId('pd'), sequence: [], options: [], correctAnswer: '' });
        setGames(newGames);
    };

    const handleRemovePattern = (gameIndex: number, patternIndex: number) => {
        const newGames = [...games];
        if (newGames[gameIndex].patterns) {
            newGames[gameIndex].patterns!.splice(patternIndex, 1);
            setGames(newGames);
        }
    };


  const handleSaveGame = async (game: Game) => {
    setIsSaving(game.id);
    await onSave(game);
    setIsSaving(null);
    toast({ title: `Game "${game.title}" saved!` });
  };
  
  return (
    <div className="space-y-4">
        <div className="flex justify-end gap-2 flex-wrap">
            <Button variant="outline" onClick={() => handleAddNewGame('WordMatch')}><PlusCircle className="mr-2 h-4 w-4" /> Add Word Match</Button>
            <Button variant="outline" onClick={() => handleAddNewGame('SentenceScramble')}><PlusCircle className="mr-2 h-4 w-4" /> Add Sentence Scramble</Button>
            <Button variant="outline" onClick={() => handleAddNewGame('MathRunner')}><PlusCircle className="mr-2 h-4 w-4" /> Add Math Runner</Button>
            <Button variant="outline" onClick={() => handleAddNewGame('PatternDetective')}><PlusCircle className="mr-2 h-4 w-4" /> Add Pattern Detective</Button>
        </div>
        
        {games.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No games found. Add a new game to get started.</p>
        ) : (
            <Accordion type="multiple" defaultValue={games.map(g => g.id)} className="w-full space-y-4">
            {games.map((game, gameIndex) => (
                <AccordionItem value={game.id} key={game.id} className="border rounded-md px-4 bg-card">
                <AccordionTrigger className="hover:no-underline text-xl font-headline py-4">
                    <div className="flex items-center gap-2">
                         <span className="text-sm font-medium bg-secondary text-secondary-foreground rounded px-2 py-1">{game.type}</span>
                         <span>{game.title}</span>
                    </div>
                </AccordionTrigger>
                <AccordionContent>
                    <div className="space-y-4 p-2 border-t mt-3">
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor={`title-${game.id}`}>Game Title</Label>
                            <Input
                                id={`title-${game.id}`}
                                value={game.title}
                                onChange={(e) => handleGameFieldChange(gameIndex, 'title', e.target.value)}
                            />
                        </div>
                         <div className="space-y-1.5">
                            <Label htmlFor={`desc-${game.id}`}>Description</Label>
                            <Input
                                id={`desc-${game.id}`}
                                value={game.description}
                                onChange={(e) => handleGameFieldChange(gameIndex, 'description', e.target.value)}
                            />
                        </div>
                    </div>

                    {game.type === 'WordMatch' && (
                        <div className="space-y-4">
                        {(game.pairs || []).map((pair, pairIndex) => (
                            <div key={pair.id} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4 items-end p-4 border rounded-md bg-secondary/50">
                                <div className="space-y-1.5">
                                    <Label htmlFor={`word-${pair.id}`}>English Word</Label>
                                    <Input id={`word-${pair.id}`} value={pair.word} onChange={(e) => handleWordPairChange(gameIndex, pairIndex, 'word', e.target.value)} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor={`meaning-${pair.id}`}>Hindi Meaning</Label>
                                    <Input id={`meaning-${pair.id}`} value={pair.meaning} onChange={(e) => handleWordPairChange(gameIndex, pairIndex, 'meaning', e.target.value)} />
                                </div>
                                <Button type="button" variant="destructive" size="icon" onClick={() => handleRemovePair(gameIndex, pairIndex)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        <Button type="button" variant="outline" onClick={() => handleAddPair(gameIndex)}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Word Pair
                        </Button>
                        </div>
                    )}
                    {game.type === 'SentenceScramble' && (
                        <div className="space-y-4">
                            {(game.sentences || []).map((item, sentenceIndex) => (
                                <div key={item.id} className="flex items-center gap-4 p-4 border rounded-md bg-secondary/50">
                                <Label htmlFor={`sentence-${item.id}`} className="flex-shrink-0">Sentence:</Label>
                                <Input id={`sentence-${item.id}`} value={item.sentence} onChange={(e) => handleSentenceChange(gameIndex, sentenceIndex, e.target.value)} className="flex-grow" />
                                <Button type="button" variant="destructive" size="icon" onClick={() => handleRemoveSentence(gameIndex, sentenceIndex)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                                </div>
                            ))}
                            <Button type="button" variant="outline" onClick={() => handleAddSentence(gameIndex)}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Add Sentence
                            </Button>
                        </div>
                    )}
                    {game.type === 'MathRunner' && (
                        <div className="space-y-4">
                            {(game.problems || []).map((problem, problemIndex) => (
                                <div key={problem.id} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4 items-end p-4 border rounded-md bg-secondary/50">
                                    <div className="space-y-1.5">
                                        <Label htmlFor={`question-${problem.id}`}>Question (e.g., 5+3)</Label>
                                        <Input id={`question-${problem.id}`} value={problem.question} onChange={(e) => handleProblemChange(gameIndex, problemIndex, 'question', e.target.value)} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor={`answer-${problem.id}`}>Answer (e.g., 8)</Label>
                                        <Input id={`answer-${problem.id}`} type="number" value={problem.answer} onChange={(e) => handleProblemChange(gameIndex, problemIndex, 'answer', e.target.value)} />
                                    </div>
                                    <Button type="button" variant="destructive" size="icon" onClick={() => handleRemoveProblem(gameIndex, problemIndex)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            <Button type="button" variant="outline" onClick={() => handleAddProblem(gameIndex)}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Add Problem
                            </Button>
                        </div>
                    )}
                     {game.type === 'PatternDetective' && (
                        <div className="space-y-4">
                        {(game.patterns || []).map((pattern, patternIndex) => (
                            <div key={pattern.id} className="p-4 border rounded-md bg-secondary/50 space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-end">
                                    <div className="space-y-1.5">
                                        <Label htmlFor={`sequence-${pattern.id}`}>Sequence (comma separated)</Label>
                                        <Input id={`sequence-${pattern.id}`} value={(pattern.sequence || []).join(', ')} onChange={(e) => handlePatternChange(gameIndex, patternIndex, 'sequence', e.target.value)} placeholder="e.g., 2, 4, 6" />
                                    </div>
                                    <Button type="button" variant="destructive" size="icon" onClick={() => handleRemovePattern(gameIndex, patternIndex)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <div className="space-y-1.5">
                                        <Label htmlFor={`options-${pattern.id}`}>Options (comma separated)</Label>
                                        <Input id={`options-${pattern.id}`} value={(pattern.options || []).join(', ')} onChange={(e) => handlePatternChange(gameIndex, patternIndex, 'options', e.target.value)} placeholder="e.g., 8, 9, 10"/>
                                    </div>
                                     <div className="space-y-1.5">
                                        <Label htmlFor={`correct-answer-${pattern.id}`}>Correct Answer</Label>
                                        <Input id={`correct-answer-${pattern.id}`} value={pattern.correctAnswer} onChange={(e) => handlePatternChange(gameIndex, patternIndex, 'correctAnswer', e.target.value)} placeholder="e.g., 8"/>
                                    </div>
                                 </div>
                            </div>
                        ))}
                        <Button type="button" variant="outline" onClick={() => handleAddPattern(gameIndex)}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Pattern
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
        )}
    </div>
  );
}
