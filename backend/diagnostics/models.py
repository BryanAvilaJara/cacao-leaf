from django.db import models


class LeafAnalysis(models.Model):
    STATUS_HEALTHY = "healthy"
    STATUS_PATHOLOGY = "pathology"

    STATUS_CHOICES = [
        (STATUS_HEALTHY, "Hoja sana"),
        (STATUS_PATHOLOGY, "Posible patologia"),
    ]

    image = models.ImageField(upload_to="leaf_uploads/")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    confidence = models.DecimalField(max_digits=5, decimal_places=2)
    disease_label = models.CharField(max_length=80, blank=True)
    recommendation = models.TextField()
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.get_status_display()} - {self.confidence}%"
