from pathlib import Path
import numpy as np
import trimesh

class Procedural3DGenerator:
    """
    Generates a valid, multi-level architectural 3D mesh and exports it as a .glb binary.
    """
    def __init__(self, static_dir: str = "static/models"):
        self.static_dir = Path(static_dir)
        self.static_dir.mkdir(parents=True, exist_ok=True)

    def generate_building_glb(self, task_id: str, floors: int = 2, building_type: str = "Pavilion") -> str:
        meshes = []

        # 1. Base Foundation / Ground Slab
        ground = trimesh.creation.box(extents=[14.0, 10.0, 0.4])
        ground.apply_translation([0, 0, 0.2])
        ground.visual.face_colors = [50, 55, 65, 255]  # Dark slate base
        meshes.append(ground)

        floor_height = 3.2
        width = 10.0
        depth = 7.0

        for f in range(floors):
            base_z = 0.4 + (f * floor_height)

            # Floor Slab
            slab = trimesh.creation.box(extents=[width + 1.2, depth + 1.2, 0.3])
            slab.apply_translation([0, 0, base_z + 0.15])
            slab.visual.face_colors = [220, 225, 230, 255]
            meshes.append(slab)

            # Glass Curtain Facade
            glass = trimesh.creation.box(extents=[width - 0.2, depth - 0.2, floor_height - 0.3])
            glass.apply_translation([0, 0, base_z + 0.3 + (floor_height - 0.3) / 2])
            glass.visual.face_colors = [56, 189, 248, 160]  # Translucent Sky Blue
            meshes.append(glass)

            # Concrete Structural Corner Columns
            column_positions = [
                [(width / 2) - 0.4, (depth / 2) - 0.4],
                [-(width / 2) + 0.4, (depth / 2) - 0.4],
                [(width / 2) - 0.4, -(depth / 2) + 0.4],
                [-(width / 2) + 0.4, -(depth / 2) + 0.4],
            ]
            for cx, cy in column_positions:
                col = trimesh.creation.box(extents=[0.5, 0.5, floor_height - 0.3])
                col.apply_translation([cx, cy, base_z + 0.3 + (floor_height - 0.3) / 2])
                col.visual.face_colors = [140, 145, 155, 255]
                meshes.append(col)

            # Balcony / Overhang for Upper Floors
            if f > 0:
                balcony = trimesh.creation.box(extents=[width + 3.0, 2.5, 0.2])
                balcony.apply_translation([0, -(depth / 2) - 0.8, base_z + 0.1])
                balcony.visual.face_colors = [180, 140, 90, 255]  # Timber Deck
                meshes.append(balcony)

        # Roof / Overhang Slab
        roof_z = 0.4 + (floors * floor_height)
        roof = trimesh.creation.box(extents=[width + 2.5, depth + 2.5, 0.4])
        roof.apply_translation([0, 0, roof_z + 0.2])
        roof.visual.face_colors = [30, 41, 59, 255]  # Modernist dark charcoal
        meshes.append(roof)

        # Combine meshes into a single scene and export valid GLB binary
        scene = trimesh.Scene(meshes)
        output_file = self.static_dir / f"{task_id}.glb"
        glb_data = scene.export(file_type="glb")

        with open(output_file, "wb") as f:
            f.write(glb_data)

        return f"/static/models/{task_id}.glb"

mesh_generator = Procedural3DGenerator()