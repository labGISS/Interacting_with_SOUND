#!/bin/bash

# Set folder permissions
chown -R 7474:7474 ./server/database/import ./server/database/plugins
chmod -R 774 ./server/database/import ./server/database/plugins

# Make entrypoint.prod.sh executable
chmod +x entrypoint.prod.sh