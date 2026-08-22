import trimesh
import numpy as np
from pathlib import Path
from app.schemas.architecture import ArchitectureSpec
from app.core.exceptions import GenerationError

STATIC_DIR = Path("static/models")
STATIC_DIR.mkdir(parents=True, exist_ok=True)

class Procedural3DGenerator:
    """
    Procedural 3D architectural engine that translates structured 
    ArchitectureSpec blueprints into 3D .glb mesh models.
    """

    # Architectural color mappings (RGBA)
    STYLE_PALETTES = {
        "modernist": [220, 220, 225, 255],     # Clean light concrete
        "brutalist": [140, 140, 140, 255],     # Heavy raw concrete
        "minimalist": [245, 245, 245, 255],    # Matte off-white
        "industrial": [80, 80, 85, 255],       # Dark steel / slate
        "scandinavian": [215, 195, 170, 255],  # Warm timber tone
        "default": [200, 200, 205, 255]
    }

    GLASS_COLOR = [100, 180, 240, 140]         # Semi-transparent glass facade

    def _get_style_color(self, style_name: str):
        for key, color in self.STYLE_PALETTES.items():
            if key in style_name.lower():
                return color
            return self.STYLE_PALETTES["default"]

    async def generate_from_spec(self, spec: ArchitectureSpec, task_id: str) -> str:
        """
        Builds multi-floor architectural geometry based on the extracted ArchitectureSpec.
        """
        try:
            meshes = []
            floors = spec.total_floors or 1
            floor_height = 3.2
            base_width = 12.0
            base_depth = 10.0

            wall_color = self._get_style_color(spec.architectural_style)

            # 1. Base Foundation / Ground Slab
            foundation = trimesh.creation.box(extents=[base_width + 4.0, base_depth + 4.0, 0.4])
            foundation.apply_translation([0, 0, 0.2])
            foundation.visual.vertex_colors = [70, 70, 70, 255]
            meshes.append(foundation)

            # 2. Procedural Multi-Floor Massing
            for floor_idx in range(floors):
                z_offset = 0.4 + (floor_idx * floor_height) + (floor_height / 2.0)
                
                # Alternate floor offsets for modern cantilevered volumes
                x_shift = 1.2 if (floor_idx % 2 == 1 and floors > 1) else 0.0
                y_shift = 0.8 if (floor_idx % 2 == 1 and floors > 1) else 0.0

                w = base_width - (floor_idx * 0.8)
                d = base_depth - (floor_idx * 0.6)

                # Primary floor volume
                floor_mesh = trimesh.creation.box(extents=[w, d, floor_height - 0.2])
                floor_mesh.apply_translation([x_shift, y_shift, z_offset])
                floor_mesh.visual.vertex_colors = wall_color
                meshes.append(floor_mesh)

                # Glass Facade Paneling (Front)
                glass_panel = trimesh.creation.box(extents=[w * 0.7, 0.15, floor_height * 0.65])
                glass_panel.apply_translation([x_shift, y_shift + (d / 2.0) + 0.05, z_offset])
                glass_panel.visual.vertex_colors = self.GLASS_COLOR
                meshes.append(glass_panel)

                # Balcony overhang for multi-story buildings
                if floor_idx > 0:
                    balcony = trimesh.creation.box(extents=[w * 0.8, 2.0, 0.2])
                    balcony.apply_translation([x_shift, y_shift + (d / 2.0) + 1.0, z_offset - (floor_height / 2.0) + 0.1])
                    balcony.visual.vertex_colors = [50, 50, 50, 255]
                    meshes.append(balcony)

            # 3. Combine and Export Scene to .glb
            scene = trimesh.Scene(meshes)
            filename = f"{task_id}.glb"
            output_path = STATIC_DIR / filename

            scene.export(str(output_path), file_type="glb")

            return f"/static/models/{filename}"

        except Exception as exc:
            raise GenerationError(f"Local 3D procedural generation failed: {str(exc)}")

generator_client = Procedural3DGenerator()