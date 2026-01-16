# Foundry IQ Agent Patterns

Complete code patterns for creating agents connected to Foundry IQ knowledge bases.

## REST API Patterns

### Create Knowledge Source (Blob Storage)

```bash
PUT https://{search-service}.search.windows.net/knowledgesources('ks-documents')?api-version=2025-11-01-preview
Content-Type: application/json
api-key: {admin-key}

{
  "name": "ks-documents",
  "kind": "azureBlob",
  "description": "Documents from blob storage",
  "azureBlobParameters": {
    "connectionString": "DefaultEndpointsProtocol=https;AccountName={account};AccountKey={key};EndpointSuffix=core.windows.net",
    "containerName": "documents",
    "folderPath": "knowledge-docs",
    "ingestionParameters": {
      "embeddingModel": {
        "kind": "azureOpenAI",
        "azureOpenAIParameters": {
          "resourceUri": "https://{aoai}.openai.azure.com/",
          "deploymentId": "text-embedding-3-large",
          "apiKey": "{aoai-key}",
          "modelName": "text-embedding-3-large"
        }
      },
      "chatCompletionModel": {
        "kind": "azureOpenAI",
        "azureOpenAIParameters": {
          "resourceUri": "https://{aoai}.openai.azure.com/",
          "deploymentId": "gpt-4o-mini",
          "apiKey": "{aoai-key}",
          "modelName": "gpt-4o-mini"
        }
      }
    }
  }
}
```

### Create Knowledge Source (Search Index)

```bash
PUT https://{search-service}.search.windows.net/knowledgesources('ks-index')?api-version=2025-11-01-preview
Content-Type: application/json
api-key: {admin-key}

{
  "name": "ks-index",
  "kind": "searchIndex",
  "description": "Existing search index",
  "searchIndexParameters": {
    "searchIndexName": "my-index",
    "sourceDataFields": [
      {"name": "content"},
      {"name": "title"},
      {"name": "summary"}
    ],
    "searchFields": [{"name": "*"}],
    "semanticConfigurationName": "my-semantic-config"
  }
}
```

### Create Knowledge Source (Web)

```bash
PUT https://{search-service}.search.windows.net/knowledgesources('ks-web')?api-version=2025-11-01-preview
Content-Type: application/json
api-key: {admin-key}

{
  "name": "ks-web",
  "kind": "web",
  "description": "Web content source",
  "webParameters": {
    "domains": {
      "allowedDomains": [
        {"address": "docs.microsoft.com", "includeSubpages": true},
        {"address": "learn.microsoft.com", "includeSubpages": true}
      ],
      "blockedDomains": [
        {"address": "spam-site.com"}
      ]
    }
  }
}
```

### Create Knowledge Base

```bash
PUT https://{search-service}.search.windows.net/knowledgebases('my-kb')?api-version=2025-11-01-preview
Content-Type: application/json
api-key: {admin-key}

{
  "name": "my-kb",
  "description": "Enterprise knowledge base",
  "knowledgeSources": [
    {"name": "ks-documents"},
    {"name": "ks-index"}
  ],
  "models": [{
    "kind": "azureOpenAI",
    "azureOpenAIParameters": {
      "resourceUri": "https://{aoai}.openai.azure.com/",
      "deploymentId": "gpt-4o-mini",
      "apiKey": "{aoai-key}",
      "modelName": "gpt-4o-mini"
    }
  }],
  "retrievalReasoningEffort": {"kind": "low"},
  "outputMode": "extractiveData",
  "retrievalInstructions": "Focus on technical documentation and specifications.",
  "answerInstructions": "Provide concise, factual answers with source citations."
}
```

### Query Knowledge Base Directly

```bash
POST https://{search-service}.search.windows.net/knowledgebases('my-kb')/retrieve?api-version=2025-11-01-preview
Content-Type: application/json
api-key: {admin-key}

{
  "messages": [{
    "role": "user",
    "content": [{"type": "text", "text": "What are the system requirements?"}]
  }],
  "maxRuntimeInSeconds": 60,
  "maxOutputSize": 50000,
  "retrievalReasoningEffort": {"kind": "low"},
  "outputMode": "extractiveData",
  "includeActivity": true,
  "knowledgeSourceParams": [{
    "kind": "searchIndex",
    "knowledgeSourceName": "ks-index",
    "includeReferences": true,
    "includeReferenceSourceData": true,
    "rerankerThreshold": 2.0
  }]
}
```

### Create Project Connection (REST)

```bash
PUT https://management.azure.com/subscriptions/{sub}/resourceGroups/{rg}/providers/Microsoft.MachineLearningServices/workspaces/{workspace}/projects/{project}/connections/{connection-name}?api-version=2025-10-01-preview
Authorization: Bearer {management-token}
Content-Type: application/json

{
  "name": "{connection-name}",
  "type": "Microsoft.MachineLearningServices/workspaces/connections",
  "properties": {
    "authType": "ProjectManagedIdentity",
    "category": "RemoteTool",
    "target": "https://{search-service}.search.windows.net/knowledgebases/{kb-name}/mcp?api-version=2025-11-01-preview",
    "isSharedToAll": true,
    "audience": "https://search.azure.com/",
    "metadata": {"ApiType": "Azure"}
  }
}
```

