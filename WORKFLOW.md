# WORKFLOW.md - Comprehensive Implementation Guide for AI Agents

## 🎯 Project Overview

**Project Name:** Pokémon Team Composition Recommender + Usage Rate Predictor  
**Goal:** Build an intelligent system that recommends optimal Pokémon teams based on playstyle and predicts competitive usage rates  
**Tech Stack:** Next.js, React, TypeScript, Three.js, Python (scikit-learn, pandas)  
**Timeline:** 3-4 weeks  

---

## 📋 Table of Contents

1. [Environment Setup](#1-environment-setup)
2. [Data Collection](#2-data-collection)
3. [Data Processing](#3-data-processing)
4. [Feature Engineering](#4-feature-engineering)
5. [Model Development - Team Recommender](#5-model-development---team-recommender)
6. [Model Development - Usage Predictor](#6-model-development---usage-predictor)
7. [Frontend Setup](#7-frontend-setup)
8. [API Development](#8-api-development)
9. [UI Components](#9-ui-components)
10. [Three.js Visualizations](#10-threejs-visualizations)
11. [Integration & Testing](#11-integration--testing)
12. [Documentation](#12-documentation)
13. [Deployment](#13-deployment)

---

## 1. Environment Setup

### 1.1 Initialize Project Structure

**Command:**
```bash
# Create main project directory
mkdir pokemon-team-builder
cd pokemon-team-builder

# Create folder structure
mkdir -p data/raw/smogon_stats
mkdir -p data/processed
mkdir -p python/scripts
mkdir -p python/models
mkdir -p python/api
mkdir -p public/sprites
mkdir -p docs

# Initialize Git
git init
```

**Create `.gitignore`:**
```
node_modules/
.next/
out/
build/
.env
.env.local
.env.production
venv/
__pycache__/
*.pyc
.DS_Store
data/raw/
*.log
.vercel
```

---

### 1.2 Python Environment Setup

**Command:**
```bash
# Create virtual environment
python3 -m venv venv

# Activate (Linux/Mac)
source venv/bin/activate

# Activate (Windows)
venv\Scripts\activate

# Install dependencies
pip install pandas numpy scikit-learn requests beautifulsoup4 matplotlib seaborn joblib flask flask-cors
```

**Create `requirements.txt`:**
```txt
pandas==2.0.3
numpy==1.24.3
scikit-learn==1.3.0
requests==2.31.0
beautifulsoup4==4.12.2
matplotlib==3.7.2
seaborn==0.12.2
joblib==1.3.2
flask==2.3.3
flask-cors==4.0.0
```

---

### 1.3 Next.js Frontend Setup

**Command:**
```bash
# Initialize Next.js with TypeScript and Tailwind
npx create-next-app@latest . --typescript --tailwind --app

# Install additional dependencies
npm install three @react-three/fiber @react-three/drei animejs
npm install recharts zustand
npm install -D @types/three
```

**File: `package.json` (verify these are included):**
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "three": "^0.160.0",
    "@react-three/fiber": "^8.15.0",
    "@react-three/drei": "^9.92.0",
    "animejs": "^3.2.1",
    "recharts": "^2.10.0",
    "zustand": "^4.4.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/three": "^0.160.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.0.0",
    "postcss": "^8.0.0"
  }
}
```

---

## 2. Data Collection

### 2.1 Download Static Datasets

**Manual Downloads:**

1. **Kaggle Pokémon Dataset:**
   - URL: https://www.kaggle.com/datasets/rounakbanik/pokemon
   - Download `pokemon.csv`
   - Save to: `data/raw/pokemon.csv`

2. **Smogon Usage Stats (Last 6 months):**
   - Base URL: https://www.smogon.com/stats/
   - Download for each month:
     - `YYYY-MM/gen9ou-1500.txt`
     - `YYYY-MM/moveset/gen9ou-1500.txt`
   - Save to: `data/raw/smogon_stats/YYYY-MM/`

---

### 2.2 Fetch PokéAPI Data

**File: `python/scripts/fetch_pokeapi_data.py`**

```python
import requests
import json
import time
from typing import Dict, List

def fetch_pokemon_data(pokemon_id: int) -> Dict:
    """Fetch data for a single Pokémon from PokéAPI."""
    url = f"https://pokeapi.co/api/v2/pokemon/{pokemon_id}"
    response = requests.get(url)
    
    if response.status_code == 200:
        data = response.json()
        
        return {
            "id": data["id"],
            "name": data["name"],
            "types": [t["type"]["name"] for t in data["types"]],
            "stats": {
                stat["stat"]["name"]: stat["base_stat"]
                for stat in data["stats"]
            },
            "abilities": [a["ability"]["name"] for a in data["abilities"]],
            "height": data["height"],
            "weight": data["weight"],
            "sprite": data["sprites"]["front_default"]
        }
    return None

def fetch_all_pokemon(max_id: int = 1010) -> List[Dict]:
    """Fetch data for all Pokémon up to max_id."""
    pokemon_list = []
    
    for i in range(1, max_id + 1):
        print(f"Fetching Pokémon {i}/{max_id}...")
        data = fetch_pokemon_data(i)
        
        if data:
            pokemon_list.append(data)
        
        # Rate limiting - be nice to the API
        time.sleep(0.5)
    
    return pokemon_list

def fetch_move_data(move_name: str) -> Dict:
    """Fetch data for a specific move."""
    url = f"https://pokeapi.co/api/v2/move/{move_name}"
    response = requests.get(url)
    
    if response.status_code == 200:
        data = response.json()
        return {
            "name": data["name"],
            "type": data["type"]["name"],
            "power": data["power"],
            "accuracy": data["accuracy"],
            "pp": data["pp"],
            "damage_class": data["damage_class"]["name"],
            "effect": data["effect_entries"][0]["short_effect"] if data["effect_entries"] else ""
        }
    return None

def main():
    print("Starting PokéAPI data collection...")
    
    # Fetch all Pokémon
    pokemon_data = fetch_all_pokemon(max_id=1010)
    
    # Save to JSON
    with open("data/raw/pokemon_api.json", "w") as f:
        json.dump(pokemon_data, f, indent=2)
    
    print(f"Successfully fetched data for {len(pokemon_data)} Pokémon")

if __name__ == "__main__":
    main()
```

**Run:**
```bash
python python/scripts/fetch_pokeapi_data.py
```

---

### 2.3 Parse Smogon Usage Stats

**File: `python/scripts/parse_smogon_stats.py`**

```python
import re
import pandas as pd
from pathlib import Path

def parse_usage_file(filepath: str) -> pd.DataFrame:
    """Parse a Smogon usage statistics file."""
    with open(filepath, 'r') as f:
        lines = f.readlines()
    
    # Find the data section (after the separator line)
    data_start = None
    for i, line in enumerate(lines):
        if '+----' in line and '|' in lines[i+1]:
            data_start = i + 2  # Skip header row
            break
    
    if not data_start:
        return pd.DataFrame()
    
    records = []
    for line in lines[data_start:]:
        if '+----' in line:  # End of data
            break
        
        # Parse line format: | Rank | Pokemon | Usage % | ...
        match = re.search(r'\|\s*(\d+)\s*\|\s*([^|]+)\s*\|\s*([\d.]+)%', line)
        if match:
            rank, pokemon, usage = match.groups()
            records.append({
                'rank': int(rank),
                'pokemon': pokemon.strip(),
                'usage_percent': float(usage)
            })
    
    return pd.DataFrame(records)

def parse_all_months(stats_dir: str) -> pd.DataFrame:
    """Parse usage stats for all available months."""
    stats_path = Path(stats_dir)
    all_data = []
    
    for month_dir in sorted(stats_path.iterdir()):
        if month_dir.is_dir():
            month = month_dir.name
            usage_file = month_dir / "gen9ou-1500.txt"
            
            if usage_file.exists():
                print(f"Parsing {month}...")
                df = parse_usage_file(str(usage_file))
                df['month'] = month
                all_data.append(df)
    
    return pd.concat(all_data, ignore_index=True)

def main():
    print("Parsing Smogon usage statistics...")
    
    # Parse all monthly data
    usage_df = parse_all_months("data/raw/smogon_stats")
    
    # Save to CSV
    usage_df.to_csv("data/processed/usage_history.csv", index=False)
    
    print(f"Parsed data for {len(usage_df)} records across {usage_df['month'].nunique()} months")

if __name__ == "__main__":
    main()
```

**Run:**
```bash
python python/scripts/parse_smogon_stats.py
```

---

### 2.4 Create Type Effectiveness Matrix

**File: `python/scripts/create_type_chart.py`**

```python
import json
import numpy as np

# Type effectiveness chart
TYPES = [
    "normal", "fire", "water", "electric", "grass", "ice",
    "fighting", "poison", "ground", "flying", "psychic", "bug",
    "rock", "ghost", "dragon", "dark", "steel", "fairy"
]

def create_type_effectiveness_matrix():
    """Create 18x18 type effectiveness matrix."""
    # Initialize with neutral (1.0)
    matrix = np.ones((18, 18))
    
    # Define type effectiveness (attacking_type: {defending_type: multiplier})
    effectiveness = {
        "normal": {"rock": 0.5, "ghost": 0, "steel": 0.5},
        "fire": {"fire": 0.5, "water": 0.5, "grass": 2, "ice": 2, "bug": 2, "rock": 0.5, "dragon": 0.5, "steel": 2},
        "water": {"fire": 2, "water": 0.5, "grass": 0.5, "ground": 2, "rock": 2, "dragon": 0.5},
        "electric": {"water": 2, "electric": 0.5, "grass": 0.5, "ground": 0, "flying": 2, "dragon": 0.5},
        "grass": {"fire": 0.5, "water": 2, "grass": 0.5, "poison": 0.5, "ground": 2, "flying": 0.5, "bug": 0.5, "rock": 2, "dragon": 0.5, "steel": 0.5},
        "ice": {"fire": 0.5, "water": 0.5, "grass": 2, "ice": 0.5, "ground": 2, "flying": 2, "dragon": 2, "steel": 0.5},
        "fighting": {"normal": 2, "ice": 2, "poison": 0.5, "flying": 0.5, "psychic": 0.5, "bug": 0.5, "rock": 2, "ghost": 0, "dark": 2, "steel": 2, "fairy": 0.5},
        "poison": {"grass": 2, "poison": 0.5, "ground": 0.5, "rock": 0.5, "ghost": 0.5, "steel": 0, "fairy": 2},
        "ground": {"fire": 2, "electric": 2, "grass": 0.5, "poison": 2, "flying": 0, "bug": 0.5, "rock": 2, "steel": 2},
        "flying": {"electric": 0.5, "grass": 2, "fighting": 2, "bug": 2, "rock": 0.5, "steel": 0.5},
        "psychic": {"fighting": 2, "poison": 2, "psychic": 0.5, "dark": 0, "steel": 0.5},
        "bug": {"fire": 0.5, "grass": 2, "fighting": 0.5, "poison": 0.5, "flying": 0.5, "psychic": 2, "ghost": 0.5, "dark": 2, "steel": 0.5, "fairy": 0.5},
        "rock": {"fire": 2, "ice": 2, "fighting": 0.5, "ground": 0.5, "flying": 2, "bug": 2, "steel": 0.5},
        "ghost": {"normal": 0, "psychic": 2, "ghost": 2, "dark": 0.5},
        "dragon": {"dragon": 2, "steel": 0.5, "fairy": 0},
        "dark": {"fighting": 0.5, "psychic": 2, "ghost": 2, "dark": 0.5, "fairy": 0.5},
        "steel": {"fire": 0.5, "water": 0.5, "electric": 0.5, "ice": 2, "rock": 2, "steel": 0.5, "fairy": 2},
        "fairy": {"fire": 0.5, "fighting": 2, "poison": 0.5, "dragon": 2, "dark": 2, "steel": 0.5}
    }
    
    # Fill matrix
    for atk_type, defenses in effectiveness.items():
        atk_idx = TYPES.index(atk_type)
        for def_type, multiplier in defenses.items():
            def_idx = TYPES.index(def_type)
            matrix[atk_idx][def_idx] = multiplier
    
    return matrix

def save_type_chart():
    """Save type effectiveness chart to JSON."""
    matrix = create_type_effectiveness_matrix()
    
    # Convert to dictionary format
    chart = {}
    for i, atk_type in enumerate(TYPES):
        chart[atk_type] = {}
        for j, def_type in enumerate(TYPES):
            chart[atk_type][def_type] = float(matrix[i][j])
    
    # Save to JSON
    with open("data/processed/type_effectiveness.json", "w") as f:
        json.dump({
            "types": TYPES,
            "chart": chart
        }, f, indent=2)
    
    print("Type effectiveness chart created successfully")

if __name__ == "__main__":
    save_type_chart()
```

**Run:**
```bash
python python/scripts/create_type_chart.py
```

---

## 3. Data Processing

### 3.1 Clean and Merge Pokémon Data

**File: `python/scripts/clean_data.py`**

```python
import pandas as pd
import json

def clean_pokemon_data():
    """Clean and merge Pokémon data from multiple sources."""
    
    # Load Kaggle dataset
    kaggle_df = pd.read_csv("data/raw/pokemon.csv")
    
    # Load PokéAPI data
    with open("data/raw/pokemon_api.json", "r") as f:
        api_data = json.load(f)
    
    # Convert API data to DataFrame
    api_df = pd.DataFrame(api_data)
    
    # Standardize column names
    kaggle_df = kaggle_df.rename(columns={
        'pokedex_number': 'id',
        'attack': 'attack',
        'defense': 'defense',
        'sp_attack': 'special_attack',
        'sp_defense': 'special_defense',
        'hp': 'hp',
        'speed': 'speed'
    })
    
    # Remove alternate forms (keep only base forms for simplicity)
    kaggle_df = kaggle_df[~kaggle_df['name'].str.contains('Mega|Alolan|Galarian|Gigantamax', na=False)]
    
    # Calculate Base Stat Total (BST)
    stat_cols = ['hp', 'attack', 'defense', 'special_attack', 'special_defense', 'speed']
    kaggle_df['base_stat_total'] = kaggle_df[stat_cols].sum(axis=1)
    
    # Select relevant columns
    clean_df = kaggle_df[[
        'id', 'name', 'type1', 'type2',
        'hp', 'attack', 'defense', 'special_attack', 'special_defense', 'speed',
        'base_stat_total', 'height_m', 'weight_kg',
        'abilities', 'classfication', 'percentage_male'
    ]].copy()
    
    # Fill NaN values
    clean_df['type2'] = clean_df['type2'].fillna('')
    clean_df['height_m'] = clean_df['height_m'].fillna(clean_df['height_m'].median())
    clean_df['weight_kg'] = clean_df['weight_kg'].fillna(clean_df['weight_kg'].median())
    
    # Save cleaned data
    clean_df.to_csv("data/processed/pokemon_clean.csv", index=False)
    
    print(f"Cleaned data for {len(clean_df)} Pokémon")
    return clean_df

def merge_with_usage_data():
    """Merge Pokémon data with usage statistics."""
    
    # Load cleaned Pokémon data
    pokemon_df = pd.read_csv("data/processed/pokemon_clean.csv")
    
    # Load usage history
    usage_df = pd.read_csv("data/processed/usage_history.csv")
    
    # Normalize names for matching
    pokemon_df['name_normalized'] = pokemon_df['name'].str.lower().str.replace(' ', '')
    usage_df['name_normalized'] = usage_df['pokemon'].str.lower().str.replace(' ', '').str.replace('-', '')
    
    # Get latest month usage
    latest_month = usage_df['month'].max()
    latest_usage = usage_df[usage_df['month'] == latest_month]
    
    # Merge
    merged_df = pokemon_df.merge(
        latest_usage[['name_normalized', 'rank', 'usage_percent']],
        on='name_normalized',
        how='left'
    )
    
    # Fill missing usage with 0
    merged_df['usage_percent'] = merged_df['usage_percent'].fillna(0)
    merged_df['rank'] = merged_df['rank'].fillna(999)
    
    # Drop temporary column
    merged_df = merged_df.drop('name_normalized', axis=1)
    
    # Save
    merged_df.to_csv("data/processed/pokemon_with_usage.csv", index=False)
    
    print(f"Merged usage data for {len(merged_df)} Pokémon")
    return merged_df

if __name__ == "__main__":
    clean_pokemon_data()
    merge_with_usage_data()
```

**Run:**
```bash
python python/scripts/clean_data.py
```

---

## 4. Feature Engineering

### 4.1 Create Derived Features

**File: `python/scripts/feature_engineering.py`**

```python
import pandas as pd
import numpy as np
import json

def calculate_bulk_metrics(df: pd.DataFrame) -> pd.DataFrame:
    """Calculate physical and special bulk."""
    df['physical_bulk'] = df['hp'] * df['defense']
    df['special_bulk'] = df['hp'] * df['special_defense']
    df['overall_bulk'] = (df['physical_bulk'] + df['special_bulk']) / 2
    return df

def categorize_speed_tier(speed: int) -> str:
    """Categorize Pokémon by speed tier."""
    if speed >= 110:
        return "Very Fast"
    elif speed >= 80:
        return "Fast"
    elif speed >= 50:
        return "Medium"
    else:
        return "Slow"

def assign_role(row: pd.Series) -> str:
    """Assign competitive role based on stats."""
    atk = row['attack']
    sp_atk = row['special_attack']
    defense = row['defense']
    sp_def = row['special_defense']
    speed = row['speed']
    hp = row['hp']
    
    # Simple rule-based classification
    if speed >= 100 and max(atk, sp_atk) >= 100:
        return "Sweeper"
    elif hp >= 100 and min(defense, sp_def) >= 90:
        return "Tank"
    elif defense >= 110 or sp_def >= 110:
        return "Wall"
    elif max(atk, sp_atk) >= 90:
        return "Attacker"
    else:
        return "Support"

def calculate_offensive_score(row: pd.Series, type_chart: dict) -> float:
    """Calculate offensive coverage score."""
    types = [row['type1']]
    if row['type2']:
        types.append(row['type2'])
    
    # Count super effective hits
    super_effective_count = 0
    for atk_type in types:
        for def_type, multiplier in type_chart['chart'][atk_type].items():
            if multiplier == 2.0:
                super_effective_count += 1
    
    return super_effective_count / len(types)

def calculate_defensive_score(row: pd.Series, type_chart: dict) -> float:
    """Calculate defensive resistance score."""
    types = [row['type1']]
    if row['type2']:
        types.append(row['type2'])
    
    # Count resistances and weaknesses
    resistances = 0
    weaknesses = 0
    
    for atk_type in type_chart['types']:
        total_multiplier = 1.0
        for def_type in types:
            total_multiplier *= type_chart['chart'][atk_type][def_type]
        
        if total_multiplier < 1.0:
            resistances += 1
        elif total_multiplier > 1.0:
            weaknesses += 1
    
    return resistances - weaknesses

def engineer_features():
    """Create all engineered features."""
    
    # Load data
    df = pd.read_csv("data/processed/pokemon_with_usage.csv")
    
    # Load type chart
    with open("data/processed/type_effectiveness.json", "r") as f:
        type_chart = json.load(f)
    
    # Calculate bulk metrics
    df = calculate_bulk_metrics(df)
    
    # Categorize speed
    df['speed_tier'] = df['speed'].apply(categorize_speed_tier)
    
    # Assign roles
    df['role'] = df.apply(assign_role, axis=1)
    
    # Calculate offensive score
    df['offensive_score'] = df.apply(
        lambda row: calculate_offensive_score(row, type_chart), axis=1
    )
    
    # Calculate defensive score
    df['defensive_score'] = df.apply(
        lambda row: calculate_defensive_score(row, type_chart), axis=1
    )
    
    # Normalize stats (0-1 scale)
    stat_cols = ['hp', 'attack', 'defense', 'special_attack', 'special_defense', 'speed']
    for col in stat_cols:
        df[f'{col}_normalized'] = df[col] / df[col].max()
    
    # Create attack preference
    df['attack_preference'] = df.apply(
        lambda row: 'Physical' if row['attack'] > row['special_attack'] else 'Special',
        axis=1
    )
    
    # Save engineered features
    df.to_csv("data/processed/pokemon_features.csv", index=False)
    
    print(f"Feature engineering complete for {len(df)} Pokémon")
    print(f"\nRole distribution:")
    print(df['role'].value_counts())
    print(f"\nSpeed tier distribution:")
    print(df['speed_tier'].value_counts())
    
    return df

if __name__ == "__main__":
    engineer_features()
```

**Run:**
```bash
python python/scripts/feature_engineering.py
```

---

## 5. Model Development - Team Recommender

### 5.1 Define Playstyles

**File: `python/models/playstyles.py`**

```python
PLAYSTYLES = {
    "hyper_offense": {
        "name": "Hyper Offense",
        "description": "Fast, hard-hitting teams focused on overwhelming opponents quickly",
        "stat_weights": {
            "attack": 0.25,
            "special_attack": 0.25,
            "speed": 0.4,
            "hp": 0.05,
            "defense": 0.025,
            "special_defense": 0.025
        },
        "preferred_roles": ["Sweeper", "Attacker"],
        "min_speed_tier": "Fast",
        "team_composition": {
            "Sweeper": 3,
            "Attacker": 2,
            "Support": 1
        }
    },
    "balanced": {
        "name": "Balanced",
        "description": "Well-rounded teams with mix of offense and defense",
        "stat_weights": {
            "attack": 0.15,
            "special_attack": 0.15,
            "speed": 0.2,
            "hp": 0.2,
            "defense": 0.15,
            "special_defense": 0.15
        },
        "preferred_roles": ["Sweeper", "Tank", "Attacker", "Wall"],
        "min_speed_tier": "Medium",
        "team_composition": {
            "Sweeper": 2,
            "Tank": 1,
            "Attacker": 1,
            "Wall": 1,
            "Support": 1
        }
    },
    "stall": {
        "name": "Stall/Defensive",
        "description": "Defensive teams that outlast opponents through walls and recovery",
        "stat_weights": {
            "attack": 0.05,
            "special_attack": 0.05,
            "speed": 0.1,
            "hp": 0.3,
            "defense": 0.25,
            "special_defense": 0.25
        },
        "preferred_roles": ["Wall", "Tank", "Support"],
        "min_speed_tier": "Slow",
        "team_composition": {
            "Wall": 3,
            "Tank": 2,
            "Support": 1
        }
    },
    "weather_rain": {
        "name": "Rain Team",
        "description": "Teams built around rain weather, boosting Water moves and Swift Swim",
        "stat_weights": {
            "attack": 0.2,
            "special_attack": 0.3,
            "speed": 0.3,
            "hp": 0.1,
            "defense": 0.05,
            "special_defense": 0.05
        },
        "preferred_roles": ["Sweeper", "Attacker"],
        "required_types": ["water"],
        "min_speed_tier": "Fast",
        "team_composition": {
            "Sweeper": 3,
            "Attacker": 2,
            "Support": 1
        }
    },
    "trick_room": {
        "name": "Trick Room",
        "description": "Teams with slow, powerful Pokémon that thrive under Trick Room",
        "stat_weights": {
            "attack": 0.3,
            "special_attack": 0.3,
            "speed": -0.2,  # Prefer slower Pokémon
            "hp": 0.2,
            "defense": 0.1,
            "special_defense": 0.1
        },
        "preferred_roles": ["Tank", "Attacker"],
        "max_speed_tier": "Medium",
        "team_composition": {
            "Tank": 3,
            "Attacker": 2,
            "Support": 1
        }
    },
    "volt_turn": {
        "name": "Volt-Turn (Momentum)",
        "description": "Teams focused on maintaining momentum through pivoting moves",
        "stat_weights": {
            "attack": 0.2,
            "special_attack": 0.2,
            "speed": 0.3,
            "hp": 0.1,
            "defense": 0.1,
            "special_defense": 0.1
        },
        "preferred_roles": ["Sweeper", "Attacker", "Support"],
        "min_speed_tier": "Medium",
        "team_composition": {
            "Sweeper": 2,
            "Attacker": 2,
            "Support": 2
        }
    }
}

def get_playstyle(name: str) -> dict:
    """Get playstyle configuration by name."""
    return PLAYSTYLES.get(name, PLAYSTYLES["balanced"])

def get_all_playstyles() -> list:
    """Get list of all available playstyles."""
    return list(PLAYSTYLES.keys())
```

---

### 5.2 Team Recommendation Engine

**File: `python/models/team_recommender.py`**

```python
import pandas as pd
import numpy as np
from typing import List, Dict
import json
from playstyles import get_playstyle, PLAYSTYLES

class TeamRecommender:
    def __init__(self, pokemon_df: pd.DataFrame, type_chart: dict):
        self.pokemon_df = pokemon_df
        self.type_chart = type_chart
        
    def calculate_playstyle_score(self, pokemon: pd.Series, playstyle: dict) -> float:
        """Calculate how well a Pokémon fits a playstyle."""
        score = 0
        weights = playstyle['stat_weights']
        
        # Weighted stat score
        stat_cols = ['attack', 'defense', 'hp', 'special_attack', 'special_defense', 'speed']
        for stat in stat_cols:
            normalized_stat = pokemon[f'{stat}_normalized']
            weight = weights.get(stat, 0)
            score += normalized_stat * weight
        
        # Role preference bonus
        if pokemon['role'] in playstyle['preferred_roles']:
            score += 0.2
        
        # Speed tier requirement
        if 'min_speed_tier' in playstyle:
            speed_tiers = ["Slow", "Medium", "Fast", "Very Fast"]
            min_tier_idx = speed_tiers.index(playstyle['min_speed_tier'])
            pokemon_tier_idx = speed_tiers.index(pokemon['speed_tier'])
            if pokemon_tier_idx >= min_tier_idx:
                score += 0.1
        
        # Type requirement (for weather teams)
        if 'required_types' in playstyle:
            pokemon_types = [pokemon['type1'].lower()]
            if pokemon['type2']:
                pokemon_types.append(pokemon['type2'].lower())
            
            if any(req_type in pokemon_types for req_type in playstyle['required_types']):
                score += 0.3
        
        return score
    
    def calculate_team_coverage(self, team: List[pd.Series]) -> float:
        """Calculate type coverage of a team (0-1 scale)."""
        types_hit_super_effective = set()
        
        for pokemon in team:
            types = [pokemon['type1']]
            if pokemon['type2']:
                types.append(pokemon['type2'])
            
            for atk_type in types:
                for def_type, multiplier in self.type_chart['chart'][atk_type].items():
                    if multiplier == 2.0:
                        types_hit_super_effective.add(def_type)
        
        # Coverage score = types hit / total types
        return len(types_hit_super_effective) / len(self.type_chart['types'])
    
    def calculate_team_weaknesses(self, team: List[pd.Series]) -> Dict[str, int]:
        """Calculate shared weaknesses of a team."""
        weakness_count = {type_name: 0 for type_name in self.type_chart['types']}
        
        for pokemon in team:
            types = [pokemon['type1']]
            if pokemon['type2']:
                types.append(pokemon['type2'])
            
            for atk_type in self.type_chart['types']:
                total_multiplier = 1.0
                for def_type in types:
                    total_multiplier *= self.type_chart['chart'][atk_type][def_type]
                
                if total_multiplier > 1.0:
                    weakness_count[atk_type] += 1
        
        return weakness_count
    
    def calculate_synergy_score(self, team: List[pd.Series]) -> float:
        """Calculate overall team synergy."""
        if len(team) < 2:
            return 0
        
        # Coverage score (40%)
        coverage_score = self.calculate_team_coverage(team)
        
        # Weakness score (30%)
        weaknesses = self.calculate_team_weaknesses(team)
        max_weakness = max(weaknesses.values())
        weakness_penalty = max_weakness / len(team)  # Normalize
        weakness_score = 1 - min(weakness_penalty, 1)
        
        # Role diversity (30%)
        roles = [p['role'] for p in team]
        unique_roles = len(set(roles))
        role_score = min(unique_roles / 4, 1)  # Max 4 different roles is ideal
        
        synergy = (coverage_score * 0.4) + (weakness_score * 0.3) + (role_score * 0.3)
        return synergy
    
    def recommend_team(self, playstyle_name: str, team_size: int = 6) -> List[Dict]:
        """Recommend a team based on playstyle."""
        playstyle = get_playstyle(playstyle_name)
        composition = playstyle['team_composition']
        
        team = []
        used_pokemon = set()
        
        # For each role in composition
        for role, count in composition.items():
            # Get candidates for this role
            candidates = self.pokemon_df[
                (self.pokemon_df['role'] == role) & 
                (~self.pokemon_df['id'].isin(used_pokemon))
            ].copy()
            
            if len(candidates) == 0:
                continue
            
            # Score candidates
            candidates['playstyle_score'] = candidates.apply(
                lambda p: self.calculate_playstyle_score(p, playstyle), axis=1
            )
            
            # Select top candidates for this role
            top_candidates = candidates.nlargest(count, 'playstyle_score')
            
            for _, pokemon in top_candidates.iterrows():
                if len(team) < team_size:
                    team.append(pokemon)
                    used_pokemon.add(pokemon['id'])
        
        # Calculate team metrics
        synergy_score = self.calculate_synergy_score(team)
        coverage = self.calculate_team_coverage(team)
        weaknesses = self.calculate_team_weaknesses(team)
        
        # Format output
        return {
            'team': [
                {
                    'id': int(p['id']),
                    'name': p['name'],
                    'types': [p['type1'], p['type2']] if p['type2'] else [p['type1']],
                    'role': p['role'],
                    'stats': {
                        'hp': int(p['hp']),
                        'attack': int(p['attack']),
                        'defense': int(p['defense']),
                        'special_attack': int(p['special_attack']),
                        'special_defense': int(p['special_defense']),
                        'speed': int(p['speed'])
                    }
                }
                for p in team
            ],
            'analysis': {
                'synergy_score': round(synergy_score, 2),
                'coverage': round(coverage, 2),
                'weaknesses': {k: v for k, v in weaknesses.items() if v >= 3},
                'playstyle': playstyle['name']
            }
        }

def main():
    # Load data
    pokemon_df = pd.read_csv("data/processed/pokemon_features.csv")
    
    with open("data/processed/type_effectiveness.json", "r") as f:
        type_chart = json.load(f)
    
    # Initialize recommender
    recommender = TeamRecommender(pokemon_df, type_chart)
    
    # Test recommendations for each playstyle
    for playstyle_name in PLAYSTYLES.keys():
        print(f"\n{'='*50}")
        print(f"Testing {playstyle_name} playstyle")
        print('='*50)
        
        result = recommender.recommend_team(playstyle_name)
        
        print(f"\nRecommended Team:")
        for i, pokemon in enumerate(result['team'], 1):
            print(f"{i}. {pokemon['name']} ({pokemon['role']}) - {', '.join(pokemon['types'])}")
        
        print(f"\nTeam Analysis:")
        print(f"  Synergy Score: {result['analysis']['synergy_score']}")
        print(f"  Type Coverage: {result['analysis']['coverage']*100:.1f}%")
        print(f"  Major Weaknesses: {result['analysis']['weaknesses']}")

if __name__ == "__main__":
    main()
```

**Run:**
```bash
python python/models/team_recommender.py
```

---

## 6. Model Development - Usage Predictor

### 6.1 Time Series Preparation

**File: `python/models/prepare_timeseries.py`**

```python
import pandas as pd
import numpy as np
from datetime import datetime

def prepare_usage_timeseries():
    """Prepare usage data for time series modeling."""
    
    # Load usage history
    usage_df = pd.read_csv("data/processed/usage_history.csv")
    
    # Convert month to datetime
    usage_df['date'] = pd.to_datetime(usage_df['month'] + '-01')
    
    # Sort by pokemon and date
    usage_df = usage_df.sort_values(['pokemon', 'date'])
    
    # Create time series features
    usage_df['month_num'] = usage_df['date'].dt.month
    usage_df['days_since_start'] = (usage_df['date'] - usage_df['date'].min()).dt.days
    
    # Calculate usage change
    usage_df['usage_change'] = usage_df.groupby('pokemon')['usage_percent'].diff()
    usage_df['usage_change_pct'] = usage_df.groupby('pokemon')['usage_percent'].pct_change()
    
    # Create lag features (previous months)
    for lag in [1, 2, 3]:
        usage_df[f'usage_lag_{lag}'] = usage_df.groupby('pokemon')['usage_percent'].shift(lag)
    
    # Calculate rolling averages
    usage_df['usage_rolling_3'] = usage_df.groupby('pokemon')['usage_percent'].rolling(3, min_periods=1).mean().reset_index(drop=True)
    
    # Save
    usage_df.to_csv("data/processed/usage_timeseries.csv", index=False)
    
    print(f"Prepared time series data for {usage_df['pokemon'].nunique()} Pokémon")
    return usage_df

if __name__ == "__main__":
    prepare_usage_timeseries()
```

**Run:**
```bash
python python/models/prepare_timeseries.py
```

---

### 6.2 Usage Rate Predictor

**File: `python/models/usage_predictor.py`**

```python
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib
import json

class UsagePredictor:
    def __init__(self):
        self.model = None
        self.feature_columns = None
        
    def prepare_training_data(self):
        """Prepare data for training."""
        # Load features and usage data
        pokemon_df = pd.read_csv("data/processed/pokemon_features.csv")
        usage_df = pd.read_csv("data/processed/usage_timeseries.csv")
        
        # Get latest usage for each Pokémon
        latest_usage = usage_df.sort_values('date').groupby('pokemon').tail(1)
        
        # Merge with Pokémon features
        pokemon_df['name_normalized'] = pokemon_df['name'].str.lower().str.replace(' ', '')
        latest_usage['name_normalized'] = latest_usage['pokemon'].str.lower().str.replace(' ', '').str.replace('-', '')
        
        merged_df = pokemon_df.merge(
            latest_usage[['name_normalized', 'usage_percent', 'usage_lag_1', 'usage_lag_2', 'usage_lag_3', 'usage_rolling_3']],
            on='name_normalized',
            how='inner'
        )
        
        return merged_df
    
    def train(self):
        """Train usage prediction model."""
        df = self.prepare_training_data()
        
        # Feature columns
        self.feature_columns = [
            'base_stat_total',
            'hp', 'attack', 'defense', 'special_attack', 'special_defense', 'speed',
            'physical_bulk', 'special_bulk',
            'offensive_score', 'defensive_score',
            'usage_lag_1', 'usage_lag_2', 'usage_lag_3', 'usage_rolling_3'
        ]
        
        # Handle missing values
        df[self.feature_columns] = df[self.feature_columns].fillna(0)
        
        # Features and target
        X = df[self.feature_columns]
        y = df['usage_percent']
        
        # Train-test split
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Train model
        self.model = RandomForestRegressor(
            n_estimators=100,
            max_depth=10,
            min_samples_split=5,
            random_state=42
        )
        self.model.fit(X_train, y_train)
        
        # Evaluate
        y_pred = self.model.predict(X_test)
        
        mae = mean_absolute_error(y_test, y_pred)
        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        r2 = r2_score(y_test, y_pred)
        
        print(f"Model Performance:")
        print(f"  MAE: {mae:.3f}")
        print(f"  RMSE: {rmse:.3f}")
        print(f"  R²: {r2:.3f}")
        
        # Feature importance
        feature_importance = pd.DataFrame({
            'feature': self.feature_columns,
            'importance': self.model.feature_importances_
        }).sort_values('importance', ascending=False)
        
        print(f"\nTop 5 Features:")
        print(feature_importance.head())
        
        return {
            'mae': mae,
            'rmse': rmse,
            'r2': r2,
            'feature_importance': feature_importance.to_dict('records')
        }
    
    def predict(self, pokemon_data: dict) -> dict:
        """Predict usage rate for a Pokémon."""
        if self.model is None:
            raise ValueError("Model not trained. Call train() first.")
        
        # Create feature vector
        features = pd.DataFrame([{
            col: pokemon_data.get(col, 0) for col in self.feature_columns
        }])
        
        # Predict
        prediction = self.model.predict(features)[0]
        
        # Calculate confidence (based on prediction variance)
        # Use ensemble variance as proxy
        predictions = [tree.predict(features)[0] for tree in self.model.estimators_]
        std = np.std(predictions)
        confidence = max(0, 1 - (std / prediction)) if prediction > 0 else 0.5
        
        return {
            'predicted_usage': round(max(0, prediction), 2),
            'confidence': round(confidence, 2),
            'prediction_range': {
                'lower': round(max(0, prediction - std), 2),
                'upper': round(prediction + std, 2)
            }
        }
    
    def predict_trend(self, pokemon_data: dict) -> str:
        """Predict if usage will rise, fall, or stay stable."""
        current_usage = pokemon_data.get('usage_percent', 0)
        predicted_usage = self.predict(pokemon_data)['predicted_usage']
        
        change = predicted_usage - current_usage
        change_pct = (change / current_usage * 100) if current_usage > 0 else 0
        
        if abs(change_pct) < 5:
            return "stable"
        elif change_pct > 0:
            return "rising"
        else:
            return "falling"
    
    def save_model(self, filepath: str = "python/models/usage_predictor.pkl"):
        """Save trained model."""
        if self.model is None:
            raise ValueError("Model not trained. Call train() first.")
        
        joblib.dump({
            'model': self.model,
            'feature_columns': self.feature_columns
        }, filepath)
        
        print(f"Model saved to {filepath}")
    
    def load_model(self, filepath: str = "python/models/usage_predictor.pkl"):
        """Load trained model."""
        data = joblib.load(filepath)
        self.model = data['model']
        self.feature_columns = data['feature_columns']
        
        print(f"Model loaded from {filepath}")

def main():
    predictor = UsagePredictor()
    
    # Train model
    print("Training usage prediction model...")
    metrics = predictor.train()
    
    # Save model
    predictor.save_model()
    
    # Test prediction
    print("\n" + "="*50)
    print("Testing Prediction")
    print("="*50)
    
    # Load Pokemon data for testing
    pokemon_df = pd.read_csv("data/processed/pokemon_features.csv")
    usage_df = pd.read_csv("data/processed/usage_timeseries.csv")
    
    # Test on a popular Pokemon (e.g., Landorus)
    test_pokemon = pokemon_df[pokemon_df['name'] == 'Landorus'].iloc[0]
    
    latest_usage = usage_df[usage_df['pokemon'].str.contains('Landorus', case=False)].tail(1)
    
    test_data = {
        'base_stat_total': test_pokemon['base_stat_total'],
        'hp': test_pokemon['hp'],
        'attack': test_pokemon['attack'],
        'defense': test_pokemon['defense'],
        'special_attack': test_pokemon['special_attack'],
        'special_defense': test_pokemon['special_defense'],
        'speed': test_pokemon['speed'],
        'physical_bulk': test_pokemon['physical_bulk'],
        'special_bulk': test_pokemon['special_bulk'],
        'offensive_score': test_pokemon['offensive_score'],
        'defensive_score': test_pokemon['defensive_score'],
        'usage_lag_1': latest_usage['usage_lag_1'].values[0] if len(latest_usage) > 0 else 0,
        'usage_lag_2': latest_usage['usage_lag_2'].values[0] if len(latest_usage) > 0 else 0,
        'usage_lag_3': latest_usage['usage_lag_3'].values[0] if len(latest_usage) > 0 else 0,
        'usage_rolling_3': latest_usage['usage_rolling_3'].values[0] if len(latest_usage) > 0 else 0,
        'usage_percent': latest_usage['usage_percent'].values[0] if len(latest_usage) > 0 else 0
    }
    
    prediction = predictor.predict(test_data)
    trend = predictor.predict_trend(test_data)
    
    print(f"\nPrediction for {test_pokemon['name']}:")
    print(f"  Current Usage: {test_data['usage_percent']:.2f}%")
    print(f"  Predicted Usage: {prediction['predicted_usage']:.2f}%")
    print(f"  Confidence: {prediction['confidence']:.2f}")
    print(f"  Trend: {trend}")
    print(f"  Range: {prediction['prediction_range']['lower']:.2f}% - {prediction['prediction_range']['upper']:.2f}%")

if __name__ == "__main__":
    main()
```

**Run:**
```bash
python python/models/usage_predictor.py
```

---

## 7. Frontend Setup

### 7.1 TypeScript Interfaces

**File: `src/types/pokemon.ts`**

```typescript
export interface Pokemon {
  id: number;
  name: string;
  types: string[];
  stats: {
    hp: number;
    attack: number;
    defense: number;
    special_attack: number;
    special_defense: number;
    speed: number;
  };
  role: string;
  sprite?: string;
}

export interface Team {
  pokemon: Pokemon[];
  playstyle: string;
  analysis: TeamAnalysis;
}

export interface TeamAnalysis {
  synergy_score: number;
  coverage: number;
  weaknesses: Record<string, number>;
  playstyle: string;
}

export interface UsagePrediction {
  predicted_usage: number;
  confidence: number;
  prediction_range: {
    lower: number;
    upper: number;
  };
  trend: 'rising' | 'falling' | 'stable';
}

export interface Playstyle {
  name: string;
  description: string;
  key: string;
}
```

---

### 7.2 Utility Functions

**File: `src/lib/typeEffectiveness.ts`**

```typescript
import typeChartData from '@/data/type_effectiveness.json';

export const TYPE_COLORS: Record<string, string> = {
  normal: '#A8A878',
  fire: '#F08030',
  water: '#6890F0',
  electric: '#F8D030',
  grass: '#78C850',
  ice: '#98D8D8',
  fighting: '#C03028',
  poison: '#A040A0',
  ground: '#E0C068',
  flying: '#A890F0',
  psychic: '#F85888',
  bug: '#A8B820',
  rock: '#B8A038',
  ghost: '#705898',
  dragon: '#7038F8',
  dark: '#705848',
  steel: '#B8B8D0',
  fairy: '#EE99AC',
};

export function getTypeEffectiveness(
  attackingType: string,
  defendingType: string
): number {
  return typeChartData.chart[attackingType]?.[defendingType] ?? 1.0;
}

export function calculateTypeMatchup(
  attackerTypes: string[],
  defenderTypes: string[]
): number {
  let multiplier = 1.0;
  
  for (const atkType of attackerTypes) {
    for (const defType of defenderTypes) {
      multiplier *= getTypeEffectiveness(atkType, defType);
    }
  }
  
  return multiplier;
}

export function getTypeColor(type: string): string {
  return TYPE_COLORS[type.toLowerCase()] || '#68A090';
}
```

**File: `src/lib/api.ts`**

```typescript
import { Pokemon, Team, UsagePrediction } from '@/types/pokemon';

const API_BASE = '/api';

export async function getTeamRecommendation(
  playstyle: string
): Promise<Team> {
  const response = await fetch(`${API_BASE}/recommend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playstyle }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to get team recommendation');
  }
  
  return response.json();
}

export async function getUsagePrediction(
  pokemonId: number
): Promise<UsagePrediction> {
  const response = await fetch(`${API_BASE}/predict-usage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pokemon_id: pokemonId }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to get usage prediction');
  }
  
  return response.json();
}

export async function analyzeTeam(team: Pokemon[]): Promise<Team['analysis']> {
  const response = await fetch(`${API_BASE}/analyze-team`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ team }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to analyze team');
  }
  
  return response.json();
}
```

---

## 8. API Development

### 8.1 Python Flask API

**File: `python/api/server.py`**

```python
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import json
import sys
sys.path.append('..')

from models.team_recommender import TeamRecommender
from models.usage_predictor import UsagePredictor

app = Flask(__name__)
CORS(app)

# Load data on startup
print("Loading data...")
pokemon_df = pd.read_csv("data/processed/pokemon_features.csv")
with open("data/processed/type_effectiveness.json", "r") as f:
    type_chart = json.load(f)

# Initialize models
recommender = TeamRecommender(pokemon_df, type_chart)
predictor = UsagePredictor()
predictor.load_model()

print("Server ready!")

@app.route('/recommend', methods=['POST'])
def recommend_team():
    """Get team recommendation based on playstyle."""
    data = request.json
    playstyle = data.get('playstyle', 'balanced')
    
    try:
        result = recommender.recommend_team(playstyle)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/predict-usage', methods=['POST'])
def predict_usage():
    """Predict usage rate for a Pokémon."""
    data = request.json
    pokemon_id = data.get('pokemon_id')
    
    try:
        pokemon = pokemon_df[pokemon_df['id'] == pokemon_id].iloc[0]
        
        pokemon_data = {
            'base_stat_total': pokemon['base_stat_total'],
            'hp': pokemon['hp'],
            'attack': pokemon['attack'],
            'defense': pokemon['defense'],
            'special_attack': pokemon['special_attack'],
            'special_defense': pokemon['special_defense'],
            'speed': pokemon['speed'],
            'physical_bulk': pokemon['physical_bulk'],
            'special_bulk': pokemon['special_bulk'],
            'offensive_score': pokemon['offensive_score'],
            'defensive_score': pokemon['defensive_score'],
            'usage_lag_1': 0,  # Would need to load from usage data
            'usage_lag_2': 0,
            'usage_lag_3': 0,
            'usage_rolling_3': 0
        }
        
        prediction = predictor.predict(pokemon_data)
        trend = predictor.predict_trend({**pokemon_data, 'usage_percent': pokemon.get('usage_percent', 0)})
        
        return jsonify({
            **prediction,
            'trend': trend,
            'pokemon': {
                'id': int(pokemon['id']),
                'name': pokemon['name']
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/analyze-team', methods=['POST'])
def analyze_team():
    """Analyze a given team composition."""
    data = request.json
    team_ids = data.get('team', [])
    
    try:
        team_pokemon = []
        for pid in team_ids:
            pokemon = pokemon_df[pokemon_df['id'] == pid['id']].iloc[0]
            team_pokemon.append(pokemon)
        
        synergy_score = recommender.calculate_synergy_score(team_pokemon)
        coverage = recommender.calculate_team_coverage(team_pokemon)
        weaknesses = recommender.calculate_team_weaknesses(team_pokemon)
        
        return jsonify({
            'synergy_score': round(synergy_score, 2),
            'coverage': round(coverage, 2),
            'weaknesses': {k: v for k, v in weaknesses.items() if v >= 3}
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
```

**Run Python API:**
```bash
cd python/api
python server.py
```

---

### 8.2 Next.js API Routes

**File: `src/app/api/recommend/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Forward to Python API
    const response = await fetch('http://localhost:5000/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get recommendation' },
      { status: 500 }
    );
  }
}
```

**File: `src/app/api/predict-usage/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await fetch('http://localhost:5000/predict-usage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get prediction' },
      { status: 500 }
    );
  }
}
```

**File: `src/app/api/analyze-team/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await fetch('http://localhost:5000/analyze-team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to analyze team' },
      { status: 500 }
    );
  }
}
```

---

## 9. UI Components

### 9.1 Pokemon Card Component

**File: `src/components/PokemonCard.tsx`**

```typescript
import { Pokemon } from '@/types/pokemon';
import { getTypeColor } from '@/lib/typeEffectiveness';

interface PokemonCardProps {
  pokemon: Pokemon;
  onClick?: () => void;
}

export default function PokemonCard({ pokemon, onClick }: PokemonCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow"
    >
      {/* Sprite */}
      <div className="flex justify-center mb-2">
        <img
          src={pokemon.sprite || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`}
          alt={pokemon.name}
          className="w-24 h-24"
        />
      </div>
      
      {/* Name */}
      <h3 className="text-lg font-bold text-center capitalize">
        {pokemon.name}
      </h3>
      
      {/* Types */}
      <div className="flex justify-center gap-2 mt-2">
        {pokemon.types.map((type) => (
          <span
            key={type}
            className="px-3 py-1 rounded-full text-xs text-white font-semibold"
            style={{ backgroundColor: getTypeColor(type) }}
          >
            {type.toUpperCase()}
          </span>
        ))}
      </div>
      
      {/* Role */}
      <p className="text-center text-sm text-gray-600 mt-2">
        {pokemon.role}
      </p>
      
      {/* Stats */}
      <div className="mt-3 space-y-1">
        {Object.entries(pokemon.stats).map(([stat, value]) => (
          <div key={stat} className="flex items-center gap-2">
            <span className="text-xs w-16 capitalize">
              {stat.replace('_', ' ')}
            </span>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${(value / 255) * 100}%` }}
              />
            </div>
            <span className="text-xs w-8 text-right">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

### 9.2 Team Display Component

**File: `src/components/TeamDisplay.tsx`**

```typescript
import { Pokemon } from '@/types/pokemon';
import PokemonCard from './PokemonCard';

interface TeamDisplayProps {
  team: Pokemon[];
  onRemove?: (index: number) => void;
}

export default function TeamDisplay({ team, onRemove }: TeamDisplayProps) {
  const emptySlots = 6 - team.length;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {team.map((pokemon, index) => (
        <div key={pokemon.id} className="relative">
          <PokemonCard pokemon={pokemon} />
          {onRemove && (
            <button
              onClick={() => onRemove(index)}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
            >
              ×
            </button>
          )}
        </div>
      ))}
      
      {/* Empty slots */}
      {Array.from({ length: emptySlots }).map((_, i) => (
        <div
          key={`empty-${i}`}
          className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-center h-64"
        >
          <p className="text-gray-400">Empty Slot</p>
        </div>
      ))}
    </div>
  );
}
```

---

### 9.3 Playstyle Selector

**File: `src/components/PlaystyleSelector.tsx`**

```typescript
import { Playstyle } from '@/types/pokemon';

const PLAYSTYLES: Playstyle[] = [
  {
    key: 'hyper_offense',
    name: 'Hyper Offense',
    description: 'Fast, hard-hitting teams focused on overwhelming opponents quickly',
  },
  {
    key: 'balanced',
    name: 'Balanced',
    description: 'Well-rounded teams with mix of offense and defense',
  },
  {
    key: 'stall',
    name: 'Stall/Defensive',
    description: 'Defensive teams that outlast opponents through walls and recovery',
  },
  {
    key: 'weather_rain',
    name: 'Rain Team',
    description: 'Teams built around rain weather, boosting Water moves',
  },
  {
    key: 'trick_room',
    name: 'Trick Room',
    description: 'Teams with slow, powerful Pokémon that thrive under Trick Room',
  },
  {
    key: 'volt_turn',
    name: 'Volt-Turn (Momentum)',
    description: 'Teams focused on maintaining momentum through pivoting moves',
  },
];

interface PlaystyleSelectorProps {
  selected: string;
  onSelect: (playstyle: string) => void;
}

export default function PlaystyleSelector({
  selected,
  onSelect,
}: PlaystyleSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {PLAYSTYLES.map((playstyle) => (
        <div
          key={playstyle.key}
          onClick={() => onSelect(playstyle.key)}
          className={`
            border-2 rounded-lg p-4 cursor-pointer transition-all
            ${
              selected === playstyle.key
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-blue-300'
            }
          `}
        >
          <h3 className="font-bold text-lg mb-2">{playstyle.name}</h3>
          <p className="text-sm text-gray-600">{playstyle.description}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## 10. Three.js Visualizations

### 10.1 Team Synergy Web (3D)

**File: `src/components/3d/TeamSynergyWeb.tsx`**

```typescript
'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Line, Sphere } from '@react-three/drei';
import { Pokemon } from '@/types/pokemon';
import { getTypeColor } from '@/lib/typeEffectiveness';
import * as THREE from 'three';

interface TeamSynergyWebProps {
  team: Pokemon[];
}

function SynergyNode({ pokemon, position }: { pokemon: Pokemon; position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const color = getTypeColor(pokemon.types[0]);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y += Math.sin(state.clock.elapsedTime + position[0]) * 0.001;
    }
  });
  
  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.5, 32, 32]}>
        <meshStandardMaterial color={color} />
      </Sphere>
      {/* Label would go here */}
    </group>
  );
}

