variable "project_id" {
  type= string
}
locals {
  go_image = "gcr.io/${var.project_id}/go-api:latest"
  nginx_image = "gcr.io/${var.project_id}/react-nginx:latest"
}
provider "google" {
    project = var.project_id
}

resource "google_project_service" "run_api" {
  service = "run.googleapis.com"

  disable_on_destroy = true
}

resource "google_cloud_run_service" "default" {
    name     = "products-api"
    location = "us-central1"

    metadata {
      annotations = {
        "run.googleapis.com/client-name" = "terraform"
      }
    }

    template {
      spec {
        containers {
          image = local.go_image
          env {
            name = "GOOGLE_PROJECT_ID"
            value = var.project_id
          }
        }
      }
    }

    traffic {
    percent         = 100
    latest_revision = true
  }
    

  # Waits for the Cloud Run API to be enabled
  depends_on = [google_project_service.run_api]


 }

 data "google_iam_policy" "noauth" {
   binding {
     role = "roles/run.invoker"
     members = ["allAuthenticatedUsers"]
   }
 }

 resource "google_cloud_run_service_iam_policy" "noauth" {
   location    = google_cloud_run_service.default.location
   project     = google_cloud_run_service.default.project
   service     = google_cloud_run_service.default.name

   policy_data = data.google_iam_policy.noauth.policy_data
}
# frontend
 resource "google_cloud_run_service" "frontend" {
    name     = "react-frontend"
    location = "us-central1"

    metadata {
      annotations = {
        "run.googleapis.com/client-name" = "terraform"
      }
    }

    template {
      spec {
        containers {
          image = local.nginx_image
          env {
            name = "GOOGLE_PROJECT_ID"
            value = var.project_id
          }
        }
      }
    }

    traffic {
    percent         = 100
    latest_revision = true
  }
    

  # Waits for the Cloud Run API to be enabled
  depends_on = [google_project_service.run_api]

 }

 data "google_iam_policy" "allusersauth" {
   binding {
     role = "roles/run.invoker"
     members = ["allUsers"]
   }
 }

 resource "google_cloud_run_service_iam_policy" "allusersauth" {
   location    = google_cloud_run_service.frontend.location
   project     = google_cloud_run_service.frontend.project
   service     = google_cloud_run_service.frontend.name

   policy_data = data.google_iam_policy.allusersauth.policy_data
}
