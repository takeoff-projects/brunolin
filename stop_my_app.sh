# delete cloud run service
gcloud run services delete products-api
gcloud run services delete react-frontend

# delete container images
gcloud container images delete image gcr.io/$GOOGLE_CLOUD_PROJECT/react-nginx:latest --force-delete-tags
gcloud container images delete image gcr.io/$GOOGLE_CLOUD_PROJECT/go-api:latest --force-delete-tags

# delete api gateway

gcloud api-gateway api-configs delete products-config --api=products-api
gcloud api-gateway gateways delete api-gateway --location=us-central1
gcloud api-gateway apis delete products-api

