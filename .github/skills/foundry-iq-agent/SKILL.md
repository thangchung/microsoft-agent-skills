---
name: foundry-iq-agent
description: Create Microsoft Foundry agents connected to Foundry IQ knowledge bases for agentic retrieval. Use when building agents that need enterprise knowledge grounding via Azure AI Search, creating MCP tool connections to knowledge bases, setting up knowledge sources (blob, search index, SharePoint, web), or implementing RAG-based agent solutions with citation support.
---

# Foundry IQ Agent Builder

Build Microsoft Foundry agents that connect to Foundry IQ knowledge bases for enterprise-grade agentic retrieval.

## Architecture Overview

```
User Query → Foundry Agent → MCP Tool → Knowledge Base → Knowledge Sources
                                              ↓
                              Query Planning + Hybrid Search + Reranking
                                              ↓
                              Synthesized Response with Citations
```

**Components:**
- **Knowledge Sources**: Define *what* to retrieve (blob, search index, SharePoint, web)
- **Knowledge Bases**: Define *how* to retrieve (query planning, multi-hop reasoning)
- **MCP Tool**: Protocol enabling agent-to-knowledge-base communication
- **Foundry Agent**: Orchestrates retrieval and synthesizes responses

## Quick Start Workflow

### 1. Create Knowledge Source

```python
# See references/patterns.md for complete patterns
from azure.identity import DefaultAzureCredential
import requests

credential = DefaultAzureCredential()
search_endpoint = "https://YOUR_SEARCH.search.windows.net"
api_version = "2025-11-01-preview"

# For blob storage source
ks_body = {
    "name": "my-knowledge-source",
    "kind": "azureBlob",
    "azureBlobParameters": {
        "connectionString": "YOUR_CONNECTION_STRING",
        "containerName": "documents",
        "ingestionParameters": {
            "embeddingModel": {
                "kind": "azureOpenAI",
                "azureOpenAIParameters": {
                    "resourceUri": "https://YOUR_AOAI.openai.azure.com/",
                    "deploymentId": "text-embedding-3-large",
                    "modelName": "text-embedding-3-large"
                }
            }
        }
    }
}
```

### 2. Create Knowledge Base

```python
kb_body = {
    "name": "my-knowledge-base",
    "knowledgeSources": [{"name": "my-knowledge-source"}],
    "models": [{
        "kind": "azureOpenAI",
        "azureOpenAIParameters": {
            "resourceUri": "https://YOUR_AOAI.openai.azure.com/",
            "deploymentId": "gpt-4o-mini",
            "modelName": "gpt-4o-mini"
        }
    }],
    "retrievalReasoningEffort": {"kind": "low"},
    "outputMode": "extractiveData"  # Recommended for agent integration
}
```

### 3. Create Project Connection

```python
import requests
from azure.identity import get_bearer_token_provider

mcp_endpoint = f"{search_endpoint}/knowledgebases/{kb_name}/mcp?api-version=2025-11-01-preview"
bearer_token = get_bearer_token_provider(credential, "https://management.azure.com/.default")()

response = requests.put(
    f"https://management.azure.com{project_resource_id}/connections/{connection_name}?api-version=2025-10-01-preview",
    headers={"Authorization": f"Bearer {bearer_token}"},
    json={
        "name": connection_name,
        "properties": {
            "authType": "ProjectManagedIdentity",
            "category": "RemoteTool",
            "target": mcp_endpoint,
            "isSharedToAll": True,
            "audience": "https://search.azure.com/",
            "metadata": {"ApiType": "Azure"}
        }
    }
)
```

### 4. Create Agent with MCP Tool

```python
from azure.ai.projects import AIProjectClient
from azure.ai.projects.models import PromptAgentDefinition, MCPTool

client = AIProjectClient(endpoint=project_endpoint, credential=credential)

mcp_tool = MCPTool(
    server_label="knowledge-base",
    server_url=mcp_endpoint,
    require_approval="never",
    allowed_tools=["knowledge_base_retrieve"],
    project_connection_id=connection_name
)

agent = client.agents.create_version(
    agent_name="my-agent",
    definition=PromptAgentDefinition(
        model="gpt-4o-mini",
        instructions=AGENT_INSTRUCTIONS,  # See below
        tools=[mcp_tool]
    )
)
```

### 5. Invoke Agent

```python
openai_client = client.get_openai_client()
conversation = openai_client.conversations.create()

response = openai_client.responses.create(
    conversation=conversation.id,
    input="What are the key findings in our research documents?",
    extra_body={"agent": {"name": agent.name, "type": "agent_reference"}}
)
print(response.output_text)
```

## Agent Instructions Template

Use this optimized instruction template for reliable MCP tool invocation and proper citations:

```
You are a helpful assistant that must use the knowledge base to answer all questions from the user. You must never answer from your own knowledge under any circumstances.
Every answer must always provide annotations for using the MCP knowledge base tool and render them as: `【message_idx:search_idx†source_name】`
If you cannot find the answer in the provided knowledge base you must respond with "I don't know".
```

## Knowledge Source Types

| Type | Use Case | Key Parameters |
|------|----------|----------------|
| `azureBlob` | Documents in blob storage | connectionString, containerName |
| `searchIndex` | Existing Azure Search index | searchIndexName, sourceDataFields |
| `indexedSharePoint` | Indexed SharePoint content | siteUrl, folderPath |
| `remoteSharePoint` | Live SharePoint queries | Requires x-ms-query-source-authorization header |
| `web` | Web content | allowedDomains, blockedDomains |

## Retrieval Reasoning Effort

| Level | Description | Best For |
|-------|-------------|----------|
| `minimal` | No LLM query planning | Simple lookups, lowest cost |
| `low` | Basic reasoning | Standard queries |
| `medium` | Iterative search | Complex multi-hop questions |

## Output Modes

- **`extractiveData`**: Returns raw content for agent to synthesize (recommended)
- **`answerSynthesis`**: Knowledge base pre-generates answers

## API Version

Always use: `api-version=2025-11-01-preview`

## Prerequisites

- Azure AI Search service with agentic retrieval enabled
- Microsoft Foundry project with:
  - LLM deployment (gpt-4o-mini, gpt-4.1-mini, etc.)
  - Embedding model (text-embedding-3-large)
  - System-assigned managed identity
- Required roles:
  - **Azure AI User**: Access model deployments, create agents
  - **Azure AI Project Manager**: Create MCP connections
  - **Search Index Data Reader**: Read from search indexes

## Reference Files

- `references/patterns.md`: Complete code patterns for REST and Python SDK
- `references/knowledge-sources.md`: Detailed knowledge source configurations
- `scripts/create_agent.py`: End-to-end agent creation script
