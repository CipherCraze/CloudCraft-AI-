import sys
file_path = "c:/Users/tharu/hackathons/CloudCraft AI/CloudCraft-AI-1/frontend/src/routes/_authenticated/vernacular/index.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

prefix = content.split("    return (")[0]

result_start = content.find("{/* RESULT VIEW: Elite Asset Studio */}")
result_end = content.find("{/* Initial Empty State */}")

result_block = content[result_start:result_end]
# Strip the top separator margin
result_block = result_block.replace("pt-12 mt-8 border-t border-border/40 relative", "relative")

new_return = """    return (
        <div className="flex flex-col h-screen bg-background overflow-hidden text-foreground">
            <Header className="shrink-0 border-b border-border/40 bg-background/95 backdrop-blur px-4 lg:px-6">
                <div className="flex items-center gap-4"><TopNav links={topNav} /></div>
                <div className="ml-auto flex items-center space-x-4">
                    <ThemeSwitch /><ProfileDropdown />
                </div>
            </Header>

            <main className="flex-1 flex overflow-hidden">
                {/* LEFT PANEL: CONFIGURATOR */}
                <div className="w-full lg:w-[420px] xl:w-[480px] shrink-0 border-r border-border/40 bg-card/10 flex flex-col relative z-20 shadow-2xl">
                    <ScrollArea className="flex-1">
                        <div className="p-6 pb-32 space-y-10 mt-4">
                            <div>
                                <div className="inline-flex items-center px-2 py-0.5 rounded-full border border-primary/20 bg-primary/10 text-primary text-[9px] font-bold mb-3 uppercase tracking-widest gap-2">
                                    <span className="relative flex h-1.5 w-1.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
                                    </span>
                                    Agentic Swarm Protocol
                                </div>
                                <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                                    Project <span className="text-primary font-serif italic">Vernacular</span>
                                </h1>
                                <p className="text-xs text-muted-foreground mt-2 font-medium leading-relaxed">
                                    Synthesize regional identities and transcreate brand messages into 15+ Indian dialects with hyper-local socio-cultural intelligence.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-md bg-primary/20 text-primary flex items-center justify-center">1</div>
                                    Brand Directive
                                </h3>
                                <Card className="border-border/60 bg-secondary/10 shadow-inner overflow-hidden">
                                    <div className="flex flex-col">
                                        <Textarea
                                            placeholder="Enter the core brand message or copy here..."
                                            className="min-h-[140px] resize-none bg-transparent border-0 focus-visible:ring-0 text-sm font-medium leading-relaxed placeholder:text-muted-foreground/30 p-5 w-full"
                                            value={content}
                                            onChange={(e) => setContent(e.target.value)}
                                        />
                                        <div className="p-3 border-t border-border/40 bg-black/5 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-secondary/80 border border-border/50 flex items-center justify-center">
                                                    <ImagePlus className="w-4 h-4 text-muted-foreground" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-foreground">Visual Context</p>
                                                    <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Shield className="w-3 h-3 text-emerald-500"/> AWS Rekognition</p>
                                                </div>
                                            </div>
                                            {imagePreview ? (
                                                <div className="relative group rounded-md overflow-hidden border border-border/50 w-12 h-12 shrink-0">
                                                    <img src={imagePreview} alt="Context" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer" onClick={() => setImagePreview(null)}>
                                                        <X className="w-4 h-4 text-white" />
                                                    </div>
                                                </div>
                                            ) : (
                                                <label className="cursor-pointer border border-dashed border-border/80 hover:border-primary/50 hover:bg-primary/5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors text-muted-foreground hover:text-primary">
                                                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                                    Browse
                                                </label>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-md bg-primary/20 text-primary flex items-center justify-center">2</div>
                                        Territory Sync
                                    </h3>
                                    {selectedState && (
                                        <Badge variant="outline" className="text-[10px] font-mono bg-primary/10 text-primary border-primary/20 p-0 px-2 h-5">
                                            {selectedState.toUpperCase()}
                                        </Badge>
                                    )}
                                </div>
                                <Card className="border-border/60 bg-secondary/10 shadow-inner p-1 overflow-hidden relative">
                                    <div className="relative bg-slate-950/40 rounded-[10px] overflow-hidden min-h-[400px] flex items-center justify-center">
                                        <IndiaMap
                                            activeState={selectedState}
                                            onSelectState={(state) => {
                                                setSelectedState(state);
                                            }}
                                        />
                                    </div>
                                    {selectedState && (
                                        <div className="absolute bottom-3 left-3 right-3 p-3 bg-black/80 backdrop-blur-xl rounded-xl border border-white/10 flex gap-3 shadow-2xl animate-in slide-in-from-bottom-2">
                                            {REGION_IMAGES[selectedState] && (
                                                <div className="w-10 h-10 shrink-0 rounded-lg overflow-hidden border border-white/20">
                                                    <img src={REGION_IMAGES[selectedState]} alt={selectedState} className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest leading-none mb-1">Aesthetic Sync</p>
                                                <p className="text-[11px] text-white/90 font-medium truncate">"{activeVisuals.imageDesc}"</p>
                                            </div>
                                        </div>
                                    )}
                                </Card>
                            </div>
                        </div>
                    </ScrollArea>

                    <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-background via-background/90 to-transparent pt-12">
                        <Button
                            className={cn(
                                "w-full h-14 rounded-2xl font-black uppercase tracking-[0.2em] transition-all duration-300 text-xs shadow-xl group overflow-hidden relative",
                                selectedState && content ? "bg-primary text-primary-foreground hover:scale-[1.02] active:scale-[0.98]" : "bg-secondary/50 text-muted-foreground border border-border"
                            )}
                            onClick={handleTransmute}
                            disabled={isTransmuting || (!content.trim()) || !selectedState}
                        >
                            {isTransmuting ? (
                                <><Loader2 className="w-5 h-5 mr-3 animate-spin" /> SYNTHESIZING PIPELINE...</>
                            ) : (
                                <>
                                    <span className="relative z-10 flex items-center"><Zap className="w-5 h-5 mr-3 group-hover:animate-bounce" /> INITIALIZE LAUNCH</span>
                                    {selectedState && content && <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none" />}
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* RIGHT PANEL: STAGE (RESULTS & TELEMETRY) */}
                <div className="flex-1 bg-slate-950/20 relative overflow-hidden flex flex-col">
                    <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '32px 32px' }} />
                    
                    {/* Dynamic Background Glow based on state */}
                    {selectedState && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] blur-[200px] rounded-full pointer-events-none transition-all duration-1000 opacity-20 mix-blend-screen" style={{ backgroundColor: activeVisuals.color }} />}
                    
                    <ScrollArea className="flex-1 relative z-10 w-full h-full">
                        <div className="p-8 md:p-12 lg:p-16 max-w-[1200px] mx-auto min-h-full flex flex-col justify-center">

                            {/* EMPTY STATE */}
                            {!result && !isTransmuting && (
                                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30 animate-pulse my-auto py-32">
                                    <div className="w-24 h-24 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center mb-8 shadow-inner relative">
                                        <Globe className="w-12 h-12 text-primary/50" />
                                        <div className="absolute inset-0 border border-primary/20 rounded-full animate-ping" />
                                    </div>
                                    <h3 className="text-3xl font-black uppercase tracking-[0.4em] text-foreground font-mono">Pipeline Offline</h3>
                                    <p className="text-[11px] font-bold text-muted-foreground mt-4 uppercase tracking-[0.2em] max-w-sm leading-loose">
                                        Configure brand directive <br/> and lock a territory on the map.
                                    </p>
                                </div>
                            )}

                            {/* LOADING / TELEMETRY STATE */}
                            {isTransmuting && (
                                <div className="flex-1 flex flex-col justify-center max-w-3xl mx-auto w-full py-20">
                                    <div className="text-center mb-10">
                                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6 relative">
                                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                            <div className="absolute inset-0 border-2 border-primary/20 rounded-2xl animate-pulse" />
                                        </div>
                                        <h2 className="text-2xl font-black uppercase tracking-widest text-primary font-mono">
                                            Swarm Synthesis Active
                                        </h2>
                                        <p className="text-sm font-medium text-muted-foreground mt-3 uppercase tracking-widest">Compiling cultural intelligence for {selectedState}</p>
                                    </div>
                                    
                                    <Card className="border-primary/20 bg-slate-950/90 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(var(--primary),0.1)] backdrop-blur-xl">
                                        <div className="flex items-center justify-between px-5 py-4 border-b border-primary/20 bg-primary/10">
                                            <div className="flex items-center gap-2">
                                                <Activity className="w-4 h-4 text-primary animate-pulse" />
                                                <span className="text-[11px] font-mono font-bold text-primary uppercase tracking-widest">Agent_Telemetry.stream</span>
                                            </div>
                                            <Badge variant="outline" className="bg-black/50 border-primary/30 text-primary animate-pulse text-[10px]">LIVE</Badge>
                                        </div>
                                        <ScrollArea className="h-[350px] p-6 font-mono text-[13px] text-primary/80 leading-relaxed shadow-inner">
                                            <div className="space-y-4">
                                                {logs.map((log, i) => (
                                                    <div key={i} className="flex gap-4 border-l-2 border-primary/30 pl-4 animate-in fade-in slide-in-from-left-2 shadow-sm bg-primary/5 rounded-r-lg py-3 pr-4 group hover:bg-primary/10 transition-colors">
                                                        <span className="text-primary/40 shrink-0 font-bold opacity-50">[{i.toString().padStart(2, '0')}]</span>
                                                        <p className={cn(log.includes("Error") ? "text-red-400" : "")}>{log}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                    </Card>
                                </div>
                            )}
"""

final_return = new_return + "\n" + result_block + """
                        </div>
                    </ScrollArea>
                </div>
            </main>
        </div>
    );
}
"""

with open(file_path, "w", encoding="utf-8") as f:
    f.write(prefix + final_return)
