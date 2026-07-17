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


class FeedbackReport(models.Model):
    REASON_NOT_LEAF = "not_leaf"
    REASON_WRONG_RESULT = "wrong_result"
    REASON_POOR_IMAGE = "poor_image"
    REASON_OTHER = "other"

    REASON_CHOICES = [
        (REASON_NOT_LEAF, "No era una hoja"),
        (REASON_WRONG_RESULT, "El resultado parece incorrecto"),
        (REASON_POOR_IMAGE, "La imagen era poco clara"),
        (REASON_OTHER, "Otro"),
    ]

    analysis = models.ForeignKey(LeafAnalysis, related_name="feedback_reports", on_delete=models.CASCADE)
    reason = models.CharField(max_length=30, choices=REASON_CHOICES)
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.get_reason_display()} - analysis {self.analysis_id}"


class RejectedImageReport(models.Model):
    REASON_WAS_LEAF = "was_leaf"
    REASON_RELATED_VEGETATION = "related_vegetation"
    REASON_POOR_IMAGE = "poor_image"
    REASON_OTHER = "other"

    REASON_CHOICES = [
        (REASON_WAS_LEAF, "Si era una hoja"),
        (REASON_RELATED_VEGETATION, "Era vegetacion relacionada"),
        (REASON_POOR_IMAGE, "La imagen era poco clara"),
        (REASON_OTHER, "Otro"),
    ]

    image = models.ImageField(upload_to="rejected_reports/")
    error_message = models.TextField()
    reason = models.CharField(max_length=30, choices=REASON_CHOICES)
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.get_reason_display()} - rejected image {self.id}"
