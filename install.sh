#!/bin/bash

NODE_VERSION=23

COLOR_RED='\033[0;31m'
COLOR_BLUE='\033[0;34m'
COLOR_GREEN='\033[0;32m'
COLOR_YELLOW='\033[0;33m'
COLOR_RESET='\033[0m'

function install_nvm() {
    echo -e "${COLOR_BLUE}[INFO] Installing nvm (Node Version Manager)...${COLOR_RESET}"
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
    echo -e "${COLOR_GREEN}[OK] nvm installed successfully.${COLOR_RESET}"
    # in lieu of restarting the shell
    \. "$HOME/.nvm/nvm.sh"
}

function verify_node_version() {
    echo -e "${COLOR_BLUE}[INFO] Verifying Node.js version...${COLOR_RESET}"
    node -v # Semver version string, e.g. "v23.9.0".
    if [ $? -ne 0 ]; then
        echo -e "${COLOR_RED}[ERROR] Node.js failed to install.${COLOR_RESET}"
        exit 1
    fi
    # Check if it starts with `v${NODE_VERSION}.`
    if [[ $(node -v) != "v${NODE_VERSION}."* ]]; then
        echo -e "${COLOR_RED}[ERROR] Node.js v$NODE_VERSION is not the current version.${COLOR_RESET}"
        exit 1
    fi
    nvm use $NODE_VERSION
    if [ $? -ne 0 ]; then
        echo -e "${COLOR_RED}[ERROR] Failed to set Node.js v$NODE_VERSION as current version.${COLOR_RESET}"
        exit 1
    fi
    # Check if current nvm Node.js version is the same as `node -v`
    if [[ $(nvm current) != $(node -v) ]]; then
        if [ $(nvm current) == "system" ]; then
            echo -e "${COLOR_YELLOW}[WARNING] 'nvm current' is 'system', this may indicate that you have another Node package manager installed.${COLOR_RESET}"
        else
            echo -e "${COLOR_RED}[ERROR] 'node' claims to be version v$NODE_VERSION, but 'nvm current' disagrees.${COLOR_RESET}"
            exit 1
        fi
    fi
    echo -e "${COLOR_GREEN}[OK] Node.js v$NODE_VERSION installed successfully.${COLOR_RESET}"
}

function install_node() {
    echo -e "${COLOR_BLUE}[INFO] Installing Node.js v$NODE_VERSION...${COLOR_RESET}"
    nvm install --default $NODE_VERSION
    verify_node_version
    echo -e "${COLOR_GREEN}[OK] Node.js v$NODE_VERSION installed successfully.${COLOR_RESET}"
}

function install_npm() {
    echo -e "${COLOR_BLUE}[INFO] Checking for npm...${COLOR_RESET}"
    npm -v
    if [ $? -ne 0 ]; then
        echo -e "${COLOR_RED}[ERROR] Something went wrong when checking for npm.${COLOR_RESET}"
        exit 1
    fi
    echo -e "${COLOR_GREEN}[OK] npm is installed.${COLOR_RESET}"
}

function install_dependencies() {
    echo -e "${COLOR_BLUE}[INFO] Installing project dependencies...${COLOR_RESET}"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${COLOR_RED}[ERROR] Failed to install dependencies.${COLOR_RESET}"
        exit 1
    fi
    echo -e "${COLOR_GREEN}[OK] Dependencies installed successfully.${COLOR_RESET}"
}

function run_setup() {
    npm run setup
    if [ $? -ne 0 ]; then
        echo -e "${COLOR_RED}[ERROR] Failed to run project setup.${COLOR_RESET}"
        exit 1
    fi
    echo -e "${COLOR_GREEN}[OK] Project setup completed successfully.${COLOR_RESET}"
}

echo -e "${COLOR_BLUE}[INFO] Installing system dependencies...${COLOR_RESET}"
echo

install_nvm
install_node
install_npm

echo -e "${COLOR_GREEN}[OK] All system dependencies installed successfully.${COLOR_RESET}"
echo
echo -e "${COLOR_BLUE}[INFO] Setting up project...${COLOR_RESET}"
echo

install_dependencies
run_setup

echo -e "${COLOR_GREEN}[OK] Installation complete. You're all set!${COLOR_RESET}"
echo
echo -e "${COLOR_BLUE}[INFO] You can now start the project by running:${COLOR_RESET}"
echo
echo -e "\t${COLOR_YELLOW}npm start${COLOR_RESET}"
echo
echo -e "Happy coding! 🎉"
echo
