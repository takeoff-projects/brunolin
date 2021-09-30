# ----- terraform incomplete ... working on it -------------
# cd terraform 
# terraform apply -var="project_id=$GOOGLE_CLOUD_PROJECT" -var="user_id=$USER"
# cd ..

# install webi for yq
curl -sS https://webinstall.dev/yq | bash

 export PATH="/home/$USER/.local/bin:$PATH"


# firestore in datastore mode
gcloud app create --region=us-east4 --project=$GOOGLE_CLOUD_PROJECT
gcloud services enable appengine.googleapis.com --project=$GOOGLE_CLOUD_PROJECT
gcloud alpha datastore databases create --project=$GOOGLE_CLOUD_PROJECT --region=us-east4

# api gateway enable
gcloud services enable apigateway.googleapis.com
gcloud services enable servicemanagement.googleapis.com
gcloud services enable servicecontrol.googleapis.com

# container registry enable
gcloud services enable containerregistry.googleapis.com

# cloud builds enable
gcloud services enable cloudbuild.googleapis.com

# cloud functions enable
gcloud services enable cloudfunctions.googleapis.com 

gsutil mb gs://etl_app_files -p $GOOGLE_CLOUD_PROJECT

cd etl
gcloud functions deploy gcs_trigger \
--runtime python39 \
--trigger-resource etl_app_files \
--trigger-event google.storage.object.finalize

cd ..

# --------- gcloud run deploy go image ---------------------
cd api

#build docker image
gcloud builds submit --tag gcr.io/$GOOGLE_CLOUD_PROJECT/go-api:latest

# deploy  go image to cloud run
gcloud run deploy products-api --platform managed --region us-central1 --image gcr.io/$GOOGLE_CLOUD_PROJECT/go-api:latest --no-allow-unauthenticated --update-env-vars "GOOGLE_PROJECT_ID=$GOOGLE_CLOUD_PROJECT"


cd ..

export BACKEND_URL="$(gcloud run services describe products-api --platform managed --region us-central1 --format 'value(status.url)')"

yq e -i '.x-google-backend.address=strenv(BACKEND_URL)' openapi2-run.yaml 

# create api gateway
export SA_NAME=api-gateway
gcloud iam service-accounts create $SA_NAME \
    --description="Service account for api gateway" \
    --display-name="api-gateway"

gcloud projects add-iam-policy-binding $GOOGLE_CLOUD_PROJECT \
    --member="serviceAccount:$SA_NAME@$GOOGLE_CLOUD_PROJECT.iam.gserviceaccount.com" \
    --role="roles/run.invoker"


gcloud api-gateway api-configs create products-config \
  --api=products-api --openapi-spec=openapi2-run.yaml \
  --project=$GOOGLE_CLOUD_PROJECT --backend-auth-service-account=$SA_NAME@$GOOGLE_CLOUD_PROJECT.iam.gserviceaccount.com

gcloud api-gateway gateways create products-gateway \
  --api=products-api --api-config=products-config \
  --location=us-central1 --project=$GOOGLE_CLOUD_PROJECT


export REACT_APP_API_URL="$(gcloud api-gateway gateways describe products-gateway --location=us-central1 --project=$GOOGLE_CLOUD_PROJECT --format 'value(defaultHostname)')"
cd frontend

# frontend image -  use docker  to inject  build time env variables

gcloud auth configure-docker gcr.io

docker build --tag gcr.io/$GOOGLE_CLOUD_PROJECT/react-nginx:latest --build-arg REACT_APP_API_URL=${REACT_APP_API_URL} . 

docker push gcr.io/$GOOGLE_CLOUD_PROJECT/react-nginx:latest

# cant inject build time env vars wth this command, dont use
# gcloud builds submit --tag gcr.io/$GOOGLE_CLOUD_PROJECT/react-nginx:latest

# deploy to cloud run
gcloud run deploy react-frontend --platform managed --region us-central1 --image gcr.io/$GOOGLE_CLOUD_PROJECT/react-nginx:latest --allow-unauthenticated