function SynergyWeb({ team }: TeamSynergyWebProps) {
  // Arrange nodes in a circle
  const radius = 3;
  const positions = team.map((_, i) => {
    const angle = (i / team.length) * Math.PI * 2;
    return [
      Math.cos(angle) * radius,
      0,
      Math.sin(angle) * radius,
    ] as [number, number, number];
  });
  
  return (
    <>
      {/* Nodes */}
      {team.map((pokemon, i) => (
        <SynergyNode key={pokemon.id} pokemon={pokemon} position={positions[i]} />
      ))}
      
      {/* Lines connecting nodes */}
      {team.map((_, i) =>
        team.slice(i + 1).map((_, j) => {
          const targetIndex = i + j + 1;
          return (
            <Line
              key={`${i}-${targetIndex}`}
              points={[positions[i], positions[targetIndex]]}
              color="white"
              lineWidth={1}
              opacity={0.3}
            />
          );
        })
      )}
    </>
  );
}

export default function TeamSynergyWeb({ team }: TeamSynergyWebProps) {
  if (team.length === 0) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-gray-100 rounded-lg">
        <p className="text-gray-500">Build a team to see synergy visualization</p>
      </div>
    );
  }
  
  return (
    <div className="w-full h-96 bg-gray-900 rounded-lg">
      <Canvas camera={{ position: [0, 5, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <SynergyWeb team={team} />
        <OrbitControls enableZoom={true} />
      </Canvas>
    </div>
  );
}
```

---

## 11. Integration & Testing

### 11.1 Test Data Flow

**Command sequence:**

```bash
# Terminal 1: Start Python API
cd python/api
source ../../venv/bin/activate
python server.py

# Terminal 2: Start Next.js dev server
npm run dev

# Open browser to http://localhost:3000
```

---

### 11.2 Integration Checklist

```markdown
- [ ] Python API starts without errors
- [ ] Next.js connects to Python API
- [ ] Can select playstyle and get recommendations
- [ ] Team displays correctly
- [ ] Can add/remove Pokémon from team
- [ ] Usage predictions work
- [ ] 3D visualizations render
- [ ] Mobile responsive
- [ ] No console errors
```

---

## 12. Documentation

### 12.1 README.md

**File: `README.md`**

```markdown
# Pokémon Team Composition Recommender + Usage Rate Predictor

An intelligent system that recommends optimal Pokémon teams based on playstyle preferences and predicts competitive usage rates using machine learning.

## Features

- 🎮 **Team Builder**: Get AI-powered team recommendations based on 6 playstyles
- 📊 **Usage Predictor**: Predict which Pokémon will rise/fall in competitive usage
- 🎨 **3D Visualizations**: Interactive Three.js visualizations of team synergy
- 📈 **Team Analysis**: Type coverage, weaknesses, and role balance analysis

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Three.js, Tailwind CSS
- **Backend**: Python, Flask, scikit-learn, pandas
- **Data**: PokéAPI, Smogon Usage Statistics

## Installation

### Prerequisites
- Node.js 18+
- Python 3.8+

### Setup

1. Clone the repository:
```bash
git clone <repo-url>
cd pokemon-team-builder
```

2. Install Python dependencies:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. Install Node dependencies:
```bash
npm install
```

4. Download data (see DATA.md for details)

5. Train models:
```bash
python python/models/team_recommender.py
python python/models/usage_predictor.py
```

## Running the Application

1. Start Python API:
```bash
cd python/api
python server.py
```

2. Start Next.js dev server:
```bash
npm run dev
```

3. Open http://localhost:3000

## Project Structure

```
pokemon-team-builder/
├── data/               # Datasets
├── python/             # Python scripts and models
│   ├── scripts/        # Data collection/processing
│   ├── models/         # ML models
│   └── api/            # Flask API
├── src/                # Next.js app
│   ├── app/            # Pages and API routes
│   ├── components/     # React components
│   ├── lib/            # Utilities
│   └── types/          # TypeScript types
└── public/             # Static assets
```

## License

MIT
```

---

## 13. Deployment

### 13.1 Production Build

**Commands:**

```bash
# Build Next.js app
npm run build

# Test production build locally
npm start

# For Python API, consider using gunicorn
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 python.api.server:app
```

---

### 13.2 Deployment Options

**Vercel (Frontend):**
```bash
npm install -g vercel
vercel
```

**Render/Railway (Python API):**
- Create `Procfile`: `web: gunicorn python.api.server:app`
- Push to GitHub
- Connect to Render/Railway
- Set environment variables

---

## ✅ Workflow Complete

This comprehensive workflow provides:
- Step-by-step instructions for every component
- Complete code examples for critical files
- Clear commands to run at each stage
- Integration and testing procedures
- Deployment guidelines

**Agents can follow this linearly to build the entire project from scratch.**

---

**Total Implementation Time Estimate:**
- Data Collection: 4-6 hours
- Processing & Features: 6-8 hours
- Model Development: 8-10 hours
- Frontend: 12-15 hours
- 3D Visualizations: 8-10 hours
- Testing & Polish: 6-8 hours
- Documentation: 4-5 hours

**Total: 48-62 hours (2-3 weeks at 20-25 hours/week)**
