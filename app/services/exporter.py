import io
import json
from pathlib import Path
from datetime import datetime
import trimesh
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

from app.schemas.architecture import ArchitectureSpec

class ModelExporter:
    def __init__(self, static_dir: str = "static/models"):
        self.static_dir = Path(static_dir)
        self.static_dir.mkdir(parents=True, exist_ok=True)

    def _load_mesh(self, glb_path: str) -> trimesh.Trimesh:
        loaded = trimesh.load(glb_path)
        if isinstance(loaded, trimesh.Scene):
            meshes = [
                geom for geom in loaded.geometry.values()
                if isinstance(geom, trimesh.Trimesh)
            ]
            if not meshes:
                raise ValueError("No valid meshes found in .glb file")
            return trimesh.util.concatenate(meshes)
        return loaded

    async def convert_to_obj(self, glb_path: str, task_id: str) -> str:
        mesh = self._load_mesh(glb_path)
        obj_path = self.static_dir / f"{task_id}.obj"
        mesh.export(str(obj_path), file_type="obj")
        return f"/static/models/{task_id}.obj"

    async def convert_to_stl(self, glb_path: str, task_id: str) -> str:
        mesh = self._load_mesh(glb_path)
        stl_path = self.static_dir / f"{task_id}.stl"
        mesh.export(str(stl_path), file_type="stl")
        return f"/static/models/{task_id}.stl"

    async def generate_pdf(
        self,
        task_id: str,
        spec: ArchitectureSpec,
        user_prompt: str,
    ) -> str:
        pdf_path = self.static_dir / f"{task_id}_summary.pdf"

        doc = SimpleDocTemplate(
            str(pdf_path),
            pagesize=A4,
            rightMargin=20 * mm,
            leftMargin=20 * mm,
            topMargin=20 * mm,
            bottomMargin=20 * mm,
        )

        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            "CustomTitle",
            parent=styles["Title"],
            fontSize=22,
            textColor=HexColor("#1d4ed8"),
            spaceAfter=4 * mm,
        )
        heading_style = ParagraphStyle(
            "CustomHeading",
            parent=styles["Heading2"],
            fontSize=13,
            textColor=HexColor("#1e3a8a"),
            spaceBefore=6 * mm,
            spaceAfter=2 * mm,
        )
        body_style = ParagraphStyle(
            "CustomBody",
            parent=styles["Normal"],
            fontSize=10,
            leading=14,
        )

        elements = []

        # Title and Header
        elements.append(Paragraph("ArchSynth 3D — Architectural Specification", title_style))
        elements.append(Paragraph(
            f"Generated on {datetime.now().strftime('%B %d, %Y at %I:%M %p')}",
            ParagraphStyle("Subtitle", parent=styles["Normal"], fontSize=9, textColor=HexColor("#64748b"))
        ))
        elements.append(Spacer(1, 6 * mm))

        # Original Prompt
        elements.append(Paragraph("Original Description", heading_style))
        elements.append(Paragraph(f'"{user_prompt}"', ParagraphStyle(
            "Quote", parent=body_style, leftIndent=5 * mm, textColor=HexColor("#334155"), italic=True
        )))

        # Overview Table
        elements.append(Paragraph("Building Overview", heading_style))
        overview_data = [
            ["Attribute", "Specification"],
            ["Building Type", spec.building_type],
            ["Architectural Style", spec.architectural_style],
            ["Total Floors", f"{spec.total_floors} Stories"],
            ["Primary Materials", ", ".join(spec.materials)],
            ["Color Palette", ", ".join(spec.color_palette)],
        ]
        overview_table = Table(overview_data, colWidths=[50 * mm, 110 * mm])
        overview_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), HexColor("#eff6ff")),
            ("TEXTCOLOR", (0, 0), (-1, 0), HexColor("#1d4ed8")),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("GRID", (0, 0), (-1, -1), 0.5, HexColor("#cbd5e1")),
            ("PADDING", (0, 0), (-1, -1), 6),
        ]))
        elements.append(overview_table)

        # Key Features
        elements.append(Paragraph("Key Architectural Features", heading_style))
        for feature in spec.key_features:
            elements.append(Paragraph(f"• {feature}", body_style))

        # Rooms (if present)
        if spec.rooms:
            elements.append(Paragraph("Room Layout Schedule", heading_style))
            room_data = [["Room Name", "Floor Level", "Approx. Dimensions"]]
            for room in spec.rooms:
                room_data.append([room.name, str(room.floor_level), room.dimensions_approx])

            room_table = Table(room_data, colWidths=[60 * mm, 30 * mm, 70 * mm])
            room_table.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), HexColor("#eff6ff")),
                ("TEXTCOLOR", (0, 0), (-1, 0), HexColor("#1d4ed8")),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 9),
                ("GRID", (0, 0), (-1, -1), 0.5, HexColor("#cbd5e1")),
                ("PADDING", (0, 0), (-1, -1), 6),
            ]))
            elements.append(room_table)

        # Refined Prompt
        elements.append(Paragraph("AI-Synthesized 3D Prompt", heading_style))
        elements.append(Paragraph(
            spec.refined_3d_prompt,
            ParagraphStyle("Prompt", parent=body_style, fontSize=8, fontName="Courier", 
                          backColor=HexColor("#f8fafc"), leftIndent=3*mm, rightIndent=3*mm,
                          spaceBefore=2*mm, spaceAfter=2*mm, leading=12)
        ))

        doc.build(elements)
        return f"/static/models/{task_id}_summary.pdf"

exporter = ModelExporter()