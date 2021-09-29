# delete cloud run service
gcloud run services delete products-api --region us-central1
gcloud run services delete react-frontend --region us-central1

# delete container images
# gcloud container images delete image gcr.io/$GOOGLE_CLOUD_PROJECT/react-nginx --force-delete-tags
# gcloud container images delete image gcr.io/$GOOGLE_CLOUD_PROJECT/go-api --force-delete-tags
gcloud functions delete gcs_trigger

# delete api gateway

gcloud api-gateway gateways delete products-gateway --location=us-central1
gcloud api-gateway api-configs delete products-config --api=products-api
gcloud api-gateway apis delete products-api
