#!/usr/bin/env python3
"""
Foundry IQ Agent Creator

End-to-end script for creating a Microsoft Foundry agent connected to 
a Foundry IQ knowledge base for agentic retrieval.

Prerequisites:
- pip install azure-identity azure-ai-projects requests
- Environment variables set (see below)

Usage:
    python create_agent.py --index-name my-index --agent-name my-agent
"""

import os
import argparse
import requests
from azure.identity import DefaultAzureCredential, get_bearer_token_provider

# Required environment variables
REQUIRED_ENV_VARS = [
    "AZURE_SEARCH_ENDPOINT",      # https://your-search.search.windows.net
    "AZURE_OPENAI_ENDPOINT",      # https://your-aoai.openai.azure.com
    "FOUNDRY_PROJECT_ENDPOINT",   # https://your-foundry.services.ai.azure.com/api/projects/your-project
    "PROJECT_RESOURCE_ID",        # /subscriptions/{sub}/resourceGroups/{rg}/providers/Microsoft.MachineLearningServices/workspaces/{workspace}/projects/{project}
]

API_VERSION = "2025-11-01-preview"
MGMT_API_VERSION = "2025-10-01-preview"
AGENT_API_VERSION = "2025-11-15-preview"

AGENT_INSTRUCTIONS = """You are a helpful assistant that must use the knowledge base to answer all questions from the user. You must never answer from your own knowledge under any circumstances.
Every answer must always provide annotations for using the MCP knowledge base tool and render them as: 【message_idx:search_idx†source_name】
If you cannot find the answer in the provided knowledge base you must respond with "I don't know"."""


