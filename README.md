# JSON Parsing Tool

A powerful, browser-based utility designed for comprehensive JSON data manipulation. This tool provides a user-friendly interface reminiscent of developer tools, allowing users to validate, format, minify, convert, and inspect JSON data with ease.

## Features

*   **JSON Validation**: Instantly check if your JSON is syntactically correct.
*   **Pretty Print/Formatting**: Beautify messy JSON into a readable, indented format.
*   **Minification**: Reduce JSON file size by removing unnecessary whitespace and newlines.
*   **Data Conversion**: (Future/Planned) Convert JSON to other formats (e.g., YAML, CSV).
*   **Interactive Inspection**: Navigate and explore JSON structures with a collapsible tree view.
*   **Syntax Highlighting**: Enhanced readability for JSON code.
*   **Error Highlighting**: Pinpoint errors directly within the editor.

## Technologies Used

*   Next.js 15
*   React
*   TypeScript
*   Monaco Editor
*   Tailwind CSS
*   Lucide React
*   Zustand (for state management)
*   Zod (for schema validation)

## Getting Started

Follow these instructions to set up and run the project locally on your machine.

### Prerequisites

Ensure you have the following installed:

*   Node.js (LTS version recommended)
*   npm, yarn, or pnpm

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/json-parsing-tool.git
    

    (Replace `https://github.com/your-username/json-parsing-tool.git` with the actual repository URL)

2.  **Navigate into the project directory:**

    ```bash
    cd json-parsing-tool
    ```

3.  **Install dependencies:**

    Using npm:
    ```bash
    npm install
    ```

    Using yarn:
    ```bash
    yarn install
    ```

    Using pnpm:
    ```bash
    pnpm install
    ```

### Running the Development Server

To start the development server:

Using npm:
npm run dev
```

Using yarn:
```bash
yarn dev
```

Using pnpm:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

The application will hot-reload on code changes.

### Building for Production

To create a production-optimized build:

Using npm:
```bash
npm run build
```

Using yarn:
```bash
yarn build
```

Using pnpm:
```bash
pnpm build
```

This command optimizes the application for production and outputs the build files to the `.next` directory.

### Running Production Build

To serve the production build locally:

Using npm:
```bash
npm run start
```

Using yarn:
```bash
yarn start
```

Using pnpm:
```bash
pnpm start
```

This will run the compiled application on [http://localhost:3000](http://localhost:3000).