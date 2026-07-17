from dataclasses import dataclass


@dataclass(frozen=True)
class ClassificationResult:
    status: str
    confidence: float
    disease_label: str
    recommendation: str
    notes: str
