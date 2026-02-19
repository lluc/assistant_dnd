# CONTINUE.md

## Project Overview

This project is an Assistant for Dungeons & Dragons Masters, providing tools for equipment search and other gaming utilities. It is built using modern web technologies.

### Key Technologies Used
- **Frontend**: HTML, CSS, JavaScript
- **Frameworks**: Web Components
- **Build System**: npm
- **API**: D&D5E API

### High-level Architecture

The project is structured as a Single Page Application (SPA) with modular components. The main components include:
- **Header**: Navigation and branding
- **Equipment Search**: Search and display equipment
- **Equipment Card**: Display individual equipment items
- **Dice Roller**: Roll dice for gaming

## Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- npm (version 6 or higher)

### Installation Instructions
1. Clone the repository:
   ```bash
   git clone https://github.com/VOTRE_USERNAME/dnd-dm-assistant.git
   cd dnd-dm-assistant
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run serve
   ```

### Basic Usage Examples
- Open your browser and navigate to `http://localhost:8080` to see the application in action.

### Running Tests
- Run tests using:
  ```bash
  npm run test
  ```

## Project Structure

### Main Directories
- **css/**: Contains CSS stylesheets
- **js/**: Contains JavaScript files
- **components/**: Contains Web Components
- **utils/**: Contains utility functions

### Key Files
- **index.html**: Main HTML file
- **app.js**: Main JavaScript file
- **api.js**: API service
- **MemoryManager.js**: Utility for managing memory and resources

### Important Configuration Files
- **package.json**: Project configuration
- **.gitignore**: Files to ignore in version control

## Development Workflow

### Coding Standards
- Follow the Airbnb JavaScript Style Guide.
- Use meaningful variable and function names.
- Write modular and reusable code.

### Testing Approach
- Use Jest for unit testing.
- Write tests for all new features and bug fixes.

### Build and Deployment Process
- Build the project using:
  ```bash
  npm run build
  ```
- Deploy the built files to a web server.

### Contribution Guidelines
- Fork the repository and create a new branch for your feature or bug fix.
- Follow the commit message format:
  ```
  type(scope): description
  ```
  Examples:
  - `feat(equipment): Add equipment categories filter`
  - `fix(dice): Fix dice roller animation`
  - `docs(readme): Update installation instructions`

## Key Concepts

### Domain-Specific Terminology
- **Equipment**: Items used in Dungeons & Dragons
- **Dice Roller**: Tool for rolling dice for gaming

### Core Abstractions
- **Web Components**: Reusable UI components
- **API Service**: Handles communication with the D&D5E API

### Design Patterns Used
- **Singleton**: For managing global state
- **Observer**: For handling asynchronous events

## Common Tasks

### Step-by-Step Guides

#### Adding a New Feature
1. Create a new branch:
   ```bash
   git checkout -b feature/new-feature
   ```
2. Implement the feature in the appropriate files.
3. Write tests for the new feature.
4. Commit and push your changes:
   ```bash
   git commit -m "feat(new-feature): Add new feature"
   git push origin feature/new-feature
   ```
5. Create a pull request and get it reviewed.

#### Fixing a Bug
1. Create a new branch:
   ```bash
   git checkout -b fix/bug-fix
   ```
2. Identify and fix the bug in the appropriate files.
3. Write tests to ensure the bug is fixed.
4. Commit and push your changes:
   ```bash
   git commit -m "fix(bug-fix): Resolve bug"
   git push origin fix/bug-fix