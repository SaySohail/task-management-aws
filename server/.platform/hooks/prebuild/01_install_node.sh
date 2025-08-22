#!/bin/bash
set -e

echo "=== Installing Node.js 20 via nvm ==="

# Install nvm if not present
if [ ! -d "$HOME/.nvm" ]; then
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
fi

# Source nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Install and use Node.js 20
nvm install 20
nvm use 20
nvm alias default 20

echo "Node version after install: $(node --version)"
echo "NPM version after install: $(npm --version)"

# Also create .nvmrc as fallback
echo "20" > /var/app/staging/.nvmrc

echo "=== Node.js 20 installation complete ==="