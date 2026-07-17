# Generated manually for the initial Cacao Leaf schema.

from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="LeafAnalysis",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("image", models.ImageField(upload_to="leaf_uploads/")),
                (
                    "status",
                    models.CharField(
                        choices=[("healthy", "Hoja sana"), ("pathology", "Posible patologia")],
                        max_length=20,
                    ),
                ),
                ("confidence", models.DecimalField(decimal_places=2, max_digits=5)),
                ("disease_label", models.CharField(blank=True, max_length=80)),
                ("recommendation", models.TextField()),
                ("notes", models.TextField(blank=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={
                "ordering": ["-created_at"],
            },
        ),
    ]

