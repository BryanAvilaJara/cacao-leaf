from io import BytesIO
from tempfile import TemporaryDirectory
from unittest.mock import patch

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from PIL import Image
from rest_framework import status
from rest_framework.test import APIClient

from .models import LeafAnalysis
from .classifier import classify_cacao_leaf


class ClassifierTests(TestCase):
    def test_green_image_is_classified_as_healthy(self):
        file = self._image_file((30, 145, 60))
        with patch("diagnostics.classifier.predict_with_trained_model", return_value=None):
            result = classify_cacao_leaf(file)
        self.assertEqual(result.status, "healthy")

    def test_dark_brown_image_is_classified_as_pathology(self):
        file = self._image_file((95, 55, 35))
        with patch("diagnostics.classifier.predict_with_trained_model", return_value=None):
            result = classify_cacao_leaf(file)
        self.assertEqual(result.status, "pathology")

    def _image_file(self, color):
        buffer = BytesIO()
        Image.new("RGB", (32, 32), color).save(buffer, format="JPEG")
        buffer.seek(0)
        return SimpleUploadedFile("leaf.jpg", buffer.getvalue(), content_type="image/jpeg")


class LeafAnalysisApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.media_root = TemporaryDirectory()
        self.settings_override = override_settings(MEDIA_ROOT=self.media_root.name)
        self.settings_override.enable()

    def tearDown(self):
        self.settings_override.disable()
        self.media_root.cleanup()

    def test_health_endpoint_returns_service_status(self):
        response = self.client.get("/api/health/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "ok")

    def test_create_analysis_returns_contract_and_persists_record(self):
        with patch("diagnostics.classifier.predict_with_trained_model", return_value=None):
            response = self.client.post(
                "/api/analyses/",
                {"image": self._image_file((30, 145, 60))},
                format="multipart",
            )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(LeafAnalysis.objects.count(), 1)
        self.assertEqual(
            set(response.data.keys()),
            {
                "id",
                "image",
                "image_url",
                "status",
                "status_display",
                "confidence",
                "disease_label",
                "recommendation",
                "notes",
                "created_at",
            },
        )
        self.assertEqual(response.data["status"], "healthy")
        self.assertIn("preliminar", response.data["recommendation"].lower() + response.data["notes"].lower())

    def test_non_vegetation_image_is_rejected(self):
        response = self.client.post(
            "/api/analyses/",
            {"image": self._image_file((45, 55, 75))},
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(LeafAnalysis.objects.count(), 0)
        self.assertIn("vegetacion", str(response.data["image"]).lower())

    def test_invalid_file_is_rejected_with_clear_error(self):
        invalid = SimpleUploadedFile("leaf.txt", b"no es una imagen", content_type="text/plain")

        response = self.client.post("/api/analyses/", {"image": invalid}, format="multipart")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(LeafAnalysis.objects.count(), 0)
        self.assertIn("image", response.data)

    def test_list_analyses_returns_created_items(self):
        with patch("diagnostics.classifier.predict_with_trained_model", return_value=None):
            self.client.post(
                "/api/analyses/",
                {"image": self._image_file((95, 55, 35))},
                format="multipart",
            )

        response = self.client.get("/api/analyses/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["status"], "pathology")

    def test_clear_analyses_removes_history(self):
        with patch("diagnostics.classifier.predict_with_trained_model", return_value=None):
            self.client.post(
                "/api/analyses/",
                {"image": self._image_file((95, 55, 35))},
                format="multipart",
            )
            self.client.post(
                "/api/analyses/",
                {"image": self._image_file((30, 145, 60))},
                format="multipart",
            )

        response = self.client.delete("/api/analyses/clear/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["deleted"], 2)
        self.assertEqual(LeafAnalysis.objects.count(), 0)

    def _image_file(self, color):
        buffer = BytesIO()
        Image.new("RGB", (32, 32), color).save(buffer, format="JPEG")
        buffer.seek(0)
        return SimpleUploadedFile("leaf.jpg", buffer.getvalue(), content_type="image/jpeg")
