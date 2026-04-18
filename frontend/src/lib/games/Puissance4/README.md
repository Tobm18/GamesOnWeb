# 🎮 Puissance 4 - Jeu DOM

Un jeu Puissance 4 interactif et jouable en ligne (7×6) où vous affrontez un Bot avec 5 niveaux de difficulté progressifs.

## 📋 Fonctionnalités

✅ **Grille 7×6** affichée en DOM avec animation  
✅ **5 niveaux de difficulté** (Débutant → Maître)  
✅ **Système de scoring** basé sur la rapidité et le niveau  
✅ **Bot adaptatif** (aléatoire, défensive, stratégique, minimax)  
✅ **Thème GitHub** moderne et dark  
✅ **Timer** de 30 secondes par coup  
✅ **Animations fluides** des pions

## 🚀 Démarrage Rapide

```bash
# Ouvrir simplement index.html dans votre navigateur
open index.html
```

## 📁 Structure du Projet

```
Puissance4/
├── README.md              # Ce fichier
├── index.html             # Page principale
├── css/
│   └── styles.css         # Styles du jeu
└── js/
    ├── main.js            # Point d'entrée
    ├── entities/
    │   ├── Board.js       # Modèle de la grille
    │   ├── Player.js      # Classe joueur
    │   └── Bot.js          # Classe Bot avec stratégies
    ├── managers/
    │   ├── GameManager.js # Gestion du flux de jeu
    │   ├── UIManager.js   # Gestion de l'affichage
    │   └── ScoreManager.js# Gestion du scoring
    └── utils/
        ├── constants.js   # Constantes du jeu
        └── helpers.js     # Fonctions utilitaires
```

## 🎮 Comment Jouer

1. **Cliquer sur une colonne** pour y placer votre pion rouge
2. **Aligner 4 pions** (horizontal, vertical ou diagonal) pour gagner
3. **Timer de 30s** pour jouer - plus rapide = plus de points bonus!

## 🏆 Système de Scoring

```
Score = (Score_Base + Bonus_Rapidité) × Multiplicateur_Niveau

Score_Base (victoire) = 1000 points
Bonus_Rapidité = (30 - Temps_Coup) / 100
Multiplicateurs: 1 (Débutant) → 1.5 → 2 → 3 → 5 (Maître)

Exemple: Victoire en 15s au Niveau 5 = (1000 + 15) × 5 = 5075 pts
```

## 🤖 Niveaux de Bot

| Niveau | Nom | Stratégie |
|--------|-----|-----------|
| 1 | Débutant | Coups aléatoires |
| 2 | Amateur | Défense basique |
| 3 | Confirmé | Stratégie mixte |
| 4 | Expert | Minimax (3 coups) |
| 5 | Maître | Minimax (5 coups) |

## 🛠️ Technologies

- **HTML5** - Structure
- **CSS3** - Animations et thème GitHub
- **JavaScript** - Logique du jeu

## 📱 Responsive

- ✅ Mobile (< 600px)
- ✅ Tablette (600-1024px)
- ✅ Desktop (> 1024px)

## 🎨 Thème

Le jeu utilise les couleurs officielles de GitHub:
- **Fond**: #0d1117
- **Pion Joueur**: #f85149 (rouge)
- **Pion Bot**: #58a6ff (bleu)
- **Accent**: #3fb950 (vert)

---

**Amusez-vous bien! 🎮**
