#!/usr/bin/env python3
"""
Update Mistral model pricing in vscode-extension/src/modelPricing.json
from the OpenRouter API.

This script:
  - Fetches all Mistral models from OpenRouter API
  - Updates inputCostPerMillion and outputCostPerMillion for existing Mistral models
  - Adds new Mistral models with stub entries
  - Updates the lastUpdated date and source metadata

Usage:
    python scripts/update-mistral-pricing.py

This is designed to run as a separate job from update-model-data.py to prevent
code conflicts and allow independent scheduling.
"""

from __future__ import annotations

import json
import re
import sys
import urllib.error
import urllib.request
from datetime import date
from pathlib import Path

# OpenRouter API endpoint for models
OPENROUTER_API_URL = "https://openrouter.ai/api/v1/models"

REPO_ROOT = Path(__file__).resolve().parent.parent
PRICING_PATH = REPO_ROOT / "vscode-extension" / "src" / "modelPricing.json"


def api_request(url: str) -> dict | list:
    """Make an HTTP request and return parsed JSON."""
    headers = {
        "Accept": "application/json",
        "User-Agent": "ai-engineering-fluency-mistral-updater",
    }
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        sys.stderr.write(f"HTTP error {e.code} fetching {url}: {e.reason}\n")
        raise


def fetch_mistral_models() -> dict[str, dict]:
    """Fetch all Mistral models from OpenRouter API.
    
    Returns a dict mapping model_id -> {input_price, output_price, name}
    where prices are in dollars per million tokens.
    """
    response = api_request(OPENROUTER_API_URL)
    models_data = response.get("data", [])
    
    mistral_models = {}
    for model in models_data:
        model_id = model.get("id", "")
        # Only process Mistral models
        if "mistral" not in model_id.lower():
            continue
        
        pricing = model.get("pricing", {})
        input_per_token = float(pricing.get("prompt", 0))  # dollars per token
        output_per_token = float(pricing.get("completion", 0))  # dollars per token
        
        # Convert to per million tokens
        input_per_million = input_per_token * 1_000_000
        output_per_million = output_per_token * 1_000_000
        
        # Get display name
        name = model.get("name", model_id)
        
        mistral_models[model_id] = {
            "inputCostPerMillion": round(input_per_million, 10),
            "outputCostPerMillion": round(output_per_million, 10),
            "name": name,
        }
    
    return mistral_models


def normalize_model_id(model_id: str) -> str:
    """Convert OpenRouter model ID to our normalized format.
    
    Examples:
      "mistralai/mistral-large-2512" -> "mistral-large-2512"
      "mistralai/codestral-2508" -> "codestral-2508"
    """
    # Remove the provider prefix
    if "/" in model_id:
        model_id = model_id.split("/", 1)[1]
    return model_id


def find_mistral_keys(pricing: dict) -> list[str]:
    """Find all keys in pricing dict that are Mistral models."""
    mistral_keys = []
    for key, entry in pricing.items():
        category = entry.get("category", "")
        if "Mistral" in category or "mistral" in category.lower():
            mistral_keys.append(key)
            continue
        # Also check displayNames for mistral references
        for name in entry.get("displayNames", []):
            if "mistral" in name.lower() or "codestral" in name.lower() or "magistral" in name.lower():
                if key not in mistral_keys:
                    mistral_keys.append(key)
                break
    return mistral_keys


def normalize_display_name(name: str) -> str:
    """Convert display name to our normalized ID format.
    
    Examples:
      "Mistral Large 3" -> "mistral-large-3"
      "Codestral" -> "codestral"
      "Mistral: Mistral Large 3 2512" -> "mistral-large-3-2512"
    """
    # Remove provider prefix like "Mistral:"
    if ":" in name:
        name = name.split(":", 1)[-1].strip()
    # Convert to lowercase and replace spaces with hyphens
    name = re.sub(r"\s+", "-", name.lower())
    # Remove special characters except hyphens, dots, and parentheses
    name = re.sub(r"[^a-z0-9\-\.\(\)]", "", name)
    return name


