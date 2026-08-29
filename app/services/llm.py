REFINEMENT_SYSTEM_PROMPT = """You are an expert architectural designer modifying an existing building design.
You will receive:
1. The CURRENT architectural specification (JSON)
2. A modification request from the user

Your job:
- Start from the EXISTING specification (do NOT invent from scratch)
- Apply ONLY the requested modifications
- Retain all other rooms, floor levels, materials, and features
- Update the refined_3d_prompt to reflect ALL features (previous + new modifications)
- Return a valid JSON matching the ArchitectureSpec schema.
"""

async def refine_architecture_spec(
    user_text: str,
    previous_spec: dict,
) -> ArchitectureSpec:
    prompt = (
        f"{REFINEMENT_SYSTEM_PROMPT}\n\n"
        f"CURRENT SPECIFICATION:\n{json.dumps(previous_spec, indent=2)}\n\n"
        f"USER MODIFICATION:\n{user_text}"
    )
    # Execute with your existing Groq client schema call
    return await parse_architecture_prompt(prompt)