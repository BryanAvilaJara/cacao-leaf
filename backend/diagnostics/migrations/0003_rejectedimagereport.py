from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("diagnostics", "0002_feedbackreport"),
    ]

    operations = [
        migrations.CreateModel(
            name="RejectedImageReport",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("image", models.ImageField(upload_to="rejected_reports/")),
                ("error_message", models.TextField()),
                (
                    "reason",
                    models.CharField(
                        choices=[
                            ("was_leaf", "Si era una hoja"),
                            ("related_vegetation", "Era vegetacion relacionada"),
                            ("poor_image", "La imagen era poco clara"),
                            ("other", "Otro"),
                        ],
                        max_length=30,
                    ),
                ),
                ("comment", models.TextField(blank=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={"ordering": ["-created_at"]},
        ),
    ]
