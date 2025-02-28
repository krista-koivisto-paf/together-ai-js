# Together AI Node.js Demo

A simple Node.js project to function as a starting point for using the [Together AI](https://together.ai) API.

## Overview

This project provides a straightforward way to get started with Together AI's powerful language models in a JavaScript environment. It includes a setup script that sets up your API key as well as some example code to help you get started.

## Prerequisites

- Node.js (version 23 or higher recommended)
- A free Together AI account and API key ([Get one here](https://together.ai))

## Installation

### Automatic Installation (Linux / MacOS)

This project includes a `bash` install script that will install Node.js and set up the project for you. Simply run the script and follow the instructions:

```bash
./install.sh
```

_If the script fails for whatever reason, you can manually install the dependencies and set up the project using the instructions below._

### Manual Installation (Windows)

If you prefer to do it yourself or if you're running Windows, you can manually install everything you need by following the steps below.

<details> 
  <summary>Click to expand</summary>


#### Install Node.js

Follow the simple instructions on the [Node.js website](https://nodejs.org/en/download).

_Ensure you pick your OS from the dropdown menu._

#### Clone the Repository

Clone this repository from GitHub.

```bash
git clone https://github.com/krista-koivisto-paf/together-ai-js.git
```

#### Install Dependencies

Install project dependencies:

```bash
npm install
```

#### Add your API key

Run the setup script to set up your API key:

```bash
npm run setup
```

You'll be prompted to enter your Together AI API key. You can find it on your Together AI dashboard or in the [API settings under API Keys](https://api.together.ai/settings/api-keys).

**That's it, you're good to go! 🎉**

</details>

## Usage

### Running the Project

```bash
npm start
```

This will execute the main example in `src/index.js`, which demonstrates basic usage of the Together AI API.

### Running Specific Examples

The project includes several example scripts that demonstrate different capabilities:

```bash
npm run example/debugger
npm run example/test
```

## Project Structure

- `src/index.js` - Main entry point, this is the script that will be executed when you run `npm start`
- `src/utils/` - Utility functions to help with common tasks
- `src/examples/` - Example implementations for various use cases
- `src/setup/setup.js` - Helper script for configuring your API key
- `.env` - Environment variables to be loaded when running the project (created during setup)

## TypeScript Support

This project was created as a base for a workshop for a group of developers who have experience with JavaScript, but not necessarily TypeScript. As such, it is currently written entirely in JavaScript in order to be as accessible as possible.

The setup script installs Node.js 23 by default, which employes type stripping, so you can directly use TypeScript if you'd like.

## License

MIT