class FoundryIQAgentBuilder:
    """Builder for creating Foundry agents connected to Foundry IQ."""
    
    def __init__(self):
        self.credential = DefaultAzureCredential()
        self.search_endpoint = os.environ["AZURE_SEARCH_ENDPOINT"]
        self.aoai_endpoint = os.environ["AZURE_OPENAI_ENDPOINT"]
        self.project_endpoint = os.environ["FOUNDRY_PROJECT_ENDPOINT"]
        self.project_resource_id = os.environ["PROJECT_RESOURCE_ID"]
    
    def _get_search_headers(self):
        """Get headers for Azure Search API calls."""
        token = self.credential.get_token("https://search.azure.com/.default").token
        return {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "Accept": "application/json;odata.metadata=minimal",
            "Prefer": "return=representation"
        }
    
    def _get_management_token(self):
        """Get bearer token for Azure Management API."""
        return get_bearer_token_provider(
            self.credential, "https://management.azure.com/.default"
        )()
    
    def _get_foundry_token(self):
        """Get bearer token for Foundry API."""
        return self.credential.get_token("https://ai.azure.com/.default").token
    
    def create_knowledge_source_from_index(self, name: str, index_name: str, 
                                           semantic_config: str = None):
        """Create knowledge source from existing search index."""
        url = f"{self.search_endpoint}/knowledgesources('{name}')?api-version={API_VERSION}"
        
        body = {
            "name": name,
            "kind": "searchIndex",
            "description": f"Knowledge source from index: {index_name}",
            "searchIndexParameters": {
                "searchIndexName": index_name,
                "sourceDataFields": [{"name": "content"}, {"name": "title"}],
                "searchFields": [{"name": "*"}]
            }
        }
        
        if semantic_config:
            body["searchIndexParameters"]["semanticConfigurationName"] = semantic_config
        
        response = requests.put(url, headers=self._get_search_headers(), json=body)
        response.raise_for_status()
        print(f"✓ Knowledge source '{name}' created from index '{index_name}'")
        return response.json()
    
    def create_knowledge_source_from_blob(self, name: str, connection_string: str,
                                          container: str, embedding_deployment: str):
        """Create knowledge source from blob storage."""
        url = f"{self.search_endpoint}/knowledgesources('{name}')?api-version={API_VERSION}"
        
        body = {
            "name": name,
            "kind": "azureBlob",
            "description": f"Knowledge source from blob: {container}",
            "azureBlobParameters": {
                "connectionString": connection_string,
                "containerName": container,
                "ingestionParameters": {
                    "embeddingModel": {
                        "kind": "azureOpenAI",
                        "azureOpenAIParameters": {
                            "resourceUri": self.aoai_endpoint,
                            "deploymentId": embedding_deployment,
                            "modelName": embedding_deployment
                        }
                    }
                }
            }
        }
        
        response = requests.put(url, headers=self._get_search_headers(), json=body)
        response.raise_for_status()
        print(f"✓ Knowledge source '{name}' created from blob '{container}'")
        return response.json()
    
    def create_knowledge_base(self, name: str, source_names: list,
                              llm_deployment: str = "gpt-4o-mini",
                              reasoning_effort: str = "low"):
        """Create knowledge base with specified sources."""
        url = f"{self.search_endpoint}/knowledgebases('{name}')?api-version={API_VERSION}"
        
        body = {
            "name": name,
            "description": f"Knowledge base with sources: {', '.join(source_names)}",
            "knowledgeSources": [{"name": s} for s in source_names],
            "models": [{
                "kind": "azureOpenAI",
                "azureOpenAIParameters": {
                    "resourceUri": self.aoai_endpoint,
                    "deploymentId": llm_deployment,
                    "modelName": llm_deployment
                }
            }],
            "retrievalReasoningEffort": {"kind": reasoning_effort},
            "outputMode": "extractiveData"
        }
        
        response = requests.put(url, headers=self._get_search_headers(), json=body)
        response.raise_for_status()
        print(f"✓ Knowledge base '{name}' created")
        return response.json()
    
    def create_project_connection(self, connection_name: str, kb_name: str):
        """Create MCP connection in Foundry project."""
        mcp_endpoint = f"{self.search_endpoint}/knowledgebases/{kb_name}/mcp?api-version={API_VERSION}"
        url = f"https://management.azure.com{self.project_resource_id}/connections/{connection_name}?api-version={MGMT_API_VERSION}"
        
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
        
        response = requests.put(
            url,
            headers={
                "Authorization": f"Bearer {self._get_management_token()}",
                "Content-Type": "application/json"
            },
            json=body
        )
        response.raise_for_status()
        print(f"✓ Project connection '{connection_name}' created")
        return mcp_endpoint
    
    def create_agent(self, agent_name: str, mcp_endpoint: str, connection_name: str,
                     model: str = "gpt-4o-mini", instructions: str = None):
        """Create Foundry agent with MCP tool."""
        url = f"{self.project_endpoint}/agents/{agent_name}/versions?api-version={AGENT_API_VERSION}"
        
        body = {
            "definition": {
                "model": model,
                "instructions": instructions or AGENT_INSTRUCTIONS,
                "tools": [{
                    "server_label": "knowledge-base",
                    "server_url": mcp_endpoint,
                    "require_approval": "never",
                    "allowed_tools": ["knowledge_base_retrieve"],
                    "project_connection_id": connection_name,
                    "type": "mcp"
                }],
                "kind": "prompt"
            }
        }
        
        response = requests.post(
            url,
            headers={
                "Authorization": f"Bearer {self._get_foundry_token()}",
                "Content-Type": "application/json"
            },
            json=body
        )
        response.raise_for_status()
        result = response.json()
        print(f"✓ Agent '{agent_name}' created (version: {result.get('version', 'N/A')})")
        return result
    
    def query_knowledge_base(self, kb_name: str, query: str):
        """Query knowledge base directly (for testing)."""
        url = f"{self.search_endpoint}/knowledgebases('{kb_name}')/retrieve?api-version={API_VERSION}"
        
        body = {
            "messages": [{
                "role": "user",
                "content": [{"type": "text", "text": query}]
            }],
            "maxRuntimeInSeconds": 60,
            "outputMode": "extractiveData",
            "includeActivity": True
        }
        
        response = requests.post(url, headers=self._get_search_headers(), json=body)
        response.raise_for_status()
        return response.json()
    
    def delete_resources(self, agent_name: str = None, connection_name: str = None,
                         kb_name: str = None, ks_name: str = None):
        """Delete created resources."""
        if agent_name:
            url = f"{self.project_endpoint}/agents/{agent_name}?api-version={AGENT_API_VERSION}"
            requests.delete(url, headers={"Authorization": f"Bearer {self._get_foundry_token()}"})
            print(f"✓ Agent '{agent_name}' deleted")
        
        if connection_name:
            url = f"https://management.azure.com{self.project_resource_id}/connections/{connection_name}?api-version={MGMT_API_VERSION}"
            requests.delete(url, headers={"Authorization": f"Bearer {self._get_management_token()}"})
            print(f"✓ Connection '{connection_name}' deleted")
        
        if kb_name:
            url = f"{self.search_endpoint}/knowledgebases('{kb_name}')?api-version={API_VERSION}"
            requests.delete(url, headers=self._get_search_headers())
            print(f"✓ Knowledge base '{kb_name}' deleted")
        
        if ks_name:
            url = f"{self.search_endpoint}/knowledgesources('{ks_name}')?api-version={API_VERSION}"
            requests.delete(url, headers=self._get_search_headers())
            print(f"✓ Knowledge source '{ks_name}' deleted")


