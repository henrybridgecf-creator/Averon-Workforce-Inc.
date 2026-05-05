'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Brain, Loader2, CheckCircle2, AlertCircle, TrendingUp, ShieldCheck, ChevronRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { GoogleGenAI } from '@google/genai'

interface AIAnalysisProps {
    project: any;
    onRecommendation: (recommendation: 'approve' | 'requires-edits' | 'reject') => void;
}

export function ProjectAIAnalysis({ project, onRecommendation }: AIAnalysisProps) {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<any>(null);

    const runAnalysis = async () => {
        if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
            console.error("Gemini API key is missing in environment.");
            return;
        }

        setIsAnalyzing(true);
        try {
            const ai = new GoogleGenAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);
            const model = ai.getGenerativeModel({ 
                model: "gemini-2.0-flash",
                generationConfig: {
                    responseMimeType: "application/json",
                }
            });
            
            const prompt = `Analyze this project submission for AverPay Portal.
            Project Title: ${project.title}
            Project Description: ${project.description}
            Current Status: ${project.status}
            Submission Content: ${project.submittedData || 'No specific text submitted'}
            User Feedback: ${project.userFeedback || 'None'}
            Rejection History: ${project.declineReason || 'None'}

            Evaluate against enterprise standards. Provide:
            1. Recommendation: approve, requires-edits, or reject.
            2. Confidence Score (0-100).
            3. Detailed Reasoning.
            4. Key Findings (at least 3).
            5. Suggested Rejection/Edits Message (if applicable).

            Return as JSON format matching: { recommendation: string, confidence: number, reasoning: string, findings: string[], message?: string }`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            
            const jsonStr = text.replace(/```json|```/g, '').trim();
            let parsed;
            try {
                parsed = JSON.parse(jsonStr);
            } catch (pErr) {
                console.error("Failed to parse AI JSON:", text);
                // Fallback attempt: look for JSON-like structure
                const match = text.match(/\{[\s\S]*\}/);
                if (match) {
                    parsed = JSON.parse(match[0]);
                } else {
                    throw new Error("Invalid AI response format");
                }
            }

            // Normalize recommendation
            if (parsed.recommendation === 'request-edits' || parsed.recommendation === 'request_edits') {
                parsed.recommendation = 'requires-edits';
            }

            setAnalysisResult(parsed);
        } catch (error) {
            console.error("AI Analysis failed:", error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    if (!analysisResult && !isAnalyzing) {
        return (
            <Button 
                onClick={runAnalysis}
                className="h-12 px-6 rounded-2xl bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 text-[10px] font-black uppercase tracking-[0.2em] gap-3 group/ai shadow-lg shadow-primary/10 transition-all active:scale-95"
            >
                <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                    <Brain className="h-4 w-4" />
                </motion.div>
                Initialize AI Audit Terminal
            </Button>
        );
    }

    return (
        <div className="space-y-4">
            <AnimatePresence mode="wait">
                {isAnalyzing ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-6 rounded-[2rem] bg-primary/5 border border-primary/10 flex flex-col items-center gap-4"
                    >
                        <div className="relative">
                            <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                className="h-16 w-16 rounded-full border-2 border-dashed border-primary/30"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Loader2 className="h-6 w-6 text-primary animate-spin" />
                            </div>
                        </div>
                        <div className="text-center">
                            <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] animate-pulse">Syncing Neural Networks</p>
                            <p className="text-[8px] text-muted-foreground font-bold uppercase tracking-widest mt-1">CROSS-REFERENCING OPERATION DATA</p>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-6 rounded-[2rem] bg-white/[0.03] border border-white/[0.05] backdrop-blur-xl relative overflow-hidden group/card shadow-2xl"
                    >
                        {/* Audit Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                    <Sparkles className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-black text-white uppercase tracking-widest">Audit Terminal</h4>
                                    <p className="text-[8px] text-muted-foreground font-black uppercase tracking-widest leading-none">NEURAL ANALYSIS V2.4</p>
                                </div>
                            </div>
                            <Badge className={`rounded-lg px-3 py-1 text-[9px] font-black uppercase tracking-[0.15em] shadow-lg ${
                                analysisResult.recommendation === 'approve' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                                analysisResult.recommendation === 'reject' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                                'bg-amber-500/20 text-amber-400 border-amber-500/30'
                            }`}>
                                {analysisResult.recommendation}
                            </Badge>
                        </div>

                        {/* Confidence Score */}
                        <div className="space-y-2 mb-8">
                            <div className="flex justify-between items-end">
                                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Confidence Index</span>
                                <span className={`text-xl font-black italic ${
                                    analysisResult.confidence > 80 ? 'text-green-400' :
                                    analysisResult.confidence > 50 ? 'text-amber-400' : 'text-red-400'
                                }`}>
                                    {analysisResult.confidence}%
                                </span>
                            </div>
                            <Progress value={analysisResult.confidence} className="h-2 bg-white/5" />
                        </div>

                        {/* Findings */}
                        <div className="space-y-3 mb-8">
                            <Label className="text-[10px] font-black text-primary/70 uppercase tracking-widest block mb-1">Critical Findings</Label>
                            {analysisResult.findings.map((finding: string, idx: number) => (
                                <div key={idx} className="flex gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] group/finding hover:bg-white/[0.05] transition-all">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-primary/40 shrink-0 group-hover/finding:text-primary transition-colors" />
                                    <p className="text-[10px] font-bold text-white/80 leading-relaxed uppercase tracking-tight">{finding}</p>
                                </div>
                            ))}
                        </div>

                        {/* Reasoning */}
                        <div className="space-y-2 mb-8">
                            <Label className="text-[10px] font-black text-primary/70 uppercase tracking-widest block mb-1">Executive Summary</Label>
                            <p className="text-[11px] font-medium text-muted-foreground leading-relaxed italic bg-white/[0.02] p-4 rounded-2xl border border-white/[0.05]">
                                "{analysisResult.reasoning}"
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <Button 
                                variant="outline"
                                onClick={() => setAnalysisResult(null)}
                                className="flex-1 h-12 rounded-xl border-white/5 bg-white/5 text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                            >
                                Re-Scan
                            </Button>
                            <Button 
                                onClick={() => onRecommendation(analysisResult.recommendation)}
                                className={`flex-[2] h-12 rounded-xl text-black text-[9px] font-black uppercase tracking-widest shadow-2xl transition-all active:scale-95 ${
                                    analysisResult.recommendation === 'approve' ? 'bg-green-400 hover:bg-green-300 shadow-green-500/20' :
                                    analysisResult.recommendation === 'reject' ? 'bg-red-400 hover:bg-red-300 shadow-red-500/20' :
                                    'bg-amber-400 hover:bg-amber-300 shadow-amber-500/20'
                                }`}
                            >
                                Execute {analysisResult.recommendation}
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
