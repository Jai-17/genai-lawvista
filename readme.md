# Project Setup Instructions

## Overview

This repository contains three main components:

* **client**: Frontend application.
* **server**: Backend service.
* **llm-finetuning**: Python notebooks for finetuning the language model.

## Prerequisites

* Node.js and npm installed.
* Docker installed for running Qdrant.
* Python environment for running finetuning notebooks.
* A Hugging Face token with read access.

## Frontend Setup (client)

1. Navigate to the client directory:

   ```bash
   cd client
   ```
2. Install dependencies:

   ```bash
   npm install
   ```
3. Start the development server:

   ```bash
   npm run dev
   ```
4. The frontend will be accessible at:

   * [http://localhost:3000](http://localhost:3000)

## Backend Setup (server)

1. Navigate to the server directory:

   ```bash
   cd server
   ```
2. Install dependencies:

   ```bash
   npm install
   ```
3. Start the backend server:

   ```bash
   npm run dev
   ```
4. The backend will be accessible at:

   * [http://localhost:8000](http://localhost:8000)

## Qdrant Vector Database

1. Run the Qdrant Docker image:

   ```bash
   docker run -d -p 6333:6333 qdrant/qdrant
   ```
2. Access Qdrant dashboard at:

   * [http://localhost:6333/dashboard](http://localhost:6333/dashboard)

## LLM Finetuning

The `llm-finetuning` directory contains the Python notebooks required to finetune the language model. Finetuned models are saved to the Hugging Face Hub.

### Running Finetuning Notebooks

1. Ensure your environment has Python and Jupyter Notebook or JupyterLab installed.
2. Set the environment variable `HF_TOKEN_REPO` with your Hugging Face token (with read access):

   ```bash
   export HF_TOKEN_REPO=your_hf_token
   ```
3. Open and run the notebooks located in `llm-finetuning`.

## Access Points

* Frontend: [http://localhost:3000](http://localhost:3000)
* Backend: [http://localhost:8000](http://localhost:8000)
* Qdrant Dashboard: [http://localhost:6333/dashboard](http://localhost:6333/dashboard)