def validate_environment():
    """Check required environment variables."""
    missing = [v for v in REQUIRED_ENV_VARS if not os.environ.get(v)]
    if missing:
        print("Missing required environment variables:")
        for var in missing:
            print(f"  - {var}")
        return False
    return True


def main():
    parser = argparse.ArgumentParser(description="Create Foundry IQ Agent")
    parser.add_argument("--index-name", required=True, help="Existing search index name")
    parser.add_argument("--agent-name", default="foundry-iq-agent", help="Agent name")
    parser.add_argument("--model", default="gpt-4o-mini", help="LLM deployment name")
    parser.add_argument("--reasoning", default="low", choices=["minimal", "low", "medium"],
                        help="Retrieval reasoning effort")
    parser.add_argument("--test-query", help="Optional query to test the knowledge base")
    parser.add_argument("--cleanup", action="store_true", help="Delete resources after creation")
    
    args = parser.parse_args()
    
    if not validate_environment():
        return 1
    
    builder = FoundryIQAgentBuilder()
    
    # Derive names from agent name
    ks_name = f"ks-{args.agent_name}"
    kb_name = f"kb-{args.agent_name}"
    conn_name = f"conn-{args.agent_name}"
    
    try:
        # Step 1: Create knowledge source
        builder.create_knowledge_source_from_index(ks_name, args.index_name)
        
        # Step 2: Create knowledge base
        builder.create_knowledge_base(kb_name, [ks_name], args.model, args.reasoning)
        
        # Step 3: Create project connection
        mcp_endpoint = builder.create_project_connection(conn_name, kb_name)
        
        # Step 4: Create agent
        builder.create_agent(args.agent_name, mcp_endpoint, conn_name, args.model)
        
        # Optional: Test query
        if args.test_query:
            print(f"\nTesting knowledge base with query: {args.test_query}")
            result = builder.query_knowledge_base(kb_name, args.test_query)
            print(f"Response: {result.get('response', 'No response')[:500]}...")
        
        print(f"\n✓ Agent '{args.agent_name}' is ready!")
        print(f"  MCP Endpoint: {mcp_endpoint}")
        
        # Optional: Cleanup
        if args.cleanup:
            print("\nCleaning up resources...")
            builder.delete_resources(args.agent_name, conn_name, kb_name, ks_name)
        
        return 0
        
    except requests.exceptions.HTTPError as e:
        print(f"\n✗ API Error: {e}")
        if e.response is not None:
            print(f"  Response: {e.response.text[:500]}")
        return 1
    except Exception as e:
        print(f"\n✗ Error: {e}")
        return 1


if __name__ == "__main__":
    exit(main())
