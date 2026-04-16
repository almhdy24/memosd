#!/bin/bash
echo "Building MemoSD frontend..."
cd client
yarn install
yarn build
echo "Build complete. Deploy the 'dist/' folder to Vercel/Netlify."