### Create Agent (REST)

```bash
POST {project-endpoint}/agents/{agent-name}/versions?api-version=2025-11-15-preview
Authorization: Bearer {foundry-token}
Content-Type: application/json

{
  "definition": {
    "model": "gpt-4o-mini",
    "instructions": "You are a helpful assistant that must use the knowledge base to answer all questions. You must never answer from your own knowledge. Every answer must provide annotations as: 【message_idx:search_idx†source_name】. If you cannot find the answer, respond with 'I don't know'.",
    "tools": [{
      "server_label": "knowledge-base",
      "server_url": "https://{search-service}.search.windows.net/knowledgebases/{kb-name}/mcp?api-version=2025-11-01-preview",
      "require_approval": "never",
      "allowed_tools": ["knowledge_base_retrieve"],
      "project_connection_id": "{connection-name}",
      "type": "mcp"
    }],
    "kind": "prompt"
  }
}
```

## Python SDK Patterns

### Complete End-to-End Example

```python
import os
import requests
from azure.identity import DefaultAzureCredential, get_bearer_token_provider
from azure.ai.projects import AIProjectClient
from azure.ai.projects.models import PromptAgentDefinition, MCPTool

# Configuration
SEARCH_ENDPOINT = os.environ["AZURE_SEARCH_ENDPOINT"]
AOAI_ENDPOINT = os.environ["AZURE_OPENAI_ENDPOINT"]
PROJECT_ENDPOINT = os.environ["FOUNDRY_PROJECT_ENDPOINT"]
PROJECT_RESOURCE_ID = os.environ["PROJECT_RESOURCE_ID"]
API_VERSION = "2025-11-01-preview"

credential = DefaultAzureCredential()

def get_search_headers():
    """Get headers for Azure Search API calls."""
    token = credential.get_token("https://search.azure.com/.default").token
    return {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Accept": "application/json;odata.metadata=minimal",
        "Prefer": "return=representation"
    }

def create_knowledge_source(name: str, index_name: str):
    """Create a knowledge source pointing to an existing search index."""
    url = f"{SEARCH_ENDPOINT}/knowledgesources('{name}')?api-version={API_VERSION}"
    body = {
        "name": name,
        "kind": "searchIndex",
        "searchIndexParameters": {
            "searchIndexName": index_name,
            "sourceDataFields": [{"name": "content"}, {"name": "title"}],
            "searchFields": [{"name": "*"}]
        }
    }
    response = requests.put(url, headers=get_search_headers(), json=body)
    response.raise_for_status()
    print(f"Knowledge source '{name}' created.")
    return response.json()

def create_knowledge_base(name: str, source_names: list[str]):
    """Create a knowledge base with specified sources."""
    url = f"{SEARCH_ENDPOINT}/knowledgebases('{name}')?api-version={API_VERSION}"
    body = {
        "name": name,
        "knowledgeSources": [{"name": s} for s in source_names],
        "models": [{
            "kind": "azureOpenAI",
            "azureOpenAIParameters": {
                "resourceUri": AOAI_ENDPOINT,
                "deploymentId": "gpt-4o-mini",
                "modelName": "gpt-4o-mini"
            }
        }],
        "retrievalReasoningEffort": {"kind": "low"},
        "outputMode": "extractiveData"
    }
    response = requests.put(url, headers=get_search_headers(), json=body)
    response.raise_for_status()
    print(f"Knowledge base '{name}' created.")
    return response.json()

def create_project_connection(connection_name: str, kb_name: str):
    """Create MCP connection in Foundry project."""
    mcp_endpoint = f"{SEARCH_ENDPOINT}/knowledgebases/{kb_name}/mcp?api-version={API_VERSION}"
    mgmt_token = get_bearer_token_provider(credential, "https://management.azure.com/.default")()
    
    url = f"https://management.azure.com{PROJECT_RESOURCE_ID}/connections/{connection_name}?api-version=2025-10-01-preview"
    body = {
        "name": connection_name,
        "type": "Microsoft.MachineLearningServices/workspaces/connections",
        "properties": {
            "authType": "ProjectManagedIdentity",
            "category": "RemoteTool",
            "target": mcp_endpoint,
            "isSharedToAll": True,
            "audience": "https://search.azure.com/",
            "metadata": {"ApiType": "Azure"}
        }
    }
    response = requests.put(url, headers={"Authorization": f"Bearer {mgmt_token}"}, json=body)
    response.raise_for_status()
    print(f"Project connection '{connection_name}' created.")
    return mcp_endpoint

def create_agent(agent_name: str, mcp_endpoint: str, connection_name: str):
    """Create Foundry agent with MCP tool."""
    client = AIProjectClient(endpoint=PROJECT_ENDPOINT, credential=credential)
    
    instructions = """You are a helpful assistant that must use the knowledge base to answer all questions from the user. You must never answer from your own knowledge under any circumstances.
Every answer must always provide annotations for using the MCP knowledge base tool and render them as: 【message_idx:search_idx†source_name】
If you cannot find the answer in the provided knowledge base you must respond with "I don't know"."""

    mcp_tool = MCPTool(
        server_label="knowledge-base",
        server_url=mcp_endpoint,
        require_approval="never",
        allowed_tools=["knowledge_base_retrieve"],
        project_connection_id=connection_name
    )
    
    agent = client.agents.create_version(
        agent_name=agent_name,
        definition=PromptAgentDefinition(
            model="gpt-4o-mini",
            instructions=instructions,
            tools=[mcp_tool]
        )
    )
    print(f"Agent '{agent_name}' created (version: {agent.version}).")
    return agent

def query_agent(agent, user_query: str):
    """Send query to agent and get response."""
    client = AIProjectClient(endpoint=PROJECT_ENDPOINT, credential=credential)
    openai_client = client.get_openai_client()
    
    conversation = openai_client.conversations.create()
    response = openai_client.responses.create(
        conversation=conversation.id,
        input=user_query,
        extra_body={"agent": {"name": agent.name, "type": "agent_reference"}}
    )
    return response.output_text

# Usage
if __name__ == "__main__":
    # Step 1: Create knowledge source
    create_knowledge_source("ks-docs", "my-search-index")
    
    # Step 2: Create knowledge base
    create_knowledge_base("my-kb", ["ks-docs"])
    
    # Step 3: Create project connection
    mcp_endpoint = create_project_connection("kb-connection", "my-kb")
    
    # Step 4: Create agent
    agent = create_agent("my-agent", mcp_endpoint, "kb-connection")
    
    # Step 5: Query
    answer = query_agent(agent, "What are the key features?")
    print(f"Answer: {answer}")
```

