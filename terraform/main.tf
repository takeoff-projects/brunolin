variable "project_id" {
  type= string
}
locals {
  go_image = "gcr.io/${var.project_id}/go-api:latest"
  nginx_image = "gcr.io/${var.project_id}/react-nginx:latest"
  timestamp = formatdate("YYMMDDhhmmss", timestamp())
	functions_dir_source = abspath("../${var.user_id}/gcp-app/etl")
  functions_dir_output = abspath("../${var.user_id}/gcp-app/etl/function-${local.timestamp}.zip")


}
provider "google" {
    project = var.project_id
}

# enable cloud run
resource "google_project_service" "run_api" {
  service = "run.googleapis.com"

  disable_on_destroy = true
}
# Enable Cloud Functions API
resource "google_project_service" "cf" {
  project = var.project
  service = "cloudfunctions.googleapis.com"

  disable_dependent_services = true
  disable_on_destroy         = false
}

resource "google_storage_bucket" "etl_bucket" {
  name          = "etl-files"
  location      = "US"
  force_destroy = true

  uniform_bucket_level_access = true
}

# Compress source code for functions
data "archive_file" "source" {
  type        = "zip"
  source_dir  = local.functions_dir_source
  output_path = local.functions_dir_output
}

# Create bucket that will host the source code
resource "google_storage_bucket" "bucket" {
  name = "functions-source"
}

# Add source code zip to bucket
resource "google_storage_bucket_object" "zip" {
  # Append file MD5 to force bucket to be recreated
  name   = "source.zip#${data.archive_file.source.output_md5}"
  bucket = google_storage_bucket.bucket.name
  source = data.archive_file.source.output_path
}
# cloud function resource
resource "google_cloudfunctions_function" "function" {
  name        = "function-test"
  description = "My function"
  runtime     = "python39"

  available_memory_mb   = 128
  source_archive_bucket = google_storage_bucket.bucket.name
  source_archive_object = google_storage_bucket_object.archive.name
  entry_point           = "gcs_trigger"
  labels = {
    my-label = "my-label-value"
  }

  event_trigger {
    event_type = "google.storage.object.finalize"
    resource = "etl_files"
  }
}

# todo: Cloud Build?
# todo: datastore?

# cloud run go server resource
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

# todo: API gateway depends on backend server

# frontend cloud run depends on api gateway
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
