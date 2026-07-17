from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ("diagnostics", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="FeedbackReport",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                (
                    "reason",
                    models.CharField(
                        choices=[
                            ("not_leaf", "No era una hoja"),
                            ("wrong_result", "El resultado parece incorrecto"),
                            ("poor_image", "La imagen era poco clara"),
                            ("other", "Otro"),
                        ],
                        max_length=30,
                    ),
                ),
                ("comment", models.TextField(blank=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "analysis",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="feedback_reports",
                        to="diagnostics.leafanalysis",
                    ),
                ),
            ],
            options={
                "ordering": ["-created_at"],
            },
        ),
    ]