### SharePoint with User Token Passthrough

```python
from azure.identity import get_bearer_token_provider

# For remote SharePoint, pass user token for ACL trimming
search_token = get_bearer_token_provider(credential, "https://search.azure.com/.default")()

mcp_tool = MCPTool(
    server_label="knowledge-base",
    server_url=mcp_endpoint,
    require_approval="never",
    allowed_tools=["knowledge_base_retrieve"],
    project_connection_id=connection_name,
    headers={
        "x-ms-query-source-authorization": search_token
    }
)
```

### Streaming Responses

```python
stream_response = openai_client.responses.create(
    stream=True,
    tool_choice="required",
    input=user_query,
    extra_body={"agent": {"name": agent.name, "type": "agent_reference"}}
)

for event in stream_response:
    if event.type == "response.created":
        print(f"Response ID: {event.response.id}")
    elif event.type == "content_block_delta":
        print(event.delta.text, end="", flush=True)
```

## Error Handling

```python
import requests
from requests.exceptions import HTTPError

def safe_api_call(method, url, **kwargs):
    """Make API call with error handling."""
    try:
        response = requests.request(method, url, **kwargs)
        response.raise_for_status()
        return response.json()
    except HTTPError as e:
        if e.response.status_code == 400:
            print(f"Bad request: {e.response.json()}")
        elif e.response.status_code == 401:
            print("Authentication failed - check credentials")
        elif e.response.status_code == 403:
            print("Permission denied - check RBAC roles")
        elif e.response.status_code == 404:
            print("Resource not found")
        elif e.response.status_code == 409:
            print("Conflict - resource already exists")
        raise
```

## Cleanup

```python
def cleanup(agent_name: str, connection_name: str, kb_name: str, ks_name: str):
    """Delete all created resources."""
    client = AIProjectClient(endpoint=PROJECT_ENDPOINT, credential=credential)
    
    # Delete agent
    client.agents.delete(agent_name)
    
    # Delete connection
    mgmt_token = get_bearer_token_provider(credential, "https://management.azure.com/.default")()
    requests.delete(
        f"https://management.azure.com{PROJECT_RESOURCE_ID}/connections/{connection_name}?api-version=2025-10-01-preview",
        headers={"Authorization": f"Bearer {mgmt_token}"}
    )
    
    # Delete knowledge base
    requests.delete(
        f"{SEARCH_ENDPOINT}/knowledgebases('{kb_name}')?api-version={API_VERSION}",
        headers=get_search_headers()
    )
    
    # Delete knowledge source
    requests.delete(
        f"{SEARCH_ENDPOINT}/knowledgesources('{ks_name}')?api-version={API_VERSION}",
        headers=get_search_headers()
    )
```
