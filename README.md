# BIM Rule-Check Visualizer

A React-based Building Information Modeling (BIM) rule-check visualizer with Three.js integration.

## Features

- **3D Viewer**: Interactive Three.js-based viewer with rotating building elements
- **Rule Checking**: Automated rule validation for building elements (walls, doors, columns)
- **Issue Tracking**: Create and manage issues tied to specific building elements
- **LLM Integration**: Mock AI explanations for rule violations and element properties
- **Interactive Selection**: Click on 3D elements to view their properties

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

The application will open in your browser at `http://localhost:3000`.

## Usage

1. **View the 3D Scene**: The viewer shows a rotating scene with mock building elements (walls, doors, columns)
2. **Run Rule Check**: Click "Run Rule Check" to validate elements against building rules
3. **Select Elements**: Click on any 3D element to select it and view its properties
4. **Get AI Explanations**: Select an element and click "Explain (LLM)" for AI-generated insights
5. **Create Issues**: Report problems by clicking "Create Issue" for selected elements

## Building Elements

The demo includes:
- **W1, W2**: Wall elements with U-Value and fire class properties
- **D1**: Door element with fire class requirements
- **C1**: Column element with material specifications

## Rule Validation

Elements are color-coded based on rule compliance:
- 🟢 **Green (Pass)**: All required properties present
- 🟡 **Yellow (Warn)**: Some properties missing
- 🔴 **Red (Fail)**: Critical properties missing

## Development

- `npm start`: Start development server
- `npm run build`: Build for production
- `npm run dev`: Alternative development command

## Technologies Used

- React 18
- Three.js for 3D visualization
- Webpack for bundling
- Babel for JSX transpilation
