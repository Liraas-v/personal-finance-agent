# Superfícies e bordas (hex arbitrário -> token)
s/bg-\[#0a0a0f\]/bg-background/g
s/bg-\[#0a0a12\]/bg-background/g
s/bg-\[#0f0f17\]/bg-card/g
s/bg-\[#(1e1e2e|252535|2a2a3e)\]/bg-muted/g
s/border-\[#1e1e2e\]/border-border/g
s/border-\[#(2a2a3e|3a3a5e)\]/border-border-strong/g

# Texto neutro
s/text-slate-(100|200)\b/text-foreground/g
s/text-slate-(300|400)\b/text-foreground-secondary/g
s/text-slate-(500|600|700)\b/text-muted-foreground/g

# Acento (violeta/índigo/azul -> primary)
s/hover:bg-(violet|indigo|purple)-[0-9]+/hover:bg-primary\/90/g
s/bg-(violet|indigo|purple)-(800|900|950)(\/[0-9]+)?/bg-primary\/10/g
s/bg-(violet|indigo|purple)-[0-9]+(\/[0-9]+)?/bg-primary\2/g
s/text-(violet|indigo|purple|sky|blue|cyan)-[0-9]+/text-primary/g
s/border-(violet|indigo|purple|sky|blue|cyan)-[0-9]+(\/[0-9]+)?/border-primary\/40/g
s/(ring|outline|fill|stroke|divide)-(violet|indigo|purple)-[0-9]+/\1-primary/g

# Semânticas
s/(bg|border)-(emerald|green)-[0-9]+(\/[0-9]+)?/\1-positive\3/g
s/text-(emerald|green)-[0-9]+/text-positive/g
s/(bg|border)-(rose|red)-[0-9]+(\/[0-9]+)?/\1-negative\3/g
s/text-(rose|red)-[0-9]+/text-negative/g
s/(bg|border)-(amber|yellow|orange)-[0-9]+(\/[0-9]+)?/\1-warning\3/g
s/text-(amber|yellow|orange)-[0-9]+/text-warning/g

# Forma e tipografia
s/rounded-(xl|2xl|3xl)\b/rounded-lg/g
s/text-\[(9|10|11)px\]/text-xs/g
