from django.contrib import admin

from .models import LeafAnalysis


@admin.register(LeafAnalysis)
class LeafAnalysisAdmin(admin.ModelAdmin):
    list_display = ("id", "status", "confidence", "disease_label", "created_at")
    list_filter = ("status", "created_at")
    search_fields = ("disease_label", "recommendation", "notes")
