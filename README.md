# BIM Rule-Check Visualizer

A React-based  (BIM) IDS visualizer with AI helper integration. Directly attached to the "BIM Portal" of the German Federal Government

## Features

- **3D Viewer**: Interactive Three.js-based viewer with rotating building elements
- **Rule Checking**: Automated rule validation for building elements via IDS
- **Issue Tracking**: Create and manage issues tied to specific building elements
- **LLM Integration**: Mock AI explanations for rule violations and element properties and provides fixing assistance
- **Interactive Selection**: Click on 3D elements to view their properties

### Integrations
- OpenAI API (or compatible) for AI query
- Jira for automatic ticket management 
- BCF Download

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```
3. Start Backend server:
```bash
python backend.py
```

The application will open in your browser at `http://localhost:8080`.

## Usage

1. **View the 3D Scene**: The viewer shows a rotating scene with mock building elements (walls, doors, columns)
2. **Run IDS Check**: Click "Run Rule Check" to validate elements against building rules
3. **Select Elements**: Click on any 3D element to select it and view its properties
4. **Get AI Explanations**: Select an element and click "Explain (LLM)" for AI-generated insights
5. **Create Issues**: Report problems by clicking "Create Issue" for selected elements

## Rule Validation

Elements are color-coded based on rule compliance:
- 🟢 **Green (Pass)**: All required properties present
- 🟡 **Yellow (Warn)**: Some properties missing
- 🔴 **Red (Fail)**: Critical properties missing


## Technologies Used

- React 18
- OpenBIM-Components 3.1
- Webpack for bundling
- Babel for JSX transpilation
- Typescript
