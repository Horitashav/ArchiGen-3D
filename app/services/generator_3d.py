from pathlib import Path
import trimesh
import numpy as np
from app.schemas.architecture import ArchitectureSpec

class SpecDriven3DGenerator:
    """
    Constructs an architectural 3D mesh driven directly by the parsed ArchitectureSpec attributes.
    """
    def __init__(self, static_dir: str = "static/models"):
        self.static_dir = Path(static_dir)
        self.static_dir.mkdir(parents=True, exist_ok=True)

    async def generate_from_spec(self, spec: ArchitectureSpec, task_id: str) -> str:
        meshes = []
        floors = max(1, min(spec.total_floors, 10))  # Bound between 1 and 10 for WebGL performance

        # 1. Foundation Slab
        foundation = trimesh.creation.box(extents=[14.0, 10.0, 0.4])
        foundation.apply_translation([0, 0, 0.2])
        foundation.visual.face_colors = [55, 65, 81, 255]  # Slate gray
        meshes.append(foundation)

        floor_height = 3.2
        width = 10.0
        depth = 7.0

        for f in range(floors):
            base_z = 0.4 + (f * floor_height)

            # Floor Slab
            slab = trimesh.creation.box(extents=[width + 1.0, depth + 1.0, 0.3])
            slab.apply_translation([0, 0, base_z + 0.15])
            slab.visual.face_colors = [226, 232, 240, 255]
            meshes.append(slab)

            # Enclosure Core / Glazing
            core = trimesh.creation.box(extents=[width - 0.4, depth - 0.4, floor_height - 0.3])
            core.apply_translation([0, 0, base_z + 0.3 + (floor_height - 0.3) / 2])
            
            # Check style/materials for coloring
            is_glass = any("glass" in m.lower() for m in spec.materials)
            if is_glass:
                core.visual.face_colors = [56, 189, 248, 160]  # Translucent low-E glass
            else:
                core.visual.face_colors = [203, 213, 225, 255]  # Concrete / stone facade
            meshes.append(core)

            # Structural Corner Pillars
            pillars = [
                [(width / 2) - 0.4, (depth / 2) - 0.4],
                [-(width / 2) + 0.4, (depth / 2) - 0.4],
                [(width / 2) - 0.4, -(depth / 2) + 0.4],
                [-(width / 2) + 0.4, -(depth / 2) + 0.4],
            ]
            for px, py in pillars:
                pillar = trimesh.creation.box(extents=[0.5, 0.5, floor_height - 0.3])
                pillar.apply_translation([px, py, base_z + 0.3 + (floor_height - 0.3) / 2])
                pillar.visual.face_colors = [100, 116, 139, 255]
                meshes.append(pillar)

            # Add Cantilevers/Balconies if specified in key features
            has_balcony = any("balcony" in k.lower() or "terrace" in k.lower() for k in spec.key_features)
            if has_balcony and f > 0:
                balcony = trimesh.creation.box(extents=[width + 2.5, 2.5, 0.2])
                balcony.apply_translation([0, -(depth / 2) - 0.8, base_z + 0.1])
                balcony.visual.face_colors = [180, 130, 90, 255]  # Timber decking
                meshes.append(balcony)

        # Roof Structure
        roof_z = 0.4 + (floors * floor_height)
        roof = trimesh.creation.box(extents=[width + 2.0, depth + 2.0, 0.4])
        roof.apply_translation([0, 0, roof_z + 0.2])
        roof.visual.face_colors = [30, 41, 59, 255]
        meshes.append(roof)

        # Export combined scene
        scene = trimesh.Scene(meshes)
        output_file = self.static_dir / f"{task_id}.glb"
        glb_data = scene.export(file_type="glb")

        with open(output_file, "wb") as f:
            f.write(glb_data)

        return f"/static/models/{task_id}.glb"

generator_client = SpecDriven3DGenerator()