# Knowledge Source Configurations

Detailed configurations for each knowledge source type in Foundry IQ.

## Azure Blob Storage

Auto-ingests, chunks, vectorizes, and indexes documents from blob storage.

```json
{
  "name": "ks-blob",
  "kind": "azureBlob",
  "description": "Documents from blob storage",
  "azureBlobParameters": {
    "connectionString": "DefaultEndpointsProtocol=https;AccountName={account};AccountKey={key};EndpointSuffix=core.windows.net",
    "containerName": "documents",
    "folderPath": "optional/subfolder",
    "ingestionParameters": {
      "embeddingModel": {
        "kind": "azureOpenAI",
        "azureOpenAIParameters": {
          "resourceUri": "https://{aoai}.openai.azure.com/",
          "deploymentId": "text-embedding-3-large",
          "apiKey": "{key}",
          "modelName": "text-embedding-3-large"
        }
      },
      "chatCompletionModel": {
        "kind": "azureOpenAI",
        "azureOpenAIParameters": {
          "resourceUri": "https://{aoai}.openai.azure.com/",
          "deploymentId": "gpt-4o-mini",
          "apiKey": "{key}",
          "modelName": "gpt-4o-mini"
        }
      }
    }
  }
}
```

**Supported file types**: PDF, DOCX, PPTX, XLSX, TXT, HTML, JSON, Markdown, images

## Search Index

References an existing Azure AI Search index.

```json
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
    "searchFields": [
      {"name": "*"}
    ],
    "semanticConfigurationName": "my-semantic-config"
  }
}
```

**Parameters:**
- `searchIndexName`: Name of existing index
- `sourceDataFields`: Fields to extract for responses
- `searchFields`: Fields to search (`*` for all searchable)
- `semanticConfigurationName`: Optional semantic ranker config

## Indexed SharePoint

Indexes SharePoint content into Azure AI Search.

```json
{
  "name": "ks-sharepoint-indexed",
  "kind": "indexedSharePoint",
  "description": "Indexed SharePoint documents",
  "indexedSharePointParameters": {
    "siteUrl": "https://contoso.sharepoint.com/sites/knowledge",
    "folderPath": "/Shared Documents/Policies",
    "ingestionParameters": {
      "embeddingModel": {
        "kind": "azureOpenAI",
        "azureOpenAIParameters": {
          "resourceUri": "https://{aoai}.openai.azure.com/",
          "deploymentId": "text-embedding-3-large",
          "modelName": "text-embedding-3-large"
        }
      }
    }
  }
}
```

## Remote SharePoint

Queries SharePoint directly without indexing. Requires user token for ACL trimming.

```json
{
  "name": "ks-sharepoint-remote",
  "kind": "remoteSharePoint",
  "description": "Live SharePoint queries",
  "remoteSharePointParameters": {
    "siteUrl": "https://contoso.sharepoint.com/sites/knowledge",
    "folderPath": "/Shared Documents"
  }
}
```

**Important**: Pass user token via `x-ms-query-source-authorization` header:

```python
mcp_tool = MCPTool(
    server_label="knowledge-base",
    server_url=mcp_endpoint,
    require_approval="never",
    allowed_tools=["knowledge_base_retrieve"],
    project_connection_id=connection_name,
    headers={
        "x-ms-query-source-authorization": user_bearer_token
    }
)
```

## Web

Retrieves content from specified web domains.

```json
{
  "name": "ks-web",
  "kind": "web",
  "description": "Web content source",
  "webParameters": {
    "domains": {
      "allowedDomains": [
        {"address": "docs.microsoft.com", "includeSubpages": true},
        {"address": "learn.microsoft.com", "includeSubpages": true},
        {"address": "techcommunity.microsoft.com", "includeSubpages": false}
      ],
      "blockedDomains": [
        {"address": "malicious-site.com"}
      ]
    }
  }
}
```

**Parameters:**
- `allowedDomains`: Domains to search
- `blockedDomains`: Domains to exclude
- `includeSubpages`: Whether to include subpages of domain

## Indexed OneLake

Indexes content from Microsoft Fabric OneLake.

```json
{
  "name": "ks-onelake",
  "kind": "indexedOneLake",
  "description": "OneLake documents",
  "indexedOneLakeParameters": {
    "workspaceId": "{fabric-workspace-id}",
    "lakehouseId": "{lakehouse-id}",
    "folderPath": "Files/documents",
    "ingestionParameters": {
      "embeddingModel": {
        "kind": "azureOpenAI",
        "azureOpenAIParameters": {
          "resourceUri": "https://{aoai}.openai.azure.com/",
          "deploymentId": "text-embedding-3-large",
          "modelName": "text-embedding-3-large"
        }
      }
    }
  }
}
```

## Knowledge Source Operations

### List Knowledge Sources

```bash
GET https://{search}.search.windows.net/knowledgesources?api-version=2025-11-01-preview
```

### Get Knowledge Source

```bash
GET https://{search}.search.windows.net/knowledgesources('{name}')?api-version=2025-11-01-preview
```

### Delete Knowledge Source

```bash
DELETE https://{search}.search.windows.net/knowledgesources('{name}')?api-version=2025-11-01-preview
```

## Knowledge Base Configuration Options

### Retrieval Parameters

```json
{
  "retrievalReasoningEffort": {"kind": "low"},
  "outputMode": "extractiveData",
  "retrievalInstructions": "Focus on technical specifications and requirements.",
  "answerInstructions": "Provide concise answers with citations."
}
```

### Query-Time Parameters

```json
{
  "messages": [{"role": "user", "content": [{"type": "text", "text": "query"}]}],
  "maxRuntimeInSeconds": 60,
  "maxOutputSize": 50000,
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

### Response Structure

```json
{
  "response": "Synthesized answer or extracted data...",
  "activity": [
    {"type": "queryPlanning", "queries": ["subquery1", "subquery2"]},
    {"type": "search", "source": "ks-index", "results": 10},
    {"type": "reranking", "topResults": 5}
  ],
  "references": [
    {
      "sourceData": {"title": "Doc Title", "content": "..."},
      "rerankerScore": 3.5,
      "sourceName": "ks-index"
    }
  ]
}
```

## Best Practices

1. **Use extractiveData mode** for agent integration - gives agent full control over synthesis
2. **Set appropriate rerankerThreshold** (2.0-3.0) to filter low-quality matches
3. **Use minimal reasoning effort** for simple lookups to reduce latency/cost
4. **Combine multiple sources** in one knowledge base for comprehensive retrieval
5. **Enable includeActivity** during development to debug query planning