def extract_model_family(model_id: str) -> tuple[str, str]:
    """Extract the model family and version from a model ID.
    
    Returns (family, version_or_date) where family is like 'mistral-large', 'codestral', etc.
    and version_or_date is like '2512', '2505', 'latest', etc.
    
    Examples:
      'mistral-large-2512' -> ('mistral-large', '2512')
      'mistral-medium-3.1' -> ('mistral-medium', '3.1')
      'codestral-latest' -> ('codestral', 'latest')
      'ministral-8b-2410' -> ('ministral-8b', '2410')
    """
    # Split by hyphens
    parts = model_id.split("-")
    if len(parts) >= 2:
        # The last part is usually the version/date
        version = parts[-1]
        # The rest is the family
        family = "-".join(parts[:-1])
        return family, version
    return model_id, ""


def main() -> int:
    print("Fetching Mistral model data from OpenRouter API...")
    try:
        source_models = fetch_mistral_models()
    except Exception as e:
        sys.stderr.write(f"Failed to fetch Mistral models: {e}\n")
        return 1
    
    print(f"Found {len(source_models)} Mistral models in source")
    
    # Load existing pricing data
    pricing_data = json.loads(PRICING_PATH.read_text(encoding="utf-8"))
    pricing = pricing_data["pricing"]
    metadata = pricing_data.get("metadata", {})
    
    # Find existing Mistral models
    existing_mistral_keys = find_mistral_keys(pricing)
    print(f"Found {len(existing_mistral_keys)} existing Mistral models")
    
    pricing_changed = False
    updates: list[str] = []
    new_models: list[str] = []
    
    # Build a mapping of display names to keys for faster lookup
    display_name_to_keys = {}
    for key in existing_mistral_keys:
        entry = pricing[key]
        for name in entry.get("displayNames", []):
            name_lower = name.lower()
            if name_lower not in display_name_to_keys:
                display_name_to_keys[name_lower] = []
            display_name_to_keys[name_lower].append(key)
    
    # Process each source model
    for model_id, source_entry in source_models.items():
        normalized_id = normalize_model_id(model_id)
        input_price = source_entry["inputCostPerMillion"]
        output_price = source_entry["outputCostPerMillion"]
        display_name = source_entry["name"]
        
        # Clean the display name from OpenRouter (remove "Mistral:" prefix)
        clean_display_name = display_name
        if ":" in display_name:
            clean_display_name = display_name.split(":", 1)[-1].strip()
        
        # Try to find matching key in existing pricing
        matched_key = None
        
        # First, try exact match with normalized ID
        if normalized_id in pricing:
            matched_key = normalized_id
        else:
            # Try to match by normalized display name
            normalized_display = normalize_display_name(display_name)
            if normalized_display in pricing:
                matched_key = normalized_display
            else:
                # Try to match by clean display name
                clean_normalized = normalize_display_name(clean_display_name)
                if clean_normalized in pricing:
                    matched_key = clean_normalized
                else:
                    # Try family-based matching
                    source_family, source_version = extract_model_family(normalized_id)
                    for candidate_key in existing_mistral_keys:
                        candidate_family, candidate_version = extract_model_family(candidate_key)
                        
                        # Exact version match
                        if source_family == candidate_family and source_version == candidate_version:
                            matched_key = candidate_key
                            break
                        
                        # If source has a version and candidate is latest, match
                        if (source_version and source_version != "latest" and 
                            candidate_version == "latest" and source_family == candidate_family):
                            matched_key = candidate_key
                            break
                        
                        # If candidate has a version and source is latest, match
                        if (candidate_version and candidate_version != "latest" and 
                            source_version == "latest" and source_family == candidate_family):
                            matched_key = candidate_key
                            break
                        
                        # If both have no version (or both are latest), match by family
                        if source_version in ["", "latest"] and candidate_version in ["", "latest"]:
                            if source_family == candidate_family:
                                matched_key = candidate_key
                                break
                    
                    # If still no match, try display name lookup
                    if matched_key is None:
                        clean_lower = clean_display_name.lower()
                        if clean_lower in display_name_to_keys:
                            # If there's exactly one match, use it
                            if len(display_name_to_keys[clean_lower]) == 1:
                                matched_key = display_name_to_keys[clean_lower][0]
                            else:
                                # Multiple matches - try to find the best one by comparing normalized IDs
                                for candidate_key in display_name_to_keys[clean_lower]:
                                    if normalized_id in candidate_key or candidate_key in normalized_id:
                                        matched_key = candidate_key
                                        break
                                # If still no match, use the first one
                                if matched_key is None and display_name_to_keys[clean_lower]:
                                    matched_key = display_name_to_keys[clean_lower][0]
        
        if matched_key:
            entry = pricing[matched_key]
            
            # Update prices if they differ
            current_input = entry.get("inputCostPerMillion", 0)
            current_output = entry.get("outputCostPerMillion", 0)
            
            if current_input != input_price or current_output != output_price:
                if current_input != input_price:
                    updates.append(
                        f"  ~ {matched_key}: inputCostPerMillion "
                        f"{current_input} -> {input_price}"
                    )
                if current_output != output_price:
                    updates.append(
                        f"  ~ {matched_key}: outputCostPerMillion "
                        f"{current_output} -> {output_price}"
                    )
                
                entry["inputCostPerMillion"] = input_price
                entry["outputCostPerMillion"] = output_price
                pricing_changed = True
                
                # Ensure category is set
                if "category" not in entry:
                    entry["category"] = "Mistral models"
        else:
            # New model - add stub entry
            category = "Mistral models"
            # Try to infer a better category from model name
            name_lower = display_name.lower()
            if "magistral" in name_lower:
                category = "Mistral models"
            elif "codestral" in name_lower:
                category = "Mistral models"
            elif "ministral" in name_lower:
                category = "Mistral models"
            elif "pixtral" in name_lower:
                category = "Mistral models"
            elif "devstral" in name_lower:
                category = "Mistral models"
            elif "snorkel" in name_lower:
                category = "Mistral models"
            
            pricing[normalized_id] = {
                "inputCostPerMillion": input_price,
                "outputCostPerMillion": output_price,
                "category": category,
                "tier": "unknown",
                "multiplier": 1,
                "displayNames": [display_name],
            }
            new_models.append(
                f"  + {normalized_id} ({display_name}): "
                f"input={input_price}, output={output_price}"
            )
            pricing_changed = True
    
    if not pricing_changed:
        print("No changes detected.")
        return 0
    
    if updates:
        print("Updated pricing:")
        for line in updates:
            print(line)
    
    if new_models:
        print("Added new Mistral models:")
        for line in new_models:
            print(line)
    
    # Update metadata
    metadata["lastUpdated"] = date.today().isoformat()
    
    # Check if we need to update the Mistral source date
    sources = metadata.get("sources", [])
    mistral_source = None
    for source in sources:
        if "Mistral" in source.get("name", ""):
            mistral_source = source
            break
    
    if mistral_source:
        mistral_source["retrievedDate"] = date.today().isoformat()
        # Update the URL to reference OpenRouter
        if "url" in mistral_source:
            mistral_source["url"] = "https://openrouter.ai/api/v1/models"
            mistral_source["note"] = "Filtered for Mistral models"
    
    # Write updated file
    PRICING_PATH.write_text(
        json.dumps(pricing_data, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    print(f"Updated {PRICING_PATH.relative_to(REPO_ROOT)}")
    
    return 0


if __name__ == "__main__":
    sys.exit(main())
